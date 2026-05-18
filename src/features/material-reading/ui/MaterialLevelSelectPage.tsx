import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { materialReadingApi } from "../api/materialReadingApi";
import { MATERIAL_LEVEL_TRANSLATION_KEYS } from "../model/materialReading.constants";
import type { MaterialLevelOption } from "../model/materialReading.types";

export function MaterialLevelSelectPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [levels, setLevels] = useState<MaterialLevelOption[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(materialId));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!materialId) {
      return;
    }

    const currentMaterialId = materialId;
    let isMounted = true;

    async function loadLevels() {
      try {
        const data = await materialReadingApi.getLevels(currentMaterialId);

        if (!isMounted) {
          return;
        }

        setLevels(data);
        setErrorMessage("");
      } catch {
        if (!isMounted) {
          return;
        }

        setErrorMessage(t("materialReading.levelSelect.error"));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLevels();

    return () => {
      isMounted = false;
    };
  }, [materialId, t]);

  if (!materialId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        {t("materialReading.levelSelect.notFound")}
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        {t("materialReading.levelSelect.loading")}
      </main>
    );
  }

  if (errorMessage) {
    return <main className="mx-auto max-w-4xl px-4 py-8">{errorMessage}</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">
        {t("materialReading.levelSelect.title")}
      </h1>

      <p className="mt-2 text-gray-600">
        {t("materialReading.levelSelect.description")}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {levels.map((level) => {
          const translationKeys = MATERIAL_LEVEL_TRANSLATION_KEYS[level.factor];

          const title = translationKeys
            ? t(translationKeys.title)
            : t("materialReading.levelSelect.fallbackLevelName", {
                factor: level.factor,
              });

          return (
            <button
              key={level.id}
              type="button"
              onClick={() =>
                navigate(`/materials/${materialId}/levels/${level.id}`)
              }
              className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-400 hover:shadow-md"
            >
              <div className="text-lg font-semibold">{title}</div>

              <div className="mt-1 text-sm text-gray-500">
                {t("materialReading.levelSelect.translatedPercent", {
                  factor: level.factor,
                })}
              </div>

              {translationKeys && (
                <p className="mt-3 text-sm text-gray-600">
                  {t(translationKeys.description)}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
