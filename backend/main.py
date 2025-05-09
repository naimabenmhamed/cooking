from fastapi import FastAPI, File, UploadFile
import whisper
import uvicorn
import os

app = FastAPI()
model = whisper.load_model("base")

@app.post("/")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        temp_path = f"temp_audio.{file.filename.split('.')[-1]}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

        result = model.transcribe(temp_path, language="ar")

        os.remove(temp_path)
        return {"transcription": result["text"]}

    except Exception as e:
        return {"error": str(e)}