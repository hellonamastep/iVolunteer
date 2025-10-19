import express from 'express';
import multer from 'multer';
import { 
    createGroup, 
    getGroups, 
    getUserGroups, 
    getGroup, 
    joinGroup, 
    leaveGroup, 
    sendMessage, 
    getMessages, 
    deleteGroup,
    updateGroup,
    promoteMemberToAdmin,
    demoteMemberFromAdmin,
    removeMemberFromGroup,
    updateGroupStatus,
    getPendingGroups
} from '../controllers/group.controller.js';
import { authentication, optionalAuthentication, authorizeRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Routes with optional authentication (works for both logged in and non-logged in users)
router.get('/', optionalAuthentication, getGroups); // Get all public groups
router.get('/:groupId', optionalAuthentication, getGroup); // Get single group details

// Protected routes (require authentication)
router.use(authentication);

// Group management routes
router.post('/', upload.single('image'), createGroup); // Create new group
router.put('/:groupId', updateGroup); // Update group details (host only)
router.delete('/:groupId', deleteGroup); // Delete group (creator only)

// User-specific routes
router.get('/user/my-groups', getUserGroups); // Get user's groups

// Group interaction routes
router.post('/:groupId/join', joinGroup); // Join a group
router.post('/:groupId/leave', leaveGroup); // Leave a group

// Admin management routes (host only)
router.post('/:groupId/members/:memberId/promote', promoteMemberToAdmin); // Promote member to admin
router.post('/:groupId/members/:memberId/demote', demoteMemberFromAdmin); // Demote admin to member
router.delete('/:groupId/members/:memberId', removeMemberFromGroup); // Remove member from group (host only)

// Message routes
router.post('/:groupId/messages', upload.single('image'), sendMessage); // Send message
router.get('/:groupId/messages', getMessages); // Get group messages

// Admin routes (require admin role)
router.get('/admin/pending', authentication, authorizeRole('admin'), getPendingGroups); // Get all pending groups
router.put('/admin/:groupId/status', authentication, authorizeRole('admin'), updateGroupStatus); // Approve/reject group

export default router;