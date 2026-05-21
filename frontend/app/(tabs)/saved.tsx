import { Button } from '@/components/ui/Button';
import { Brand, Radius, Spacing, Surfaces, Typography } from '@/constants/Colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return (
      <View style={[s.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
        <View style={s.emptyIcon}>
          <Feather name="bookmark" size={36} color={Brand.accent} />
        </View>
        <Text style={s.title}>Save events for later</Text>
        <Text style={s.body}>
          Sign in to keep a private list of campus events you want to revisit.
        </Text>
        <Button
          title="Sign in to save events"
          size="lg"
          icon="log-in-outline"
          onPress={() => router.push('/(auth)/welcome')}
          style={s.cta}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.scroll, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.title}>Saved</Text>
      <View style={s.placeholder}>
        <Feather name="bookmark" size={28} color={Brand.secondary} />
        <Text style={s.placeholderTitle}>No saved events yet</Text>
        <Text style={s.body}>
          Saved Events will appear here once event saving is wired up.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Surfaces.background,
    paddingHorizontal: Spacing.lg,
  },
  scroll: {
    gap: Spacing.lg,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    backgroundColor: `${Brand.accent}10`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fonts.h1,
    fontSize: 26,
    color: Brand.primary,
    textAlign: 'center',
  },
  body: {
    fontFamily: Typography.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Brand.secondary,
    textAlign: 'center',
  },
  cta: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  placeholder: {
    marginTop: Spacing.xxl,
    padding: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Surfaces.border,
    backgroundColor: Surfaces.default,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  placeholderTitle: {
    fontFamily: Typography.fonts.h3,
    fontSize: 18,
    color: Brand.primary,
  },
});
