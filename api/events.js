
const mongoose = require("mongoose");
const crypto = require("crypto");

// MongoDB Schema
const eventSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Event =
  mongoose.models.Event ||
  mongoose.model("Event", eventSchema);

// Reuse MongoDB connection
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI missing");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
}

// CORS
function setCors(req, res) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    ...(process.env.CLIENT_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-device-token"
  );
}

// API Handler
module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!["GET", "POST"].includes(req.method)) {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // Check token before accepting SOS events
    if (req.method === "POST") {
      const expectedToken = process.env.DEVICE_TOKEN;
      const providedToken = req.headers["x-device-token"];

      if (
        !expectedToken ||
        providedToken !== expectedToken
      ) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }
    }

    await connectDB();

    // GET: Fetch recent alerts
    if (req.method === "GET") {
      const events = await Event.find()
        .sort({ at: -1 })
        .limit(100)
        .lean();

      return res.status(200).json(events);
    }

    // POST: Save SOS alert
    const { type, device, value } = req.body || {};

    if (
      typeof type !== "string" ||
      typeof device !== "string" ||
      !type.trim() ||
      !device.trim()
    ) {
      return res.status(400).json({
        error: "type and device are required",
      });
    }

    const event = await Event.create({
      id: crypto.randomUUID(),
      type: type.trim().slice(0, 40),
      device: device.trim().slice(0, 80),
      value: value ?? null,
      at: new Date(),
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Events API Error:", error.message);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
