import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'announcement'],
        default: 'text'
    },
    imageUrl: {
        type: String
    },
    cloudinaryPublicId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        }
    }],
    category: {
        type: String,
        required: true,
        enum: [
            'Environmental Action',
            'Community Service',
            'Healthcare Initiative',
            'Education Support',
            'Animal Welfare',
            'Disaster Relief',
            'Fundraising',
            'Social Impact',
            'Skills Development',
            'General Discussion',
            'Other'
        ]
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String
    },
    cloudinaryPublicId: {
        type: String
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500
    },
    maxMembers: {
        type: Number,
        default: 100,
        min: 2,
        max: 500
    },
    messages: [messageSchema],
    settings: {
        allowMemberInvites: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        }
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 20
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp on save
groupSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes for better query performance
groupSchema.index({ creator: 1, createdAt: -1 });
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ category: 1 });
groupSchema.index({ createdAt: -1 });
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

// Method to check if user is member
groupSchema.methods.isMember = function(userId) {
    return this.members.some(member => {
        // Handle both populated (object) and unpopulated (ObjectId) cases
        const memberId = member.user._id ? member.user._id.toString() : member.user.toString();
        return memberId === userId.toString();
    });
};

// Method to check if user is admin
groupSchema.methods.isAdmin = function(userId) {
    if (this.creator.toString() === userId.toString()) return true;
    return this.members.some(member => {
        // Handle both populated (object) and unpopulated (ObjectId) cases
        const memberId = member.user._id ? member.user._id.toString() : member.user.toString();
        return memberId === userId.toString() && member.role === 'admin';
    });
};

// Method to check if user is the creator/host
groupSchema.methods.isCreator = function(userId) {
    return this.creator.toString() === userId.toString();
};

// Method to add member
groupSchema.methods.addMember = function(userId, role = 'member') {
    if (!this.isMember(userId) && this.members.length < this.maxMembers) {
        this.members.push({ user: userId, role });
        return true;
    }
    return false;
};

// Method to remove member
groupSchema.methods.removeMember = function(userId) {
    const index = this.members.findIndex(member => {
        // Handle both populated (object) and unpopulated (ObjectId) cases
        const memberId = member.user._id ? member.user._id.toString() : member.user.toString();
        return memberId === userId.toString();
    });
    if (index > -1) {
        this.members.splice(index, 1);
        return true;
    }
    return false;
};

const Group = mongoose.model('Group', groupSchema);

export default Group;