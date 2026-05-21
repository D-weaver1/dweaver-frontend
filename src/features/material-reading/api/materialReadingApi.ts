import { http, httpBlob } from "../../../shared/api/http";
import type {
  MaterialLevelOption,
  MaterialLevelProgressStatus,
  MaterialReading,
  MaterialsProgressSummaryResponse,
} from "../model/materialReading.types";

export const materialReadingApi = {
  getLevels(materialId: string) {
    return http<MaterialLevelOption[]>(`/materials/${materialId}/levels`);
  },

  getReading(materialId: string, levelId: string) {
    return http<MaterialReading>(
      `/materials/${materialId}/levels/${levelId}/reading`,
    );
  },

  startLevel(materialId: string, levelId: string) {
    return http<{ status: MaterialLevelProgressStatus }>(
      `/materials/${materialId}/levels/${levelId}/start`,
      {
        method: "POST",
      },
    );
  },

  completeLevel(materialId: string, levelId: string) {
    return http<{ status: MaterialLevelProgressStatus }>(
      `/materials/${materialId}/levels/${levelId}/complete`,
      {
        method: "PATCH",
      },
    );
  },

  getMaterialsProgressSummary(materialIds?: string[]) {
    const query =
      materialIds && materialIds.length > 0
        ? `?materialIds=${materialIds.join(",")}`
        : "";

    return http<MaterialsProgressSummaryResponse>(
      `/materials/progress-summary${query}`,
    );
  },

  getPronunciationAudio(text: string, languageCode: string) {
    return httpBlob("/tts/pronunciation", {
      method: "POST",
      body: JSON.stringify({
        text,
        languageCode,
      }),
    });
  },
};
