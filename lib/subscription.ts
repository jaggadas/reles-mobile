import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Constants (shared with server) ────────────────────────────

export const FREE_WEEKLY_LIMIT = 2;
export const PRO_WEEKLY_LIMIT = 50;
export const TRIAL_RECIPE_LIMIT = PRO_WEEKLY_LIMIT;
export const TRIAL_DURATION_DAYS = 7;
export const ENTITLEMENT_ID = "Reles Pro";

// ── Trial Welcome (stays local — device-specific UI flag) ─────

const TRIAL_WELCOME_SEEN_KEY = "reles_trial_welcome_seen";

/** Check if the trial welcome screen has been shown. */
export async function hasSeenTrialWelcome(): Promise<boolean> {
  const val = await AsyncStorage.getItem(TRIAL_WELCOME_SEEN_KEY);
  return val === "true";
}

/** Mark trial welcome screen as seen. */
export async function markTrialWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(TRIAL_WELCOME_SEEN_KEY, "true");
}

// ── One-Time Migration Helpers ────────────────────────────────

const TRIAL_KEY = "reles_trial_data";
const WEEKLY_EXTRACTIONS_KEY = "reles_weekly_extractions";
const MIGRATION_DONE_KEY = "reles_subscription_migrated";

interface TrialData {
  startDate: string;
  recipesUsed: number;
}

interface WeeklyExtractionData {
  count: number;
  weekStart: string;
}

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
}

/**
 * Reads legacy AsyncStorage data for one-time migration to server.
 * Returns null if already migrated or no local data exists.
 */
export async function getLocalDataForMigration(): Promise<{
  trial: TrialData | null;
  weeklyExtractions: WeeklyExtractionData;
} | null> {
  const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
  if (alreadyMigrated === "true") return null;

  const trialRaw = await AsyncStorage.getItem(TRIAL_KEY);
  const weeklyRaw = await AsyncStorage.getItem(WEEKLY_EXTRACTIONS_KEY);

  // Nothing to migrate if there's no local data at all
  if (!trialRaw && !weeklyRaw) {
    await AsyncStorage.setItem(MIGRATION_DONE_KEY, "true");
    return null;
  }

  const trial: TrialData | null = trialRaw ? JSON.parse(trialRaw) : null;
  const weekly: WeeklyExtractionData = weeklyRaw
    ? JSON.parse(weeklyRaw)
    : { count: 0, weekStart: getCurrentWeekStart() };

  return { trial, weeklyExtractions: weekly };
}

/** Mark migration as complete so it doesn't run again. */
export async function markMigrationDone(): Promise<void> {
  await AsyncStorage.setItem(MIGRATION_DONE_KEY, "true");
}

/** Remove legacy AsyncStorage keys after successful migration. */
export async function clearLegacySubscriptionData(): Promise<void> {
  await AsyncStorage.multiRemove([TRIAL_KEY, WEEKLY_EXTRACTIONS_KEY]);
}
