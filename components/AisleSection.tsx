import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AisleCategory } from '@/lib/types';
import { AISLE_LABELS, AISLE_EMOJI } from '@/lib/aisles';
import { colors, spacing, typography } from '@/constants/colors';

interface Props {
  aisle: AisleCategory;
}

export function AisleSection({ aisle }: Props) {
  const textColor = colors.text;
  const bgColor = colors.inputBackground;

  return (
    <View style={[styles.header, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {AISLE_EMOJI[aisle]} {AISLE_LABELS[aisle]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
});
