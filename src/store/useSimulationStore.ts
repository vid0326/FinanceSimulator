/**
 * Central Zustand Simulation Store
 * Manages full game loop, profile, balance sheet, events, coach chat, and gamification.
 */

import { create } from 'zustand';
import { UserProfile, LifeStage, STAGE_PRESETS, SimulationInitOptions } from '../core/types/profile';
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
import { DebtEngine } from '../core/debt/DebtEngine';
import { CoachEngine, CoachMessage } from '../intelligence/coachEngine';
import { CareerEngine, PromotionOffer } from '../core/career/CareerEngine';
import { requestBackgroundSync, requestPromotionLog } from '../services/syncBridge';

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
  monthsInCurrentRole: number;
  activePromotionOffer: PromotionOffer | null;
  selectedCharacterId: string;

  // Actions
  initializeSimulation: (
    optionsOrStage: SimulationInitOptions | LifeStage,
    userName?: string,
    avatarSeed?: string
  ) => void;
  advanceMonth: () => void;
  selectDecision: (decision: DecisionOption) => void;
  dismissConsequence: () => void;
  acceptPromotion: (optionId: string) => void;
  dismissPromotion: () => void;
  updateAssetSIP: (assetId: string, sipAmount: number) => void;
  repayDebtLumpSum: (liabilityId: string, amount: number) => void;
  sendCoachMessage: (query: string) => void;
  setActiveTab: (tab: AppTab) => void;
  resetSimulation: () => void;
  restoreCloudSave: (saveData: any) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Player',
  avatarSeed: 'avatar_1',
  currentAge: 18,
  currentMonth: 1,
  totalMonthsSimulated: 0,
  currentStage: 'zero',
  career: 'Blank Canvas',
  riskTolerance: 'moderate',
  financialGoal: {
    title: 'Financial Independence',
    targetAmount: 1000000,
    targetYears: 5,
  },
};

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  isInitialized: false,
  activeTab: 'dashboard',
  profile: DEFAULT_PROFILE,
  balanceSheet: {
    liquidCash: 0,
    emergencyFund: 0,
    investmentsTotal: 0,
    assets: [],
    liabilitiesTotal: 0,
    liabilities: [],
    netWorth: 0,
  },
  budget: {
    baseSalary: 0,
    bonusOrExtraIncome: 0,
    fixedNeeds: {
      rent: 0,
      utilities: 0,
      groceries: 0,
      healthInsurance: 0,
    },
    discretionaryWants: {
      entertainment: 0,
      diningOut: 0,
      shopping: 0,
    },
  },
  currentMarket: 'stagnant',
  cashFlowHistory: [],
  historicalSnapshots: [],
  healthScore: {
    savingsRateScore: 0,
    debtManagementScore: 20,
    emergencyFundScore: 0,
    diversificationScore: 0,
    investmentDisciplineScore: 5,
    cashFlowStabilityScore: 6,
    totalScore: 31,
    grade: 'D',
    keyStrength: 'Debt Control',
    keyVulnerability: 'Emergency Buffer',
  },
  lifeSatisfaction: 75,
  gamification: {
    xp: 0,
    level: 1,
    levelTitle: 'Ground Zero',
    achievements: [],
    decisionsMadeCount: 0,
    streakMonths: 0,
  },
  currentEvent: null,
  decisionLogs: [],
  triggeredEventIds: [],
  lastConsequence: null,
  coachMessages: [],
  monthsInCurrentRole: 0,
  activePromotionOffer: null,
  selectedCharacterId: 'char_ground_zero',

  initializeSimulation: (
    optionsOrStage: SimulationInitOptions | LifeStage,
    userName?: string,
    avatarSeed: string = 'avatar_1'
  ) => {
    let name = 'Player';
    let age = 18;
    let stageId: LifeStage = 'zero';
    let career = 'Blank Canvas';
    let startingCash = 0;
    let startingSavings = 0;
    let startingDebt = 0;
    let monthlyIncome = 0;
    let fixedExpenses = 0;
    let seed = avatarSeed;

    if (typeof optionsOrStage === 'object') {
      const opts = optionsOrStage;
      name = opts.name?.trim() || 'Player';
      stageId = opts.stageId || 'zero';
      const preset = STAGE_PRESETS[stageId] || STAGE_PRESETS.zero;
      age = opts.age ?? preset.age;
      career = opts.career || preset.career;
      startingCash = opts.startingCash ?? preset.startingCash;
      startingSavings = opts.startingSavings ?? preset.startingSavings;
      startingDebt = opts.startingDebt ?? preset.startingDebt;
      monthlyIncome = opts.monthlyIncome ?? preset.monthlyIncome;
      fixedExpenses = opts.fixedExpenses ?? preset.fixedMonthlyExpenses;
      seed = opts.avatarSeed || avatarSeed;
    } else {
      stageId = optionsOrStage;
      const preset = STAGE_PRESETS[stageId] || STAGE_PRESETS.zero;
      name = userName?.trim() || 'Player';
      age = preset.age;
      career = preset.career;
      startingCash = preset.startingCash;
      startingSavings = preset.startingSavings;
      startingDebt = preset.startingDebt;
      monthlyIncome = preset.monthlyIncome;
      fixedExpenses = preset.fixedMonthlyExpenses;
      seed = avatarSeed;
    }

    const newProfile: UserProfile = {
      name,
      avatarSeed: seed,
      currentAge: age,
      currentMonth: 1,
      totalMonthsSimulated: 0,
      currentStage: stageId,
      career,
      riskTolerance: 'moderate',
      financialGoal: {
        title: 'Financial Independence',
        targetAmount: 1000000,
        targetYears: 5,
      },
    };

    // No hardcoded artificial assets! Players build their investment portfolio from scratch.
    const starterAssets: any[] = [];

    const starterLiabilities = startingDebt > 0
      ? [
          DebtEngine.createLiability(
            'education_loan',
            'Starter Debt / Loan',
            startingDebt,
            0.10, // 10% interest
            36 // 36 months tenure
          ),
        ]
      : [];

    const initialBS: BalanceSheet = {
      liquidCash: startingCash,
      emergencyFund: startingSavings,
      investmentsTotal: 0,
      assets: starterAssets,
      liabilitiesTotal: startingDebt,
      liabilities: starterLiabilities,
      netWorth: startingCash + startingSavings - startingDebt,
    };

    const initialBudget: MonthlyBudget = {
      baseSalary: monthlyIncome,
      bonusOrExtraIncome: 0,
      fixedNeeds: {
        rent: Math.round(fixedExpenses * 0.6),
        utilities: Math.round(fixedExpenses * 0.15),
        groceries: Math.round(fixedExpenses * 0.2),
        healthInsurance: Math.round(fixedExpenses * 0.05),
      },
      discretionaryWants: {
        entertainment: Math.round(monthlyIncome * 0.08),
        diningOut: Math.round(monthlyIncome * 0.07),
        shopping: Math.round(monthlyIncome * 0.05),
      },
    };

    const initialHealth = HealthEngine.calculateHealthScore(
      initialBS,
      {
        month: 1,
        year: 2026,
        totalIncome: monthlyIncome,
        totalFixedExpenses: fixedExpenses,
        totalDiscretionaryExpenses: Math.round(monthlyIncome * 0.2),
        totalEMIs: starterLiabilities.reduce((sum, l) => sum + l.monthlyEMI, 0),
        totalSIPContributions: 0,
        emergencyContribution: 0,
        netSavingsOrDeficit: Math.max(0, monthlyIncome - fixedExpenses - Math.round(monthlyIncome * 0.2)),
        beginningCash: startingCash,
        endingCash: startingCash,
        penaltyCharges: 0,
      },
      0
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
          age: age,
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

    // Evaluate Career Promotion & Appraisal
    const nextRoleMonths = get().monthsInCurrentRole + 1;
    let promoOffer: PromotionOffer | null = null;
    if (updatedProfile.career !== 'Blank Canvas' && budget.baseSalary > 0) {
      promoOffer = CareerEngine.evaluatePromotion(
        updatedProfile,
        budget.baseSalary,
        nextRoleMonths,
        updatedHealth.totalScore
      );
    }

    set({
      profile: updatedProfile,
      balanceSheet: updatedBalanceSheet,
      currentMarket: newMarket,
      cashFlowHistory: [cashFlowReport, ...cashFlowHistory.slice(0, 11)],
      historicalSnapshots: [...historicalSnapshots, newSnapshot],
      healthScore: updatedHealth,
      lifeSatisfaction: newSatisfaction,
      currentEvent: nextScenario,
      monthsInCurrentRole: promoOffer ? get().monthsInCurrentRole : nextRoleMonths,
      activePromotionOffer: promoOffer,
      gamification: {
        ...gamification,
        xp: newXP,
        level: newLevel,
        levelTitle,
        streakMonths: gamification.streakMonths + 1,
      },
    });

    // Auto-sync in background on month advance
    requestBackgroundSync();
  },

  acceptPromotion: (optionId: string) => {
    const { activePromotionOffer, budget, profile, balanceSheet } = get();
    if (!activePromotionOffer) return;

    const chosenOption =
      activePromotionOffer.lifestyleInflationOptions.find((o) => o.id === optionId) ||
      activePromotionOffer.lifestyleInflationOptions[0];

    const salaryDelta = activePromotionOffer.newSalary - budget.baseSalary;
    const additionalSIP = Math.round(salaryDelta * chosenOption.sipIncreasePercentage);
    const additionalExpenses = Math.round(salaryDelta * chosenOption.expenseIncreasePercentage);

    // Update budget
    const updatedBudget: MonthlyBudget = {
      ...budget,
      baseSalary: activePromotionOffer.newSalary,
      discretionaryWants: {
        ...budget.discretionaryWants,
        diningOut: budget.discretionaryWants.diningOut + Math.round(additionalExpenses * 0.4),
        entertainment: budget.discretionaryWants.entertainment + Math.round(additionalExpenses * 0.3),
        shopping: budget.discretionaryWants.shopping + Math.round(additionalExpenses * 0.3),
      },
    };

    // Credit one-time performance bonus to cash
    const updatedBalanceSheet: BalanceSheet = {
      ...balanceSheet,
      liquidCash: balanceSheet.liquidCash + activePromotionOffer.performanceBonus,
      netWorth: balanceSheet.netWorth + activePromotionOffer.performanceBonus,
    };

    // If option allocated to SIP, boost active assets SIP or create a new SIP asset
    if (additionalSIP > 0) {
      if (updatedBalanceSheet.assets.length > 0) {
        updatedBalanceSheet.assets[0].monthlySIPAmount =
          (updatedBalanceSheet.assets[0].monthlySIPAmount || 0) + additionalSIP;
      } else {
        updatedBalanceSheet.assets.push(
          InvestmentEngine.createDefaultAsset('mutual_fund_equity', 'Nifty 50 Index Fund', 0, additionalSIP)
        );
      }
    }

    const updatedProfile: UserProfile = {
      ...profile,
      career: activePromotionOffer.newTitle,
    };

    set({
      profile: updatedProfile,
      budget: updatedBudget,
      balanceSheet: updatedBalanceSheet,
      monthsInCurrentRole: 0,
      activePromotionOffer: null,
      lifeSatisfaction: Math.min(100, get().lifeSatisfaction + chosenOption.lifeSatisfactionImpact),
    });

    // Wire up backend promotion logging & background sync
    requestPromotionLog({
      previousTitle: profile.career,
      newTitle: activePromotionOffer.newTitle,
      previousSalary: budget.baseSalary,
      newSalary: activePromotionOffer.newSalary,
      hikePercentage: activePromotionOffer.hikePercentage,
      bonusAmount: activePromotionOffer.performanceBonus,
      lifestyleChoice: chosenOption.title,
      monthSimulated: profile.totalMonthsSimulated,
    });
    requestBackgroundSync();
  },

  dismissPromotion: () => {
    set({ activePromotionOffer: null });
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

    // Auto-sync decision consequences to cloud
    requestBackgroundSync();
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

  restoreCloudSave: (saveData: any) => {
    set((state) => ({
      isInitialized: true,
      profile: {
        ...state.profile,
        name: saveData.characterName || state.profile.name,
        currentAge: saveData.currentAge ?? state.profile.currentAge,
        currentMonth: saveData.currentMonth ?? state.profile.currentMonth,
        currentStage: (saveData.currentStage as LifeStage) || state.profile.currentStage,
        totalMonthsSimulated: saveData.totalMonthsSimulated ?? state.profile.totalMonthsSimulated,
      },
      balanceSheet: saveData.balanceSheet || state.balanceSheet,
      budget: saveData.budget || state.budget,
      healthScore: saveData.healthScore || state.healthScore,
      gamification: saveData.gamification || state.gamification,
      decisionLogs: saveData.decisionLogs || state.decisionLogs,
    }));
  },
}));
