import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatTime } from '@/lib/format';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface Props {
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  caloriesKcal?: number;
}

export function MetadataCard({ servings, prepTimeMinutes, cookTimeMinutes, caloriesKcal }: Props) {
  const cardBg = useThemeColor(
    { light: colors.light.card, dark: colors.dark.card },
    'background',
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text',
  );
  const subtextColor = useThemeColor(
    { light: colors.light.textSecondary, dark: colors.dark.textSecondary },
    'text',
  );
  const borderColor = useThemeColor(
    { light: colors.light.borderLight, dark: colors.dark.borderLight },
    'text',
  );
  const accentColor = useThemeColor(
    { light: colors.light.accent, dark: colors.dark.accent },
    'tint',
  );

  const items: { icon: string; label: string; value: string }[] = [];

  if (servings) {
    items.push({ icon: 'people', label: 'Servings', value: `${servings}` });
  }
  if (prepTimeMinutes) {
    items.push({ icon: 'timer', label: 'Prep', value: formatTime(prepTimeMinutes) });
  }
  if (cookTimeMinutes) {
    items.push({ icon: 'local-fire-department', label: 'Cook', value: formatTime(cookTimeMinutes) });
  }
  if (caloriesKcal) {
    items.push({ icon: 'bolt', label: 'Calories', value: `${caloriesKcal} kcal` });
  }

  if (items.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <MaterialIcons name={item.icon as any} size={20} color={accentColor as string} />
          <Text style={[styles.value, { color: textColor }]}>{item.value}</Text>
          <Text style={[styles.label, { color: subtextColor }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  item: {
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  label: {
    fontSize: typography.size.xs,
  },
});
