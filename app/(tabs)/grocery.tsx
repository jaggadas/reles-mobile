import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';

import { colors, spacing, radius, typography, shadows, palette } from '@/constants/colors';
import { EmptyState, Button } from '@/components/ui';
import { GroceryItemRow } from '@/components/GroceryItemRow';
import { AISLE_ORDER, AISLE_LABELS, AISLE_EMOJI } from '@/lib/aisles';
import {
  getGroceryList,
  toggleGroceryItemChecked,
  clearCheckedItems,
  clearGroceryList,
  removeGroceryItem,
} from '@/lib/storage';
import { createInstacartGroceryLink } from '@/lib/api';
import type { AisleCategory, GroceryItem } from '@/lib/types';

// ── Section Header (matches homepage / recipe detail pattern) ────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.rule} />
      </View>
    </View>
  );
}

export default function GroceryScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { top: safeTop } = useSafeAreaInsets();

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [instacartLoading, setInstacartLoading] = useState(false);

  const refresh = useCallback(async () => {
    const list = await getGroceryList();
    setItems(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleToggle = async (id: string) => {
    await toggleGroceryItemChecked(id);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleRemoveItem = async (id: string) => {
    await removeGroceryItem(id);
    setSelectedItem(null);
    await refresh();
  };

  const handleClearChecked = async () => {
    await clearCheckedItems();
    setMenuOpen(false);
    await refresh();
  };

  const handleClearAll = () => {
    setMenuOpen(false);
    Alert.alert(
      'Clear grocery list?',
      `This will remove all ${items.length} items from your list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearGroceryList();
            await refresh();
          },
        },
      ]
    );
  };

  const handleCopyList = async () => {
    const text = items
      .map(
        (i) =>
          `${i.displayQuantity && i.displayQuantity.toLowerCase() !== 'as needed' ? `${i.displayQuantity} ` : ''}${i.name}`
      )
      .join('\n');
    await Clipboard.setStringAsync(text);
    setMenuOpen(false);
  };

  const handleInstacart = async () => {
    setInstacartLoading(true);
    try {
      const url = await createInstacartGroceryLink(items);
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create Instacart list');
    } finally {
      setInstacartLoading(false);
    }
  };

  const sections = useMemo(() => {
    const map = new Map<AisleCategory, GroceryItem[]>();
    for (const item of items) {
      const list = map.get(item.aisle) ?? [];
      list.push(item);
      map.set(item.aisle, list);
    }
    return AISLE_ORDER
      .filter((aisle) => (map.get(aisle) ?? []).length > 0)
      .map((aisle) => ({
        aisle,
        data: map.get(aisle)!,
      }));
  }, [items]);

  const checkedCount = items.filter((i) => i.checked).length;
  const allDone = items.length > 0 && checkedCount === items.length;

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="shopping-cart"
          title="Your list is empty"
          subtitle="Add ingredients from your recipes to start building your shopping list."
        >
          <Button
            title="Browse Recipes"
            variant="secondary"
            onPress={() => router.navigate('/(tabs)/recipes')}
            style={{ marginTop: spacing.md }}
          />
        </EmptyState>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.aisleHeader}>
            <SectionHeader
              title={`${AISLE_EMOJI[section.aisle]} ${AISLE_LABELS[section.aisle]}`}
            />
          </View>
        )}
        renderItem={({ item }) => (
          <GroceryItemRow
            item={item}
            onToggle={() => handleToggle(item.id)}
            onLongPress={() => setSelectedItem(item)}
          />
        )}
        ListHeaderComponent={
          <View style={[styles.listHeader, { paddingTop: safeTop + spacing.lg }]}>
            {/* Page title + overflow */}
            <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>Grocery List</Text>
              <Pressable
                onPress={() => setMenuOpen(true)}
                style={styles.overflowButton}
                hitSlop={12}
              >
                <MaterialIcons name="more-vert" size={22} color={colors.text} />
              </Pressable>
            </View>

            {/* Item count */}
            <Text style={styles.itemCount}>
              {items.length} item{items.length !== 1 ? 's' : ''}
              {checkedCount > 0 ? ` · ${checkedCount} checked` : ''}
            </Text>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Button
                title={instacartLoading ? 'Creating...' : 'Add to Instacart'}
                icon="open-in-new"
                variant="primary"
                onPress={handleInstacart}
                loading={instacartLoading}
                flex
              />
              <Pressable
                onPress={handleCopyList}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <MaterialIcons name="content-copy" size={20} color={colors.primary} />
              </Pressable>
            </View>

            {/* All done celebration */}
            {allDone && (
              <View style={styles.allDone}>
                <View style={styles.allDoneIcon}>
                  <MaterialIcons name="check" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.allDoneText}>All done!</Text>
                <Button
                  title="Clear List"
                  variant="primary"
                  onPress={async () => {
                    await clearGroceryList();
                    await refresh();
                  }}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            )}
          </View>
        }
        contentContainerStyle={{ paddingBottom: tabBarHeight + spacing.lg }}
        stickySectionHeadersEnabled={false}
      />

      {/* Overflow menu modal */}
      {menuOpen && (
        <Modal transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
            <View style={[styles.menuDropdown, { top: safeTop + spacing.sm + 44 }]}>
              <Pressable
                onPress={handleCopyList}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: palette.gray50 },
                ]}
              >
                <MaterialIcons name="content-copy" size={18} color={colors.text} />
                <Text style={styles.menuItemText}>Copy list</Text>
              </Pressable>

              {checkedCount > 0 && (
                <Pressable
                  onPress={handleClearChecked}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: palette.gray50 },
                  ]}
                >
                  <MaterialIcons name="check" size={18} color={colors.text} />
                  <Text style={styles.menuItemText}>
                    Clear {checkedCount} checked item{checkedCount !== 1 ? 's' : ''}
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: palette.gray50 },
                ]}
              >
                <MaterialIcons name="delete-outline" size={18} color={colors.deleteText} />
                <Text style={styles.menuItemTextDestructive}>Clear all items</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Item detail sheet */}
      {selectedItem && (
        <Modal transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}>
          <Pressable style={styles.sheetOverlay} onPress={() => setSelectedItem(null)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              {/* Handle bar */}
              <View style={styles.sheetHandle} />

              {/* Item name */}
              <Text style={styles.sheetTitle}>
                {selectedItem.displayQuantity &&
                selectedItem.displayQuantity.toLowerCase() !== 'as needed'
                  ? `${selectedItem.name}, ${selectedItem.displayQuantity}`
                  : selectedItem.name}
              </Text>

              <View style={styles.sheetDivider} />

              {/* Source recipes */}
              {selectedItem.sources.length > 0 && (
                <>
                  <Text style={styles.sheetLabel}>From:</Text>
                  {selectedItem.sources.map((source) => (
                    <Pressable
                      key={source.recipeId}
                      onPress={() => {
                        setSelectedItem(null);
                        router.push(`/recipe/${source.recipeId}`);
                      }}
                    >
                      <Text style={styles.sheetSourceLink}>
                        {selectedItem.sources.length > 1 ? '• ' : ''}
                        {source.recipeTitle}
                      </Text>
                    </Pressable>
                  ))}
                  <View style={styles.sheetDivider} />
                </>
              )}

              {/* Remove action */}
              <Pressable
                onPress={() => handleRemoveItem(selectedItem.id)}
                style={({ pressed }) => [
                  styles.sheetAction,
                  pressed && { backgroundColor: palette.gray50 },
                ]}
              >
                <MaterialIcons name="delete-outline" size={20} color={colors.deleteText} />
                <Text style={styles.sheetActionTextDestructive}>Remove from list</Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedItem(null)}
                style={styles.sheetCancel}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── List header (page title area) ─────────────────────────
  listHeader: {
    paddingHorizontal: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: typography.size['5xl'],
    fontFamily: f.headingBold,
    fontVariant: ['no-common-ligatures'],
    color: colors.text,
    lineHeight: 34,
  },
  overflowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },

  // ── Action buttons ────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── All done ──────────────────────────────────────────────
  allDone: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  allDoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.celebrationBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allDoneText: {
    fontSize: typography.size['3xl'],
    fontFamily: f.headingBold,
    fontVariant: ['no-common-ligatures'],
    color: colors.text,
  },

  // ── Section headers (matches homepage / recipe detail) ────
  aisleHeader: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  sectionTitle: {
    fontFamily: f.headingBold,
    fontSize: typography.size['3xl'],
    fontVariant: ['no-common-ligatures'],
    color: colors.primary,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  // ── Overflow menu (matches recipe detail) ─────────────────
  menuOverlay: {
    flex: 1,
  },
  menuDropdown: {
    position: 'absolute',
    right: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    minWidth: 200,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuItemText: {
    fontSize: typography.size.base,
    fontFamily: f.bodyMedium,
    color: colors.text,
  },
  menuItemTextDestructive: {
    fontSize: typography.size.base,
    fontFamily: f.bodyMedium,
    color: colors.deleteText,
  },

  // ── Item detail sheet ─────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    fontSize: typography.size['2xl'],
    fontFamily: f.headingBold,
    fontVariant: ['no-common-ligatures'],
    color: colors.text,
    marginBottom: spacing.md,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  sheetLabel: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sheetSourceLink: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.primary,
    paddingVertical: 2,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sheetActionTextDestructive: {
    fontSize: typography.size.lg,
    fontFamily: f.bodyMedium,
    color: colors.deleteText,
  },
  sheetCancel: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  sheetCancelText: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.textSecondary,
  },
});
