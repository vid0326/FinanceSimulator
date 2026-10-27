/**
 * API Client for Finance Life Simulator Backend (Express + PostgreSQL)
 */

import { Platform, NativeModules } from 'react-native';

function resolveDefaultApiUrl(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api';
  }

  // Attempt to auto-detect host IP from Metro bundler scriptURL (works on physical phone in Expo Go!)
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
      if (match && match[1]) {
        const host = match[1];
        if (host !== 'localhost' && host !== '127.0.0.1') {
          return `http://${host}:4000/api`;
        }
      }
    }
  } catch {
    // Ignore detection error
  }

  // Current host machine Wi-Fi IP (updated for local network)
  // For physical Android/iOS devices on the same Wi-Fi
  const CURRENT_WIFI_IP = '10.208.114.144';

  if (Platform.OS === 'android') {
    return `http://${CURRENT_WIFI_IP}:4000/api`;
  }

  return `http://${CURRENT_WIFI_IP}:4000/api`;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  player: string;
  characterName: string;
  archetype: string;
  currentAge?: number;
  stage: string;
  netWorth: number;
  healthScore: number;
  level: number;
  monthsSurvived: number;
  lastActive?: string;
}

class ApiClient {
  private baseUrl: string = resolveDefaultApiUrl();
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error ${response.status}`);
    }

    return data as T;
  }

  async checkHealth() {
    return this.request<{ status: string; database: string }>('/health');
  }

  async register(displayName: string, email: string, password: string) {
    const result = await this.request<{
      user: { id: string; email: string; displayName: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, email, password }),
    });

    this.setTokens(result.accessToken, result.refreshToken);
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{
      user: { id: string; email: string; displayName: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setTokens(result.accessToken, result.refreshToken);
    return result;
  }

  async fetchMe() {
    return this.request<{
      user: {
        id: string;
        email: string;
        displayName: string;
        createdAt: string;
        gameSaves: Array<{ id: string; characterName: string; currentAge: number; currentMonth: number; currentStage: string; updatedAt: string }>;
      };
    }>('/auth/me');
  }

  async syncGameState(payload: {
    gameSaveId?: string;
    characterName: string;
    currentAge: number;
    currentMonth: number;
    currentStage: string;
    totalMonthsSimulated: number;
    balanceSheet: any;
    budget: any;
    healthScore: any;
    gamification: any;
    decisionLog?: any;
  }) {
    return this.request<{
      success: boolean;
      gameSaveId: string;
      updatedAt: string;
      message: string;
    }>('/game/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async fetchGameState() {
    return this.request<{
      found: boolean;
      save: {
        id: string;
        characterName: string;
        currentAge: number;
        currentMonth: number;
        currentStage: string;
        totalMonthsSimulated: number;
        balanceSheet: any;
        budget: any;
        healthScore: any;
        gamification: any;
        decisionLogs: any[];
        updatedAt?: string;
      };
    }>('/game/state');
  }

  async fetchWealthLeaderboard() {
    return this.request<{
      category: string;
      leaderboard: LeaderboardEntry[];
    }>('/leaderboard/wealth');
  }

  async fetchHealthLeaderboard() {
    return this.request<{
      category: string;
      leaderboard: LeaderboardEntry[];
    }>('/leaderboard/health');
  }

  async logPromotion(payload: {
    gameSaveId: string;
    previousTitle: string;
    newTitle: string;
    previousSalary: number;
    newSalary: number;
    hikePercentage: number;
    bonusAmount: number;
    lifestyleChoice: string;
    monthSimulated: number;
  }) {
    return this.request<{
      success: boolean;
      promotionLog: any;
    }>('/game/promotion', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export const apiClient = new ApiClient();
