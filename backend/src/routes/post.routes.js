import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../config/cloudinary.js';
import {
    createPost,
    getPosts,
    getCategories,
    addComment,
    deleteComment,
    toggleReaction,
    updatePost,
    deletePost
} from '../controllers/post.controller.js';

const router = express.Router();

// Get all post categories (public route)
router.get('/categories', getCategories);

// Get all posts (requires authentication to filter by user's city)
router.get('/', authMiddleware, getPosts);

// Protected routes (require authentication)
router.post('/', authMiddleware, upload.single('image'), createPost);
router.put('/:postId', authMiddleware, upload.single('image'), updatePost);
router.post('/:postId/comments', authMiddleware, addComment);
router.delete('/:postId/comments/:commentId', authMiddleware, deleteComment);
router.post('/:postId/reactions', authMiddleware, toggleReaction);
router.delete('/:postId', authMiddleware, deletePost);

export default router;
