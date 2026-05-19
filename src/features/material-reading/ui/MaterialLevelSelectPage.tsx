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
      <main className="material-reading-message">
        {t("materialReading.levelSelect.notFound")}
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="material-reading-message">
        {t("materialReading.levelSelect.loading")}
      </main>
    );
  }

  if (errorMessage) {
    return <main className="material-reading-message">{errorMessage}</main>;
  }

  return (
    <main className="material-reading-page">
      <button
        type="button"
        className="material-reading-back-button"
        onClick={() => navigate("/materials")}
      >
        ← {t("materialReading.actions.backToMaterials")}
      </button>
      <header className="material-level-select-header">
        <p className="material-level-select-kicker">d-weaver</p>

        <h1 className="material-reading-page-title">
          {t("materialReading.levelSelect.title")}
        </h1>

        <p className="material-reading-page-description">
          {t("materialReading.levelSelect.description")}
        </p>
      </header>

      <div className="material-level-grid">
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
              className="material-level-card"
            >
              <div className="material-level-card-top">
                <div className="material-level-card-badge">{level.factor}%</div>
              </div>

              <h2 className="material-level-card-title">{title}</h2>

              <p className="material-level-card-percent">
                {t("materialReading.levelSelect.translatedPercent", {
                  factor: level.factor,
                })}
              </p>
              <span
                className={`material-level-status material-level-status-${level.status}`}
              >
                {t(`materialReading.statuses.${level.status}`)}
              </span>
              {translationKeys && (
                <p className="material-level-card-description">
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
