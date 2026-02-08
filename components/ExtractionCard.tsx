import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { ExtractionPhase } from '@/lib/types';
import { useThemeColor } from '@/hooks/use-theme-color';

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
  const cardBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  if (phase === 'idle' && !error) return null;

  const isLoading = phase !== 'idle' && phase !== 'success';

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {error ? (
        <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
      ) : (
        <View style={styles.row}>
          {isLoading && <ActivityIndicator size="small" style={styles.spinner} />}
          {phase === 'success' && <Text style={styles.checkmark}>&#10003;</Text>}
          <Text style={[styles.label, { color: textColor }]}>
            {PHASE_LABELS[phase]}
          </Text>
        </View>
      )}
      {isLoading && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: getProgress(phase) }]} />
        </View>
      )}
    </View>
  );
}

function getProgress(phase: ExtractionPhase): string {
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
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  checkmark: {
    fontSize: 18,
    color: '#22c55e',
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 2,
  },
});
