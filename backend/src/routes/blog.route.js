// routes/blog.routes.js
import express from "express";
import multer from "multer";
import { 
  createBlog, 
  getBlogs, 
  getBlog, 
  updateBlog, 
  deleteBlog,
  getBlogBySlug,
  uploadContentImage
} from "../controllers/blog.controller.js";
import { authMiddleware, authorizeRole } from "../middlewares/auth.middleware.js";

const blogRouter = express.Router();

// Multer setup for blog images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/blogs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Public routes
blogRouter.get("/allblogs", getBlogs);
blogRouter.get("/:id", getBlog);
blogRouter.get("/slug/:slug", getBlogBySlug);

// Image upload endpoint (for content images)
blogRouter.post("/upload-image", authMiddleware, authorizeRole('admin'), upload.single("image"), uploadContentImage);

// Protected routes (admin only)
blogRouter.post("/addblog", authMiddleware, authorizeRole('admin'), upload.fields([
  { name: "image", maxCount: 1 }, // Featured image
  { name: "contentImages", maxCount: 10 } // Content images
]), createBlog);

blogRouter.put("/:id", authMiddleware, authorizeRole('admin'), upload.single("image"), updateBlog);
blogRouter.delete("/delete/:id", authMiddleware, authorizeRole('admin'), deleteBlog);

export default blogRouter;