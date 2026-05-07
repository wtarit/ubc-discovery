/**
 * PillButton — Styled pill-shaped action button
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand, Typography, Radius, Spacing, Shadows } from '@/constants/Colors';

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'warm' | 'ai' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const VARIANT_COLORS = {
  primary: [Brand.primary, Brand.primaryDark],
  accent: [Brand.accent, Brand.accentDark],
  warm: [Brand.warm, Brand.warmDark],
  ai: [Brand.ai, Brand.aiDark],
  outline: ['transparent', 'transparent'],
  ghost: ['transparent', 'transparent'],
} as const;

export function PillButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  style,
}: PillButtonProps) {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 },
    md: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 15 },
    lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 17 },
  };
  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <LinearGradient
        colors={VARIANT_COLORS[variant] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: s.paddingVertical,
            paddingHorizontal: s.paddingHorizontal,
          },
          isOutline && styles.outline,
          isGhost && styles.ghost,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              { fontSize: s.fontSize },
              isOutline && styles.outlineText,
              isGhost && styles.ghostText,
            ]}
          >
            {icon ? `${icon}  ${title}` : title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Brand.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  outlineText: {
    color: Brand.primary,
  },
  ghost: {
    shadowOpacity: 0,
    elevation: 0,
  },
  ghostText: {
    color: Typography.secondary,
  },
});
