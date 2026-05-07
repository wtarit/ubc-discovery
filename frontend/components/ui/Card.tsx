/**
 * Card — Clean flat card component for UBC-Navigate
 */
import React from 'react';
import { View, StyleSheet, type ViewProps, Text } from 'react-native';
import { Surfaces, Radius, Spacing, Brand, Typography } from '@/constants/Colors';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated'; // Note: elevated is now flat but just with larger padding, adhering to the minimalist style
  noPadding?: boolean;
  headerLabel?: string;
}

export function Card({ variant = 'default', noPadding, headerLabel, style, children, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        noPadding && styles.noPadding,
        headerLabel ? { paddingTop: 0 } : {}, 
        style,
      ]}
      {...props}
    >
      {headerLabel && variant === 'elevated' && (
        <View style={styles.headerStrip}>
          <Text style={styles.headerText}>{headerLabel}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Surfaces.background,
    borderWidth: 1,
    borderColor: Surfaces.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  elevated: {
    backgroundColor: Surfaces.background,
    borderWidth: 1,
    borderColor: Surfaces.border,
    padding: Spacing.lg,
    // Removed shadows for professional flat aesthetic
  },
  noPadding: {
    padding: 0,
  },
  headerStrip: {
    backgroundColor: Surfaces.default,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    borderBottomWidth: 1,
    borderBottomColor: Surfaces.border,
    marginBottom: Spacing.md,
  },
  headerText: {
    fontFamily: Typography.fonts.h4,
    fontSize: 13,
    color: Brand.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
