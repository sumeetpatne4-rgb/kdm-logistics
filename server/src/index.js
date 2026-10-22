import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import authRoutes from "./routes/auth.js";
import shipmentRoutes from "./routes/shipments.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
if (!isProd) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
}
app.use(express.json({ limit: "100kb" }));

// API routes
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "KDM Logistics API" }));
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);

// Serve React frontend in production
if (isProd) {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  // SPA fallback — send index.html for any non-API route
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
} else {
  app.use((_req, res) => res.status(404).json({ message: "API route not found." }));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.code === 11000) return res.status(409).json({ message: "That record already exists." });
  if (error?.name === "ValidationError") return res.status(400).json({ message: error.message });
  if (error?.name === "CastError") return res.status(400).json({ message: "Invalid record ID." });
  res.status(500).json({ message: "Unexpected server error." });
});

const port = Number(process.env.PORT || 5000);
try {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error("Set MONGODB_URI and JWT_SECRET in server/.env");
  await mongoose.connect(process.env.MONGODB_URI);
  const adminEmail = String(process.env.ADMIN_EMAIL || "admin@kdm-logistics.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  if (!(await User.exists({ email: adminEmail }))) {
    await User.create({
      name: process.env.ADMIN_NAME || "KDM Logistics Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "admin"
    });
    console.log(`Seeded admin account: ${adminEmail}`);
  }
  app.listen(port, () => console.log(`KDM Logistics API listening on http://localhost:${port}`));
} catch (error) {
  console.error("Startup failed:", error.message);
  process.exit(1);
}
