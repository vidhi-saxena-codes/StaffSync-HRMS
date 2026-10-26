import mongoose from 'mongoose';

let isConnected = false;
let reconnectTimer: NodeJS.Timeout | null = null;

export async function connectDB(uri?: string): Promise<boolean> {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync_hrms';

  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    mongoose.set('strictQuery', false);
    
    // Connection options for resilience
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`[StaffSync MongoDB] Successfully connected to database: ${mongoose.connection.name} at ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`);

    mongoose.connection.on('error', (err) => {
      console.error('[StaffSync MongoDB] Connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[StaffSync MongoDB] Database disconnected.');
      isConnected = false;
    });

    return true;
  } catch (error: any) {
    isConnected = false;
    console.warn(`[StaffSync MongoDB] Could not connect to MongoDB at "${mongoUri}": ${error.message}`);
    console.warn('[StaffSync MongoDB] Please ensure MongoDB is running locally or specify a valid MONGODB_URI in your .env file.');
    return false;
  }
}

/**
 * Periodically attempts to connect to MongoDB in the background if disconnected
 */
export function startAutoReconnect(onConnectCallback?: () => Promise<void>) {
  if (reconnectTimer) return;
  reconnectTimer = setInterval(async () => {
    if (!isDbConnected()) {
      const ok = await connectDB();
      if (ok && onConnectCallback) {
        await onConnectCallback();
      }
    }
  }, 10000);
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getDbInfo() {
  return {
    connected: isDbConnected(),
    readyState: mongoose.connection.readyState,
    databaseName: mongoose.connection.name || 'staffsync_hrms',
    host: mongoose.connection.host || 'unknown',
  };
}
