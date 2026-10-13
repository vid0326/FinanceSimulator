/**
 * ComicConsequenceModal — 3-Panel Visual Storyboard
 * Replaces text-heavy explanation with punchy visual storytelling, sound badges, and humor.
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ConsequenceImpact } from '../../core/types/events';
import { formatINR } from './CurrencyText';

interface ComicConsequenceModalProps {
  visible: boolean;
  consequence: ConsequenceImpact | null;
  onDismiss: () => void;
}

export const ComicConsequenceModal: React.FC<ComicConsequenceModalProps> = ({
  visible,
  consequence,
  onDismiss,
}) => {
  if (!consequence) return null;

  const isNetPositive = consequence.financialHealthDelta >= 0;

  let soundBadge = '⚡ KA-CHING!';
  let soundColor = '#FFFFFF';
  if (consequence.debtDelta > 0) {
    soundBadge = '💥 OUCH!';
  } else if (consequence.cashDelta < 0 && consequence.financialHealthDelta < 0) {
    soundBadge = '💸 POOF!';
  } else if (isNetPositive) {
    soundBadge = '🚀 LEVEL UP!';
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.comicBoard}>
          {/* Comic Header */}
          <View style={styles.header}>
            <View style={[styles.soundBadge, { backgroundColor: soundColor }]}>
              <Text style={styles.soundText}>{soundBadge}</Text>
            </View>
            <View style={styles.healthTag}>
              <Text
                style={[
                  styles.healthText,
                  { color: isNetPositive ? colors.primaryLight : colors.dangerLight },
                ]}
              >
                {consequence.financialHealthDelta >= 0 ? '+' : ''}
                {consequence.financialHealthDelta} Health Pts
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.comicScroll}>
            {/* PANEL 1: The Move */}
            <View style={styles.comicPanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelNumber}>PANEL 1 • THE MOVE</Text>
                <Ionicons
                  name={isNetPositive ? 'happy' : 'sad'}
                  size={16}
                  color={isNetPositive ? colors.primary : colors.danger}
                />
              </View>
              <Text style={styles.panelBody}>{consequence.whatHappened}</Text>
            </View>

            {/* PANEL 2: The Real-Life Consequence */}
            <View style={[styles.comicPanel, styles.panelHighlight]}>
              <View style={styles.panelHeader}>
                <Text style={[styles.panelNumber, { color: colors.accent }]}>
                  PANEL 2 • THE SHOCKWAVE
                </Text>
              </View>
              <Text style={styles.panelBody}>{consequence.whyItHappened}</Text>

              {/* Visual Comic Currency Badges */}
              <View style={styles.badgeRow}>
                {consequence.cashDelta !== 0 && (
                  <View
                    style={[
                      styles.metricBadge,
                      { backgroundColor: consequence.cashDelta > 0 ? colors.primaryGlow : colors.dangerGlow },
                    ]}
                  >
                    <Text
                      style={[
                        styles.metricText,
                        { color: consequence.cashDelta > 0 ? colors.primaryLight : colors.dangerLight },
                      ]}
                    >
                      {consequence.cashDelta > 0 ? '+' : ''}
                      {formatINR(consequence.cashDelta)} Cash
                    </Text>
                  </View>
                )}

                {consequence.debtDelta > 0 && (
                  <View style={[styles.metricBadge, { backgroundColor: colors.dangerGlow }]}>
                    <Text style={[styles.metricText, { color: colors.dangerLight }]}>
                      +{formatINR(consequence.debtDelta)} Debt Drag
                    </Text>
                  </View>
                )}

                {consequence.investmentDelta && (
                  <View style={[styles.metricBadge, { backgroundColor: colors.primaryGlow }]}>
                    <Text style={[styles.metricText, { color: colors.primaryLight }]}>
                      +{formatINR(consequence.investmentDelta.amount)} Invested
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* PANEL 3: The Punchline */}
            <View style={styles.comicPanel}>
              <View style={styles.panelHeader}>
                <Text style={[styles.panelNumber, { color: colors.secondaryLight }]}>
                  PANEL 3 • THE PUNCHLINE
                </Text>
                <Ionicons name="sparkles" size={14} color={colors.secondaryLight} />
              </View>
              <Text style={styles.punchlineText}>"{consequence.financialLesson}"</Text>
            </View>
          </ScrollView>

          {/* Continue Next Turn Button */}
          <TouchableOpacity activeOpacity={0.85} style={styles.nextTurnButton} onPress={onDismiss}>
            <Text style={styles.nextTurnText}>PLAY NEXT TURN ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  comicBoard: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  soundBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    transform: [{ rotate: '-3deg' }],
  },
  soundText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  healthTag: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '800',
  },
  comicScroll: {
    marginBottom: 14,
  },
  comicPanel: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  panelHighlight: {
    borderColor: '#FFFFFF',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  panelNumber: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  panelBody: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  metricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricText: {
    fontSize: 11,
    fontWeight: '800',
  },
  punchlineText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  nextTurnButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextTurnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
