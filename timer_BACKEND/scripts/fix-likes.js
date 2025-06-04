import mongoose from 'mongoose';
import { connectDB } from '../util/db.js'; // Adjust path as needed

async function fixLikesArrays() {
  try {
    await connectDB();
    
    const result = await mongoose.connection.db.collection('baseposts')
      .updateMany(
        { likes: { $exists: false } },
        { $set: { likes: [] } }
      );
    
    console.log(`Updated ${result.modifiedCount} documents`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating documents:', error);
    process.exit(1);
  }
}

fixLikesArrays();