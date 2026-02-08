import { Platform } from 'react-native';
import { colors } from './colors';

export const Colors = {
  light: {
    text: colors.light.text,
    background: colors.light.background,
    tint: colors.light.tint,
    icon: colors.light.icon,
    tabIconDefault: colors.light.tabIconDefault,
    tabIconSelected: colors.light.tabIconSelected,
  },
  dark: {
    text: colors.dark.text,
    background: colors.dark.background,
    tint: colors.dark.tint,
    icon: colors.dark.icon,
    tabIconDefault: colors.dark.tabIconDefault,
    tabIconSelected: colors.dark.tabIconSelected,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
