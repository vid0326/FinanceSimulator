/**
 * Investment & Market Simulation Engine
 * Handles asset valuation, monthly compounding/returns, SIP execution, and portfolio diversification metrics.
 */

import { AssetItem, AssetType, MarketCondition } from '../types/finance';

export class InvestmentEngine {
  /**
   * Returns standard monthly growth multiplier for an asset type under current market conditions
   */
  public static getMonthlyReturnRate(
    type: AssetType,
    market: MarketCondition,
    baseAnnualReturn: number
  ): number {
    const baseMonthly = baseAnnualReturn / 12;

    switch (type) {
      case 'cash':
      case 'savings_account':
        return 0.03 / 12; // ~3% p.a.

      case 'fixed_deposit':
        return 0.068 / 12; // ~6.8% p.a. guaranteed

      case 'bonds':
      case 'mutual_fund_debt':
        // Steady yields, slightly affected by rates
        if (market === 'crash') return baseMonthly * 0.9;
        return baseMonthly;

      case 'mutual_fund_equity':
      case 'stocks':
        // High beta to market conditions
        switch (market) {
          case 'bull':
            return baseMonthly + 0.015; // +1.5% extra monthly boost
          case 'bear':
            return -0.018; // -1.8% monthly drawdown
          case 'crash':
            return -0.22; // Sudden -22% crash
          case 'recovery':
            return baseMonthly + 0.022; // +2.2% rapid rebound
          case 'stagnant':
          default:
            return baseMonthly;
        }

      case 'gold':
        // Safe-haven asset: often rises during bear/crash
        switch (market) {
          case 'crash':
            return 0.035; // +3.5% safe-haven surge
          case 'bear':
            return 0.012; // +1.2%
          case 'bull':
            return 0.004; // Mild steady gain
          default:
            return baseMonthly;
        }

      default:
        return baseMonthly;
    }
  }

  /**
   * Processes monthly investment cycle: SIP contributions + market growth
   */
  public static processMonthlyPortfolio(
    assets: AssetItem[],
    market: MarketCondition
  ): {
    updatedAssets: AssetItem[];
    totalInvestedThisMonth: number;
    totalPortfolioValue: number;
    portfolioGainsOrLossesThisMonth: number;
  } {
    let totalInvestedThisMonth = 0;
    let totalPortfolioValue = 0;
    let totalPreviousValue = 0;

    const updatedAssets: AssetItem[] = assets.map((asset) => {
      const sip = asset.monthlySIPAmount || 0;
      totalInvestedThisMonth += sip;

      const previousValue = asset.currentValue + sip;
      totalPreviousValue += previousValue;

      const monthlyRate = this.getMonthlyReturnRate(
        asset.type,
        market,
        asset.expectedAnnualReturnRate
      );

      const newValue = Math.max(0, Math.round(previousValue * (1 + monthlyRate)));
      totalPortfolioValue += newValue;

      return {
        ...asset,
        investedAmount: asset.investedAmount + sip,
        currentValue: newValue,
      };
    });

    const portfolioGainsOrLossesThisMonth = totalPortfolioValue - totalPreviousValue;

    return {
      updatedAssets,
      totalInvestedThisMonth,
      totalPortfolioValue,
      portfolioGainsOrLossesThisMonth,
    };
  }

  /**
   * Calculates diversification score (0 to 15) using the Herfindahl-Hirschman Index (HHI)
   * High concentration = High HHI = Low Diversification Score
   */
  public static calculateDiversificationScore(assets: AssetItem[]): {
    score: number; // 0 to 15
    hhi: number;
    feedback: string;
    assetDistribution: Record<string, number>;
  } {
    const validAssets = assets.filter((a) => a.currentValue > 0);
    const totalVal = validAssets.reduce((sum, a) => sum + a.currentValue, 0);

    if (totalVal <= 0 || validAssets.length === 0) {
      return {
        score: 4,
        hhi: 1.0,
        feedback: 'You have not started investing yet. Building a diversified starter portfolio is recommended.',
        assetDistribution: {},
      };
    }

    // Calculate weights
    const distribution: Record<string, number> = {};
    let hhi = 0;

    for (const asset of validAssets) {
      const weight = asset.currentValue / totalVal;
      distribution[asset.name || asset.type] = Math.round(weight * 100);
      hhi += weight * weight; // sum of squared weights
    }

    let score = 0;
    let feedback = '';

    if (hhi > 0.8) {
      // Almost 100% in a single asset
      score = 3;
      feedback = 'Extremely concentrated portfolio! A downturn in this single asset puts your entire net worth at risk.';
    } else if (hhi > 0.5) {
      // Concentrated in 1-2 assets
      score = 7;
      feedback = 'Moderately concentrated. Consider spreading across debt, equity, and safe liquid funds.';
    } else if (hhi > 0.3) {
      // Good spread
      score = 12;
      feedback = 'Well-balanced allocation across multiple asset classes.';
    } else {
      // Excellent diversification
      score = 15;
      feedback = 'Optimal diversification! You have effectively mitigated single-asset drawdown risk.';
    }

    return {
      score,
      hhi,
      feedback,
      assetDistribution: distribution,
    };
  }

  /**
   * Factory to create standard starter investment assets
   */
  public static createDefaultAsset(
    type: AssetType,
    name: string,
    initialAmount: number,
    monthlySIP: number = 0
  ): AssetItem {
    let category: AssetItem['category'] = 'equity';
    let returnRate = 0.12;
    let volatility = 0.18;
    let liquidity: AssetItem['liquidityTier'] = 'short_notice';

    if (type === 'fixed_deposit') {
      category = 'cash_equivalent';
      returnRate = 0.068;
      volatility = 0.01;
      liquidity = 'locked';
    } else if (type === 'bonds' || type === 'mutual_fund_debt') {
      category = 'debt_instrument';
      returnRate = 0.075;
      volatility = 0.04;
      liquidity = 'short_notice';
    } else if (type === 'gold') {
      category = 'commodity';
      returnRate = 0.09;
      volatility = 0.10;
      liquidity = 'short_notice';
    } else if (type === 'savings_account' || type === 'cash') {
      category = 'cash_equivalent';
      returnRate = 0.03;
      volatility = 0.0;
      liquidity = 'immediate';
    }

    return {
      id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      name,
      category,
      investedAmount: initialAmount,
      currentValue: initialAmount,
      expectedAnnualReturnRate: returnRate,
      volatility,
      liquidityTier: liquidity,
      monthlySIPAmount: monthlySIP,
    };
  }
}
