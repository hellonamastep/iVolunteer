"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import api from "@/lib/api";

export interface Blog {
  _id: string;
  title: string;
  author: string;
  content: string;
  imageUrl?: string; // Backend field
  createdAt: string;
}

interface BlogContextType {
  blogs: Blog[];
  addBlog: (formData: FormData) => Promise<void>;
  getAllBlogs: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const addBlog = async (formData: FormData): Promise<void> => {
    await api.post("/v1/blogs/addblog", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await getAllBlogs();
  };

const getAllBlogs = async (): Promise<void> => {
  try {
    const res = await api.get<{ success: boolean; blogs: Blog[] }>("/v1/blogs/allblogs");

    const blogsWithUrl = res.data.blogs.map((blog) => {
      let imageUrl = blog.imageUrl;

      if (imageUrl) {
        // ✅ Replace backslashes (Windows paths)
        imageUrl = imageUrl.replace(/\\/g, "/");

        // ✅ If it's not a full URL, prefix with backend host
        if (!imageUrl.startsWith("http")) {
          imageUrl = `http://localhost:5000/${imageUrl}`;
        }
      }

      return {
        ...blog,
        imageUrl,
      };
    });

    setBlogs(blogsWithUrl);
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
  }
};



  return (
    <BlogContext.Provider value={{ blogs, addBlog, getAllBlogs }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (!context) throw new Error("useBlog must be used within a BlogProvider");
  return context;
};
