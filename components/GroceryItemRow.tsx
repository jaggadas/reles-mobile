import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { GroceryItem } from '@/lib/types';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  item: GroceryItem;
  onToggle: () => void;
  onLongPress: () => void;
}

export function GroceryItemRow({ item, onToggle, onLongPress }: Props) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');

  return (
    <Pressable onPress={onToggle} onLongPress={onLongPress} style={styles.row}>
      <MaterialIcons
        name={item.checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={item.checked ? '#22c55e' : '#9ca3af'}
      />
      <View style={styles.content}>
        <Text
          style={[
            styles.name,
            { color: textColor },
            item.checked && styles.checkedText,
          ]}
        >
          {item.name}
        </Text>
        {item.displayQuantity ? (
          <Text
            style={[
              styles.quantity,
              { color: subtextColor },
              item.checked && styles.checkedText,
            ]}
          >
            {item.displayQuantity}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  quantity: {
    fontSize: 13,
    marginTop: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
});
