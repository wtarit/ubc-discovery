/**
 * Profile Tab — User profile & exploration stats
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius, Gradients } from '@/constants/Colors';
import { useExploreStore } from '@/stores/useExploreStore';
import { useNearbyStore } from '@/stores/useNearbyStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { CATEGORY_COLORS } from '@/constants/Zones';

// Mock user profile
const MY_PROFILE = {
  displayName: 'Alex M.',
  avatar: '🧑🏽‍💻',
  program: 'Computer Science',
  year: 2,
  interests: ['Coding', 'Hiking', 'Photography', 'Coffee', 'Music'],
  languages: ['English', 'French'],
  nationality: 'Canada',
  bio: 'CS major exploring UBC one zone at a time. Love building apps and finding hidden gems on campus.',
  joinedDate: 'September 2025',
};

function StatRow({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={rs.row}>
      <Text style={rs.icon}>{icon}</Text>
      <Text style={rs.label}>{label}</Text>
      <Text style={[rs.value, { color }]}>{value}</Text>
    </View>
  );
}

const rs = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  icon: { fontSize: 18, width: 32 },
  label: { flex: 1, fontSize: 14, color: Typography.secondary },
  value: { fontSize: 14, fontWeight: '700' },
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
        <LinearGradient colors={['rgba(79,142,247,0.15)', 'transparent']} style={s.hdrGrad}>
          <View style={s.avatarWrap}>
            <Text style={s.avatar}>{MY_PROFILE.avatar}</Text>
          </View>
          <Text style={s.name}>{MY_PROFILE.displayName}</Text>
          <Text style={s.program}>{MY_PROFILE.program} · Year {MY_PROFILE.year}</Text>
          <Text style={s.bio}>{MY_PROFILE.bio}</Text>
          <View style={s.tags}>
            {MY_PROFILE.interests.map(i => (
              <View key={i} style={s.tag}><Text style={s.tagT}>{i}</Text></View>
            ))}
          </View>
        </LinearGradient>

        {/* Exploration Stats */}
        <View style={s.section}>
          <Text style={s.secTitle}>Exploration Progress</Text>
          <GlassCard variant="elevated" style={s.progressCard}>
            <View style={s.progressRow}>
              <ProgressRing progress={progress.percentage} size={100} strokeWidth={6} />
              <View style={s.progressInfo}>
                <StatRow icon="🗺️" label="Zones Explored" value={`${progress.unlocked}/${progress.total}`} color={Brand.accent} />
                <StatRow icon="⭐" label="Total Points" value={`${totalPoints}`} color={Brand.warm} />
                <StatRow icon="💬" label="Intros Sent" value={`${introductions.length}`} color={Brand.ai} />
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Category Breakdown */}
        <View style={s.section}>
          <Text style={s.secTitle}>By Category</Text>
          {catStats.map(({ cat, total, unlocked }) => {
            const color = CATEGORY_COLORS[cat];
            const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
            return (
              <GlassCard key={cat} style={s.catCard}>
                <View style={s.catRow}>
                  <View style={[s.catDot, { backgroundColor: color }]} />
                  <Text style={s.catName}>{cat}</Text>
                  <Text style={[s.catPct, { color }]}>{pct}%</Text>
                  <Text style={s.catCount}>{unlocked}/{total}</Text>
                </View>
                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
              </GlassCard>
            );
          })}
        </View>

        {/* Account Info */}
        <View style={s.section}>
          <Text style={s.secTitle}>Account</Text>
          <GlassCard variant="elevated">
            <StatRow icon="🌐" label="Languages" value={MY_PROFILE.languages.join(', ')} color={Brand.primary} />
            <StatRow icon="🏳️" label="Nationality" value={MY_PROFILE.nationality} color={Brand.primary} />
            <StatRow icon="📅" label="Joined" value={MY_PROFILE.joinedDate} color={Typography.secondary} />
          </GlassCard>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Surfaces.background },
  scroll: { paddingHorizontal: Spacing.lg },
  hdrGrad: { alignItems: 'center', paddingVertical: Spacing.xl, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  avatarWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: `${Brand.primary}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: `${Brand.primary}60`, marginBottom: Spacing.md },
  avatar: { fontSize: 48 },
  name: { fontSize: 24, fontWeight: '800', color: Typography.primary },
  program: { fontSize: 15, color: Typography.secondary, marginTop: 4 },
  bio: { fontSize: 14, color: Typography.secondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20, paddingHorizontal: Spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md, justifyContent: 'center' },
  tag: { backgroundColor: `${Brand.primary}15`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  tagT: { fontSize: 12, color: Brand.primaryLight, fontWeight: '600' },
  section: { marginTop: Spacing.xl },
  secTitle: { fontSize: 18, fontWeight: '700', color: Typography.primary, marginBottom: Spacing.md },
  progressCard: { padding: Spacing.lg },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  progressInfo: { flex: 1 },
  catCard: { marginBottom: Spacing.sm, paddingVertical: Spacing.sm },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { flex: 1, fontSize: 14, color: Typography.primary, fontWeight: '600', textTransform: 'capitalize' },
  catPct: { fontSize: 14, fontWeight: '800' },
  catCount: { fontSize: 12, color: Typography.tertiary, width: 32, textAlign: 'right' },
  barBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2 },
  barFill: { height: 4, borderRadius: 2 },
});
