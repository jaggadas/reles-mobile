import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';

export default function TrialWelcomeScreen() {
  const router = useRouter();
  const { dismissTrialWelcome } = useSubscription();

  const handleContinue = async () => {
    await dismissTrialWelcome();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
          <MaterialIcons name="workspace-premium" size={64} color={colors.success} />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Welcome to Reles Pro!
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Your free trial has been activated. Enjoy Pro features for a week!
        </Text>

        {/* Features card */}
        <View style={styles.featuresCard}>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: colors.success }]} />
            <Text style={styles.featureText}>
              10 recipe extractions
            </Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: colors.success }]} />
            <Text style={styles.featureText}>
              Valid for 7 days
            </Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: colors.success }]} />
            <Text style={styles.featureText}>
              No credit card required
            </Text>
          </View>
        </View>

        {/* Subtle note */}
        <Text style={styles.note}>
          After your trial ends, you can continue with the free plan or upgrade to Pro.
        </Text>
      </View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>
            Start Cooking
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.textOnPrimary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.size['5xl'],
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.md,
    color: colors.text,
  },
  description: {
    fontSize: typography.size.xl,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
    color: colors.textSecondary,
  },
  featuresCard: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.card,
    ...shadows.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
    color: colors.text,
  },
  note: {
    fontSize: typography.size.base,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textOnPrimary,
  },
});
