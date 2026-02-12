import type {
  ExtractedRecipe,
  GroceryItem,
  Ingredient,
  Recipe,
  StreamingExtractionCallbacks,
  VideoDetails,
  VideoSearchResult,
} from "./types";
export type { VideoSearchResult };
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

// ── SSE Streaming Extraction ─────────────────────────────────

function parseSSEResponse(
  data: Record<string, unknown>,
): ExtractedRecipe {
  const ingredients: Ingredient[] = (
    data.ingredients as Array<Record<string, unknown>>
  )
    ?.filter(
      (item) => item && typeof item.name === "string" && (item.name as string).trim()
    )
    .map((item) => ({
      name: item.name as string,
      quantity: (item.quantity as string) || "as needed",
      category: (item.category as string) || "Other",
    })) ?? [];

  const instructions: string[] = Array.isArray(data.instructions)
    ? data.instructions.filter(
        (s: unknown) => typeof s === "string" && (s as string).trim()
      )
    : [];

  return {
    videoId: (data.videoId as string) ?? "",
    title: (data.title as string) ?? "",
    ingredients,
    instructions,
    servings: data.servings as number | undefined,
    prepTimeMinutes: data.prepTimeMinutes as number | undefined,
    cookTimeMinutes: data.cookTimeMinutes as number | undefined,
    allergens: data.allergens as string[] | undefined,
    caloriesKcal: data.caloriesKcal as number | undefined,
    difficulty: data.difficulty as number | undefined,
    cuisine: data.cuisine as ExtractedRecipe["cuisine"],
    accompanyingRecipes: Array.isArray(data.accompanyingRecipes)
      ? data.accompanyingRecipes
      : [],
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
  };
}

// Metadata key mapping from server (snake_case) to client (camelCase)
const META_KEY_MAP: Record<string, string> = {
  servings: "servings",
  prep_time_minutes: "prepTimeMinutes",
  cook_time_minutes: "cookTimeMinutes",
  calories_kcal: "caloriesKcal",
  difficulty: "difficulty",
  cuisine: "cuisine",
};

function dispatchSSEEvent(
  eventName: string,
  data: string,
  callbacks: StreamingExtractionCallbacks,
): void {
  try {
    const parsed = JSON.parse(data);
    switch (eventName) {
      case "phase":
        callbacks.onPhase(parsed.phase);
        break;
      case "metadata": {
        const mapped: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(parsed)) {
          mapped[META_KEY_MAP[key] ?? key] = val;
        }
        callbacks.onMetadata(mapped);
        break;
      }
      case "ingredient":
        callbacks.onIngredient({
          name: parsed.name,
          quantity: parsed.quantity || "as needed",
          category: parsed.category || "Other",
        });
        break;
      case "instruction":
        callbacks.onInstruction(parsed.index, parsed.text);
        break;
      case "complete":
        callbacks.onComplete(parseSSEResponse(parsed));
        break;
      case "error":
        callbacks.onError(parsed.message);
        break;
    }
  } catch {
    // skip malformed events
  }
}

function parseSSEBuffer(
  text: string,
  processedLength: number,
  callbacks: StreamingExtractionCallbacks,
): number {
  // Only process new content
  const newContent = text.slice(processedLength);
  const blocks = newContent.split("\n\n");

  // Last block may be incomplete — don't process it yet
  const completeBlocks = blocks.slice(0, -1);
  let consumed = processedLength;

  for (const block of completeBlocks) {
    consumed += block.length + 2; // +2 for the \n\n separator
    const trimmed = block.trim();
    if (!trimmed) continue;

    let eventName = "";
    let eventData = "";

    for (const line of trimmed.split("\n")) {
      if (line.startsWith("event: ")) {
        eventName = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        eventData = line.slice(6);
      }
    }

    if (eventName && eventData) {
      dispatchSSEEvent(eventName, eventData, callbacks);
    }
  }

  return consumed;
}

function attemptStreamingExtraction(
  videoId: string,
  callbacks: StreamingExtractionCallbacks,
  headers: Record<string, string>,
): Promise<void> {
  const url = `${API_BASE_URL}/api/video/${videoId}/extract-stream`;

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    let processedLength = 0;
    let progressCount = 0;
    const startTime = Date.now();

    xhr.onprogress = () => {
      progressCount++;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[SSE] onprogress #${progressCount} at ${elapsed}s — responseText: ${xhr.responseText.length} chars`);
      processedLength = parseSSEBuffer(
        xhr.responseText,
        processedLength,
        callbacks,
      );
    };

    xhr.onload = () => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[SSE] onload at ${elapsed}s — total ${xhr.responseText.length} chars, ${progressCount} progress events`);
      if (xhr.status === 401) {
        clearAuthToken();
        reject(new Error("Authentication required"));
        return;
      }
      if (xhr.status >= 400) {
        reject(new Error(`Stream failed (status ${xhr.status})`));
        return;
      }
      parseSSEBuffer(xhr.responseText, processedLength, callbacks);
      resolve();
    };

    xhr.onerror = () => {
      reject(new Error("streaming_failed"));
    };

    xhr.ontimeout = () => {
      reject(new Error("Extraction timed out"));
    };

    xhr.timeout = 120000;
    xhr.send();
  });
}

export async function extractIngredientsStream(
  videoId: string,
  callbacks: StreamingExtractionCallbacks
): Promise<void> {
  const headers = await getAuthHeaders();

  try {
    await attemptStreamingExtraction(videoId, callbacks, headers);
  } catch (err) {
    // If streaming failed due to network/platform issues, fall back to non-streaming
    const message = err instanceof Error ? err.message : "";
    if (message === "streaming_failed") {
      console.log("SSE streaming not supported, falling back to non-streaming");
      callbacks.onPhase("fetching");
      const recipe = await extractIngredients(videoId);
      callbacks.onPhase("extracting");
      // Simulate progressive delivery from the full result
      for (const ing of recipe.ingredients) {
        callbacks.onIngredient(ing);
      }
      for (let i = 0; i < recipe.instructions.length; i++) {
        callbacks.onInstruction(i, recipe.instructions[i]);
      }
      callbacks.onComplete(recipe);
      return;
    }
    throw err;
  }
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

// ── Subscription API ──────────────────────────────────────────

export interface SubscriptionStatus {
  isPro: boolean;
  recipesUsed: number;
  weeklyExtractions: { count: number; weekStart: string };
  remaining: number;
  limit: number;
}

export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  const response = await authFetch(`${API_BASE_URL}/api/subscription/status`);
  if (!response.ok) throw new Error("Failed to fetch subscription status");
  return response.json();
}

export async function apiActivatePro(): Promise<SubscriptionStatus> {
  const response = await authFetch(`${API_BASE_URL}/api/subscription/activate-pro`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to activate pro");
  return response.json();
}

export interface UseExtractionResult {
  allowed: boolean;
  remaining: number;
  isPro: boolean;
}

export async function apiUseExtraction(): Promise<UseExtractionResult> {
  const response = await authFetch(`${API_BASE_URL}/api/subscription/use-extraction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error("Failed to record extraction");
  return response.json();
}

// ── Saved Recipes API ────────────────────────────────────────

export async function apiSaveRecipe(videoId: string): Promise<{ savedAt: string }> {
  const response = await authFetch(`${API_BASE_URL}/api/user/recipes/${videoId}`, {
    method: "POST",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to save recipe");
  }
  return response.json();
}

export async function apiUnsaveRecipe(videoId: string): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/api/user/recipes/${videoId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to delete recipe");
  }
}

export async function apiGetSavedRecipes(): Promise<Recipe[]> {
  const response = await authFetch(`${API_BASE_URL}/api/user/recipes`);
  if (!response.ok) throw new Error("Failed to fetch recipes");
  const data = await response.json();
  return data.recipes ?? [];
}

export async function apiGetSavedRecipe(videoId: string): Promise<Recipe | null> {
  const response = await authFetch(`${API_BASE_URL}/api/user/recipes/${videoId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch recipe");
  const data = await response.json();
  return data.recipe ?? null;
}

export async function apiCheckRecipeSaved(videoId: string): Promise<boolean> {
  const response = await authFetch(`${API_BASE_URL}/api/user/recipes/check/${videoId}`);
  if (!response.ok) return false;
  const data = await response.json();
  return data.saved ?? false;
}

// ── Popular Recipes ───────────────────────────────────────────

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

// ── Home Feed ─────────────────────────────────────────────────

export interface FeedRecipe {
  videoId: string;
  title: string;
  channelTitle?: string;
  cuisine: string;
  difficulty: number;
  caloriesKcal: number;
  cookTimeMinutes: number;
  prepTimeMinutes: number;
  totalTimeMinutes: number;
  allergens: string[];
  highlights: string[];
  timesAccessed: number;
  timesMade: number;
}

export interface HomeFeedResponse {
  pickedForYou: VideoSearchResult[];
  trending: { cuisine: string | null; recipes: FeedRecipe[] };
  quickTonight: FeedRecipe[];
  deepDive: { cuisine: string | null; recipes: FeedRecipe[] };
  challenge: FeedRecipe[];
}

export async function fetchHomeFeed(
  cuisines: string[],
  dietary: string,
  allergens: string[]
): Promise<HomeFeedResponse> {
  const params = new URLSearchParams();
  if (cuisines.length > 0) params.set("cuisines", cuisines.join(","));
  if (dietary && dietary !== "none") params.set("dietary", dietary);
  if (allergens.length > 0) params.set("allergens", allergens.join(","));

  const response = await authFetch(
    `${API_BASE_URL}/api/recipe/feed?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch homepage feed");
  }

  return response.json();
}
