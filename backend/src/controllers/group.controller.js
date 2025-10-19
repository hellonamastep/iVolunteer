import Group from '../models/Group.js';
import { User } from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, category, isPrivate, maxMembers, tags, allowMemberInvites, requireApproval } = req.body;
        const userId = req.user._id || req.user.id;

        // Check if user already has too many groups as creator
        const userGroupsCount = await Group.countDocuments({ creator: userId });
        if (userGroupsCount >= 10) {
            return res.status(400).json({ 
                success: false, 
                message: 'You can only create up to 10 groups' 
            });
        }

        // Get city from the logged-in user's profile (same as post creation flow)
        let city;
        let status = 'pending'; // Default status for regular users
        
        if (req.user.role === 'admin') {
            // Admin groups are auto-approved and set to 'global' city
            city = 'global';
            status = 'approved';
        } else if (req.user.role === 'user') {
            city = req.user.city;
        } else if (req.user.role === 'ngo' || req.user.role === 'corporate') {
            city = req.user.address?.city;
        }

        if (!city) {
            return res.status(400).json({ 
                success: false, 
                message: 'User must have a city set in their profile to create groups' 
            });
        }

        let imageUrl = null;
        let cloudinaryPublicId = null;

        // Handle image upload if provided
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'volunteer-groups',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' },
                        { quality: 'auto' }
                    ]
                });
                imageUrl = result.secure_url;
                cloudinaryPublicId = result.public_id;
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to upload group image' 
                });
            }
        }

        const group = new Group({
            name,
            description,
            creator: userId,
            category,
            city: city.trim(),
            status: status, // Admin groups are 'approved', others are 'pending'
            imageUrl,
            cloudinaryPublicId,
            isPrivate: isPrivate === 'true' || isPrivate === true,
            maxMembers: parseInt(maxMembers) || 100,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            settings: {
                allowMemberInvites: allowMemberInvites !== 'false',
                requireApproval: requireApproval === 'true' || requireApproval === true
            },
            members: [{
                user: userId,
                role: 'admin',
                joinedAt: new Date()
            }]
        });

        await group.save();
        await group.populate([
            { path: 'creator', select: 'name email' },
            { path: 'members.user', select: 'name email' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: group
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create group' 
        });
    }
};

// Get all groups (with pagination and filters)
export const getGroups = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            category, 
            search, 
            isPrivate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const userId = req.user?._id || req.user?.id;
        
        console.log('getGroups called:', {
            hasUser: !!req.user,
            userId: userId?.toString(),
            userObject: req.user ? { id: req.user._id || req.user.id } : 'no user'
        });

        let query = {};

        // Status filtering logic:
        // - Admin: See all groups (no status filter)
        // - Regular users: See approved groups OR their own groups (any status)
        if (req.user?.role !== 'admin' && userId) {
            query.$or = [
                { status: 'approved' },
                { creator: userId }, // Show creator's own groups regardless of status
                { 'members.user': userId } // Show groups where user is a member
            ];
        } else if (!userId) {
            // Not logged in - only show approved groups
            query.status = 'approved';
        }
        // If admin, no status filter is added (they see all)

        // Filter by category
        if (category && category !== 'All') {
            query.category = category;
        }

        // Filter by privacy
        if (isPrivate !== undefined) {
            query.isPrivate = isPrivate === 'true';
        } else {
            // By default, show only public groups unless user is member
            query.isPrivate = false;
        }

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const groups = await Group.find(query)
            .populate('creator', 'name email')
            .populate('members.user', 'name email')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Group.countDocuments(query);

        // Add member count and user-specific info to each group
        const groupsWithStats = groups.map(group => {
            const isCreator = userId && group.creator._id.toString() === userId.toString();
            const memberEntry = userId ? group.members.find(m => m.user._id.toString() === userId.toString()) : null;
            const isMember = isCreator || !!memberEntry;
            
            // Debug logging
            if (group.name) {
                console.log('Group membership check:', {
                    groupName: group.name,
                    userId: userId?.toString(),
                    creatorId: group.creator._id.toString(),
                    isCreator,
                    memberEntry: memberEntry ? 'found' : 'not found',
                    isMember,
                    totalMembers: group.members.length
                });
            }
            
            return {
                ...group,
                memberCount: group.members.length,
                recentActivity: group.updatedAt,
                isMember: isMember,
                userRole: isCreator ? 'creator' : (memberEntry?.role || null)
            };
        });

        // Prevent caching to ensure fresh membership data
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.json({
            success: true,
            data: groupsWithStats,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalGroups: total,
                hasMore: page * limit < total
            }
        });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch groups' 
        });
    }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { type = 'all' } = req.query; // 'created', 'joined', 'all'

        let query = {};

        if (type === 'created') {
            query.creator = userId;
        } else if (type === 'joined') {
            query = {
                'members.user': userId,
                creator: { $ne: userId }
            };
        } else {
            query = {
                $or: [
                    { creator: userId },
                    { 'members.user': userId }
                ]
            };
        }

        const groups = await Group.find(query)
            .populate('creator', 'name email')
            .populate('members.user', 'name email')
            .sort({ updatedAt: -1 })
            .lean();

        const groupsWithStats = groups.map(group => {
            const isCreator = group.creator.toString() === userId.toString();
            const memberEntry = group.members.find(m => m.user._id.toString() === userId.toString());
            
            return {
                ...group,
                memberCount: group.members.length,
                isMember: true, // They're always members if fetching user groups
                userRole: isCreator ? 'creator' : (memberEntry?.role || 'member')
            };
        });

        res.json({
            success: true,
            data: groupsWithStats
        });
    } catch (error) {
        console.error('Get user groups error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch user groups' 
        });
    }
};

// Get single group details
export const getGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user?._id || req.user?.id;

        const group = await Group.findById(groupId)
            .populate('creator', 'name email')
            .populate('members.user', 'name email')
            .populate('messages.sender', 'name email');

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if user can access this group
        if (group.isPrivate && userId && !group.isMember(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied to private group' 
            });
        }

        // Calculate user-specific data FIRST
        const isCreator = userId ? group.creator._id.toString() === userId.toString() : false;
        const memberEntry = userId ? group.members.find(m => m.user._id.toString() === userId.toString()) : null;
        const calculatedIsMember = userId ? (isCreator || !!memberEntry) : false;
        const calculatedUserRole = userId ? (
            isCreator ? 'creator' : (memberEntry?.role || null)
        ) : null;

        // Now build the response object
        const groupObj = group.toObject();
        const groupData = {
            ...groupObj,
            memberCount: group.members.length,
            // Override with calculated values
            userRole: calculatedUserRole,
            isMember: calculatedIsMember
        };

        // Prevent caching to ensure fresh membership data
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.json({
            success: true,
            data: groupData
        });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch group details' 
        });
    }
};

// Join a group
export const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id || req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        if (group.isMember(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are already a member of this group' 
            });
        }

        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group has reached maximum capacity' 
            });
        }

        const success = group.addMember(userId);
        if (!success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Failed to join group' 
            });
        }

        await group.save();
        await group.populate([
            { path: 'creator', select: 'name email' },
            { path: 'members.user', select: 'name email' }
        ]);

        const memberEntry = group.members.find(m => m.user._id.toString() === userId.toString());

        res.json({
            success: true,
            message: 'Successfully joined the group',
            data: {
                ...group.toObject(),
                memberCount: group.members.length,
                isMember: true,
                userRole: memberEntry?.role || 'member'
            }
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join group' 
        });
    }
};

// Leave a group
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id || req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        if (group.creator.toString() === userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group creator cannot leave. Transfer ownership or delete the group.' 
            });
        }

        const success = group.removeMember(userId);
        if (!success) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are not a member of this group' 
            });
        }

        await group.save();

        // Populate creator info for response
        await group.populate('creator', 'name email');

        res.json({
            success: true,
            message: 'Successfully left the group',
            data: {
                _id: group._id,
                memberCount: group.members.length,
                isMember: false,
                userRole: null
            }
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave group' 
        });
    }
};

// Send message to group
export const sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, messageType = 'text' } = req.body;
        const userId = req.user._id || req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        if (!group.isMember(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group members can send messages' 
            });
        }

        // Check if user is the group creator (host) or an admin
        if (!group.isAdmin(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Only the group host and admins can send messages'
            });
        }

        let imageUrl = null;
        let cloudinaryPublicId = null;

        // Handle image upload if file is provided
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'group-messages',
                    transformation: [
                        { width: 1200, height: 1200, crop: 'limit' },
                        { quality: 'auto' }
                    ]
                });
                imageUrl = result.secure_url;
                cloudinaryPublicId = result.public_id;

                // Delete temporary file after upload
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Failed to delete temporary file:', unlinkError);
                }
            } catch (uploadError) {
                console.error('Message image upload error:', uploadError);
                // Clean up temp file on error
                if (req.file?.path) {
                    try {
                        await fs.unlink(req.file.path);
                    } catch (unlinkError) {
                        console.error('Failed to delete temporary file:', unlinkError);
                    }
                }
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to upload message image' 
                });
            }
        }

        // Validate message has content or image
        if (!content && !imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Message must have text content or an image'
            });
        }

        const message = {
            sender: userId,
            content: content || '',
            messageType: imageUrl ? 'image' : 'text',
            imageUrl,
            cloudinaryPublicId,
            createdAt: new Date()
        };

        group.messages.push(message);
        group.updatedAt = new Date();
        await group.save();

        await group.populate('messages.sender', 'name email');
        const newMessage = group.messages[group.messages.length - 1];

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message' 
        });
    }
};

// Get group messages
export const getMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = req.user._id || req.user.id;

        console.log('Get Messages Debug:', {
            groupId,
            userId,
            userType: typeof userId,
            userObject: req.user
        });

        const group = await Group.findById(groupId)
            .populate('messages.sender', 'name email');

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if user can access messages (creator or member)
        const isMember = group.isMember(userId);
        const isCreator = group.creator.toString() === userId.toString();
        
        console.log('Access Check Debug:', {
            isMember,
            isCreator,
            creatorId: group.creator.toString(),
            userId: userId.toString(),
            membersCount: group.members.length,
            members: group.members.map(m => ({ user: m.user.toString(), role: m.role }))
        });

        if (!isMember && !isCreator) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group members can view messages' 
            });
        }

        // Sort messages by creation date (newest first for pagination)
        const sortedMessages = group.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

        // Prevent caching to ensure real-time message updates
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.json({
            success: true,
            data: paginatedMessages.reverse(), // Reverse to show oldest first in chat
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(group.messages.length / limit),
                totalMessages: group.messages.length,
                hasMore: endIndex < group.messages.length
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch messages' 
        });
    }
};

// Delete a group (only creator)
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id || req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        if (group.creator.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group creator can delete the group' 
            });
        }

        // Delete group image from cloudinary if exists
        if (group.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(group.cloudinaryPublicId);
            } catch (cloudinaryError) {
                console.error('Failed to delete group image from cloudinary:', cloudinaryError);
            }
        }

        // Delete message images from cloudinary
        for (const message of group.messages) {
            if (message.cloudinaryPublicId) {
                try {
                    await cloudinary.uploader.destroy(message.cloudinaryPublicId);
                } catch (cloudinaryError) {
                    console.error('Failed to delete message image from cloudinary:', cloudinaryError);
                }
            }
        }

        await Group.findByIdAndDelete(groupId);

        res.json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete group' 
        });
    }
};

// Update group details (host only)
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, category, tags, isPrivate, maxMembers, settings } = req.body;
        const userId = req.user._id || req.user.id;

        const group = await Group.findById(groupId)
            .populate('creator', 'name email')
            .populate('members.user', 'name email');

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Only the creator/host can update the group
        if (group.creator._id.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group host can update group details' 
            });
        }

        // Update fields if provided
        if (name !== undefined && name.trim()) {
            group.name = name.trim();
        }

        if (description !== undefined && description.trim()) {
            group.description = description.trim();
        }

        if (category !== undefined && category.trim()) {
            group.category = category.trim();
        }

        if (tags !== undefined) {
            // Handle tags as array or comma-separated string
            if (Array.isArray(tags)) {
                group.tags = tags.map(tag => tag.trim()).filter(tag => tag);
            } else if (typeof tags === 'string') {
                group.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
        }

        if (isPrivate !== undefined) {
            group.isPrivate = Boolean(isPrivate);
        }

        if (maxMembers !== undefined) {
            const maxMem = parseInt(maxMembers);
            if (maxMem >= 2 && maxMem <= 500) {
                group.maxMembers = maxMem;
            }
        }

        if (settings !== undefined && typeof settings === 'object') {
            if (settings.allowMemberInvites !== undefined) {
                group.settings.allowMemberInvites = Boolean(settings.allowMemberInvites);
            }
            if (settings.requireApproval !== undefined) {
                group.settings.requireApproval = Boolean(settings.requireApproval);
            }
        }

        group.updatedAt = new Date();
        await group.save();

        const isCreator = group.creator._id.toString() === userId.toString();
        const memberEntry = group.members.find(m => {
            const mId = m.user._id ? m.user._id.toString() : m.user.toString();
            return mId === userId.toString();
        });

        res.json({
            success: true,
            message: 'Group updated successfully',
            data: {
                ...group.toObject(),
                memberCount: group.members.length,
                isMember: true,
                userRole: isCreator ? 'creator' : (memberEntry?.role || 'member')
            }
        });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update group' 
        });
    }
};

// Promote member to admin (host only)
export const promoteMemberToAdmin = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user._id || req.user.id;

        const group = await Group.findById(groupId)
            .populate('creator', 'name email')
            .populate('members.user', 'name email');

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Only the creator/host can promote members
        if (group.creator._id.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group host can promote members to admin' 
            });
        }

        // Check if the member exists in the group
        const memberToPromote = group.members.find(m => m.user._id.toString() === memberId);
        if (!memberToPromote) {
            return res.status(404).json({ 
                success: false, 
                message: 'Member not found in this group' 
            });
        }

        // Check if member is already an admin
        if (memberToPromote.role === 'admin') {
            return res.status(400).json({ 
                success: false, 
                message: 'This member is already an admin' 
            });
        }

        // Check if we already have 2 additional admins (excluding the creator)
        const currentAdmins = group.members.filter(m => 
            m.role === 'admin' && m.user._id.toString() !== group.creator._id.toString()
        );

        if (currentAdmins.length >= 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'Maximum of 2 additional admins allowed. Demote an existing admin first.' 
            });
        }

        // Promote the member
        memberToPromote.role = 'admin';
        await group.save();

        res.json({
            success: true,
            message: 'Member promoted to admin successfully',
            data: {
                ...group.toObject(),
                memberCount: group.members.length,
                isMember: true,
                userRole: 'creator'
            }
        });
    } catch (error) {
        console.error('Promote member error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to promote member to admin' 
        });
    }
};

// Demote admin to member (host only)
export const demoteMemberFromAdmin = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user._id || req.user.id;

        const group = await Group.findById(groupId)
            .populate('creator', 'name email')
            .populate('members.user', 'name email');

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Only the creator/host can demote admins
        if (group.creator._id.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group host can demote admins' 
            });
        }

        // Check if the member exists in the group
        const memberToDemote = group.members.find(m => m.user._id.toString() === memberId);
        if (!memberToDemote) {
            return res.status(404).json({ 
                success: false, 
                message: 'Member not found in this group' 
            });
        }

        // Check if member is the creator
        if (memberId === group.creator._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot demote the group host' 
            });
        }

        // Check if member is an admin
        if (memberToDemote.role !== 'admin') {
            return res.status(400).json({ 
                success: false, 
                message: 'This member is not an admin' 
            });
        }

        // Demote the member
        memberToDemote.role = 'member';
        await group.save();

        res.json({
            success: true,
            message: 'Admin demoted to member successfully',
            data: {
                ...group.toObject(),
                memberCount: group.members.length,
                isMember: true,
                userRole: 'creator'
            }
        });
    } catch (error) {
        console.error('Demote member error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to demote admin to member' 
        });
    }
};

// Remove member from group (host only)
export const removeMemberFromGroup = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user._id || req.user.id;

        const group = await Group.findById(groupId)
            .populate('creator', 'name email')
            .populate('members.user', 'name email');

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Only the creator/host can remove members
        if (group.creator._id.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group host can remove members' 
            });
        }

        // Check if the member exists in the group
        const memberToRemove = group.members.find(m => {
            const mId = m.user._id ? m.user._id.toString() : m.user.toString();
            return mId === memberId;
        });

        if (!memberToRemove) {
            return res.status(404).json({ 
                success: false, 
                message: 'Member not found in this group' 
            });
        }

        // Cannot remove the creator/host
        if (memberId === group.creator._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot remove the group host' 
            });
        }

        // Remove the member
        const success = group.removeMember(memberId);
        if (!success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Failed to remove member from group' 
            });
        }

        await group.save();

        res.json({
            success: true,
            message: 'Member removed from group successfully',
            data: {
                ...group.toObject(),
                memberCount: group.members.length,
                isMember: true,
                userRole: 'creator'
            }
        });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to remove member from group' 
        });
    }
};

// Admin: Update group status (approve/reject)
export const updateGroupStatus = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { status, rejectionReason } = req.body;

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "approved" or "rejected"'
            });
        }

        // Prepare update data
        const updateData = { status };

        // If rejecting, include rejection reason (if provided)
        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        // If approving, clear any previous rejection reason
        if (status === 'approved') {
            updateData.rejectionReason = null;
        }

        const group = await Group.findByIdAndUpdate(
            groupId,
            updateData,
            { new: true }
        ).populate('creator', 'name email');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        res.json({
            success: true,
            message: `Group ${status} successfully`,
            data: group
        });
    } catch (error) {
        console.error('Update group status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update group status'
        });
    }
};

// Admin: Get all pending groups
export const getPendingGroups = async (req, res) => {
    try {
        const groups = await Group.find({ status: 'pending' })
            .populate('creator', 'name email')
            .populate('members.user', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Get pending groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending groups'
        });
    }
};