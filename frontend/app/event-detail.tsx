/**
 * Event Detail Modal — Shows event info (UBC-Navigate)
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Linking, Share,
} from 'react-native';
import { router as expoRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { useExploreStore } from '@/stores/useExploreStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, Calendar, MapPin, Link2, Flag } from '@/components/icons';
import { api, type EventResponse } from '@/services/api';

const PROJECT_INSTAGRAM_URL = process.env.EXPO_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/';
const SOURCE_LABELS: Record<EventResponse['source_label'], string> = {
  ubc_official: 'UBC Official',
  ams_club: 'AMS Club',
  campus_community: 'Campus Community',
};

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const insets = useSafeAreaInsets();
  const { events } = useExploreStore();
  const cachedEvent = events.find(e => e.id === eventId);
  const [event, setEvent] = React.useState<EventResponse | null>(cachedEvent ?? null);
  const [isLoading, setIsLoading] = React.useState(!cachedEvent);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (cachedEvent) {
      setEvent(cachedEvent);
      setIsLoading(false);
      return;
    }
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    api.getEvent(eventId)
      .then(data => {
        if (!cancelled) {
          setEvent(data);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || 'Event not found');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, cachedEvent]);

  const goBack = () => {
    if (expoRouter.canGoBack()) expoRouter.back();
    else expoRouter.replace('/(tabs)');
  };

  const openSource = () => {
    if (event?.source_url) Linking.openURL(event.source_url);
  };

  const openMaps = () => {
    if (!event?.latitude || !event?.longitude) return;
    const query = `${event.latitude},${event.longitude}`;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  };

  const shareEvent = async () => {
    if (!event) return;
    const origin = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : process.env.EXPO_PUBLIC_FRONTEND_URL;
    const url = `${origin}/events/${event.id}`;
    await Share.share({
      title: event.title,
      message: `${event.title}\n${url}`,
      url,
    });
  };

  if (isLoading) return (
    <View style={[s.container, { paddingTop: insets.top + 20 }]}>
      <TouchableOpacity style={s.closeBtn} onPress={goBack}>
        <X size={20} color={Brand.primary} />
      </TouchableOpacity>
      <Text style={s.err}>Loading event...</Text>
    </View>
  );

  if (!event || error) return (
    <View style={[s.container, { paddingTop: insets.top + 20 }]}>
      <TouchableOpacity style={s.closeBtn} onPress={goBack}>
        <X size={20} color={Brand.primary} />
      </TouchableOpacity>
      <Text style={s.err}>{error || 'Event not found'}</Text>
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top }]}>
      <TouchableOpacity 
        style={[s.closeBtn, { top: Platform.OS === 'ios' ? 20 : 56 }]} 
        onPress={goBack}
      >
        <X size={20} color={Brand.primary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.hero, { backgroundColor: Surfaces.background }]}>
          {event.event_picture_url ? (
            <Image source={{ uri: event.event_picture_url }} style={s.heroImg} />
          ) : (
            <View style={[s.iconWrap, { backgroundColor: `${Brand.accent}15`, borderColor: `${Brand.accent}30` }]}>
              <Calendar size={48} color={Brand.accent} />
            </View>
          )}
          <Text style={s.name}>{event.title}</Text>
          <View style={s.heroTags}>
            <View style={[s.catTag, { backgroundColor: `${Brand.accent}10`, borderColor: `${Brand.accent}30` }]}>
              <Text style={[s.catTxt, { color: Brand.accent }]}>{event.club_name || 'Campus Event'}</Text>
            </View>
            <View style={[s.catTag, { backgroundColor: Surfaces.default, borderColor: Surfaces.border }]}>
              <Text style={[s.catTxt, { color: Brand.primary }]}>{SOURCE_LABELS[event.source_label]}</Text>
            </View>
          </View>
        </View>

        <Card style={s.card}>
          <Text style={s.secTitle}>About this event</Text>
          <Text style={s.desc}>{event.description || 'No description provided yet.'}</Text>
          {event.vibes.length > 0 && (
            <View style={s.vibeRow}>
              {event.vibes.map(vibe => (
                <View key={vibe} style={s.vibeTag}>
                  <Text style={s.vibeText}>{vibe.charAt(0).toUpperCase() + vibe.slice(1)}</Text>
                </View>
              ))}
            </View>
          )}
          {event.source_label === 'campus_community' && (
            <Text style={s.disclaimer}>
              Community-sourced listing. Check the organizer page for the latest details.
            </Text>
          )}
        </Card>

        <Card style={s.card}>
          {event.event_date && (
            <View style={s.detailRow}>
              <Calendar size={16} color={Brand.secondary} style={s.detailIcon} />
              <Text style={s.detailLabel}>Date</Text>
              <Text style={s.detailVal}>{new Date(event.event_date).toLocaleDateString()}</Text>
            </View>
          )}
          {event.location_name && (
            <View style={s.detailRow}>
              <MapPin size={16} color={Brand.secondary} style={s.detailIcon} />
              <Text style={s.detailLabel}>Location</Text>
              <Text style={s.detailVal}>{event.location_name}</Text>
            </View>
          )}
          {event.source_url && (
            <View style={[s.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Link2 size={16} color={Brand.secondary} style={s.detailIcon} />
              <Text style={s.detailLabel}>Source</Text>
              <Text style={s.detailVal} numberOfLines={1}>{SOURCE_LABELS[event.source_label] ?? event.source_url}</Text>
            </View>
          )}
        </Card>

        <View style={s.actionArea}>
          {event.source_url && (
            <Button
              title={event.external_cta_label || 'Open organizer page'}
              variant="primary"
              size="lg"
              icon="open-outline"
              onPress={openSource}
              style={s.actionButton}
            />
          )}
          {event.latitude && event.longitude && (
            <Button
              title="Open in Maps"
              variant="secondary"
              size="lg"
              icon="map-outline"
              onPress={openMaps}
              style={s.actionButton}
            />
          )}
          <Button
            title="Share event"
            variant={event.source_url ? 'secondary' : 'primary'}
            size="lg"
            icon="share-outline"
            onPress={shareEvent}
            style={s.actionButton}
          />
          <TouchableOpacity style={s.reportLink} onPress={() => Linking.openURL(PROJECT_INSTAGRAM_URL)}>
            <Flag size={14} color={Brand.secondary} />
            <Text style={s.reportText}>Report issue</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 48 + insets.bottom }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Surfaces.default },
  scroll: { paddingHorizontal: Spacing.lg },
  err: { fontFamily: Typography.fonts.body, color: Brand.primary, fontSize: 16, textAlign: 'center', marginTop: 100 },
  closeBtn: { position: 'absolute', right: 20, zIndex: 10, width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Surfaces.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Surfaces.border },
  hero: { alignItems: 'center', paddingVertical: Spacing.xxl, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Surfaces.border },
  heroImg: { width: '100%', height: 200, borderRadius: Radius.md, marginBottom: Spacing.md },
  iconWrap: { width: 96, height: 96, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 1 },
  name: { fontFamily: Typography.fonts.h1, fontSize: 24, color: Brand.primary, textAlign: 'center' },
  heroTags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: Spacing.sm },
  catTag: { marginTop: Spacing.sm, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.sm, borderWidth: 1 },
  catTxt: { fontFamily: Typography.fonts.caption, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { marginTop: Spacing.md },
  secTitle: { fontFamily: Typography.fonts.h3, fontSize: 16, color: Brand.primary, marginBottom: 8 },
  desc: { fontFamily: Typography.fonts.body, fontSize: 15, color: Brand.secondary, lineHeight: 24 },
  vibeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md },
  vibeTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, backgroundColor: Surfaces.default, borderWidth: 1, borderColor: Surfaces.border },
  vibeText: { fontFamily: Typography.fonts.caption, fontSize: 11, color: Brand.primary },
  disclaimer: { fontFamily: Typography.fonts.bodySm, fontSize: 13, color: Brand.secondary, marginTop: Spacing.md, lineHeight: 19 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Surfaces.border },
  detailIcon: { width: 28 },
  detailLabel: { flex: 1, fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.secondary },
  detailVal: { fontFamily: Typography.fonts.h4, fontSize: 14, color: Brand.primary },
  actionArea: { marginTop: Spacing.xl, alignItems: 'center' },
  actionButton: { width: '100%', marginBottom: Spacing.sm },
  hint: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.secondary, textAlign: 'center', marginTop: Spacing.md, paddingHorizontal: Spacing.lg },
  reportLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm, paddingVertical: 8 },
  reportText: { fontFamily: Typography.fonts.bodySm, fontSize: 13, color: Brand.secondary },
});
