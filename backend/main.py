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
GEMINI_IMAGE_MODEL = os.getenv("GEMINI_IMAGE_MODEL", "gemini-2.0-flash-exp") 
# Note: Ensure you use a model version capable of image editing/generation if available, 
# or the standard multimodal model.

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

# ======================================================
# Initialize models
# ======================================================
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

yolo_model = YOLO("yolov8m.pt")

# ======================================================
# FastAPI app setup
# ======================================================
app = FastAPI(title="Virtual Clothing Try-On")

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            headers={"Access-Control-Allow-Origin": "*"},
        )

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
    gender: str  # Added gender to response
    results: List[TryOnResult]
    logs: List[str]


# ======================================================
# Helper Functions
# ======================================================
def _run_yolo(img: Image.Image):
    results = yolo_model(img, verbose=False)
    return results[0]

def _get_person_boxes(result) -> List[Dict[str, Any]]:
    names = result.names
    person_ids = [cid for cid, name in names.items() if name == "person"]

    boxes = result.boxes
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
# Person Detection
# ======================================================
def detect_person_fallback(img: Image.Image) -> bool:
    gray = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2GRAY)
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
    boxes, _ = hog.detectMultiScale(gray, winStride=(8, 8), padding=(8, 8), scale=1.05)
    return len(boxes) > 0


def validate_person_image(img: Image.Image):
    min_side = min(img.size)
    if min_side < 256:
        raise HTTPException(400, "Image too small. Please upload a higher-resolution photo.")

    result = _run_yolo(img)
    persons = _get_person_boxes(result)

    if len(persons) == 0:
        np_img = np.array(img)
        if np.std(np_img) < 5:
            raise HTTPException(400, "Blank or corrupted image.")
        return

    if len(persons) > 1:
        raise HTTPException(400, "Multiple people detected.")

    det = result.boxes.xyxy.cpu().numpy()[0]
    h, w = result.orig_shape
    x1, y1, x2, y2 = det
    width_frac = (x2 - x1) / w
    height_frac = (y2 - y1) / h

    if width_frac * height_frac < 0.05:
        raise HTTPException(400, "Person too small in frame.")

    ratio = width_frac / height_frac
    if ratio < 0.25 or ratio > 0.7:
        raise HTTPException(400, "Pose appears sideways.")


# ======================================================
# Clothing Validation
# ======================================================
def validate_clothing_image(img: Image.Image):
    if min(img.size) < 128:
        raise HTTPException(400, "Clothing image too small.")

    result = _run_yolo(img)
    boxes = getattr(result, "boxes", None)

    if boxes is not None and boxes.cls is not None and len(boxes.cls) > 0:
        return

    if np.std(np.array(img)) < 5:
        raise HTTPException(400, "Image appears blank.")


# ======================================================
# Gemini Image Generation (UPDATED)
# ======================================================
def generate_tryon_image(person_bytes, clothing_bytes, size, gender, idx):

    # Map sizes to descriptive fit instructions
    fit_descriptions = {
        "S": "tight, form-fitting",
        "M": "regular, standard",
        "L": "relaxed, slightly loose",
        "XL": "loose, oversized",
        "XXL": "very baggy, streetwear style"
    }
    
    fit_desc = fit_descriptions.get(size, "standard")

    # Enhanced Prompt for Size & Gender
    prompt = (
        f"You are an expert fashion photo editor. "
        f"Task: Place this clothing item onto the person in the image naturally. "
        f"Wearer Gender: {gender}. "
        f"Target Size: {size} ({fit_desc} fit). "
        f"Instructions: "
        f"1. Fit the clothing to the person's body shape, respecting the gender: {gender}. "
        f"2. Ensure the fit looks like a size {size} - it should be {fit_desc}. "
        f"3. Keep the person's face, hair, and background completely unchanged. "
        f"4. Realistic lighting and shadows."
    )

    person_img = Image.open(io.BytesIO(person_bytes)).convert("RGB")
    clothing_img = Image.open(io.BytesIO(clothing_bytes)).convert("RGB")

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
# Main Endpoint (UPDATED)
# ======================================================
@app.post("/api/swap-clothing", response_model=TryOnResponse)
async def swap_clothing(
    person_image: UploadFile = File(...),
    clothing_images: List[UploadFile] = File(...),
    size: str = Form(...),
    gender: str = Form(...) # NEW: Gender parameter
):
    logs: List[str] = []

    num_clothes = len(clothing_images)
    if num_clothes < 1 or num_clothes > 4:
        raise HTTPException(400, f"Upload 1 to 4 clothing images.")

    # --- SIZE VALIDATION ---
    allowed_sizes = ["S", "M", "L", "XL", "XXL"]
    size = size.upper().strip()
    if size not in allowed_sizes:
        raise HTTPException(400, f"Invalid size '{size}'. Allowed: {allowed_sizes}")

    # --- GENDER VALIDATION (NEW) ---
    allowed_genders = ["Male", "Female", "Unisex"]
    gender = gender.capitalize().strip()
    if gender not in allowed_genders:
        # Fallback if user types 'Man' or 'Woman'
        if gender.lower() in ['man', 'men']: gender = "Male"
        elif gender.lower() in ['woman', 'women']: gender = "Female"
        else:
            raise HTTPException(400, f"Invalid gender '{gender}'. Allowed: {allowed_genders}")
    
    logs.append(f"Settings -> Size: {size}, Gender: {gender}")

    person_bytes = await person_image.read()
    clothing_bytes_list = [await c.read() for c in clothing_images]

    person_img = Image.open(io.BytesIO(person_bytes))
    validate_person_image(person_img)
    logs.append("Person image validated.")

    for i, cb in enumerate(clothing_bytes_list):
        img = Image.open(io.BytesIO(cb))
        validate_clothing_image(img)
        logs.append(f"Clothing image {i+1} validated.")

    logs.append("Generating try-on images...")

    results: List[TryOnResult] = []
    for idx, cb in enumerate(clothing_bytes_list):
        # Pass gender to the generation function
        img_url = generate_tryon_image(person_bytes, cb, size, gender, idx)
        results.append(TryOnResult(index=idx, image=img_url))
        logs.append(f"Generated result {idx+1}")

    try:
        # Decoding images for the analysis step
        outfit_inputs = [Image.open(io.BytesIO(base64.b64decode(r.image.split(",")[1]))) for r in results]

        # Updated analysis prompt to consider gender style
        analysis_prompt = (
            f"Review these {len(results)} try-on results. "
            f"The user identifies as {gender} and requested size {size}. "
            f"Tell which outfit fits the best and looks most stylish for this gender and body type."
        )

        analysis_response = gemini_client.models.generate_content(
            model=GEMINI_IMAGE_MODEL,
            contents=[analysis_prompt] + outfit_inputs
        )

        recommendation = None
        if analysis_response.candidates:
            recommendation = analysis_response.candidates[0].content.parts[0].text.strip()

        if recommendation:
            logs.append(f"Recommendation: {recommendation}")
        else:
            logs.append("No recommendation returned.")

    except Exception as e:
        logs.append(f"Recommendation error: {str(e)}")

    return TryOnResponse(success=True, size=size, gender=gender, results=results, logs=logs)


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "detail": exc.detail})