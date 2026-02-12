import { DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';

import { colors, typography } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext';
import { extractVideoId } from '@/lib/api';

const RelesLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.borderLight,
    notification: colors.accent,
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
      router.replace('/(auth)/onboarding-dietary');
    } else if (status === 'logged_in' && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [status, isLoading, segments]);

  // Activate trial and show welcome screen for new users
  const { shouldShowTrialWelcome, activateTrial, isPro } = useSubscription();
  useEffect(() => {
    if (status === 'logged_in' && !isPro) {
      activateTrial();
    }
  }, [status]);

  useEffect(() => {
    if (shouldShowTrialWelcome && status === 'logged_in') {
      router.push('/trial-welcome' as any);
    }
  }, [shouldShowTrialWelcome, status]);

  // Handle YouTube share intent
  useEffect(() => {
    if (!hasShareIntent || status !== 'logged_in') return;

    const sharedText = shareIntent.text ?? shareIntent.webUrl;
    if (!sharedText) return;

    const videoId = extractVideoId(sharedText);
    if (videoId) {
      router.push({ pathname: '/recipe/preview', params: { videoId } } as any);
    }
    resetShareIntent();
  }, [hasShareIntent, status]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerTitleStyle: {
            fontFamily: typography.family.headingBold,
          },
          headerBackTitleStyle: {
            fontFamily: typography.family.body,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="trial-welcome"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="recipe/preview"
          options={{ headerShown: false }}
        />
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
  const [fontsLoaded] = useFonts({
    'HedvigLettersSerif': require('../assets/fonts/HedvigLettersSerif-Regular.ttf'),
    'HedvigLettersSans': require('../assets/fonts/HedvigLettersSans-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ShareIntentProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <ThemeProvider value={RelesLightTheme}>
            <RootNavigator />
          </ThemeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ShareIntentProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
