import base64
import json
import os
import shlex
import subprocess
import tempfile
import uuid
import functions_framework
from datetime import datetime, timedelta, timezone

import requests
from google.cloud import firestore, storage

# ----- Helpers -----
def run(cmd):
    print("+", cmd)
    subprocess.run(shlex.split(cmd), check=True)

def elevenlabs_tts(text: str, out_audio_path: str):
    api_key = os.environ["ELEVENLABS_API_KEY"]
    if not api_key:
        raise ValueError("Missing ELEVENLABS_API_KEY environment variable.")
    voice_id = "JBFqnCBsd6RMkjVDRZzb"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "accept": "audio/mpeg",
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.35, "similarity_boost": 0.7},
    }
    with requests.post(url, headers=headers, json=payload, stream=True, timeout=120) as r:
        r.raise_for_status()
        with open(out_audio_path, "wb") as f:
            for chunk in r.iter_content(8192):
                if chunk:
                    f.write(chunk)

def make_video(text, audio_path, out_path):
    # Simple background (black)
    cmd = f'ffmpeg -y -f lavfi -i color=c=black:s=1080x1920:d=10 -i {audio_path} -c:v libx264 -r 30 -c:a aac -shortest {out_path}'
    run(cmd)


def upload_and_sign(local_path):
    bucket_name = os.environ["GCS_BUCKET"].replace("gs://", "").split("/", 1)[0]  
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob_name = f"reels/{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex}.mp4"
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(local_path, content_type="video/mp4")
    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(hours=3),
        method="GET",
        content_type="video/mp4",
    )
    return url

# ----- Entry point (Pub/Sub) -----
@functions_framework.cloud_event
def entrypoint(cloud_event):
    """
    CloudEvent data:
      { "message": { "data": base64(json.dumps({"analysis_id": "...", "hashtags": "...", "caption": "..." })) } }
    """
    try:
        enc = cloud_event.data.get("message", {}).get("data", "")
        payload = json.loads(base64.b64decode(enc or b"{}").decode("utf-8"))
        if "analysis_id" not in payload:
            raise ValueError("Missing 'analysis_id' in Pub/Sub message data JSON.")

        analysis_id = payload.get("analysis_id")

        db = firestore.Client()
        doc = db.collection("financial_analysis").document(analysis_id).collection("data").document("analysis_overview").get()
        data = doc.to_dict() or {}
        if not data:
            raise ValueError(f"Firestore doc not found: financial_analysis/{analysis_id}")
        text = ". ".join([
            # data["analysis_data"]["en"]["fundamental_analysis"][0],
            # *data["analysis_data"]["en"]["investment_insights"],
            data["analysis_data"]["en"]["sentiment_analysis"][0],
            # data["analysis_data"]["en"]["technical_analysis"][0],
        ])
        if not text:
            raise ValueError(f"Empty 'text' in Firestore doc: financial_analysis/{analysis_id}")

        with tempfile.TemporaryDirectory() as td:
            audio = f"{td}/voice.mp3"
            video = f"{td}/reel.mp4"

            elevenlabs_tts(text, audio)
            make_video(text, audio, video)
            gcs_url = upload_and_sign(video)
            print("Video uploaded:", gcs_url)

    except Exception as e:
        print("ERROR:", repr(e))
        raise
