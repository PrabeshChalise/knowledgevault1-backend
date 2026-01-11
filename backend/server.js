import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import artefactRoutes from "./src/routes/artefactRoutes.js";
import governanceRoutes from "./src/routes/governanceRoutes.js";
import recommendationRoutes from "./src/routes/recommendationRoutes.js";
import auditRoutes from "./src/routes/auditRoutes.js";
import regionRoutes from "./src/routes/regionRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Knowledge Vault API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/artefacts", artefactRoutes);
app.use("/api/governance", governanceRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/audit", auditRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
