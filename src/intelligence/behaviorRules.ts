/**
 * Behavioral Pattern Detection Engine
 * Identifies emotional and psychological biases in the user's financial choices.
 */

import { EventDecisionLog } from '../core/types/events';
import { BalanceSheet } from '../core/types/finance';
import { HealthScoreBreakdown } from '../core/types/health';

export interface BehavioralDiagnosis {
  primaryTrait: string;
  description: string;
  strengths: string[];
  blindspots: string[];
  recommendedChallenge: string;
}

export class BehaviorRules {
  public static diagnoseBehavior(
    decisionLogs: EventDecisionLog[],
    currentBalanceSheet: BalanceSheet,
    health: HealthScoreBreakdown
  ): BehavioralDiagnosis {
    // Check for panic selling
    const soldInPanic = decisionLogs.some(
      (log) => log.eventId === 'evt_market_crash_shock' && log.selectedOptionId === 'opt_crash_panic_sell'
    );

    // Check for revolving credit card or heavy borrowing
    const tookHighInterestDebt = decisionLogs.filter(
      (log) => log.consequence.debtDelta > 0 && log.consequence.financialHealthDelta < -8
    ).length;

    // Check emergency fund discipline
    const lowLiquidBuffer = (currentBalanceSheet.liquidCash + currentBalanceSheet.emergencyFund) < 10000;

    // Check disciplined investing
    const regularSIPCount = decisionLogs.filter(
      (log) => log.consequence.investmentDelta !== undefined
    ).length;

    if (soldInPanic) {
      return {
        primaryTrait: 'Emotional Loss-Averse Investor',
        description: 'You tend to react strongly to short-term market turbulence. When assets drop, the pain of paper losses drives you to sell at the bottom rather than riding the cycle.',
        strengths: ['High risk awareness', 'Desire to protect capital'],
        blindspots: ['Mistaking temporary price volatility for permanent capital loss', 'Selling right before recoveries'],
        recommendedChallenge: 'Try the 3-Year Compounding Challenge: Commit to never checking daily portfolio changes and let rupee-cost averaging work.',
      };
    }

    if (tookHighInterestDebt >= 2) {
      return {
        primaryTrait: 'Debt-Leveraged Spender',
        description: 'You frequently utilize EMIs and credit to fund lifestyle purchases or solve short-term cash crunches. Over time, interest obligations eat up your future monthly cash flow.',
        strengths: ['High optimism', 'Values lifestyle enjoyment'],
        blindspots: ['Underestimating cumulative interest drag', 'Committing future unearned income'],
        recommendedChallenge: 'Debt-Free Sprint: Repay high-interest liabilities first before taking on any new monthly subscriptions.',
      };
    }

    if (lowLiquidBuffer && currentBalanceSheet.investmentsTotal > 30000) {
      return {
        primaryTrait: 'The Illiquid Growth Chaser',
        description: 'You direct almost all your money into investments without maintaining accessible cash reserves. A single minor emergency could force you to sell investments or take a loan.',
        strengths: ['High investment enthusiasm', 'Forward-looking mindset'],
        blindspots: ['Neglecting liquidity risk', 'Vulnerable to unexpected life shocks'],
        recommendedChallenge: 'Buffer First: Build a 3-month emergency cushion in a safe Sweep-in FD before adding more equity SIPs.',
      };
    }

    if (regularSIPCount >= 2 && health.totalScore >= 75) {
      return {
        primaryTrait: 'The Disciplined Wealth Architect',
        description: 'You demonstrate calm, systematic financial behavior. You prioritize emergency safety, avoid high-cost consumer debt, and allow investments time to compound.',
        strengths: ['High delayed gratification', 'Structured cash flow management', 'Resilient emotional control'],
        blindspots: ['May sometimes be overly conservative and hesitate to spend on joyful experiences'],
        recommendedChallenge: 'Wealth Preservation & Tax Optimization: Explore asset allocation strategies and long-term goal milestone mapping.',
      };
    }

    return {
      primaryTrait: 'The Emerging Financial Explorer',
      description: 'You are actively learning how money flows between income, living expenses, debt, and assets. Every decision gives you real-time feedback without any real-world risk.',
      strengths: ['Curious mindset', 'Willingness to experiment and learn from mistakes'],
      blindspots: ['Inconsistent monthly budgeting', 'Underestimating the stealth impact of small recurring expenses'],
      recommendedChallenge: 'Track the 50/30/20 Rule: Aim to save and invest at least 20% of next month’s income.',
    };
  }
}
