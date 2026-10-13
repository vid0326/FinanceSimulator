/**
 * StatCard Metric Component
 * Displays financial balances, debts, and cashflows with modern card styling.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CurrencyText } from './CurrencyText';

interface StatCardProps {
  title: string;
  amount: number;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  subtitle?: string;
  deltaText?: string;
  isPositiveDelta?: boolean;
  onPress?: () => void;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  iconName,
  accentColor = colors.primary,
  subtitle,
  deltaText,
  isPositiveDelta,
  onPress,
  compact = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[
        styles.card,
        {
          borderColor: colors.surfaceBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={18} color="#FFFFFF" />
        </View>
        {deltaText && (
          <View
            style={[
              styles.deltaBadge,
              { backgroundColor: isPositiveDelta ? colors.primaryGlow : colors.dangerGlow },
            ]}
          >
            <Text
              style={[
                styles.deltaText,
                { color: isPositiveDelta ? colors.primaryLight : colors.dangerLight },
              ]}
            >
              {deltaText}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.titleText}>{title}</Text>
      <CurrencyText amount={amount} compact={compact} style={styles.amountText} />

      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flex: 1,
    margin: 4,
    minWidth: 140,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  deltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deltaText: {
    fontSize: 10,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitleText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
});
