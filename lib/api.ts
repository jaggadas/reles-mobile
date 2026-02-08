import type {
  ExtractedRecipe,
  GroceryItem,
  Ingredient,
  VideoDetails,
  VideoSearchResult,
} from "./types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export function extractVideoId(url: string): string | null {
  const pattern =
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(pattern);
  return match?.[1] ?? null;
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export async function searchRecipeVideos(
  query: string
): Promise<VideoSearchResult[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/video/search?q=${encodeURIComponent(query.trim())}`
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.error ?? `Search failed (status ${response.status})`
    );
  }

  const data = await response.json();
  return data.results ?? [];
}

export async function fetchVideoDetails(
  videoId: string
): Promise<VideoDetails> {
  const response = await fetch(`${API_BASE_URL}/api/video/${videoId}/details`);

  if (!response.ok) {
    return { title: "Untitled Recipe", channelTitle: "" };
  }

  const data = await response.json();
  return {
    title: data.title ?? "Untitled Recipe",
    channelTitle: data.channelTitle ?? "",
  };
}

export async function extractIngredients(
  videoId: string
): Promise<ExtractedRecipe> {
  const response = await fetch(`${API_BASE_URL}/api/video/${videoId}/extract`);

  if (response.status === 429) {
    throw new Error(
      "YouTube is rate limiting requests. Please try again in a few minutes."
    );
  }

  if (response.status === 404) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.detail ?? "This video does not have captions available."
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.detail ?? `Failed to extract recipe (status ${response.status}).`
    );
  }

  const data = await response.json();

  if (
    !data.ingredients ||
    !Array.isArray(data.ingredients) ||
    data.ingredients.length === 0
  ) {
    throw new Error("No ingredients could be extracted from this video.");
  }

  const ingredients: Ingredient[] = data.ingredients
    .filter(
      (item: Record<string, unknown>) =>
        item && typeof item.name === "string" && (item.name as string).trim()
    )
    .map((item: Record<string, unknown>) => ({
      name: item.name as string,
      quantity: (item.quantity as string) || "as needed",
      category: (item.category as string) || "Other",
    }));

  const instructions: string[] = Array.isArray(data.instructions)
    ? data.instructions.filter(
        (s: unknown) => typeof s === "string" && (s as string).trim()
      )
    : [];

  return {
    videoId,
    title: data.title,
    ingredients,
    instructions,
    servings: data.servings,
    prepTimeMinutes: data.prepTimeMinutes,
    cookTimeMinutes: data.cookTimeMinutes,
    allergens: data.allergens,
    caloriesKcal: data.caloriesKcal,
    difficulty: data.difficulty,
    cuisine: data.cuisine,
    accompanyingRecipes: Array.isArray(data.accompanyingRecipes) ? data.accompanyingRecipes : [],
  };
}

export async function createInstacartRecipeLink(recipe: {
  title: string;
  ingredients: Ingredient[];
  instructions?: string[];
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  thumbnailUrl?: string;
  sourceUrl?: string;
}): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/recipe/instacart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to create Instacart link");
  }

  const data = await response.json();
  return data.url;
}

export async function createInstacartGroceryLink(
  items: GroceryItem[],
  title?: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/grocery/instacart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, title }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to create Instacart list");
  }

  const data = await response.json();
  return data.url;
}
