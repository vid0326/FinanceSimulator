/**
 * Decision Choice Card Component
 * Renders selectable dilemma choices with immediate consequence hints and tactile feedback.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { DecisionOption } from '../../core/types/events';
import { formatINR } from './CurrencyText';

interface DecisionCardProps {
  option: DecisionOption;
  index: number;
  onSelect: (option: DecisionOption) => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ option, index, onSelect }) => {
  const letters = ['A', 'B', 'C', 'D'];
  const letter = letters[index % letters.length];

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics fallback on web/emulators
    }
    onSelect(option);
  };

  const c = option.consequence;
  const hasDebt = c.debtDelta > 0;
  const hasCashSpend = c.cashDelta < 0;
  const hasInvest = c.investmentDelta !== undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      style={[
        styles.card,
        hasDebt && styles.debtCard,
        hasInvest && styles.investCard,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.letterBadge, hasDebt ? styles.debtBadge : hasInvest ? styles.investBadge : null]}>
          <Text style={styles.letterText}>{letter}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {option.title}
        </Text>
      </View>

      <Text style={styles.description}>{option.description}</Text>

      {/* Immediate Impact Preview Pills */}
      <View style={styles.tagRow}>
        {c.cashDelta !== 0 && (
          <View style={[styles.tag, c.cashDelta > 0 ? styles.positiveTag : styles.negativeTag]}>
            <Text style={[styles.tagText, c.cashDelta > 0 ? styles.positiveText : styles.negativeText]}>
              {c.cashDelta > 0 ? '+' : ''}{formatINR(c.cashDelta)} Cash
            </Text>
          </View>
        )}

        {c.debtDelta > 0 && (
          <View style={[styles.tag, styles.negativeTag]}>
            <Text style={[styles.tagText, styles.negativeText]}>
              +{formatINR(c.debtDelta)} Debt
            </Text>
          </View>
        )}

        {c.investmentDelta && (
          <View style={[styles.tag, styles.positiveTag]}>
            <Text style={[styles.tagText, styles.positiveText]}>
              +{formatINR(c.investmentDelta.amount)} {c.investmentDelta.name}
            </Text>
          </View>
        )}

        {c.monthlyIncomeDelta && c.monthlyIncomeDelta > 0 && (
          <View style={[styles.tag, styles.positiveTag]}>
            <Text style={[styles.tagText, styles.positiveText]}>
              +{formatINR(c.monthlyIncomeDelta)}/mo Salary
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  debtCard: {
    borderColor: colors.surfaceBorderLight,
  },
  investCard: {
    borderColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  letterBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  debtBadge: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorderLight,
  },
  investBadge: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  letterText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  positiveTag: {
    backgroundColor: colors.primaryGlow,
  },
  negativeTag: {
    backgroundColor: colors.dangerGlow,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  positiveText: {
    color: colors.primaryLight,
  },
  negativeText: {
    color: colors.dangerLight,
  },
});
