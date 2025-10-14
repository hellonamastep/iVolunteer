"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useBlog } from "@/contexts/blog-context";
import api from "@/lib/api";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const ManageBlogs = () => {
  const { blogs, getAllBlogs } = useBlog();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAllBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      setDeletingId(id);
      await api.delete(`/v1/blogs/delete/${id}`);
      toast.success("Blog deleted successfully!");
      await getAllBlogs(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Blogs</h1>

      {blogs.length === 0 ? (
        <p className="text-center text-gray-500">No blogs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition hover:shadow-lg"
            >
              {/* Blog Image */}
              <div className="relative w-full h-48">
                <Image
                  src={blog.imageUrl || "/default-blog.jpg"}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Blog Info */}
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  By {blog.author} •{" "}
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700 text-sm flex-1 line-clamp-3">
                  {blog.content}
                </p>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(blog._id)}
                  disabled={deletingId === blog._id}
                  className={`mt-4 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                    deletingId === blog._id
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  <Trash2 size={16} />
                  {deletingId === blog._id ? "Deleting..." : "Delete Blog"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ManageBlogs;
