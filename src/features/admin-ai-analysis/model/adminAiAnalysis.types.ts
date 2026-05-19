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

export type AiAnalysisJobStatus =
  | "pending"
  | "processing"
  | "waiting_rate_limit"
  | "completed"
  | "failed";

export type CreateAiAnalysisJobsPayload = {
  title: string;
  language_level: string;
  source_language: string;
  target_languages: string[];
  original_text: string;
};

export type CreatedAiAnalysisJob = {
  id: string;
  batch_id: string;
  title: string;
  language_level: string;
  source_language: string;
  target_language: string;
  status: AiAnalysisJobStatus;
};

export type CreateAiAnalysisJobsResponse = {
  batch_id: string;
  jobs: CreatedAiAnalysisJob[];
};

export type AiAnalysisJob = {
  id: string;
  batch_id: string;
  title: string;
  language_level: string;
  source_language: string;
  target_language: string;
  status: AiAnalysisJobStatus;
  error_message: string | null;
  attempt_count: number;
  next_attempt_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  result_json: unknown | null;
};
