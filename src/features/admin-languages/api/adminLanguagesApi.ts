import { http } from "@/shared/api/http";
import type {
  CreateLanguagePairPayload,
  CreateLanguagePayload,
  Language,
  LanguagePair,
} from "../model/adminLanguages.types";

export const adminLanguagesApi = {
  getLanguages() {
    return http<Language[]>("/languages");
  },

  createLanguage(payload: CreateLanguagePayload) {
    return http<Language>("/languages", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getLanguagePairs() {
    return http<LanguagePair[]>("/language-pairs");
  },

  createLanguagePair(payload: CreateLanguagePairPayload) {
    return http<LanguagePair>("/language-pairs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
