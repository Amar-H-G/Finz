import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`Connecting to MongoDB at configured URI...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('MongoDB connected successfully via MONGODB_URI.');
      return;
    } catch (err) {
      console.warn(`Failed to connect to MONGODB_URI (${err.message}). Falling back to embedded MongoDB.`);
    }
  }

  // Fallback to in-memory MongoDB for seamless development & offline evaluation
  try {
    console.log('Starting in-memory MongoDB instance for local development...');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`In-memory MongoDB connected successfully at ${memoryUri}`);
  } catch (err) {
    console.error('Fatal: Could not initialize database connection:', err);
    throw err;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('Database disconnected.');
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
}
