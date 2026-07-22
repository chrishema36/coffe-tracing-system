import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

import { createApiRouter, swaggerSpec } from './routes';
import { errorHandler } from './middleware/errorHandler';

/** Global rate limiter: 200 requests per 15 minutes per IP */
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    timestamp: new Date().toISOString(),
  },
});

/** Strict rate limiter for mutation endpoints */
const mutationRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many write requests. Please slow down.',
    timestamp: new Date().toISOString(),
  },
});

const getAllowedOrigins = (): string[] => {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
  return [clientOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'];
};

export const createApp = (prisma: PrismaClient): Express => {
  const app = express();

  // Security headers (Helmet with sane defaults)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS — allowlist from environment
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = getAllowedOrigins();
        // Allow non-browser clients (curl, Postman, Docker health checks) or vercel deployments
        if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin '${origin}' is not permitted.`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing with size limit (prevents large payload DoS)
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));

  // Structured HTTP request logging
  app.use(pinoHttp({ autoLogging: process.env.NODE_ENV !== 'test' }));

  // Global rate limiting
  app.use(globalRateLimiter);

  // Apply stricter rate limit to all POST routes
  app.use('/api/v1', (req, _res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      mutationRateLimiter(req, _res, next);
    } else {
      next();
    }
  });

  // Health check — no rate limit (used by load balancers & Docker)
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'UP',
      service: 'CoffeeTrace Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Swagger Documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CoffeeTrace API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // Mount API v1
  app.use('/api/v1', createApiRouter(prisma));

  // Central Error Handler (must be last)
  app.use(errorHandler);

  return app;
};
