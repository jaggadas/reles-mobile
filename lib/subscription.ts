import AsyncStorage from "@react-native-async-storage/async-storage";

const WEEKLY_EXTRACTIONS_KEY = "reles_weekly_extractions";
const TRIAL_KEY = "reles_trial_data";
const TRIAL_WELCOME_SEEN_KEY = "reles_trial_welcome_seen";

export const FREE_WEEKLY_LIMIT = 2;
export const PRO_WEEKLY_LIMIT = 10;
export const TRIAL_RECIPE_LIMIT = PRO_WEEKLY_LIMIT;
export const TRIAL_DURATION_DAYS = 7;
export const ENTITLEMENT_ID = "Reles Pro";

// ── Trial Tracking ──────────────────────────────────────────────

interface TrialData {
  startDate: string; // ISO string of when trial started
  recipesUsed: number;
}

/** Start the free trial (called on first login/signup). */
export async function startTrial(): Promise<void> {
  const existing = await getTrialData();
  if (existing) return; // Don't restart if already exists
  const data: TrialData = { startDate: new Date().toISOString(), recipesUsed: 0 };
  await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify(data));
}

/** Get trial data, or null if no trial has been started. */
export async function getTrialData(): Promise<TrialData | null> {
  try {
    const raw = await AsyncStorage.getItem(TRIAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Check if the trial is still active (within 7 days AND under 10 recipes). */
export async function checkTrialActive(): Promise<boolean> {
  const data = await getTrialData();
  if (!data) return false;

  const start = new Date(data.startDate);
  const now = new Date();
  const daysPassed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  return daysPassed < TRIAL_DURATION_DAYS && data.recipesUsed < TRIAL_RECIPE_LIMIT;
}

/** Get remaining recipes in the trial. */
export async function getTrialRemainingRecipes(): Promise<number> {
  const data = await getTrialData();
  if (!data) return 0;
  return Math.max(0, TRIAL_RECIPE_LIMIT - data.recipesUsed);
}

/** Increment the trial extraction counter. */
export async function incrementTrialExtraction(): Promise<void> {
  const data = await getTrialData();
  if (!data) return;
  data.recipesUsed += 1;
  await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify(data));
}

/** Check if the trial welcome screen has been shown. */
export async function hasSeenTrialWelcome(): Promise<boolean> {
  const val = await AsyncStorage.getItem(TRIAL_WELCOME_SEEN_KEY);
  return val === "true";
}

/** Mark trial welcome screen as seen. */
export async function markTrialWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(TRIAL_WELCOME_SEEN_KEY, "true");
}

// ── Weekly Extraction Tracking ──────────────────────────────────

interface WeeklyExtractionData {
  count: number;
  weekStart: string; // ISO string of Monday 00:00:00
}

/** Returns the ISO string of the most recent Monday at 00:00:00 UTC. */
function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
}

async function getWeeklyData(): Promise<WeeklyExtractionData> {
  try {
    const raw = await AsyncStorage.getItem(WEEKLY_EXTRACTIONS_KEY);
    if (!raw) return { count: 0, weekStart: getCurrentWeekStart() };

    const data: WeeklyExtractionData = JSON.parse(raw);
    const currentWeek = getCurrentWeekStart();

    // Reset if we're in a new week
    if (data.weekStart !== currentWeek) {
      return { count: 0, weekStart: currentWeek };
    }

    return data;
  } catch {
    return { count: 0, weekStart: getCurrentWeekStart() };
  }
}

async function saveWeeklyData(data: WeeklyExtractionData): Promise<void> {
  await AsyncStorage.setItem(WEEKLY_EXTRACTIONS_KEY, JSON.stringify(data));
}

/** Returns how many recipes the user has extracted this week. */
export async function getWeeklyExtractionCount(): Promise<number> {
  const data = await getWeeklyData();
  return data.count;
}

/** Resets the weekly extraction counter to 0 (e.g. after upgrading to Pro). */
export async function resetWeeklyExtractions(): Promise<void> {
  await saveWeeklyData({ count: 0, weekStart: getCurrentWeekStart() });
}

/** Increments the weekly extraction counter by 1. */
export async function incrementWeeklyExtraction(): Promise<void> {
  const data = await getWeeklyData();
  data.count += 1;
  await saveWeeklyData(data);
}

/** Returns remaining extractions for the week given the user's tier. */
export async function getRemainingExtractions(isPro: boolean): Promise<number> {
  const count = await getWeeklyExtractionCount();
  const limit = isPro ? PRO_WEEKLY_LIMIT : FREE_WEEKLY_LIMIT;
  return Math.max(0, limit - count);
}

/** Checks if the user can extract another recipe this week. */
export async function canExtractRecipe(isPro: boolean): Promise<boolean> {
  const remaining = await getRemainingExtractions(isPro);
  return remaining > 0;
}
