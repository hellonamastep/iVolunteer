import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('Cloudinary Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'undefined');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'undefined');

// Validate required environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME environment variable is required');
}
if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error('CLOUDINARY_API_KEY environment variable is required');
}
if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_API_SECRET environment variable is required');
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configured successfully');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine folder based on field name
        let folder = 'iVolunteer_posts';
        if (file.fieldname === 'coverImage') {
            folder = 'iVolunteer_donations/covers';
        } else if (file.fieldname === 'governmentId') {
            folder = 'iVolunteer_donations/verification/govt_id';
        } else if (file.fieldname === 'proofOfNeed') {
            folder = 'iVolunteer_donations/verification/proof';
        } else if (file.fieldname === 'supportingMedia') {
            folder = 'iVolunteer_donations/media';
        }
        
        return {
            folder: folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
            transformation: [{ width: 1000, crop: "limit" }],
            public_id: `${file.fieldname}_${Date.now()}_${Math.round(Math.random() * 1e9)}`
        };
    }
});

// Create multer upload middleware
const upload = multer({ storage: storage });

// Utility function to delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

export {
    upload,
    cloudinary,
    deleteImage
};