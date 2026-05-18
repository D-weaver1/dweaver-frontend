import { useTranslation } from "react-i18next";
import type { TranslatedReadingUnit } from "../model/materialReading.types";

type WordPopupProps = {
  unit: TranslatedReadingUnit;
  onClose: () => void;
};

export function WordPopup({ unit, onClose }: WordPopupProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">
              {t("materialReading.wordPopup.translatedUnit")}
            </div>

            <div className="mt-1 text-xl font-semibold">{unit.targetText}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("materialReading.wordPopup.close")}
            className="rounded-full px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <div className="text-sm text-gray-500">
            {t("materialReading.wordPopup.original")}
          </div>

          <div className="mt-1 text-lg font-medium">{unit.sourceText}</div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
          >
            {t("materialReading.wordPopup.listen")}
          </button>

          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            {t("materialReading.wordPopup.addToDictionary")}
          </button>
        </div>
      </div>
    </div>
  );
}
