// import jwt from "jsonwebtoken";
// import { User } from "../models/User.js";
// import { ApiError } from "../utils/ApiError.js";
// import { logger } from "../utils/logger.js";

// export const authentication = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;
//         const tokenFromHeader = authHeader?.startsWith("Bearer ")
//             ? authHeader.split(" ")[1]
//             : null;

//         // const jwtToken = req.cookies.jwtToken || tokenFromHeader;
//         const jwtToken = req.cookies?.jwtToken || tokenFromHeader;

//         if (!jwtToken) {
//             throw new ApiError(401, "Authentication token is required");
//         }

//         // DEBUG: Log the token to see what we're working with
//         logger.debug("JWT Token received", { token: jwtToken });

//         const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

//         // DEBUG: Log the entire decoded payload
//         logger.debug("Decoded JWT payload", { 
//             payload: decoded, 
//             keys: Object.keys(decoded) 
//         });

//         // Try different possible field names for user ID
//         const userId = decoded.userId || decoded._id || decoded.sub || decoded.id;

//         if (!userId) {
//             logger.error("❌ Token payload missing user identifier", {
//                 payload: decoded,
//                 availableKeys: Object.keys(decoded)
//             });
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid token payload",
//                 errorMessage: "Missing user identifier in token",
//                 debug: {
//                     availableKeys: Object.keys(decoded),
//                     payload: decoded
//                 }
//             });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             logger.error("❌ User not found in database", { userId });
//             throw new ApiError(401, "Invalid token - user not found");
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         logger.error("❌ Authentication middleware error", {
//             message: error.message,
//             stack: error.stack,
//             name: error.name
//         });

//         // Handle specific JWT errors first
//         if (error instanceof jwt.JsonWebTokenError) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid token",
//                 errorMessage: error.message
//             });
//         } else if (error instanceof jwt.TokenExpiredError) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Token expired",
//                 errorMessage: error.message
//             });
//         }

//         // Fallback for other errors
//         const statusCode = error instanceof ApiError ? error.statusCode : 500;
//         const message = error instanceof ApiError ? error.message : "Internal server error";

//         return res.status(statusCode).json({
//             success: false,
//             message: message
//         });
//     }
// };

// export const authorizeRole = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             throw new ApiError(403, "Forbidden: Access denied");
//         }
//         next();
//     };
// };

// // Optional authentication - doesn't fail if no token provided
// export const optionalAuthentication = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;
//         const tokenFromHeader = authHeader?.startsWith("Bearer ")
//             ? authHeader.split(" ")[1]
//             : null;

//         const jwtToken = req.cookies?.jwtToken || tokenFromHeader;

//         // If no token, continue without user
//         if (!jwtToken) {
//             req.user = null;
//             return next();
//         }

//         // Verify token
//         const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
//         const userId = decoded.userId || decoded._id || decoded.sub || decoded.id;

//         if (!userId) {
//             req.user = null;
//             return next();
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             req.user = null;
//             return next();
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         // On any error, just continue without user (don't block the request)
//         logger.debug("Optional auth failed, continuing without user", {
//             error: error.message
//         });
//         req.user = null;
//         next();
//     }
// };

// // Export the middleware with both names for compatibility
// export const authMiddleware = authentication;


import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

// Middleware
export const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const jwtToken = req.cookies?.jwtToken || tokenFromHeader;

    // Only throw if this is a protected route (all routes except login/register/OTP/reset)
    const publicPaths = [
      "/api/v1/auth/login",
      "/api/v1/auth/register",
      "/api/v1/auth/send-otp",
      "/api/v1/auth/verify-otp",
      "/api/v1/auth/forget-password",
      "/api/v1/auth/reset-password",
    ];

    const isPublicRoute = publicPaths.some((path) =>
      req.originalUrl.startsWith(path)
    );

    if (!jwtToken) {
      if (isPublicRoute) {
        // Public routes can continue without a token
        req.user = null;
        return next();
      } else {
        throw new ApiError(401, "Authentication token is required");
      }
    }

    // Verify token
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Try multiple field names for user ID
    const userId = decoded.userId || decoded._id || decoded.sub || decoded.id;

    if (!userId) {
      throw new ApiError(401, "Invalid token payload - missing user identifier");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "Invalid token - user not found");
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    logger.error("Authentication middleware error", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: "Token expired", errorMessage: error.message });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: "Invalid token", errorMessage: error.message });
    }

    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : "Internal server error";

    return res.status(statusCode).json({ success: false, message });
  }
};

// Role-based authorization middleware
export const authorizeRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized - no user found");
  }
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, "Forbidden: Access denied");
  }
  next();
};

// Optional authentication (does not block even if token missing or invalid)
export const optionalAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const jwtToken = req.cookies?.jwtToken || tokenFromHeader;

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
    logger.debug("Optional auth failed, continuing without user", { error: error.message });
    req.user = null;
    next();
  }
};

// Export default
export const authMiddleware = authentication;
