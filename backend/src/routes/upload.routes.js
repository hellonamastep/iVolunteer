import express from "express";
import { upload } from "../config/cloudinary.js";
import { uploadSingleImage } from "../controllers/upload.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/v1/upload/single
 * @desc    Upload a single image to Cloudinary
 * @access  Private
 */
router.post("/single", authentication, upload.single("image"), uploadSingleImage);

export default router;
