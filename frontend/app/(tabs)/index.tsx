/**
 * Explore Tab — Full-screen interactive map with UBC zone markers
 *
 * Uses platform-specific map implementations:
 * - Native (iOS/Android): react-native-maps with Google Maps / Apple Maps
 * - Web: Interactive styled campus map with positioned markers
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Surfaces } from '@/constants/Colors';
import ExploreMap from '@/components/map/ExploreMap';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ExploreMap insetTop={insets.top} insetBottom={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Surfaces.background,
  },
});
