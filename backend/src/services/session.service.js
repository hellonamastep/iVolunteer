import { Session } from "../models/Session.js";
import { generateJwtToken, tokenExpiresAt } from "../utils/jwt.utils.js";
import { hashToken } from "../utils/password.utils.js";

import { logger } from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js";

export const createSession = async (user) => {
    try {
        const {accessToken, refreshToken: rawToken} = generateJwtToken(user)
    
        const hashedToken = hashToken(rawToken)
    
        const expiresAt = tokenExpiresAt();
    
        const session = new Session({
            userId: user._id || user.id,
            refreshToken: hashedToken,
            expiresAt
        });
        
        await session.save();
    
        return {accessToken, refreshToken: rawToken}
    } catch (error) {
        logger.error("Error while creating session", {message: error.message, stack: error.stack})
        throw new ApiError(500, "Error while creating session")
    }
}

const getSessionByRefreshToken = async(refreshToken) => {
    const hashedToken = hashToken(refreshToken)
    const session = await Session.findOne({refreshToken: hashedToken})

    if(!session || session.expiresAt.getTime() < Date.now()) {
        throw new ApiError(401, "Session not found or refresh token is expired")
    };

    return session;
}

export const refreshAccessToken = async (refreshToken) => {
    const session = await getSessionByRefreshToken(refreshToken)

    const {accessToken, refreshToken: rawRefreshToken} = generateJwtToken(session.userId);

    const newRefreshToken = hashToken(rawRefreshToken);

    session.refreshToken = newRefreshToken;
    session.expiresAt = tokenExpiresAt();

    await session.save()

    return {accessToken, refreshToken: rawRefreshToken}
}
