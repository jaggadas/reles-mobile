import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeatureCarousel } from "@/components/FeatureCarousel";
import { Button } from "@/components/ui";
import { useLoginForm } from "@/hooks/useLoginForm";
import { colors, spacing, radius, typography, shadows } from "@/constants/colors";

export default function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    loading,
    passwordHeight,
    passwordOpacity,
    handleContinue,
    handleRegister,
  } = useLoginForm();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.carouselSection}>
          <FeatureCarousel />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            From saved to served
          </Text>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
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
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
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
