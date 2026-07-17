# 👗 AI-Powered Virtual Try-On & Stylist

Upload your photo, pick clothing, and let generative AI place the outfit on you — with fit, gender, and style recommendations powered by Gemini.

Built with a FastAPI backend, React + Tailwind frontend, YOLOv8 for person/clothing validation, and Gemini 2.0 Flash for image generation and style analysis.

---
<img width="1910" height="1199" alt="image" src="https://github.com/user-attachments/assets/2c98977b-60d6-45cf-87d5-0cbad313a8fd" />

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                   │
│  TryOn.jsx → FormData (person image + clothing + size/      │
│              gender) → POST /api/swap-clothing              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Python)                   │
│                                                             │
│  1. Input validation (size, gender)                         │
│  2. Gender guardrail — Gemini vision detects person gender  │
│  3. Person validation — YOLOv8n (single person, min size,   │
│     pose check) + HOG fallback                              │
│  4. Clothing validation — YOLOv8n + std dev check           │
│  5. Try-on generation — Gemini 2.0 Flash (image-in/out)     │
│     per clothing item                                       │
│  6. Style analysis — Gemini ranks all generated outfits     │
│  7. Returns base64 images + logs + recommendation           │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
               ▼                      ▼
      YOLOv8n (local)        Gemini 2.0 Flash API
      ultralytics            (Google GenAI)
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Python, FastAPI, Uvicorn |
| Object Detection | YOLOv8n (Ultralytics), OpenCV HOG fallback |
| Generative AI | Gemini 2.0 Flash (`gemini-2.0-flash-exp`) |
| Image Processing | Pillow (PIL), NumPy |
| Deployment | Render (backend), Vercel (frontend) |

---

## How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```env
MY_FRESH_KEY=your_gemini_api_key_here
GEMINI_IMAGE_MODEL=gemini-2.0-flash-exp
```

```bash
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

> Make sure the API URL in `TryOn.jsx` points to `http://localhost:8000` for local dev (currently set to the Render deployment URL).

---

## Features

- Upload a full/half-body photo and select 1–4 clothing items
- Choose size (S / M / L / XL / XXL) — affects fit description sent to Gemini
- Gender selection (Male / Female / Unisex) with automatic guardrail — Gemini detects the person's actual gender and blocks incompatible clothing
- Import custom clothing images beyond the built-in wardrobe
- Terminal-style live logs during generation
- AI style recommendation comparing all generated outfits
- Download generated try-on results

---

## Notes

- The Gemini API key is server-side only — never exposed to the frontend
- YOLOv8n is used (nano model) to avoid OOM on free-tier hosting; `yolov8m.pt` is included but not active
- The backend is deployed on Render's free tier — cold starts may cause a ~30s delay on first request
