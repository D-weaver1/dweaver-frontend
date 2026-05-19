import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TranslatedWord } from "../model/materialReading.types";

type TranslatedWordsReviewProps = {
  words: TranslatedWord[];
};

export function TranslatedWordsReview({ words }: TranslatedWordsReviewProps) {
  const { t } = useTranslation();
  const [visibleTranslations, setVisibleTranslations] = useState<
    Record<string, boolean>
  >({});

  function toggleTranslation(materialWordId: string) {
    setVisibleTranslations((prev) => ({
      ...prev,
      [materialWordId]: !prev[materialWordId],
    }));
  }

  return (
    <section className="translated-words-section">
      <div className="translated-words-header">
        <h2 className="translated-words-title">
          {t("materialReading.translatedWords.title")}
        </h2>

        <p className="translated-words-description">
          {t("materialReading.translatedWords.description")}
        </p>
      </div>

      <div className="translated-words-list">
        {words.map((word) => {
          const isTranslationVisible =
            visibleTranslations[word.materialWordId] ?? false;

          return (
            <div key={word.materialWordId} className="translated-word-card">
              <div className="translated-word-main">
                <div className="translated-word-source">{word.sourceText}</div>

                {isTranslationVisible && (
                  <div className="translated-word-target">
                    {word.targetText}
                  </div>
                )}
              </div>

              <div className="translated-word-actions">
                <button
                  type="button"
                  className="translated-word-secondary-button"
                  onClick={() => toggleTranslation(word.materialWordId)}
                >
                  {isTranslationVisible
                    ? t("materialReading.translatedWords.hideTranslation")
                    : t("materialReading.translatedWords.showTranslation")}
                </button>

                <button
                  type="button"
                  className="translated-word-secondary-button"
                >
                  {t("materialReading.translatedWords.listen")}
                </button>

                <button
                  type="button"
                  className="translated-word-primary-button"
                >
                  {t("materialReading.translatedWords.addToDictionary")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
