/**
 * Button — Clean flat button component for UBC-Navigate (Instagram style)
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, ActivityIndicator } from 'react-native';
import { Brand, Surfaces, Typography, Radius } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  style,
}: ButtonProps) {
  
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isDestructive = variant === 'destructive';

  const sizeStyles = {
    sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 13, height: 32 },
    md: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, height: 40 },
    lg: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 15, height: 48 },
  };
  const s = sizeStyles[size];

  const getIconColor = () => {
    if (variant === 'primary' || isDestructive) return '#FFFFFF';
    if (isGhost) return Brand.secondary;
    return Brand.primary; // secondary
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          paddingHorizontal: s.paddingHorizontal,
          height: s.height,
          opacity: disabled ? 0.4 : 1,
        },
        variant === 'primary' && styles.primary,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        isDestructive && styles.destructive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getIconColor()} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={s.fontSize + 2} color={getIconColor()} style={{ marginRight: 6 }} />}
          <Text
            style={[
              styles.text,
              { fontSize: s.fontSize },
              variant === 'primary' && styles.primaryText,
              isSecondary && styles.secondaryText,
              isGhost && styles.ghostText,
              isDestructive && styles.destructiveText,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontFamily: Typography.fonts.h3, // Semibold
    letterSpacing: 0,
  },
  primary: {
    backgroundColor: Brand.accent, // Calm Blue
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: Surfaces.default,
    borderWidth: 1,
    borderColor: Surfaces.border,
  },
  secondaryText: {
    color: Brand.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: Brand.secondary,
  },
  destructive: {
    backgroundColor: Brand.error,
  },
  destructiveText: {
    color: '#FFFFFF',
  },
});
