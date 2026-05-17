import { http } from "@/shared/api/http";
import type {
  GetMaterialsParams,
  GetMaterialsResponse,
} from "../model/material.types";

export const materialsApi = {
  async getMaterials(
    params: GetMaterialsParams,
  ): Promise<GetMaterialsResponse> {
    const searchParams = new URLSearchParams();

    if (params.search?.trim()) {
      searchParams.set("search", params.search.trim());
    }

    if (params.levels && params.levels.length > 0) {
      searchParams.set("levels", params.levels.join(","));
    }

    const queryString = searchParams.toString();

    return http<GetMaterialsResponse>(
      `/materials${queryString ? `?${queryString}` : ""}`,
    );
  },
};
