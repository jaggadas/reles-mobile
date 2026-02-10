import { useState, useRef } from "react";
import { Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export function useLoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordHeight = useRef(new Animated.Value(0)).current;
  const passwordOpacity = useRef(new Animated.Value(0)).current;

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

  return {
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
  };
}
