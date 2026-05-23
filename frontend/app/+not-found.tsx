import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Map } from '@/components/icons';
import { Surfaces, Typography, Brand, Spacing } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={s.container}>
        <Map size={48} color={Brand.secondary} style={s.icon} />
        <Text style={s.title}>Page not found</Text>
        <Link href="/" style={s.link}>
          <Text style={s.linkText}>Go back to exploring</Text>
        </Link>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Surfaces.background, padding: Spacing.lg },
  icon: { marginBottom: Spacing.md },
  title: { fontFamily: Typography.fonts.h3, fontSize: 20, color: Brand.primary },
  link: { marginTop: Spacing.lg },
  linkText: { fontFamily: Typography.fonts.h4, fontSize: 16, color: Brand.accent },
});
