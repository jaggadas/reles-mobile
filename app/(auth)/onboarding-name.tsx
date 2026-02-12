import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { Button } from "@/components/ui";
import { useOnboardingName } from "@/hooks/useOnboardingName";
import { colors, spacing, radius, typography } from "@/constants/colors";

export default function OnboardingNameScreen() {
  const {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    loading,
    handleContinue,
    handleBack,
  } = useOnboardingName();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressWrapper}>
          <OnboardingProgress currentStep={1} totalSteps={3} />
        </View>
        <View style={styles.backButton} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.illustrationSection}>
          <Image
            source={require("@/assets/illustrations/lets get to know you.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Create your account to start saving recipes
          </Text>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              autoFocus
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Create a password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            At least 6 characters
          </Text>

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!email.trim() || !name.trim() || password.length < 6}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  progressWrapper: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  illustrationSection: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },
  formSection: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  subheading: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    textAlign: "center",
    marginBottom: spacing.xs,
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
  hint: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
    marginLeft: spacing.xs,
  },
});
