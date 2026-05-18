import { http } from "../../../shared/api/http";
import type {
  MaterialLevelOption,
  MaterialReading,
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
};
