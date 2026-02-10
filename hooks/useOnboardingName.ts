import { useState } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export function useOnboardingName() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push("/(auth)/onboarding-dietary");
    } catch (err: any) {
      Alert.alert("Registration failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    password,
    setPassword,
    loading,
    handleContinue,
  };
}
