import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import * as Clipboard from 'expo-clipboard';

import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { GroceryItemRow } from '@/components/GroceryItemRow';
import { AisleSection } from '@/components/AisleSection';
import { Button, EmptyState } from '@/components/ui';
import type { AisleCategory, GroceryItem } from '@/lib/types';
import { AISLE_ORDER } from '@/lib/aisles';
import {
  getGroceryList,
  toggleGroceryItemChecked,
  clearCheckedItems,
  clearGroceryList,
  removeGroceryItem,
} from '@/lib/storage';
import { createInstacartGroceryLink } from '@/lib/api';

interface Section {
  aisle: AisleCategory;
  data: GroceryItem[];
}

export default function GroceryScreen() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background',
  );
  const borderColor = useThemeColor(
    { light: colors.light.borderLight, dark: colors.dark.borderLight },
    'text',
  );
  const celebrationBg = useThemeColor(
    { light: colors.light.celebrationBg, dark: colors.dark.celebrationBg },
    'tint',
  );
  const primaryColor = useThemeColor(
    { light: colors.light.primary, dark: colors.dark.primary },
    'tint',
  );

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  async function loadItems() {
    const list = await getGroceryList();
    setItems(list);
  }

  const sections: Section[] = AISLE_ORDER
    .map((aisle) => ({
      aisle,
      data: items.filter((i) => i.aisle === aisle),
    }))
    .filter((s) => s.data.length > 0);

  const checkedCount = items.filter((i) => i.checked).length;
  const allDone = items.length > 0 && checkedCount === items.length;

  async function handleToggle(itemId: string) {
    await toggleGroceryItemChecked(itemId);
    await loadItems();
  }

  function handleLongPress(item: GroceryItem) {
    const sourceNames = item.sources.map((s) => s.recipeTitle);
    const message = `From: ${sourceNames.join(', ')}\nQuantity: ${item.displayQuantity || 'N/A'}`;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.name,
          message,
          options: ['Cancel', 'Remove Item'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await removeGroceryItem(item.id);
            await loadItems();
          }
        }
      );
    } else {
      Alert.alert(
        item.name,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              await removeGroceryItem(item.id);
              await loadItems();
            },
          },
        ]
      );
    }
  }

  async function handleInstacart() {
    const unchecked = items.filter((i) => !i.checked);
    if (unchecked.length === 0) {
      Alert.alert('No items', 'All items are checked off.');
      return;
    }

    setIsLoading(true);
    try {
      const url = await createInstacartGroceryLink(unchecked);
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to open Instacart');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyList() {
    const unchecked = items.filter((i) => !i.checked);
    const text = unchecked
      .map((i) => (i.displayQuantity ? `${i.displayQuantity} ${i.name}` : i.name))
      .join('\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Grocery list copied to clipboard.');
  }

  function handleOverflow() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Clear Checked', 'Clear All'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await clearCheckedItems();
            await loadItems();
          } else if (buttonIndex === 2) {
            Alert.alert('Clear All', 'Remove all grocery items?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear All',
                style: 'destructive',
                onPress: async () => {
                  await clearGroceryList();
                  await loadItems();
                },
              },
            ]);
          }
        }
      );
    } else {
      Alert.alert(
        'Options',
        undefined,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear Checked',
            onPress: async () => {
              await clearCheckedItems();
              await loadItems();
            },
          },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              await clearGroceryList();
              await loadItems();
            },
          },
        ]
      );
    }
  }

  if (items.length === 0) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: bgColor }]}>
        <EmptyState
          icon="shopping-cart"
          title="Grocery List Empty"
          subtitle="Add ingredients from your recipes to build a grocery list."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: bgColor }]}>
      {allDone && (
        <View style={[styles.celebrationBanner, { backgroundColor: celebrationBg }]}>
          <Text style={styles.celebrationText}>All done! Great shopping!</Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroceryItemRow
            item={item}
            onToggle={() => handleToggle(item.id)}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <AisleSection aisle={(section as Section).aisle} />
        )}
        stickySectionHeadersEnabled
      />

      <View style={[styles.toolbar, { borderTopColor: borderColor }]}>
        <Button
          title="Instacart"
          icon="shopping-bag"
          onPress={handleInstacart}
          loading={isLoading}
          flex
        />
        <Button
          title="Copy"
          icon="content-copy"
          onPress={handleCopyList}
          variant="secondary"
        />
        <Pressable onPress={handleOverflow} style={[styles.overflowButton, { borderColor }]}>
          <MaterialIcons name="more-horiz" size={18} color={primaryColor as string} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  celebrationBanner: {
    padding: spacing.md,
    alignItems: 'center',
  },
  celebrationText: {
    color: '#fff',
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  overflowButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
