/**
 * User Detail Modal — Nearby user profile + AI intro
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { useNearbyStore } from '@/stores/useNearbyStore';
import { MOCK_NEARBY_USERS } from '@/constants/MockUsers';
import { GlassCard } from '@/components/ui/GlassCard';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { PillButton } from '@/components/ui/PillButton';

export default function UserDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const insets = useSafeAreaInsets();
  const { sendIntroduction, getIntroForUser, generateAIIntro } = useNearbyStore();
  const [previewMsg, setPreviewMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const user = MOCK_NEARBY_USERS.find(u => u.id === userId);
  if (!user) return <View style={s.container}><Text style={s.err}>User not found</Text></View>;

  const existingIntro = getIntroForUser(user.id);

  const handleGenerateIntro = () => {
    const msg = generateAIIntro(user);
    setPreviewMsg(msg);
  };

  const handleSend = () => {
    sendIntroduction(user.id);
    setSent(true);
    setPreviewMsg(null);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
        <Text style={s.closeTxt}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[`${Brand.ai}15`, 'transparent']} style={s.hero}>
          <View style={s.avatarWrap}>
            <Text style={s.avatar}>{user.avatar}</Text>
          </View>
          <Text style={s.name}>{user.displayName}</Text>
          <Text style={s.prog}>{user.program} · Year {user.year}</Text>
          <MatchBadge score={user.matchScore} size="lg" />
        </LinearGradient>

        {/* Bio */}
        <GlassCard variant="elevated" style={s.card}>
          <Text style={s.secTitle}>About</Text>
          <Text style={s.bio}>{user.bio}</Text>
        </GlassCard>

        {/* Details */}
        <GlassCard variant="elevated" style={s.card}>
          <View style={s.detRow}>
            <Text style={s.detIcon}>📍</Text>
            <Text style={s.detLabel}>Distance</Text>
            <Text style={[s.detVal, { color: Brand.primary }]}>{user.distanceMeters}m away</Text>
          </View>
          <View style={s.detRow}>
            <Text style={s.detIcon}>🌐</Text>
            <Text style={s.detLabel}>Languages</Text>
            <Text style={s.detVal}>{user.languages.join(', ')}</Text>
          </View>
          <View style={s.detRow}>
            <Text style={s.detIcon}>🏳️</Text>
            <Text style={s.detLabel}>From</Text>
            <Text style={s.detVal}>{user.nationality}</Text>
          </View>
          <View style={s.detRow}>
            <Text style={s.detIcon}>🗺️</Text>
            <Text style={s.detLabel}>Zones Explored</Text>
            <Text style={[s.detVal, { color: Brand.accent }]}>{user.zonesExplored}</Text>
          </View>
        </GlassCard>

        {/* Interests */}
        <GlassCard variant="elevated" style={s.card}>
          <Text style={s.secTitle}>Interests</Text>
          <View style={s.tags}>
            {user.interests.map(i => (
              <View key={i} style={s.tag}><Text style={s.tagT}>{i}</Text></View>
            ))}
          </View>
        </GlassCard>

        {/* AI Introduction */}
        <View style={s.section}>
          <Text style={s.secTitle}>✨ AI Introduction</Text>
          {existingIntro || sent ? (
            <GlassCard variant="highlight" style={{ borderColor: `${Brand.accent}40` }}>
              <Text style={s.sentLabel}>✅ Introduction sent!</Text>
              <Text style={s.sentMsg}>{existingIntro?.message || 'Message sent successfully'}</Text>
            </GlassCard>
          ) : previewMsg ? (
            <View>
              <GlassCard variant="highlight" style={{ borderColor: `${Brand.ai}40` }}>
                <Text style={s.previewLabel}>Preview</Text>
                <Text style={s.previewMsg}>{previewMsg}</Text>
              </GlassCard>
              <View style={s.btnRow}>
                <PillButton title="🔄  Regenerate" variant="outline" size="sm" onPress={handleGenerateIntro} />
                <PillButton title="📨  Send" variant="ai" size="sm" onPress={handleSend} />
              </View>
            </View>
          ) : (
            <View>
              <Text style={s.aiDesc}>
                Let our AI craft a personalized introduction based on your shared interests and profiles.
              </Text>
              <PillButton
                title="🤖  Generate AI Introduction"
                variant="ai"
                size="lg"
                onPress={handleGenerateIntro}
              />
            </View>
          )}
        </View>

        {/* Action buttons */}
        {!existingIntro && !sent && (
          <View style={s.actions}>
            <PillButton title="👋  Wave Hello" variant="warm" size="md" onPress={() => {}} />
          </View>
        )}

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
  hero: { alignItems: 'center', paddingVertical: Spacing.xl, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: `${Brand.ai}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: `${Brand.ai}60` },
  avatar: { fontSize: 52 },
  name: { fontSize: 26, fontWeight: '800', color: Typography.primary },
  prog: { fontSize: 15, color: Typography.secondary },
  card: { marginTop: Spacing.md },
  secTitle: { fontSize: 16, fontWeight: '700', color: Typography.primary, marginBottom: 8 },
  bio: { fontSize: 14, color: Typography.secondary, lineHeight: 20 },
  detRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  detIcon: { fontSize: 16, width: 28 },
  detLabel: { flex: 1, fontSize: 14, color: Typography.secondary },
  detVal: { fontSize: 14, fontWeight: '700', color: Typography.primary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: `${Brand.ai}15`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  tagT: { fontSize: 12, color: Brand.aiLight, fontWeight: '600' },
  section: { marginTop: Spacing.xl },
  aiDesc: { fontSize: 14, color: Typography.secondary, lineHeight: 20, marginBottom: Spacing.md },
  previewLabel: { fontSize: 12, fontWeight: '700', color: Brand.ai, marginBottom: 6 },
  previewMsg: { fontSize: 14, color: Typography.primary, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md, justifyContent: 'center' },
  sentLabel: { fontSize: 14, fontWeight: '700', color: Brand.accent, marginBottom: 6 },
  sentMsg: { fontSize: 13, color: Typography.secondary, lineHeight: 18 },
  actions: { marginTop: Spacing.xl, alignItems: 'center' },
});
