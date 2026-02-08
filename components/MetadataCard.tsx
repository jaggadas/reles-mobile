import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatTime } from '@/lib/format';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  caloriesKcal?: number;
}

export function MetadataCard({ servings, prepTimeMinutes, cookTimeMinutes, caloriesKcal }: Props) {
  const cardBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');

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
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <MaterialIcons name={item.icon as any} size={20} color="#0a7ea4" />
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
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  item: {
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
  },
});
