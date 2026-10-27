/**
 * Radial Financial Health Gauge (Minimalist Monochrome with Micro-Accents)
 * Clean black & white radial track with grade badge and animated arc.
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
  strokeWidth = 8,
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getArcColor = () => {
    if (clampedScore >= 80) return colors.positive;
    if (clampedScore >= 60) return '#FFFFFF';
    if (clampedScore >= 45) return colors.gold;
    return colors.danger;
  };

  const getGradeStyle = () => {
    if (clampedScore >= 80) {
      return { bg: colors.positiveBg, text: colors.positiveLight, border: colors.positiveBorder };
    }
    if (clampedScore >= 60) {
      return { bg: '#222222', text: '#FFFFFF', border: '#333333' };
    }
    if (clampedScore >= 45) {
      return { bg: colors.goldBg, text: colors.goldLight, border: colors.goldBorder };
    }
    return { bg: colors.dangerBg, text: colors.dangerLight, border: colors.dangerBorder };
  };

  const arcColor = getArcColor();
  const gradeStyle = getGradeStyle();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Subtle Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1A1A1A"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Crisp Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={arcColor}
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
        <View style={[styles.gradeBadge, { backgroundColor: gradeStyle.bg, borderColor: gradeStyle.border }]}>
          <Text style={[styles.gradeText, { color: gradeStyle.text }]}>{grade}</Text>
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
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '900',
  },
});
