import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

  const { top: safeTop } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.nav, { paddingTop: safeTop }]}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.pageHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.pageTitle}>Create Account</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.pageSubtitle}>
          Create your account to start saving recipes
        </Text>
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
    </View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  nav: {
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

  // ── Page Header ────────────────────────────────────────
  pageHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pageTitle: {
    fontFamily: f.headingBold,
    fontSize: typography.size['3xl'],
    fontVariant: ['no-common-ligatures'],
    color: colors.primary,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  pageSubtitle: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.textSecondary,
  },

  flex: {
    flex: 1,
  },
  illustrationSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  illustrationImage: {
    width: 200,
    height: 200,
  },
  formSection: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.xl,
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
  hint: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
    marginLeft: spacing.xs,
  },
});
