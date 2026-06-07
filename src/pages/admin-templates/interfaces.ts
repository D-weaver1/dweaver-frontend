interface LanguageTextTemplate {
  languageId: string;
  languageName: string;
  languageCode: string;
  template?: string;
}

interface TextTemplate {
  id: string;
  questionType: string;
  languageTextTemplates: LanguageTextTemplate[];
}

// GET /templates
// text templates always exists for all languages, but the template field can be undefined if template is not set for that language
export type GetTemplatesResponse = TextTemplate[];

// POST /templates
// works as upsert
export interface PatchTemplatesRequest {
  questionType: "s2t_input" | "s2t_translate" | "t2s_translate";
  languageTextTemplates: { languageId: string; template: string }[];
}
