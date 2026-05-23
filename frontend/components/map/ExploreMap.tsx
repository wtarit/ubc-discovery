import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useCallback, useRef, useMemo } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Map, Marker, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import { router } from 'expo-router';
import { Check, Calendar, Navigation, User } from '@/components/icons';

import { Brand } from '@/constants/Colors';
import { CATEGORY_COLORS, UBC_CENTER, type ExploreZone } from '@/constants/Zones';
import { shared as s } from './mapStyles';
import { useExploreMap } from './useExploreMap';
import { ExploreStats, CategoryFilters, ZoneBottomCard, EventBottomCard } from './ExploreMapOverlays';
import type { EventResponse } from '@/services/api';
import type { StyleSpecification } from 'maplibre-gl';

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-light': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-light-layer',
      type: 'raster',
      source: 'carto-light',
    },
  ],
};

function createCirclePolygon(lat: number, lng: number, radiusMeters: number, points = 64): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);
    const dLat = dy / 111320;
    const dLng = dx / (111320 * Math.cos((lat * Math.PI) / 180));
    coords.push([lng + dLng, lat + dLat]);
  }
  return coords;
}

interface ExploreMapProps {
  insetTop: number;
  insetBottom: number;
}

export default function ExploreMapWeb({ insetTop, insetBottom }: ExploreMapProps) {
  const mapRef = useRef<MapRef>(null);

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
    selectZone(zone);
    mapRef.current?.flyTo({
      center: [zone.longitude, zone.latitude - 0.003],
      zoom: 15,
      duration: 400,
    });
  }, [selectZone]);

  const handleEventMarkerPress = useCallback((event: EventResponse) => {
    if (!event.latitude || !event.longitude) return;
    selectEvent(event);
    mapRef.current?.flyTo({
      center: [event.longitude, event.latitude - 0.003],
      zoom: 15,
      duration: 400,
    });
  }, [selectEvent]);

  const zoneCirclesGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredZones.map(zone => {
      const unlocked = isZoneUnlocked(zone.id);
      const catColor = CATEGORY_COLORS[zone.category];
      const isSelected = selectedZone?.id === zone.id;
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [createCirclePolygon(zone.latitude, zone.longitude, zone.radiusMeters)],
        },
        properties: {
          fillColor: unlocked ? 'rgba(52,199,89,0.1)' : `${catColor}15`,
          strokeColor: unlocked ? Brand.success : `${catColor}40`,
          strokeWidth: isSelected ? 2.5 : 1.5,
        },
      };
    }),
  }), [filteredZones, selectedZone?.id, isZoneUnlocked]);

  return (
    <View style={s.container}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: UBC_CENTER.longitude,
          latitude: UBC_CENTER.latitude,
          zoom: 14,
        }}
        mapStyle={MAP_STYLE}
        onClick={() => clearSelection()}
        style={{ width: '100%', height: '100%' }}
      >
        <Source id="zone-circles" type="geojson" data={zoneCirclesGeoJSON}>
          <Layer
            id="zone-circles-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'fillColor'],
              'fill-opacity': 0.6,
            }}
          />
          <Layer
            id="zone-circles-stroke"
            type="line"
            paint={{
              'line-color': ['get', 'strokeColor'],
              'line-width': ['get', 'strokeWidth'],
            }}
          />
        </Source>

        {filteredZones.map(zone => {
          const unlocked = isZoneUnlocked(zone.id);
          const isSelected = selectedZone?.id === zone.id;
          return (
            <Marker
              key={zone.id}
              longitude={zone.longitude}
              latitude={zone.latitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerPress(zone);
              }}
            >
              <TouchableOpacity activeOpacity={0.85} onPress={() => handleMarkerPress(zone)}>
                <View style={[s.marker, isSelected && s.markerSel, unlocked && s.markerDone]}>
                  <zone.Icon size={20} color={isSelected ? Brand.accent : unlocked ? Brand.success : Brand.primary} />
                  {unlocked && (
                    <View style={s.chk}>
                      <Check size={10} color="#fff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Marker>
          );
        })}

        {connections.filter(c => c.latitude != null && c.longitude != null).map(conn => (
          <Marker
            key={`conn-${conn.id}`}
            longitude={conn.longitude!}
            latitude={conn.latitude!}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              router.push({ pathname: '/user-detail', params: { userId: conn.id, fromConnection: '1' } });
            }}
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
              longitude={event.longitude}
              latitude={event.latitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleEventMarkerPress(event);
              }}
            >
              <TouchableOpacity activeOpacity={0.85} onPress={() => handleEventMarkerPress(event)}>
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
              </TouchableOpacity>
            </Marker>
          );
        })}
      </Map>

      <ExploreStats progress={progress} totalPoints={totalPoints} insetTop={insetTop} />
      <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} insetTop={insetTop} />

      <TouchableOpacity
        style={[s.recenter, { bottom: (selectedZone || selectedEvent) ? 260 : 100 }]}
        onPress={() => {
          mapRef.current?.flyTo({
            center: [UBC_CENTER.longitude, UBC_CENTER.latitude],
            zoom: 14,
            duration: 500,
          });
        }}
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
