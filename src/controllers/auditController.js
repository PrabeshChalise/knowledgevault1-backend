import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { action, actorId, targetType, targetId, from, to, regionId } = req.query;

    let query = {};

    if ((req.user.roleGroup || "consultant") === "consultant") {
      // Regular users: only see their own actions
      query.actorId = req.user.id;
    } else {
      // Reviewer / admin: default to their region, but allow overriding via query param.
      query.regionId = regionId || req.user.regionId;
    }

    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    if (actorId && mongoose.Types.ObjectId.isValid(actorId) && req.user.role !== "user") {
      query.actorId = actorId;
    }

    if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
      query.targetId = targetId;
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const logs = await AuditLog.find(query)
      .populate("actorId", "name email role")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    res.json(logs);
  } catch (err) {
    console.error("getAuditLogs error", err);
    res.status(500).json({ error: "Server error" });
  }
};
