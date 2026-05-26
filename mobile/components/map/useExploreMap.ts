import { useState, useCallback, useEffect } from 'react';
import { useExploreStore } from '@/stores/useExploreStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { api, type EventResponse } from '@/services/api';
import type { ExploreZone } from '@/constants/Zones';

type CategoryFilter = ExploreZone['category'] | 'all' | 'events';

export function useExploreMap() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedZone, setSelectedZone] = useState<ExploreZone | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const {
    zones, events, fetchEvents,
    isZoneUnlocked, getProgress, totalPoints,
    unlockZone, isUnlocking,
  } = useExploreStore();
  const { accessToken } = useAuthStore();
  const progress = getProgress();

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredZones = (activeCategory === 'all')
    ? zones
    : (activeCategory === 'events' ? [] : zones.filter(z => z.category === activeCategory));

  const filteredEvents = (activeCategory === 'all' || activeCategory === 'events')
    ? events
    : [];

  const selectZone = useCallback((zone: ExploreZone) => {
    setSelectedZone(zone);
    setSelectedEvent(null);
    setJustUnlocked(null);
    setUnlockError(null);
  }, []);

  const selectEvent = useCallback((event: EventResponse) => {
    setSelectedEvent(event);
    setSelectedZone(null);
    setJustUnlocked(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedZone(null);
    setSelectedEvent(null);
  }, []);

  const handleUnlock = useCallback(async () => {
    if (!selectedZone) return;
    setUnlockError(null);
    const result = await unlockZone(selectedZone.id);
    if (result.success) {
      setJustUnlocked(selectedZone.id);
    } else if (result.error === 'too_far') {
      setUnlockError(`You're ${result.distance}m away. Get within ${result.required}m to unlock.`);
    } else if (result.error === 'location_permission_denied') {
      setUnlockError('Location permission needed to unlock zones.');
    } else if (result.error === 'network') {
      setUnlockError('Something went wrong. Try again.');
    }
  }, [selectedZone, unlockZone]);

  return {
    activeCategory, setActiveCategory,
    selectedZone, selectedEvent,
    justUnlocked, unlockError,
    filteredZones, filteredEvents,
    progress, totalPoints, isUnlocking, accessToken,
    isZoneUnlocked,
    selectZone, selectEvent, clearSelection, handleUnlock,
  };
}
