import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { ExtractionPhase } from '@/lib/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface Props {
  phase: ExtractionPhase;
  error?: string | null;
}

const PHASE_LABELS: Record<ExtractionPhase, string> = {
  idle: '',
  fetching: 'Finding video...',
  'fetching-transcript': 'Getting transcript...',
  reading: 'Reading transcript...',
  extracting: 'Extracting recipe...',
  success: 'Recipe extracted!',
};

export function ExtractionCard({ phase, error }: Props) {
  const cardBg = useThemeColor(
    { light: colors.light.card, dark: colors.dark.card },
    'background',
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text',
  );
  const borderColor = useThemeColor(
    { light: colors.light.borderLight, dark: colors.dark.borderLight },
    'text',
  );
  const errorColor = useThemeColor(
    { light: colors.light.error, dark: colors.dark.error },
    'text',
  );
  const successColor = useThemeColor(
    { light: colors.light.success, dark: colors.dark.success },
    'text',
  );
  const progressTrack = useThemeColor(
    { light: colors.light.progressTrack, dark: colors.dark.progressTrack },
    'background',
  );
  const progressFill = useThemeColor(
    { light: colors.light.progressFill, dark: colors.dark.progressFill },
    'tint',
  );

  if (phase === 'idle' && !error) return null;

  const isLoading = phase !== 'idle' && phase !== 'success';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      {error ? (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      ) : (
        <View style={styles.row}>
          {isLoading && <ActivityIndicator size="small" style={styles.spinner} />}
          {phase === 'success' && <Text style={[styles.checkmark, { color: successColor }]}>&#10003;</Text>}
          <Text style={[styles.label, { color: textColor }]}>
            {PHASE_LABELS[phase]}
          </Text>
        </View>
      )}
      {isLoading && (
        <View style={[styles.progressBar, { backgroundColor: progressTrack }]}>
          <View style={[styles.progressFill, { width: getProgress(phase), backgroundColor: progressFill }]} />
        </View>
      )}
    </View>
  );
}

function getProgress(phase: ExtractionPhase): `${number}%` {
  switch (phase) {
    case 'fetching': return '20%';
    case 'fetching-transcript': return '40%';
    case 'reading': return '60%';
    case 'extracting': return '80%';
    case 'success': return '100%';
    default: return '0%';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: spacing.sm,
  },
  checkmark: {
    fontSize: typography.size['2xl'],
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
  },
  errorText: {
    fontSize: typography.size.base,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
