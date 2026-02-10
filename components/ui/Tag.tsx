import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/colors';

interface TagProps {
  label: string;
  variant?: 'filled' | 'outlined';
}

export function Tag({ label, variant = 'filled' }: TagProps) {
  const textColor = colors.text;
  const filledBg = colors.inputBackground;
  const borderColor = colors.borderLight;

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

const f = typography.family;

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  text: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    fontFamily: f.bodyMedium,
  },
});
