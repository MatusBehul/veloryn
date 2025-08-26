#!/usr/bin/env python3
# cloud_function_reel.py — IG-style neon reel with optional ElevenLabs TTS, built for GCP Cloud Functions (2nd gen)

import os, math, functools, json, base64, logging, re
from typing import Dict, List, Any, Optional
from pathlib import Path

import numpy as np
import pandas as pd
import requests

# ---- Matplotlib headless
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["figure.dpi"] = 100
plt.rcParams["savefig.dpi"] = 100

# ---- Pillow / ANTIALIAS compat
from PIL import Image, ImageDraw, ImageFont, ImageFilter, Image as PILImage
if not hasattr(PILImage, "ANTIALIAS"):
    PILImage.ANTIALIAS = PILImage.Resampling.LANCZOS

# ---- MoviePy + FFmpeg (bundle via imageio-ffmpeg)
from moviepy.editor import (
    VideoClip, ColorClip, ImageClip, concatenate_videoclips,
    AudioFileClip, AudioClip, CompositeAudioClip
)
import imageio_ffmpeg
os.environ["IMAGEIO_FFMPEG_EXE"] = imageio_ffmpeg.get_ffmpeg_exe()

# ---- GCS
from google.cloud import storage

# ---- Functions Framework
import functions_framework

# ================= CONFIG =================
W, H  = 1080, 1920         # portrait
FPS   = 30
DUR   = 24.0               # seconds for chart animation (fallback if no TTS)

INTRO_SEC = 0.8
OUTRO_SEC = 0.8
AUDIO_SAMPLERATE = 44100
EPS = 1e-3                 # small trim to avoid floating-point over-read

BG_TOP  = (10, 10, 12)
BG_BOT  = (18, 18, 22)
LINE_CORE = (0, 255, 200)  # neon mint
GLOW_STEPS = [(14, 0.10), (8, 0.20), (5, 0.35)]
LINE_WIDTH = 5
GRID_ALPHA = 0.12
ORB_BASE_RADIUS = 8

FONT_BOLD_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
]
FONT_REG_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]

ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
DEFAULT_VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
DEFAULT_BUCKET = os.getenv("GCS_BUCKET", "")

if not ELEVEN_API_KEY:
    logging.warning("Warning: ELEVENLABS_API_KEY not set; TTS will be disabled.")
if not DEFAULT_BUCKET:
    logging.warning("Warning: GCS_BUCKET not set; output_uri must be provided in the payload.")

TMP_DIR = Path("/tmp")
TMP_DIR.mkdir(exist_ok=True)

# ================= UTIL =================
def pick_font(candidates, size):
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

FONT_TITLE = pick_font(FONT_BOLD_CANDIDATES, 72)
FONT_NUM   = pick_font(FONT_BOLD_CANDIDATES, 64)
FONT_BODY  = pick_font(FONT_REG_CANDIDATES, 48)

def lerp(a, b, u): return a + (b - a) * u
def ease_smoothstep(u): return u*u*(3 - 2*u)

@functools.lru_cache(maxsize=1)
def make_bg_gradient_cached():
    arr = np.zeros((H, W, 3), dtype=np.uint8)
    top = np.array(BG_TOP, dtype=np.float32)
    bot = np.array(BG_BOT, dtype=np.float32)
    for y in range(H):
        a = y / (H-1)
        arr[y, :, :] = (1-a)*top + a*bot
    return arr

def parse_gs_uri(uri: str) -> tuple[str, str]:
    m = re.match(r"^gs://([^/]+)/(.+)$", uri)
    if not m:
        raise ValueError(f"Invalid GCS URI: {uri}")
    return m.group(1), m.group(2)

def upload_to_gcs(local_path: Path, gs_uri: Optional[str]) -> str:
    client = storage.Client()
    if gs_uri:
        bucket_name, blob_name = parse_gs_uri(gs_uri)
    else:
        if not DEFAULT_BUCKET:
            raise ValueError("No output_uri provided and GCS_BUCKET env var is not set.")
        bucket_name = DEFAULT_BUCKET
        blob_name = local_path.name

    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(str(local_path))
    return f"gs://{bucket_name}/{blob_name}"

# ================= DATA =================
def load_df(data: List[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(data)
    if "date" not in df.columns or "close" not in df.columns:
        raise ValueError("Input 'data' must contain 'date' and 'close' fields.")
    df["date"] = pd.to_datetime(df["date"], utc=True, errors="coerce")
    df = df.dropna(subset=["date", "close"]).sort_values("date").reset_index(drop=True)
    if len(df) < 2:
        raise ValueError("Not enough data points to render a chart (need >= 2).")
    return df

# ================= RENDER =================
def render_chart_frame(df: pd.DataFrame, u: float, video_title: str, subtitle: str = "") -> np.ndarray:
    u = float(np.clip(u, 0.0, 1.0))
    u_eased = ease_smoothstep(u)
    n = len(df)
    idx = max(2, int(round(lerp(2, n, u_eased))))
    sub = df.iloc[:idx]

    plt.style.use("dark_background")
    fig = plt.figure(figsize=(W/100, H/100), dpi=100)
    ax = fig.add_axes([0.08, 0.22, 0.84, 0.62])  # leave space for HUD

    x = sub["date"].values
    y = sub["close"].values

    # X ticks (≤6)
    if len(x) > 1:
        ticks = np.linspace(0, len(x)-1, min(6, len(x)), dtype=int)
        ax.set_xticks(ticks)
        labels = [pd.to_datetime(x[i]).strftime("%m-%d\n%H:%M") for i in ticks]
        ax.set_xticklabels(labels, rotation=0, ha="center", fontsize=16)

    # Fixed y-lims for stability
    ymin, ymax = df["close"].min(), df["close"].max()
    pad = (ymax - ymin) * 0.12 + 1e-6
    ax.set_ylim(ymin - pad, ymax + pad)
    ax.tick_params(axis='y', labelsize=18)
    ax.grid(True, alpha=GRID_ALPHA, linewidth=0.8)

    # Glow strokes
    for lw, a in GLOW_STEPS:
        ax.plot(x, y, linewidth=lw, color=(*[c/255 for c in LINE_CORE], a))
    # Core
    ax.plot(x, y, linewidth=LINE_WIDTH, color=np.array(LINE_CORE)/255.0)

    # Pulsing orb
    cx, cy = x[-1], y[-1]
    pulse = 1.0 + 0.5 * math.sin(u_eased * 10 * math.pi)
    ax.scatter([cx], [cy], s=(ORB_BASE_RADIUS*8*pulse), c=[np.array(LINE_CORE)/255.0], zorder=10)
    ax.scatter([cx], [cy], s=(ORB_BASE_RADIUS*30*pulse), c=[(0,0,0)], alpha=0.25, zorder=9)

    for spine in ax.spines.values():
        spine.set_visible(False)

    fig.canvas.draw()
    img = np.asarray(fig.canvas.buffer_rgba())[:, :, :3]
    plt.close(fig)

    # Blend with gradient (lighten)
    bg = make_bg_gradient_cached()
    out = bg.copy()
    np.maximum(out, img, out)

    # HUD
    pil = Image.fromarray(out).convert("RGBA")
    draw = ImageDraw.Draw(pil)
    draw.text((W//2, 80), video_title, font=FONT_TITLE, fill=(240,240,240), anchor="mm")
    if subtitle:
        draw.text((W//2, 150), subtitle, font=FONT_BODY, fill=(220,220,220), anchor="mm")

    # Glass card (price + animated %)
    card_w, card_h = 840, 120
    card_x = W//2 - card_w//2
    card_y = H - 320
    card = Image.new("RGBA", (card_w, card_h), (0,0,0,0))
    cd = ImageDraw.Draw(card)
    r = 28
    cd.rounded_rectangle([0,0,card_w,card_h], r, fill=(15,15,20,180), outline=(255,255,255,25), width=2)
    card_blur = card.filter(ImageFilter.GaussianBlur(2))

    start = df["close"].iloc[0]
    end   = df["close"].iloc[idx-1]
    chg_pct = (end - start)/start * 100.0
    chg_disp = chg_pct * u_eased

    price_txt = f"{end:,.2f}"
    pct_txt   = f"{chg_disp:+.2f}%"
    pct_color = (40, 220, 140) if chg_disp >= 0 else (240, 80, 80)

    cd = ImageDraw.Draw(card_blur)
    cd.text((40, 40), "Price", font=FONT_BODY, fill=(160,160,170))
    cd.text((200, 30), price_txt, font=FONT_NUM, fill=(245,245,245))
    cd.text((card_w - 40, 60), pct_txt, font=FONT_NUM, fill=pct_color, anchor="rm")

    pil.alpha_composite(card_blur, (card_x, card_y))
    return np.array(pil.convert("RGB"))

def make_chart_clip(df: pd.DataFrame, video_title: str, subtitle: str, duration: float) -> VideoClip:
    df = df.sort_values("date").reset_index(drop=True)
    def make_frame(t):
        u = t / duration if duration > 0 else 1.0
        return render_chart_frame(df, u, video_title, subtitle)
    return VideoClip(make_frame, duration=float(duration))

def make_slate(text_top: str, text_bottom: str, seconds=0.8) -> ImageClip:
    img = Image.new("RGB", (W,H), (0,0,0))
    draw = ImageDraw.Draw(img)
    draw.text((W//2, H//2-40), text_top,   font=FONT_TITLE, fill=(240,240,240), anchor="mm")
    if text_bottom:
        draw.text((W//2, H//2+60), text_bottom, font=FONT_BODY,  fill=(180,180,180), anchor="mm")
    return ImageClip(np.array(img)).set_duration(seconds).crossfadein(0.2).crossfadeout(0.2)

# ================= TTS (ElevenLabs) =================
def eleven_tts_to_file(text: str, out_path: Path, voice_id: Optional[str] = None) -> float:
    """Generate TTS with ElevenLabs and save to out_path (.mp3). Return duration (s)."""
    voice = voice_id or DEFAULT_VOICE_ID
    if not ELEVEN_API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not set.")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    headers = {
        "xi-api-key": ELEVEN_API_KEY,
        "accept": "audio/mpeg",
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.4, "similarity_boost": 0.7}
    }
    with requests.post(url, headers=headers, json=payload, stream=True, timeout=60) as r:
        r.raise_for_status()
        with open(out_path, "wb") as f:
            for chunk in r.iter_content(1024 * 16):
                if chunk:
                    f.write(chunk)

    clip = AudioFileClip(str(out_path))
    dur = float(clip.duration)
    clip.close()
    return dur

# ================= CLOUD EVENT HANDLER =================
@functions_framework.cloud_event
def render_reel(cloud_event):
    """
    Pub/Sub CloudEvent handler.
    Expects JSON payload in message.data with fields:
      - title (str)
      - data (list of {date, close})
      - tts (str, optional)
      - voice_id (str, optional)
      - output_uri (gs://bucket/path.mp4, optional)
      - subtitle (str, optional; small text under title)
      - duration (float, optional; fallback DUR)
    """
    try:
        payload_raw = base64.b64decode(cloud_event.data["message"]["data"]).decode("utf-8")
        payload = json.loads(payload_raw)
    except Exception:
        logging.exception("Failed to parse Pub/Sub data")
        raise

    title: str = payload.get("title") or "Last 24h"
    subtitle: str = payload.get("subtitle", "")
    desired_duration: float = float(payload.get("duration", DUR))
    tts_text: str = payload.get("tts", "")
    voice_id: Optional[str] = payload.get("voice_id")
    output_uri: Optional[str] = payload.get("output_uri")

    df = load_df(payload["data"])

    # ---- TTS first (to drive chart duration if present)
    audio_path: Optional[Path] = None
    tts_duration: Optional[float] = None
    if tts_text:
        try:
            audio_path = TMP_DIR / "tts.mp3"
            tts_duration = eleven_tts_to_file(tts_text, audio_path, voice_id=voice_id)
        except Exception:
            logging.exception("Failed to generate TTS; continuing without audio.")
            audio_path = None
            tts_duration = None

    chart_duration = float(tts_duration) if tts_duration else float(desired_duration)

    # ---- Build video timeline
    intro = make_slate(title, subtitle or "Previous trading hours", seconds=INTRO_SEC)
    chart = make_chart_clip(df, video_title=title, subtitle=subtitle, duration=chart_duration)
    outro = make_slate("Follow for daily updates", "", seconds=OUTRO_SEC)

    final = concatenate_videoclips([intro, chart, outro], method="compose").fadein(0.25).fadeout(0.25)

    # ---- Attach audio robustly
    if audio_path and audio_path.exists():
        narr = AudioFileClip(str(audio_path))

        # Trim a hair to avoid floating rounding past the end
        safe_narr = narr.subclip(0, max(0, narr.duration - EPS)).set_start(INTRO_SEC)

        # Silence bed for full video duration so audio is always defined
        silence = AudioClip(lambda t: np.array([0.0, 0.0]), duration=final.duration, fps=AUDIO_SAMPLERATE)

        final_audio = CompositeAudioClip([silence, safe_narr])
        final = final.set_audio(final_audio)

    # ---- Write & upload
    out_local = TMP_DIR / "stylish_reel.mp4"
    final.write_videofile(str(out_local), fps=FPS, codec="libx264", audio_codec="aac", preset="medium")

    gs_path = upload_to_gcs(out_local, output_uri)
    logging.info(f"Uploaded to {gs_path}")

    # ---- Cleanup
    try:
        out_local.unlink(missing_ok=True)
        if audio_path:
            audio_path.unlink(missing_ok=True)
    except Exception:
        pass

    return
