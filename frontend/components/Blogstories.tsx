"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlog } from "@/contexts/blog-context";

const Blogstories = () => {
  const { blogs, getAllBlogs } = useBlog();

  useEffect(() => {
    getAllBlogs();
  }, []);

  // Function to extract plain text from HTML for the excerpt
  const getPlainTextExcerpt = (html: string, maxLength: number = 150) => {
    // Remove HTML tags and get plain text
    const plainText = html.replace(/<[^>]*>/g, '');
    
    // Trim to maxLength and add ellipsis if needed
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  if (!blogs.length)
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No blogs available yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Check back later for inspiring stories
          </p>
        </div>
      </div>
    );

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Inspiring <span className="text-green-600">Stories</span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover compelling narratives and insights from our community of
          writers and thought leaders
        </p>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <Link key={blog._id} href={`/blogs/${blog._id}`}>
            <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <Image
                  src={blog.imageUrl || "/default-blog.jpg"}
                  alt={blog.title}
                  width={400}
                  height={280}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                    Story
                  </span>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                  {blog.title}
                </h3>

                {/* Excerpt - Fixed to show plain text */}
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  {getPlainTextExcerpt(blog.content)}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    {/* Author Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {blog.author?.charAt(0) || "A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {blog.author}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Read More Arrow */}
                  <div className="w-10 h-10 rounded-full bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors duration-300">
                    <svg
                      className="w-5 h-5 text-green-600 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
          Load More Stories
        </button>
      </div>
    </section>
  );
};

export default Blogstories;