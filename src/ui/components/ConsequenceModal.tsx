/**
 * Consequence & Educational Reflection Modal
 * The pivotal learning screen: Situation -> Decision -> Consequence -> Explanation -> Future Impact
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ConsequenceImpact } from '../../core/types/events';
import { formatINR } from './CurrencyText';

interface ConsequenceModalProps {
  visible: boolean;
  consequence: ConsequenceImpact | null;
  onDismiss: () => void;
}

export const ConsequenceModal: React.FC<ConsequenceModalProps> = ({
  visible,
  consequence,
  onDismiss,
}) => {
  if (!consequence) return null;

  const isNetPositive = consequence.financialHealthDelta >= 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: isNetPositive ? colors.primaryGlow : colors.dangerGlow },
              ]}
            >
              <Ionicons
                name={isNetPositive ? 'trending-up' : 'alert-circle'}
                size={28}
                color={isNetPositive ? colors.primary : colors.danger}
              />
            </View>
            <Text style={styles.headline}>Decision Consequence</Text>
            <View style={styles.deltaBadge}>
              <Text
                style={[
                  styles.deltaText,
                  { color: isNetPositive ? colors.primaryLight : colors.dangerLight },
                ]}
              >
                {consequence.financialHealthDelta > 0 ? '+' : ''}
                {consequence.financialHealthDelta} Health Pts
              </Text>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* 1. What Happened */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flash-outline" size={16} color={colors.accent} />
                <Text style={styles.sectionTitle}>What Happened</Text>
              </View>
              <Text style={styles.bodyText}>{consequence.whatHappened}</Text>
            </View>

            {/* 2. Why It Happened */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb-outline" size={16} color={colors.secondaryLight} />
                <Text style={styles.sectionTitle}>Why Did It Happen?</Text>
              </View>
              <Text style={styles.bodyText}>{consequence.whyItHappened}</Text>
            </View>

            {/* 3. Core Financial Lesson */}
            <View style={[styles.section, styles.lessonBox]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="school-outline" size={18} color={colors.primaryLight} />
                <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>
                  The Financial Lesson
                </Text>
              </View>
              <Text style={[styles.bodyText, styles.lessonText]}>
                {consequence.financialLesson}
              </Text>
            </View>

            {/* 4. Future Impact */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.sectionTitle}>Future Trajectory Impact</Text>
              </View>
              <Text style={styles.bodyText}>{consequence.futureImpactSummary}</Text>
            </View>

            {/* Quick Metrics Summary */}
            <View style={styles.metricsRow}>
              {consequence.cashDelta !== 0 && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Cash Change</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: consequence.cashDelta > 0 ? colors.primary : colors.danger },
                    ]}
                  >
                    {consequence.cashDelta > 0 ? '+' : ''}
                    {formatINR(consequence.cashDelta)}
                  </Text>
                </View>
              )}
              {consequence.debtDelta > 0 && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>New Liability</Text>
                  <Text style={[styles.metricValue, { color: colors.danger }]}>
                    +{formatINR(consequence.debtDelta)}
                  </Text>
                </View>
              )}
              {consequence.investmentDelta && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Portfolio Boost</Text>
                  <Text style={[styles.metricValue, { color: colors.primary }]}>
                    +{formatINR(consequence.investmentDelta.amount)}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} activeOpacity={0.8} onPress={onDismiss}>
            <Text style={styles.continueButtonText}>Understood — Continue Life</Text>
            <Ionicons name="arrow-forward" size={18} color="#0B0F19" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderTopWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  deltaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scrollArea: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  lessonBox: {
    backgroundColor: colors.primaryGlow,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  lessonText: {
    fontWeight: '600',
    color: colors.text,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceElevated,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '800',
  },
});
