import { cloudinary } from '../config/cloudinary.js';

// Test Cloudinary connection
export const testCloudinaryConnection = async (req, res) => {
    try {
        // Simple test to check if Cloudinary is properly configured
        const result = await cloudinary.api.ping();
        
        res.status(200).json({
            success: true,
            message: 'Cloudinary connection successful',
            status: result.status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Cloudinary connection test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Cloudinary connection failed',
            error: error.message
        });
    }
};

// Test file upload to Cloudinary
export const testCloudinaryUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully to Cloudinary',
            file: {
                url: req.file.path,
                filename: req.file.filename,
                size: req.file.size,
                format: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('File upload test failed:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: error.message
        });
    }
};