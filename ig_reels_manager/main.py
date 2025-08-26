#!/usr/bin/env python3
# cloud_function_reel.py — FAST IG-style reel for GCP Cloud Functions (2nd gen)

import os, math, functools, json, base64, logging, re
from typing import Dict, List, Any, Optional
from pathlib import Path
from uuid import uuid4

import numpy as np
import pandas as pd
import requests

# ---- Matplotlib (used once)
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["figure.dpi"] = 100
plt.rcParams["savefig.dpi"] = 100

# ---- Pillow / ANTIALIAS compat
from PIL import Image, ImageDraw, ImageFont, ImageFilter, Image as PILImage
if not hasattr(PILImage, "ANTIALIAS"):
    PILImage.ANTIALIAS = PILImage.Resampling.LANCZOS

# ---- MoviePy + FFmpeg
from moviepy.editor import (
    VideoClip, ImageClip, concatenate_videoclips,
    AudioFileClip, AudioClip, CompositeAudioClip
)
import imageio_ffmpeg
os.environ["IMAGEIO_FFMPEG_EXE"] = imageio_ffmpeg.get_ffmpeg_exe()

# ---- GCS
from google.cloud import storage

# ---- Functions Framework
import functions_framework

# =============== CONFIG ===============
W, H  = 1080, 1920               # portrait
FPS   = 30                       # lower FPS => faster (24 is cinematic)
DUR_FALLBACK = 5.0              # if no TTS

INTRO_SEC = 0.6
OUTRO_SEC = 0.6
AUDIO_SAMPLERATE = 44100
EPS = 1e-3

BG_TOP  = (10, 10, 12)
BG_BOT  = (18, 18, 22)
LINE_CORE = (0, 255, 200)        # neon mint
GLOW_STEPS = [(14, 0.10), (8, 0.20), (5, 0.35)]
LINE_WIDTH = 5
GRID_ALPHA = 0.12
ORB_BASE_RADIUS = 8

AX_RECT = (0.08, 0.22, 0.84, 0.62)  # (left, bottom, width, height) in fig coords

FONT_DIR = Path(__file__).parent / "fonts"

FONT_BOLD_CANDIDATES = [
    str(FONT_DIR / "DejaVuSans-Bold.ttf"),
]
FONT_REG_CANDIDATES = [
    str(FONT_DIR / "DejaVuSans.ttf"),
]

ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
DEFAULT_VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "nPczCjzI2devNBz1zQrb") # Brian
DEFAULT_BUCKET = os.getenv("GCS_BUCKET", "")

TMP_DIR = Path("/tmp")
TMP_DIR.mkdir(exist_ok=True)

if not ELEVEN_API_KEY:
    logging.warning("ELEVENLABS_API_KEY not set; TTS will be disabled.")
if not DEFAULT_BUCKET:
    logging.warning("GCS_BUCKET not set; provide output_uri in payload.")

# =============== FONTS/UTILS ===============
def pick_font(candidates, size):
    for p in candidates:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except Exception: pass
    return ImageFont.load_default(size)

FONT_TITLE = pick_font(FONT_BOLD_CANDIDATES, 72)
FONT_NUM   = pick_font(FONT_BOLD_CANDIDATES, 64)
FONT_BODY  = pick_font(FONT_REG_CANDIDATES, 48)

def lerp(a, b, u): return a + (b - a) * u
def ease(u): return u*u*(3 - 2*u)  # smoothstep

@functools.lru_cache(maxsize=1)
def gradient_bg():
    arr = np.zeros((H, W, 3), dtype=np.uint8)
    top = np.array(BG_TOP, dtype=np.float32)
    bot = np.array(BG_BOT, dtype=np.float32)
    for y in range(H):
        a = y / (H-1)
        arr[y, :, :] = (1-a)*top + a*bot
    return arr


def upload_to_gcs(local_path: Path) -> str:
    client = storage.Client()

    if not DEFAULT_BUCKET:
        raise ValueError("No output_uri provided and GCS_BUCKET env var is not set.")
    bucket_name = DEFAULT_BUCKET.replace("gs://", "", 1).rstrip("/")
    blob_name = local_path.name  # default object key

    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    # content_type helps with correct serving headers
    blob.upload_from_filename(str(local_path), content_type="video/mp4")

    return f"gs://{bucket_name}/{blob_name}"

# =============== DATA ===============
def load_df(data: List[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(data)
    if "date" not in df or "close" not in df:
        raise ValueError("Input 'data' must contain 'date' and 'close'.")
    df["date"] = pd.to_datetime(df["date"], utc=True, errors="coerce")
    df = df.dropna(subset=["date", "close"]).sort_values("date").reset_index(drop=True)
    if len(df) < 2:
        raise ValueError("Need >= 2 points.")
    return df

# =============== ONE-TIME CHART RENDER ===============
def render_chart_static(df: pd.DataFrame) -> dict:
    """
    Render the chart ONCE with Matplotlib (neon + grid), without HUD/dot.
    Return dict with:
      - chart_full: (H,W,3) uint8 composited over gradient (static)
      - ymin,ymax
      - ax_px: (left, top, width, height) in pixels
    """
    plt.style.use("dark_background")
    fig = plt.figure(figsize=(W/100, H/100), dpi=100)
    ax = fig.add_axes(AX_RECT)

    x = df["date"].values
    y = df["close"].values

    # y-lims for stability
    ymin, ymax = float(df["close"].min()), float(df["close"].max())
    pad = (ymax - ymin) * 0.12 + 1e-6
    ax.set_ylim(ymin - pad, ymax + pad)

    # sparse x ticks
    if len(x) > 1:
        ticks = np.linspace(0, len(x)-1, min(6, len(x)), dtype=int)
        ax.set_xticks(ticks)
        labels = [pd.to_datetime(x[i]).strftime("%m-%d\n%H:%M") for i in ticks]
        ax.set_xticklabels(labels, rotation=0, ha="center", fontsize=16)

    ax.tick_params(axis='y', labelsize=18)
    ax.grid(True, alpha=GRID_ALPHA, linewidth=0.8)

    # neon strokes
    for lw, a in GLOW_STEPS:
        ax.plot(x, y, linewidth=lw, color=(*[c/255 for c in LINE_CORE], a))
    ax.plot(x, y, linewidth=LINE_WIDTH, color=np.array(LINE_CORE)/255.0)

    # clean spines
    for s in ax.spines.values(): s.set_visible(False)

    fig.canvas.draw()
    img = np.asarray(fig.canvas.buffer_rgba())[:, :, :3]
    plt.close(fig)

    # composite once with gradient via lighten
    bg = gradient_bg()
    chart_full = bg.copy()
    np.maximum(chart_full, img, chart_full)

    # axis pixel rect (convert fig coords -> pixel coords)
    left, bottom, width, height = AX_RECT
    ax_left = int(W * left)
    ax_w    = int(W * width)
    ax_top  = int(H * (1 - (bottom + height)))   # flip because image origin is top
    ax_h    = int(H * height)

    return {
        "chart_full": chart_full,
        "ymin": ymin, "ymax": ymax,
        "ax_px": (ax_left, ax_top, ax_w, ax_h),
    }

# =============== FAST ANIMATED CLIP ===============
def make_chart_clip_fast(df: pd.DataFrame, title: str, subtitle: str, duration: float) -> VideoClip:
    meta = render_chart_static(df)
    chart_full = meta["chart_full"]
    ymin, ymax = meta["ymin"], meta["ymax"]
    ax_left, ax_top, ax_w, ax_h = meta["ax_px"]

    n = len(df)

    # pre-render glass card BG once (without numbers)
    card_w, card_h = 840, 120
    card = Image.new("RGBA", (card_w, card_h), (0,0,0,0))
    cd = ImageDraw.Draw(card)
    r = 28
    cd.rounded_rectangle([0,0,card_w,card_h], r, fill=(15,15,20,180), outline=(255,255,255,25), width=2)
    card_base = card.filter(ImageFilter.GaussianBlur(2))
    card_x = W//2 - card_w//2
    card_y = H - 320

    def y_to_px(val: float) -> int:
        # map price to pixel within axis rect (top-down)
        norm = (ymax - val) / (ymax - ymin + 1e-12)
        return int(ax_top + norm * ax_h)

    def frame(t: float) -> np.ndarray:
        u = ease(0 if duration <= 0 else min(1.0, max(0.0, t / duration)))

        # progressive reveal: copy columns up to cut
        cut = int(ax_left + u * ax_w)
        frame = gradient_bg().copy()
        frame[:, :cut, :] = chart_full[:, :cut, :]

        # head index/value and position
        idxf = max(0, min(n-1, int(round(u * (n-1)))))
        price = float(df["close"].iloc[idxf])
        y_px = y_to_px(price)
        x_px = int(ax_left + (idxf / (n-1)) * ax_w)

        # HUD + dot via PIL
        pil = Image.fromarray(frame).convert("RGBA")
        draw = ImageDraw.Draw(pil)
        draw.text((W//2, 80), title, font=FONT_TITLE, fill=(240,240,240), anchor="mm")
        if subtitle:
            draw.text((W//2, 150), subtitle, font=FONT_BODY, fill=(220,220,220), anchor="mm")

        # pulsing orb
        pulse = 1.0 + 0.5 * math.sin(u * 10 * math.pi)
        orb_r = int(ORB_BASE_RADIUS * pulse)
        orb = Image.new("RGBA", (orb_r*6, orb_r*6), (0,0,0,0))
        od = ImageDraw.Draw(orb)
        # halo
        od.ellipse([0,0,orb_r*6-1,orb_r*6-1], fill=(0,0,0,64))
        # core
        od.ellipse([orb_r*2, orb_r*2, orb_r*4-1, orb_r*4-1], fill=(LINE_CORE[0], LINE_CORE[1], LINE_CORE[2], 255))
        pil.alpha_composite(orb, (x_px - orb_r*3, y_px - orb_r*3))

        # price + % change card
        start = float(df["close"].iloc[0])
        chg_pct_total = (price - start)/start * 100.0
        # animate number to current u position
        chg_disp = chg_pct_total
        price_txt = f"{price:,.2f}"
        pct_txt   = f"{chg_disp:+.2f}%"
        pct_color = (40, 220, 140) if chg_disp >= 0 else (240, 80, 80)

        card_img = card_base.copy()
        cd2 = ImageDraw.Draw(card_img)
        cd2.text((40, 40), "Price", font=FONT_BODY, fill=(160,160,170))
        cd2.text((200, 30), price_txt, font=FONT_NUM, fill=(245,245,245))
        cd2.text((card_w - 40, 60), pct_txt, font=FONT_NUM, fill=pct_color, anchor="rm")
        pil.alpha_composite(card_img, (card_x, card_y))

        return np.array(pil.convert("RGB"))

    return VideoClip(frame, duration=float(duration))

def make_slate(text_top: str, text_bottom: str, seconds=0.6) -> ImageClip:
    img = Image.new("RGB", (W,H), (0,0,0))
    draw = ImageDraw.Draw(img)
    draw.text((W//2, H//2-40), text_top,   font=FONT_TITLE, fill=(240,240,240), anchor="mm")
    if text_bottom:
        draw.text((W//2, H//2+60), text_bottom, font=FONT_BODY,  fill=(180,180,180), anchor="mm")
    return ImageClip(np.array(img)).set_duration(seconds)

# =============== TTS (ElevenLabs) ===============
def eleven_tts_to_file(text: str, out_path: Path, voice_id: Optional[str] = None) -> float:
    voice = voice_id or DEFAULT_VOICE_ID
    if not ELEVEN_API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not set.")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    headers = {"xi-api-key": ELEVEN_API_KEY, "accept": "audio/mpeg", "Content-Type": "application/json"}
    payload = {"text": text, "model_id": "eleven_monolingual_v1",
               "voice_settings": {"stability": 0.4, "similarity_boost": 0.7}}
    with requests.post(url, headers=headers, json=payload, stream=True, timeout=60) as r:
        r.raise_for_status()
        with open(out_path, "wb") as f:
            for chunk in r.iter_content(1024 * 16):
                if chunk: f.write(chunk)
    clip = AudioFileClip(str(out_path))
    dur = float(clip.duration)
    clip.close()
    return dur

# =============== HANDLER ===============
@functions_framework.cloud_event
def render_reel(cloud_event):
    """
    Pub/Sub CloudEvent handler.
    data: {
      title: str,
      data: [{date, close}, ...],
      tts?: str,
      voice_id?: str,
      subtitle?: str,
      duration?: float   # used only if no TTS
    }
    """
    try:
        payload_raw = base64.b64decode(cloud_event.data["message"]["data"]).decode("utf-8")
        payload = json.loads(payload_raw)
        # payload = cloud_event
    except Exception:
        logging.exception("Failed to parse Pub/Sub data")
        raise

    title     = payload.get("title") or "Last 24h"
    subtitle  = payload.get("subtitle", "Previous trading hours")
    tts_text  = payload.get("tts", "")
    voice_id  = payload.get("voice_id")
    desired_duration = float(payload.get("duration", DUR_FALLBACK))

    df = load_df(payload["data"])

    # Generate TTS first (to drive chart duration)
    audio_path = None
    tts_duration = None
    if tts_text:
        try:
            audio_path = TMP_DIR / "tts.mp3"
            raise Exception("TTS disabled for testing")  # --- IGNORE ---
            tts_duration = eleven_tts_to_file(tts_text, audio_path, voice_id=voice_id)
        except Exception:
            logging.exception("TTS failed; continuing without audio.")
            audio_path = None
            tts_duration = None

    chart_duration = float(tts_duration) if tts_duration else desired_duration

    # Build video timeline (FAST path)
    intro = make_slate(title, subtitle, seconds=INTRO_SEC)
    chart = make_chart_clip_fast(df, title, subtitle, duration=chart_duration)
    outro = make_slate("Follow for daily updates", "veloryn.wadby.cloud", seconds=OUTRO_SEC)

    final = concatenate_videoclips([intro, chart, outro], method="compose")

    # Attach audio robustly
    if audio_path and audio_path.exists():
        narr = AudioFileClip(str(audio_path))
        safe_narr = narr.subclip(0, max(0, narr.duration - EPS)).set_start(INTRO_SEC)
        silence = AudioClip(lambda t: np.array([0.0, 0.0]), duration=final.duration, fps=AUDIO_SAMPLERATE)
        final_audio = CompositeAudioClip([silence, safe_narr])
        final = final.set_audio(final_audio)

    # Write & upload
    out_local = TMP_DIR / f"{title}_{uuid4()}.mp4"
    final.write_videofile(
        str(out_local),
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        preset="ultrafast",          # speed!
        threads=0,                    # let ffmpeg choose
        bitrate="4500k",
        ffmpeg_params=["-movflags", "+faststart"]
    )

    gs_path = upload_to_gcs(out_local)
    logging.info(f"Uploaded to {gs_path}")

    # Cleanup
    try:
        out_local.unlink(missing_ok=True)
        if audio_path: audio_path.unlink(missing_ok=True)
    except Exception:
        pass

    return


# if __name__ == "__main__":
#     render_reel(
#     )