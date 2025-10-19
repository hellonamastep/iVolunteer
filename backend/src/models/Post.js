import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const reactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Volunteer Experience',
            'Community Service',
            'Environmental Action',
            'Healthcare Initiative',
            'Education Support',
            'Animal Welfare',
            'Disaster Relief',
            'Fundraising',
            'Social Impact',
            'Personal Story',
            'Achievement',
            'Other'
        ]
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: false,
        default: null
    },
    cloudinaryPublicId: {
        type: String,
        required: false,
        default: null
    },
    comments: [commentSchema],
    reactions: [reactionSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Update the updatedAt timestamp only when modifying existing posts
postSchema.pre('save', function(next) {
    // Only set updatedAt if this is not a new document
    if (!this.isNew) {
        this.updatedAt = Date.now();
    }
    next();
});

// Add indexes for better query performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ city: 1, createdAt: -1 }); // Index for city-based filtering

const Post = mongoose.model('Post', postSchema);

export default Post;