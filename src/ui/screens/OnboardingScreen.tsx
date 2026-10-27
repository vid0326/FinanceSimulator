/**
 * Onboarding Screen — Simplistic Minimalist Black & White UI
 * Choose from 6 rich character archetypes, start from True Zero (₹0), or customize finances.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LifeStage, STAGE_PRESETS, SimulationInitOptions } from '../../core/types/profile';
import { CHARACTER_ROSTER, CharacterArchetype } from '../../core/types/characters';
import { useSimulationStore } from '../../store/useSimulationStore';
import { InteractiveAvatar } from '../components/InteractiveAvatar';
import { formatINR } from '../components/CurrencyText';
import { AuthModal } from '../components/AuthModal';

type SetupMode = 'characters' | 'zero' | 'custom';

const JOB_PRESETS = [
  { title: 'Junior Software Engineer', income: '50000', expenses: '22000', type: 'salary' as const },
  { title: 'Freelance UI/UX Designer', income: '38000', expenses: '18000', type: 'freelance' as const },
  { title: 'Financial Analyst', income: '45000', expenses: '20000', type: 'salary' as const },
  { title: 'Digital Marketer & Creator', income: '35000', expenses: '16000', type: 'freelance' as const },
  { title: 'Operations / Sales Lead', income: '32000', expenses: '15000', type: 'salary' as const },
  { title: 'Startup Solo Founder', income: '25000', expenses: '12000', type: 'business' as const },
  { title: 'College Intern / Stipend', income: '15000', expenses: '8000', type: 'stipend' as const },
  { title: 'Job Seeker (Zero Income)', income: '0', expenses: '5000', type: 'unemployed' as const },
];

export const OnboardingScreen: React.FC = () => {
  const [setupMode, setSetupMode] = useState<SetupMode>('characters');

  // Selected Character Archetype (Default: Kabir / Ground Zero)
  const [selectedCharId, setSelectedCharId] = useState<string>('char_ground_zero');

  // Start from Zero Profile Builder Variables
  const [zeroName, setZeroName] = useState('');
  const [zeroAge, setZeroAge] = useState('21');
  const [zeroJobTitle, setZeroJobTitle] = useState('Junior Software Engineer');
  const [zeroIncomeType, setZeroIncomeType] = useState<'salary' | 'freelance' | 'business' | 'stipend' | 'unemployed'>('salary');
  const [zeroMonthlyIncome, setZeroMonthlyIncome] = useState('45000');
  const [zeroExpenses, setZeroExpenses] = useState('20000');

  // Custom Financial Variables (For Custom Sandbox Mode)
  const [customName, setCustomName] = useState('');
  const [customAge, setCustomAge] = useState('21');
  const [startingCash, setStartingCash] = useState('0');
  const [monthlyIncome, setMonthlyIncome] = useState('0');
  const [fixedExpenses, setFixedExpenses] = useState('0');
  const [startingDebt, setStartingDebt] = useState('0');

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const initializeSimulation = useSimulationStore((state) => state.initializeSimulation);

  const selectedCharacter =
    CHARACTER_ROSTER.find((c) => c.id === selectedCharId) || CHARACTER_ROSTER[0];

  const handleStart = () => {
    if (setupMode === 'characters') {
      const char = selectedCharacter;
      const opts: SimulationInitOptions = {
        name: char.name,
        age: char.age,
        stageId: char.stageId,
        career: char.title,
        startingCash: char.startingCash,
        startingSavings: char.startingSavings,
        startingDebt: char.startingDebt,
        monthlyIncome: char.monthlyIncome,
        fixedExpenses: char.fixedExpenses,
        avatarSeed: char.avatarSeed,
      };
      initializeSimulation(opts);
    } else if (setupMode === 'zero') {
      const income = Math.max(0, parseInt(zeroMonthlyIncome, 10) || 0);
      const expenses = Math.max(0, parseInt(zeroExpenses, 10) || 0);
      const opts: SimulationInitOptions = {
        name: zeroName.trim() || 'Player',
        age: Math.max(16, parseInt(zeroAge, 10) || 21),
        stageId: income > 0 ? 'first_job' : 'zero',
        career: zeroJobTitle.trim() || 'Junior Professional',
        startingCash: 0,
        startingSavings: 0,
        startingDebt: 0,
        monthlyIncome: income,
        fixedExpenses: expenses,
        avatarSeed: 'avatar_zero',
      };
      initializeSimulation(opts);
    } else {
      const opts: SimulationInitOptions = {
        name: customName.trim() || 'Player',
        age: Math.max(16, parseInt(customAge, 10) || 21),
        stageId: 'first_job',
        career: 'Self-Directed Career',
        startingCash: Math.max(0, parseInt(startingCash, 10) || 0),
        startingSavings: 0,
        startingDebt: Math.max(0, parseInt(startingDebt, 10) || 0),
        monthlyIncome: Math.max(0, parseInt(monthlyIncome, 10) || 0),
        fixedExpenses: Math.max(0, parseInt(fixedExpenses, 10) || 0),
      };
      initializeSimulation(opts);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Minimal Hero Header */}
        <View style={styles.header}>
          <InteractiveAvatar mood="confident" size={68} />
          <Text style={styles.title}>Finance Simulator</Text>
          <Text style={styles.tagline}>
            Real-world money decisions. Choose a character or start from zero.
          </Text>
        </View>

        {/* Setup Mode Selector */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, setupMode === 'characters' && styles.modeTabActive]}
            onPress={() => setSetupMode('characters')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeTabText, setupMode === 'characters' && styles.modeTabTextActive]}>
              Characters (6)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, setupMode === 'zero' && styles.modeTabActive]}
            onPress={() => setSetupMode('zero')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeTabText, setupMode === 'zero' && styles.modeTabTextActive]}>
              Start from ₹0
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, setupMode === 'custom' && styles.modeTabActive]}
            onPress={() => setSetupMode('custom')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeTabText, setupMode === 'custom' && styles.modeTabTextActive]}>
              Custom Setup
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODE 1: Characters Roster */}
        {setupMode === 'characters' && (
          <View style={styles.sectionWrap}>
            {/* Horizontal Scroll of Character Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.charScroll}
            >
              {CHARACTER_ROSTER.map((c) => {
                const isSelected = selectedCharId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.charPill, isSelected && styles.charPillActive]}
                    onPress={() => setSelectedCharId(c.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.charPillName, isSelected && styles.charPillNameActive]}>
                      {c.name}
                    </Text>
                    <Text style={[styles.charPillRole, isSelected && styles.charPillRoleActive]}>
                      {c.title.split(' ')[1] || c.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Character Deep Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{selectedCharacter.name}, Age {selectedCharacter.age}</Text>
                  <Text style={styles.cardSubtitle}>{selectedCharacter.title}</Text>
                </View>
                <View style={styles.stageTag}>
                  <Text style={styles.stageTagText}>{selectedCharacter.stageId.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.taglineText}>"{selectedCharacter.tagline}"</Text>
              <Text style={styles.cardDesc}>{selectedCharacter.biography}</Text>

              {/* Character Perk */}
              <View style={styles.perkBox}>
                <Ionicons name="sparkles" size={14} color="#000000" />
                <View style={styles.perkInfo}>
                  <Text style={styles.perkTitle}>TRAIT: {selectedCharacter.perk.title.toUpperCase()}</Text>
                  <Text style={styles.perkDesc}>{selectedCharacter.perk.description}</Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Starting Cash</Text>
                  <Text style={styles.statVal}>{formatINR(selectedCharacter.startingCash)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Monthly Income</Text>
                  <Text style={styles.statVal}>{formatINR(selectedCharacter.monthlyIncome)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Living Expenses</Text>
                  <Text style={styles.statVal}>{formatINR(selectedCharacter.fixedExpenses)}/mo</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Starting Debt</Text>
                  <Text style={styles.statVal}>{formatINR(selectedCharacter.startingDebt)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* MODE 2: Start from Zero (Custom Profile Builder with ₹0 Initial Net Worth) */}
        {setupMode === 'zero' && (
          <View style={styles.sectionWrap}>
            {/* Ground Zero Header Banner */}
            <View style={styles.zeroBanner}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Ground Zero Profile</Text>
                  <Text style={styles.cardSubtitle}>
                    Start with ₹0 Cash, ₹0 Debt, and configure your income
                  </Text>
                </View>
                <View style={styles.stageTag}>
                  <Text style={styles.stageTagText}>₹0 NET WORTH</Text>
                </View>
              </View>
            </View>

            {/* Step 1: Personal Details */}
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>YOUR NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={zeroName}
                  onChangeText={setZeroName}
                  placeholder="e.g. Vidhut"
                  placeholderTextColor="#555"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>AGE</Text>
                <TextInput
                  style={styles.textInput}
                  value={zeroAge}
                  onChangeText={setZeroAge}
                  keyboardType="number-pad"
                  placeholder="21"
                  placeholderTextColor="#555"
                />
              </View>
            </View>

            {/* Step 2: Job Role & Presets */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Job & Income Source</Text>
              <Text style={styles.cardDesc}>
                Tap a quick preset role or customize your job & earnings:
              </Text>

              {/* Quick Preset Roles */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetScroll}
              >
                {JOB_PRESETS.map((p) => {
                  const isMatch = zeroJobTitle === p.title;
                  return (
                    <TouchableOpacity
                      key={p.title}
                      style={[styles.presetChip, isMatch && styles.presetChipActive]}
                      onPress={() => {
                        setZeroJobTitle(p.title);
                        setZeroMonthlyIncome(p.income);
                        setZeroExpenses(p.expenses);
                        setZeroIncomeType(p.type);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.presetChipText, isMatch && styles.presetChipTextActive]}>
                        {p.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Job Title Input */}
              <View style={[styles.customField, { marginTop: 12 }]}>
                <Text style={styles.fieldLabel}>JOB TITLE / PROFESSION</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={zeroJobTitle}
                  onChangeText={setZeroJobTitle}
                  placeholder="e.g. Junior Software Engineer"
                  placeholderTextColor="#555"
                />
              </View>

              {/* Income Source Type */}
              <View style={[styles.customField, { marginTop: 12 }]}>
                <Text style={styles.fieldLabel}>INCOME SOURCE CATEGORY</Text>
                <View style={styles.incomeTypeRow}>
                  {[
                    { key: 'salary', label: '💼 Full-Time Job' },
                    { key: 'freelance', label: '💻 Freelance / Gigs' },
                    { key: 'business', label: '🚀 Side Business' },
                    { key: 'stipend', label: '🎓 Internship' },
                    { key: 'unemployed', label: '🔍 Job Hunting (₹0)' },
                  ].map((item) => {
                    const isSelected = zeroIncomeType === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[styles.incomeTypeChip, isSelected && styles.incomeTypeChipActive]}
                        onPress={() => {
                          setZeroIncomeType(item.key as any);
                          if (item.key === 'unemployed') {
                            setZeroMonthlyIncome('0');
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.incomeTypeText, isSelected && styles.incomeTypeTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Monthly Earning & Living Expenses */}
              <View style={[styles.inputRow, { marginTop: 12, marginBottom: 0 }]}>
                <View style={[styles.customField, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>MONTHLY EARNING (₹)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={zeroMonthlyIncome}
                    onChangeText={setZeroMonthlyIncome}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#555"
                  />
                </View>
                <View style={[styles.customField, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>LIVING EXPENSES (₹)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={zeroExpenses}
                    onChangeText={setZeroExpenses}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              {/* Monthly Surplus Preview */}
              <View style={styles.surplusBox}>
                <Ionicons name="trending-up-outline" size={16} color="#00FF66" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.surplusTitle}>
                    Monthly Surplus: {formatINR(Math.max(0, (parseInt(zeroMonthlyIncome, 10) || 0) - (parseInt(zeroExpenses, 10) || 0)))}/mo
                  </Text>
                  <Text style={styles.surplusSub}>
                    Available for investing, savings, and compound growth.
                  </Text>
                </View>
              </View>

              {/* The ₹0 Ground Zero Guarantee */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Starting Cash</Text>
                  <Text style={styles.statVal}>₹0</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Starting Savings</Text>
                  <Text style={styles.statVal}>₹0</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Pre-Existing Debt</Text>
                  <Text style={styles.statVal}>₹0</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Initial Net Worth</Text>
                  <Text style={[styles.statVal, { color: '#00FF66' }]}>₹0</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* MODE 3: Custom Setup */}
        {setupMode === 'custom' && (
          <View style={styles.sectionWrap}>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="Your Name"
                  placeholderTextColor="#555"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>AGE</Text>
                <TextInput
                  style={styles.textInput}
                  value={customAge}
                  onChangeText={setCustomAge}
                  keyboardType="number-pad"
                  placeholder="21"
                  placeholderTextColor="#555"
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Custom Finances</Text>
              <View style={styles.customGrid}>
                <View style={styles.customField}>
                  <Text style={styles.fieldLabel}>STARTING CASH (₹)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={startingCash}
                    onChangeText={setStartingCash}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#555"
                  />
                </View>
                <View style={styles.customField}>
                  <Text style={styles.fieldLabel}>MONTHLY SALARY / INCOME (₹)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={monthlyIncome}
                    onChangeText={setMonthlyIncome}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#555"
                  />
                </View>
                <View style={styles.customField}>
                  <Text style={styles.fieldLabel}>LIVING EXPENSES (₹)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={fixedExpenses}
                    onChangeText={setFixedExpenses}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#555"
                  />
                </View>
                <View style={styles.customField}>
                  <Text style={styles.fieldLabel}>STARTING LOANS / DEBT (₹)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={startingDebt}
                    onChangeText={setStartingDebt}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} activeOpacity={0.85} onPress={handleStart}>
          <Text style={styles.startButtonText}>
            {setupMode === 'characters'
              ? `Play as ${selectedCharacter.name} →`
              : setupMode === 'zero'
              ? 'Begin from Zero (₹0) →'
              : 'Begin Custom Simulation →'}
          </Text>
        </TouchableOpacity>

        {/* Cloud Account Option */}
        <TouchableOpacity
          style={styles.cloudOptionBtn}
          activeOpacity={0.7}
          onPress={() => setAuthModalVisible(true)}
        >
          <Text style={styles.cloudOptionText}>Already have a cloud account? Sign In & Sync</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerNote}>
          100% virtual education simulator · Zero real money involved
        </Text>
      </ScrollView>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 0,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 8,
  },
  tagline: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
    lineHeight: 16,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777777',
  },
  modeTabTextActive: {
    color: '#000000',
  },
  sectionWrap: {
    marginBottom: 8,
  },
  charScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  charPill: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  charPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  charPillName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  charPillNameActive: {
    color: '#000000',
  },
  charPillRole: {
    fontSize: 10,
    color: '#777777',
    marginTop: 1,
  },
  charPillRoleActive: {
    color: '#333333',
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  stageTag: {
    backgroundColor: '#222222',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stageTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#CCCCCC',
  },
  taglineText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 17,
    marginBottom: 14,
  },
  perkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  perkInfo: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  perkDesc: {
    fontSize: 11,
    color: '#222222',
    marginTop: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#161616',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#242424',
  },
  statLabel: {
    fontSize: 9,
    color: '#666666',
    fontWeight: '700',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
  },
  customGrid: {
    gap: 10,
    marginTop: 8,
  },
  customField: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  zeroBanner: {
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  presetScroll: {
    paddingVertical: 6,
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
  },
  presetChipTextActive: {
    color: '#000000',
  },
  incomeTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  incomeTypeChip: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  incomeTypeChipActive: {
    backgroundColor: '#222222',
    borderColor: '#FFFFFF',
  },
  incomeTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#777777',
  },
  incomeTypeTextActive: {
    color: '#FFFFFF',
  },
  surplusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#141A14',
    borderWidth: 1,
    borderColor: '#243A24',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 14,
  },
  surplusTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FF66',
  },
  surplusSub: {
    fontSize: 10,
    color: '#88AA88',
    marginTop: 2,
    lineHeight: 14,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
  cloudOptionBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  cloudOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
    textDecorationLine: 'underline',
  },
  footerNote: {
    fontSize: 11,
    color: '#444444',
    textAlign: 'center',
  },
});
