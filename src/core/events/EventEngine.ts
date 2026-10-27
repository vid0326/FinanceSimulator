/**
 * Event Engine
 * Manages scenario selection, condition-based event triggering, and consequence resolution.
 */

import { LifeScenarioEvent, DecisionOption, ConsequenceImpact, EventDecisionLog } from '../types/events';
import { BalanceSheet, MonthlyBudget } from '../types/finance';
import { LifeStage, UserProfile } from '../types/profile';
import { SCENARIO_LIBRARY } from './scenarios';
import { DebtEngine } from '../debt/DebtEngine';
import { InvestmentEngine } from '../investment/InvestmentEngine';

export class EventEngine {
  /**
   * Retrieves an appropriate scenario event for the current month and profile state.
   */
  public static pickNextScenario(
    profile: UserProfile,
    triggeredEventIds: string[],
    balanceSheet: BalanceSheet
  ): LifeScenarioEvent | null {
    // 1. Filter candidate scenarios by life stage and one-time criteria
    const eligible = SCENARIO_LIBRARY.filter((scenario) => {
      if (scenario.oneTimeOnly && triggeredEventIds.includes(scenario.id)) {
        return false;
      }

      // Check stage compatibility
      const stageMatches =
        scenario.applicableStages.includes(profile.currentStage) ||
        (profile.currentStage === 'zero' && scenario.applicableStages.includes('student'));

      if (!stageMatches) {
        return false;
      }

      return true;
    });

    if (eligible.length === 0) {
      const allRepeatable = SCENARIO_LIBRARY.filter((s) => !s.oneTimeOnly);
      if (allRepeatable.length === 0) return SCENARIO_LIBRARY[0];
      return allRepeatable[Math.floor(Math.random() * allRepeatable.length)];
    }

    // 2. Separate into unplayed and repeatable pool
    const unplayed = eligible.filter((s) => !triggeredEventIds.includes(s.id));
    const candidates = unplayed.length > 0 ? unplayed : eligible;

    // 3. Dynamic context-aware weight scoring (life is unpredictable & context-driven)
    const weightedCandidates = candidates.map((item) => {
      let weight = 1.0;

      // Low cash increases vulnerability to surprises and small emergencies
      if (balanceSheet.liquidCash < 5000 && item.category === 'emergency') {
        weight += 1.8;
      }
      // High investments unlock market volatility and asset decisions
      if (balanceSheet.investmentsTotal > 40000 && (item.category === 'market' || item.category === 'investment')) {
        weight += 1.5;
      }
      // March is tax season in India
      if (profile.currentMonth === 3 && item.category === 'tax') {
        weight += 2.2;
      }
      // October/November is festive celebration season
      if ((profile.currentMonth === 10 || profile.currentMonth === 11) && item.category === 'lifestyle') {
        weight += 1.8;
      }

      return { item, weight };
    });

    // 4. Weighted random sampling (True Stochastic Selection)
    const totalWeight = weightedCandidates.reduce((sum, w) => sum + w.weight, 0);
    let randomThreshold = Math.random() * totalWeight;

    for (const candidate of weightedCandidates) {
      randomThreshold -= candidate.weight;
      if (randomThreshold <= 0) {
        return candidate.item;
      }
    }

    // Fallback to random pick
    const randomIdx = Math.floor(Math.random() * candidates.length);
    return candidates[randomIdx];
  }

  /**
   * Applies the financial and behavioral consequences of a selected decision.
   */
  public static applyDecisionConsequence(
    decision: DecisionOption,
    event: LifeScenarioEvent,
    currentBalanceSheet: BalanceSheet,
    currentBudget: MonthlyBudget,
    profile: UserProfile
  ): {
    updatedBalanceSheet: BalanceSheet;
    updatedBudget: MonthlyBudget;
    decisionLog: EventDecisionLog;
  } {
    const c = decision.consequence;
    let newCash = currentBalanceSheet.liquidCash + c.cashDelta;
    let newSavings = currentBalanceSheet.emergencyFund + c.savingsDelta;
    let newAssets = [...currentBalanceSheet.assets];
    let newLiabilities = [...currentBalanceSheet.liabilities];

    // Handle new liability (loans / credit cards)
    if (c.newDebtItem) {
      const item = c.newDebtItem;
      const createdLiab = DebtEngine.createLiability(
        item.type,
        item.name,
        item.principal,
        item.annualInterestRate,
        item.tenureMonths,
        item.type === 'credit_card'
      );
      newLiabilities.push(createdLiab);
    }

    // Handle new or boosted investment asset
    if (c.investmentDelta) {
      const delta = c.investmentDelta;
      const existingIndex = newAssets.findIndex((a) => a.type === delta.type);

      if (existingIndex >= 0) {
        newAssets[existingIndex] = {
          ...newAssets[existingIndex],
          investedAmount: newAssets[existingIndex].investedAmount + delta.amount,
          currentValue: newAssets[existingIndex].currentValue + delta.amount,
        };
      } else {
        const createdAsset = InvestmentEngine.createDefaultAsset(
          delta.type,
          delta.name,
          delta.amount,
          0
        );
        newAssets.push(createdAsset);
      }
    }

    // Recalculate totals
    const totalInvestments = newAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalLiab = newLiabilities.reduce((sum, l) => sum + l.remainingBalance, 0);
    const netWorth = newCash + newSavings + totalInvestments - totalLiab;

    const updatedBalanceSheet: BalanceSheet = {
      liquidCash: newCash,
      emergencyFund: newSavings,
      investmentsTotal: totalInvestments,
      assets: newAssets,
      liabilitiesTotal: totalLiab,
      liabilities: newLiabilities,
      netWorth,
    };

    // Update budget if salary or fixed expenses changed
    const updatedBudget: MonthlyBudget = {
      ...currentBudget,
      baseSalary: currentBudget.baseSalary + (c.monthlyIncomeDelta || 0),
      fixedNeeds: {
        ...currentBudget.fixedNeeds,
        rent: currentBudget.fixedNeeds.rent + (c.monthlyExpenseDelta ? Math.round(c.monthlyExpenseDelta * 0.6) : 0),
      },
    };

    const decisionLog: EventDecisionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      selectedOptionId: decision.id,
      selectedOptionTitle: decision.title,
      monthSimulated: profile.totalMonthsSimulated,
      age: profile.currentAge,
      consequence: c,
      timestamp: Date.now(),
    };

    return {
      updatedBalanceSheet,
      updatedBudget,
      decisionLog,
    };
  }
}
