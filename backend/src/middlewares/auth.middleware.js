

import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    // Accept both cookie names and Authorization header
    const jwtToken =
      req.cookies?.accessToken ||
      req.cookies?.jwtToken ||
      tokenFromHeader;

    if (!jwtToken) throw new ApiError(401, "Authentication token is required");

    logger.debug("JWT Token received", { token: jwtToken });

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    logger.debug("Decoded JWT payload", {
      payload: decoded,
      keys: Object.keys(decoded),
    });

    // Support various id keys
    const userId = decoded.userId || decoded._id || decoded.sub || decoded.id;
    if (!userId) {
      logger.error("❌ Token payload missing user identifier", {
        payload: decoded,
        availableKeys: Object.keys(decoded),
      });
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
        errorMessage: "Missing user identifier in token",
        debug: {
          availableKeys: Object.keys(decoded),
          payload: decoded,
        },
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.error("❌ User not found in database", { userId });
      throw new ApiError(401, "Invalid token - user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("❌ Authentication middleware error", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        errorMessage: error.message,
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        errorMessage: error.message,
      });
    }

    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : "Internal server error";
    return res.status(statusCode).json({ success: false, message });
  }
};

export const authorizeRole = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden: Access denied");
    }
    next();
  };
};

// Optional auth: attach user if present, never block
export const optionalAuthentication = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const jwtToken =
      req.cookies?.accessToken ||
      req.cookies?.jwtToken ||
      tokenFromHeader;

    if (!jwtToken) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded._id || decoded.sub || decoded.id;
    if (!userId) {
      req.user = null;
      return next();
    }

    const user = await User.findById(userId);
    req.user = user || null;
    next();
  } catch (error) {
    logger.debug("Optional auth failed, continuing without user", {
      error: error.message,
    });
    req.user = null;
    next();
  }
};

export const authMiddleware = authentication;
