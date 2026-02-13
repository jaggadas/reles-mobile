import {
  FREE_TOTAL_LIMIT,
  PRO_WEEKLY_LIMIT,
} from "@/lib/subscription";
import {
  fetchSubscriptionStatus,
  apiActivatePro,
  apiUseExtraction,
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
  LOG_LEVEL,
} from "react-native-purchases";
import { PaywallModal } from "@/components/PaywallModal";
import { useAuth } from "@/contexts/AuthContext";

// ── API Keys ──
const PRODUCTION_KEYS = { apple: "appl_hIsGqZRomubNlgOOyfcBBAVFrQg", android: "goog_wDItMPaIxDJtLjuolAWLcyaXCrL"} 

interface SubscriptionContextValue {
  isPro: boolean;
  remainingExtractions: number;
  weeklyLimit: number;
  showPaywall: () => Promise<boolean>;
  tryExtract: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [remainingExtractions, setRemainingExtractions] = useState(FREE_TOTAL_LIMIT);
  const [initialized, setInitialized] = useState(false);

  // Paywall modal state
  const [paywallVisible, setPaywallVisible] = useState(false);
  const paywallResolverRef = useRef<((purchased: boolean) => void) | null>(null);

  // ── Initialize RevenueCat (for purchases only) ──
  useEffect(() => {
    const init = async () => {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        }
        await Purchases.configure({ apiKey: PRODUCTION_KEYS.android });
      } catch (e) {
        console.warn("RevenueCat init error:", e);
      } finally {
        setInitialized(true);
      }
    };

    init();
  }, []);

  // ── Fetch status from server ──
  const refresh = useCallback(async () => {
    try {
      const status = await fetchSubscriptionStatus();
      setIsPro(status.isPro ?? false);
      setRemainingExtractions(status.remaining ?? FREE_TOTAL_LIMIT);
    } catch {
      // Offline fallback: keep current state
    }
  }, []);

  // ── Re-fetch on login, reset on logout ──
  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      refresh();
    } else {
      setIsPro(false);
      setRemainingExtractions(FREE_TOTAL_LIMIT);
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
    // Tell server user is now Pro, update state from response
    try {
      const status = await apiActivatePro();
      setIsPro(status.isPro ?? true);
      setRemainingExtractions(status.remaining ?? PRO_WEEKLY_LIMIT);
    } catch {
      // Fallback: set Pro immediately even if server call fails
      setIsPro(true);
      setRemainingExtractions(PRO_WEEKLY_LIMIT);
    }
    if (paywallResolverRef.current) {
      paywallResolverRef.current(true);
      paywallResolverRef.current = null;
    }
  }, []);

  const handlePaywallContinueFree = useCallback(() => {
    setPaywallVisible(false);
    if (paywallResolverRef.current) {
      paywallResolverRef.current(false);
      paywallResolverRef.current = null;
    }
  }, []);

  // ── Extraction logic ──

  const tryExtract = useCallback(async (): Promise<boolean> => {
    try {
      const result = await apiUseExtraction();
      setRemainingExtractions(result.remaining ?? FREE_TOTAL_LIMIT);
      setIsPro(result.isPro ?? false);
      return result.allowed ?? false;
    } catch {
      return false;
    }
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        remainingExtractions,
        weeklyLimit: isPro ? PRO_WEEKLY_LIMIT : FREE_TOTAL_LIMIT,
        showPaywall,
        tryExtract,
        refresh,
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
