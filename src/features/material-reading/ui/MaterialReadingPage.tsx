import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { materialReadingApi } from "../api/materialReadingApi";
import { MATERIAL_LEVEL_TRANSLATION_KEYS } from "../model/materialReading.constants";
import type {
  MaterialLevelProgressStatus,
  MaterialReading,
  TranslatedReadingUnit,
} from "../model/materialReading.types";
import { ReadingText } from "./ReadingText";
import { TranslatedWordsReview } from "./TranslatedWordsReview";
import { WordPopup } from "./WordPopup";

type WordPopupPosition = {
  top: number;
  left: number;
};

export function MaterialReadingPage() {
  const { materialId, levelId } = useParams<{
    materialId: string;
    levelId: string;
  }>();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const [reading, setReading] = useState<MaterialReading | null>(null);
  const [selectedUnit, setSelectedUnit] =
    useState<TranslatedReadingUnit | null>(null);
  const [popupPosition, setPopupPosition] = useState<WordPopupPosition | null>(
    null,
  );
  const [progressStatus, setProgressStatus] =
    useState<MaterialLevelProgressStatus>("not_started");
  const [isLoading, setIsLoading] = useState(Boolean(materialId && levelId));
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isCompleted = progressStatus === "completed";

  useEffect(() => {
    if (!materialId || !levelId) {
      return;
    }

    const currentMaterialId = materialId;
    const currentLevelId = levelId;
    let isMounted = true;

    async function loadReading() {
      try {
        await materialReadingApi.startLevel(currentMaterialId, currentLevelId);

        const data = await materialReadingApi.getReading(
          currentMaterialId,
          currentLevelId,
        );

        if (!isMounted) {
          return;
        }

        setReading(data);
        setProgressStatus(data.progressStatus);
        setSelectedUnit(null);
        setPopupPosition(null);
        setErrorMessage("");
      } catch {
        if (!isMounted) {
          return;
        }

        setErrorMessage(t("materialReading.reading.error"));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReading();

    return () => {
      isMounted = false;
    };
  }, [materialId, levelId, t]);

  async function handleCompleteReading() {
    if (!materialId || !levelId) {
      return;
    }

    try {
      setIsCompleting(true);

      const result = await materialReadingApi.completeLevel(
        materialId,
        levelId,
      );

      setProgressStatus(result.status);
      setReading((current) =>
        current
          ? {
              ...current,
              progressStatus: result.status,
            }
          : current,
      );
    } finally {
      setIsCompleting(false);
    }
  }

  function handleTranslatedUnitClick(
    unit: TranslatedReadingUnit,
    position: WordPopupPosition,
  ) {
    setSelectedUnit(unit);
    setPopupPosition(position);
  }

  function closePopup() {
    setSelectedUnit(null);
    setPopupPosition(null);
  }

  function goBackToLevels() {
    if (!materialId) {
      return;
    }

    navigate(`/materials/${materialId}`);
  }

  if (!materialId || !levelId) {
    return (
      <main className="material-reading-message">
        {t("materialReading.reading.notFound")}
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="material-reading-message">
        {t("materialReading.reading.loading")}
      </main>
    );
  }

  if (errorMessage) {
    return <main className="material-reading-message">{errorMessage}</main>;
  }

  if (!reading) {
    return null;
  }

  const translationKeys = MATERIAL_LEVEL_TRANSLATION_KEYS[reading.factor];

  const levelTitle = translationKeys
    ? t(translationKeys.title)
    : t("materialReading.levelSelect.fallbackLevelName", {
        factor: reading.factor,
      });

  return (
    <main className="material-reading-page">
      <button
        type="button"
        className="material-reading-back-button"
        onClick={goBackToLevels}
      >
        ← {t("materialReading.actions.backToLevels")}
      </button>

      <div className="material-reading-header">
        <div className="material-reading-label">
          {t("materialReading.reading.levelLabel")}
        </div>

        <div className="material-reading-title-row">
          <h1 className="material-reading-title">{levelTitle}</h1>

          <span
            className={`material-reading-status material-reading-status-${progressStatus}`}
          >
            {t(`materialReading.statuses.${progressStatus}`)}
          </span>
        </div>
      </div>

      <section className="material-reading-text-card">
        <ReadingText
          units={reading.units}
          onTranslatedUnitClick={handleTranslatedUnitClick}
        />
      </section>

      <div className="material-reading-actions">
        {!isCompleted && (
          <button
            type="button"
            className="material-reading-complete-button"
            onClick={handleCompleteReading}
            disabled={isCompleting}
          >
            {t("materialReading.actions.finishReading")}
          </button>
        )}

        <button
          type="button"
          className="material-reading-next-button"
          onClick={goBackToLevels}
          disabled={!isCompleted}
          title={
            isCompleted
              ? undefined
              : t("materialReading.actions.continueLocked")
          }
        >
          {t("materialReading.actions.continueToLevels")}
        </button>
      </div>

      {isCompleted && <TranslatedWordsReview words={reading.translatedWords} />}

      {selectedUnit && popupPosition && (
        <WordPopup
          unit={selectedUnit}
          position={popupPosition}
          onClose={closePopup}
        />
      )}
    </main>
  );
}
