/**
 * GlassCard — Frosted glass effect card component
 */
import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { Surfaces, Radius, Spacing, Shadows } from '@/constants/Colors';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'highlight';
  noPadding?: boolean;
}

export function GlassCard({ variant = 'default', noPadding, style, children, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'highlight' && styles.highlight,
        noPadding && styles.noPadding,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Surfaces.glass,
    borderWidth: 1,
    borderColor: Surfaces.glassBorder,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  elevated: {
    backgroundColor: Surfaces.backgroundCard,
    borderColor: Surfaces.glassBorder,
  },
  highlight: {
    backgroundColor: Surfaces.glassHighlight,
    borderColor: 'rgba(79, 142, 247, 0.2)',
  },
  noPadding: {
    padding: 0,
  },
});
