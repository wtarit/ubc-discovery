/**
 * Profile Tab — User profile & exploration stats (UBC-Navigate)
 */
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Brand, Radius, Spacing, Surfaces, Typography } from '@/constants/Colors';
import { CATEGORY_COLORS } from '@/constants/Zones';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useExploreStore } from '@/stores/useExploreStore';
import { useNearbyStore } from '@/stores/useNearbyStore';
import {
  User, Mail, Camera, CheckCircle, Shield, Map, Award, MessageCircle,
  Flag, Briefcase, Calendar, LogOut,
} from '@/components/icons';
import type { LucideIcon } from '@/components/icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function StatRow({
  Icon,
  label,
  value,
  color
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={rs.row}>
      <Icon
        size={18}
        color={Brand.secondary}
        style={rs.icon}
      />
      <Text style={rs.label}>{label}</Text>
      <Text style={[rs.value, { color }]}>{value}</Text>
    </View>
  );
}

const rs = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Surfaces.border,
  },
  icon: { width: 32 },
  label: {
    flex: 1,
    fontFamily: Typography.fonts.body,
    fontSize: 14,
    color: Brand.secondary,
  },
  value: {
    fontFamily: Typography.fonts.h4,
    fontSize: 14,
  },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const { totalPoints, getProgress, zones, isZoneUnlocked } =
    useExploreStore();

  const { introductions } = useNearbyStore();

  const { user, fetchUser, accessToken, logout, signInWithGoogle, isLoading, error: authError, clearError } = useAuthStore();

  const progress = getProgress();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken && !user) fetchUser();
  }, [accessToken]);

  if (!accessToken) {
    return (
      <View style={[s.container, { paddingTop: insets.top + 32 }]}>
        <View style={s.signInWrap}>
          <View style={s.signInIcon}>
            <User size={34} color={Brand.accent} />
          </View>
          <Text style={s.signInTitle}>Sign in to personalize UBC discovery</Text>
          <Text style={s.signInBody}>
            Save events, pick interests, request Meet access, and build your campus profile.
          </Text>
          <TouchableOpacity
            style={s.signInButton}
            onPress={signInWithGoogle}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Surfaces.background} size="small" />
            ) : (
              <>
                <Text style={s.googleIcon}>G</Text>
                <Text style={s.signInButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={s.emailButton}
            onPress={() => router.push('/(auth)/email-login')}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Mail size={18} color={Brand.primary} />
            <Text style={s.emailButtonText}>Continue with Email</Text>
          </TouchableOpacity>
          {authError ? (
            <TouchableOpacity onPress={clearError}>
              <Text style={s.authError}>{authError}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  const pickAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        alert('Permission required to access photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const localUri = result.assets[0].uri;

      setAvatarUri(localUri);

      const updated = await api.uploadProfilePhoto(localUri);
      if (updated.profile_picture_url) {
        setAvatarUri(updated.profile_picture_url);
      }

      await fetchUser();
    } catch (err) {
      console.error('Avatar upload error', err);
      alert('Failed to upload avatar. Please try again.');
    }
  };

  const profile = {
    displayName: user?.full_name || 'Guest',
    program: user?.major || 'Undeclared',
    year: user?.year_standing || 1,
    interests: user?.interests || [],
    origin: user?.origin || '',
    bio: user?.bio || '',
    joinedDate: user?.created_at
      ? new Date(user.created_at).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : '',
  };

  const categories = [
    'nature',
    'academic',
    'social',
    'culture',
    'athletics',
  ] as const;

  const catStats = categories.map(cat => {
    const total = zones.filter(z => z.category === cat).length;

    const unlocked = zones.filter(
      z => z.category === cat && isZoneUnlocked(z.id)
    ).length;

    return { cat, total, unlocked };
  });

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >

        {/* Profile Header */}
        <View style={s.hdrWrap}>

          <TouchableOpacity
            style={s.avatarWrap}
            onPress={pickAvatar}
            activeOpacity={0.8}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={s.avatarImg}
              />
            ) : (
              <Image
                source={require('../../assets/avatars/default-avatar.png')}
                style={s.avatarImg}
              />
            )}

            <View style={s.editBadge}>
              <Camera size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={s.name}>{profile.displayName}</Text>

          <Text style={s.program}>
            {profile.program} · Year {profile.year}
          </Text>

          {profile.bio ? (
            <Text style={s.bio}>{profile.bio}</Text>
          ) : null}

          {user?.ubc_verified ? (
            <View style={s.verifiedBadge}>
              <CheckCircle size={14} color={Brand.accent} />
              <Text style={s.verifiedText}>Verified UBC Student</Text>
            </View>
          ) : (
            <TouchableOpacity style={s.verifyLink} onPress={() => router.push('/ubc-verify')}>
              <Shield size={14} color={Brand.accent} />
              <Text style={s.verifyLinkText}>Verify your UBC email</Text>
            </TouchableOpacity>
          )}

          <View style={s.tags}>
            {profile.interests.map(i => (
              <View key={i} style={s.tag}>
                <Text style={s.tagT}>{i}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exploration Stats */}
        <View style={s.section}>
          <Text style={s.secTitle}>Exploration Progress</Text>

          <Card style={s.progressCard}>
            <View style={s.progressRow}>

              <ProgressRing
                progress={progress.percentage}
                size={100}
                strokeWidth={6}
              />

              <View style={s.progressInfo}>
                <StatRow
                  Icon={Map}
                  label="Zones Explored"
                  value={`${progress.unlocked}/${progress.total}`}
                  color={Brand.primary}
                />

                <StatRow
                  Icon={Award}
                  label="Total Points"
                  value={`${totalPoints}`}
                  color={Brand.primary}
                />

                <StatRow
                  Icon={MessageCircle}
                  label="Intros Sent"
                  value={`${introductions.length}`}
                  color={Brand.primary}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Category Breakdown */}
        <View style={s.section}>
          <Text style={s.secTitle}>By Category</Text>

          {catStats.map(({ cat, total, unlocked }) => {
            const color = CATEGORY_COLORS[cat];

            const pct =
              total > 0
                ? Math.round((unlocked / total) * 100)
                : 0;

            return (
              <Card key={cat} style={s.catCard}>
                <View style={s.catRow}>
                  <View
                    style={[
                      s.catDot,
                      { backgroundColor: color }
                    ]}
                  />

                  <Text style={s.catName}>{cat}</Text>

                  <Text style={[s.catPct, { color }]}>
                    {pct}%
                  </Text>

                  <Text style={s.catCount}>
                    {unlocked}/{total}
                  </Text>
                </View>

                <View style={s.barBg}>
                  <View
                    style={[
                      s.barFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
              </Card>
            );
          })}
        </View>

        {/* Account Info */}
        <View style={s.section}>
          <Text style={s.secTitle}>Account</Text>

          <Card>
            {profile.origin ? (
              <StatRow
                Icon={Flag}
                label="Origin"
                value={profile.origin}
                color={Brand.primary}
              />
            ) : null}

            <StatRow
              Icon={Briefcase}
              label="Connections"
              value={`${user?.connections_count || 0}`}
              color={Brand.primary}
            />

            <StatRow
              Icon={Calendar}
              label="Joined"
              value={profile.joinedDate || 'N/A'}
              color={Brand.primary}
            />
          </Card>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={logout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#DC3545" />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Surfaces.default,
  },

  scroll: {
    paddingHorizontal: Spacing.lg,
  },

  hdrWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Surfaces.background,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Surfaces.border,
  },

  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    overflow: 'visible',
    backgroundColor: Surfaces.default,
    borderWidth: 1,
    borderColor: Surfaces.border,
    marginBottom: Spacing.md,
    position: 'relative',
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.full,
  },

  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Surfaces.background,
  },

  name: {
    fontFamily: Typography.fonts.h2,
    fontSize: 22,
    color: Brand.primary,
  },

  program: {
    fontFamily: Typography.fonts.body,
    fontSize: 15,
    color: Brand.secondary,
    marginTop: 4,
  },

  bio: {
    fontFamily: Typography.fonts.bodySm,
    fontSize: 14,
    color: Brand.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    backgroundColor: `${Brand.accent}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  verifiedText: {
    fontFamily: Typography.fonts.h4,
    fontSize: 13,
    color: Brand.accent,
  },
  verifyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  verifyLinkText: {
    fontFamily: Typography.fonts.body,
    fontSize: 13,
    color: Brand.accent,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.md,
    justifyContent: 'center',
  },

  tag: {
    backgroundColor: Surfaces.default,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Surfaces.border,
  },

  tagT: {
    fontFamily: Typography.fonts.caption,
    fontSize: 12,
    color: Brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  section: {
    marginTop: Spacing.xl,
  },

  secTitle: {
    fontFamily: Typography.fonts.h3,
    fontSize: 18,
    color: Brand.primary,
    marginBottom: Spacing.md,
  },

  progressCard: {
    padding: Spacing.md,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },

  progressInfo: {
    flex: 1,
  },

  catCard: {
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
  },

  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 8,
  },

  catDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },

  catName: {
    flex: 1,
    fontFamily: Typography.fonts.h4,
    fontSize: 14,
    color: Brand.primary,
    textTransform: 'capitalize',
  },

  catPct: {
    fontFamily: Typography.fonts.h4,
    fontSize: 14,
  },

  catCount: {
    fontFamily: Typography.fonts.caption,
    fontSize: 12,
    color: Brand.secondary,
    width: 32,
    textAlign: 'right',
  },

  barBg: {
    height: 4,
    backgroundColor: Surfaces.default,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },

  barFill: {
    height: 4,
    borderRadius: Radius.full,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#DC3545',
  },

  logoutText: {
    fontFamily: Typography.fonts.h4,
    fontSize: 15,
    color: '#DC3545',
  },

  signInWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  signInIcon: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    backgroundColor: `${Brand.accent}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  signInTitle: {
    fontFamily: Typography.fonts.h1,
    fontSize: 24,
    color: Brand.primary,
    textAlign: 'center',
  },

  signInBody: {
    fontFamily: Typography.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Brand.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: Spacing.xl,
    width: '100%',
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Brand.accent,
  },

  googleIcon: {
    fontFamily: Typography.fonts.h3,
    fontSize: 18,
    color: Surfaces.background,
  },

  signInButtonText: {
    fontFamily: Typography.fonts.h3,
    fontSize: 15,
    color: Surfaces.background,
  },

  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: Spacing.sm,
    width: '100%',
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Surfaces.default,
    borderWidth: 1,
    borderColor: Surfaces.border,
  },

  emailButtonText: {
    fontFamily: Typography.fonts.h3,
    fontSize: 15,
    color: Brand.primary,
  },

  authError: {
    fontFamily: Typography.fonts.body,
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
