/**
 * Indian Rupee Currency Text Component
 * Formats numbers into Lakhs, Crores, or standard comma-separated INR.
 */

import React from 'react';
import { Text, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface CurrencyTextProps {
  amount: number;
  style?: TextStyle;
  compact?: boolean;
  showSign?: boolean;
  colorVariant?: 'default' | 'positive' | 'negative' | 'accent';
}

export function formatINR(val: number, compact: boolean = false): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (compact) {
    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(1)} L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1)}k`;
    }
  }

  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
}

export const CurrencyText: React.FC<CurrencyTextProps> = ({
  amount,
  style,
  compact = false,
  showSign = false,
  colorVariant = 'default',
}) => {
  let color = colors.text;
  if (colorVariant === 'positive' || (colorVariant === 'default' && showSign && amount > 0)) {
    color = colors.primary;
  } else if (colorVariant === 'negative' || (colorVariant === 'default' && showSign && amount < 0)) {
    color = colors.danger;
  } else if (colorVariant === 'accent') {
    color = colors.accent;
  }

  const prefix = showSign && amount > 0 ? '+' : '';
  const formatted = formatINR(amount, compact);

  return (
    <Text
      style={[
        {
          color,
          fontWeight: '800',
          fontSize: 16,
          fontVariant: ['tabular-nums'],
          letterSpacing: -0.3,
        },
        style,
      ]}
    >
      {prefix}{formatted}
    </Text>
  );
};
