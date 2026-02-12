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
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { useLoginForm } from "@/hooks/useLoginForm";
import { colors, spacing, radius, typography } from "@/constants/colors";

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
  } = useLoginForm();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <Image
              source={require("@/assets/images/Reles.svg")}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.signInLabel}>Sign in to continue</Text>
          </View>

          <View style={styles.formSection}>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
            >
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
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
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
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing["4xl"],
  },
  logoSection: {
    alignItems: "center",
    marginBottom: spacing["3xl"],
  },
  logo: {
    width: 200,
    height: 68,
    marginBottom: spacing.md,
  },
  signInLabel: {
    fontSize: typography.size.xl,
    fontFamily: f.heading,
    color: colors.textSecondary,
  },
  formSection: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.sm,
  },
  inputContainer: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.lg,
    fontFamily: f.body,
  },
  passwordAnimated: {
    overflow: "hidden",
  },
});
