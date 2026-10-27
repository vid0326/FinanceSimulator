/**
 * AI Financial Coach Chat & History Persistence Routes
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const messageSchema = z.object({
  gameSaveId: z.string().uuid(),
  userQuery: z.string().min(1).max(1000),
  coachResponse: z.string().min(1).max(5000),
  monthSimulated: z.number().int().default(1),
});

/**
 * GET /api/coach/history/:gameSaveId
 * Returns past coach conversation history for a given save
 */
router.get('/history/:gameSaveId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const gameSaveId = req.params.gameSaveId as string;

    // Verify ownership
    const save = await prisma.gameSave.findFirst({
      where: { id: gameSaveId, userId },
    });

    if (!save) {
      res.status(404).json({ error: 'Save not found or not owned by user.' });
      return;
    }

    const logs = await prisma.coachChatLog.findMany({
      where: { gameSaveId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    res.json({
      history: logs.map((l) => ({
        id: l.id,
        userQuery: l.userQuery,
        coachResponse: l.coachResponse,
        monthSimulated: l.monthSimulated,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    console.error('Fetch coach history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/coach/message
 * Saves a Q&A interaction between player and AI Coach
 */
router.post('/message', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const parseResult = messageSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
      return;
    }

    const { gameSaveId, userQuery, coachResponse, monthSimulated } = parseResult.data;

    // Verify save ownership
    const save = await prisma.gameSave.findFirst({
      where: { id: gameSaveId, userId },
    });

    if (!save) {
      res.status(404).json({ error: 'Save not found' });
      return;
    }

    const log = await prisma.coachChatLog.create({
      data: {
        gameSaveId,
        userQuery,
        coachResponse,
        monthSimulated,
      },
    });

    res.status(201).json({
      success: true,
      id: log.id,
      createdAt: log.createdAt,
    });
  } catch (error) {
    console.error('Save coach message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
