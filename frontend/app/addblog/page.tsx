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
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

const AddBlogPage: React.FC = () => {
  const { addBlog } = useBlog();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      await addBlog(formData);

      setMessage("Blog published successfully!");
      setTitle("");
      setAuthor("");
      setContent("");
      setImageFile(null);
      setImagePreview("");

      // Clear file input
      const fileInput = document.getElementById(
        "image-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      setMessage(`Failed to publish blog: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Function to extract plain text from HTML for preview
  const getPlainTextExcerpt = (html: string, maxLength: number = 120) => {
    if (!html) return "Your engaging content will be previewed here in real-time as you write...";
    
    // Remove HTML tags and get plain text
    const plainText = html.replace(/<[^>]*>/g, '');
    
    // Trim to maxLength and add ellipsis if needed
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
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
          <div className="grid xl:grid-cols-3">
            {/* Preview Panel - Fixed overflow */}
            <div className="xl:col-span-1 bg-gradient-to-br from-green-50 to-blue-50 p-8 border-r border-gray-100">
              <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                Live Preview
              </h3>
              
              <div className="space-y-6">
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-gray-300 h-48 bg-gray-50 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-base font-medium">Featured image preview</p>
                    </div>
                  </div>
                )}
                
                {/* Preview Content - Fixed overflow */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                  <div className="space-y-4">
                    <h4 className="font-bold text-xl text-gray-900 leading-tight line-clamp-2 min-h-[3rem]">
                      {title || "Your compelling blog title will appear here"}
                    </h4>
                    
                    {/* Fixed content preview - using plain text to prevent overflow */}
                    <div className="min-h-[100px]">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                        {getPlainTextExcerpt(content)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {author?.charAt(0) || "A"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {author || "Author Name"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-50 rounded-full flex-shrink-0">
                        <span className="text-green-700 text-sm font-medium">5 min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Panel - Wider content field */}
            <div className="xl:col-span-2 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Field - Normal size */}
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

                {/* Author Field - Normal size */}
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

                {/* Content Field - Wider and larger */}
                <div className="xl:col-span-2">
                  <label className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    Blog Content
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden min-h-[400px]">
                    <RichTextEditor value={content} onChange={setContent} />
                  </div>
                </div>

                {/* File Upload - Normal size */}
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
                      <p className="text-green-700 font-medium flex items-center gap-2 text-sm">
                        <ImageIcon className="w-4 h-4" />
                        {imageFile.name}
                        <span className="text-green-600 text-xs">
                          ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button - Normal size */}
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

                {/* Message - Normal size */}
                {message && (
                  <div
                    className={`p-4 rounded-xl text-center font-semibold border ${
                      message.includes("successfully")
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Tips - Normal size */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
            Writing Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>Hook readers immediately</strong> with a powerful opening.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>Use subheadings</strong> to break content into sections.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>Include visuals</strong> to enhance engagement.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">4</span>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>Tell stories</strong> to create emotional connections.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">5</span>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>End with value</strong> - provide actionable takeaways.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">6</span>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>Optimize for SEO</strong> with relevant keywords.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlogPage;