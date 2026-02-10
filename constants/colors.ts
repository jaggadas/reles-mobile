/**
 * Reles Brand Colors
 *
 * Single source of truth for all colors in the app.
 * Derived from the Reles branding guide.
 */

// ─── Raw Palette ───────────────────────────────────────────────
export const palette = {
  cream:       '#F5E6D3',
  creamLight:  '#FAF3EB',
  creamDark:   '#EDD9C4',
  pink:        '#E8C4C4',
  pinkLight:   '#F2DEDE',
  burgundy:    '#8B1A1A',
  burgundyDark:'#6E1414',
  deepRed:     '#9B1B30',
  terracotta:  '#C2613A',
  orange:      '#E88A2D',
  olive:       '#5C6B3C',
  oliveDark:   '#4B5630',
  darkTeal:    '#1A3A3A',
  darkTealLight:'#2A5050',
  white:       '#FFFFFF',
  black:       '#111111',
  gray50:      '#F9FAFB',
  gray100:     '#F3F4F6',
  gray200:     '#E5E7EB',
  gray300:     '#D1D5DB',
  gray400:     '#9CA3AF',
  gray500:     '#6B7280',
  gray600:     '#4B5563',
  gray700:     '#374151',
  gray800:     '#1F2937',
  gray900:     '#111827',
  transparent: 'transparent',
} as const;

// ─── Semantic Tokens (light mode only) ────────────────────────
export const colors = {
  // Surfaces — warm cream background with white cards
  background:       palette.creamLight,
  surface:          palette.white,
  card:             palette.white,
  cardElevated:     palette.white,
  inputBackground:  palette.white,

  // Text
  text:             palette.gray900,
  textSecondary:    palette.gray500,
  textMuted:        palette.gray400,
  textOnPrimary:    palette.white,

  // Brand
  primary:          palette.burgundy,
  primaryDark:      palette.burgundyDark,
  primaryLight:     '#F3E8E8',
  accent:           palette.terracotta,
  link:             palette.burgundy,

  // Semantic
  success:          palette.olive,
  successLight:     '#F0F5EB',
  error:            palette.deepRed,
  errorLight:       '#FEF2F2',
  warning:          palette.orange,
  warningLight:     '#FEF3C7',
  warningText:      '#92400E',

  // UI — slightly stronger borders for visible line aesthetic
  border:           palette.gray300,
  borderLight:      palette.gray200,
  separator:        palette.gray200,
  icon:             palette.gray500,
  tabIconDefault:   palette.gray400,
  tabIconSelected:  palette.burgundy,
  tint:             palette.burgundy,

  // Progress
  progressTrack:    palette.gray200,
  progressFill:     palette.burgundy,

  // Specific
  checkboxChecked:  palette.olive,
  checkboxUnchecked: palette.gray300,
  celebrationBg:    palette.olive,
  deleteText:       palette.deepRed,
  deleteBorder:     '#FECACA',
  deleteBg:         '#FEF2F2',
  allergenBg:       '#FEF3C7',
  allergenIcon:     '#D97706',
  allergenText:     '#92400E',
  stepCircle:       palette.burgundy,

  // Category cards
  categoryBg:       palette.white,
} as const;

// ─── Spacing ───────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  xxl: 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// ─── Radius ────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Typography ────────────────────────────────────────────────
export const typography = {
  family: {
    heading: 'Typewriter',
    headingBold: 'Typewriter',
    body: 'Napzer',
    bodyMedium: 'Napzer',
    bodySemibold: 'Napzer',
    bodyBold: 'Napzer',
  } as const,
  size: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 24,
    '5xl': 28,
    '6xl': 32,
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

// ─── Shadows ───────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
