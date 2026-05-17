import { createContext } from "react";
import type { LanguagePair, LanguagePairState } from "./languagePair.types";

export type LanguagePairContextValue = {
  state: LanguagePairState | null;
  currentLanguagePair: LanguagePair | null;
  selectedLanguagePairs: LanguagePairState["selectedLanguagePairs"];
  shouldChooseLanguagePair: boolean;
  isLoading: boolean;
  loadLanguagePairState: () => Promise<void>;
  selectLanguagePair: (languagePairId: string) => Promise<void>;
  addLanguagePair: (languagePairId: string) => Promise<void>;
};

export const LanguagePairContext =
  createContext<LanguagePairContextValue | null>(null);
