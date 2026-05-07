/**
 * Profile Tab — User profile & exploration stats (UBC-Navigate)
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { useExploreStore } from '@/stores/useExploreStore';
import { useNearbyStore } from '@/stores/useNearbyStore';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { CATEGORY_COLORS } from '@/constants/Zones';
import { Feather, Ionicons } from '@expo/vector-icons';

// Mock user profile
const MY_PROFILE = {
  displayName: 'Alex M.',
  avatar: 'person', // Ionicons
  program: 'Computer Science',
  year: 2,
  interests: ['Coding', 'Hiking', 'Photography', 'Coffee', 'Music'],
  languages: ['English', 'French'],
  nationality: 'Canada',
  bio: 'CS major exploring UBC one zone at a time. Love building apps and finding hidden gems on campus.',
  joinedDate: 'September 2025',
};

function StatRow({ icon, iconFamily, label, value, color }: { icon: string; iconFamily: 'Feather' | 'Ionicons'; label: string; value: string; color: string }) {
  const IconComponent = iconFamily === 'Feather' ? Feather : Ionicons;
  return (
    <View style={rs.row}>
      <IconComponent name={icon as any} size={18} color={Brand.secondary} style={rs.icon} />
      <Text style={rs.label}>{label}</Text>
      <Text style={[rs.value, { color }]}>{value}</Text>
    </View>
  );
}

const rs = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Surfaces.border },
  icon: { width: 32 },
  label: { flex: 1, fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.secondary },
  value: { fontFamily: Typography.fonts.h4, fontSize: 14 },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { totalPoints, getProgress, zones, isZoneUnlocked } = useExploreStore();
  const { introductions } = useNearbyStore();
  const progress = getProgress();

  // Category stats
  const categories = ['nature', 'academic', 'social', 'culture', 'athletics'] as const;
  const catStats = categories.map(cat => {
    const total = zones.filter(z => z.category === cat).length;
    const unlocked = zones.filter(z => z.category === cat && isZoneUnlocked(z.id)).length;
    return { cat, total, unlocked };
  });

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* Profile Header */}
        <View style={s.hdrWrap}>
          <View style={s.avatarWrap}>
            <Ionicons name={MY_PROFILE.avatar as any} size={48} color={Brand.secondary} />
          </View>
          <Text style={s.name}>{MY_PROFILE.displayName}</Text>
          <Text style={s.program}>{MY_PROFILE.program} · Year {MY_PROFILE.year}</Text>
          <Text style={s.bio}>{MY_PROFILE.bio}</Text>
          <View style={s.tags}>
            {MY_PROFILE.interests.map(i => (
              <View key={i} style={s.tag}><Text style={s.tagT}>{i}</Text></View>
            ))}
          </View>
        </View>

        {/* Exploration Stats */}
        <View style={s.section}>
          <Text style={s.secTitle}>Exploration Progress</Text>
          <Card style={s.progressCard}>
            <View style={s.progressRow}>
              <ProgressRing progress={progress.percentage} size={100} strokeWidth={6} />
              <View style={s.progressInfo}>
                <StatRow icon="map" iconFamily="Feather" label="Zones Explored" value={`${progress.unlocked}/${progress.total}`} color={Brand.primary} />
                <StatRow icon="award" iconFamily="Feather" label="Total Points" value={`${totalPoints}`} color={Brand.primary} />
                <StatRow icon="message-circle" iconFamily="Feather" label="Intros Sent" value={`${introductions.length}`} color={Brand.primary} />
              </View>
            </View>
          </Card>
        </View>

        {/* Category Breakdown */}
        <View style={s.section}>
          <Text style={s.secTitle}>By Category</Text>
          {catStats.map(({ cat, total, unlocked }) => {
            const color = CATEGORY_COLORS[cat];
            const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
            return (
              <Card key={cat} style={s.catCard}>
                <View style={s.catRow}>
                  <View style={[s.catDot, { backgroundColor: color }]} />
                  <Text style={s.catName}>{cat}</Text>
                  <Text style={[s.catPct, { color }]}>{pct}%</Text>
                  <Text style={s.catCount}>{unlocked}/{total}</Text>
                </View>
                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
              </Card>
            );
          })}
        </View>

        {/* Account Info */}
        <View style={s.section}>
          <Text style={s.secTitle}>Account</Text>
          <Card>
            <StatRow icon="globe" iconFamily="Feather" label="Languages" value={MY_PROFILE.languages.join(', ')} color={Brand.primary} />
            <StatRow icon="flag" iconFamily="Feather" label="Nationality" value={MY_PROFILE.nationality} color={Brand.primary} />
            <StatRow icon="calendar" iconFamily="Feather" label="Joined" value={MY_PROFILE.joinedDate} color={Brand.primary} />
          </Card>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Surfaces.default },
  scroll: { paddingHorizontal: Spacing.lg },
  hdrWrap: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Surfaces.background, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Surfaces.border },
  avatarWrap: { width: 88, height: 88, borderRadius: Radius.full, backgroundColor: Surfaces.default, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Surfaces.border, marginBottom: Spacing.md },
  name: { fontFamily: Typography.fonts.h2, fontSize: 22, color: Brand.primary },
  program: { fontFamily: Typography.fonts.body, fontSize: 15, color: Brand.secondary, marginTop: 4 },
  bio: { fontFamily: Typography.fonts.bodySm, fontSize: 14, color: Brand.secondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22, paddingHorizontal: Spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md, justifyContent: 'center' },
  tag: { backgroundColor: Surfaces.default, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.sm, borderWidth: 1, borderColor: Surfaces.border },
  tagT: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginTop: Spacing.xl },
  secTitle: { fontFamily: Typography.fonts.h3, fontSize: 18, color: Brand.primary, marginBottom: Spacing.md },
  progressCard: { padding: Spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  progressInfo: { flex: 1 },
  catCard: { marginBottom: Spacing.sm, paddingVertical: Spacing.sm },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  catDot: { width: 10, height: 10, borderRadius: Radius.full },
  catName: { flex: 1, fontFamily: Typography.fonts.h4, fontSize: 14, color: Brand.primary, textTransform: 'capitalize' },
  catPct: { fontFamily: Typography.fonts.h4, fontSize: 14 },
  catCount: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.secondary, width: 32, textAlign: 'right' },
  barBg: { height: 4, backgroundColor: Surfaces.default, borderRadius: Radius.full, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: Radius.full },
});
