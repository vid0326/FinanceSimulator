/**
 * What-If Sandbox Simulator Screen
 * Compare hypothetical financial scenarios, loan impacts, delayed investing, and compounding timelines.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../../store/useSimulationStore';
import { WhatIfEngine } from '../../core/whatif/WhatIfEngine';
import { WhatIfScenarioInput, WhatIfComparisonResult } from '../../core/types/whatif';
import { WhatIfChart } from '../components/WhatIfChart';
import { formatINR } from '../components/CurrencyText';

type PresetType = 'extra_sip' | 'bike_loan' | 'delay_investing' | 'job_loss';

export const WhatIfScreen: React.FC = () => {
  const profile = useSimulationStore((state) => state.profile);
  const balanceSheet = useSimulationStore((state) => state.balanceSheet);
  const budget = useSimulationStore((state) => state.budget);

  const [activePreset, setActivePreset] = useState<PresetType>('extra_sip');
  const [additionalSIP, setAdditionalSIP] = useState<number>(5000);
  const [horizonMonths, setHorizonMonths] = useState<number>(60);

  // Derive scenario input based on active preset
  const scenarioInput: WhatIfScenarioInput = useMemo(() => {
    switch (activePreset) {
      case 'extra_sip':
        return {
          title: `Save & Invest Extra ₹${additionalSIP.toLocaleString('en-IN')}/Month`,
          monthlyAdditionalSavings: 0,
          monthlyAdditionalSIP: additionalSIP,
          delayInvestingByYears: 0,
          projectionMonths: horizonMonths,
          assumedAnnualEquityReturn: 0.12,
          assumedAnnualInflation: 0.06,
        };

      case 'bike_loan':
        return {
          title: 'Buy ₹1,80,000 Bike on 3-Year EMI (14% Interest)',
          monthlyAdditionalSavings: 0,
          monthlyAdditionalSIP: 0,
          delayInvestingByYears: 0,
          takeNewLoan: {
            principal: 180000,
            annualInterestRate: 0.14,
            tenureMonths: 36,
            purpose: 'Vehicle Loan',
          },
          projectionMonths: horizonMonths,
          assumedAnnualEquityReturn: 0.12,
          assumedAnnualInflation: 0.06,
        };

      case 'delay_investing':
        return {
          title: 'Delay Investing by 5 Years (Start at 27 vs 22)',
          monthlyAdditionalSavings: 0,
          monthlyAdditionalSIP: 0,
          delayInvestingByYears: 5,
          projectionMonths: horizonMonths,
          assumedAnnualEquityReturn: 0.12,
          assumedAnnualInflation: 0.06,
        };

      case 'job_loss':
        return {
          title: 'Survive a 4-Month Job Loss Gap with No Income',
          monthlyAdditionalSavings: 0,
          monthlyAdditionalSIP: 0,
          delayInvestingByYears: 0,
          jobLossPeriodMonths: 4,
          projectionMonths: horizonMonths,
          assumedAnnualEquityReturn: 0.12,
          assumedAnnualInflation: 0.06,
        };
    }
  }, [activePreset, additionalSIP, horizonMonths]);

  // Compute projection dynamically using WhatIfEngine
  const comparisonResult: WhatIfComparisonResult = useMemo(() => {
    return WhatIfEngine.simulateScenario(
      balanceSheet,
      budget,
      profile.currentAge,
      scenarioInput
    );
  }, [balanceSheet, budget, profile.currentAge, scenarioInput]);

  const isNetPositive = comparisonResult.netWorthDifference >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>“What If?” Simulator</Text>
          <Text style={styles.subtitle}>
            Test trade-offs and observe how compounding or loans alter your future.
          </Text>
        </View>

        {/* Preset Selector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'extra_sip' && styles.presetTabActive]}
            onPress={() => setActivePreset('extra_sip')}
          >
            <Ionicons name="trending-up" size={16} color={activePreset === 'extra_sip' ? '#0B0F19' : colors.primary} />
            <Text style={[styles.presetTabText, activePreset === 'extra_sip' && styles.presetTabTextActive]}>
              +₹5k SIP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'bike_loan' && styles.presetTabActive]}
            onPress={() => setActivePreset('bike_loan')}
          >
            <Ionicons name="bicycle" size={16} color={activePreset === 'bike_loan' ? '#0B0F19' : colors.danger} />
            <Text style={[styles.presetTabText, activePreset === 'bike_loan' && styles.presetTabTextActive]}>
              Vehicle Loan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'delay_investing' && styles.presetTabActive]}
            onPress={() => setActivePreset('delay_investing')}
          >
            <Ionicons name="time" size={16} color={activePreset === 'delay_investing' ? '#0B0F19' : colors.accent} />
            <Text style={[styles.presetTabText, activePreset === 'delay_investing' && styles.presetTabTextActive]}>
              Delay 5 Years
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'job_loss' && styles.presetTabActive]}
            onPress={() => setActivePreset('job_loss')}
          >
            <Ionicons name="alert-circle" size={16} color={activePreset === 'job_loss' ? '#0B0F19' : colors.secondaryLight} />
            <Text style={[styles.presetTabText, activePreset === 'job_loss' && styles.presetTabTextActive]}>
              4-Mo Job Loss
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Dynamic Controls for Extra SIP */}
        {activePreset === 'extra_sip' && (
          <View style={styles.controlBox}>
            <Text style={styles.controlLabel}>Additional Monthly SIP Amount</Text>
            <View style={styles.sipStepperRow}>
              {[2000, 5000, 10000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.sipPill, additionalSIP === amt && styles.sipPillActive]}
                  onPress={() => setAdditionalSIP(amt)}
                >
                  <Text style={[styles.sipPillText, additionalSIP === amt && styles.sipPillTextActive]}>
                    +{formatINR(amt)}/mo
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Projection Comparison Headline Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{scenarioInput.title}</Text>
          <View style={styles.summaryValuesRow}>
            <View>
              <Text style={styles.diffLabel}>Net Worth Impact ({horizonMonths / 12} Years)</Text>
              <Text
                style={[
                  styles.diffValue,
                  { color: isNetPositive ? colors.primaryLight : colors.dangerLight },
                ]}
              >
                {isNetPositive ? '+' : ''}
                {formatINR(comparisonResult.netWorthDifference)}
              </Text>
            </View>
            <View style={styles.pctBadge}>
              <Text style={[styles.pctText, { color: isNetPositive ? colors.primaryLight : colors.dangerLight }]}>
                {comparisonResult.percentageImpact > 0 ? '+' : ''}
                {comparisonResult.percentageImpact}%
              </Text>
            </View>
          </View>
        </View>

        {/* Dual Projection Curve Chart */}
        <WhatIfChart dataPoints={comparisonResult.chartPoints} height={230} />

        {/* AI Coach Opportunity Cost Insight */}
        <View style={styles.coachInsightBox}>
          <View style={styles.coachInsightHeader}>
            <Ionicons name="bulb-outline" size={18} color={colors.accent} />
            <Text style={styles.coachInsightTitle}>AI Coach Behavioral Takeaway</Text>
          </View>
          <Text style={styles.coachInsightText}>{comparisonResult.aiCoachInsight}</Text>
          <View style={styles.ruleDivider} />
          <Text style={styles.lessonHighlight}>
            📌 <Text style={{ fontWeight: '800' }}>Principle:</Text> {comparisonResult.keyEducationalTakeaway}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  presetTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  presetTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  presetTabTextActive: {
    color: '#0B0F19',
  },
  controlBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sipStepperRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sipPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  sipPillActive: {
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sipPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  sipPillTextActive: {
    color: colors.primaryLight,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  summaryValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  diffValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  pctBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pctText: {
    fontSize: 16,
    fontWeight: '900',
  },
  coachInsightBox: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginTop: 10,
  },
  coachInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  coachInsightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  coachInsightText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  ruleDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 10,
  },
  lessonHighlight: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
