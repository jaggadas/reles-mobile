import type {
  ExtractedRecipe,
  GroceryItem,
  Ingredient,
  VideoDetails,
  VideoSearchResult,
} from "./types";
import { getAuthHeaders, clearAuthToken } from "./auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });

  if (response.status === 401) {
    await clearAuthToken();
  }

  return response;
}

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
  const response = await authFetch(
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
  const response = await authFetch(`${API_BASE_URL}/api/video/${videoId}/details`);

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
  const response = await authFetch(`${API_BASE_URL}/api/video/${videoId}/extract`);

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
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
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
  const response = await authFetch(`${API_BASE_URL}/api/recipe/instacart`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/grocery/instacart`, {
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

export interface PopularRecipe {
  videoId: string;
  title: string;
  timesMade: number;
  timesAccessed: number;
}

export async function fetchPopularRecipes(
  limit: number = 5
): Promise<PopularRecipe[]> {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/api/recipe/popular?limit=${limit}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.recipes ?? [];
  } catch {
    return [];
  }
}
