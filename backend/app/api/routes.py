import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form

from app.pipeline.pipeline import IngredientPipeline

router = APIRouter()

# Initialize the pipeline only once when the server starts
pipeline = IngredientPipeline()


@router.get("/")
def root():
    return {
        "message": "Backend is running successfully!"
    }


@router.get("/health")
def health():
    return {
        "status": "healthy"
    }


@router.post("/extract")
async def extract_ingredients(
    file: UploadFile = File(...),
    confidence: float = Form(0.45)
):
    # Read image content directly in-memory to prevent local storage usage
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {
            "status": "error",
            "message": "Invalid image file format. Could not decode."
        }

    # Run the full fixed pipeline (detect → OCR → 3x LLM → annotate)
    result = pipeline.process_image(img, conf=confidence)

    return result
