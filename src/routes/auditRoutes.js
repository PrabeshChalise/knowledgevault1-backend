import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getAuditLogs } from "../controllers/auditController.js";

const router = express.Router();

router.use(protect);

// Audit is restricted to reviewer/admin in CW1 (Knowledge Champion / Governance Council / System Admin)
router.get("/", requireRole("reviewer", "admin"), getAuditLogs);

export default router;
