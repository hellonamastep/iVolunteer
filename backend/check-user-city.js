import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

async function checkUserCities() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        
        console.log('\n=== USER CITIES CHECK ===');
        console.log(`Total users: ${users.length}\n`);

        users.forEach(user => {
            let userCity;
            if (user.role === 'user') {
                userCity = user.city;
            } else if (user.role === 'ngo' || user.role === 'corporate') {
                userCity = user.address?.city;
            }
            
            console.log(`User: ${user.name} (${user.email})`);
            console.log(`  Role: ${user.role}`);
            console.log(`  City: "${userCity || 'NOT SET'}"`);
            console.log('');
        });

        console.log('======================\n');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkUserCities();
