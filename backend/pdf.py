from fastapi import FastAPI, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from reportlab.pdfgen import canvas
import io

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
    p = canvas.Canvas(buffer)

    y = 800
    for line in text.split('\n'):
        p.drawString(50, y, line)
        y -= 20

    p.showPage()
    p.save()

    buffer.seek(0)
    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=generated.pdf"}
    )