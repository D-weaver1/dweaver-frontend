import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TranslatedReadingUnit } from "../model/materialReading.types";
import type { LanguagePair } from "../../user-language-pairs/model/languagePair.types";
import { playPronunciation } from "../lib/playPronunciation";
import toast from "react-hot-toast";
import { http } from "@/shared/api/http";

type WordPopupPosition = {
  top: number;
  left: number;
};

type WordPopupProps = {
  unit: TranslatedReadingUnit;
  position: WordPopupPosition;
  languagePair: LanguagePair;
  onClose: () => void;
};

export function WordPopup({
  unit,
  position,
  languagePair,
  onClose,
}: WordPopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement | null>(null);

  const targetLanguageCode = languagePair.targetLanguage.code;

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (popupRef.current?.contains(target)) {
        return;
      }

      onClose();
    }

    function handleEscapePress(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleEscapePress);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, [onClose]);

  const handleAddWord = async () => {
    try {
      await http(`/dictionaries/add-word`, {
        method: "POST",
        body: JSON.stringify({
          languagePairId: languagePair.id,
          wordId: unit.wordId,
        }),
      });
      toast.success("Word added to dictionary");
    } catch (err) {
      void err;
    }
  };

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-modal="false"
      className="word-floating-popup"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="word-floating-popup-arrow" />

      <div className="word-floating-popup-header">
        <div>
          <p className="word-floating-popup-label">
            {t("materialReading.wordPopup.original")}
          </p>

          <p className="word-floating-popup-original">{unit.sourceText}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("materialReading.wordPopup.close")}
          className="word-floating-popup-close"
        >
          ×
        </button>
      </div>

      <div className="word-floating-popup-translation">
        <span>{unit.targetText}</span>
      </div>

      <div className="word-floating-popup-actions">
        <button
          type="button"
          className="word-floating-popup-secondary"
          onClick={() => playPronunciation(unit.targetText, targetLanguageCode)}
        >
          {t("materialReading.wordPopup.listen")}
        </button>

        <button
          type="button"
          className="word-floating-popup-primary"
          onClick={handleAddWord}
        >
          {t("materialReading.wordPopup.addToDictionary")}
        </button>
      </div>
    </div>
  );
}
