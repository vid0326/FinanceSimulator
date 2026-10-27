/**
 * Simple in-memory sliding window rate limiter middleware.
 * Protects critical endpoints like authentication from brute-force attacks.
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Window size in milliseconds
  maxRequests: number; // Max allowed requests per window
  message?: string;
}

interface RequestRecord {
  timestamps: number[];
}

export function createRateLimiter(options: RateLimitOptions) {
  const ipStore = new Map<string, RequestRecord>();

  // Periodically clean up stale IP records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref(); // unref so it doesn't block process exit

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    let record = ipStore.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      ipStore.set(clientIp, record);
    }

    // Filter out timestamps outside the current window
    record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);

    if (record.timestamps.length >= options.maxRequests) {
      const retryAfterSeconds = Math.ceil((record.timestamps[0] + options.windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        error: 'Too Many Requests',
        message: options.message || 'Too many requests from this IP. Please try again later.',
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}
