import jwt from "jsonwebtoken";

/**
 * RBAC note:
 * - Coursework 1 defines 5 conceptual actors:
 *   junior_consultant, senior_consultant, knowledge_champion,
 *   governance_council_member, system_admin
 * - For enforcement we derive a roleGroup:
 *   consultant, reviewer, admin
 * - Legacy roles (user/reviewer/admin) are supported for backward compatibility.
 */
export const normalizeRole = (role) => {
  const r = String(role || "").toLowerCase();
  // Legacy aliases
  if (r === "admin") return "system_admin";
  if (r === "reviewer") return "governance_council_member";
  if (r === "user") return "junior_consultant";
  return r;
};

export const roleGroupOf = (role) => {
  const r = normalizeRole(role);
  if (r === "system_admin") return "admin";
  if (r === "governance_council_member" || r === "knowledge_champion")
    return "reviewer";
  // consultants (default)
  return "consultant";
};

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure consistent role fields are always present
    decoded.role = normalizeRole(decoded.role);
    decoded.roleGroup = decoded.roleGroup || roleGroupOf(decoded.role);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Require one of the allowed roles/groups.
 * You can pass either:
 * - groups: "admin", "reviewer", "consultant"
 * - or specific roles: "system_admin", "governance_council_member", etc.
 */
export const requireRole = (...allowed) => {
  const allowedSet = new Set((allowed || []).map((a) => String(a).toLowerCase()));
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const role = normalizeRole(req.user.role);
    const group = roleGroupOf(role);

    const ok =
      allowedSet.has(role) ||
      allowedSet.has(group) ||
      // allow legacy names if someone calls requireRole("admin","reviewer","user")
      (role === "system_admin" && allowedSet.has("admin")) ||
      (group === "reviewer" && allowedSet.has("reviewer")) ||
      (group === "consultant" && allowedSet.has("user"));

    if (!ok) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions for this action" });
    }
    // attach normalized fields for downstream controllers
    req.user.role = role;
    req.user.roleGroup = group;
    next();
  };
};
