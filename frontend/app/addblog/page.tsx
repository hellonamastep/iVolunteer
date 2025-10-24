"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useBlog } from "@/contexts/blog-context";
import {
  Loader2,
  Upload,
  FileText,
  User,
  Image as ImageIcon,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

const AddBlogPage: React.FC = () => {
  const { addBlog } = useBlog();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [blogMetadata, setBlogMetadata] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ text: "File size must be less than 10MB", type: 'error' });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ text: "Please select an image file", type: 'error' });
        return;
      }

      setImageFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setMessage(null);
    }
  };

  // Add tag functionality
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("content", content);
      formData.append("blogMetadata", blogMetadata);
      
      // Add tags as array
      tags.forEach(tag => {
        formData.append("tags", tag);
      });
      
      if (imageFile) formData.append("image", imageFile);

      await addBlog(formData);

      setMessage({ text: "Blog published successfully!", type: 'success' });
      
      // Reset form
      setTitle("");
      setAuthor("");
      setContent("");
      setBlogMetadata("");
      setTags([]);
      setCurrentTag("");
      setImageFile(null);
      setImagePreview("");

      // Clear file input
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error('Blog creation error:', error);
      setMessage({ 
        text: `Failed to publish blog: ${error.message || 'Unknown error'}`,
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">
              Create New Blog Post
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Craft your masterpiece and share inspiring stories with our global community
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Field */}
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  Blog Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a compelling blog title..."
                  required
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white placeholder-gray-400"
                />
              </div>

              {/* Author Field */}
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter your name..."
                  required
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white placeholder-gray-400"
                />
              </div>

              {/* Blog Metadata Field - 160 CHARACTERS */}
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 font-bold">M</span>
                  </div>
                  Blog Metadata
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Max 160 characters - for SEO/social media)
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    value={blogMetadata}
                    onChange={(e) => setBlogMetadata(e.target.value)}
                    placeholder="Brief description for search engines and social media..."
                    maxLength={160}
                    rows={3}
                    className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white placeholder-gray-400 resize-none"
                  />
                  <div className="absolute right-3 bottom-3 text-sm text-gray-500 bg-white px-2 py-1 rounded">
                    {blogMetadata.length}/160
                  </div>
                </div>
                {blogMetadata.length >= 140 && (
                  <p className={`text-sm mt-1 ${
                    blogMetadata.length === 160 ? 'text-red-500' : 'text-yellow-600'
                  }`}>
                    {blogMetadata.length === 160 
                      ? 'Maximum 160 characters reached' 
                      : `${160 - blogMetadata.length} characters remaining`
                    }
                  </p>
                )}
              </div>

              {/* Content Field - BIGGER SPACE */}
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  Blog Content
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Use the image button to add images within your content)
                  </span>
                </label>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden min-h-[500px] relative">
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-green-600" />
                  </div>
                  Featured Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200 bg-gray-50/50">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          Upload Featured Image
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                {imageFile && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <p className="text-green-700 font-medium flex items-center gap-2 text-sm">
                        <ImageIcon className="w-4 h-4" />
                        {imageFile.name}
                        <span className="text-green-600 text-xs">
                          ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Field - MOVED TO BOTTOM */}
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Tag className="w-5 h-5 text-green-600" />
                  </div>
                  Tags
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Press Enter to add tags)
                  </span>
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag and press Enter..."
                      className="flex-1 px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-200"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Tags Display */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-base hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Publish Blog Post
                  </>
                )}
              </button>

              {/* Message */}
              {message && (
                <div
                  className={`p-4 rounded-xl text-center font-semibold border ${
                    message.type === 'success'
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlogPage;