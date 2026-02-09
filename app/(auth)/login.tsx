import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FeatureCarousel } from "@/components/FeatureCarousel";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { colors, spacing, radius, typography, shadows } from "@/constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordHeight = useRef(new Animated.Value(0)).current;
  const passwordOpacity = useRef(new Animated.Value(0)).current;

  const bgColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    "background"
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    "text"
  );
  const subtextColor = useThemeColor(
    { light: colors.light.textSecondary, dark: colors.dark.textSecondary },
    "text"
  );
  const inputBg = useThemeColor(
    { light: colors.light.inputBackground, dark: colors.dark.inputBackground },
    "background"
  );
  const borderColor = useThemeColor(
    { light: colors.light.border, dark: colors.dark.border },
    "text"
  );

  const revealPassword = () => {
    setShowPassword(true);
    Animated.parallel([
      Animated.spring(passwordHeight, {
        toValue: 56,
        useNativeDriver: false,
        friction: 8,
      }),
      Animated.timing(passwordOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    // If password isn't shown yet, reveal it
    if (!showPassword) {
      revealPassword();
      return;
    }

    if (!password) {
      Alert.alert("Password required", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(trimmedEmail, password);
    } catch (err: any) {
      if (err.message === "Invalid email or password") {
        Alert.alert(
          "Account not found",
          "No account with this email. Would you like to create one?",
          [
            { text: "Try again" },
            {
              text: "Create account",
              onPress: () => {
                router.push({
                  pathname: "/(auth)/onboarding-name",
                  params: { email: trimmedEmail },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Email required", "Please enter your email address first.");
      return;
    }
    router.push({
      pathname: "/(auth)/onboarding-name",
      params: { email: trimmedEmail },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.carouselSection}>
          <FeatureCarousel />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.tagline, { color: subtextColor }]}>
            From saved to served
          </Text>

          <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Enter your email"
              placeholderTextColor={subtextColor as string}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType={showPassword ? "next" : "go"}
              onSubmitEditing={handleContinue}
            />
          </View>

          <Animated.View
            style={[
              styles.passwordAnimated,
              { height: passwordHeight, opacity: passwordOpacity },
            ]}
          >
            <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Password"
                placeholderTextColor={subtextColor as string}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleContinue}
              />
            </View>
          </Animated.View>

          <Button
            title={showPassword ? "Log in" : "Continue"}
            onPress={handleContinue}
            loading={loading}
            disabled={!email.trim()}
            size="lg"
          />

          <Button
            title="Create an account"
            onPress={handleRegister}
            variant="ghost"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  carouselSection: {
    flex: 1,
    justifyContent: "center",
    minHeight: 300,
  },
  formSection: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
    gap: spacing.md,
  },
  tagline: {
    fontSize: typography.size.lg,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  inputContainer: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.xl,
  },
  passwordAnimated: {
    overflow: "hidden",
  },
});
