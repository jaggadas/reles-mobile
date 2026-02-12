import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { GroceryItem } from '@/lib/types';
import { colors, spacing, typography } from '@/constants/colors';

interface Props {
  item: GroceryItem;
  onToggle: () => void;
  onLongPress: () => void;
}

export function GroceryItemRow({ item, onToggle, onLongPress }: Props) {
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const checkedColor = colors.primary;
  const uncheckedColor = colors.checkboxUnchecked;

  return (
    <Pressable onPress={onToggle} onLongPress={onLongPress} style={styles.row}>
      <MaterialIcons
        name={item.checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={item.checked ? checkedColor : uncheckedColor}
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bodySemibold,
    color: colors.text,
  },
  quantity: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.body,
    color: colors.textSecondary,
    marginTop: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
});
