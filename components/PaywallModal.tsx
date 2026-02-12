import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';

import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { FREE_WEEKLY_LIMIT } from '@/lib/subscription';

interface PaywallModalProps {
  visible: boolean;
  onPurchased: () => void;
  onContinueFree: () => void;
}

export function PaywallModal({ visible, onPurchased, onContinueFree }: PaywallModalProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setSelectedIndex(0);

    Purchases.getOfferings()
      .then((offerings) => {
        const current = offerings.current;
        if (current) {
          setPackages(current.availablePackages);
        }
      })
      .catch((e) => console.warn('Failed to fetch offerings:', e))
      .finally(() => setLoading(false));
  }, [visible]);

  const handlePurchase = async () => {
    const pkg = packages[selectedIndex];
    if (!pkg) return;

    setPurchasing(true);
    try {
      await Purchases.purchasePackage(pkg);
      onPurchased();
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Purchase failed', e.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const info = await Purchases.restorePurchases();
      const hasEntitlement = Object.keys(info.entitlements.active).length > 0;
      if (hasEntitlement) {
        onPurchased();
      } else {
        Alert.alert('No purchases found', 'We couldn\'t find any previous subscriptions for this account.');
      }
    } catch (e: any) {
      Alert.alert('Restore failed', e.message ?? 'Something went wrong.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 32 }} />
          <Text style={styles.headerTitle}>Upgrade to Pro</Text>
          <Pressable onPress={onContinueFree} hitSlop={12}>
            <MaterialIcons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Hero */}
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <MaterialIcons name="workspace-premium" size={56} color={colors.primary} />
          </View>
          <Text style={styles.title}>
            Unlock Reles Pro
          </Text>
          <Text style={styles.subtitle}>
            Get 50 recipe extractions per week and unlock the full experience.
          </Text>

          {/* Package options */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
          ) : (
            <View style={styles.packagesContainer}>
              {packages.map((pkg, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Pressable
                    key={pkg.identifier}
                    onPress={() => setSelectedIndex(index)}
                    style={[
                      styles.packageCard,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={styles.packageRadio}>
                      <View
                        style={[
                          styles.radioOuter,
                          { borderColor: isSelected ? colors.primary : colors.border },
                        ]}
                      >
                        {isSelected && (
                          <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                    </View>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageTitle}>
                        {pkg.product.title}
                      </Text>
                      <Text style={styles.packageDescription}>
                        {pkg.product.description || 'Reles Pro subscription'}
                      </Text>
                    </View>
                    <Text style={styles.packagePrice}>
                      {pkg.product.priceString}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Subscribe button */}
          <Pressable
            onPress={handlePurchase}
            disabled={purchasing || loading || packages.length === 0}
            style={({ pressed }) => [
              styles.subscribeButton,
              { opacity: (pressed || purchasing) ? 0.8 : 1 },
            ]}
          >
            {purchasing ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.subscribeText}>
                Subscribe Now
              </Text>
            )}
          </Pressable>

          {/* Continue free button */}
          <Pressable
            onPress={onContinueFree}
            disabled={purchasing}
            style={({ pressed }) => [
              styles.freeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.freeButtonText}>
              Continue on Free ({FREE_WEEKLY_LIMIT} recipes/week)
            </Text>
          </Pressable>

          {/* Restore */}
          <Pressable onPress={handleRestore} disabled={purchasing}>
            <Text style={styles.restoreText}>
              Restore Purchases
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size['5xl'],
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.size.xl,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  packagesContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  packageRadio: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  packageInfo: {
    flex: 1,
    gap: 2,
  },
  packageTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  packageDescription: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  packagePrice: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  subscribeButton: {
    width: '100%',
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  subscribeText: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textOnPrimary,
  },
  freeButton: {
    width: '100%',
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  restoreText: {
    fontSize: typography.size.sm,
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
});
