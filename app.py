"""
Crop Health & Weed Detection — Flask AI Service
Provides /predict-disease and /predict-weed endpoints.
Falls back to mock predictions when model files are not present.
"""

import os
import random
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

app = Flask(__name__)
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
CORS(app, origins="*" if CORS_ORIGIN == "*" else [origin.strip() for origin in CORS_ORIGIN.split(",")])

# ---------- Model Loading (with graceful fallback) ----------

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
WEED_MODEL_PATH = os.path.join(os.path.dirname(__file__), "weed_model.h5")

USE_REAL_MODELS = False
USE_WEED_MODEL = False

crop_model = None
maize_dense = maize_eff = maize_xcep = None
sugar_dense = sugar_eff = sugar_xcep = None
weed_model = None
weed_input_shape = (224, 224)  # Default; overridden once model loads

try:
    import tensorflow as tf

    # ── Weed model ──
    if os.path.exists(WEED_MODEL_PATH):
        weed_model = tf.keras.models.load_model(WEED_MODEL_PATH)
        # Derive expected input size from the model itself
        model_input = weed_model.input_shape  # e.g. (None, 224, 224, 3)
        if model_input and len(model_input) == 4:
            weed_input_shape = (model_input[1], model_input[2])
        USE_WEED_MODEL = True
        num_classes = weed_model.output_shape[-1]
        print(f"[OK] Weed model loaded — input {weed_input_shape}, {num_classes} classes")
    else:
        print("[WARN] weed_model.h5 not found — using mock weed predictions")

    # ── Disease models ──
    try:
        import joblib
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
            print("[OK] Disease models loaded successfully")
        else:
            print("[WARN] Disease model files not found — using mock disease predictions")
    except Exception as e:
        print(f"[WARN] Could not load disease models ({e}) — using mock disease predictions")

except Exception as e:
    print(f"[WARN] TensorFlow unavailable ({e}) — using mock predictions for everything")

# ---------- Disease / Class Labels ----------

MAIZE_CLASSES = ["Blight", "Common Rust", "Gray Leaf Spot", "Healthy"]

SUGARCANE_CLASSES = [
    "Banded Chlorosis", "Brown Rust", "Brown Spot", "Dried Leaves",
    "Grassy Shoot", "Healthy", "Pokkah Boeng", "Sett Rot",
    "Smut", "Viral Disease", "Yellow Leaf",
]

# Weed class labels — 4 classes matching weed_model.h5 output
# Update these labels to match your model's training data if needed
WEED_CLASSES = [
    "Broadleaf Weed",
    "Grass Weed",
    "Negative",
    "Sedge Weed",
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

WEED_TREATMENT_MAP = {
    "Broadleaf Weed": "Apply post-emergent broadleaf herbicides such as 2,4-D, dicamba, or triclopyr. Use selective herbicides to protect crops. Mulching and cover cropping can help prevent regrowth.",
    "Grass Weed": "Apply grass-selective herbicides like fluazifop, sethoxydim, or clethodim. Hand-weeding is effective for small infestations. Pre-emergent herbicides (pendimethalin) can prevent germination.",
    "Sedge Weed": "Apply targeted herbicides such as halosulfuron-methyl or sulfentrazone. Improve field drainage as sedges thrive in wet conditions. Repeated cultivation and crop rotation help reduce populations.",
    "Negative": None,  # Not a weed — no treatment needed
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


def preprocess_for_weed(img: np.ndarray) -> np.ndarray:
    """Preprocess image for the weed detection model."""
    # Convert BGR (OpenCV default) to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, weed_input_shape)
    # Note: Model has built-in Rescaling layers, so no / 255.0 manual scaling here
    return np.expand_dims(img, axis=0)


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
    weed_type = random.choice(WEED_CLASSES)
    is_weed = weed_type != "Negative"
    return {
        "result": weed_type if is_weed else "Crop",
        "weed_type": weed_type if is_weed else None,
        "confidence": round(random.uniform(78, 99), 1),
        "is_weed": is_weed,
        "treatment": WEED_TREATMENT_MAP.get(weed_type) if is_weed else None,
    }


# ---------- Endpoints ----------


@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "status": "running",
        "framework": "flask",
        "disease_models_loaded": USE_REAL_MODELS,
        "weed_model_loaded": USE_WEED_MODEL,
    })


@app.route("/predict-disease", methods=["POST"])
def predict_disease():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded. Please select an image file."}), 400

    file = request.files["image"]
    if file.content_type not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
        return jsonify({"error": "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image."}), 400

    file_bytes = file.read()

    if not USE_REAL_MODELS:
        return jsonify(mock_disease_prediction())

    try:
        img = read_image(file_bytes)
    except ValueError:
        return jsonify({"error": "Could not decode the uploaded image."}), 400

    # Classify crop type
    crop_input = preprocess_crop(img)
    crop_pred = crop_model.predict(crop_input)
    crop_index = crop_pred[0]

    base = preprocess_for_models(img)

    from tensorflow.keras.applications.efficientnet import preprocess_input as eff_pre
    from tensorflow.keras.applications.densenet import preprocess_input as dense_pre
    from tensorflow.keras.applications.xception import preprocess_input as xcep_pre

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

    return jsonify({
        "crop": crop,
        "disease": disease_name,
        "confidence": confidence,
        "is_healthy": is_healthy,
        "treatment": treatment,
    })


@app.route("/predict-weed", methods=["POST"])
def predict_weed():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded. Please select an image file."}), 400

    file = request.files["image"]
    if file.content_type not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
        return jsonify({"error": "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image."}), 400

    file_bytes = file.read()

    if not USE_WEED_MODEL:
        return jsonify(mock_weed_prediction())

    try:
        img = read_image(file_bytes)
    except ValueError:
        return jsonify({"error": "Could not decode the uploaded image."}), 400

    # Preprocess and run inference
    processed = preprocess_for_weed(img)
    predictions = weed_model.predict(processed)
    predicted_index = int(np.argmax(predictions[0]))
    confidence = round(float(np.max(predictions[0])) * 100, 1)

    # Map index to class label
    if predicted_index < len(WEED_CLASSES):
        weed_type = WEED_CLASSES[predicted_index]
    else:
        weed_type = f"Unknown (class {predicted_index})"

    is_weed = weed_type != "Negative"
    treatment = WEED_TREATMENT_MAP.get(weed_type) if is_weed else None

    return jsonify({
        "result": weed_type if is_weed else "Crop",
        "weed_type": weed_type if is_weed else None,
        "confidence": confidence,
        "is_weed": is_weed,
        "treatment": treatment,
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
