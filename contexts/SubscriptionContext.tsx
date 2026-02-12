import {
  ENTITLEMENT_ID,
  FREE_WEEKLY_LIMIT,
  PRO_WEEKLY_LIMIT,
  TRIAL_RECIPE_LIMIT,
  hasSeenTrialWelcome,
  markTrialWelcomeSeen,
  getLocalDataForMigration,
  markMigrationDone,
  clearLegacySubscriptionData,
} from "@/lib/subscription";
import {
  fetchSubscriptionStatus,
  apiActivateTrial,
  apiUseExtraction,
  apiMigrateSubscriptionData,
} from "@/lib/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";
import { PaywallModal } from "@/components/PaywallModal";
import { useAuth } from "@/contexts/AuthContext";

// ── API Keys ──
// Test Store key (works on both platforms, no App Store / Play Store needed)
// const TEST_STORE_API_KEY = "test_rMIgNOxmHQJtUdLVluZMmkekEdD";
// Replace with platform-specific keys when going to production:
const PRODUCTION_KEYS = { apple: "appl_hIsGqZRomubNlgOOyfcBBAVFrQg"} // , google: "goog_..." };

interface SubscriptionContextValue {
  /** Whether the user has an active "pro" entitlement. */
  isPro: boolean;
  /** Whether the user is on the free trial. */
  isTrialActive: boolean;
  /** Number of extractions remaining (trial or weekly). */
  remainingExtractions: number;
  /** Current limit based on tier (trial/pro/free). */
  weeklyLimit: number;
  /** Whether the trial welcome screen should be shown. */
  shouldShowTrialWelcome: boolean;
  /** Show the custom paywall. Returns true if the user purchased/restored. */
  showPaywall: () => Promise<boolean>;
  /** Call before extracting a recipe. Returns true if allowed, false if at limit. */
  tryExtract: () => Promise<boolean>;
  /** Refresh subscription state and extraction counts. */
  refresh: () => Promise<void>;
  /** Start the trial and mark welcome as pending. */
  activateTrial: () => Promise<void>;
  /** Mark trial welcome screen as dismissed. */
  dismissTrialWelcome: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isTrialOn, setIsTrialOn] = useState(false);
  const [remainingExtractions, setRemainingExtractions] = useState(FREE_WEEKLY_LIMIT);
  const [shouldShowTrialWelcome, setShouldShowTrialWelcome] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Paywall modal state
  const [paywallVisible, setPaywallVisible] = useState(false);
  const paywallResolverRef = useRef<((purchased: boolean) => void) | null>(null);

  // ── Initialize RevenueCat ──
  useEffect(() => {
    const init = async () => {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        }

        await Purchases.configure({ apiKey: PRODUCTION_KEYS.apple });

        setInitialized(true);

        // Initial status check
        const info = await Purchases.getCustomerInfo();
        await updateFromCustomerInfo(info);
      } catch (e) {
        console.warn("RevenueCat init error:", e);
        setInitialized(true); // Continue as free user
      }
    };

    init();
  }, []);

  // ── Listen for subscription changes ──
  useEffect(() => {
    if (!initialized) return;

    const listener = (info: CustomerInfo) => {
      updateFromCustomerInfo(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [initialized]);

  // ── Migrate legacy AsyncStorage data to server (runs once) ──
  useEffect(() => {
    if (!initialized) return;

    const migrate = async () => {
      try {
        const localData = await getLocalDataForMigration();
        if (!localData) return; // Already migrated or no data
        await apiMigrateSubscriptionData(localData);
        await markMigrationDone();
        await clearLegacySubscriptionData();
      } catch {
        // Will retry next app launch
      }
    };

    migrate();
  }, [initialized]);

  const updateFromCustomerInfo = useCallback(async (info: CustomerInfo) => {
    const proActive =
      typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    setIsPro(proActive);

    try {
      const status = await fetchSubscriptionStatus();
      setIsTrialOn(status.trialActive);

      if (proActive) {
        setRemainingExtractions(status.proWeeklyRemaining);
      } else if (status.trialActive) {
        setRemainingExtractions(status.trialRemaining);
      } else {
        setRemainingExtractions(status.weeklyRemaining);
      }
    } catch {
      // Offline fallback: keep current state
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      await updateFromCustomerInfo(info);
    } catch {
      // Silently fail, keep current state
    }
  }, [updateFromCustomerInfo]);

  // ── Re-fetch on login, reset on logout ──
  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      refresh();
    } else {
      // Reset to defaults so next user doesn't see stale data
      setIsPro(false);
      setIsTrialOn(false);
      setRemainingExtractions(FREE_WEEKLY_LIMIT);
      setShouldShowTrialWelcome(false);
    }
  }, [isAuthenticated, initialized, refresh]);

  // ── Custom Paywall (promise-based) ──

  const showPaywall = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      paywallResolverRef.current = resolve;
      setPaywallVisible(true);
    });
  }, []);

  const handlePaywallPurchased = useCallback(async () => {
    setPaywallVisible(false);
    await refresh();
    if (paywallResolverRef.current) {
      paywallResolverRef.current(true);
      paywallResolverRef.current = null;
    }
  }, [refresh]);

  const handlePaywallContinueFree = useCallback(() => {
    setPaywallVisible(false);
    if (paywallResolverRef.current) {
      paywallResolverRef.current(false);
      paywallResolverRef.current = null;
    }
  }, []);

  // ── Extraction logic ──

  const tryExtract = useCallback(async (): Promise<boolean> => {
    // Always fetch fresh pro status from RevenueCat to avoid stale closure issues
    let proActive = false;
    try {
      const info = await Purchases.getCustomerInfo();
      proActive = typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    } catch {}

    try {
      const result = await apiUseExtraction(proActive);
      setRemainingExtractions(result.remaining);
      setIsTrialOn(result.trialActive);
      setIsPro(proActive);
      return result.allowed;
    } catch {
      // Network failure — deny extraction (extraction itself requires network anyway)
      return false;
    }
  }, []);

  const activateTrial = useCallback(async () => {
    try {
      const result = await apiActivateTrial();
      if (!result.alreadyActive) {
        setShouldShowTrialWelcome(true);
      }
      setIsTrialOn(result.trialActive ?? true);
      setRemainingExtractions(result.trialRemaining ?? TRIAL_RECIPE_LIMIT);
    } catch {
      // Silently fail — will retry on next login
    }
  }, []);

  const dismissTrialWelcome = useCallback(async () => {
    await markTrialWelcomeSeen();
    setShouldShowTrialWelcome(false);
  }, []);

  // Check if trial welcome should be shown on mount
  useEffect(() => {
    const checkWelcome = async () => {
      const seen = await hasSeenTrialWelcome();
      if (!seen) {
        try {
          const status = await fetchSubscriptionStatus();
          if (status.trialActive) {
            setShouldShowTrialWelcome(true);
          }
        } catch {
          // Offline — skip welcome check
        }
      }
    };
    checkWelcome();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        isTrialActive: isTrialOn,
        remainingExtractions,
        weeklyLimit: isPro ? PRO_WEEKLY_LIMIT : isTrialOn ? TRIAL_RECIPE_LIMIT : FREE_WEEKLY_LIMIT,
        shouldShowTrialWelcome,
        showPaywall,
        tryExtract,
        refresh,
        activateTrial,
        dismissTrialWelcome,
      }}
    >
      {children}
      <PaywallModal
        visible={paywallVisible}
        onPurchased={handlePaywallPurchased}
        onContinueFree={handlePaywallContinueFree}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
