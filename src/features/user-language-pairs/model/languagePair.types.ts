export type Language = {
  id: string;
  name: string;
  code: string;
};

export type LanguagePair = {
  id: string;
  sourceLanguage: Language;
  targetLanguage: Language;
};

export type UserLanguagePairStatus = "ACTIVE" | "HIDDEN" | "active" | "hidden";

export type UserLanguagePair = {
  id: string;
  status: UserLanguagePairStatus;
  lastUsed: string | null;
  languagePair: LanguagePair;
};

export type LanguagePairState = {
  shouldChooseLanguagePair: boolean;
  currentLanguagePair: LanguagePair | null;
  selectedLanguagePairs: UserLanguagePair[];
};

export type LanguagePairSettingsState = {
  shouldChooseLanguagePair: boolean;
  currentLanguagePair: LanguagePair | null;
  userLanguagePairs: UserLanguagePair[];
};
