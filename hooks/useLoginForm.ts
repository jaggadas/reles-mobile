import { useState, useRef } from "react";
import { Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiCheckEmail } from "@/lib/auth";

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
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    // If password is already shown, attempt login
    if (showPassword) {
      if (!password) {
        Alert.alert("Password required", "Please enter your password.");
        return;
      }

      setLoading(true);
      try {
        await login(normalizedEmail, password);
      } catch (err: any) {
        Alert.alert("Error", err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Check if email exists and route accordingly
    setLoading(true);
    try {
      const { exists } = await apiCheckEmail(normalizedEmail);
      if (exists) {
        revealPassword();
      } else {
        router.push({
          pathname: "/(auth)/onboarding-name",
          params: { email: normalizedEmail },
        });
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
  };
}
