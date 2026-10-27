/**
 * Game Simulation Routes — Multi-Save Slots, Cloud Sync, Promotions & Analytics
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const syncSchema = z.object({
  gameSaveId: z.string().optional(),
  characterName: z.string().default('Player'),
  characterArchetype: z.string().default('custom'),
  currentAge: z.number().int().min(16).max(100),
  currentMonth: z.number().int().min(1).max(12),
  currentStage: z.string(),
  totalMonthsSimulated: z.number().int().min(0),
  balanceSheet: z.record(z.any()),
  budget: z.record(z.any()),
  healthScore: z.record(z.any()),
  gamification: z.record(z.any()),
  decisionLog: z
    .object({
      eventId: z.string(),
      eventTitle: z.string(),
      selectedOption: z.string(),
      consequence: z.record(z.any()),
      monthSimulated: z.number().int(),
    })
    .optional(),
});

const promotionSchema = z.object({
  gameSaveId: z.string().uuid(),
  previousTitle: z.string(),
  newTitle: z.string(),
  previousSalary: z.number(),
  newSalary: z.number(),
  hikePercentage: z.number(),
  bonusAmount: z.number().default(0),
  lifestyleChoice: z.string(),
  monthSimulated: z.number().int(),
});

/**
 * GET /api/game/saves
 * Lists all character save slots for the authenticated user
 */
router.get('/saves', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const saves = await prisma.gameSave.findMany({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        characterName: true,
        characterArchetype: true,
        currentAge: true,
        currentMonth: true,
        currentStage: true,
        totalMonthsSimulated: true,
        netWorth: true,
        healthScoreValue: true,
        level: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: {
            decisionLogs: true,
            promotionLogs: true,
          },
        },
      },
    });

    res.json({ saves });
  } catch (error) {
    console.error('List game saves error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/game/state/:id?
 * Retrieves a specific save slot or latest active game save
 */
router.get('/state/:id?', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const targetId = req.params.id as string | undefined;

    const save = targetId
      ? await prisma.gameSave.findFirst({
          where: { id: targetId, userId, isActive: true },
          include: {
            decisionLogs: { orderBy: { createdAt: 'desc' }, take: 25 },
            promotionLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
          },
        })
      : await prisma.gameSave.findFirst({
          where: { userId, isActive: true },
          orderBy: { updatedAt: 'desc' },
          include: {
            decisionLogs: { orderBy: { createdAt: 'desc' }, take: 25 },
            promotionLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
          },
        });

    if (!save) {
      res.status(404).json({ found: false, message: 'No cloud save found.' });
      return;
    }

    res.json({ found: true, save });
  } catch (error) {
    console.error('Fetch game save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/game/sync
 * Upserts current simulation snapshot with indexed metrics
 */
router.post('/sync', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const parseResult = syncSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const data = parseResult.data;

    // Extract indexed metrics for fast ranking queries
    const netWorth = Number(data.balanceSheet?.netWorth || 0);
    const healthScoreValue = Number(data.healthScore?.totalScore || 0);
    const level = Number(data.gamification?.level || 1);

    let targetSaveId = data.gameSaveId;

    if (targetSaveId) {
      const existing = await prisma.gameSave.findUnique({ where: { id: targetSaveId } });
      if (!existing || existing.userId !== userId) {
        targetSaveId = undefined;
      }
    }

    const saveRecord = targetSaveId
      ? await prisma.gameSave.update({
          where: { id: targetSaveId },
          data: {
            characterName: data.characterName,
            characterArchetype: data.characterArchetype,
            currentAge: data.currentAge,
            currentMonth: data.currentMonth,
            currentStage: data.currentStage,
            totalMonthsSimulated: data.totalMonthsSimulated,
            netWorth,
            healthScoreValue,
            level,
            balanceSheet: data.balanceSheet,
            budget: data.budget,
            healthScore: data.healthScore,
            gamification: data.gamification,
          },
        })
      : await prisma.gameSave.create({
          data: {
            userId,
            characterName: data.characterName,
            characterArchetype: data.characterArchetype,
            currentAge: data.currentAge,
            currentMonth: data.currentMonth,
            currentStage: data.currentStage,
            totalMonthsSimulated: data.totalMonthsSimulated,
            netWorth,
            healthScoreValue,
            level,
            balanceSheet: data.balanceSheet,
            budget: data.budget,
            healthScore: data.healthScore,
            gamification: data.gamification,
          },
        });

    if (data.decisionLog) {
      await prisma.decisionLog.create({
        data: {
          gameSaveId: saveRecord.id,
          eventId: data.decisionLog.eventId,
          eventTitle: data.decisionLog.eventTitle,
          selectedOption: data.decisionLog.selectedOption,
          consequence: data.decisionLog.consequence,
          monthSimulated: data.decisionLog.monthSimulated,
        },
      });
    }

    res.json({
      success: true,
      gameSaveId: saveRecord.id,
      updatedAt: saveRecord.updatedAt,
      message: 'Simulation state successfully synced to cloud.',
    });
  } catch (error) {
    console.error('Sync game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/game/promotion
 * Records a career promotion event into permanent history
 */
router.post('/promotion', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const parseResult = promotionSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
      return;
    }

    const d = parseResult.data;

    // Verify ownership
    const save = await prisma.gameSave.findFirst({ where: { id: d.gameSaveId, userId } });
    if (!save) {
      res.status(404).json({ error: 'Save not found' });
      return;
    }

    const log = await prisma.promotionLog.create({
      data: {
        gameSaveId: d.gameSaveId,
        previousTitle: d.previousTitle,
        newTitle: d.newTitle,
        previousSalary: d.previousSalary,
        newSalary: d.newSalary,
        hikePercentage: d.hikePercentage,
        bonusAmount: d.bonusAmount,
        lifestyleChoice: d.lifestyleChoice,
        monthSimulated: d.monthSimulated,
      },
    });

    res.status(201).json({ success: true, promotionLog: log });
  } catch (error) {
    console.error('Log promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/game/save/:id
 * Deletes a specific character save slot
 */
router.delete('/save/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const existing = await prisma.gameSave.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Save not found' });
      return;
    }

    await prisma.gameSave.delete({ where: { id } });
    res.json({ message: 'Save slot deleted successfully.' });
  } catch (error) {
    console.error('Delete save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/game/export/:id
 * Exports complete JSON ledger of a player's journey
 */
router.get('/export/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const save = await prisma.gameSave.findFirst({
      where: { id, userId },
      include: {
        decisionLogs: { orderBy: { createdAt: 'asc' } },
        promotionLogs: { orderBy: { createdAt: 'asc' } },
        coachChatLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!save) {
      res.status(404).json({ error: 'Save not found' });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="sim_save_${save.characterName}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(save, null, 2));
  } catch (error) {
    console.error('Export save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * ACHIEVEMENTS CATALOG
 */
const MASTER_ACHIEVEMENTS = [
  {
    id: 'first_job_starter',
    title: 'First Paycheck',
    description: 'Secured your first formal employment contract.',
    category: 'career',
    xpReward: 100,
    icon: 'briefcase',
  },
  {
    id: 'sip_master',
    title: 'Compounding Disciple',
    description: 'Started and maintained a disciplined monthly mutual fund SIP.',
    category: 'investing',
    xpReward: 150,
    icon: 'trending-up',
  },
  {
    id: 'promotion_champ',
    title: 'Corporate Ladder Climber',
    description: 'Earned a job promotion with a substantial salary hike.',
    category: 'career',
    xpReward: 250,
    icon: 'award',
  },
  {
    id: 'emergency_fortress',
    title: 'Six-Month Fortress',
    description: 'Accumulated 6 months of mandatory living expenses in liquid reserves.',
    category: 'savings',
    xpReward: 300,
    icon: 'shield',
  },
  {
    id: 'debt_destroyer',
    title: 'Debt Annihilator',
    description: 'Fully paid off high-interest personal loans and credit cards.',
    category: 'debt',
    xpReward: 350,
    icon: 'check-circle',
  },
  {
    id: 'first_ten_lakhs',
    title: 'Ten Lakh Milestone',
    description: 'Surpassed ₹10,00,000 (1 Million) in total Net Worth.',
    category: 'wealth',
    xpReward: 500,
    icon: 'dollar-sign',
  },
  {
    id: 'half_crore_club',
    title: 'Half Crore Club',
    description: 'Surpassed ₹50,00,000 in total accumulated Net Worth.',
    category: 'wealth',
    xpReward: 1000,
    icon: 'star',
  },
  {
    id: 'market_survivor',
    title: 'Diamond Hands',
    description: 'Held your index portfolio through a sharp market dip without panic-selling.',
    category: 'investing',
    xpReward: 200,
    icon: 'anchor',
  },
];

/**
 * GET /api/game/achievements
 * Returns master list of achievements
 */
router.get('/achievements', (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    totalAchievements: MASTER_ACHIEVEMENTS.length,
    achievements: MASTER_ACHIEVEMENTS,
  });
});

/**
 * POST /api/game/achievement/unlock
 * Records an unlocked achievement and grants XP to the save
 */
router.post('/achievement/unlock', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { gameSaveId, badgeId } = req.body;

    if (!gameSaveId || !badgeId) {
      res.status(400).json({ error: 'gameSaveId and badgeId are required.' });
      return;
    }

    const badge = MASTER_ACHIEVEMENTS.find((b) => b.id === badgeId);
    if (!badge) {
      res.status(400).json({ error: 'Unknown badgeId.' });
      return;
    }

    const save = await prisma.gameSave.findFirst({
      where: { id: gameSaveId, userId },
    });

    if (!save) {
      res.status(404).json({ error: 'Save not found' });
      return;
    }

    const gamification = (save.gamification as Record<string, any>) || {};
    const unlockedBadges: string[] = gamification.unlockedBadges || [];

    if (unlockedBadges.includes(badgeId)) {
      res.json({ message: 'Achievement already unlocked.', badge, alreadyUnlocked: true });
      return;
    }

    unlockedBadges.push(badgeId);
    const newXp = (gamification.experiencePoints || 0) + badge.xpReward;
    const newLevel = Math.floor(newXp / 250) + 1;

    const updated = await prisma.gameSave.update({
      where: { id: gameSaveId },
      data: {
        level: newLevel,
        gamification: {
          ...gamification,
          unlockedBadges,
          experiencePoints: newXp,
          level: newLevel,
        },
      },
    });

    res.json({
      success: true,
      message: `Achievement unlocked: ${badge.title}! +${badge.xpReward} XP`,
      badge,
      newLevel: updated.level,
      totalXp: newXp,
    });
  } catch (error) {
    console.error('Unlock achievement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/game/market-pulse
 * Provides simulated macroeconomic environment indicators
 */
router.get('/market-pulse', (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    macroeconomicClimate: {
      headlineInflationRate: 5.2,
      rbiRepoRate: 6.5,
      bankFixedDepositRate: 7.1,
      publicProvidentFundRate: 7.1,
      equitySentiment: 'moderately_bullish',
      nifty50YtdReturn: 13.8,
      goldAnnualReturn: 12.4,
      rentalYieldAverage: 3.2,
    },
    liveNewsAlerts: [
      'RBI monetary policy committee holds benchmark repo rate at 6.50% to maintain steady disinflation.',
      'Domestic mutual fund SIP accounts cross new milestone as retail investors embrace index funds.',
      'Tech and financial services witness wage normalization; performance bonuses favor high contributors.',
    ],
    updatedAt: new Date().toISOString(),
  });
});

export default router;
