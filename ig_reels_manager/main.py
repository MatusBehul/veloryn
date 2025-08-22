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
    print(url)
    print(headers)
    print(payload)
    with requests.post(url, headers=headers, json=payload, stream=True, timeout=120) as r:
        r.raise_for_status()
        with open(out_audio_path, "wb") as f:
            for chunk in r.iter_content(8192):
                if chunk:
                    f.write(chunk)

def make_video(text, audio_path, out_path):
    # Get the audio duration first
    import subprocess
    import json
    
    ## STATIC BLACK BACKGROUND
    # # Use ffprobe to get audio duration
    # probe_cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', audio_path]
    # result = subprocess.run(probe_cmd, capture_output=True, text=True, check=True)
    # audio_info = json.loads(result.stdout)
    # duration = float(audio_info['format']['duration'])
    
    # print(f"Audio duration: {duration:.2f} seconds")
    
    # # Create video with dynamic duration matching the audio
    # cmd = f'ffmpeg -y -f lavfi -i color=c=black:s=1080x1920:d={duration} -i {audio_path} -c:v libx264 -r 30 -c:a aac -shortest {out_path}'
    # run(cmd)

    ## FINANCIAL THEMED BACKGROUND WITH MOVING LINES (LIKE STOCK CHARTS)
    probe_cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', audio_path]
    result = subprocess.run(probe_cmd, capture_output=True, text=True, check=True)
    audio_info = json.loads(result.stdout)
    duration = float(audio_info['format']['duration'])
    
    print(f"Audio duration: {duration:.2f} seconds")
    
    # Create financial-themed background with moving lines (like stock charts)
    cmd = f'''ffmpeg -y -f lavfi -i "color=c=0x1a1a2e:s=1080x1920:d={duration}" -i {audio_path} -filter_complex "
    [0:v]geq=r='if(lt(abs(sin(2*PI*X/W+t)),0.02),100,16)':g='if(lt(abs(sin(2*PI*X/W+t)),0.02),255,26)':b='if(lt(abs(sin(2*PI*X/W+t)),0.02),100,46)'[lines];
    [lines]geq=r='r(X,Y)+20*sin(2*PI*t)':g='g(X,Y)+20*cos(2*PI*t)':b='b(X,Y)'[final]
    " -map "[final]" -map 1:a -c:v libx264 -r 30 -c:a aac -shortest {out_path}'''
    run(cmd)


def upload_and_sign(local_path):
    bucket_name = os.environ["GCS_BUCKET"].replace("gs://", "").split("/", 1)[0]  
    
    # Initialize client - will use default service account or service account from environment
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob_name = f"reels/{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex}.mp4"
    blob = bucket.blob(blob_name)
    
    print(f"Uploading to bucket: {bucket_name}, blob: {blob_name}")
    blob.upload_from_filename(local_path, content_type="video/mp4")
    # url = blob.generate_signed_url(
    #     version="v4",
    #     expiration=timedelta(hours=3),
    #     method="GET",
    #     content_type="video/mp4",
    # )
    # return url

# ----- Entry point (Pub/Sub) -----
@functions_framework.cloud_event
def entrypoint(cloud_event):
    """
    CloudEvent data:
      { "message": { "data": base64(json.dumps({"analysis_id": "...", "hashtags": "...", "caption": "..." })) } }
    """
    try:
        print("Starting Instagram Reels generation...")
        
        # Validate required environment variables
        required_env_vars = ["GCS_BUCKET", "ELEVENLABS_API_KEY"]
        missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {missing_vars}")
        
        print(f"Environment check passed. Using bucket: {os.environ['GCS_BUCKET']}")
        
        enc = cloud_event.data.get("message", {}).get("data", "")
        payload = json.loads(base64.b64decode(enc or b"{}").decode("utf-8"))
        print(f"Received payload: {payload}")
        
        if "analysis_id" not in payload:
            raise ValueError("Missing 'analysis_id' in Pub/Sub message data JSON.")

        analysis_id = payload.get("analysis_id")
        print(f"Processing analysis_id: {analysis_id}")

        db = firestore.Client()
        doc = db.collection("financial_analysis").document(analysis_id).collection("data").document("analysis_overview").get()
        data = doc.to_dict() or {}
        if not data:
            raise ValueError(f"Firestore doc not found: financial_analysis/{analysis_id}")
        
        print(f"Retrieved analysis data structure: {list(data.keys()) if data else 'No data'}")
        
        text = ". ".join([
            # data["analysis_data"]["en"]["fundamental_analysis"][0],
            # *data["analysis_data"]["en"]["investment_insights"],
            data["analysis_data"]["en"]["sentiment_analysis"][0],
            # data["analysis_data"]["en"]["technical_analysis"][0],
        ])
        
        print(f"Generated text for TTS: {text[:100]}..." if len(text) > 100 else f"Generated text for TTS: {text}")
        
        if not text:
            raise ValueError(f"Empty 'text' in Firestore doc: financial_analysis/{analysis_id}")

        with tempfile.TemporaryDirectory() as td:
            audio = f"{td}/voice.mp3"
            video = f"{td}/reel.mp4"

            print("Generating audio with ElevenLabs TTS...")
            elevenlabs_tts(text, audio)
            
            print("Creating video with FFmpeg...")
            make_video(text, audio, video)
            
            print("Uploading video to Google Cloud Storage...")
            upload_and_sign(video)
            print("Video uploaded")

    except Exception as e:
        print("ERROR:", repr(e))
        raise
