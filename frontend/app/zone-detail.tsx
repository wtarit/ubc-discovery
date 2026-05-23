import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { router as expoRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { EXPLORE_ZONES, CATEGORY_COLORS } from '@/constants/Zones';
import { useExploreStore } from '@/stores/useExploreStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AuthPrompt } from '@/components/ui/AuthPrompt';
import { Feather } from '@expo/vector-icons';

export default function ZoneDetailScreen() {
  const { zoneId } = useLocalSearchParams<{ zoneId: string }>();
  const insets = useSafeAreaInsets();
  const { unlockZone, isZoneUnlocked, isUnlocking } = useExploreStore();
  const { accessToken } = useAuthStore();
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const zone = EXPLORE_ZONES.find(z => z.id === zoneId);
  if (!zone) return <View style={s.container}><Text style={s.err}>Zone not found</Text></View>;

  const unlocked = isZoneUnlocked(zone.id);
  const catColor = CATEGORY_COLORS[zone.category];

  const handleUnlock = async () => {
    setUnlockError(null);
    const result = await unlockZone(zone.id);
    if (result.success) {
      setJustUnlocked(true);
    } else if (result.error === 'too_far') {
      setUnlockError(`You're ${result.distance}m away. Get within ${result.required}m to unlock.`);
    } else if (result.error === 'location_permission_denied') {
      setUnlockError('Location permission is needed to verify you are at this zone.');
    } else if (result.error === 'network') {
      setUnlockError('Something went wrong. Please try again.');
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={s.closeBtn} onPress={() => expoRouter.back()}>
        <Feather name="x" size={20} color={Brand.primary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.hero, { backgroundColor: Surfaces.background }]}>
          <View style={[s.iconWrap, { backgroundColor: `${catColor}15`, borderColor: `${catColor}30` }]}>
            <Feather name={zone.icon as any} size={48} color={catColor} />
          </View>
          <Text style={s.name}>{zone.name}</Text>
          <View style={[s.catTag, { backgroundColor: `${catColor}10`, borderColor: `${catColor}30` }]}>
            <Text style={[s.catTxt, { color: catColor }]}>{zone.category}</Text>
          </View>
        </View>

        <Card style={s.card}>
          <Text style={s.secTitle}>About this place</Text>
          <Text style={s.desc}>{zone.description}</Text>
        </Card>

        <Card style={[s.card, { backgroundColor: Surfaces.default }]}>
          <Text style={s.factLabel}>Fun Fact</Text>
          <Text style={s.fact}>{zone.funFact}</Text>
        </Card>

        <Card style={s.card}>
          <View style={s.detailRow}>
            <Feather name="map-pin" size={16} color={Brand.secondary} style={s.detailIcon} />
            <Text style={s.detailLabel}>Radius</Text>
            <Text style={s.detailVal}>{zone.radiusMeters}m</Text>
          </View>
          <View style={s.detailRow}>
            <Feather name="award" size={16} color={Brand.secondary} style={s.detailIcon} />
            <Text style={s.detailLabel}>Points</Text>
            <Text style={[s.detailVal, { color: Brand.primary }]}>+{zone.points}</Text>
          </View>
          <View style={[s.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Feather name="crosshair" size={16} color={Brand.secondary} style={s.detailIcon} />
            <Text style={s.detailLabel}>Coordinates</Text>
            <Text style={s.detailVal}>{zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}</Text>
          </View>
        </Card>

        <View style={s.actionArea}>
          {justUnlocked ? (
            <View style={s.unlockedMsg}>
              <Feather name="check-circle" size={48} color={Brand.success} />
              <Text style={s.unlockedTitle}>Zone Unlocked</Text>
              <Text style={s.unlockedSub}>+{zone.points} points earned</Text>
            </View>
          ) : unlocked ? (
            <Card style={s.exploredCard}>
              <Feather name="check" size={20} color={Brand.success} style={{ marginBottom: 8 }} />
              <Text style={s.exploredTxt}>You've explored this zone</Text>
            </Card>
          ) : !accessToken ? (
            <AuthPrompt
              variant="inline"
              message="Sign in to unlock zones and track your campus exploration"
            />
          ) : (
            <View>
              <Button
                title="Unlock This Zone"
                variant="primary"
                size="lg"
                onPress={handleUnlock}
                loading={isUnlocking}
                disabled={isUnlocking}
              />
              {unlockError ? (
                <Text style={s.errorHint}>{unlockError}</Text>
              ) : (
                <Text style={s.hint}>
                  You need to be within {zone.radiusMeters}m of this zone to unlock it.
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Surfaces.default },
  scroll: { paddingHorizontal: Spacing.lg },
  err: { fontFamily: Typography.fonts.body, color: Brand.primary, fontSize: 16, textAlign: 'center', marginTop: 100 },
  closeBtn: { position: 'absolute', top: 56, right: 20, zIndex: 10, width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Surfaces.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Surfaces.border },
  hero: { alignItems: 'center', paddingVertical: Spacing.xxl, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Surfaces.border },
  iconWrap: { width: 96, height: 96, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 1 },
  name: { fontFamily: Typography.fonts.h1, fontSize: 24, color: Brand.primary, textAlign: 'center' },
  catTag: { marginTop: Spacing.sm, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.sm, borderWidth: 1 },
  catTxt: { fontFamily: Typography.fonts.caption, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { marginTop: Spacing.md },
  secTitle: { fontFamily: Typography.fonts.h3, fontSize: 16, color: Brand.primary, marginBottom: 8 },
  desc: { fontFamily: Typography.fonts.body, fontSize: 15, color: Brand.secondary, lineHeight: 24 },
  factLabel: { fontFamily: Typography.fonts.h4, fontSize: 14, color: Brand.primary, marginBottom: 6 },
  fact: { fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.secondary, lineHeight: 22 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Surfaces.border },
  detailIcon: { width: 28 },
  detailLabel: { flex: 1, fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.secondary },
  detailVal: { fontFamily: Typography.fonts.h4, fontSize: 14, color: Brand.primary },
  actionArea: { marginTop: Spacing.xl, alignItems: 'center' },
  unlockedMsg: { alignItems: 'center' },
  unlockedTitle: { fontFamily: Typography.fonts.h2, fontSize: 24, color: Brand.success, marginTop: Spacing.sm },
  unlockedSub: { fontFamily: Typography.fonts.body, fontSize: 15, color: Brand.secondary, marginTop: 4 },
  exploredCard: { alignItems: 'center', paddingVertical: Spacing.lg, width: '100%', backgroundColor: '#F0FDF4', borderColor: Brand.success },
  exploredTxt: { fontFamily: Typography.fonts.h3, fontSize: 16, color: Brand.success },
  hint: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.secondary, textAlign: 'center', marginTop: Spacing.md, paddingHorizontal: Spacing.lg },
  errorHint: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.error, textAlign: 'center', marginTop: Spacing.md, paddingHorizontal: Spacing.lg },
});
