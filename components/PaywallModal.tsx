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
        {/* Nav */}
        <View style={styles.nav}>
          <View style={{ width: 40 }} />
          <View style={{ flex: 1 }} />
          <Pressable onPress={onContinueFree} hitSlop={12} style={styles.closeButton}>
            <MaterialIcons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.pageTitle}>Reles Pro</Text>
            <View style={styles.rule} />
          </View>
          <Text style={styles.pageSubtitle}>
            Unlock the full experience
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Hero icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="workspace-premium" size={36} color={colors.success} />
          </View>

          {/* Features card */}
          <View style={styles.featuresCard}>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>50 recipe extractions per week</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Full access to all features</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Priority support</Text>
            </View>
          </View>

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
                        backgroundColor: isSelected ? colors.primaryLight : colors.card,
                        borderColor: isSelected ? colors.primary : colors.borderLight,
                        borderWidth: isSelected ? 1.5 : 1,
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
              (purchasing || loading || packages.length === 0) && { opacity: 0.45 },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            ) : (
              <>
                <Text style={styles.subscribeText}>Subscribe Now</Text>
                <MaterialIcons name="arrow-forward" size={20} color={colors.textOnPrimary} />
              </>
            )}
          </Pressable>

          {/* Continue free + Restore */}
          <Pressable
            onPress={onContinueFree}
            disabled={purchasing}
            style={({ pressed }) => pressed && { opacity: 0.6 }}
          >
            <Text style={styles.freeButtonText}>
              Continue on Free ({FREE_WEEKLY_LIMIT} recipes/week)
            </Text>
          </Pressable>

          <Pressable onPress={handleRestore} disabled={purchasing}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Page Header ────────────────────────────────────────
  pageHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pageTitle: {
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
  pageSubtitle: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.textSecondary,
  },

  // ── Content ────────────────────────────────────────────
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.successLight,
  },

  // ── Features Card ──────────────────────────────────────
  featuresCard: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  featureText: {
    fontSize: typography.size.lg,
    fontFamily: f.bodyMedium,
    fontWeight: typography.weight.medium,
    color: colors.text,
  },

  // ── Packages ───────────────────────────────────────────
  packagesContainer: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
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
    fontFamily: f.bodySemibold,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  packageDescription: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
    color: colors.textSecondary,
  },
  packagePrice: {
    fontSize: typography.size['2xl'],
    fontFamily: f.bodyBold,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },

  // ── Footer ─────────────────────────────────────────────
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  subscribeButton: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
  },
  subscribeText: {
    fontSize: typography.size.xl,
    fontFamily: f.bodyBold,
    color: colors.textOnPrimary,
  },
  freeButtonText: {
    fontSize: typography.size.lg,
    fontFamily: f.bodySemibold,
    color: colors.primary,
  },
  restoreText: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
});
