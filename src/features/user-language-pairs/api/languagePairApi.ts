import { http } from "../../../shared/api/http";
import type {
  LanguagePair,
  LanguagePairState,
} from "../model/languagePair.types";

type AddLanguagePairPayload = {
  languagePairId: string;
};

export const languagePairApi = {
  getState() {
    return http<LanguagePairState>("/user-language-pairs/state");
  },

  getAvailableLanguagePairs() {
    return http<LanguagePair[]>("/user-language-pairs/available");
  },

  addLanguagePair(payload: AddLanguagePairPayload) {
    return http<LanguagePairState>("/user-language-pairs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  selectLanguagePair(languagePairId: string) {
    return http<LanguagePairState>(
      `/user-language-pairs/${languagePairId}/select`,
      {
        method: "PATCH",
      },
    );
  },
};
