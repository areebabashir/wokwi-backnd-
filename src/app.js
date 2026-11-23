
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import eventRoutes from "./routes/eventRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");

// Allowed frontend origins
const origins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS middleware - before all API routes
app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests
      // and approved frontend origins
      if (!origin || origins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin denied"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-dashboard-key",
      "x-device-token",
    ],

    optionsSuccessStatus: 204,
  })
);

// Parse JSON requests
app.use(express.json({ limit: "32kb" }));

// Root route
app.get("/", (_req, res) => {
  res.json({
    service: "AEGIS-X API",
    status: "online",
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    ok: mongoose.connection.readyState === 1,
    time: new Date().toISOString(),
  });
});

// API routes
app.use("/api/events", eventRoutes);
app.use("/api/readings", sensorRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
