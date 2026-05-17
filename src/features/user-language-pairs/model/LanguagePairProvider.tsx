import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { languagePairApi } from "../api/languagePairApi";
import type { LanguagePairState } from "./languagePair.types";
import { LanguagePairContext } from "./languagePairContext";
import { useAuth } from "../../auth/model/useAuth";

type LanguagePairProviderProps = {
  children: ReactNode;
};

export function LanguagePairProvider({ children }: LanguagePairProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();

  const userId = user?.id ?? null;

  const [state, setState] = useState<LanguagePairState | null>(null);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading || !userId) {
      return;
    }

    let isCancelled = false;

    languagePairApi
      .getState()
      .then((result) => {
        if (isCancelled) {
          return;
        }

        setState(result);
        setLoadedUserId(userId);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setState(null);
        setLoadedUserId(userId);
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, userId]);

  const loadLanguagePairState = useCallback(async () => {
    if (!userId) {
      return;
    }

    const result = await languagePairApi.getState();

    setState(result);
    setLoadedUserId(userId);
  }, [userId]);

  const selectLanguagePair = useCallback(
    async (languagePairId: string) => {
      if (!userId) {
        return;
      }

      const result = await languagePairApi.selectLanguagePair(languagePairId);

      setState(result);
      setLoadedUserId(userId);
    },
    [userId],
  );

  const addLanguagePair = useCallback(
    async (languagePairId: string) => {
      if (!userId) {
        return;
      }

      const result = await languagePairApi.addLanguagePair({
        languagePairId,
      });

      setState(result);
      setLoadedUserId(userId);
    },
    [userId],
  );

  const actualState = userId === loadedUserId ? state : null;

  const isLoading = isAuthLoading || Boolean(userId && loadedUserId !== userId);

  const value = useMemo(
    () => ({
      state: actualState,
      currentLanguagePair: actualState?.currentLanguagePair ?? null,
      selectedLanguagePairs: actualState?.selectedLanguagePairs ?? [],
      shouldChooseLanguagePair: actualState?.shouldChooseLanguagePair ?? false,
      isLoading,
      loadLanguagePairState,
      selectLanguagePair,
      addLanguagePair,
    }),
    [
      actualState,
      isLoading,
      loadLanguagePairState,
      selectLanguagePair,
      addLanguagePair,
    ],
  );

  return (
    <LanguagePairContext.Provider value={value}>
      {children}
    </LanguagePairContext.Provider>
  );
}
