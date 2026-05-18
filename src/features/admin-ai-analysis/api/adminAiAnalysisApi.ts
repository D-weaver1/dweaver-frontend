import { http } from "@/shared/api/http";
import type {
  AiAnalysisJob,
  CreateAiAnalysisJobsPayload,
  CreateAiAnalysisJobsResponse,
  Language,
  LanguagePair,
} from "../model/adminAiAnalysis.types";

export const adminAiAnalysisApi = {
  getLanguages() {
    return http<Language[]>("/languages");
  },

  getLanguagePairs() {
    return http<LanguagePair[]>("/language-pairs");
  },

  createJobs(payload: CreateAiAnalysisJobsPayload) {
    return http<CreateAiAnalysisJobsResponse>("/ai-text-analysis/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getJobs() {
    return http<AiAnalysisJob[]>("/ai-text-analysis/jobs");
  },

  getJob(id: string) {
    return http<AiAnalysisJob>(`/ai-text-analysis/jobs/${id}`);
  },
};
