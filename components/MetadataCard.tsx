import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatTime } from '@/lib/format';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface Props {
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  caloriesKcal?: number;
}

export function MetadataCard({ servings, prepTimeMinutes, cookTimeMinutes, caloriesKcal }: Props) {
  const cardBg = colors.card;
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const borderColor = colors.borderLight;
  const accentColor = colors.accent;

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
          <MaterialIcons name={item.icon as any} size={20} color={accentColor} />
          <Text style={[styles.value, { color: textColor }]}>{item.value}</Text>
          <Text style={[styles.label, { color: subtextColor }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const f = typography.family;

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
    fontFamily: f.bodySemibold,
  },
  label: {
    fontSize: typography.size.xs,
    fontFamily: f.body,
  },
});
