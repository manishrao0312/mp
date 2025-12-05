import os
import io
import base64
import cv2
import numpy as np
from typing import List, Dict, Any

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image

from ultralytics import YOLO
from google import genai

import traceback

# ======================================================
# Environment setup
# ======================================================
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_IMAGE_MODEL = os.getenv("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image-preview")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

# ======================================================
# Initialize models
# ======================================================
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Use the medium model for better human detection accuracy
yolo_model = YOLO("yolov8m.pt")

# ======================================================
# FastAPI app setup
# ======================================================
# ======================================================
# FastAPI app setup
# ======================================================
app = FastAPI(title="Virtual Clothing Try-On")

# --- CORS FIRST ---
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "*"  # For local testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Exception middleware NEXT ---
@app.middleware("http")
async def catch_all_exceptions(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "detail": f"Internal Server Error: {str(e)}"
            },
            headers={"Access-Control-Allow-Origin": "*"},  # Force CORS even on errors
        )

# --- Static mount LAST ---
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", include_in_schema=False)
async def root():
    return FileResponse("static/index.html")


# ======================================================
# Response Models
# ======================================================
class TryOnResult(BaseModel):
    index: int
    image: str

class TryOnResponse(BaseModel):
    success: bool
    size: str
    results: List[TryOnResult]
    logs: List[str]

# ======================================================
# Helper Functions
# ======================================================
def _run_yolo(img: Image.Image):
    """Run YOLO detection on a PIL image."""
    results = yolo_model(img, verbose=False)
    return results[0]

def _get_person_boxes(result) -> List[Dict[str, Any]]:
    """Extract YOLO person detections with area fractions."""
    names = result.names
    person_ids = [cid for cid, name in names.items() if name == "person"]

    boxes = result.boxes
    # IMPORTANT: never use tensors in boolean context
    if boxes is None or boxes.cls is None or len(boxes.cls) == 0:
        return []

    cls_ids = boxes.cls.cpu().numpy().astype(int)
    xyxy = boxes.xyxy.cpu().numpy()
    h, w = result.orig_shape
    img_area = h * w

    persons = []
    for box, cls_id in zip(xyxy, cls_ids):
        if cls_id in person_ids:
            x1, y1, x2, y2 = box
            area_frac = ((x2 - x1) * (y2 - y1)) / img_area
            persons.append({"area_frac": float(area_frac)})
    return persons

# ======================================================
# Person Detection (YOLO + OpenCV fallback)
# ======================================================
def detect_person_fallback(img: Image.Image) -> bool:
    """Fallback detection using classical HOG + SVM human detector."""
    gray = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2GRAY)
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
    boxes, _ = hog.detectMultiScale(gray, winStride=(8, 8), padding=(8, 8), scale=1.05)
    return len(boxes) > 0

def validate_person_image(img: Image.Image):
    """
    Balanced validator:
    - Requires exactly one clear person.
    - Allows slight pose variation but rejects profiles or groups.
    - Uses YOLO box geometry to judge pose and size.
    """
    min_side = min(img.size)
    if min_side < 256:
        raise HTTPException(400, "Image too small. Please upload a higher-resolution photo.")

    result = _run_yolo(img)
    persons = _get_person_boxes(result)

    # No YOLO detections at all → fallback heuristic
    if len(persons) == 0:
        np_img = np.array(img)
        std = np.std(np_img)
        if std < 5:
            raise HTTPException(400, "Blank or corrupted image. Please upload a real photo.")
        print("⚠️ YOLO found no person but image looks valid. Continuing anyway.")
        return

    # Too many people → reject
    if len(persons) > 1:
        raise HTTPException(400, "Multiple people detected. Please upload a photo of just you.")

    # Check detected person's size and orientation
    det = result.boxes.xyxy.cpu().numpy()[0]
    h, w = result.orig_shape
    x1, y1, x2, y2 = det
    width_frac = (x2 - x1) / w
    height_frac = (y2 - y1) / h

    # Area too small = person far away
    if width_frac * height_frac < 0.05:
        raise HTTPException(400, "Detected person too small in frame. Stand closer to the camera.")

    # Width-to-height ratio helps estimate pose
    ratio = width_frac / height_frac
    # front poses have width roughly 0.3–0.6 of height
    if ratio < 0.25 or ratio > 0.7:
        raise HTTPException(400, "Pose appears sideways or non-frontal. Please face the camera.")

    print("✅ Valid single person detected with acceptable pose and framing.")

# ======================================================
# Clothing Detection Validation
# ======================================================
def validate_clothing_image(img: Image.Image):
    """
    Very lenient validator: accepts any image that looks like a real photo.
    YOLO is used only to reject blank or random noise images.
    """
    if min(img.size) < 128:
        raise HTTPException(400, "Clothing image too small.")

    result = _run_yolo(img)
    boxes = getattr(result, "boxes", None)

    # If YOLO detects anything (person, object, whatever), we accept it.
    if boxes is not None and boxes.cls is not None and len(boxes.cls) > 0:
        print("✅ YOLO detected something in clothing image, continuing.")
        return

    # If YOLO fails, fallback check: make sure image isn't almost blank
    np_img = np.array(img)
    std = np.std(np_img)
    if std < 5:  # very low variance = likely blank or single color
        raise HTTPException(400, "Image seems empty or blank. Please upload a real clothing photo.")

    print("⚠️ YOLO found nothing, but image looks valid. Continuing anyway.")

# ======================================================
# Gemini Image Generation
# ======================================================
def generate_tryon_image(person_bytes, clothing_bytes, size, idx):
    person_img = Image.open(io.BytesIO(person_bytes)).convert("RGB")
    clothing_img = Image.open(io.BytesIO(clothing_bytes)).convert("RGB")

    prompt = (
        f"Combine this person photo with the clothing image realistically. "
        f"The clothing size is {size}. Keep the person’s face and pose natural."
    )

    response = gemini_client.models.generate_content(
        model=GEMINI_IMAGE_MODEL,
        contents=[prompt, person_img, clothing_img],
    )

    image_bytes = None
    mime_type = "image/png"
    for candidate in response.candidates:
        for part in candidate.content.parts:
            if getattr(part, "inline_data", None):
                image_bytes = part.inline_data.data
                mime_type = part.inline_data.mime_type or "image/png"
                break
        if image_bytes:
            break

    if not image_bytes:
        raise HTTPException(500, f"Gemini returned no image for clothing {idx+1}.")

    b64 = base64.b64encode(image_bytes).decode()
    return f"data:{mime_type};base64,{b64}"

# ======================================================
# Main API Endpoint
# ======================================================
@app.post("/api/swap-clothing", response_model=TryOnResponse)
async def swap_clothing(
    person_image: UploadFile = File(...),
    clothing_images: List[UploadFile] = File(...),
    size: str = Form(...)
):
    logs: List[str] = []

    num_clothes = len(clothing_images)
    if num_clothes < 1 or num_clothes > 4:
        raise HTTPException(400, f"Please upload between 1 and 4 clothing images (you uploaded {num_clothes}).")

    size = size.upper().strip()
    logs.append(f"Received 1 person image and {num_clothes} clothing images. Size: {size}")

    # Read all files
    person_bytes = await person_image.read()
    clothing_bytes_list = [await c.read() for c in clothing_images]

    # Validate inputs
    person_img = Image.open(io.BytesIO(person_bytes))
    validate_person_image(person_img)
    logs.append("✅ Person image validated successfully.")

    for i, cb in enumerate(clothing_bytes_list):
        img = Image.open(io.BytesIO(cb))
        validate_clothing_image(img)
        logs.append(f"✅ Clothing image {i+1} validated successfully.")

    logs.append("🧠 Generating AI try-on images using Gemini...")

    # Generate try-on images
    results: List[TryOnResult] = []
    for idx, cb in enumerate(clothing_bytes_list):
        img_url = generate_tryon_image(person_bytes, cb, size, idx)
        results.append(TryOnResult(index=idx, image=img_url))
        logs.append(f"✨ Generated result for clothing {idx+1}.")

    # === NEW: Style recommendation step ===
    logs.append("🎯 Analyzing generated outfits for best look...")
    try:
        # Convert all base64 results into inline Gemini content
        outfit_inputs = [Image.open(io.BytesIO(base64.b64decode(r.image.split(",")[1]))) for r in results]

        analysis_prompt = (
            f"Evaluate these {len(results)} virtual try-on photos. "
            f"Determine which outfit looks best on the person in terms of realism, fit, and color harmony. "
            f"Provide a short, friendly recommendation like 'Outfit 2 looks best because it matches skin tone and body shape naturally.'"
        )

        analysis_response = gemini_client.models.generate_content(
            model=GEMINI_IMAGE_MODEL,
            contents=[analysis_prompt] + outfit_inputs
        )

        recommendation = None
        if analysis_response.candidates:
            recommendation = analysis_response.candidates[0].content.parts[0].text.strip()

        if recommendation:
            logs.append(f"💬 Gemini recommendation: {recommendation}")
        else:
            logs.append("⚠️ No recommendation text returned by Gemini.")
    except Exception as e:
        logs.append(f"⚠️ Recommendation generation failed: {str(e)}")

    return TryOnResponse(success=True, size=size, results=results, logs=logs)

# ======================================================
# Error Handling
# ======================================================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "detail": exc.detail})
