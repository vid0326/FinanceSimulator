/**
 * What-If Sandbox Simulator Screen — Simplistic Minimalist UI
 * Clean, distraction-free forward wealth projector.
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
          title: 'Delay Investing by 5 Years',
          monthlyAdditionalSavings: 0,
          monthlyAdditionalSIP: 0,
          delayInvestingByYears: 5,
          projectionMonths: horizonMonths,
          assumedAnnualEquityReturn: 0.12,
          assumedAnnualInflation: 0.06,
        };

      case 'job_loss':
        return {
          title: 'Survive 4-Month Job Loss',
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
        {/* Minimal Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What-If Simulator</Text>
          <Text style={styles.subtitle}>
            Test financial scenarios before making real moves.
          </Text>
        </View>

        {/* Clean Scenario Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'extra_sip' && styles.presetTabActive]}
            onPress={() => setActivePreset('extra_sip')}
          >
            <Text style={[styles.presetTabText, activePreset === 'extra_sip' && styles.presetTabTextActive]}>
              +₹5k SIP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'bike_loan' && styles.presetTabActive]}
            onPress={() => setActivePreset('bike_loan')}
          >
            <Text style={[styles.presetTabText, activePreset === 'bike_loan' && styles.presetTabTextActive]}>
              Vehicle Loan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'delay_investing' && styles.presetTabActive]}
            onPress={() => setActivePreset('delay_investing')}
          >
            <Text style={[styles.presetTabText, activePreset === 'delay_investing' && styles.presetTabTextActive]}>
              Delay 5 Yrs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetTab, activePreset === 'job_loss' && styles.presetTabActive]}
            onPress={() => setActivePreset('job_loss')}
          >
            <Text style={[styles.presetTabText, activePreset === 'job_loss' && styles.presetTabTextActive]}>
              Job Loss
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Interactive Age Scrubber & Comparison */}
        <TimeMachineDial
          currentAge={profile.currentAge}
          selectedAge={selectedAge}
          onAgeChange={setSelectedAge}
          baselineWealth={comparisonResult.baselineFinalNetWorth}
          whatIfWealth={comparisonResult.whatIfFinalNetWorth}
        />

        {/* Stepper for Extra SIP (if selected) */}
        {activePreset === 'extra_sip' && (
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
        )}

        {/* Minimalist Dual Curve SVG Chart */}
        <WhatIfChart dataPoints={comparisonResult.chartPoints} height={170} />

        {/* Clean Takeaway Note */}
        <View style={styles.takeawayCard}>
          <Text style={styles.takeawayTitle}>KEY TAKEAWAY</Text>
          <Text style={styles.takeawayBody}>
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
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 0,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
    fontWeight: '500',
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  presetTab: {
    backgroundColor: '#141414',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  presetTabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  presetTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A3A3A3',
  },
  presetTabTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  sipPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  sipPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#141414',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  sipPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  sipPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A3A3A3',
  },
  sipPillTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  takeawayCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginTop: 8,
  },
  takeawayTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  takeawayBody: {
    fontSize: 13,
    color: '#E5E5E5',
    lineHeight: 18,
    fontWeight: '500',
  },
});
