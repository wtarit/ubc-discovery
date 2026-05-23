/**
 * Global Color & Styling Constants (UBC-Navigate Calm Blue Theme)
 */

export const Brand = {
  primary: '#111827',     // Deep almost-black for text
  secondary: '#6B7280',   // Gray for secondary text
  accent: '#007AFF',      // Calm Blue for links/CTAs (iOS System Blue)
  accentDark: '#005bb5',  // Darker blue for pressed states
  
  // Semantic
  success: '#34C759',     // iOS Green
  warning: '#FF9500',     // iOS Orange
  error: '#FF3B30',       // iOS Red
  info: '#5AC8FA',        // iOS Light Blue
};

export const Surfaces = {
  background: '#FFFFFF',  // Pure white main background
  default: '#F9FAFB',     // Very soft gray for cards or alternate sections
  border: '#E5E7EB',      // Clean lines for separation
  
  // Modals/Overlays
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(229, 231, 235, 0.5)',
};

export const Typography = {
  fonts: {
    display: 'PlusJakartaSans_700Bold',
    h1: 'PlusJakartaSans_700Bold',
    h2: 'PlusJakartaSans_700Bold',
    h3: 'PlusJakartaSans_600SemiBold',
    h4: 'PlusJakartaSans_500Medium',
    bodyLg: 'DMSans_400Regular',
    body: 'DMSans_400Regular',
    bodySm: 'DMSans_400Regular',
    caption: 'DMSans_500Medium',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 4,
  DEFAULT: 8,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
};

// Extremely subtle shadows for the professional flat look
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  DEFAULT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};
