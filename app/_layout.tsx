import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { extractVideoId } from '@/lib/api';

const RelesLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.light.primary,
    background: colors.light.background,
    card: colors.light.surface,
    text: colors.light.text,
    border: colors.light.borderLight,
    notification: colors.light.accent,
  },
};

const RelesDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.dark.primary,
    background: colors.dark.background,
    card: colors.dark.surface,
    text: colors.dark.text,
    border: colors.dark.borderLight,
    notification: colors.dark.accent,
  },
};

function RootNavigator() {
  const { status, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'logged_out' && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (status === 'onboarding' && !inAuthGroup) {
      router.replace('/(auth)/onboarding-cuisines');
    } else if (status === 'logged_in' && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [status, isLoading, segments]);

  // Handle YouTube share intent
  useEffect(() => {
    if (!hasShareIntent || status !== 'logged_in') return;

    const sharedText = shareIntent.text ?? shareIntent.webUrl;
    if (!sharedText) return;

    const videoId = extractVideoId(sharedText);
    if (videoId) {
      router.navigate({ pathname: '/(tabs)', params: { url: sharedText } });
    }
    resetShareIntent();
  }, [hasShareIntent, status]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            title: 'Recipe',
            headerBackTitle: 'Back',
            headerBackVisible: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ShareIntentProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? RelesDarkTheme : RelesLightTheme}>
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
    </ShareIntentProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
});
