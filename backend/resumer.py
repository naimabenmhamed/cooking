from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation du modèle francophone
model_name = "plguillou/t5-base-fr-sum-cnndm"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

@app.post("/resumer/")
async def generate_summary(texte: str = Form(...)):
    inputs = tokenizer("summarize: " + texte, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(inputs["input_ids"], max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
    résumé = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return {"résumé": résumé}


