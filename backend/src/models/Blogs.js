import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    content: { 
      type: String, 
      required: true 
    },
    author: { 
      type: String, 
      default: "Admin" 
    },
    imageUrl: { 
      type: String 
    },
    contentImages: [
      {
        url: String,
        caption: String,
        position: Number,
      },
    ],
    category: { 
      type: String 
    },
    tags: [{ 
      type: String 
    }],
    isPublished: { 
      type: Boolean, 
      default: true 
    },
    
    // BLOG METADATA - Limited to 50 characters
    blogMetadata: {
      type: String,
      trim: true,
      maxlength: [50, "Blog metadata cannot exceed 50 characters"],
      validate: {
        validator: function(v) {
          return v.length <= 50;
        },
        message: "Blog metadata must be 50 characters or less"
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);