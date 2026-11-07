import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import careerRoutes from "./routes/careers.js";
import roadmapRoutes from "./routes/roadmaps.js";
import progressRoutes from "./routes/progress.js";
import resourceRoutes from "./routes/resources.js";
import { seedDatabaseIfEmpty } from "./seed/seedData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/career_roadmap_db";

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/resources", resourceRoutes);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Career Roadmap System Backend API",
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// FRONTEND STATIC FILES
// ======================================================

const frontendDistPath = path.resolve(
  __dirname,
  "../frontend/dist"
);

app.use(express.static(frontendDistPath));

// ======================================================
// SPA FALLBACK
// ======================================================

app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(
    path.join(frontendDistPath, "index.html"),
    (error) => {
      if (error) {
        next();
      }
    }
  );
});

// ======================================================
// API 404 HANDLER
// ======================================================

app.use("/api", (req, res) => {
  res.status(404).json({
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ======================================================
// START SERVER
// ======================================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);

    console.log("Connected to MongoDB successfully.");
    console.log(`MongoDB: ${MONGO_URI}`);

    // Seed database
    try {
      await seedDatabaseIfEmpty();
      console.log("Database seed check completed.");
    } catch (seedError) {
      console.error(
        "Database seed failed:",
        seedError.message
      );
    }

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Career Roadmap Server running on http://localhost:${PORT}`
      );

      console.log(
        `Health check: http://localhost:${PORT}/api/health`
      );

      console.log(
        `Login API: http://localhost:${PORT}/api/auth/login`
      );

      console.log(
        `Register API: http://localhost:${PORT}/api/auth/register`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();