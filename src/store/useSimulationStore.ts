/**
 * Central Zustand Simulation Store
 * Manages full game loop, profile, balance sheet, events, coach chat, and gamification.
 */

import { create } from 'zustand';
import { UserProfile, LifeStage, STAGE_PRESETS } from '../core/types/profile';
import {
  BalanceSheet,
  MonthlyBudget,
  MonthlyCashFlowReport,
  HistoricalSnapshot,
  MarketCondition,
} from '../core/types/finance';
import { LifeScenarioEvent, DecisionOption, EventDecisionLog, ConsequenceImpact } from '../core/types/events';
import { HealthScoreBreakdown, GamificationState } from '../core/types/health';
import { AccountingEngine } from '../core/accounting/AccountingEngine';
import { HealthEngine } from '../core/health/HealthEngine';
import { EventEngine } from '../core/events/EventEngine';
import { InvestmentEngine } from '../core/investment/InvestmentEngine';
import { CoachEngine, CoachMessage } from '../intelligence/coachEngine';

export type AppTab = 'dashboard' | 'life' | 'portfolio' | 'whatif' | 'coach';

export interface SimulationStoreState {
  isInitialized: boolean;
  activeTab: AppTab;
  profile: UserProfile;
  balanceSheet: BalanceSheet;
  budget: MonthlyBudget;
  currentMarket: MarketCondition;
  cashFlowHistory: MonthlyCashFlowReport[];
  historicalSnapshots: HistoricalSnapshot[];
  healthScore: HealthScoreBreakdown;
  lifeSatisfaction: number;
  gamification: GamificationState;
  currentEvent: LifeScenarioEvent | null;
  decisionLogs: EventDecisionLog[];
  triggeredEventIds: string[];
  lastConsequence: ConsequenceImpact | null;
  coachMessages: CoachMessage[];

  // Actions
  initializeSimulation: (stageId: LifeStage, userName: string, avatarSeed?: string) => void;
  advanceMonth: () => void;
  selectDecision: (decision: DecisionOption) => void;
  dismissConsequence: () => void;
  updateAssetSIP: (assetId: string, sipAmount: number) => void;
  repayDebtLumpSum: (liabilityId: string, amount: number) => void;
  sendCoachMessage: (query: string) => void;
  setActiveTab: (tab: AppTab) => void;
  resetSimulation: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Arjun',
  avatarSeed: 'avatar_1',
  currentAge: 21,
  currentMonth: 1,
  totalMonthsSimulated: 0,
  currentStage: 'first_job',
  career: 'Junior Software Engineer',
  riskTolerance: 'moderate',
  financialGoal: {
    title: 'Emergency Safety & First 10 Lakhs',
    targetAmount: 1000000,
    targetYears: 5,
  },
};

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  isInitialized: false,
  activeTab: 'dashboard',
  profile: DEFAULT_PROFILE,
  balanceSheet: {
    liquidCash: 12000,
    emergencyFund: 35000,
    investmentsTotal: 15000,
    assets: [
      InvestmentEngine.createDefaultAsset('mutual_fund_equity', 'Nifty 50 Index Fund', 15000, 3000),
    ],
    liabilitiesTotal: 0,
    liabilities: [],
    netWorth: 62000,
  },
  budget: {
    baseSalary: 45000,
    bonusOrExtraIncome: 0,
    fixedNeeds: {
      rent: 14000,
      utilities: 3000,
      groceries: 5000,
      healthInsurance: 1500,
    },
    discretionaryWants: {
      entertainment: 3500,
      diningOut: 4000,
      shopping: 2500,
    },
  },
  currentMarket: 'stagnant',
  cashFlowHistory: [],
  historicalSnapshots: [],
  healthScore: {
    savingsRateScore: 16,
    debtManagementScore: 20,
    emergencyFundScore: 12,
    diversificationScore: 8,
    investmentDisciplineScore: 14,
    cashFlowStabilityScore: 10,
    totalScore: 80,
    grade: 'A',
    keyStrength: 'Debt Control',
    keyVulnerability: 'Diversification',
  },
  lifeSatisfaction: 75,
  gamification: {
    xp: 150,
    level: 1,
    levelTitle: 'Money Beginner',
    achievements: [
      {
        id: 'ach_started',
        title: 'First Step',
        description: 'Began your simulated financial life journey.',
        icon: 'rocket-outline',
        category: 'saving',
        unlockedAtMonth: 1,
      },
    ],
    decisionsMadeCount: 0,
    streakMonths: 1,
  },
  currentEvent: null,
  decisionLogs: [],
  triggeredEventIds: [],
  lastConsequence: null,
  coachMessages: [],

  initializeSimulation: (stageId: LifeStage, userName: string, avatarSeed: string = 'avatar_1') => {
    const preset = STAGE_PRESETS[stageId] || STAGE_PRESETS.first_job;

    const newProfile: UserProfile = {
      name: userName || 'Arjun',
      avatarSeed,
      currentAge: preset.age,
      currentMonth: 1,
      totalMonthsSimulated: 0,
      currentStage: stageId,
      career: preset.career,
      riskTolerance: 'moderate',
      financialGoal: {
        title: 'Build ₹10 Lakh Net Worth',
        targetAmount: 1000000,
        targetYears: 5,
      },
    };

    const starterAssets = [
      InvestmentEngine.createDefaultAsset(
        'mutual_fund_equity',
        'Nifty 50 Index Fund',
        Math.round(preset.startingSavings * 0.4),
        Math.round(preset.monthlyIncome * 0.1)
      ),
    ];

    const initialBS: BalanceSheet = {
      liquidCash: preset.startingCash,
      emergencyFund: Math.round(preset.startingSavings * 0.6),
      investmentsTotal: Math.round(preset.startingSavings * 0.4),
      assets: starterAssets,
      liabilitiesTotal: preset.startingDebt,
      liabilities: [],
      netWorth: preset.startingCash + preset.startingSavings - preset.startingDebt,
    };

    const initialBudget: MonthlyBudget = {
      baseSalary: preset.monthlyIncome,
      bonusOrExtraIncome: 0,
      fixedNeeds: {
        rent: Math.round(preset.fixedMonthlyExpenses * 0.6),
        utilities: Math.round(preset.fixedMonthlyExpenses * 0.15),
        groceries: Math.round(preset.fixedMonthlyExpenses * 0.2),
        healthInsurance: Math.round(preset.fixedMonthlyExpenses * 0.05),
      },
      discretionaryWants: {
        entertainment: Math.round(preset.monthlyIncome * 0.08),
        diningOut: Math.round(preset.monthlyIncome * 0.07),
        shopping: Math.round(preset.monthlyIncome * 0.05),
      },
    };

    const initialHealth = HealthEngine.calculateHealthScore(
      initialBS,
      {
        month: 1,
        year: 2026,
        totalIncome: preset.monthlyIncome,
        totalFixedExpenses: preset.fixedMonthlyExpenses,
        totalDiscretionaryExpenses: Math.round(preset.monthlyIncome * 0.2),
        totalEMIs: 0,
        totalSIPContributions: Math.round(preset.monthlyIncome * 0.1),
        emergencyContribution: 0,
        netSavingsOrDeficit: Math.round(preset.monthlyIncome * 0.15),
        beginningCash: preset.startingCash,
        endingCash: preset.startingCash,
        penaltyCharges: 0,
      },
      1
    );

    // Initial Coach Welcome Brief
    const welcomeMsg = CoachEngine.generateWelcomeBrief(newProfile, initialBS, initialHealth, []);

    // Check first event
    const firstScenario = EventEngine.pickNextScenario(newProfile, [], initialBS);

    set({
      isInitialized: true,
      activeTab: 'dashboard',
      profile: newProfile,
      balanceSheet: initialBS,
      budget: initialBudget,
      healthScore: initialHealth,
      lifeSatisfaction: 75,
      currentMarket: 'stagnant',
      cashFlowHistory: [],
      historicalSnapshots: [
        {
          monthIndex: 0,
          age: preset.age,
          monthInYear: 1,
          netWorth: initialBS.netWorth,
          liquidCash: initialBS.liquidCash,
          investmentsTotal: initialBS.investmentsTotal,
          liabilitiesTotal: initialBS.liabilitiesTotal,
          financialHealthScore: initialHealth.totalScore,
          lifeSatisfactionScore: 75,
          marketCondition: 'stagnant',
        },
      ],
      decisionLogs: [],
      triggeredEventIds: [],
      currentEvent: firstScenario,
      lastConsequence: null,
      coachMessages: [welcomeMsg],
    });
  },

  advanceMonth: () => {
    const {
      profile,
      balanceSheet,
      budget,
      currentMarket,
      cashFlowHistory,
      historicalSnapshots,
      gamification,
      lifeSatisfaction,
      triggeredEventIds,
      decisionLogs,
    } = get();

    const nextMonthIndex = profile.totalMonthsSimulated + 1;
    const nextMonthInYear = (profile.currentMonth % 12) + 1;
    const nextAge = profile.currentAge + (nextMonthInYear === 1 && nextMonthIndex > 1 ? 1 : 0);

    // Cycle market conditions realistically
    const marketCycles: MarketCondition[] = [
      'bull',
      'bull',
      'stagnant',
      'bear',
      'stagnant',
      'bull',
      'recovery',
      'stagnant',
    ];
    const newMarket = marketCycles[nextMonthIndex % marketCycles.length];

    // Process monthly accounting
    const { updatedBalanceSheet, cashFlowReport } = AccountingEngine.processMonthlyTick(
      balanceSheet,
      budget,
      newMarket,
      nextMonthInYear,
      2026 + Math.floor(nextMonthIndex / 12)
    );

    // Calculate updated Health Score
    const updatedHealth = HealthEngine.calculateHealthScore(
      updatedBalanceSheet,
      cashFlowReport,
      gamification.streakMonths
    );

    // Update life satisfaction
    let newSatisfaction = lifeSatisfaction;
    if (cashFlowReport.endingCash < 0) newSatisfaction -= 10;
    if (updatedBalanceSheet.liabilitiesTotal > 100000) newSatisfaction -= 3;
    if (cashFlowReport.totalDiscretionaryExpenses > 5000) newSatisfaction += 2;
    newSatisfaction = Math.min(100, Math.max(10, newSatisfaction));

    const updatedProfile: UserProfile = {
      ...profile,
      currentAge: nextAge,
      currentMonth: nextMonthInYear,
      totalMonthsSimulated: nextMonthIndex,
    };

    const newSnapshot: HistoricalSnapshot = {
      monthIndex: nextMonthIndex,
      age: nextAge,
      monthInYear: nextMonthInYear,
      netWorth: updatedBalanceSheet.netWorth,
      liquidCash: updatedBalanceSheet.liquidCash,
      investmentsTotal: updatedBalanceSheet.investmentsTotal,
      liabilitiesTotal: updatedBalanceSheet.liabilitiesTotal,
      financialHealthScore: updatedHealth.totalScore,
      lifeSatisfactionScore: newSatisfaction,
      marketCondition: newMarket,
    };

    // Gamification XP
    const newXP = gamification.xp + 50;
    const newLevel = Math.floor(newXP / 200) + 1;
    const levelTitles = [
      'Money Beginner',
      'Smart Saver',
      'Financial Explorer',
      'Consistent Investor',
      'Portfolio Builder',
      'Financial Strategist',
    ];
    const levelTitle = levelTitles[Math.min(levelTitles.length - 1, newLevel - 1)];

    // Check next life scenario event
    const nextScenario = EventEngine.pickNextScenario(
      updatedProfile,
      triggeredEventIds,
      updatedBalanceSheet
    );

    set({
      profile: updatedProfile,
      balanceSheet: updatedBalanceSheet,
      currentMarket: newMarket,
      cashFlowHistory: [cashFlowReport, ...cashFlowHistory.slice(0, 11)],
      historicalSnapshots: [...historicalSnapshots, newSnapshot],
      healthScore: updatedHealth,
      lifeSatisfaction: newSatisfaction,
      currentEvent: nextScenario,
      gamification: {
        ...gamification,
        xp: newXP,
        level: newLevel,
        levelTitle,
        streakMonths: gamification.streakMonths + 1,
      },
    });
  },

  selectDecision: (decision: DecisionOption) => {
    const {
      currentEvent,
      balanceSheet,
      budget,
      profile,
      decisionLogs,
      triggeredEventIds,
      gamification,
      healthScore,
    } = get();

    if (!currentEvent) return;

    const { updatedBalanceSheet, updatedBudget, decisionLog } = EventEngine.applyDecisionConsequence(
      decision,
      currentEvent,
      balanceSheet,
      budget,
      profile
    );

    const updatedTriggered = [...triggeredEventIds, currentEvent.id];
    const updatedLogs = [decisionLog, ...decisionLogs];

    // Recalculate health
    const newHealth = HealthEngine.calculateHealthScore(
      updatedBalanceSheet,
      {
        month: profile.currentMonth,
        year: 2026,
        totalIncome: updatedBudget.baseSalary,
        totalFixedExpenses: updatedBudget.fixedNeeds.rent * 1.5,
        totalDiscretionaryExpenses: 8000,
        totalEMIs: updatedBalanceSheet.liabilities.reduce((s, l) => s + l.monthlyEMI, 0),
        totalSIPContributions: updatedBalanceSheet.assets.reduce((s, a) => s + (a.monthlySIPAmount || 0), 0),
        emergencyContribution: 0,
        netSavingsOrDeficit: decision.consequence.cashDelta,
        beginningCash: balanceSheet.liquidCash,
        endingCash: updatedBalanceSheet.liquidCash,
        penaltyCharges: 0,
      },
      gamification.streakMonths
    );

    // Life satisfaction impact
    const newSatisfaction = Math.min(
      100,
      Math.max(10, get().lifeSatisfaction + decision.consequence.lifeSatisfactionDelta)
    );

    // XP & badge rewards
    let newAchievements = [...gamification.achievements];
    if (decision.badgeUnlockId && !newAchievements.some((a) => a.id === decision.badgeUnlockId)) {
      newAchievements.push({
        id: decision.badgeUnlockId,
        title: decision.title,
        description: decision.consequence.financialLesson,
        icon: 'trophy-outline',
        category: 'investing',
        unlockedAtMonth: profile.totalMonthsSimulated,
      });
    }

    set({
      balanceSheet: updatedBalanceSheet,
      budget: updatedBudget,
      decisionLogs: updatedLogs,
      triggeredEventIds: updatedTriggered,
      lastConsequence: decision.consequence,
      healthScore: newHealth,
      lifeSatisfaction: newSatisfaction,
      currentEvent: null, // Dismiss current scenario until next month
      gamification: {
        ...gamification,
        xp: gamification.xp + 80,
        decisionsMadeCount: gamification.decisionsMadeCount + 1,
        achievements: newAchievements,
      },
    });
  },

  dismissConsequence: () => {
    set({ lastConsequence: null });
  },

  updateAssetSIP: (assetId: string, sipAmount: number) => {
    const { balanceSheet } = get();
    const updatedAssets = balanceSheet.assets.map((a) =>
      a.id === assetId ? { ...a, monthlySIPAmount: Math.max(0, sipAmount) } : a
    );
    set({
      balanceSheet: {
        ...balanceSheet,
        assets: updatedAssets,
      },
    });
  },

  repayDebtLumpSum: (liabilityId: string, amount: number) => {
    const { balanceSheet } = get();
    if (balanceSheet.liquidCash < amount) return; // Insufficient cash

    let paid = 0;
    const updatedLiab = balanceSheet.liabilities
      .map((l) => {
        if (l.id === liabilityId) {
          const pay = Math.min(amount, l.remainingBalance);
          paid = pay;
          return {
            ...l,
            remainingBalance: Math.max(0, l.remainingBalance - pay),
          };
        }
        return l;
      })
      .filter((l) => l.remainingBalance > 0);

    const totalLiab = updatedLiab.reduce((s, l) => s + l.remainingBalance, 0);
    const newCash = balanceSheet.liquidCash - paid;
    const netWorth = newCash + balanceSheet.emergencyFund + balanceSheet.investmentsTotal - totalLiab;

    set({
      balanceSheet: {
        ...balanceSheet,
        liquidCash: newCash,
        liabilitiesTotal: totalLiab,
        liabilities: updatedLiab,
        netWorth,
      },
    });
  },

  sendCoachMessage: (query: string) => {
    const { profile, balanceSheet, budget, healthScore, decisionLogs, coachMessages } = get();

    const userMsg: CoachMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    const dummyCashFlow: MonthlyCashFlowReport = {
      month: profile.currentMonth,
      year: 2026,
      totalIncome: budget.baseSalary,
      totalFixedExpenses: budget.fixedNeeds.rent * 1.5,
      totalDiscretionaryExpenses: 8000,
      totalEMIs: balanceSheet.liabilities.reduce((s, l) => s + l.monthlyEMI, 0),
      totalSIPContributions: balanceSheet.assets.reduce((s, a) => s + (a.monthlySIPAmount || 0), 0),
      emergencyContribution: 0,
      netSavingsOrDeficit: 5000,
      beginningCash: balanceSheet.liquidCash,
      endingCash: balanceSheet.liquidCash,
      penaltyCharges: 0,
    };

    const coachReply = CoachEngine.answerUserQuery(
      query,
      profile,
      balanceSheet,
      dummyCashFlow,
      healthScore,
      decisionLogs
    );

    set({
      coachMessages: [...coachMessages, userMsg, coachReply],
    });
  },

  setActiveTab: (tab: AppTab) => {
    set({ activeTab: tab });
  },

  resetSimulation: () => {
    set({
      isInitialized: false,
      activeTab: 'dashboard',
    });
  },
}));
