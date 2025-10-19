import express from 'express';
import { upload } from '../config/cloudinary.js';
import { testCloudinaryConnection, testCloudinaryUpload } from '../controllers/test.controller.js';

const router = express.Router();

// Test Cloudinary connection
router.get('/cloudinary/connection', testCloudinaryConnection);

// Test file upload to Cloudinary
router.post('/cloudinary/upload', upload.single('image'), testCloudinaryUpload);

export default router;