import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, typography } from '@/constants/colors';

interface Props {
  greeting: { greeting: string; subtitle: string };
  query: string;
  onChangeQuery: (text: string) => void;
  onSubmitSearch: () => void;
  onClearQuery: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}

export function GreetingSection({
  greeting,
  query,
  onChangeQuery,
  onSubmitSearch,
  onClearQuery,
  inputRef,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>{greeting.greeting}</Text>
      <Text style={styles.greetingSubtext}>{greeting.subtitle}</Text>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.5)" />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search Recipe / Paste YouTube URL"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={query}
          onChangeText={onChangeQuery}
          onSubmitEditing={onSubmitSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={onClearQuery} hitSlop={8}>
            <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.5)" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
  },
  greetingText: {
    fontFamily: f.heading,
    fontSize: typography.size['4xl'],
    fontVariant: ['no-common-ligatures'],
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  greetingSubtext: {
    fontFamily: f.body,
    fontSize: typography.size.lg,
    marginTop: spacing.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    height: 48,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontFamily: f.body,
    fontSize: typography.size.lg,
    height: '100%',
    color: '#FFFFFF',
  },
});
