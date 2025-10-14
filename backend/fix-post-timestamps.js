import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './src/models/Post.js';

dotenv.config();

async function fixPostTimestamps() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const allPosts = await Post.find({});
        
        console.log('\n=== FIXING POST TIMESTAMPS ===');
        console.log(`Total posts: ${allPosts.length}\n`);

        let fixedCount = 0;

        for (const post of allPosts) {
            // If updatedAt exists and is equal to createdAt (or very close), remove updatedAt
            if (post.updatedAt) {
                const createdTime = new Date(post.createdAt).getTime();
                const updatedTime = new Date(post.updatedAt).getTime();
                const timeDiff = Math.abs(updatedTime - createdTime);
                
                // If the difference is less than 1 second, it's likely from the pre-save hook
                if (timeDiff < 1000) {
                    console.log(`Fixing post: "${post.title}"`);
                    console.log(`  Created: ${post.createdAt}`);
                    console.log(`  Updated: ${post.updatedAt}`);
                    console.log(`  Time diff: ${timeDiff}ms`);
                    
                    // Remove updatedAt for posts that haven't been edited
                    await Post.updateOne(
                        { _id: post._id },
                        { $unset: { updatedAt: "" } }
                    );
                    
                    fixedCount++;
                    console.log(`  ✅ Fixed - removed updatedAt\n`);
                }
            }
        }

        console.log(`\n✅ Fixed ${fixedCount} posts`);
        console.log('======================\n');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixPostTimestamps();
