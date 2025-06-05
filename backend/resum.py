from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="API Résumé de texte (gratuit)")

# Charger le pipeline avec le modèle multilingue mT5
try:
    summarizer = pipeline("summarization",
                          model="csebuetnlp/mT5_multilingual_XLSum",
                          tokenizer="csebuetnlp/mT5_multilingual_XLSum")
except Exception as e:
    raise RuntimeError("Erreur de chargement du modèle : " + str(e))

# Schéma d'entrée
class TexteRequest(BaseModel):
    texte: str
    max_length: int = 100
    min_length: int = 30

@app.post("/resumer")
def resumer_texte(request: TexteRequest):
    if not request.texte.strip():
        raise HTTPException(status_code=400, detail="Le texte ne peut pas être vide.")

    try:
        resultat = summarizer(request.texte,
                              max_length=request.max_length,
                              min_length=request.min_length,
                              do_sample=False)
        return {
            "résumé": resultat[0]["summary_text"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur lors du résumé : " + str(e))
