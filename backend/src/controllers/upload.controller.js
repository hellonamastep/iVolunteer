import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Upload a single image to Cloudinary
 * @route POST /api/v1/upload/single
 * @access Private (requires authentication)
 */
export const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  // Cloudinary middleware automatically uploads the file
  // The file info is in req.file
  const imageData = {
    url: req.file.path, // Cloudinary URL
    publicId: req.file.filename, // Cloudinary public ID
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  };

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    ...imageData,
  });
});
