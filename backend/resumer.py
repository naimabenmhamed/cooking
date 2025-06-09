from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# Autoriser l'accès depuis l'appli React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔐 Tu peux mettre l’URL précise en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger le modèle de résumé
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Format attendu
class Texte(BaseModel):
    texte: str

@app.post("/resumer/")
def resumer(texte_input: Texte):
    resultat = summarizer(texte_input.texte, max_length=100, min_length=30, do_sample=False)
    return {"résumé": resultat[0]['summary_text']}