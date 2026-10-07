import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const authenticateToken = (req, res, next) => {
  const userHeader = req.headers["authorization"];
  const token = userHeader && userHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      // Returning 401 triggers the frontend interceptor to hit /refresh-token
      return res
        .status(401)
        .json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
    }
    req.user = user;
    next();
  });
};


export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions'})
        }
        next()
    }
}