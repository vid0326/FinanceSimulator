/**
 * MascotCompanion — Witty Comic Financial Companion
 * Replaces dry text explanations with an expressive animated character dropping sharp 1-line roasts and celebrations.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { BalanceSheet } from '../../core/types/finance';
import { HealthScoreBreakdown } from '../../core/types/health';

interface MascotCompanionProps {
  balanceSheet: BalanceSheet;
  health: HealthScoreBreakdown;
  age: number;
}

export const MascotCompanion: React.FC<MascotCompanionProps> = ({ balanceSheet, health, age }) => {
  const [clickCount, setClickCount] = useState(0);

  // Dynamic witty quips based on game state
  const getQuip = (): { text: string; mood: 'roast' | 'cheer' | 'caution' } => {
    if (balanceSheet.liquidCash < 1000) {
      return {
        text: "Bank balance is dangerously skinny! One Swiggy order and we're eating instant noodles till next month.",
        mood: 'roast',
      };
    }
    if (balanceSheet.liabilitiesTotal > 80000) {
      return {
        text: "That EMI is sticking to you like Bangalore traffic. Kill the loan before taking any more vacations!",
        mood: 'roast',
      };
    }
    if (balanceSheet.investmentsTotal > 50000 && health.totalScore >= 75) {
      return {
        text: "Compounding is silently doing pushups in your portfolio. Stay disciplined, future crorepati!",
        mood: 'cheer',
      };
    }
    if (balanceSheet.emergencyFund < 15000) {
      return {
        text: "Emergency fund looking thin! One laptop screen crack away from a financial meltdown.",
        mood: 'caution',
      };
    }
    const standardQuips = [
      "Rule #1 of money: Don't impress people you don't even like with money you don't have.",
      "A 12% compounding SIP beats any hot stock tip your crypto cousin pitches at dinner.",
      "Credit cards are awesome if paid in full, and a 42% financial chainsaw if you pay 'minimum due'.",
    ];
    return {
      text: standardQuips[clickCount % standardQuips.length],
      mood: 'cheer',
    };
  };

  const quip = getQuip();

  let tagColor = '#FFFFFF';
  let tagLabel = 'COACH SAYS';
  if (quip.mood === 'roast') {
    tagLabel = 'REAL TALK 🔥';
  } else if (quip.mood === 'caution') {
    tagLabel = 'HEADS UP ⚠️';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.container}
      onPress={() => setClickCount((prev) => prev + 1)}
    >
      {/* Animated Mascot Icon */}
      <View style={styles.mascotIconBox}>
        <Svg width="44" height="44" viewBox="0 0 44 44">
          <Circle cx="22" cy="22" r="20" fill="#181818" stroke="#3A3A3A" strokeWidth="1.5" />
          {/* Eyes */}
          <Circle cx="16" cy="20" r="3" fill="#FFFFFF" />
          <Circle cx="28" cy="20" r="3" fill="#FFFFFF" />
          <Circle cx="16.5" cy="20" r="1.5" fill="#000000" />
          <Circle cx="28.5" cy="20" r="1.5" fill="#000000" />
          {/* Grin or Ouch mouth */}
          {quip.mood === 'roast' ? (
            <Path d="M 16 28 Q 22 23 28 28" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          ) : (
            <Path d="M 16 26 Q 22 32 28 26" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          )}
          {/* Horns / Ears */}
          <Path d="M 12 12 L 15 17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <Path d="M 32 12 L 29 17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      </View>

      {/* Speech Bubble */}
      <View style={styles.speechBubble}>
        <View style={styles.bubbleHeader}>
          <Text style={[styles.tagText, { color: '#FFFFFF' }]}>{tagLabel}</Text>
          <Text style={styles.tapPrompt}>tap for fresh advice</Text>
        </View>
        <Text style={styles.quipText}>{quip.text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    gap: 12,
  },
  mascotIconBox: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechBubble: {
    flex: 1,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tapPrompt: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  quipText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
    fontWeight: '600',
  },
});
