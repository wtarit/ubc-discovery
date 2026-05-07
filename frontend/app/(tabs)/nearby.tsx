/**
 * Nearby Tab — Proximity-based matching & discovery (UBC-Navigate)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { useNearbyStore } from '@/stores/useNearbyStore';
import { Card } from '@/components/ui/Card';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { NearbyUser } from '@/constants/MockUsers';

function ScanningPulse() {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mkPulse = (a: Animated.Value, d: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(d),
        Animated.timing(a, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]));
    const p1 = mkPulse(pulse1, 0); const p2 = mkPulse(pulse2, 1000);
    p1.start(); p2.start();
    return () => { p1.stop(); p2.stop(); };
  }, [pulse1, pulse2]);

  return (
    <View style={sc.container}>
      {[pulse1, pulse2].map((p, i) => (
        <Animated.View key={i} style={[sc.ring, {
          opacity: p.interpolate({ inputRange: [0,1], outputRange: [0.3,0] }),
          transform: [{ scale: p.interpolate({ inputRange: [0,1], outputRange: [0.8,3] }) }],
        }]} />
      ))}
      <View style={sc.center}>
        <Feather name="radio" size={24} color={Brand.accent} />
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', height: 120, marginVertical: Spacing.md },
  ring: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: Brand.accent },
  center: { width: 56, height: 56, borderRadius: 28, backgroundColor: Surfaces.background, borderWidth: 1, borderColor: Surfaces.border, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
});

function fmtDist(m: number) { return m<1000 ? `${m}m` : `${(m/1000).toFixed(1)}km`; }
function fmtTime(iso: string) {
  const mins = Math.floor((Date.now()-new Date(iso).getTime())/60000);
  if (mins<1) return 'Now'; if (mins<60) return `${mins}m`;
  return `${Math.floor(mins/60)}h`;
}

function UserCard({ user, onPress }: { user: NearbyUser; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={{ marginBottom: Spacing.md }}>
        <View style={cc.row}>
          <View>
            <View style={cc.avatarWrap}>
              <Ionicons name={user.avatar as any} size={32} color={Brand.secondary} />
            </View>
            <View style={cc.dot} />
          </View>
          <View style={cc.info}>
            <View style={cc.nameRow}>
              <Text style={cc.name}>{user.displayName}</Text>
              <Text style={cc.dist}>{fmtDist(user.distanceMeters)}</Text>
            </View>
            <Text style={cc.prog}>{user.program} · Year {user.year}</Text>
            <View style={cc.tags}>
              {user.interests.slice(0,3).map(i => (
                <View key={i} style={cc.tag}><Text style={cc.tagT}>{i}</Text></View>
              ))}
            </View>
          </View>
        </View>
        <View style={cc.foot}>
          <Text style={cc.meta}>{fmtTime(user.lastSeen)}</Text>
          <MatchBadge score={user.matchScore} size="sm" />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const cc = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarWrap: { width: 56, height: 56, borderRadius: Radius.full, backgroundColor: Surfaces.default, borderWidth: 1, borderColor: Surfaces.border, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: Brand.success, borderWidth: 2, borderColor: Surfaces.background },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: Typography.fonts.h3, fontSize: 16, color: Brand.primary },
  dist: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.secondary },
  prog: { fontFamily: Typography.fonts.bodySm, fontSize: 13, color: Brand.secondary, marginTop: 2 },
  tags: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: Surfaces.default, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, borderWidth: 1, borderColor: Surfaces.border },
  tagT: { fontFamily: Typography.fonts.caption, fontSize: 11, color: Brand.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Surfaces.border },
  meta: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.secondary },
});

export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const { nearbyUsers } = useNearbyStore();
  const [sortBy, setSortBy] = useState<'match'|'distance'>('match');
  const sorted = [...nearbyUsers].sort((a,b) => sortBy==='match' ? b.matchScore-a.matchScore : a.distanceMeters-b.distanceMeters);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.hdr}>
        <Text style={s.title}>People Nearby</Text>
        <Text style={s.sub}>{nearbyUsers.length} people around you</Text>
        <ScanningPulse />
        <View style={s.sortRow}>
          {(['match','distance'] as const).map(k => (
            <TouchableOpacity key={k} onPress={() => setSortBy(k)}
              style={[s.sortPill, sortBy===k && s.sortPillA]}>
              <Text style={[s.sortT, sortBy===k && s.sortTA]}>
                {k==='match' ? 'Best Match' : 'Closest'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {sorted.map(u => (
          <UserCard key={u.id} user={u} onPress={() => router.push({ pathname:'/user-detail', params:{ userId:u.id } })} />
        ))}
        <View style={{ height:32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Surfaces.default },
  hdr: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, backgroundColor: Surfaces.background, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Surfaces.border, marginBottom: Spacing.md },
  title: { fontFamily: Typography.fonts.h1, fontSize: 24, color: Brand.primary },
  sub: { fontFamily: Typography.fonts.body, fontSize: 15, color: Brand.secondary, marginTop: 4 },
  sortRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  sortPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Surfaces.background, borderWidth: 1, borderColor: Surfaces.border },
  sortPillA: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  sortT: { fontFamily: Typography.fonts.h4, fontSize: 13, color: Brand.primary },
  sortTA: { color: Surfaces.background },
  list: { paddingHorizontal: Spacing.lg },
});
