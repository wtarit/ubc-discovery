import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  Map, Calendar, Feather as FeatherIcon, BookOpen, Users, Globe, Activity,
  Check, MapPin, CheckCircle, Info, Clock,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { router } from 'expo-router';

import { Brand, Spacing } from '@/constants/Colors';
import { CATEGORY_COLORS, type ExploreZone } from '@/constants/Zones';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AuthPrompt } from '@/components/ui/AuthPrompt';
import { shared as s } from './mapStyles';
import type { EventResponse } from '@/services/api';

type CategoryFilter = ExploreZone['category'] | 'all' | 'events';

const CATEGORIES: { key: CategoryFilter; label: string; Icon: LucideIcon }[] = [
  { key: 'all', label: 'All', Icon: Map },
  { key: 'events', label: 'Events', Icon: Calendar },
  { key: 'nature', label: 'Nature', Icon: FeatherIcon },
  { key: 'academic', label: 'Academic', Icon: BookOpen },
  { key: 'social', label: 'Social', Icon: Users },
  { key: 'culture', label: 'Culture', Icon: Globe },
  { key: 'athletics', label: 'Athletics', Icon: Activity },
];

// --- ExploreStats ---

interface ExploreStatsProps {
  progress: { percentage: number; unlocked: number; total: number };
  totalPoints: number;
  insetTop: number;
}

export function ExploreStats({ progress, totalPoints, insetTop }: ExploreStatsProps) {
  return (
    <View style={[s.topBar, { top: insetTop + 8 }]}>
      <View style={s.stats}>
        <View style={s.si}>
          <Text style={s.sv}>{progress.percentage}%</Text>
          <Text style={s.sl}>Explored</Text>
        </View>
        <View style={s.divider} />
        <View style={s.si}>
          <Text style={[s.sv, { color: Brand.primary }]}>{totalPoints}</Text>
          <Text style={s.sl}>Points</Text>
        </View>
        <View style={s.divider} />
        <View style={s.si}>
          <Text style={[s.sv, { color: Brand.accent }]}>{progress.unlocked}/{progress.total}</Text>
          <Text style={s.sl}>Zones</Text>
        </View>
      </View>
    </View>
  );
}

// --- CategoryFilters ---

interface CategoryFiltersProps {
  activeCategory: CategoryFilter;
  onCategoryChange: (cat: CategoryFilter) => void;
  insetTop: number;
}

export function CategoryFilters({ activeCategory, onCategoryChange, insetTop }: CategoryFiltersProps) {
  return (
    <View style={[s.filterC, { top: insetTop + 68 }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterR}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat.key} onPress={() => onCategoryChange(cat.key)} activeOpacity={0.7}>
            <View style={[s.pill, activeCategory === cat.key && s.pillA]}>
              <cat.Icon
                size={14}
                color={activeCategory === cat.key ? '#fff' : Brand.primary}
              />
              <Text style={[s.pillL, activeCategory === cat.key && s.pillLA]}>{cat.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// --- ZoneBottomCard ---

interface ZoneBottomCardProps {
  zone: ExploreZone;
  isUnlocked: boolean;
  justUnlocked: string | null;
  unlockError: string | null;
  isUnlocking: boolean;
  accessToken: string | null;
  onUnlock: () => void;
  insetBottom: number;
}

export function ZoneBottomCard({
  zone, isUnlocked, justUnlocked, unlockError,
  isUnlocking, accessToken, onUnlock, insetBottom,
}: ZoneBottomCardProps) {
  const catColor = CATEGORY_COLORS[zone.category];

  return (
    <View style={[s.btmWrap, { paddingBottom: Math.max(insetBottom, 12) + 12 }]}>
      <Card style={s.btmCard} noPadding>
        <View style={s.handle} />
        <View style={{ padding: Spacing.lg }}>
          <View style={s.cardH}>
            <View style={[s.cardIcon, { backgroundColor: `${catColor}15` }]}>
              <zone.Icon size={24} color={catColor} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.cardNR}>
                <Text style={s.cardN}>{zone.name}</Text>
                {isUnlocked && (
                  <View style={s.expB}>
                    <Check size={12} color={Brand.success} />
                    <Text style={s.expBT}>Explored</Text>
                  </View>
                )}
              </View>
              <Text style={s.cardDesc} numberOfLines={2}>{zone.description}</Text>
            </View>
          </View>

          <View style={s.cardMeta}>
            <View style={[s.catTag, { backgroundColor: `${catColor}15` }]}>
              <Text style={[s.catTT, { color: catColor }]}>{zone.category}</Text>
            </View>
            <Text style={s.radT}><MapPin size={10} /> {zone.radiusMeters}m</Text>
            <View style={s.ptBadge}>
              <Text style={s.ptText}>+{zone.points} pts</Text>
            </View>
          </View>

          <View style={s.acts}>
            {justUnlocked === zone.id ? (
              <View style={s.unlockMsg}>
                <CheckCircle size={24} color={Brand.success} />
                <Text style={s.unlockText}>Zone Unlocked! +{zone.points} pts</Text>
              </View>
            ) : isUnlocked ? (
              <Button
                title="View Details"
                variant="secondary"
                onPress={() => router.push({ pathname: '/zone-detail', params: { zoneId: zone.id } })}
              />
            ) : !accessToken ? (
              <AuthPrompt
                variant="inline"
                message="Sign in to unlock zones and track exploration"
              />
            ) : (
              <View>
                <View style={s.actRow}>
                  <Button
                    title="Unlock Zone"
                    variant="primary"
                    style={{ flex: 1 }}
                    onPress={onUnlock}
                    loading={isUnlocking}
                    disabled={isUnlocking}
                  />
                  <TouchableOpacity
                    style={s.infoBtn}
                    onPress={() => router.push({ pathname: '/zone-detail', params: { zoneId: zone.id } })}
                    activeOpacity={0.8}
                  >
                    <Info size={20} color={Brand.primary} />
                  </TouchableOpacity>
                </View>
                {unlockError && (
                  <Text style={s.unlockErr}>{unlockError}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Card>
    </View>
  );
}

// --- EventBottomCard ---

interface EventBottomCardProps {
  event: EventResponse;
  insetBottom: number;
}

export function EventBottomCard({ event, insetBottom }: EventBottomCardProps) {
  return (
    <View style={[s.btmWrap, { paddingBottom: Math.max(insetBottom, 12) + 12 }]}>
      <Card style={s.btmCard} noPadding>
        <View style={s.handle} />
        <View style={{ padding: Spacing.lg }}>
          <View style={s.cardH}>
            <View style={[s.cardIcon, { backgroundColor: '#FFF9F0' }]}>
              <Calendar size={24} color={Brand.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.cardNR}>
                <Text style={s.cardN}>{event.title}</Text>
              </View>
              <Text style={s.cardDesc} numberOfLines={2}>{event.description}</Text>
            </View>
          </View>

          <View style={s.cardMeta}>
            <View style={[s.catTag, { backgroundColor: `${Brand.accent}15` }]}>
              <Text style={[s.catTT, { color: Brand.accent }]}>{event.club_name || 'Event'}</Text>
            </View>
            {event.vibes.slice(0, 2).map(vibe => (
              <View key={vibe} style={s.catTag}>
                <Text style={s.catTT}>{vibe}</Text>
              </View>
            ))}
            {event.event_date && (
              <Text style={s.radT}>
                <Clock size={10} /> {new Date(event.event_date).toLocaleDateString()}
              </Text>
            )}
          </View>

          <View style={s.acts}>
            <Button
              title="View Event Details"
              variant="primary"
              onPress={() => router.push(`/events/${event.id}` as any)}
            />
          </View>
        </View>
      </Card>
    </View>
  );
}
