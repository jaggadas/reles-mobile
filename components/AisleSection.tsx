import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AisleCategory } from '@/lib/types';
import { AISLE_LABELS, AISLE_EMOJI } from '@/lib/aisles';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  aisle: AisleCategory;
}

export function AisleSection({ aisle }: Props) {
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({ light: '#f3f4f6', dark: '#1f2937' }, 'background');

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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
});
