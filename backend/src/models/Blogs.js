import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // new field
    content: { type: String, required: true },
    author: { type: String, default: "Admin" },
    imageUrl: { type: String },
    category: { type: String },
    tags: [String],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
blogSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();
  this.slug = this.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  next();
});

export default mongoose.model("Blog", blogSchema);
