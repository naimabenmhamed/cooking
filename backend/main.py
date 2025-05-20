from fastapi import FastAPI, File, UploadFile
import whisper
import os
import subprocess

app = FastAPI()
model = whisper.load_model("small")

@app.post("/")
async def transcribe_audio(file: UploadFile = File(...)):
    print("✅ Fichier reçu :", file.filename)
    try:
        ext = file.filename.split('.')[-1]
        temp_input = f"temp_audio.{ext}"
        temp_output = "converted.wav"

        # Sauvegarde du fichier original
        with open(temp_input, "wb") as buffer:
            buffer.write(await file.read())

        # Conversion en WAV mono 16kHz
        subprocess.run([
            "ffmpeg", "-y", "-i", temp_input,
            "-ac", "1", "-ar", "16000", temp_output
        ])

        # Transcription (sans fixer la langue)
        result = model.transcribe(temp_output)

        # Nettoyage
        os.remove(temp_input)
        os.remove(temp_output)

        return {"transcription": result["text"]}

    except Exception as e:
        return {"error": str(e)}