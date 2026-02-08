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
  transparent: 'transparent',
} as const;

// ─── Semantic Tokens ───────────────────────────────────────────
export const colors = {
  light: {
    // Surfaces
    background:       palette.creamLight,
    surface:          palette.white,
    card:             palette.white,
    inputBackground:  palette.cream,

    // Text
    text:             palette.darkTeal,
    textSecondary:    '#6B7280',
    textMuted:        '#9CA3AF',
    textOnPrimary:    palette.creamLight,

    // Brand
    primary:          palette.burgundy,
    primaryDark:      palette.burgundyDark,
    accent:           palette.terracotta,
    link:             palette.burgundy,

    // Semantic
    success:          palette.olive,
    successLight:     '#ECF0E4',
    error:            palette.deepRed,
    errorLight:       '#FEF2F2',
    warning:          palette.orange,
    warningLight:     '#FEF3C7',
    warningText:      '#92400E',

    // UI
    border:           '#D4B5A0',
    borderLight:      '#E8D5C4',
    separator:        '#E8D5C4',
    icon:             '#6B7280',
    tabIconDefault:   '#9CA3AF',
    tabIconSelected:  palette.burgundy,
    tint:             palette.burgundy,

    // Progress
    progressTrack:    palette.cream,
    progressFill:     palette.burgundy,

    // Specific
    checkboxChecked:  palette.olive,
    checkboxUnchecked:'#9CA3AF',
    celebrationBg:    palette.olive,
    deleteText:       palette.deepRed,
    deleteBorder:     '#FECACA',
    deleteBg:         '#FEF2F2',
    allergenBg:       '#FEF3C7',
    allergenIcon:     '#D97706',
    allergenText:     '#92400E',
    stepCircle:       palette.burgundy,
  },

  dark: {
    // Surfaces
    background:       '#151718',
    surface:          '#1F2937',
    card:             '#1F2937',
    inputBackground:  '#1F2937',

    // Text
    text:             '#ECEDEE',
    textSecondary:    '#9CA3AF',
    textMuted:        '#6B7280',
    textOnPrimary:    '#ECEDEE',

    // Brand
    primary:          '#D4736A',
    primaryDark:      '#B85C54',
    accent:           palette.terracotta,
    link:             '#D4736A',

    // Semantic
    success:          '#7C9A5E',
    successLight:     '#1F2F1A',
    error:            '#EF4444',
    errorLight:       '#2D1B1B',
    warning:          palette.orange,
    warningLight:     '#2D2410',
    warningText:      '#FCD34D',

    // UI
    border:           '#374151',
    borderLight:      '#2A3340',
    separator:        '#374151',
    icon:             '#9BA1A6',
    tabIconDefault:   '#9BA1A6',
    tabIconSelected:  '#D4736A',
    tint:             '#D4736A',

    // Progress
    progressTrack:    '#374151',
    progressFill:     '#D4736A',

    // Specific
    checkboxChecked:  '#7C9A5E',
    checkboxUnchecked:'#6B7280',
    celebrationBg:    '#7C9A5E',
    deleteText:       '#EF4444',
    deleteBorder:     '#5C2626',
    deleteBg:         '#2D1B1B',
    allergenBg:       '#2D2410',
    allergenIcon:     '#FCD34D',
    allergenText:     '#FCD34D',
    stepCircle:       '#D4736A',
  },
} as const;

// ─── Spacing ───────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
} as const;

// ─── Radius ────────────────────────────────────────────────────
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ─── Typography ────────────────────────────────────────────────
export const typography = {
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
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
