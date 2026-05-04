"""
Crop Health & Weed Detection — FastAPI AI Service
Provides /predict-disease and /predict-weed endpoints.
Falls back to mock predictions when model files are not present.
"""

import os
import random
import numpy as np
import cv2
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Crop Health & Weed Detection AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Model Loading (with graceful fallback) ----------

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
USE_REAL_MODELS = False

crop_model = None
maize_dense = maize_eff = maize_xcep = None
sugar_dense = sugar_eff = sugar_xcep = None

try:
    import joblib
    import tensorflow as tf
    from tensorflow.keras.applications.efficientnet import preprocess_input as eff_pre
    from tensorflow.keras.applications.densenet import preprocess_input as dense_pre
    from tensorflow.keras.applications.xception import preprocess_input as xcep_pre

    if os.path.isdir(MODELS_DIR) and os.path.exists(os.path.join(MODELS_DIR, "crop_classifier.pkl")):
        crop_model = joblib.load(os.path.join(MODELS_DIR, "crop_classifier.pkl"))
        maize_dense = tf.keras.models.load_model(os.path.join(MODELS_DIR, "maize_densenet.h5"))
        maize_eff = tf.keras.models.load_model(os.path.join(MODELS_DIR, "maize_efficientnet.h5"))
        maize_xcep = tf.keras.models.load_model(os.path.join(MODELS_DIR, "maize_xception.h5"))
        sugar_dense = tf.keras.models.load_model(os.path.join(MODELS_DIR, "sugarcane_densenet.h5"))
        sugar_eff = tf.keras.models.load_model(os.path.join(MODELS_DIR, "sugarcane_efficientnet.h5"))
        sugar_xcep = tf.keras.models.load_model(os.path.join(MODELS_DIR, "sugarcane_xception.h5"))
        USE_REAL_MODELS = True
        print("✅ Real models loaded successfully")
    else:
        print("⚠️  Model files not found — using mock predictions")
except Exception as e:
    print(f"⚠️  Could not load models ({e}) — using mock predictions")

# ---------- Disease / Class Labels ----------

MAIZE_CLASSES = ["Blight", "Common Rust", "Gray Leaf Spot", "Healthy"]

SUGARCANE_CLASSES = [
    "Banded Chlorosis", "Brown Rust", "Brown Spot", "Dried Leaves",
    "Grassy Shoot", "Healthy", "Pokkah Boeng", "Sett Rot",
    "Smut", "Viral Disease", "Yellow Leaf",
]

TREATMENT_MAP = {
    # Maize
    "Blight": "Apply fungicides containing mancozeb or chlorothalonil. Remove infected leaves. Ensure proper spacing for air circulation.",
    "Common Rust": "Apply foliar fungicides (e.g., azoxystrobin). Plant resistant varieties. Monitor fields regularly during humid conditions.",
    "Gray Leaf Spot": "Use resistant hybrids. Apply fungicides (strobilurins or triazoles). Practice crop rotation with non-host crops.",
    # Sugarcane
    "Banded Chlorosis": "Ensure balanced nutrition, especially micronutrients. Improve drainage. Apply foliar sprays of zinc sulfate.",
    "Brown Rust": "Plant resistant varieties. Apply fungicides like propiconazole. Remove infected debris after harvest.",
    "Brown Spot": "Improve field sanitation. Apply copper-based fungicides. Avoid excessive nitrogen fertilization.",
    "Dried Leaves": "Check for water stress and nutrient deficiency. Ensure adequate irrigation. Apply balanced fertilizers.",
    "Grassy Shoot": "Remove and destroy infected plants. Use disease-free seed material. Control leafhopper vectors with insecticides.",
    "Pokkah Boeng": "Remove infected plants. Apply carbendazim fungicide. Avoid excess nitrogen application.",
    "Sett Rot": "Treat setts with fungicide (carbendazim) before planting. Ensure proper drainage. Avoid waterlogged conditions.",
    "Smut": "Use resistant varieties. Perform hot-water treatment of setts. Remove and burn smut whips before spore release.",
    "Viral Disease": "Use virus-free seed material. Control insect vectors (aphids, whiteflies). Remove infected plants promptly.",
    "Yellow Leaf": "Plant tolerant varieties. Control aphid vectors. Maintain proper nutrition and irrigation.",
}

# ---------- Helpers ----------

def read_image(file_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    return img


def preprocess_crop(img: np.ndarray) -> np.ndarray:
    img = cv2.resize(img, (64, 64))
    return (img.flatten() / 255.0).reshape(1, -1)


def preprocess_for_models(img: np.ndarray) -> np.ndarray:
    img = cv2.resize(img, (224, 224))
    return np.expand_dims(np.array(img), axis=0)


# ---------- Mock Prediction Generators ----------

def mock_disease_prediction():
    """Return realistic-looking mock disease prediction."""
    crop = random.choice(["maize", "sugarcane"])
    if crop == "maize":
        disease = random.choice(MAIZE_CLASSES)
    else:
        disease = random.choice(SUGARCANE_CLASSES)
    confidence = round(random.uniform(75, 99), 1)
    is_healthy = disease.lower() == "healthy"
    treatment = None if is_healthy else TREATMENT_MAP.get(disease, "Consult a local agronomist for specific treatment advice.")
    return {
        "crop": crop,
        "disease": disease,
        "confidence": confidence,
        "is_healthy": is_healthy,
        "treatment": treatment,
    }


def mock_weed_prediction():
    """Return realistic-looking mock weed prediction."""
    is_weed = random.choice([True, False])
    return {
        "result": "Weed" if is_weed else "Crop",
        "confidence": round(random.uniform(78, 99), 1),
        "is_weed": is_weed,
    }


# ---------- Endpoints ----------

@app.get("/")
def root():
    return {"status": "running", "models_loaded": USE_REAL_MODELS}


@app.post("/predict-disease")
async def predict_disease(image: UploadFile = File(...)):
    if image.content_type not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.")

    file_bytes = await image.read()

    if not USE_REAL_MODELS:
        return mock_disease_prediction()

    try:
        img = read_image(file_bytes)
    except ValueError:
        raise HTTPException(status_code=400, detail="Could not decode the uploaded image.")

    # Classify crop type
    crop_input = preprocess_crop(img)
    crop_pred = crop_model.predict(crop_input)
    crop_index = crop_pred[0]

    base = preprocess_for_models(img)

    if crop_index == 0:
        crop = "maize"
        p1 = maize_dense.predict(dense_pre(base.copy()))
        p2 = maize_eff.predict(eff_pre(base.copy()))
        p3 = maize_xcep.predict(xcep_pre(base.copy()))
        disease_pred = (p1 + p2 + p3) / 3
        disease_index = int(np.argmax(disease_pred))
        disease_name = MAIZE_CLASSES[disease_index]
    else:
        crop = "sugarcane"
        p1 = sugar_dense.predict(dense_pre(base.copy()))
        p2 = sugar_eff.predict(eff_pre(base.copy()))
        p3 = sugar_xcep.predict(xcep_pre(base.copy()))
        disease_pred = (p1 + p2 + p3) / 3
        disease_index = int(np.argmax(disease_pred))
        disease_name = SUGARCANE_CLASSES[disease_index]

    confidence = round(float(np.max(disease_pred)) * 100, 1)
    is_healthy = disease_name.lower() == "healthy"
    treatment = None if is_healthy else TREATMENT_MAP.get(disease_name, "Consult a local agronomist.")

    return {
        "crop": crop,
        "disease": disease_name,
        "confidence": confidence,
        "is_healthy": is_healthy,
        "treatment": treatment,
    }


@app.post("/predict-weed")
async def predict_weed(image: UploadFile = File(...)):
    if image.content_type not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.")

    await image.read()

    # Weed detection — mock only for now (no model provided)
    return mock_weed_prediction()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)