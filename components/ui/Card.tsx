import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, radius, spacing } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const bg = useThemeColor(
    { light: colors.light.card, dark: colors.dark.card },
    'background',
  );
  const borderColor = useThemeColor(
    { light: colors.light.borderLight, dark: colors.dark.borderLight },
    'text',
  );

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
});
