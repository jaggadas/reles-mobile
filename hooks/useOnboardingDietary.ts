import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export function useOnboardingDietary() {
  const { savePreferences } = useAuth();

  const [diet, setDiet] = useState<string>("none");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await savePreferences({
        likedCuisines: [],
        dietaryRestrictions: {
          isVegetarian: diet === "vegetarian" || diet === "vegan",
          isVegan: diet === "vegan",
        },
        favoriteCategories: [],
        allergens: selectedAllergens,
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return {
    diet,
    setDiet,
    selectedAllergens,
    loading,
    toggleAllergen,
    handleFinish,
  };
}
