import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { materialReadingApi } from "../api/materialReadingApi";
import { MATERIAL_LEVEL_TRANSLATION_KEYS } from "../model/materialReading.constants";
import type {
  MaterialReading,
  TranslatedReadingUnit,
} from "../model/materialReading.types";
import { ReadingText } from "./ReadingText";
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

  const { t } = useTranslation();

  const [reading, setReading] = useState<MaterialReading | null>(null);
  const [selectedUnit, setSelectedUnit] =
    useState<TranslatedReadingUnit | null>(null);
  const [popupPosition, setPopupPosition] = useState<WordPopupPosition | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(materialId && levelId));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!materialId || !levelId) {
      return;
    }

    const currentMaterialId = materialId;
    const currentLevelId = levelId;
    let isMounted = true;

    async function loadReading() {
      try {
        const data = await materialReadingApi.getReading(
          currentMaterialId,
          currentLevelId,
        );

        if (!isMounted) {
          return;
        }

        setReading(data);
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
      <div className="material-reading-header">
        <div className="material-reading-label">
          {t("materialReading.reading.levelLabel")}
        </div>

        <h1 className="material-reading-title">{levelTitle}</h1>
      </div>

      <section className="material-reading-text-card">
        <ReadingText
          units={reading.units}
          onTranslatedUnitClick={handleTranslatedUnitClick}
        />
      </section>

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
