/**
 * Finance Life Simulator — Root Application
 * Coordinates top-level state, onboarding gate, and responsive tab navigation.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/ui/theme/colors';
import { useSimulationStore, AppTab } from './src/store/useSimulationStore';
import { OnboardingScreen } from './src/ui/screens/OnboardingScreen';
import { DashboardScreen } from './src/ui/screens/DashboardScreen';
import { LifeScreen } from './src/ui/screens/LifeScreen';
import { PortfolioScreen } from './src/ui/screens/PortfolioScreen';
import { WhatIfScreen } from './src/ui/screens/WhatIfScreen';
import { CoachScreen } from './src/ui/screens/CoachScreen';

export default function App() {
  const isInitialized = useSimulationStore((state) => state.isInitialized);
  const activeTab = useSimulationStore((state) => state.activeTab);
  const setActiveTab = useSimulationStore((state) => state.setActiveTab);
  const currentEvent = useSimulationStore((state) => state.currentEvent);

  if (!isInitialized) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <OnboardingScreen />
      </View>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'life':
        return <LifeScreen />;
      case 'portfolio':
        return <PortfolioScreen />;
      case 'whatif':
        return <WhatIfScreen />;
      case 'coach':
        return <CoachScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const tabs: { id: AppTab; label: string; icon: keyof typeof Ionicons.glyphMap; hasBadge?: boolean }[] = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'life', label: 'Life', icon: 'game-controller', hasBadge: currentEvent !== null },
    { id: 'portfolio', label: 'Portfolio', icon: 'pie-chart' },
    { id: 'whatif', label: 'What-If', icon: 'git-branch' },
    { id: 'coach', label: 'Coach', icon: 'chatbubbles' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Screen Body */}
      <View style={styles.content}>{renderActiveScreen()}</View>

      {/* Modern Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
            >
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={isActive ? (tab.icon as any) : (`${tab.icon}-outline` as any)}
                  size={22}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                {tab.hasBadge && <View style={styles.tabBadgeDot} />}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 84 : 64,
    backgroundColor: colors.tabBar,
    borderTopWidth: 1,
    borderColor: colors.tabBarBorder,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingTop: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.tabBar,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
  },
});
