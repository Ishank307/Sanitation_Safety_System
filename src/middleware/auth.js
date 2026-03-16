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

// Only supervisors can access certain routes
const supervisorOnly = (req, res, next) => {
  if (req.user?.role !== "supervisor") {
    return res.status(403).json({ success: false, message: "Supervisor access only" });
  }
  next();
};

module.exports = { authMiddleware, supervisorOnly };
