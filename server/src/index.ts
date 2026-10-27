import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import leaderboardRoutes from './routes/leaderboard';
import coachRoutes from './routes/coach';
import analyticsRoutes from './routes/analytics';
import { createRateLimiter } from './middleware/rateLimit';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rate limiting for authentication routes (50 requests per 15 minutes per IP)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
  message: 'Too many authentication attempts. Please slow down and try again shortly.',
});

// Root API Discovery
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Finance Life Simulator API',
    version: '1.0.0',
    description: 'PostgreSQL + Prisma powered backend for financial simulation, career promotions, community leaderboards, and AI coaching.',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh',
        profile: 'PUT /api/auth/profile',
        password: 'PUT /api/auth/password',
        deleteAccount: 'DELETE /api/auth/account',
      },
      game: {
        saves: 'GET /api/game/saves',
        state: 'GET /api/game/state/:id?',
        sync: 'POST /api/game/sync',
        promotion: 'POST /api/game/promotion',
        achievements: 'GET /api/game/achievements',
        unlockAchievement: 'POST /api/game/achievement/unlock',
        marketPulse: 'GET /api/game/market-pulse',
        export: 'GET /api/game/export/:id',
        deleteSave: 'DELETE /api/game/save/:id',
      },
      analytics: {
        audit: 'GET /api/analytics/:gameSaveId',
        peerBenchmark: 'GET /api/analytics/peer-benchmark/:gameSaveId',
      },
      leaderboard: {
        wealth: 'GET /api/leaderboard/wealth',
        health: 'GET /api/leaderboard/health',
        streaks: 'GET /api/leaderboard/streaks',
      },
      coach: {
        history: 'GET /api/coach/history/:gameSaveId',
        message: 'POST /api/coach/message',
      },
    },
  });
});

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      service: 'finance-life-sim-backend',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/coach', coachRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err instanceof Error ? err.message : 'An unexpected error occurred',
  });
});

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Finance Life Simulator Server running on port ${PORT}`);
  console.log(`Root Overview:    http://localhost:${PORT}/`);
  console.log(`Health check:     http://localhost:${PORT}/api/health`);
  console.log(`Auth API:         http://localhost:${PORT}/api/auth`);
  console.log(`Game API:         http://localhost:${PORT}/api/game`);
  console.log(`Analytics API:    http://localhost:${PORT}/api/analytics`);
  console.log(`Leaderboards API: http://localhost:${PORT}/api/leaderboard`);
  console.log(`Coach API:        http://localhost:${PORT}/api/coach`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server terminated cleanly.');
    process.exit(0);
  });
});
