export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}

export function formatDifficulty(difficulty: number): string {
  const labels = ["", "Easy", "Easy", "Medium", "Hard", "Expert"];
  return labels[difficulty] || "Easy";
}

export function formatCuisine(cuisine: string): string {
  const labels: Record<string, string> = {
    AMERICAN: "American",
    ITALIAN: "Italian",
    FRENCH: "French",
    SPANISH: "Spanish",
    MEXICAN: "Mexican",
    BRAZILIAN: "Brazilian",
    MEDITERRANEAN: "Mediterranean",
    MIDDLE_EASTERN: "Middle Eastern",
    INDIAN: "Indian",
    CHINESE: "Chinese",
    JAPANESE: "Japanese",
    KOREAN: "Korean",
    THAI: "Thai",
    VIETNAMESE: "Vietnamese",
    ASIAN_OTHER: "Asian",
    AFRICAN: "African",
    CARIBBEAN: "Caribbean",
    LATIN_AMERICAN: "Latin American",
    EUROPEAN_OTHER: "European",
    OTHER: "International",
  };
  return labels[cuisine] || "International";
}

export function formatAllergens(allergens: string[]): string {
  return allergens
    .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
    .join(", ");
}
