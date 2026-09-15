/**
 * Financial Health & Resilience Scorer
 * Evaluates the user's overall financial well-being across 6 core pedagogical pillars.
 */

import { BalanceSheet, MonthlyCashFlowReport } from '../types/finance';
import { HealthScoreBreakdown } from '../types/health';
import { InvestmentEngine } from '../investment/InvestmentEngine';
import { DebtEngine } from '../debt/DebtEngine';

export class HealthEngine {
  public static calculateHealthScore(
    balanceSheet: BalanceSheet,
    cashFlow: MonthlyCashFlowReport,
    consecutiveSIPMonths: number = 0
  ): HealthScoreBreakdown {
    const monthlyIncome = Math.max(1, cashFlow.totalIncome);
    const monthlyEssentialExpenses = Math.max(1, cashFlow.totalFixedExpenses);

    // 1. Savings & Investment Rate (Max 20 pts)
    // Target is >= 20% of net income directed towards savings/SIP
    const monthlySavedOrInvested = cashFlow.totalSIPContributions + Math.max(0, cashFlow.netSavingsOrDeficit);
    const savingsRatio = monthlySavedOrInvested / monthlyIncome;
    const savingsRateScore = Math.min(20, Math.round((savingsRatio / 0.25) * 20));

    // 2. Debt Management Score (Max 20 pts)
    // EMI / Income ratio: <= 20% is ideal, 30% is okay, > 50% is critical danger
    const dti = DebtEngine.getDebtToIncomeRatio(cashFlow.totalEMIs, monthlyIncome);
    let debtManagementScore = 20;
    if (dti > 0.6) {
      debtManagementScore = 2;
    } else if (dti > 0.4) {
      debtManagementScore = 7;
    } else if (dti > 0.25) {
      debtManagementScore = 13;
    } else if (dti > 0.1) {
      debtManagementScore = 17;
    } else if (dti === 0) {
      debtManagementScore = 20;
    }

    // 3. Emergency Fund Cushion (Max 15 pts)
    // Liquid Cash + Emergency Fund vs Essential Expenses
    // Target is 3 to 6 months of expenses
    const liquidTotal = balanceSheet.liquidCash + balanceSheet.emergencyFund;
    const monthsCovered = liquidTotal / monthlyEssentialExpenses;
    let emergencyFundScore = 0;
    if (monthsCovered >= 5) {
      emergencyFundScore = 15;
    } else if (monthsCovered >= 3) {
      emergencyFundScore = 12;
    } else if (monthsCovered >= 1.5) {
      emergencyFundScore = 8;
    } else if (monthsCovered >= 0.5) {
      emergencyFundScore = 4;
    } else {
      emergencyFundScore = 1;
    }

    // 4. Portfolio Diversification (Max 15 pts)
    const { score: diversificationScore } = InvestmentEngine.calculateDiversificationScore(balanceSheet.assets);

    // 5. Investment Regularity & Habit (Max 20 pts)
    // Rewards consistent SIPs and compounding participation
    let investmentDisciplineScore = 5;
    if (cashFlow.totalSIPContributions > 0) {
      investmentDisciplineScore = Math.min(20, 8 + Math.min(12, consecutiveSIPMonths * 2));
    } else if (balanceSheet.investmentsTotal > 0) {
      investmentDisciplineScore = 10;
    }

    // 6. Cash Flow Stability & Margin (Max 10 pts)
    let cashFlowStabilityScore = 10;
    if (cashFlow.endingCash < 0) {
      cashFlowStabilityScore = 0; // Overdraft / liquidity deficit
    } else if (cashFlow.netSavingsOrDeficit < 0) {
      cashFlowStabilityScore = 3; // Negative monthly cash flow
    } else if (cashFlow.netSavingsOrDeficit < monthlyIncome * 0.05) {
      cashFlowStabilityScore = 6; // Thin margin
    }

    const totalScore = Math.min(
      100,
      Math.max(
        0,
        savingsRateScore +
          debtManagementScore +
          emergencyFundScore +
          diversificationScore +
          investmentDisciplineScore +
          cashFlowStabilityScore
      )
    );

    // Assign Grade
    let grade: HealthScoreBreakdown['grade'] = 'F';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 55) grade = 'C';
    else if (totalScore >= 40) grade = 'D';

    // Identify key strength and vulnerability
    const scores = [
      { name: 'Savings Rate', val: savingsRateScore / 20 },
      { name: 'Debt Control', val: debtManagementScore / 20 },
      { name: 'Emergency Buffer', val: emergencyFundScore / 15 },
      { name: 'Diversification', val: diversificationScore / 15 },
      { name: 'Investment Discipline', val: investmentDisciplineScore / 20 },
      { name: 'Cash Flow Stability', val: cashFlowStabilityScore / 10 },
    ];

    scores.sort((a, b) => b.val - a.val);
    const keyStrength = scores[0].name;
    const keyVulnerability = scores[scores.length - 1].name;

    return {
      savingsRateScore,
      debtManagementScore,
      emergencyFundScore,
      diversificationScore,
      investmentDisciplineScore,
      cashFlowStabilityScore,
      totalScore,
      grade,
      keyStrength,
      keyVulnerability,
    };
  }
}
