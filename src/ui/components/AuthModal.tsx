/**
 * AuthModal — Simplistic Black & White Authentication & Cloud Sync Modal
 * Allows players to create an account, log in, or sync their simulation saves to PostgreSQL.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { apiClient } from '../../services/apiClient';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState(apiClient.getBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState<'idle' | 'connected' | 'failed'>('idle');

  const {
    user,
    isAuthenticated,
    isLoading,
    isSyncing,
    lastSyncedAt,
    errorMessage,
    login,
    register,
    logout,
    syncToCloud,
    clearError,
  } = useAuthStore();

  const testConnection = async (targetUrl?: string) => {
    setIsPinging(true);
    setPingStatus('idle');
    const urlToTest = targetUrl || serverUrl;
    try {
      const res = await fetch(`${urlToTest.replace(/\/$/, '')}/health`);
      const data = await res.json();
      if (data.status === 'healthy' || data.database === 'connected') {
        setPingStatus('connected');
      } else {
        setPingStatus('failed');
      }
    } catch {
      setPingStatus('failed');
    } finally {
      setIsPinging(false);
    }
  };

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    clearError();
    setMode(newMode);
  };

  const handleSubmit = async () => {
    if (mode === 'register') {
      if (!displayName.trim() || !email.trim() || !password) return;
      const success = await register(displayName, email, password);
      if (success) {
        onClose();
      }
    } else {
      if (!email.trim() || !password) return;
      const success = await login(email, password);
      if (success) {
        onClose();
      }
    }
  };

  const handleManualSync = async () => {
    await syncToCloud();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>
                {isAuthenticated ? 'Cloud Account' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isAuthenticated
                  ? 'Your simulation saves are backed up to PostgreSQL'
                  : 'Sync your game progress across devices'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* If already logged in */}
          {isAuthenticated && user ? (
            <View style={styles.profileSection}>
              <View style={styles.profileBadge}>
                <Ionicons name="person-circle-outline" size={48} color={colors.primary} />
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{user.displayName}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.syncStatusCard}>
                <View style={styles.syncInfoRow}>
                  <Ionicons name="cloud-done-outline" size={20} color={colors.primary} />
                  <Text style={styles.syncStatusText}>
                    {lastSyncedAt ? `Last synced at ${lastSyncedAt}` : 'Ready to sync'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.syncBtn, isSyncing && styles.btnDisabled]}
                  onPress={handleManualSync}
                  disabled={isSyncing}
                  activeOpacity={0.8}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text style={styles.syncBtnText}>Sync Game Now</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Switch Character / Return to First Page */}
              <TouchableOpacity
                style={styles.switchProfileBtn}
                onPress={() => {
                  onClose();
                  useSimulationStore.getState().resetSimulation();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal" size={16} color="#000000" />
                <Text style={styles.switchProfileBtnText}>Choose Different Character / Setup</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
                <Text style={styles.logoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Login / Register Form */
            <View style={styles.formSection}>
              {/* Mode Toggle Tabs */}
              <View style={styles.tabToggle}>
                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
                  onPress={() => handleSwitchMode('login')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabBtnText, mode === 'login' && styles.tabBtnTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
                  onPress={() => handleSwitchMode('register')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabBtnText, mode === 'register' && styles.tabBtnTextActive]}>
                    Register
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {errorMessage && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FFFFFF" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    {errorMessage.toLowerCase().includes('already registered') && (
                      <TouchableOpacity
                        onPress={() => handleSwitchMode('login')}
                        style={{ marginTop: 6, alignSelf: 'flex-start' }}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 12 }}>
                          Switch to Sign In →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Display Name field (only for Register) */}
              {mode === 'register' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Arjun"
                    placeholderTextColor="#666666"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#666666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#666666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Privacy Notice */}
              <View style={styles.privacyNote}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#888888" />
                <Text style={styles.privacyText}>
                  Zero real financial data required. All money metrics are strictly simulated.
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'login' ? 'Sign In to Cloud' : 'Create Simulator Account'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Server Endpoint Config (for physical device testing over Wi-Fi) */}
              <TouchableOpacity
                style={styles.serverToggle}
                onPress={() => setShowServerConfig(!showServerConfig)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="wifi-outline"
                  size={14}
                  color={pingStatus === 'connected' ? '#00FF66' : pingStatus === 'failed' ? '#FF4444' : '#888888'}
                />
                <Text style={styles.serverToggleText} numberOfLines={1}>
                  Server: {serverUrl}
                </Text>
                <Ionicons
                  name={showServerConfig ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color="#888888"
                />
              </TouchableOpacity>

              {showServerConfig && (
                <View style={styles.serverConfigBox}>
                  <Text style={styles.serverConfigDesc}>
                    Tap a connection preset or enter your PC's IP:
                  </Text>

                  {/* Preset Pills */}
                  <View style={styles.presetRow}>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => {
                        const url = 'http://10.208.114.144:4000/api';
                        setServerUrl(url);
                        apiClient.setBaseUrl(url);
                        testConnection(url);
                      }}
                    >
                      <Text style={styles.presetChipText}>Wi-Fi (10.208.114.144)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => {
                        const url = 'http://10.0.2.2:4000/api';
                        setServerUrl(url);
                        apiClient.setBaseUrl(url);
                        testConnection(url);
                      }}
                    >
                      <Text style={styles.presetChipText}>Android Emulator</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => {
                        const url = 'http://localhost:4000/api';
                        setServerUrl(url);
                        apiClient.setBaseUrl(url);
                        testConnection(url);
                      }}
                    >
                      <Text style={styles.presetChipText}>Localhost</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.serverInput}
                    value={serverUrl}
                    onChangeText={(val) => {
                      setServerUrl(val);
                      apiClient.setBaseUrl(val);
                    }}
                    placeholder="http://10.208.114.144:4000/api"
                    placeholderTextColor="#555555"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {/* Test Connection Button */}
                  <TouchableOpacity
                    style={[styles.pingBtn, pingStatus === 'connected' && styles.pingBtnSuccess, pingStatus === 'failed' && styles.pingBtnFail]}
                    onPress={() => testConnection()}
                    disabled={isPinging}
                    activeOpacity={0.8}
                  >
                    {isPinging ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.pingBtnText}>
                        {pingStatus === 'connected'
                          ? '✓ Connected to Backend (PostgreSQL OK)'
                          : pingStatus === 'failed'
                          ? '✗ Cannot reach server (Tap to test again)'
                          : 'Test Connection'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 16,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
  },
  tabBtnTextActive: {
    color: '#000000',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#331111',
    borderWidth: 1,
    borderColor: '#552222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  formSection: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#777777',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 18,
  },
  privacyText: {
    fontSize: 11,
    color: '#888888',
    flex: 1,
    lineHeight: 15,
  },
  submitBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.2,
  },
  profileSection: {
    width: '100%',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 16,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  syncStatusCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  syncInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncStatusText: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  syncBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  syncBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  switchProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  switchProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
  },
  serverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 4,
  },
  serverToggleText: {
    fontSize: 11,
    color: '#666666',
    maxWidth: 260,
  },
  serverConfigBox: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  serverConfigDesc: {
    fontSize: 11,
    color: '#888888',
    marginBottom: 6,
  },
  serverInput: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  presetChip: {
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  pingBtn: {
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingBtnSuccess: {
    backgroundColor: '#0E3A1A',
    borderWidth: 1,
    borderColor: '#1D7A35',
  },
  pingBtnFail: {
    backgroundColor: '#4A1515',
    borderWidth: 1,
    borderColor: '#8A2525',
  },
  pingBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
