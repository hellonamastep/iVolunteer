import { blogService } from "../services/blogs.service.js";
export const createBlog = async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      // Replace backslashes with forward slashes
      imageUrl = req.file.path.replace(/\\/g, "/");
    }

    const blogData = { ...req.body, imageUrl };

    const blog = await blogService.createBlog(blogData);
    res.status(201).json({ success: true, message: "Blog created successfully", blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlog = async (req, res) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await blogService.updateBlog(req.params.id, req.body);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res
      .status(200)
      .json({ success: true, message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const deleted = await blogService.deleteBlog(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await blogService.getBlogBySlug(req.params.slug);
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

