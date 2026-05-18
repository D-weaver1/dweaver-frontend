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

export type CreateLanguagePayload = {
  name: string;
  code: string;
};

export type CreateLanguagePairPayload = {
  sourceLanguageId: string;
  targetLanguageId: string;
};
