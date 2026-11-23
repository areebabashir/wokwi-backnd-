
import "dotenv/config";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let connecting = null;

export default async function handler(req, res) {
  // Handle CORS preflight requests first
  if (req.method === "OPTIONS") {
    return app(req, res);
  }

  try {
    // Check required environment variables
    const required = [
      "MONGODB_URI",
      "DEVICE_TOKEN",
      "DASHBOARD_KEY",
    ];

    const missing = required.filter(
      (key) => !process.env[key]
    );

    if (missing.length > 0) {
      console.error(
        "Missing environment variables:",
        missing.join(", ")
      );

      return res.status(503).json({
        error: "Backend environment not configured",
      });
    }

    // Connect to MongoDB
    if (!connecting) {
      connecting = connectDB().catch((error) => {
        connecting = null;
        throw error;
      });
    }

    await connecting;

    // Forward request to Express
    return app(req, res);

  } catch (error) {
    console.error("Backend error:", error);

    return res.status(503).json({
      error: "Database unavailable",
    });
  }
}
