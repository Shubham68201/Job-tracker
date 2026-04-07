import "express-async-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import applicationRoutes from "./routes/applications.js";
import aiRoutes from "./routes/ai.js";
import { errorHandler } from "./middleware/error.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/job-tracker";

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173", credentials: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
