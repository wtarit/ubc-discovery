/**
 * Zone Detail Modal — Shows zone info and unlock action
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { EXPLORE_ZONES, CATEGORY_COLORS } from '@/constants/Zones';
import { useExploreStore } from '@/stores/useExploreStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { PillButton } from '@/components/ui/PillButton';

export default function ZoneDetailScreen() {
  const { zoneId } = useLocalSearchParams<{ zoneId: string }>();
  const insets = useSafeAreaInsets();
  const { unlockZone, isZoneUnlocked } = useExploreStore();
  const [justUnlocked, setJustUnlocked] = useState(false);

  const zone = EXPLORE_ZONES.find(z => z.id === zoneId);
  if (!zone) return <View style={s.container}><Text style={s.err}>Zone not found</Text></View>;

  const unlocked = isZoneUnlocked(zone.id);
  const catColor = CATEGORY_COLORS[zone.category];

  const handleUnlock = () => {
    unlockZone(zone.id);
    setJustUnlocked(true);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Close button */}
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
        <Text style={s.closeTxt}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[`${catColor}20`, 'transparent']} style={s.hero}>
          <Text style={s.emoji}>{zone.emoji}</Text>
          <Text style={s.name}>{zone.name}</Text>
          <View style={[s.catTag, { backgroundColor: `${catColor}20` }]}>
            <Text style={[s.catTxt, { color: catColor }]}>{zone.category}</Text>
          </View>
        </LinearGradient>

        {/* Description */}
        <GlassCard variant="elevated" style={s.card}>
          <Text style={s.secTitle}>About this place</Text>
          <Text style={s.desc}>{zone.description}</Text>
        </GlassCard>

        {/* Fun Fact */}
        <GlassCard variant="highlight" style={s.card}>
          <Text style={s.factLabel}>💡 Fun Fact</Text>
          <Text style={s.fact}>{zone.funFact}</Text>
        </GlassCard>

        {/* Details */}
        <GlassCard variant="elevated" style={s.card}>
          <View style={s.detailRow}>
            <Text style={s.detailIcon}>📍</Text>
            <Text style={s.detailLabel}>Radius</Text>
            <Text style={s.detailVal}>{zone.radiusMeters}m</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailIcon}>⭐</Text>
            <Text style={s.detailLabel}>Points</Text>
            <Text style={[s.detailVal, { color: Brand.warm }]}>+{zone.points}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailIcon}>📌</Text>
            <Text style={s.detailLabel}>Coordinates</Text>
            <Text style={s.detailVal}>{zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}</Text>
          </View>
        </GlassCard>

        {/* Unlock / Status */}
        <View style={s.actionArea}>
          {justUnlocked ? (
            <View style={s.unlockedMsg}>
              <Text style={s.unlockedEmoji}>🎉</Text>
              <Text style={s.unlockedTitle}>Zone Unlocked!</Text>
              <Text style={s.unlockedSub}>+{zone.points} points earned</Text>
            </View>
          ) : unlocked ? (
            <GlassCard style={s.exploredCard}>
              <Text style={s.exploredTxt}>✅ You've explored this zone!</Text>
            </GlassCard>
          ) : (
            <View>
              <PillButton
                title="🔓  Unlock This Zone"
                variant="accent"
                size="lg"
                onPress={handleUnlock}
              />
              <Text style={s.hint}>
                In the full app, you'll need to physically visit this location to unlock it!
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Surfaces.background },
  scroll: { paddingHorizontal: Spacing.lg },
  err: { color: Typography.primary, fontSize: 16, textAlign: 'center', marginTop: 100 },
  closeBtn: { position: 'absolute', top: 56, right: 20, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: Surfaces.glass, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Surfaces.glassBorder },
  closeTxt: { color: Typography.primary, fontSize: 18 },
  hero: { alignItems: 'center', paddingVertical: Spacing.xxl, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  emoji: { fontSize: 72, marginBottom: Spacing.md },
  name: { fontSize: 26, fontWeight: '800', color: Typography.primary, textAlign: 'center' },
  catTag: { marginTop: Spacing.sm, paddingHorizontal: 14, paddingVertical: 4, borderRadius: Radius.full },
  catTxt: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  card: { marginTop: Spacing.md },
  secTitle: { fontSize: 16, fontWeight: '700', color: Typography.primary, marginBottom: 8 },
  desc: { fontSize: 15, color: Typography.secondary, lineHeight: 22 },
  factLabel: { fontSize: 14, fontWeight: '700', color: Brand.warm, marginBottom: 6 },
  fact: { fontSize: 14, color: Typography.secondary, lineHeight: 20, fontStyle: 'italic' },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  detailIcon: { fontSize: 16, width: 28 },
  detailLabel: { flex: 1, fontSize: 14, color: Typography.secondary },
  detailVal: { fontSize: 14, fontWeight: '700', color: Typography.primary },
  actionArea: { marginTop: Spacing.xl, alignItems: 'center' },
  unlockedMsg: { alignItems: 'center' },
  unlockedEmoji: { fontSize: 56 },
  unlockedTitle: { fontSize: 24, fontWeight: '800', color: Brand.accent, marginTop: Spacing.sm },
  unlockedSub: { fontSize: 16, color: Brand.warm, marginTop: 4, fontWeight: '600' },
  exploredCard: { alignItems: 'center', paddingVertical: Spacing.lg },
  exploredTxt: { fontSize: 16, fontWeight: '700', color: Brand.accent },
  hint: { fontSize: 12, color: Typography.tertiary, textAlign: 'center', marginTop: Spacing.md, paddingHorizontal: Spacing.lg },
});
