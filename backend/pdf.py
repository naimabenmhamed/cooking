from fastapi import FastAPI, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement d'une police lisible avec accents
p.setFont("Helvetica", 12)
  # Assure-toi que ce fichier est présent dans le projet

@app.post("/generate-pdf/")
async def generate_pdf(text: str = Form(...)):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    margin_x = 2 * cm
    margin_y = 2 * cm
    y = height - margin_y

    p.setFont("DejaVu", 12)  # Police avec accents + taille correcte

    # Titre
    p.setFont("DejaVu", 16)
    p.drawCentredString(width / 2, y, "Contenu de la leçon")
    p.setFont("DejaVu", 12)
    y -= 2 * cm

    for line in text.split('\n'):
        if y < margin_y:  # Sauter à la page suivante si trop bas
            p.showPage()
            p.setFont("DejaVu", 12)
            y = height - margin_y

        p.drawString(margin_x, y, line)
        y -= 18  # espace entre lignes

    p.showPage()
    p.save()

    buffer.seek(0)
    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=lecon.pdf"}
    )


