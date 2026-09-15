/**
 * Accounting & Ledger Engine
 * Deterministic balance sheet and cash flow simulation for each turn (month).
 */

import { BalanceSheet, MonthlyBudget, MonthlyCashFlowReport, MarketCondition } from '../types/finance';
import { InvestmentEngine } from '../investment/InvestmentEngine';
import { DebtEngine } from '../debt/DebtEngine';

export class AccountingEngine {
  /**
   * Executes a complete monthly cycle tick.
   */
  public static processMonthlyTick(
    previousBalanceSheet: BalanceSheet,
    budget: MonthlyBudget,
    marketCondition: MarketCondition,
    monthNumber: number,
    yearNumber: number
  ): {
    updatedBalanceSheet: BalanceSheet;
    cashFlowReport: MonthlyCashFlowReport;
    penaltyFeeCharged: number;
  } {
    let currentCash = previousBalanceSheet.liquidCash;
    let penaltyFeeCharged = 0;

    // 1. Total Income
    const totalIncome = budget.baseSalary + (budget.bonusOrExtraIncome || 0);
    currentCash += totalIncome;

    // 2. Fixed Expenses
    const totalFixedExpenses = 
      budget.fixedNeeds.rent +
      budget.fixedNeeds.utilities +
      budget.fixedNeeds.groceries +
      budget.fixedNeeds.healthInsurance;
    currentCash -= totalFixedExpenses;

    // 3. Discretionary Expenses
    const totalDiscretionaryExpenses = 
      budget.discretionaryWants.entertainment +
      budget.discretionaryWants.diningOut +
      budget.discretionaryWants.shopping;
    currentCash -= totalDiscretionaryExpenses;

    // 4. Process Debt Repayments (EMIs)
    const {
      updatedLiabilities,
      totalPaid: totalEMIsPaid,
    } = DebtEngine.processMonthlyRepayments(previousBalanceSheet.liabilities);
    currentCash -= totalEMIsPaid;

    // 5. Process Investment Portfolio & SIPs
    // Calculate total SIP amount wanted
    const totalSIPWanted = previousBalanceSheet.assets.reduce(
      (sum, a) => sum + (a.monthlySIPAmount || 0),
      0
    );

    let actualSIPInvested = 0;
    let assetsAfterSIP = previousBalanceSheet.assets;

    // If sufficient cash is available, process full SIP; otherwise reduce or pause SIP
    if (currentCash >= totalSIPWanted) {
      actualSIPInvested = totalSIPWanted;
      currentCash -= actualSIPInvested;
      assetsAfterSIP = previousBalanceSheet.assets;
    } else if (currentCash > 0) {
      // Partial SIP investment with available funds
      actualSIPInvested = Math.floor(currentCash * 0.5);
      currentCash -= actualSIPInvested;
    }

    const {
      updatedAssets,
      totalPortfolioValue,
    } = InvestmentEngine.processMonthlyPortfolio(assetsAfterSIP, marketCondition);

    // 6. Handle Overdraft / Deficit Penalty
    let finalLiabilities = updatedLiabilities;
    if (currentCash < 0) {
      // User suffered cash deficit - apply penalty charge
      penaltyFeeCharged = 750; // Bank overdraft / bouncing penalty fee
      currentCash -= penaltyFeeCharged;

      // Wrap deficit into an emergency credit liability if below -₹1,000
      if (currentCash < -1000) {
        const deficitDebt = Math.abs(currentCash);
        finalLiabilities = [
          ...finalLiabilities,
          DebtEngine.createLiability(
            'credit_card',
            'Emergency Cash Deficit Overdraft',
            deficitDebt,
            0.36, // 36% p.a.
            6,
            true
          ),
        ];
        currentCash = 0;
      }
    }

    // 7. Calculate Net Worth
    const totalLiabilities = finalLiabilities.reduce((sum, l) => sum + l.remainingBalance, 0);
    const netWorth = currentCash + previousBalanceSheet.emergencyFund + totalPortfolioValue - totalLiabilities;

    const updatedBalanceSheet: BalanceSheet = {
      liquidCash: currentCash,
      emergencyFund: previousBalanceSheet.emergencyFund,
      investmentsTotal: totalPortfolioValue,
      assets: updatedAssets,
      liabilitiesTotal: totalLiabilities,
      liabilities: finalLiabilities,
      netWorth,
    };

    const netSavingsOrDeficit =
      totalIncome - (totalFixedExpenses + totalDiscretionaryExpenses + totalEMIsPaid + actualSIPInvested);

    const cashFlowReport: MonthlyCashFlowReport = {
      month: monthNumber,
      year: yearNumber,
      totalIncome,
      totalFixedExpenses,
      totalDiscretionaryExpenses,
      totalEMIs: totalEMIsPaid,
      totalSIPContributions: actualSIPInvested,
      emergencyContribution: 0,
      netSavingsOrDeficit,
      beginningCash: previousBalanceSheet.liquidCash,
      endingCash: currentCash,
      penaltyCharges: penaltyFeeCharged,
    };

    return {
      updatedBalanceSheet,
      cashFlowReport,
      penaltyFeeCharged,
    };
  }
}
