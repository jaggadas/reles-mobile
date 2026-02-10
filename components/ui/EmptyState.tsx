import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, spacing, typography } from '@/constants/colors';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

/**
 * Centralized empty state component.
 * TODO: IMAGE REPLACEMENT PENDING — Replace MaterialIcons with branded Reles illustrations.
 */
export function EmptyState({ icon, title, subtitle, children }: EmptyStateProps) {
  const textColor = colors.text;
  const mutedColor = colors.textMuted;
  const iconColor = colors.border;

  return (
    <View style={styles.container}>
      {/* TODO: IMAGE REPLACEMENT PENDING — Swap icon for branded Reles illustration */}
      <MaterialIcons name={icon} size={64} color={iconColor} />
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: mutedColor }]}>{subtitle}</Text>
      {children}
    </View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.size['3xl'],
    fontFamily: f.headingBold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    textAlign: 'center',
    lineHeight: 20,
  },
});
