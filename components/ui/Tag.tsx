import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, radius, spacing, typography } from '@/constants/colors';

interface TagProps {
  label: string;
  variant?: 'filled' | 'outlined';
}

export function Tag({ label, variant = 'filled' }: TagProps) {
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text',
  );
  const filledBg = useThemeColor(
    { light: colors.light.inputBackground, dark: colors.dark.inputBackground },
    'background',
  );
  const borderColor = useThemeColor(
    { light: colors.light.borderLight, dark: colors.dark.borderLight },
    'text',
  );

  const isOutlined = variant === 'outlined';

  return (
    <View
      style={[
        styles.tag,
        isOutlined
          ? { backgroundColor: 'transparent', borderWidth: 1, borderColor }
          : { backgroundColor: filledBg },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  text: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
});
