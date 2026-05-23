import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { router } from 'expo-router';
import { Check, Calendar, Navigation, User } from 'lucide-react-native';

import { Brand, Surfaces } from '@/constants/Colors';
import { CATEGORY_COLORS, UBC_CENTER, type ExploreZone } from '@/constants/Zones';
import { shared as s } from './mapStyles';
import { useExploreMap } from './useExploreMap';
import { ExploreStats, CategoryFilters, ZoneBottomCard, EventBottomCard } from './ExploreMapOverlays';
import type { EventResponse } from '@/services/api';

interface ExploreMapProps {
  insetTop: number;
  insetBottom: number;
}

export default function ExploreMapNative({ insetTop, insetBottom }: ExploreMapProps) {
  const mapRef = useRef<MapView>(null);
  const markerPressInFlight = useRef(false);

  const {
    activeCategory, setActiveCategory,
    selectedZone, selectedEvent,
    justUnlocked, unlockError,
    connections,
    filteredZones, filteredEvents,
    progress, totalPoints, isUnlocking, accessToken,
    isZoneUnlocked,
    selectZone, selectEvent, clearSelection, handleUnlock,
  } = useExploreMap();

  const handleMarkerPress = useCallback((zone: ExploreZone) => {
    markerPressInFlight.current = true;
    selectZone(zone);
    mapRef.current?.animateToRegion({
      latitude: zone.latitude - 0.003,
      longitude: zone.longitude,
      latitudeDelta: 0.012, longitudeDelta: 0.012,
    }, 400);
    setTimeout(() => { markerPressInFlight.current = false; }, 150);
  }, [selectZone]);

  const handleEventMarkerPress = useCallback((event: EventResponse) => {
    if (!event.latitude || !event.longitude) return;
    markerPressInFlight.current = true;
    selectEvent(event);
    mapRef.current?.animateToRegion({
      latitude: event.latitude - 0.003,
      longitude: event.longitude,
      latitudeDelta: 0.012, longitudeDelta: 0.012,
    }, 400);
    setTimeout(() => { markerPressInFlight.current = false; }, 150);
  }, [selectEvent]);

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={UBC_CENTER}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => {
          if (markerPressInFlight.current) return;
          clearSelection();
        }}
      >
        {filteredZones.map(zone => {
          const unlocked = isZoneUnlocked(zone.id);
          const catColor = CATEGORY_COLORS[zone.category];
          const isSelected = selectedZone?.id === zone.id;
          return (
            <React.Fragment key={zone.id}>
              <Circle
                center={{ latitude: zone.latitude, longitude: zone.longitude }}
                radius={zone.radiusMeters}
                fillColor={unlocked ? 'rgba(52,199,89,0.1)' : `${catColor}15`}
                strokeColor={unlocked ? Brand.success : `${catColor}40`}
                strokeWidth={isSelected ? 2 : 1}
              />
              <Marker
                coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
                onPress={() => handleMarkerPress(zone)}
                onSelect={() => handleMarkerPress(zone)}
                tracksViewChanges={false}
              >
                <View style={[s.marker, isSelected && s.markerSel, unlocked && s.markerDone]}>
                  <zone.Icon size={20} color={isSelected ? Brand.accent : unlocked ? Brand.success : Brand.primary} />
                  {unlocked && (
                    <View style={s.chk}>
                      <Check size={10} color="#fff" />
                    </View>
                  )}
                </View>
              </Marker>
            </React.Fragment>
          );
        })}

        {connections.filter(c => c.latitude != null && c.longitude != null).map(conn => (
          <Marker
            key={`conn-${conn.id}`}
            coordinate={{ latitude: conn.latitude!, longitude: conn.longitude! }}
            tracksViewChanges={false}
            onPress={() => router.push({ pathname: '/user-detail', params: { userId: conn.id, fromConnection: '1' } })}
          >
            <View style={s.connMarker}>
              {conn.profile_picture_url ? (
                <Image source={{ uri: conn.profile_picture_url }} style={s.connAvatar} />
              ) : (
                <User size={18} color={Brand.accent} />
              )}
              {conn.is_available_to_meet && <View style={s.connDot} />}
            </View>
          </Marker>
        ))}

        {filteredEvents.map(event => {
          if (!event.latitude || !event.longitude) return null;
          const isSelected = selectedEvent?.id === event.id;
          return (
            <Marker
              key={event.id}
              coordinate={{ latitude: event.latitude, longitude: event.longitude }}
              onPress={() => handleEventMarkerPress(event)}
              onSelect={() => handleEventMarkerPress(event)}
              tracksViewChanges={false}
            >
              <View style={[
                s.marker,
                { borderColor: Brand.accent, backgroundColor: '#FFF9F0' },
                isSelected && s.markerSel,
              ]}>
                <Calendar
                  size={20}
                  color={isSelected ? Brand.accent : Brand.primary}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <ExploreStats progress={progress} totalPoints={totalPoints} insetTop={insetTop} />
      <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} insetTop={insetTop} />

      <TouchableOpacity
        style={[s.recenter, { bottom: (selectedZone || selectedEvent) ? 260 : 100 }]}
        onPress={() => mapRef.current?.animateToRegion(UBC_CENTER, 500)}
        activeOpacity={0.8}
      >
        <Navigation size={20} color={Brand.primary} />
      </TouchableOpacity>

      {selectedZone && (
        <ZoneBottomCard
          zone={selectedZone}
          isUnlocked={isZoneUnlocked(selectedZone.id)}
          justUnlocked={justUnlocked}
          unlockError={unlockError}
          isUnlocking={isUnlocking}
          accessToken={accessToken}
          onUnlock={handleUnlock}
          insetBottom={insetBottom}
        />
      )}

      {selectedEvent && (
        <EventBottomCard event={selectedEvent} insetBottom={insetBottom} />
      )}
    </View>
  );
}
