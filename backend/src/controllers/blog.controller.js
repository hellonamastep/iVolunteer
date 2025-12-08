import { blogService } from "../services/blogs.service.js";

// export const createBlog = async (req, res) => {
//   try {
//     console.log('Received blog creation request');
//     console.log('Request body:', req.body);
//     console.log('Request files:', req.files);

//     let imageUrl = null;
//     let contentImages = [];

//     // Handle featured image
//     if (req.files && req.files.image) {
//       imageUrl = req.files.image[0].path.replace(/\\/g, "/");
//       console.log('Featured image URL:', imageUrl);
//     }

//     // Handle content images
//     if (req.files && req.files.contentImages) {
//       contentImages = req.files.contentImages.map((file, index) => ({
//         url: file.path.replace(/\\/g, "/"),
//         caption: "",
//         position: index
//       }));
//       console.log('Content images:', contentImages);
//     }

//     // Validate required fields
//     if (!req.body.title || !req.body.content) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Title and content are required" 
//       });
//     }

//     const blogData = { 
//       ...req.body, 
//       imageUrl,
//       contentImages
//     };

//     console.log('Creating blog with data:', blogData);

//     const blog = await blogService.createBlog(blogData);
    
//     res.status(201).json({ 
//       success: true, 
//       message: "Blog created successfully", 
//       blog 
//     });
//   } catch (error) {
//     console.error('Blog creation error:', error);
//     res.status(400).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

export const createBlog = async (req, res) => {
  try {
    let imageUrl = null;
    let contentImages = [];

    if (req.files && req.files.image) {
      imageUrl = req.files.image[0].path.replace(/\\/g, "/");
    }

    if (req.files && req.files.contentImages) {
      contentImages = req.files.contentImages.map((file, index) => ({
        url: file.path.replace(/\\/g, "/"),
        caption: "",
        position: index
      }));
    }

    // Validate blog metadata length
    if (req.body.blogMetadata && req.body.blogMetadata.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Blog metadata cannot exceed 50 characters"
      });
    }

    const blogData = { 
      ...req.body, 
      imageUrl,
      contentImages
    };

    const blog = await blogService.createBlog(blogData);
    res.status(201).json({ 
      success: true, 
      message: "Blog created successfully", 
      blog 
    });
  } catch (error) {
    if (error.message.includes("Blog metadata")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const uploadContentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const imageUrl = req.file.path.replace(/\\/g, "/");
    
    res.status(200).json({ 
      success: true, 
      imageUrl,
      message: "Image uploaded successfully" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

