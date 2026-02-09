import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { colors, spacing, radius, typography } from "@/constants/colors";

export default function OnboardingNameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(params.email!, password, name.trim());
      router.push("/(auth)/onboarding-cuisines");
    } catch (err: any) {
      Alert.alert("Registration failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <OnboardingProgress currentStep={1} totalSteps={3} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationEmoji}>👋</Text>
          </View>

          <Text style={[styles.heading, { color: textColor }]}>
            Let's get to know you
          </Text>
          <Text style={[styles.subheading, { color: subtextColor }]}>
            Create your account to start saving recipes
          </Text>

          <View style={styles.fields}>
            <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Your name"
                placeholderTextColor={subtextColor as string}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                autoFocus
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Create a password"
                placeholderTextColor={subtextColor as string}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <Text style={[styles.hint, { color: subtextColor }]}>
              At least 6 characters
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!name.trim() || password.length < 6}
            size="lg"
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
  content: {
    flex: 1,
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.xl,
  },
  illustration: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  heading: {
    fontSize: typography.size["5xl"],
    fontWeight: typography.weight.bold,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: typography.size.xl,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing["2xl"],
  },
  fields: {
    gap: spacing.md,
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
  hint: {
    fontSize: typography.size.sm,
    marginLeft: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.xxl,
  },
});
