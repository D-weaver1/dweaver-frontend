import { http } from "../../../shared/api/http";
import type {
  LanguagePair,
  LanguagePairSettingsState,
  LanguagePairState,
} from "../model/languagePair.types";

type AddLanguagePairPayload = {
  languagePairId: string;
};

export const languagePairApi = {
  getState() {
    return http<LanguagePairState>("/user-language-pairs/state");
  },

  getSettingsState() {
    return http<LanguagePairSettingsState>(
      "/user-language-pairs/settings-state",
    );
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

  hideLanguagePair(languagePairId: string) {
    return http<LanguagePairSettingsState>(
      `/user-language-pairs/${languagePairId}/hide`,
      {
        method: "PATCH",
      },
    );
  },

  activateLanguagePair(languagePairId: string) {
    return http<LanguagePairSettingsState>(
      `/user-language-pairs/${languagePairId}/activate`,
      {
        method: "PATCH",
      },
    );
  },

  removeLanguagePair(languagePairId: string) {
    return http<LanguagePairSettingsState>(
      `/user-language-pairs/${languagePairId}`,
      {
        method: "DELETE",
      },
    );
  },
};
