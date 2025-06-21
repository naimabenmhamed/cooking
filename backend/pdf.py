from fastapi import FastAPI, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
import io
import textwrap

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-pdf/")
async def generate_pdf(text: str = Form(...)):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    margin_x = 2 * cm
    margin_y = 2 * cm
    usable_width = width - 2 * margin_x
    y = height - margin_y

    # Titre centré
    p.setFont("Helvetica-Bold", 16)
    p.setFillColorRGB(0.1, 0.3, 0.6)
    p.drawCentredString(width / 2, y, "Contenu de la Leçon")
    y -= 2 * cm

    # Texte
    p.setFont("Helvetica", 12)
    p.setFillColorRGB(0, 0, 0)

    # Préparation du texte ligne par ligne
    max_chars_per_line = int(usable_width / 6.5)  # approximatif : 6.5 pts par caractère

    for line in text.split('\n'):
        wrapped_lines = textwrap.wrap(line, width=max_chars_per_line)
        for subline in wrapped_lines:
            if y < margin_y:
                p.showPage()
                y = height - margin_y
                p.setFont("Helvetica", 12)
            p.drawString(margin_x, y, subline)
            y -= 15

    p.save()
    buffer.seek(0)

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=lecon.pdf"}
    )
