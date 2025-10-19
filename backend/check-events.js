// Quick script to check events in database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const eventSchema = new mongoose.Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function checkEvents() {
  try {
    const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URL || process.env.MONGODB_URI;
    if (!mongoUrl) {
      console.error('❌ MONGODB_URL not found in .env file');
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
      process.exit(1);
    }
    
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB\n');

    // Check all events
    const allEvents = await Event.find({}).select('title status organizationId date');
    console.log(`📊 Total events in database: ${allEvents.length}\n`);

    // Group by status
    const byStatus = {};
    allEvents.forEach(event => {
      const status = event.status || 'no-status';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    console.log('📈 Events by status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    console.log('');

    // Show approved events
    const approvedEvents = await Event.find({ status: 'approved' })
      .select('title organizationId date location')
      .limit(5);
    
    console.log(`✅ Approved events (showing ${approvedEvents.length}):`);
    approvedEvents.forEach(event => {
      console.log(`   - ${event.title} (${event.location}) - ${event.date}`);
    });
    console.log('');

    // Show pending events
    const pendingEvents = await Event.find({ status: 'pending' })
      .select('title organizationId date')
      .limit(5);
    
    console.log(`⏳ Pending events (showing ${pendingEvents.length}):`);
    pendingEvents.forEach(event => {
      console.log(`   - ${event.title} - ${event.date}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEvents();
