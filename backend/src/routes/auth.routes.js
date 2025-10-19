// routes/auth.routes.js
import { Router } from "express";
import jwt from "jsonwebtoken";

// controllers/middleware
import { authController } from "../controllers/auth.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
import { refreshAccessTokenController } from "../controllers/session.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authValidator } from "../validators/auth.validators.js";
import { upload } from "../config/cloudinary.js";
import { otpController } from "../controllers/otp.controller.js";

// IMPORTANT: import the configured passport instance
import passport from "../config/passport.js"; // <-- not "passport"

const router = Router();

router.post("/register", validate(authValidator.registerSchema), authController.register);
router.post("/login", validate(authValidator.loginSchema), authController.login);
router.post("/logout", authentication, authController.logout);
router.post("/change-password", authentication, authController.changePassword);
router.post("/forget-password", authController.forgetPasswordRequest);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/user", authentication, authController.getUser);
router.put("/profile", authentication, authController.updateProfile);
router.post("/upload-profile-picture", authentication, upload.single("profilePicture"), authController.uploadProfilePicture);
router.delete("/profile-picture", authentication, authController.removeProfilePicture);
router.delete("/account", authentication, authController.deleteAccount);
router.post("/refresh-access-token", refreshAccessTokenController);
router.post("/send-otp", otpController.sendOtp);
router.post("/verify-otp", otpController.verifyOtp);

// OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    // Access token only; add a refresh token flow if you need one
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Cookie options differ in dev vs prod
    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,                  // HTTPS only in prod
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // Set both names for compatibility with existing middleware/clients
    res.cookie("accessToken", token, cookieOpts);
    res.cookie("jwtToken", token, cookieOpts);

    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    // Redirect to your callback page which stores user in localStorage then goes to dashboard
    // or send directly to /dashboard if you prefer.
    res.redirect(`${frontend}/callback?linked=${user._linkedFromEmail ? "true" : "false"}`);
  }
);
export default router;
