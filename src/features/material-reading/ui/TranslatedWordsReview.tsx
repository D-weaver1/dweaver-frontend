import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TranslatedWord } from "../model/materialReading.types";
import type { LanguagePair } from "../../user-language-pairs/model/languagePair.types";
import { playPronunciation } from "../lib/playPronunciation";
import { http } from "@/shared/api/http";
import toast from "react-hot-toast";

type TranslatedWordsReviewProps = {
  words: TranslatedWord[];
  languagePair: LanguagePair;
  inDictionary?: boolean;
  header?: ReactNode;
};

export function TranslatedWordsReview({
  words,
  languagePair,
  header,
  inDictionary = false,
}: TranslatedWordsReviewProps) {
  const { t } = useTranslation();
  const [visibleTranslations, setVisibleTranslations] = useState<
    Record<string, boolean>
  >({});

  const targetLanguageCode = languagePair.targetLanguage.code;

  function toggleTranslation(materialWordId: string) {
    setVisibleTranslations((prev) => ({
      ...prev,
      [materialWordId]: !prev[materialWordId],
    }));
  }

  const handleAddWord = async (wordId: string) => {
    try {
      await http(`/dictionaries/add-word`, {
        method: "POST",
        body: JSON.stringify({
          languagePairId: languagePair.id,
          wordId: wordId,
        }),
      });
      toast.success("Word added to dictionary");
    } catch (err) {
      void err;
    }
  };

  return (
    <section className="translated-words-section">
      {!inDictionary && (
        <div className="translated-words-header">
          <h2 className="translated-words-title">
            {t("materialReading.translatedWords.title")}
          </h2>

          <p className="translated-words-description">
            {t("materialReading.translatedWords.description")}
          </p>
        </div>
      )}
      {header && <div className="translated-words-header">{header}</div>}

      <div className="translated-words-list">
        {words.map((word) => {
          const isTranslationVisible = inDictionary
            ? true
            : (visibleTranslations[word.materialWordId] ?? false);

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
                {!inDictionary && (
                  <button
                    type="button"
                    className="translated-word-secondary-button"
                    onClick={() => toggleTranslation(word.materialWordId)}
                  >
                    {isTranslationVisible
                      ? t("materialReading.translatedWords.hideTranslation")
                      : t("materialReading.translatedWords.showTranslation")}
                  </button>
                )}

                <button
                  type="button"
                  className="translated-word-secondary-button"
                  onClick={() =>
                    playPronunciation(word.targetText, targetLanguageCode)
                  }
                >
                  {t("materialReading.translatedWords.listen")}
                </button>

                {!inDictionary && (
                  <button
                    type="button"
                    className="translated-word-primary-button"
                    onClick={() => handleAddWord(word.wordId)}
                  >
                    {t("materialReading.translatedWords.addToDictionary")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
