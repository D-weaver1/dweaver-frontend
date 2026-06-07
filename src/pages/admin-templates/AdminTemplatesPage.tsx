import { adminTemplatesApi } from "@/features/admin-templates/api/adminTemplatesApi";
import { useAuth } from "@/features/auth/model/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { PatchTemplatesRequest } from "./interfaces";

const QUESTION_TYPE_ORDER: PatchTemplatesRequest["questionType"][] = [
  "s2t_input",
  "s2t_translate",
  "t2s_translate",
];

function resolveQuestionTypeLabel(
  t: (key: string) => string,
  questionType: string,
) {
  if (questionType === "s2t_input") {
    return t("admin.templates.questionTypes.s2t_input");
  }

  if (questionType === "s2t_translate") {
    return t("admin.templates.questionTypes.s2t_translate");
  }

  if (questionType === "t2s_translate") {
    return t("admin.templates.questionTypes.t2s_translate");
  }

  return questionType;
}

function isEditableQuestionType(
  questionType: string,
): questionType is PatchTemplatesRequest["questionType"] {
  return QUESTION_TYPE_ORDER.includes(
    questionType as PatchTemplatesRequest["questionType"],
  );
}

export function AdminTemplatesPage() {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const {
    data: templates,
    isLoading,
    isError,
    error: templatesError,
  } = useQuery({
    queryKey: ["admin", "templates"],
    queryFn: () => adminTemplatesApi.getTemplates(),
    enabled: isAdmin,
  });

  const orderedTemplates = useMemo(() => {
    if (!templates) {
      return [];
    }

    const indexedQuestionTypes = new Map<string, number>(
      QUESTION_TYPE_ORDER.map((questionType, index) => [questionType, index]),
    );

    return [...templates].sort((a, b) => {
      const leftIndex = indexedQuestionTypes.get(a.questionType) ?? 999;
      const rightIndex = indexedQuestionTypes.get(b.questionType) ?? 999;

      return leftIndex - rightIndex;
    });
  }, [templates]);

  const patchTemplateMutation = useMutation({
    mutationFn: (payload: PatchTemplatesRequest) =>
      adminTemplatesApi.patchTemplates(payload),
    onSuccess: async () => {
      setMessage(t("admin.templates.updated"));
      setError("");

      await queryClient.invalidateQueries({
        queryKey: ["admin", "templates"],
      });
    },
    onError: (mutationError) => {
      setMessage("");
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : t("admin.templates.errors.updateFailed"),
      );
    },
  });

  function handleSubmitTemplate(
    event: FormEvent<HTMLFormElement>,
    questionType: string,
  ) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!isEditableQuestionType(questionType)) {
      setError(t("admin.templates.errors.unsupportedQuestionType"));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const languageTextTemplates = Array.from(formData.entries())
      .filter(([field]) => field.startsWith("template-"))
      .map(([field, value]) => {
        const languageId = field.slice("template-".length);
        const template = String(value ?? "").trim();

        return {
          languageId,
          template,
        };
      });

    if (
      languageTextTemplates.length === 0 ||
      languageTextTemplates.some((item) => !item.template)
    ) {
      setError(t("admin.templates.errors.templateRequired"));
      return;
    }

    patchTemplateMutation.mutate({
      questionType,
      languageTextTemplates,
    });
  }

  if (isAuthLoading || (isAdmin && isLoading)) {
    return (
      <section className="admin-page">
        <p className="materials-empty">{t("common.loading")}</p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="admin-page">
        <div className="admin-panel-card">
          <p className="page-label">{t("admin.common.adminPanel")}</p>
          <h1>{t("admin.common.accessDenied")}</h1>
          <p className="page-description">
            {t("admin.common.accessDeniedDescription")}
          </p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="admin-page">
        <div className="admin-panel-card">
          <p className="page-label">{t("admin.common.adminPanel")}</p>
          <h1>{t("admin.templates.title")}</h1>
          <p className="form-error">
            {templatesError instanceof Error
              ? templatesError.message
              : t("admin.templates.errors.loadFailed")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-panel-header">
        <div>
          <p className="page-label">{t("admin.common.adminPanel")}</p>
          <h1>{t("admin.templates.title")}</h1>
          <p className="page-description">{t("admin.templates.description")}</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}

      <div className="admin-panel-card">
        <h2>{t("admin.templates.manage")}</h2>

        {orderedTemplates.length === 0 ? (
          <p>{t("admin.templates.empty")}</p>
        ) : (
          <div className="admin-templates-list">
            {orderedTemplates.map((templateItem) => (
              <article key={templateItem.id} className="admin-template-block">
                <h3>
                  {resolveQuestionTypeLabel(t, templateItem.questionType)}
                </h3>

                <form
                  className="admin-template-languages"
                  onSubmit={(event) =>
                    handleSubmitTemplate(event, templateItem.questionType)
                  }
                >
                  {templateItem.languageTextTemplates.map(
                    (languageTemplate) => (
                      <label
                        key={`${templateItem.id}-${languageTemplate.languageId}`}
                        className="admin-template-form"
                      >
                        <span>
                          {languageTemplate.languageName} (
                          {languageTemplate.languageCode.toUpperCase()})
                        </span>
                        <input
                          name={`template-${languageTemplate.languageId}`}
                          defaultValue={languageTemplate.template ?? ""}
                          placeholder={t("admin.templates.templatePlaceholder")}
                          required
                        />
                      </label>
                    ),
                  )}

                  <div className="admin-template-languages__btn">
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={patchTemplateMutation.isPending}
                    >
                      {patchTemplateMutation.isPending
                        ? t("admin.templates.saving")
                        : t("admin.templates.save")}
                    </button>
                  </div>
                </form>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
