import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gyaan';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Primary MongoDB connection failed (${err.message}).`);
    
    // In development mode, auto-fallback to mongodb-memory-server so developer can test immediately
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting in-memory MongoDB instance for development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB running and connected at: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    }
    
    throw err;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
