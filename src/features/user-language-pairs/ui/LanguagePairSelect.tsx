import { useState } from "react";
import { languagePairApi } from "../api/languagePairApi";
import type { LanguagePair } from "../model/languagePair.types";
import { useLanguagePair } from "../model/useLanguagePair";
import { useTranslation } from "react-i18next";

function formatLanguagePair(languagePair: LanguagePair) {
  return `${languagePair.sourceLanguage.code.toUpperCase()} → ${languagePair.targetLanguage.code.toUpperCase()}`;
}

export function LanguagePairSelect() {
  const { t } = useTranslation();
  const {
    currentLanguagePair,
    selectedLanguagePairs,
    selectLanguagePair,
    addLanguagePair,
    isLoading,
  } = useLanguagePair();

  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [availablePairs, setAvailablePairs] = useState<LanguagePair[]>([]);
  const [isAvailableLoading, setIsAvailableLoading] = useState(false);

  function closeDropdown() {
    setIsOpen(false);
    setIsAdding(false);
  }

  function toggleDropdown() {
    setIsOpen((prev) => {
      if (prev) {
        setIsAdding(false);
      }

      return !prev;
    });
  }

  async function handleOpenAddMode() {
    setIsAdding(true);
    setIsAvailableLoading(true);

    try {
      const result = await languagePairApi.getAvailableLanguagePairs();
      setAvailablePairs(result);
    } finally {
      setIsAvailableLoading(false);
    }
  }

  async function handleSelect(languagePairId: string) {
    if (currentLanguagePair?.id === languagePairId) {
      closeDropdown();
      return;
    }

    await selectLanguagePair(languagePairId);
    closeDropdown();
  }

  async function handleAdd(languagePairId: string) {
    await addLanguagePair(languagePairId);
    closeDropdown();
  }

  return (
    <div className="language-pair-select">
      <button
        type="button"
        className="language-pair-select__button"
        onClick={toggleDropdown}
        disabled={isLoading}
      >
        {currentLanguagePair
          ? formatLanguagePair(currentLanguagePair)
          : t("languagePair.choosePair")}
      </button>

      {isOpen && (
        <div className="language-pair-select__dropdown">
          <div className="language-pair-select__section-title">
            {t("languagePair.yourPairs")}
          </div>

          {selectedLanguagePairs.length > 0 ? (
            selectedLanguagePairs.map((item) => (
              <button
                key={item.id}
                type="button"
                className="language-pair-select__item"
                onClick={() => handleSelect(item.languagePair.id)}
              >
                {formatLanguagePair(item.languagePair)}

                {currentLanguagePair?.id === item.languagePair.id && (
                  <span className="language-pair-select__current">
                    {t("languagePair.current")}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="language-pair-select__empty">
              {t("languagePair.noPairs")}
            </div>
          )}

          <button
            type="button"
            className="language-pair-select__add-button"
            onClick={handleOpenAddMode}
          >
            {t("languagePair.addPair")}
          </button>

          {isAdding && (
            <div className="language-pair-select__add-list">
              <div className="language-pair-select__section-title">
                {t("languagePair.availablePairs")}
              </div>

              {isAvailableLoading ? (
                <div className="language-pair-select__empty">
                  {t("common.loading")}
                </div>
              ) : availablePairs.length > 0 ? (
                availablePairs.map((pair) => (
                  <button
                    key={pair.id}
                    type="button"
                    className="language-pair-select__item"
                    onClick={() => handleAdd(pair.id)}
                  >
                    {formatLanguagePair(pair)}
                  </button>
                ))
              ) : (
                <div className="language-pair-select__empty">
                  {t("languagePair.noAvailablePairs")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
