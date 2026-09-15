/**
 * Radial Financial Health Gauge using react-native-svg
 * Visualizes 0-100 score and grade on a circular track.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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
  strokeWidth = 10,
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let scoreColor = colors.primary;
  if (clampedScore < 50) scoreColor = colors.danger;
  else if (clampedScore < 75) scoreColor = colors.accent;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={scoreColor} />
            <Stop offset="100%" stopColor={colors.primaryLight} />
          </LinearGradient>
        </Defs>

        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { color: scoreColor }]}>{clampedScore}</Text>
        <View style={[styles.gradeBadge, { backgroundColor: scoreColor }]}>
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
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginTop: 2,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B0F19',
  },
});
