
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
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
      })
      .then(() => {
        console.log("================================");
        console.log("✅ MongoDB Connected Successfully!");
        console.log("📦 Database:", mongoose.connection.name);
        console.log("================================");

        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;

        console.error(
          "❌ MongoDB Connection Failed:",
          error.message
        );

        throw error;
      });
  }

  return connectionPromise;
}

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Military Command Center API",
    health: "/api/health",
  });
});

// MongoDB Health Check
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      ok: true,
      storage: "mongodb",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      storage: "mongodb",
      database: "disconnected",
      error: error.message,
    });
  }
});

// Existing Events API
app.all("/api/events", async (req, res) => {
  try {
    await connectDB();

    return require("./api/events")(req, res);
  } catch (error) {
    console.error("Events API Error:", error.message);

    res.status(500).json({
      ok: false,
      message: "Database connection failed",
    });
  }
});

// Start Server Locally
if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`🚀 API running on port ${PORT}`);

    connectDB().catch(() => {
      console.error("⚠️ MongoDB is not connected");
    });
  });
}

// Export for Vercel
module.exports = app;
