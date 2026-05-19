import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
    isLoading,
  } = useLanguagePair();

  const [isOpen, setIsOpen] = useState(false);
  const languagePairSelectRef = useRef<HTMLDivElement | null>(null);

  function closeDropdown() {
    setIsOpen(false);
  }

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  async function handleSelect(languagePairId: string) {
    if (currentLanguagePair?.id === languagePairId) {
      closeDropdown();
      return;
    }

    await selectLanguagePair(languagePairId);
    closeDropdown();
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        languagePairSelectRef.current &&
        !languagePairSelectRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="language-pair-select" ref={languagePairSelectRef}>
      <button
        type="button"
        className="language-pair-select__button"
        onClick={toggleDropdown}
        disabled={isLoading}
        aria-expanded={isOpen}
      >
        <span className="language-pair-select__button-label">
          {currentLanguagePair
            ? formatLanguagePair(currentLanguagePair)
            : t("languagePair.choosePair")}
        </span>

        <span className="language-pair-select__chevron" aria-hidden="true">
          ▾
        </span>
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

          <div className="language-pair-select__divider" />

          <Link
            to="/settings/language-pairs"
            className="language-pair-select__manage-link"
            onClick={closeDropdown}
          >
            {t("languagePair.manageLanguagePairs")}
          </Link>
        </div>
      )}
    </div>
  );
}
