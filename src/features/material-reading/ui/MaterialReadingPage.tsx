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

export function MaterialReadingPage() {
  const { materialId, levelId } = useParams<{
    materialId: string;
    levelId: string;
  }>();

  const { t } = useTranslation();

  const [reading, setReading] = useState<MaterialReading | null>(null);
  const [selectedUnit, setSelectedUnit] =
    useState<TranslatedReadingUnit | null>(null);
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

  if (!materialId || !levelId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        {t("materialReading.reading.notFound")}
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        {t("materialReading.reading.loading")}
      </main>
    );
  }

  if (errorMessage) {
    return <main className="mx-auto max-w-4xl px-4 py-8">{errorMessage}</main>;
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
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <div className="text-sm text-gray-500">
          {t("materialReading.reading.levelLabel")}
        </div>

        <h1 className="text-2xl font-semibold">{levelTitle}</h1>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <ReadingText
          units={reading.units}
          onTranslatedUnitClick={setSelectedUnit}
        />
      </section>

      {selectedUnit && (
        <WordPopup unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      )}
    </main>
  );
}
