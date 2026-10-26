import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, isDbConnected, startAutoReconnect } from './db';
import { seedDatabase } from './seed';
import { setupApiRoutes } from './routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  // CORS Middleware for seamless full-stack communication
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Connect to MongoDB
  const mongoConnected = await connectDB();
  if (mongoConnected) {
    await seedDatabase();
  } else {
    // Start background auto-reconnect attempt
    startAutoReconnect(async () => {
      await seedDatabase();
    });
  }

  // Register all Full-Stack REST API routes
  setupApiRoutes(app);

  // Download Zip Archive Endpoint
  app.get('/api/download-zip', (_req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, '..', 'staffsync-hrms.zip');
    res.download(zipPath, 'staffsync-hrms.zip');
  });

  // Root status endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'StaffSync HRMS Enterprise Backend',
      version: '1.0.0',
      status: 'online',
      database: isDbConnected() ? 'MongoDB (Connected)' : 'Standby / Local Fallback',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StaffSync Backend] Server running at http://localhost:${PORT}`);
    console.log(`[StaffSync Backend] Database Status: ${isDbConnected() ? 'CONNECTED' : 'STANDBY'}`);
  });
}

startServer().catch((err) => {
  console.error('[StaffSync Backend] Fatal startup error:', err);
});
