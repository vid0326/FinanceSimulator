/**
 * What-If Sandbox Simulator Screen
 * Features the TimeMachineDial, analog age scrubber, and split-screen alternate reality mirror.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../../store/useSimulationStore';
import { WhatIfEngine } from '../../core/whatif/WhatIfEngine';
import { WhatIfScenarioInput, WhatIfComparisonResult } from '../../core/types/whatif';
import { WhatIfChart } from '../components/WhatIfChart';
import { TimeMachineDial } from '../components/TimeMachineDial';
import { formatINR } from '../components/CurrencyText';

type PresetType = 'extra_sip' | 'bike_loan' | 'delay_investing' | 'job_loss';

export const WhatIfScreen: React.FC = () => {
  const profile = useSimulationStore((state) => state.profile);
  const balanceSheet = useSimulationStore((state) => state.balanceSheet);
  const budget = useSimulationStore((state) => state.budget);

  const [activePreset, setActivePreset] = useState<PresetType>('extra_sip');
  const [additionalSIP, setAdditionalSIP] = useState<number>(5000);
  const [selectedAge, setSelectedAge] = useState<number>(profile.currentAge + 5);

  // Compute projection horizon in months from selectedAge
  const horizonMonths = Math.max(12, (selectedAge - profile.currentAge) * 12);

  const scenarioInput: WhatIfScenarioInput = useMemo(() => {
    switch (activePreset) {
      case 'extra_sip':
        return {
          title: `Invest Extra ₹${additionalSIP.toLocaleString('en-IN')}/Month`,
          monthlyAdditionalSavings: 0,
          monthlyAdditionalSIP: additionalSIP,
          delayInvestingByYears: 0,
          projectionMonths: horizonMonths,
          assumedAnnualEquityReturn: 0.12,
          assumedAnnualInflation: 0.06,
        };

      case 'bike_loan':
        return {
          title: 'Take ₹1,80,000 Bike Loan (14% Interest)',
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
          title: 'Survive 4-Month Job Loss Gap',
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

  const comparisonResult: WhatIfComparisonResult = useMemo(() => {
    return WhatIfEngine.simulateScenario(
      balanceSheet,
      budget,
      profile.currentAge,
      scenarioInput
    );
  }, [balanceSheet, budget, profile.currentAge, scenarioInput]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>“What If?” Time Machine</Text>
          <Text style={styles.subtitle}>
            Spin the dial and see how today's choices shape your wealth at Age {selectedAge}.
          </Text>
        </View>

        {/* Preset Selector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'extra_sip' && styles.presetTabActive]}
            onPress={() => setActivePreset('extra_sip')}
          >
            <Ionicons name="trending-up" size={16} color={activePreset === 'extra_sip' ? '#000000' : '#FFFFFF'} />
            <Text style={[styles.presetTabText, activePreset === 'extra_sip' && styles.presetTabTextActive]}>
              +₹5k SIP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'bike_loan' && styles.presetTabActive]}
            onPress={() => setActivePreset('bike_loan')}
          >
            <Ionicons name="bicycle" size={16} color={activePreset === 'bike_loan' ? '#000000' : '#FFFFFF'} />
            <Text style={[styles.presetTabText, activePreset === 'bike_loan' && styles.presetTabTextActive]}>
              Vehicle Loan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'delay_investing' && styles.presetTabActive]}
            onPress={() => setActivePreset('delay_investing')}
          >
            <Ionicons name="time" size={16} color={activePreset === 'delay_investing' ? '#000000' : '#FFFFFF'} />
            <Text style={[styles.presetTabText, activePreset === 'delay_investing' && styles.presetTabTextActive]}>
              Delay 5 Years
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'job_loss' && styles.presetTabActive]}
            onPress={() => setActivePreset('job_loss')}
          >
            <Ionicons name="alert-circle" size={16} color={activePreset === 'job_loss' ? '#000000' : '#FFFFFF'} />
            <Text style={[styles.presetTabText, activePreset === 'job_loss' && styles.presetTabTextActive]}>
              Job Loss
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Interactive Time Machine Scrubber Dial */}
        <TimeMachineDial
          currentAge={profile.currentAge}
          selectedAge={selectedAge}
          onAgeChange={setSelectedAge}
          baselineWealth={comparisonResult.baselineFinalNetWorth}
          whatIfWealth={comparisonResult.whatIfFinalNetWorth}
        />

        {/* Stepper Buttons for Extra SIP */}
        {activePreset === 'extra_sip' && (
          <View style={styles.sipSelector}>
            <Text style={styles.controlLabel}>Select Additional Monthly SIP:</Text>
            <View style={styles.sipPillRow}>
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

        {/* Interactive Dual Projection Chart */}
        <WhatIfChart dataPoints={comparisonResult.chartPoints} height={210} />

        {/* Comic Punchline Card */}
        <View style={styles.punchlineCard}>
          <View style={styles.punchlineHeader}>
            <Ionicons name="bulb" size={16} color={colors.accent} />
            <Text style={styles.punchlineTitle}>THE PUNCHLINE</Text>
          </View>
          <Text style={styles.punchlineBody}>
            {comparisonResult.keyEducationalTakeaway}
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 0,
  },
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 12,
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
    marginBottom: 10,
  },
  presetTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  presetTabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  presetTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  presetTabTextActive: {
    color: '#000000',
  },
  sipSelector: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sipPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sipPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sipPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  sipPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  sipPillTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  punchlineCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginTop: 10,
  },
  punchlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  punchlineTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  punchlineBody: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    fontWeight: '600',
  },
});
