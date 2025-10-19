
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

const pickToken = (req) => {
  const auth = req.headers.authorization;
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return (
    req.cookies?.access_token ||      
    req.cookies?.accessToken ||
    req.cookies?.jwtToken ||
    bearer
  );
};

export const authentication = async (req, res, next) => {
  try {
    const jwtToken = pickToken(req);
    if (!jwtToken) throw new ApiError(401, "Authentication token is required");

    // Do NOT log the full token
    logger.debug("JWT token present", { len: jwtToken.length });

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const userId = decoded.id || decoded.userId || decoded._id || decoded.sub;
    if (!userId) {
      logger.error("Token payload missing user identifier", { keys: Object.keys(decoded) });
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(401, "Invalid token - user not found");

    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication middleware error", { message: error.message, name: error.name });
    if (error instanceof jwt.TokenExpiredError)
      return res.status(401).json({ success: false, message: "Token expired" });
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ success: false, message: "Invalid token" });

    const status = error instanceof ApiError ? error.statusCode : 500;
    const msg = error instanceof ApiError ? error.message : "Internal server error";
    return res.status(status).json({ success: false, message: msg });
  }
};

export const authorizeRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) throw new ApiError(403, "Forbidden: Access denied");
  next();
};

export const optionalAuthentication = async (req, _res, next) => {
  try {
    const jwtToken = pickToken(req);
    if (!jwtToken) { req.user = null; return next(); }
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id || decoded.sub;
    req.user = userId ? await User.findById(userId) : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

export const authMiddleware = authentication;
