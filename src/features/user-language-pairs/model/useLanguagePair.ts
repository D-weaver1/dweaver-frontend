import { useContext } from "react";
import { LanguagePairContext } from "./languagePairContext";

export function useLanguagePair() {
  const context = useContext(LanguagePairContext);

  if (!context) {
    throw new Error("useLanguagePair must be used inside LanguagePairProvider");
  }

  return context;
}
