require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

// --- Middleware ---
app.use(cors({
  origin: CLIENT_ORIGIN === "*" ? "*" : CLIENT_ORIGIN.split(",").map((origin) => origin.trim()),
}));
app.use(express.json());

// --- Multer config ---
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
  },
});

// --- Helper: forward image to Python service ---
async function forwardToPython(endpoint, fileBuffer, originalName, mimetype) {
  const form = new FormData();
  form.append("image", fileBuffer, {
    filename: originalName,
    contentType: mimetype,
  });

  const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const message = errorBody || response.statusText || "Unknown AI service error";
    const error = new Error(`AI service error (${response.status}): ${message}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// --- Routes ---

app.get("/", (_req, res) => {
  res.json({ status: "Node.js proxy running", ai_service: AI_SERVICE_URL });
});

// Disease prediction
app.post("/predict-disease", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Please select an image file." });
    }

    const result = await forwardToPython(
      "/predict-disease",
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.json(result);
  } catch (err) {
    console.error("Disease prediction error:", err.message);
    return res.status(err.status || 500).json({
      error: err.message || "Failed to process the image. Please ensure the AI service is running.",
    });
  }
});

// Weed prediction
app.post("/predict-weed", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Please select an image file." });
    }

    const result = await forwardToPython(
      "/predict-weed",
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.json(result);
  } catch (err) {
    console.error("Weed prediction error:", err.message);
    return res.status(err.status || 500).json({
      error: err.message || "Failed to process the image. Please ensure the AI service is running.",
    });
  }
});

// --- Error handling for multer ---
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 10 MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({ error: err.message });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Node.js proxy running on port ${PORT}`);
  console.log(`   Forwarding to AI service at ${AI_SERVICE_URL}`);
});
