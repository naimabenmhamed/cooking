from fastapi import FastAPI, File, UploadFile
import whisper
import uvicorn
import os

app = FastAPI()

# Charger le modèle Whisper (base, small, medium, large, etc.)
model = whisper.load_model("tiny")

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = f"temp_audio.{file.filename.split('.')[-1]}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    # Forcer la langue arabe (mieux pour transcrire la darija)
    result = model.transcribe(temp_path, language="ar")

    os.remove(temp_path)

    return {"transcription": result["text"]}
