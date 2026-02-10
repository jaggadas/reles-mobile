export interface UserPreferences {
  likedCuisines: string[];
  dietaryRestrictions: {
    isVegetarian: boolean;
    isVegan: boolean;
  };
  favoriteCategories: string[];
  /** List of allergen identifiers the user wants to avoid (e.g. "peanuts", "gluten") */
  allergens: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  preferences: UserPreferences | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export type AuthStatus = "loading" | "logged_out" | "onboarding" | "logged_in";
