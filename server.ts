/**
 * BFS – Bank Fraud Shield
 * Express + Vite Full-Stack Server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './backend/routes/apiRoutes.ts';
import { initializeDatabase } from './backend/config/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Mount Backend API routes
  app.use('/api', apiRouter);

  // Initialize Database Connection
  await initializeDatabase();

  // Vite Dev Server Integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BFS-SERVER] BFS – Bank Fraud Shield active on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[BFS-SERVER] Failed to start server:', err);
  process.exit(1);
});
