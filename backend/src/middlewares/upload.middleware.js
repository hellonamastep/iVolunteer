import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ngo-events", // all event images go in this folder
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      // Generate a unique public ID for each file
      return `event_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    }
  },
});

export const upload = multer({ storage });
