/**
 * Financial Analytics, Health Diagnostics & Peer Comparison API
 */

import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/analytics/:gameSaveId
 * Deep financial diagnostic audit for a specific game save
 */
router.get('/:gameSaveId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const gameSaveId = req.params.gameSaveId as string;

    const save = await prisma.gameSave.findFirst({
      where: { id: gameSaveId, userId },
      include: {
        promotionLogs: { orderBy: { monthSimulated: 'asc' } },
        decisionLogs: { orderBy: { monthSimulated: 'asc' } },
      },
    });

    if (!save) {
      res.status(404).json({ error: 'Save not found or unauthorized' });
      return;
    }

    const balanceSheet = (save.balanceSheet as Record<string, any>) || {};
    const budget = (save.budget as Record<string, any>) || {};
    const healthScore = (save.healthScore as Record<string, any>) || {};
    const gamification = (save.gamification as Record<string, any>) || {};

    const netWorth = Number(save.netWorth || 0);
    const monthlyIncome = Number(budget.monthlyIncome || 0);
    const monthlyExpenses = Number((budget.needs || 0) + (budget.wants || 0));
    const monthlySavings = Number(budget.savings || 0);
    const liquidCash = Number(balanceSheet.cash || 0) + Number(balanceSheet.emergencyFund || 0);

    // Emergency fund coverage in months
    const emergencyMonths = monthlyExpenses > 0 ? Number((liquidCash / monthlyExpenses).toFixed(1)) : 0;

    // Savings rate percentage
    const savingsRate = monthlyIncome > 0 ? Number(((monthlySavings / monthlyIncome) * 100).toFixed(1)) : 0;

    // Health Grade calculation
    const scoreVal = Number(save.healthScoreValue || healthScore.totalScore || 50);
    let healthGrade = 'C';
    if (scoreVal >= 90) healthGrade = 'A+';
    else if (scoreVal >= 80) healthGrade = 'A';
    else if (scoreVal >= 70) healthGrade = 'B';
    else if (scoreVal >= 50) healthGrade = 'C';
    else healthGrade = 'D';

    // Career audit
    const promotions = save.promotionLogs;
    const totalBonuses = promotions.reduce((acc, p) => acc + (p.bonusAmount || 0), 0);
    const latestPromotion = promotions.length > 0 ? promotions[promotions.length - 1] : null;

    // Actionable smart insights
    const insights: string[] = [];
    if (emergencyMonths < 3) {
      insights.push('⚠️ Emergency fund covers less than 3 months of expenses. Prioritize building liquid reserves to avoid high-interest debt during shocks.');
    } else if (emergencyMonths >= 6) {
      insights.push('🛡️ Robust emergency fund! You have 6+ months of safety buffer, protecting your investments from panic withdrawals.');
    }

    if (savingsRate < 20) {
      insights.push('💡 Your savings rate is below 20%. Try the 50/30/20 rule: 50% Needs, 30% Wants, 20% Compounding Savings.');
    } else if (savingsRate >= 40) {
      insights.push('🚀 Excellent wealth accumulation velocity! Saving >40% of income drastically shortens your time to Financial Independence (FIRE).');
    }

    if (promotions.length > 0) {
      insights.push(`📈 Career Momentum: You have unlocked ${promotions.length} promotion(s), earning ₹${totalBonuses.toLocaleString('en-IN')} in milestone bonuses.`);
    }

    res.json({
      gameSaveId: save.id,
      characterName: save.characterName,
      archetype: save.characterArchetype,
      currentAge: save.currentAge,
      totalMonthsSimulated: save.totalMonthsSimulated,
      score: scoreVal,
      healthGrade,
      metrics: {
        netWorth,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsRate,
        emergencyMonths,
        liquidReserves: liquidCash,
        assets: balanceSheet.assets || [],
        liabilities: balanceSheet.liabilities || [],
      },
      careerAudit: {
        promotionsCount: promotions.length,
        totalBonusesEarned: totalBonuses,
        latestRole: latestPromotion?.newTitle || 'Entry Level / Apprentice',
        promotionHistory: promotions,
      },
      gamification: {
        level: save.level,
        xp: gamification.experiencePoints || 0,
        badges: gamification.unlockedBadges || [],
      },
      insights,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/peer-benchmark/:gameSaveId
 * Compares current player against anonymous global peers
 */
router.get('/peer-benchmark/:gameSaveId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const gameSaveId = req.params.gameSaveId as string;

    const playerSave = await prisma.gameSave.findFirst({
      where: { id: gameSaveId, userId },
    });

    if (!playerSave) {
      res.status(404).json({ error: 'Save not found' });
      return;
    }

    // Aggregate statistics across all active community saves
    const aggregate = await prisma.gameSave.aggregate({
      where: { isActive: true },
      _avg: {
        netWorth: true,
        healthScoreValue: true,
        totalMonthsSimulated: true,
      },
      _max: {
        netWorth: true,
      },
      _count: {
        id: true,
      },
    });

    // Count how many players have a lower net worth (percentile calculation)
    const lowerRankCount = await prisma.gameSave.count({
      where: {
        isActive: true,
        netWorth: { lt: playerSave.netWorth },
      },
    });

    const totalPlayers = aggregate._count.id || 1;
    const wealthPercentile = Math.round((lowerRankCount / totalPlayers) * 100);

    res.json({
      player: {
        characterName: playerSave.characterName,
        netWorth: playerSave.netWorth,
        healthScore: playerSave.healthScoreValue,
        percentile: wealthPercentile,
      },
      communityAverages: {
        totalSimulationsTracked: totalPlayers,
        averageNetWorth: Math.round(aggregate._avg.netWorth || 0),
        averageHealthScore: Math.round(aggregate._avg.healthScoreValue || 0),
        topNetWorth: aggregate._max.netWorth || 0,
      },
    });
  } catch (error) {
    console.error('Peer benchmark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
