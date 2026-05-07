/**
 * Zustand store for nearby/proximity matching state
 */
import { create } from 'zustand';
import { MOCK_NEARBY_USERS, AI_INTRO_TEMPLATES, type NearbyUser } from '@/constants/MockUsers';

interface Introduction {
  id: string;
  targetUserId: string;
  message: string;
  status: 'sent' | 'read' | 'replied';
  sentAt: string;
}

interface NearbyState {
  nearbyUsers: NearbyUser[];
  selectedUser: NearbyUser | null;
  introductions: Introduction[];
  isScanning: boolean;

  // Actions
  selectUser: (user: NearbyUser | null) => void;
  startScanning: () => void;
  stopScanning: () => void;
  sendIntroduction: (userId: string) => void;
  generateAIIntro: (user: NearbyUser) => string;
  getIntroForUser: (userId: string) => Introduction | undefined;
}

export const useNearbyStore = create<NearbyState>((set, get) => ({
  nearbyUsers: MOCK_NEARBY_USERS,
  selectedUser: null,
  introductions: [],
  isScanning: false,

  selectUser: (user) => set({ selectedUser: user }),

  startScanning: () => set({ isScanning: true }),
  stopScanning: () => set({ isScanning: false }),

  sendIntroduction: (userId) => {
    const state = get();
    const user = state.nearbyUsers.find((u) => u.id === userId);
    if (!user) return;

    const message = state.generateAIIntro(user);
    const intro: Introduction = {
      id: `intro-${Date.now()}`,
      targetUserId: userId,
      message,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };

    set({ introductions: [...state.introductions, intro] });
  },

  generateAIIntro: (user) => {
    const template = AI_INTRO_TEMPLATES[Math.floor(Math.random() * AI_INTRO_TEMPLATES.length)];
    return template
      .replace('{name}', user.displayName)
      .replace('{shared_interest}', user.interests[0] || 'learning')
      .replace('{program}', user.program)
      .replace('{zones}', String(user.zonesExplored))
      .replace('{match_score}', String(user.matchScore));
  },

  getIntroForUser: (userId) => {
    return get().introductions.find((i) => i.targetUserId === userId);
  },
}));
