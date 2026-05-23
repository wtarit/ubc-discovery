import { create } from 'zustand';
import * as Location from 'expo-location';
import { EXPLORE_ZONES, type ExploreZone } from '@/constants/Zones';
import { api, type EventResponse } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { haversineMeters } from '@/utils/geo';

interface ZoneUnlock {
  zoneId: string;
  unlockedAt: string;
}

export interface UnlockResult {
  success: boolean;
  error?: 'auth_required' | 'location_permission_denied' | 'too_far' | 'network';
  distance?: number;
  required?: number;
}

interface ExploreState {
  zones: ExploreZone[];
  events: EventResponse[];
  unlockedZones: ZoneUnlock[];
  selectedZone: ExploreZone | null;
  selectedEvent: EventResponse | null;
  totalPoints: number;
  isLoading: boolean;
  isUnlocking: boolean;

  selectZone: (zone: ExploreZone | null) => void;
  selectEvent: (event: EventResponse | null) => void;
  unlockZone: (zoneId: string) => Promise<UnlockResult>;
  isZoneUnlocked: (zoneId: string) => boolean;
  getProgress: () => { unlocked: number; total: number; percentage: number };
  getPointsForZone: (zoneId: string) => number;
  fetchEvents: () => Promise<void>;
  fetchProgress: () => Promise<void>;
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  zones: EXPLORE_ZONES,
  events: [],
  unlockedZones: [],
  selectedZone: null,
  selectedEvent: null,
  totalPoints: 0,
  isLoading: false,
  isUnlocking: false,

  selectZone: (zone) => set({ selectedZone: zone, selectedEvent: null }),
  selectEvent: (event) => set({ selectedEvent: event, selectedZone: null }),

  unlockZone: async (zoneId) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return { success: false, error: 'auth_required' };

    if (get().isZoneUnlocked(zoneId)) return { success: true };

    const zone = get().zones.find((z) => z.id === zoneId);
    if (!zone) return { success: false, error: 'network' };

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'location_permission_denied' };
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const distance = haversineMeters(
      loc.coords.latitude,
      loc.coords.longitude,
      zone.latitude,
      zone.longitude,
    );

    if (distance > zone.radiusMeters) {
      return {
        success: false,
        error: 'too_far',
        distance: Math.round(distance),
        required: zone.radiusMeters,
      };
    }

    set({ isUnlocking: true });
    try {
      await api.unlockZone(zoneId);
      set((state) => ({
        unlockedZones: [
          ...state.unlockedZones,
          { zoneId, unlockedAt: new Date().toISOString() },
        ],
        totalPoints: state.totalPoints + zone.points,
        isUnlocking: false,
      }));
      return { success: true };
    } catch (e: any) {
      set({ isUnlocking: false });
      if (e?.status === 409) {
        if (!get().isZoneUnlocked(zoneId)) {
          set((state) => ({
            unlockedZones: [
              ...state.unlockedZones,
              { zoneId, unlockedAt: new Date().toISOString() },
            ],
            totalPoints: state.totalPoints + zone.points,
          }));
        }
        return { success: true };
      }
      return { success: false, error: 'network' };
    }
  },

  isZoneUnlocked: (zoneId) => {
    return get().unlockedZones.some((u) => u.zoneId === zoneId);
  },

  getProgress: () => {
    const state = get();
    const unlocked = state.unlockedZones.length;
    const total = state.zones.length;
    return {
      unlocked,
      total,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    };
  },

  getPointsForZone: (zoneId) => {
    const zone = get().zones.find((z) => z.id === zoneId);
    return zone?.points ?? 0;
  },

  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const data = await api.listEvents(0, 50);
      set({ events: data.events, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchProgress: async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    try {
      const data = await api.getZoneProgress();
      set({
        unlockedZones: data.unlocks.map((u) => ({
          zoneId: u.zone_id,
          unlockedAt: u.unlocked_at,
        })),
        totalPoints: data.total_points,
      });
    } catch {
      // silent fail — progress will be fetched on next attempt
    }
  },
}));
