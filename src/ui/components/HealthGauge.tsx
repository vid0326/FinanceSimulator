/**
 * Radial Financial Health Gauge (Minimalist Monochrome)
 * Clean black & white radial track with high-contrast score and grade badge.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

interface HealthGaugeProps {
  score: number; // 0 to 100
  grade: string;
  size?: number;
  strokeWidth?: number;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({
  score,
  grade,
  size = 110,
  strokeWidth = 8,
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const scoreColor = clampedScore < 40 ? colors.danger : colors.primary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Subtle Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#262626"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Crisp Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { color: colors.text }]}>{clampedScore}</Text>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeText}>{grade}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
});
