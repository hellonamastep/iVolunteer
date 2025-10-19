import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './src/models/Post.js';
import { User } from './src/models/User.js';

dotenv.config();

async function checkPostsCities() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const allPosts = await Post.find({}).populate('user', 'name city address');
        
        console.log('\n=== POSTS CITY CHECK ===');
        console.log(`Total posts: ${allPosts.length}\n`);

        const postsWithoutCity = allPosts.filter(post => !post.city);
        const postsWithCity = allPosts.filter(post => post.city);

        console.log(`Posts WITH city: ${postsWithCity.length}`);
        console.log(`Posts WITHOUT city: ${postsWithoutCity.length}\n`);

        if (postsWithCity.length > 0) {
            console.log('Posts with city:');
            postsWithCity.forEach(post => {
                console.log(`  - "${post.title}" | City: "${post.city}" | User: ${post.user?.name || 'Unknown'}`);
            });
        }

        if (postsWithoutCity.length > 0) {
            console.log('\nPosts WITHOUT city (need update):');
            postsWithoutCity.forEach(post => {
                console.log(`  - "${post.title}" | User: ${post.user?.name || 'Unknown'} | User City: ${post.user?.city || post.user?.address?.city || 'None'}`);
            });
        }

        console.log('\n======================\n');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkPostsCities();
