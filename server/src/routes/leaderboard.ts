/**
 * Leaderboards & Community Financial Health Rankings
 * Fast indexed queries for global Net Worth, Financial Health, and Survival Streaks.
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/leaderboard/wealth
 * Top players ranked by Net Worth
 */
router.get('/wealth', async (_req: Request, res: Response) => {
  try {
    const topWealth = await prisma.gameSave.findMany({
      where: {
        isActive: true,
        netWorth: { gt: 0 },
      },
      orderBy: { netWorth: 'desc' },
      take: 25,
      select: {
        id: true,
        characterName: true,
        characterArchetype: true,
        currentAge: true,
        currentStage: true,
        netWorth: true,
        healthScoreValue: true,
        level: true,
        totalMonthsSimulated: true,
        updatedAt: true,
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    const leaderboard = topWealth.map((save, index) => ({
      rank: index + 1,
      id: save.id,
      player: save.user.displayName,
      characterName: save.characterName,
      archetype: save.characterArchetype,
      currentAge: save.currentAge,
      stage: save.currentStage,
      netWorth: save.netWorth,
      healthScore: save.healthScoreValue,
      level: save.level,
      monthsSurvived: save.totalMonthsSimulated,
      lastActive: save.updatedAt,
    }));

    res.json({
      category: 'Net Worth Leaders',
      leaderboard,
    });
  } catch (error) {
    console.error('Fetch wealth leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Unable to load leaderboard.' });
  }
});

/**
 * GET /api/leaderboard/health
 * Top players ranked by Financial Health Score (0-100)
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const topHealth = await prisma.gameSave.findMany({
      where: {
        isActive: true,
        healthScoreValue: { gt: 0 },
      },
      orderBy: { healthScoreValue: 'desc' },
      take: 25,
      select: {
        id: true,
        characterName: true,
        characterArchetype: true,
        currentAge: true,
        currentStage: true,
        netWorth: true,
        healthScoreValue: true,
        level: true,
        totalMonthsSimulated: true,
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    const leaderboard = topHealth.map((save, index) => ({
      rank: index + 1,
      id: save.id,
      player: save.user.displayName,
      characterName: save.characterName,
      archetype: save.characterArchetype,
      stage: save.currentStage,
      healthScore: save.healthScoreValue,
      netWorth: save.netWorth,
      level: save.level,
      monthsSurvived: save.totalMonthsSimulated,
    }));

    res.json({
      category: 'Financial Health Leaders',
      leaderboard,
    });
  } catch (error) {
    console.error('Fetch health leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaderboard/streaks
 * Players with longest simulation longevity
 */
router.get('/streaks', async (_req: Request, res: Response) => {
  try {
    const topStreaks = await prisma.gameSave.findMany({
      where: { isActive: true },
      orderBy: { totalMonthsSimulated: 'desc' },
      take: 25,
      select: {
        id: true,
        characterName: true,
        characterArchetype: true,
        currentAge: true,
        currentStage: true,
        netWorth: true,
        healthScoreValue: true,
        totalMonthsSimulated: true,
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    const leaderboard = topStreaks.map((save, index) => ({
      rank: index + 1,
      id: save.id,
      player: save.user.displayName,
      characterName: save.characterName,
      archetype: save.characterArchetype,
      monthsSurvived: save.totalMonthsSimulated,
      yearsSimulated: Math.floor(save.totalMonthsSimulated / 12),
      netWorth: save.netWorth,
      healthScore: save.healthScoreValue,
    }));

    res.json({
      category: 'Longest Simulation Journeys',
      leaderboard,
    });
  } catch (error) {
    console.error('Fetch streaks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
