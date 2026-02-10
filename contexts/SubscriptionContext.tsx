import {
  ENTITLEMENT_ID,
  FREE_WEEKLY_LIMIT,
  PRO_WEEKLY_LIMIT,
  TRIAL_RECIPE_LIMIT,
  canExtractRecipe,
  getRemainingExtractions,
  incrementWeeklyExtraction,
  resetWeeklyExtractions,
  checkTrialActive,
  getTrialRemainingRecipes,
  incrementTrialExtraction,
  startTrial,
  hasSeenTrialWelcome,
  markTrialWelcomeSeen,
} from "@/lib/subscription";
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

// ── API Keys ──
// Test Store key (works on both platforms, no App Store / Play Store needed)
const TEST_STORE_API_KEY = "test_rMIgNOxmHQJtUdLVluZMmkekEdD";
// Replace with platform-specific keys when going to production:
// const PRODUCTION_KEYS = { apple: "appl_...", google: "goog_..." };

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

        await Purchases.configure({ apiKey: TEST_STORE_API_KEY });

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

  const updateFromCustomerInfo = useCallback(async (info: CustomerInfo) => {
    const proActive =
      typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    setIsPro(proActive);

    if (proActive) {
      // Paid pro user - use weekly pro limits
      const remaining = await getRemainingExtractions(true);
      setRemainingExtractions(remaining);
      setIsTrialOn(false);
    } else {
      // Check if trial is active
      const trialActive = await checkTrialActive();
      setIsTrialOn(trialActive);

      if (trialActive) {
        const remaining = await getTrialRemainingRecipes();
        setRemainingExtractions(remaining);
      } else {
        const remaining = await getRemainingExtractions(false);
        setRemainingExtractions(remaining);
      }
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

  // ── Custom Paywall (promise-based) ──

  const showPaywall = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      paywallResolverRef.current = resolve;
      setPaywallVisible(true);
    });
  }, []);

  const handlePaywallPurchased = useCallback(async () => {
    setPaywallVisible(false);
    await resetWeeklyExtractions();
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
    // (e.g. right after a purchase, React state isPro may not have updated yet)
    let proActive = false;
    try {
      const info = await Purchases.getCustomerInfo();
      proActive = typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    } catch {}

    if (proActive) {
      // Paid pro user - use weekly pro limits
      const allowed = await canExtractRecipe(true);
      if (!allowed) return false;
      await incrementWeeklyExtraction();
      const remaining = await getRemainingExtractions(true);
      setRemainingExtractions(remaining);
      setIsPro(true);
      return true;
    }

    // Check if trial is active
    const trialActive = await checkTrialActive();

    if (trialActive) {
      // Trial user - use trial limits
      await incrementTrialExtraction();
      const remaining = await getTrialRemainingRecipes();
      setRemainingExtractions(remaining);

      // Check if trial just expired (used last recipe)
      const stillActive = await checkTrialActive();
      setIsTrialOn(stillActive);

      return true;
    }

    // Free user (trial expired or never started) - use free weekly limits
    const allowed = await canExtractRecipe(false);
    if (!allowed) return false;
    await incrementWeeklyExtraction();
    const remaining = await getRemainingExtractions(false);
    setRemainingExtractions(remaining);
    return true;
  }, []);

  const activateTrial = useCallback(async () => {
    await startTrial();
    setIsTrialOn(true);
    const remaining = await getTrialRemainingRecipes();
    setRemainingExtractions(remaining);
    setShouldShowTrialWelcome(true);
  }, []);

  const dismissTrialWelcome = useCallback(async () => {
    await markTrialWelcomeSeen();
    setShouldShowTrialWelcome(false);
  }, []);

  // Check if trial welcome should be shown on mount
  useEffect(() => {
    const checkWelcome = async () => {
      const seen = await hasSeenTrialWelcome();
      const trialActive = await checkTrialActive();
      if (!seen && trialActive) {
        setShouldShowTrialWelcome(true);
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
