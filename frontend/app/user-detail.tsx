/**
 * User Detail Modal — Nearby user profile + AI intro (UBC-Navigate)
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { useNearbyStore } from '@/stores/useNearbyStore';
import { MOCK_NEARBY_USERS } from '@/constants/MockUsers';
import { Card } from '@/components/ui/Card';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { Button } from '@/components/ui/Button';
import { Ionicons, Feather } from '@expo/vector-icons';

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
        <Feather name="x" size={20} color={Brand.primary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.avatarWrap}>
            <Ionicons name={user.avatar as any} size={48} color={Brand.secondary} />
          </View>
          <Text style={s.name}>{user.displayName}</Text>
          <Text style={s.prog}>{user.program} · Year {user.year}</Text>
          <View style={{ marginTop: Spacing.sm }}>
            <MatchBadge score={user.matchScore} size="lg" />
          </View>
        </View>

        <Card style={s.card}>
          <Text style={s.secTitle}>About</Text>
          <Text style={s.bio}>{user.bio}</Text>
        </Card>

        <Card style={s.card}>
          <View style={s.detRow}>
            <Feather name="map-pin" size={16} color={Brand.secondary} style={s.detIcon} />
            <Text style={s.detLabel}>Distance</Text>
            <Text style={[s.detVal, { color: Brand.primary }]}>{user.distanceMeters}m away</Text>
          </View>
          <View style={s.detRow}>
            <Feather name="globe" size={16} color={Brand.secondary} style={s.detIcon} />
            <Text style={s.detLabel}>Languages</Text>
            <Text style={s.detVal}>{user.languages.join(', ')}</Text>
          </View>
          <View style={s.detRow}>
            <Feather name="flag" size={16} color={Brand.secondary} style={s.detIcon} />
            <Text style={s.detLabel}>From</Text>
            <Text style={s.detVal}>{user.nationality}</Text>
          </View>
          <View style={[s.detRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Feather name="map" size={16} color={Brand.secondary} style={s.detIcon} />
            <Text style={s.detLabel}>Zones Explored</Text>
            <Text style={[s.detVal, { color: Brand.primary }]}>{user.zonesExplored}</Text>
          </View>
        </Card>

        <Card style={s.card}>
          <Text style={s.secTitle}>Interests</Text>
          <View style={s.tags}>
            {user.interests.map(i => (
              <View key={i} style={s.tag}><Text style={s.tagT}>{i}</Text></View>
            ))}
          </View>
        </Card>

        <View style={s.section}>
          <Text style={s.secTitle}>AI Introduction</Text>
          {existingIntro || sent ? (
            <Card style={{ backgroundColor: '#F0FDF4', borderColor: Brand.success }}>
              <Text style={s.sentLabel}>Introduction sent</Text>
              <Text style={s.sentMsg}>{existingIntro?.message || 'Message sent successfully'}</Text>
            </Card>
          ) : previewMsg ? (
            <View>
              <Card style={{ backgroundColor: Surfaces.default }}>
                <Text style={s.previewLabel}>Preview</Text>
                <Text style={s.previewMsg}>{previewMsg}</Text>
              </Card>
              <View style={s.btnRow}>
                <Button title="Regenerate" variant="secondary" size="md" onPress={handleGenerateIntro} style={{ flex: 1 }} />
                <Button title="Send" variant="primary" size="md" onPress={handleSend} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <View>
              <Text style={s.aiDesc}>
                Let our AI craft a personalized introduction based on your shared interests and profiles.
              </Text>
              <Button
                title="Generate AI Introduction"
                variant="primary"
                size="lg"
                onPress={handleGenerateIntro}
              />
            </View>
          )}
        </View>

        {!existingIntro && !sent && (
          <View style={s.actions}>
            <Button title="Say Hello" variant="secondary" size="md" onPress={() => {}} />
          </View>
        )}

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
  hero: { alignItems: 'center', paddingVertical: Spacing.xl, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg, backgroundColor: Surfaces.background, borderBottomWidth: 1, borderBottomColor: Surfaces.border, gap: Spacing.xs },
  avatarWrap: { width: 88, height: 88, borderRadius: Radius.full, backgroundColor: Surfaces.default, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Surfaces.border, marginBottom: Spacing.sm },
  name: { fontFamily: Typography.fonts.h1, fontSize: 24, color: Brand.primary },
  prog: { fontFamily: Typography.fonts.body, fontSize: 15, color: Brand.secondary },
  card: { marginTop: Spacing.md },
  secTitle: { fontFamily: Typography.fonts.h3, fontSize: 16, color: Brand.primary, marginBottom: 8 },
  bio: { fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.secondary, lineHeight: 22 },
  detRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Surfaces.border },
  detIcon: { width: 28 },
  detLabel: { flex: 1, fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.secondary },
  detVal: { fontFamily: Typography.fonts.h4, fontSize: 14, color: Brand.primary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: Surfaces.default, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.sm, borderWidth: 1, borderColor: Surfaces.border },
  tagT: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginTop: Spacing.xl },
  aiDesc: { fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.secondary, lineHeight: 22, marginBottom: Spacing.md },
  previewLabel: { fontFamily: Typography.fonts.h4, fontSize: 12, color: Brand.primary, marginBottom: 6 },
  previewMsg: { fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.primary, lineHeight: 22 },
  btnRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  sentLabel: { fontFamily: Typography.fonts.h4, fontSize: 14, color: Brand.success, marginBottom: 6 },
  sentMsg: { fontFamily: Typography.fonts.body, fontSize: 13, color: Brand.secondary, lineHeight: 20 },
  actions: { marginTop: Spacing.xl, alignItems: 'center' },
});
