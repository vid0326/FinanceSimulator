/**
 * Authentication & Cloud Sync Store (Zustand)
 * Manages user login state, JWT tokens, and cloud sync status.
 */

import { create } from 'zustand';
import { apiClient } from '../services/apiClient';
import { useSimulationStore } from './useSimulationStore';

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  activeSaveId: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (displayName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  syncToCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isSyncing: false,
  lastSyncedAt: null,
  errorMessage: null,
  activeSaveId: null,

  clearError: () => set({ errorMessage: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const response = await apiClient.login(email.trim(), password);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        errorMessage: null,
      });

      // After login, try to restore cloud save if available
      try {
        await get().loadFromCloud();
      } catch {
        // If no cloud save exists yet, that's fine
      }

      return true;
    } catch (err: any) {
      const msg = err.message || '';
      const isNetworkError =
        msg.includes('Network request failed') ||
        msg.includes('ConnectException') ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError');

      set({
        isLoading: false,
        errorMessage: isNetworkError
          ? `Cannot reach server at ${apiClient.getBaseUrl()}. Ensure phone and computer are on the same Wi-Fi.`
          : msg || 'Failed to log in',
      });
      return false;
    }
  },

  register: async (displayName: string, email: string, password: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const response = await apiClient.register(displayName.trim(), email.trim(), password);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        errorMessage: null,
      });

      // Immediately sync current simulation state as the initial save
      await get().syncToCloud();

      return true;
    } catch (err: any) {
      const msg = err.message || '';
      const isNetworkError =
        msg.includes('Network request failed') ||
        msg.includes('ConnectException') ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError');

      set({
        isLoading: false,
        errorMessage: isNetworkError
          ? `Cannot reach server at ${apiClient.getBaseUrl()}. Ensure phone and computer are on the same Wi-Fi.`
          : msg || 'Failed to register',
      });
      return false;
    }
  },

  logout: () => {
    apiClient.logout();
    set({
      user: null,
      isAuthenticated: false,
      activeSaveId: null,
      lastSyncedAt: null,
      errorMessage: null,
    });
  },

  syncToCloud: async () => {
    if (!get().isAuthenticated) return false;

    set({ isSyncing: true });
    try {
      const simState = useSimulationStore.getState();
      const payload = {
        gameSaveId: get().activeSaveId || undefined,
        characterName: simState.profile.name,
        currentAge: simState.profile.currentAge,
        currentMonth: simState.profile.currentMonth,
        currentStage: simState.profile.currentStage,
        totalMonthsSimulated: simState.profile.totalMonthsSimulated,
        balanceSheet: simState.balanceSheet,
        budget: simState.budget,
        healthScore: simState.healthScore,
        gamification: simState.gamification,
      };

      const result = await apiClient.syncGameState(payload);
      set({
        isSyncing: false,
        activeSaveId: result.gameSaveId,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    } catch (err: any) {
      console.error('Cloud sync failed:', err);
      set({ isSyncing: false });
      return false;
    }
  },

  loadFromCloud: async () => {
    if (!get().isAuthenticated) return false;

    set({ isLoading: true });
    try {
      const result = await apiClient.fetchGameState();
      if (result.found && result.save) {
        // Hydrate simulation engine with cloud save state
        useSimulationStore.getState().restoreCloudSave(result.save);

        set({
          activeSaveId: result.save.id,
          isLoading: false,
          lastSyncedAt: new Date(result.save.updatedAt || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.error('Load cloud save failed:', err);
      set({ isLoading: false });
      return false;
    }
  },
}));
