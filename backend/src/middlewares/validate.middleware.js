import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            console.log("🔍 [VALIDATION] Starting validation for:", req.path);
            console.log("📦 [VALIDATION] Request body:", JSON.stringify(req.body, null, 2));
            
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                allowUnknown: true,
                stripUnknown: true
            });

            if (error) {
                const errorMessages = error.details.map(detail => detail.message);
                
                console.error("❌ [VALIDATION] Validation failed!");
                console.error("📋 [VALIDATION] Error details:", error.details);
                console.error("🔴 [VALIDATION] Error messages:", errorMessages);
                console.error("📍 [VALIDATION] Failed fields:", error.details.map(d => d.path.join('.')));
                
                logger.warn("Validation failed", {
                    path: req.path,
                    method: req.method,
                    errors: errorMessages,
                    body: req.body
                });

                // Return detailed error response that will be visible in frontend console
                return res.status(400).json({
                    success: false,
                    message: `Validation error: ${errorMessages.join(', ')}`,
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        type: detail.type
                    })),
                    validationSource: 'BACKEND_JOI_VALIDATOR',
                    timestamp: new Date().toISOString(),
                    requestedData: req.body
                });
            }

            console.log("✅ [VALIDATION] Validation passed successfully");
            console.log("📝 [VALIDATION] Validated data:", JSON.stringify(value, null, 2));

            // Replace request body with validated and sanitized data
            req.body = value;
            next();
        } catch (error) {
            console.error("💥 [VALIDATION] Validation middleware error:", error);
            logger.error("Validation middleware error", {
                error: error.message,
                stack: error.stack,
                path: req.path,
                method: req.method
            });

            const statusCode = error instanceof ApiError ? error.statusCode : 500;
            const message = error instanceof ApiError ? error.message : "Validation failed";
            
            return res.status(statusCode).json({
                success: false,
                message,
                validationSource: 'BACKEND_MIDDLEWARE_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    };
};