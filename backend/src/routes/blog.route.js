import express from "express";
import multer from "multer";
import { 
  createBlog, 
  getBlogs, 
  getBlog, 
  updateBlog, 
  deleteBlog,
  getBlogBySlug 
} from "../controllers/blog.controller.js";
import { authMiddleware, authorizeRole } from "../middlewares/auth.middleware.js";

const blogRouter = express.Router();

// Multer setup for blog images
const upload = multer({
  dest: "uploads/blogs/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// Public routes
blogRouter.get("/allblogs", getBlogs);
blogRouter.get("/:id", getBlog);


// Protected routes (admin only)
blogRouter.post("/addblog",authMiddleware,authorizeRole('admin'), upload.single("image"), createBlog);
blogRouter.put("/:id",authMiddleware,authorizeRole('admin'), upload.single("image"), updateBlog);
blogRouter.delete("/delete/:id",authMiddleware,authorizeRole('admin'), deleteBlog);
blogRouter.get("/slug/:slug", getBlogBySlug);

export default blogRouter;
