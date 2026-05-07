/**
 * ExploreMap — Web version with interactive SVG campus map
 * 
 * Since react-native-maps doesn't work on web, this renders
 * an interactive bird's-eye view of UBC with positioned zone markers.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Brand, Surfaces, Typography, Spacing, Radius, Shadows } from '@/constants/Colors';
import { EXPLORE_ZONES, CATEGORY_COLORS, UBC_CENTER, type ExploreZone } from '@/constants/Zones';
import { useExploreStore } from '@/stores/useExploreStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Map bounds for positioning markers (lat/lng → pixel)
const MAP_BOUNDS = {
  north: 49.275,
  south: 49.255,
  west: -123.270,
  east: -123.235,
};

function latLngToXY(lat: number, lng: number, mapW: number, mapH: number) {
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * mapW;
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * mapH;
  return { x, y };
}

type CategoryFilter = ExploreZone['category'] | 'all';
const CATEGORIES: { key: CategoryFilter; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '🗺️' },
  { key: 'nature', label: 'Nature', emoji: '🌿' },
  { key: 'academic', label: 'Academic', emoji: '📚' },
  { key: 'social', label: 'Social', emoji: '🤝' },
  { key: 'culture', label: 'Culture', emoji: '🎭' },
  { key: 'athletics', label: 'Athletics', emoji: '⚡' },
];

interface ExploreMapProps {
  insetTop: number;
  insetBottom: number;
}

export default function ExploreMapWeb({ insetTop, insetBottom }: ExploreMapProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedZone, setSelectedZone] = useState<ExploreZone | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const { zones, isZoneUnlocked, getProgress, totalPoints, unlockZone } = useExploreStore();
  const progress = getProgress();

  const mapW = Math.max(SCREEN_W, 400);
  const mapH = SCREEN_H - 88; // minus tab bar

  const filteredZones = activeCategory === 'all' ? zones : zones.filter(z => z.category === activeCategory);

  const handleMarkerPress = useCallback((zone: ExploreZone) => {
    setSelectedZone(zone);
    setJustUnlocked(null);
  }, []);

  const handleUnlock = useCallback(() => {
    if (!selectedZone) return;
    unlockZone(selectedZone.id);
    setJustUnlocked(selectedZone.id);
  }, [selectedZone, unlockZone]);

  return (
    <View style={s.container}>
      {/* ===== MAP AREA ===== */}
      <View style={[s.mapArea, { height: mapH }]}>
        {/* Grid lines for map feel */}
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`h${i}`} style={[s.gridH, { top: (mapH / 12) * i }]} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`v${i}`} style={[s.gridV, { left: (mapW / 12) * i }]} />
        ))}

        {/* "Water" areas */}
        <View style={[s.water, { bottom: 0, left: 0, right: 0, height: mapH * 0.15 }]} />
        <View style={[s.water, { top: 0, right: 0, width: mapW * 0.2, height: mapH * 0.5 }]} />

        {/* "Park" areas */}
        <View style={[s.park, { bottom: mapH * 0.15, left: 0, width: mapW * 0.25, height: mapH * 0.4 }]} />

        {/* Zone markers */}
        {filteredZones.map(zone => {
          const { x, y } = latLngToXY(zone.latitude, zone.longitude, mapW, mapH);
          const unlocked = isZoneUnlocked(zone.id);
          const catColor = CATEGORY_COLORS[zone.category];
          const isSelected = selectedZone?.id === zone.id;

          return (
            <TouchableOpacity
              key={zone.id}
              activeOpacity={0.8}
              onPress={() => handleMarkerPress(zone)}
              style={[s.markerWrap, { left: x - 24, top: y - 24 }]}
            >
              {/* Radius ring */}
              <View style={[s.radiusRing, {
                width: Math.max(zone.radiusMeters * 0.6, 40),
                height: Math.max(zone.radiusMeters * 0.6, 40),
                borderRadius: Math.max(zone.radiusMeters * 0.3, 20),
                borderColor: unlocked ? `${Brand.accent}40` : `${catColor}30`,
                backgroundColor: unlocked ? 'rgba(52,211,153,0.08)' : `${catColor}08`,
              }]} />

              {/* Marker dot */}
              <View style={[
                s.marker,
                isSelected && s.markerSel,
                unlocked && s.markerDone,
                { borderColor: isSelected ? Brand.primary : unlocked ? Brand.accent : `${catColor}80` },
              ]}>
                <Text style={s.markerE}>{zone.emoji}</Text>
                {unlocked && <View style={s.chk}><Text style={s.chkT}>✓</Text></View>}
              </View>

              {/* Label */}
              <View style={[s.labelWrap, isSelected && s.labelWrapSel]}>
                <Text style={[s.labelT, isSelected && s.labelTSel]} numberOfLines={1}>
                  {zone.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Campus label */}
        <View style={s.campusLabel}>
          <Text style={s.campusT}>University of British Columbia</Text>
          <Text style={s.campusSub}>Vancouver Campus</Text>
        </View>
      </View>

      {/* ===== FLOATING TOP BAR ===== */}
      <View style={[s.topBar, { top: insetTop + 8 }]}>
        <View style={s.stats}>
          <View style={s.si}><Text style={s.sv}>{progress.percentage}%</Text><Text style={s.slb}>Explored</Text></View>
          <View style={s.divider} />
          <View style={s.si}><Text style={[s.sv, { color: Brand.warm }]}>{totalPoints}</Text><Text style={s.slb}>Points</Text></View>
          <View style={s.divider} />
          <View style={s.si}><Text style={[s.sv, { color: Brand.accent }]}>{progress.unlocked}/{progress.total}</Text><Text style={s.slb}>Zones</Text></View>
        </View>
      </View>

      {/* ===== CATEGORY FILTERS ===== */}
      <View style={[s.filterC, { top: insetTop + 64 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterR}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.key} onPress={() => setActiveCategory(cat.key)} activeOpacity={0.7}>
              <View style={[s.pill, activeCategory === cat.key && s.pillA]}>
                <Text style={s.pillE}>{cat.emoji}</Text>
                <Text style={[s.pillL, activeCategory === cat.key && s.pillLA]}>{cat.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ===== BOTTOM ZONE CARD ===== */}
      {selectedZone && (
        <View style={[s.btmCard, { paddingBottom: Math.max(insetBottom, 12) + 12 }]}>
          <View style={s.handleBar} />
          <View style={s.cardH}>
            <View style={[s.cardIcon, { backgroundColor: `${CATEGORY_COLORS[selectedZone.category]}20` }]}>
              <Text style={{ fontSize: 26 }}>{selectedZone.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.cardNR}>
                <Text style={s.cardN}>{selectedZone.name}</Text>
                {isZoneUnlocked(selectedZone.id) && <View style={s.expB}><Text style={s.expBT}>✓ Explored</Text></View>}
              </View>
              <Text style={s.cardDesc} numberOfLines={2}>{selectedZone.description}</Text>
            </View>
          </View>
          <View style={s.cardMeta}>
            <View style={[s.catTag, { backgroundColor: `${CATEGORY_COLORS[selectedZone.category]}20` }]}>
              <Text style={[s.catTT, { color: CATEGORY_COLORS[selectedZone.category] }]}>{selectedZone.category}</Text>
            </View>
            <Text style={s.radT}>📍 {selectedZone.radiusMeters}m</Text>
            <View style={s.ptBadge}><Text style={s.ptText}>+{selectedZone.points} pts</Text></View>
          </View>
          <View style={s.acts}>
            {justUnlocked === selectedZone.id ? (
              <View style={s.unlkMsg}><Text style={{ fontSize: 24 }}>🎉</Text><Text style={s.unlkMT}>Zone Unlocked! +{selectedZone.points} pts</Text></View>
            ) : isZoneUnlocked(selectedZone.id) ? (
              <TouchableOpacity style={s.detBtn} onPress={() => router.push({ pathname: '/zone-detail', params: { zoneId: selectedZone.id } })} activeOpacity={0.8}>
                <Text style={s.detBtnT}>View Details</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.actRow}>
                <TouchableOpacity style={s.ulkBtn} onPress={handleUnlock} activeOpacity={0.8}>
                  <LinearGradient colors={[Brand.accent, Brand.accentDark]} style={s.ulkG}>
                    <Text style={s.ulkBT}>🔓 Unlock Zone</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={s.infoBtn} onPress={() => router.push({ pathname: '/zone-detail', params: { zoneId: selectedZone.id } })} activeOpacity={0.8}>
                  <Text style={{ fontSize: 20 }}>ℹ️</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1626' },
  mapArea: { position: 'relative', overflow: 'hidden' },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(79,142,247,0.04)' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(79,142,247,0.04)' },
  water: { position: 'absolute', backgroundColor: 'rgba(14,22,38,0.8)', borderWidth: 1, borderColor: 'rgba(79,142,247,0.08)' },
  park: { position: 'absolute', backgroundColor: 'rgba(2,62,88,0.3)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.08)', borderRadius: 20 },
  campusLabel: { position: 'absolute', top: '45%', alignSelf: 'center', left: '50%', transform: [{ translateX: -120 }], opacity: 0.12 },
  campusT: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 2, textTransform: 'uppercase' },
  campusSub: { fontSize: 12, color: '#fff', letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center', marginTop: 2 },

  markerWrap: { position: 'absolute', alignItems: 'center', zIndex: 5 },
  radiusRing: { position: 'absolute', borderWidth: 1 },
  marker: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(17,24,39,0.92)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, ...Shadows.card, zIndex: 6 },
  markerSel: { backgroundColor: 'rgba(79,142,247,0.25)', transform: [{ scale: 1.2 }] },
  markerDone: { backgroundColor: 'rgba(52,211,153,0.2)' },
  markerE: { fontSize: 24 },
  chk: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: Brand.accent, alignItems: 'center', justifyContent: 'center' },
  chkT: { fontSize: 9, color: '#fff', fontWeight: '800' },
  labelWrap: { marginTop: 4, backgroundColor: 'rgba(17,24,39,0.85)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.sm, maxWidth: 120 },
  labelWrapSel: { backgroundColor: `${Brand.primary}40` },
  labelT: { fontSize: 10, color: Typography.secondary, fontWeight: '600', textAlign: 'center' },
  labelTSel: { color: Brand.primaryLight },

  topBar: { position: 'absolute', left: 16, right: 16, zIndex: 10 },
  stats: { flexDirection: 'row', backgroundColor: 'rgba(17,24,39,0.92)', borderRadius: Radius.lg, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', ...Shadows.card },
  si: { flex: 1, alignItems: 'center' },
  sv: { fontSize: 18, fontWeight: '800', color: Brand.primary },
  slb: { fontSize: 10, color: Typography.tertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },
  divider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.08)' },

  filterC: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  filterR: { paddingHorizontal: 16, gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(17,24,39,0.88)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 5 },
  pillA: { backgroundColor: `${Brand.primary}35`, borderColor: `${Brand.primary}70` },
  pillE: { fontSize: 13 },
  pillL: { fontSize: 12, fontWeight: '600', color: Typography.secondary },
  pillLA: { color: Brand.primaryLight },

  btmCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(17,24,39,0.96)', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)', ...Shadows.card, zIndex: 20 },
  handleBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 12 },
  cardH: { flexDirection: 'row', gap: 14 },
  cardIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  cardNR: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardN: { fontSize: 17, fontWeight: '700', color: Typography.primary },
  expB: { backgroundColor: `${Brand.accent}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  expBT: { fontSize: 11, fontWeight: '700', color: Brand.accent },
  cardDesc: { fontSize: 13, color: Typography.secondary, marginTop: 4, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  catTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  catTT: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  radT: { fontSize: 12, color: Typography.tertiary },
  ptBadge: { backgroundColor: `${Brand.warm}20`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full, marginLeft: 'auto' },
  ptText: { fontSize: 12, fontWeight: '800', color: Brand.warm },
  acts: { marginTop: 14 },
  actRow: { flexDirection: 'row', gap: 10 },
  ulkBtn: { flex: 1, borderRadius: Radius.full, overflow: 'hidden' },
  ulkG: { paddingVertical: 13, alignItems: 'center', borderRadius: Radius.full },
  ulkBT: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: Surfaces.glass, borderWidth: 1, borderColor: Surfaces.glassBorder, alignItems: 'center', justifyContent: 'center' },
  detBtn: { backgroundColor: `${Brand.primary}20`, borderWidth: 1, borderColor: `${Brand.primary}50`, paddingVertical: 13, borderRadius: Radius.full, alignItems: 'center' },
  detBtnT: { color: Brand.primary, fontSize: 15, fontWeight: '700' },
  unlkMsg: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  unlkMT: { fontSize: 16, fontWeight: '800', color: Brand.accent },
});
