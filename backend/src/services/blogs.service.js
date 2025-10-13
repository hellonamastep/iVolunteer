import Blogs from "../models/Blogs.js";

const createBlog = async (blogData) => {
  const blog = new Blogs(blogData);
  return await blog.save();
};

const getAllBlogs = async () => {
  return await Blogs.find().sort({ createdAt: -1 });
};

const getBlogBySlug = async (slug) => {
  return await Blogs.findOne({ slug });
};

const getBlogById = async (id) => {
  return await Blogs.findById(id);
};

const updateBlog = async (id, updateData) => {
  return await Blogs.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteBlog = async (id) => {
  return await Blogs.findByIdAndDelete(id);
};

export const blogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
   getBlogBySlug,
};
