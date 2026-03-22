const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access only" });
  }
  next();
};

const requireZonalCoordinator = (req, res, next) => {
  const role = req.user?.role;
  if (role !== "admin" && role !== "zonal_coordinator") {
    return res.status(403).json({ success: false, message: "Admin or Zonal Coordinator access required" });
  }
  next();
};

const requireCivilian = (req, res, next) => {
  if (req.user?.role !== "civilian") {
    return res.status(403).json({ success: false, message: "Civilian access only" });
  }
  next();
};

module.exports = { authMiddleware, requireAdmin, requireZonalCoordinator, requireCivilian };
