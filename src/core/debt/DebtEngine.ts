/**
 * Debt & Loan Amortization Engine
 * Handles reducing balance EMI, interest obligations, credit card finance charges, and debt ratios.
 */

import { LiabilityItem, LiabilityType } from '../types/finance';

export class DebtEngine {
  /**
   * Calculates monthly EMI using the standard reducing-balance formula:
   * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
   */
  public static calculateMonthlyEMI(principal: number, annualRate: number, tenureMonths: number): number {
    if (principal <= 0 || tenureMonths <= 0) return 0;
    if (annualRate <= 0) return Math.round(principal / tenureMonths);

    const monthlyRate = annualRate / 12;
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    return Math.round(emi);
  }

  /**
   * Calculates total interest payable over the loan tenure
   */
  public static calculateTotalInterest(principal: number, annualRate: number, tenureMonths: number): number {
    const emi = this.calculateMonthlyEMI(principal, annualRate, tenureMonths);
    const totalPayment = emi * tenureMonths;
    return Math.max(0, totalPayment - principal);
  }

  /**
   * Creates a new liability object with accurate amortization numbers
   */
  public static createLiability(
    type: LiabilityType,
    name: string,
    principal: number,
    annualRate: number,
    tenureMonths: number,
    isCreditCard: boolean = false
  ): LiabilityItem {
    const monthlyEMI = isCreditCard 
      ? Math.max(500, Math.round(principal * 0.05)) // Min 5% for credit card
      : this.calculateMonthlyEMI(principal, annualRate, tenureMonths);

    return {
      id: `liab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      name,
      principalAmount: principal,
      remainingBalance: principal,
      annualInterestRate: annualRate,
      monthlyEMI,
      remainingTenureMonths: tenureMonths,
      totalTenureMonths: tenureMonths,
      isCreditCard,
      creditLimit: isCreditCard ? Math.max(50000, principal * 1.5) : undefined,
      minimumDue: isCreditCard ? Math.max(500, Math.round(principal * 0.05)) : undefined,
    };
  }

  /**
   * Processes a monthly payment cycle for a list of liabilities.
   * Returns paid EMI total, interest paid total, and updated liability list.
   */
  public static processMonthlyRepayments(liabilities: LiabilityItem[]): {
    updatedLiabilities: LiabilityItem[];
    totalPaid: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
  } {
    let totalPaid = 0;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;

    const updatedLiabilities: LiabilityItem[] = [];

    for (const item of liabilities) {
      if (item.remainingBalance <= 0) continue;

      const monthlyRate = item.annualInterestRate / 12;
      const interestForMonth = Math.round(item.remainingBalance * monthlyRate);
      
      // If credit card balance carries over with interest
      let payment = item.monthlyEMI;
      if (payment > item.remainingBalance + interestForMonth) {
        payment = item.remainingBalance + interestForMonth;
      }

      const principalPart = Math.max(0, payment - interestForMonth);
      const newRemaining = Math.max(0, item.remainingBalance - principalPart);
      const newTenure = Math.max(0, item.remainingTenureMonths - 1);

      totalPaid += payment;
      totalInterestPaid += interestForMonth;
      totalPrincipalPaid += principalPart;

      // Keep only if still having balance
      if (newRemaining > 0) {
        updatedLiabilities.push({
          ...item,
          remainingBalance: newRemaining,
          remainingTenureMonths: newTenure,
          minimumDue: item.isCreditCard ? Math.max(500, Math.round(newRemaining * 0.05)) : undefined,
        });
      }
    }

    return {
      updatedLiabilities,
      totalPaid,
      totalInterestPaid,
      totalPrincipalPaid,
    };
  }

  /**
   * Evaluates debt burden ratio (Total EMIs / Monthly Income)
   */
  public static getDebtToIncomeRatio(totalMonthlyEMIs: number, monthlyIncome: number): number {
    if (monthlyIncome <= 0) return 1.0;
    return Math.min(1.0, totalMonthlyEMIs / monthlyIncome);
  }
}
