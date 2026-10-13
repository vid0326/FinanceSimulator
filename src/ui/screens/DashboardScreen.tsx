/**
 * Main Dashboard Screen
 * High-density financial snapshot: Net Worth, Health Gauge, Avatar mood, Balances, and Turn Advance.
 */

import React, { useState } from 'react';
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
import { CurrencyText, formatINR } from '../components/CurrencyText';
import { StatCard } from '../components/StatCard';
import { HealthGauge } from '../components/HealthGauge';
import { InteractiveAvatar, AvatarMood } from '../components/InteractiveAvatar';
import { FlyingCoins } from '../components/FlyingCoins';
import { ConsequenceModal } from '../components/ConsequenceModal';

export const DashboardScreen: React.FC = () => {
  const [coinBurstKey, setCoinBurstKey] = useState(0);

  const profile = useSimulationStore((state) => state.profile);
  const balanceSheet = useSimulationStore((state) => state.balanceSheet);
  const budget = useSimulationStore((state) => state.budget);
  const health = useSimulationStore((state) => state.healthScore);
  const lifeSatisfaction = useSimulationStore((state) => state.lifeSatisfaction);
  const currentEvent = useSimulationStore((state) => state.currentEvent);
  const gamification = useSimulationStore((state) => state.gamification);
  const lastConsequence = useSimulationStore((state) => state.lastConsequence);

  const advanceMonth = useSimulationStore((state) => state.advanceMonth);
  const dismissConsequence = useSimulationStore((state) => state.dismissConsequence);
  const setActiveTab = useSimulationStore((state) => state.setActiveTab);

  // Map financial state to Avatar mood
  let mood: AvatarMood = 'happy';
  if (health.totalScore >= 85 && balanceSheet.netWorth > 100000) {
    mood = 'confident';
  } else if (currentEvent) {
    mood = 'thoughtful';
  } else if (balanceSheet.liquidCash < 2000 || health.totalScore < 45) {
    mood = 'panic';
  } else if (balanceSheet.liabilitiesTotal > 50000 || health.totalScore < 65) {
    mood = 'stressed';
  }

  const handleAdvance = () => {
    setCoinBurstKey((prev) => prev + 1);
    advanceMonth();
  };

  const monthlyNetCashFlow =
    budget.baseSalary -
    (budget.fixedNeeds.rent +
      budget.fixedNeeds.utilities +
      budget.fixedNeeds.groceries +
      budget.fixedNeeds.healthInsurance +
      budget.discretionaryWants.entertainment +
      budget.discretionaryWants.diningOut +
      budget.discretionaryWants.shopping +
      balanceSheet.liabilities.reduce((s, l) => s + l.monthlyEMI, 0) +
      balanceSheet.assets.reduce((s, a) => s + (a.monthlySIPAmount || 0), 0));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Bar: Profile & Avatar */}
        <View style={styles.topBar}>
          <View style={styles.profileMeta}>
            <Text style={styles.greetingText}>
              Age {profile.currentAge} • Month {profile.currentMonth}
            </Text>
            <Text style={styles.nameTitle}>{profile.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.levelBadge}>
                <Ionicons name="sparkles" size={12} color={colors.accent} />
                <Text style={styles.levelText}>
                  Lv.{gamification.level} {gamification.levelTitle}
                </Text>
              </View>
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>{gamification.xp} XP</Text>
              </View>
            </View>
          </View>
          <InteractiveAvatar mood={mood} size={72} />
        </View>

        {/* Hero Net Worth Card */}
        <View style={styles.netWorthCard}>
          <View style={styles.netWorthHeader}>
            <Text style={styles.netWorthLabel}>Total Net Worth</Text>
            <View
              style={[
                styles.cashFlowPill,
                { backgroundColor: monthlyNetCashFlow >= 0 ? colors.primaryGlow : colors.dangerGlow },
              ]}
            >
              <Ionicons
                name={monthlyNetCashFlow >= 0 ? 'arrow-up' : 'arrow-down'}
                size={12}
                color={monthlyNetCashFlow >= 0 ? colors.primaryLight : colors.dangerLight}
              />
              <Text
                style={[
                  styles.cashFlowText,
                  { color: monthlyNetCashFlow >= 0 ? colors.primaryLight : colors.dangerLight },
                ]}
              >
                {monthlyNetCashFlow >= 0 ? '+' : ''}
                {formatINR(monthlyNetCashFlow, true)}/mo
              </Text>
            </View>
          </View>

          <CurrencyText amount={balanceSheet.netWorth} style={styles.netWorthValue} />

          {/* Turn Advancement Button */}
          <TouchableOpacity
            style={styles.advanceMonthButton}
            activeOpacity={0.85}
            onPress={handleAdvance}
          >
            <Ionicons name="play-forward" size={18} color="#000000" />
            <Text style={styles.advanceButtonText}>
              Advance to Next Month ({profile.currentMonth === 12 ? 'Year End' : `Month ${profile.currentMonth + 1}`})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pending Scenario Dilemma Alert */}
        {currentEvent && (
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.eventAlertCard}
            onPress={() => setActiveTab('life')}
          >
            <View style={styles.eventAlertLeft}>
              <View style={styles.eventAlertIcon}>
                <Ionicons name={currentEvent.icon as any} size={22} color="#FFFFFF" />
              </View>
              <View style={styles.eventAlertContent}>
                <Text style={styles.eventAlertTag}>DECISION PENDING</Text>
                <Text style={styles.eventAlertTitle} numberOfLines={1}>
                  {currentEvent.title}
                </Text>
                <Text style={styles.eventAlertSubtitle} numberOfLines={1}>
                  {currentEvent.headline}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Financial Health Section */}
        <View style={styles.healthSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financial Health Score</Text>
            <TouchableOpacity onPress={() => setActiveTab('coach')}>
              <Text style={styles.askCoachLink}>Why this score? →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.healthCard}>
            <HealthGauge score={health.totalScore} grade={health.grade} size={110} />
            <View style={styles.healthDetails}>
              <View style={styles.healthPillRow}>
                <View style={styles.strengthPill}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primaryLight} />
                  <Text style={styles.strengthText}>{health.keyStrength}</Text>
                </View>
              </View>
              <View style={styles.healthPillRow}>
                <View style={styles.vulnerabilityPill}>
                  <Ionicons name="alert-circle" size={14} color={colors.dangerLight} />
                  <Text style={styles.vulnerabilityText}>{health.keyVulnerability}</Text>
                </View>
              </View>
              <Text style={styles.healthAdvice}>
                Life Satisfaction: <Text style={{ color: colors.accent, fontWeight: '800' }}>{lifeSatisfaction}/100</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Core Financial Balances Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Financial Assets & Liabilities</Text>
        </View>

        <View style={styles.gridRow}>
          <StatCard
            title="Liquid Cash"
            amount={balanceSheet.liquidCash}
            iconName="wallet-outline"
            accentColor={colors.primary}
            subtitle="Available to spend"
            onPress={() => setActiveTab('life')}
          />
          <StatCard
            title="Emergency Fund"
            amount={balanceSheet.emergencyFund}
            iconName="shield-checkmark-outline"
            accentColor={colors.accent}
            subtitle="3-6 month safety"
            onPress={() => setActiveTab('coach')}
          />
        </View>

        <View style={styles.gridRow}>
          <StatCard
            title="Investments"
            amount={balanceSheet.investmentsTotal}
            iconName="trending-up-outline"
            accentColor={colors.chartBaseline}
            subtitle={`${balanceSheet.assets.length} asset class(es)`}
            onPress={() => setActiveTab('portfolio')}
          />
          <StatCard
            title="Total Debt"
            amount={balanceSheet.liabilitiesTotal}
            iconName="card-outline"
            accentColor={colors.danger}
            subtitle={balanceSheet.liabilitiesTotal > 0 ? `${balanceSheet.liabilities.length} active loan(s)` : 'Debt-Free!'}
            onPress={() => setActiveTab('life')}
          />
        </View>
      </ScrollView>

      {/* Reanimated Flying Coins Celebration */}
      <FlyingCoins triggerKey={coinBurstKey} />

      {/* Consequence Modal */}
      <ConsequenceModal
        visible={lastConsequence !== null}
        consequence={lastConsequence}
        onDismiss={dismissConsequence}
      />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileMeta: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginVertical: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  xpBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  netWorthCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  netWorthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  netWorthLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  cashFlowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cashFlowText: {
    fontSize: 11,
    fontWeight: '700',
  },
  netWorthValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  advanceMonthButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  advanceButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  eventAlertCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eventAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  eventAlertIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  eventAlertContent: {
    flex: 1,
  },
  eventAlertTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  eventAlertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 1,
  },
  eventAlertSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  healthSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  askCoachLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondaryLight,
  },
  healthCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  healthDetails: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  healthPillRow: {
    flexDirection: 'row',
  },
  strengthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  vulnerabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dangerGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vulnerabilityText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dangerLight,
  },
  healthAdvice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
});
