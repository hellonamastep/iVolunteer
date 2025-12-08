"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import api from "@/lib/api";

export interface Blog {
  _id: string;
  title: string;
  author: string;
  content: string;
  imageUrl?: string;
  blogMetadata?: string;
  tags?: string[]; // Add this
  contentImages?: Array<{
    url: string;
    caption: string;
    position: number;
  }>;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  blogs?: T[];
  blog?: T;
  imageUrl?: string;
}

interface ImageUploadResponse {
  success: boolean;
  message?: string;
  imageUrl: string;
}

interface BlogContextType {
  blogs: Blog[];
  addBlog: (formData: FormData) => Promise<void>;
  getAllBlogs: () => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const addBlog = async (formData: FormData): Promise<void> => {
    try {
      console.log('Sending blog data...');
      
      // Log form data contents for debugging
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}, ${value.type}, ${value.size} bytes`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await api.post<ApiResponse<Blog>>("/v1/blogs/addblog", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
      });

      console.log('Response received:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create blog");
      }

      await getAllBlogs();
    } catch (error: any) {
      console.error('Blog creation error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('Uploading image:', file.name, file.type, file.size);

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post<ImageUploadResponse>("/v1/blogs/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('Image upload response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload image");
      }

      let imageUrl = response.data.imageUrl;
      
      if (!imageUrl) {
        throw new Error("No image URL returned from server");
      }
      
      // Process image URL for frontend display
      imageUrl = imageUrl.replace(/\\/g, "/");
      if (!imageUrl.startsWith("http")) {
        const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'https://api.namastep.com/api').replace(/\/api$/, '');
        imageUrl = `${API_HOST}/${imageUrl}`;
      }

      return imageUrl;
    } catch (error: any) {
      console.error('Image upload error:', error.response?.data || error.message);
      throw error;
    }
  };

  const getAllBlogs = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<Blog>>("/v1/blogs/allblogs");

      if (!response.data.success || !response.data.blogs) {
        console.error("Failed to fetch blogs:", response.data.message);
        return;
      }

      const blogsWithUrl = response.data.blogs.map((blog) => {
        let imageUrl = blog.imageUrl;

        if (imageUrl) {
          imageUrl = imageUrl.replace(/\\/g, "/");
          if (!imageUrl.startsWith("http")) {
            const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'https://api.namastep.com/api').replace(/\/api$/, '');
            imageUrl = `${API_HOST}/${imageUrl}`;
          }
        }

        // Process content images
        const contentImages = blog.contentImages?.map(img => {
          let processedUrl = img.url.replace(/\\/g, "/");
          if (!processedUrl.startsWith("http")) {
            const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'https://api.namastep.com/api').replace(/\/api$/, '');
            processedUrl = `${API_HOST}/${processedUrl}`;
          }
          return {
            ...img,
            url: processedUrl
          };
        }) || [];

        return {
          ...blog,
          imageUrl,
          contentImages
        };
      });

      setBlogs(blogsWithUrl);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  };

  return (
    <BlogContext.Provider value={{ blogs, addBlog, getAllBlogs, uploadImage }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (!context) throw new Error("useBlog must be used within a BlogProvider");
  return context;
};