/**
 * UBC Newcomers — Design System Colors
 * Premium dark theme with UBC-inspired accents
 */

// Primary brand colors
export const Brand = {
  // UBC blue family
  primary: '#4F8EF7',
  primaryLight: '#7BABFF',
  primaryDark: '#2D6BD4',

  // Accent / exploration green
  accent: '#34D399',
  accentLight: '#6EE7B7',
  accentDark: '#10B981',

  // Warm highlight for proximity / connections
  warm: '#F59E0B',
  warmLight: '#FBBF24',
  warmDark: '#D97706',

  // AI / intro purple
  ai: '#A78BFA',
  aiLight: '#C4B5FD',
  aiDark: '#7C3AED',

  // Status colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
};

// Background system (dark mode first)
export const Surfaces = {
  // Main backgrounds
  background: '#0B0F1A',
  backgroundElevated: '#111827',
  backgroundCard: '#1A1F2E',
  backgroundCardHover: '#232838',

  // Glass effect
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.12)',

  // Map overlay
  mapOverlayLocked: 'rgba(75, 85, 99, 0.45)',
  mapOverlayUnlocked: 'rgba(52, 211, 153, 0.2)',
  mapOverlayActive: 'rgba(79, 142, 247, 0.3)',
};

// Text hierarchy
export const Typography = {
  primary: '#F9FAFB',
  secondary: '#9CA3AF',
  tertiary: '#6B7280',
  inverse: '#111827',
  accent: Brand.primary,
  link: Brand.primaryLight,
};

// Gradient presets (for LinearGradient)
export const Gradients = {
  primary: [Brand.primary, Brand.primaryDark] as const,
  accent: [Brand.accent, Brand.accentDark] as const,
  warm: ['#F59E0B', '#EF4444'] as const,
  ai: [Brand.ai, Brand.aiDark] as const,
  dark: ['#1A1F2E', '#0B0F1A'] as const,
  card: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,
  heroOverlay: ['rgba(11,15,26,0)', 'rgba(11,15,26,0.95)'] as const,
};

// Spacing system (4px base)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  }),
};

// Kept for compatibility with Expo template
const tintColorLight = Brand.primary;
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: Surfaces.background,
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: Brand.primary,
  },
};
