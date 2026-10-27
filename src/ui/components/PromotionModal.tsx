/**
 * PromotionModal — Minimalist Black & White Career Promotion & Appraisal Celebration
 * Highlights job title upgrades, salary jumps, cash bonuses, and the Lifestyle Inflation Dilemma.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatINR } from './CurrencyText';

export const PromotionModal: React.FC = () => {
  const activePromotionOffer = useSimulationStore((state) => state.activePromotionOffer);
  const acceptPromotion = useSimulationStore((state) => state.acceptPromotion);
  const dismissPromotion = useSimulationStore((state) => state.dismissPromotion);

  const [selectedOptionId, setSelectedOptionId] = useState<string>('opt_frugal_investor');

  if (!activePromotionOffer) return null;

  const handleConfirm = () => {
    acceptPromotion(selectedOptionId);
  };

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={dismissPromotion}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.promoBadge}>
                <Ionicons name="ribbon-outline" size={14} color="#000000" />
                <Text style={styles.promoBadgeText}>CAREER PROMOTION</Text>
              </View>
              <Text style={styles.hikeBadge}>+{activePromotionOffer.hikePercentage}% HIKE</Text>
            </View>
            <Text style={styles.newTitle}>{activePromotionOffer.newTitle}</Text>
            <Text style={styles.prevTitle}>Promoted from: {activePromotionOffer.previousTitle}</Text>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>NEW SALARY</Text>
              <Text style={styles.statValue}>{formatINR(activePromotionOffer.newSalary)}/mo</Text>
              <Text style={styles.statSub}>was {formatINR(activePromotionOffer.previousSalary)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>PERFORMANCE BONUS</Text>
              <Text style={styles.statBonus}>{formatINR(activePromotionOffer.performanceBonus)}</Text>
              <Text style={styles.statSub}>Cash in bank</Text>
            </View>
          </View>

          {/* Lifestyle Inflation Dilemma */}
          <Text style={styles.sectionHeader}>DECIDE: HOW WILL YOU HANDLE THIS PAY HIKE?</Text>
          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {activePromotionOffer.lifestyleInflationOptions.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, isSelected && styles.optionCardActive]}
                  onPress={() => setSelectedOptionId(opt.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                      {opt.title}
                    </Text>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? '#000000' : '#666666'}
                    />
                  </View>
                  <Text style={[styles.optionDesc, isSelected && styles.optionDescActive]}>
                    {opt.description}
                  </Text>
                  <View style={styles.optionPillsRow}>
                    <Text style={[styles.optionPill, isSelected && styles.optionPillActive]}>
                      Health: {opt.financialHealthImpact >= 0 ? '+' : ''}{opt.financialHealthImpact}
                    </Text>
                    <Text style={[styles.optionPill, isSelected && styles.optionPillActive]}>
                      Happiness: +{opt.lifeSatisfactionImpact}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.acceptButton} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={styles.acceptButtonText}>Accept Promotion & Apply Strategy →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0D0D0D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  hikeBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  newTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  prevTitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#262626',
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statBonus: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statSub: {
    fontSize: 10,
    color: '#777777',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  optionsList: {
    maxHeight: 260,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 12,
    marginBottom: 10,
  },
  optionCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  optionTitleActive: {
    color: '#000000',
  },
  optionDesc: {
    fontSize: 11,
    color: '#888888',
    lineHeight: 15,
    marginBottom: 8,
  },
  optionDescActive: {
    color: '#333333',
  },
  optionPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  optionPill: {
    fontSize: 9,
    fontWeight: '700',
    color: '#888888',
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionPillActive: {
    color: '#000000',
    backgroundColor: '#EBEBEB',
  },
  acceptButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
});
