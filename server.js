
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ===================================
// CORS CONFIGURATION
// ===================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow ESP32 and other non-browser clients
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "x-device-token",
    ],
  })
);

app.use(express.json());

// ===================================
// MONGODB CONNECTION
// ===================================

let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
      })
      .then(() => {
        console.log("================================");
        console.log("MongoDB Connected Successfully!");
        console.log(
          "Database:",
          mongoose.connection.name
        );
        console.log("================================");

        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;

        console.error(
          "MongoDB Connection Failed:",
          error.message
        );

        throw error;
      });
  }

  return connectionPromise;
}

// ===================================
// HOME ROUTE
// ===================================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Military Command Center API",
    status: "running",
    health: "/api/health",
    events: "/api/events",
  });
});

// ===================================
// HEALTH CHECK
// ===================================

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();

    return res.status(200).json({
      ok: true,
      storage: "mongodb",
      database: "connected",
    });
  } catch (error) {
    console.error("Health Check Error:", error.message);

    return res.status(503).json({
      ok: false,
      storage: "mongodb",
      database: "disconnected",
    });
  }
});

// ===================================
// EVENTS API
// ===================================

app.all("/api/events", async (req, res) => {
  try {
    await connectDB();

    const eventsHandler = require("./api/events");

    return await eventsHandler(req, res);
  } catch (error) {
    console.error("Events API Error:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        ok: false,
        message: "Events API failed",
      });
    }
  }
});

// ===================================
// START LOCAL SERVER
// ===================================

if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(
      `Military Command Center running on port ${PORT}`
    );

    connectDB().catch(() => {
      console.error("MongoDB is not connected");
    });
  });
}

// ===================================
// EXPORT FOR VERCEL
// ===================================

module.exports = app;
