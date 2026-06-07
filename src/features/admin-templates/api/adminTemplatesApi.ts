import { http } from "@/shared/api/http";
import type {
  GetTemplatesResponse,
  PatchTemplatesRequest,
} from "@/pages/admin-templates/interfaces";

export const adminTemplatesApi = {
  getTemplates() {
    return http<GetTemplatesResponse>("/templates");
  },

  patchTemplates(payload: PatchTemplatesRequest) {
    return http("/templates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
