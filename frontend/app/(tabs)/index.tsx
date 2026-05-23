/**
 * Discover Tab — Full-screen interactive map with UBC events and zone markers
 *
 * Uses platform-specific map implementations:
 * - Native (iOS/Android): react-native-maps with Google Maps / Apple Maps
 * - Web: Interactive styled campus map with positioned markers
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Map, List, Calendar, ChevronRight, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Radius, Spacing, Surfaces, Typography } from '@/constants/Colors';
import ExploreMap from '@/components/map/ExploreMap';
import { Card } from '@/components/ui/Card';
import { useExploreStore } from '@/stores/useExploreStore';
import type { EventResponse } from '@/services/api';

type DiscoverMode = 'map' | 'list';
type DateFilter = 'all' | 'upcoming' | 'week';
type SourceFilter = 'all' | EventResponse['source_label'];

const SOURCE_LABELS: Record<EventResponse['source_label'], string> = {
  ubc_official: 'UBC Official',
  ams_club: 'AMS Club',
  campus_community: 'Campus Community',
};

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'Any date' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'week', label: 'This week' },
];

const SOURCE_FILTERS: { key: SourceFilter; label: string }[] = [
  { key: 'all', label: 'All sources' },
  { key: 'ubc_official', label: 'UBC Official' },
  { key: 'ams_club', label: 'AMS Club' },
  { key: 'campus_community', label: 'Campus Community' },
];

const VIBE_FILTERS = [
  'all',
  'social',
  'career',
  'academic',
  'arts',
  'culture',
  'outdoors',
  'sports',
  'food',
  'wellness',
  'volunteering',
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { events, fetchEvents } = useExploreStore();
  const [mode, setMode] = React.useState<DiscoverMode>('map');
  const [dateFilter, setDateFilter] = React.useState<DateFilter>('all');
  const [sourceFilter, setSourceFilter] = React.useState<SourceFilter>('all');
  const [vibeFilter, setVibeFilter] = React.useState('all');

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = React.useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(now.getDate() + 7);

    return events.filter(event => {
      if (sourceFilter !== 'all' && event.source_label !== sourceFilter) return false;
      if (vibeFilter !== 'all' && !event.vibes.includes(vibeFilter)) return false;

      if (dateFilter === 'all') return true;
      if (!event.event_date) return false;

      const eventDate = new Date(event.event_date);
      if (dateFilter === 'upcoming') return eventDate >= now;
      return eventDate >= now && eventDate <= weekFromNow;
    });
  }, [dateFilter, events, sourceFilter, vibeFilter]);

  return (
    <View style={styles.container}>
      {mode === 'map' ? (
        <ExploreMap insetTop={insets.top} insetBottom={insets.bottom} />
      ) : (
        <DiscoverList
          events={filteredEvents}
          insetTop={insets.top}
          insetBottom={insets.bottom}
          dateFilter={dateFilter}
          sourceFilter={sourceFilter}
          vibeFilter={vibeFilter}
          setDateFilter={setDateFilter}
          setSourceFilter={setSourceFilter}
          setVibeFilter={setVibeFilter}
        />
      )}

      <View style={[styles.modeToggle, { top: insets.top + 8 }]}>
        {(['map', 'list'] as DiscoverMode[]).map(value => (
          <TouchableOpacity
            key={value}
            onPress={() => setMode(value)}
            style={[styles.modeButton, mode === value && styles.modeButtonActive]}
            activeOpacity={0.75}
          >
            {value === 'map'
              ? <Map size={14} color={mode === value ? Surfaces.background : Brand.primary} />
              : <List size={14} color={mode === value ? Surfaces.background : Brand.primary} />
            }
            <Text style={[styles.modeText, mode === value && styles.modeTextActive]}>
              {value === 'map' ? 'Map' : 'List'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function DiscoverList({
  events,
  insetTop,
  insetBottom,
  dateFilter,
  sourceFilter,
  vibeFilter,
  setDateFilter,
  setSourceFilter,
  setVibeFilter,
}: {
  events: EventResponse[];
  insetTop: number;
  insetBottom: number;
  dateFilter: DateFilter;
  sourceFilter: SourceFilter;
  vibeFilter: string;
  setDateFilter: (value: DateFilter) => void;
  setSourceFilter: (value: SourceFilter) => void;
  setVibeFilter: (value: string) => void;
}) {
  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={[
        styles.listContent,
        { paddingTop: insetTop + 64, paddingBottom: Math.max(insetBottom, 16) + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.listHeader}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Public campus events and places worth checking out.</Text>
      </View>

      <FilterRail
        label="Date"
        options={DATE_FILTERS}
        activeKey={dateFilter}
        onChange={key => setDateFilter(key as DateFilter)}
      />
      <FilterRail
        label="Source"
        options={SOURCE_FILTERS}
        activeKey={sourceFilter}
        onChange={key => setSourceFilter(key as SourceFilter)}
      />
      <FilterRail
        label="Vibe"
        options={VIBE_FILTERS.map(vibe => ({
          key: vibe,
          label: vibe === 'all' ? 'All vibes' : capitalize(vibe),
        }))}
        activeKey={vibeFilter}
        onChange={setVibeFilter}
      />

      <View style={styles.resultRow}>
        <Text style={styles.resultCount}>{events.length} event{events.length === 1 ? '' : 's'}</Text>
      </View>

      {events.length === 0 && (
        <Card style={styles.emptyCard}>
          <Calendar size={22} color={Brand.secondary} />
          <Text style={styles.emptyTitle}>No events match these filters</Text>
          <Text style={styles.emptyText}>Try a different date, source, or vibe.</Text>
        </Card>
      )}

      {events.map(event => (
        <TouchableOpacity
          key={event.id}
          activeOpacity={0.82}
          onPress={() => router.push(`/events/${event.id}` as any)}
        >
          <Card style={styles.eventCard}>
            <View style={styles.eventTop}>
              <View style={styles.eventIcon}>
                <Calendar size={18} color={Brand.accent} />
              </View>
              <View style={styles.eventCopy}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>
                  {formatDate(event.event_date)} · {SOURCE_LABELS[event.source_label]}
                </Text>
              </View>
              <ChevronRight size={18} color={Brand.secondary} />
            </View>
            {event.description && (
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
            )}
            <View style={styles.eventFooter}>
              {event.vibes.slice(0, 3).map(vibe => (
                <View key={vibe} style={styles.vibeTag}>
                  <Text style={styles.vibeText}>{capitalize(vibe)}</Text>
                </View>
              ))}
              {event.location_name && (
                <Text style={styles.location} numberOfLines={1}>
                  <MapPin size={11} /> {event.location_name}
                </Text>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function FilterRail({
  label,
  options,
  activeKey,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
        {options.map(option => (
          <TouchableOpacity key={option.key} onPress={() => onChange(option.key)} activeOpacity={0.75}>
            <View style={[styles.filterPill, activeKey === option.key && styles.filterPillActive]}>
              <Text style={[styles.filterText, activeKey === option.key && styles.filterTextActive]}>
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function formatDate(value: string | null) {
  if (!value) return 'Date TBA';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Surfaces.background,
  },
  modeToggle: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    backgroundColor: Surfaces.background,
    borderWidth: 1,
    borderColor: Surfaces.border,
    borderRadius: Radius.md,
    padding: 3,
  },
  modeButton: {
    minWidth: 64,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: Brand.primary,
  },
  modeText: {
    fontFamily: Typography.fonts.h3,
    fontSize: 13,
    color: Brand.primary,
  },
  modeTextActive: {
    color: Surfaces.background,
  },
  list: {
    flex: 1,
    backgroundColor: Surfaces.default,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  listHeader: {
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fonts.h1,
    fontSize: 28,
    color: Brand.primary,
  },
  subtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: 15,
    color: Brand.secondary,
    marginTop: 4,
    lineHeight: 22,
  },
  filterBlock: {
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    fontFamily: Typography.fonts.caption,
    fontSize: 11,
    color: Brand.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  filterContent: {
    gap: 8,
    paddingRight: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Surfaces.background,
    borderWidth: 1,
    borderColor: Surfaces.border,
  },
  filterPillActive: {
    backgroundColor: Brand.accent,
    borderColor: Brand.accent,
  },
  filterText: {
    fontFamily: Typography.fonts.bodySm,
    fontSize: 13,
    color: Brand.primary,
  },
  filterTextActive: {
    color: Surfaces.background,
  },
  resultRow: {
    marginVertical: Spacing.sm,
  },
  resultCount: {
    fontFamily: Typography.fonts.caption,
    fontSize: 13,
    color: Brand.secondary,
  },
  eventCard: {
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Typography.fonts.h3,
    fontSize: 16,
    color: Brand.primary,
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontFamily: Typography.fonts.bodySm,
    fontSize: 13,
    color: Brand.secondary,
    marginTop: 4,
  },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Brand.accent}12`,
  },
  eventCopy: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: Typography.fonts.h3,
    fontSize: 16,
    color: Brand.primary,
  },
  eventMeta: {
    fontFamily: Typography.fonts.bodySm,
    fontSize: 13,
    color: Brand.secondary,
    marginTop: 3,
  },
  eventDescription: {
    fontFamily: Typography.fonts.body,
    fontSize: 14,
    color: Brand.secondary,
    lineHeight: 21,
    marginTop: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  vibeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Surfaces.default,
    borderWidth: 1,
    borderColor: Surfaces.border,
  },
  vibeText: {
    fontFamily: Typography.fonts.caption,
    fontSize: 11,
    color: Brand.primary,
  },
  location: {
    flexShrink: 1,
    fontFamily: Typography.fonts.bodySm,
    fontSize: 12,
    color: Brand.secondary,
  },
});
