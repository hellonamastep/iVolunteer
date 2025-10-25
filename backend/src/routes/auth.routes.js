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

router.post("/check-email", authController.checkEmail);
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
router.post("/resend-otp", otpController.resendOtp);

// Add this route
router.post("/check-email", authController.checkEmail);

// OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// at top of file
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND}/login?oauth=failed`,
  }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // FE is localhost:3000 or vercel, BE is onrender → cross-site always
    const cookieOpts = {
      httpOnly: true,
      secure: true,      // Render is HTTPS
      sameSite: "none",  // required for cross-site
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // single, consistent cookie name that middleware reads
    res.cookie("access_token", token, cookieOpts);

    // optional: clear legacy names if previously set
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("jwtToken", { path: "/" });

    res.redirect(`${FRONTEND}/callback?linked=${user._linkedFromEmail ? "true" : "false"}`);
  }
);

export default router;
