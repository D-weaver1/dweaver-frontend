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

export type UserLanguagePair = {
  id: string;
  status: string;
  lastUsed: string;
  languagePair: LanguagePair;
};

export type LanguagePairState = {
  shouldChooseLanguagePair: boolean;
  currentLanguagePair: LanguagePair | null;
  selectedLanguagePairs: UserLanguagePair[];
};
