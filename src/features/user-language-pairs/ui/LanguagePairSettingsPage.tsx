import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { languagePairApi } from "../api/languagePairApi";
import type {
  LanguagePair,
  LanguagePairSettingsState,
  UserLanguagePair,
} from "../model/languagePair.types";
import { useLanguagePair } from "../model/useLanguagePair";

function formatFullLanguagePair(languagePair: LanguagePair) {
  return `${languagePair.sourceLanguage.name} (${languagePair.sourceLanguage.code}) → ${languagePair.targetLanguage.name} (${languagePair.targetLanguage.code})`;
}

function formatShortLanguagePair(languagePair: LanguagePair) {
  return `${languagePair.sourceLanguage.code.toUpperCase()} → ${languagePair.targetLanguage.code.toUpperCase()}`;
}

function normalizeStatus(status: UserLanguagePair["status"]) {
  return String(status).toUpperCase();
}

function isActivePair(userLanguagePair: UserLanguagePair) {
  return normalizeStatus(userLanguagePair.status) === "ACTIVE";
}

function isHiddenPair(userLanguagePair: UserLanguagePair) {
  return normalizeStatus(userLanguagePair.status) === "HIDDEN";
}

function matchesLanguagePairSearch(
  languagePair: LanguagePair,
  searchValue: string,
) {
  const query = searchValue.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const searchableText = [
    languagePair.sourceLanguage.name,
    languagePair.sourceLanguage.code,
    languagePair.targetLanguage.name,
    languagePair.targetLanguage.code,
    formatFullLanguagePair(languagePair),
    formatShortLanguagePair(languagePair),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

export function LanguagePairSettingsPage() {
  const { t } = useTranslation();

  const {
    currentLanguagePair,
    loadLanguagePairState,
    selectLanguagePair,
    addLanguagePair,
    isLoading,
  } = useLanguagePair();

  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const currentLanguagePairId = currentLanguagePair?.id ?? null;
  const previousCurrentLanguagePairIdRef = useRef<string | null>(
    currentLanguagePairId,
  );

  const [settingsState, setSettingsState] =
    useState<LanguagePairSettingsState | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [availablePairs, setAvailablePairs] = useState<LanguagePair[]>([]);
  const [availablePairSearch, setAvailablePairSearch] = useState("");
  const [isAvailableLoading, setIsAvailableLoading] = useState(false);
  const [openedActionsId, setOpenedActionsId] = useState<string | null>(null);
  const [mutatingPairId, setMutatingPairId] = useState<string | null>(null);

  const loadSettingsState = useCallback(async () => {
    setIsSettingsLoading(true);

    try {
      const result = await languagePairApi.getSettingsState();
      setSettingsState(result);
      return result;
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    languagePairApi
      .getSettingsState()
      .then((result) => {
        if (isCancelled) {
          return;
        }

        setSettingsState(result);
      })
      .finally(() => {
        if (isCancelled) {
          return;
        }

        setIsSettingsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const previousId = previousCurrentLanguagePairIdRef.current;

    previousCurrentLanguagePairIdRef.current = currentLanguagePairId;

    if (previousId === currentLanguagePairId) {
      return;
    }

    let isCancelled = false;

    languagePairApi.getSettingsState().then((result) => {
      if (isCancelled) {
        return;
      }

      setSettingsState(result);
    });

    return () => {
      isCancelled = true;
    };
  }, [currentLanguagePairId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setOpenedActionsId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenedActionsId(null);
        setIsAddPanelOpen(false);
        setAvailablePairSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const userLanguagePairs = settingsState?.userLanguagePairs ?? [];
  const pageCurrentLanguagePair = currentLanguagePair;

  const linkedLanguagePairIds = useMemo(
    () => new Set(userLanguagePairs.map((item) => item.languagePair.id)),
    [userLanguagePairs],
  );

  const filteredAvailablePairs = useMemo(
    () => availablePairs.filter((pair) => !linkedLanguagePairIds.has(pair.id)),
    [availablePairs, linkedLanguagePairIds],
  );

  const visibleAvailablePairs = useMemo(
    () =>
      filteredAvailablePairs.filter((pair) =>
        matchesLanguagePairSearch(pair, availablePairSearch),
      ),
    [filteredAvailablePairs, availablePairSearch],
  );

  async function loadAvailablePairs() {
    setIsAvailableLoading(true);

    try {
      const result = await languagePairApi.getAvailableLanguagePairs();
      setAvailablePairs(result);
    } finally {
      setIsAvailableLoading(false);
    }
  }

  function closeAddPanel() {
    setIsAddPanelOpen(false);
    setAvailablePairSearch("");
  }

  async function handleToggleAddPanel() {
    const nextIsOpen = !isAddPanelOpen;

    setIsAddPanelOpen(nextIsOpen);

    if (!nextIsOpen) {
      setAvailablePairSearch("");
      return;
    }

    await loadAvailablePairs();
  }

  async function refreshAll(shouldReloadAvailablePairs = false) {
    await Promise.all([loadSettingsState(), loadLanguagePairState()]);

    if (shouldReloadAvailablePairs && isAddPanelOpen) {
      await loadAvailablePairs();
    }
  }

  async function handleAddLanguagePair(languagePairId: string) {
    setMutatingPairId(languagePairId);

    try {
      await addLanguagePair(languagePairId);
      await refreshAll();
      setAvailablePairs((prev) =>
        prev.filter((pair) => pair.id !== languagePairId),
      );
      closeAddPanel();
    } finally {
      setMutatingPairId(null);
    }
  }

  async function handleSelectLanguagePair(languagePairId: string) {
    setMutatingPairId(languagePairId);

    try {
      await selectLanguagePair(languagePairId);
      setOpenedActionsId(null);
      await refreshAll();
    } finally {
      setMutatingPairId(null);
    }
  }

  async function handleHideLanguagePair(languagePairId: string) {
    setMutatingPairId(languagePairId);

    try {
      await languagePairApi.hideLanguagePair(languagePairId);
      setOpenedActionsId(null);
      await refreshAll();
    } finally {
      setMutatingPairId(null);
    }
  }

  async function handleActivateLanguagePair(languagePairId: string) {
    setMutatingPairId(languagePairId);

    try {
      await languagePairApi.activateLanguagePair(languagePairId);
      setOpenedActionsId(null);
      await refreshAll();
    } finally {
      setMutatingPairId(null);
    }
  }

  async function handleRemoveLanguagePair(languagePairId: string) {
    setMutatingPairId(languagePairId);

    try {
      await languagePairApi.removeLanguagePair(languagePairId);
      setOpenedActionsId(null);
      await refreshAll(true);
    } finally {
      setMutatingPairId(null);
    }
  }

  return (
    <section className="language-pair-settings">
      <div className="language-pair-settings__header">
        <div>
          <h1 className="language-pair-settings__title">
            {t("languagePair.settingsTitle")}
          </h1>

          <p className="language-pair-settings__description">
            {t("languagePair.settingsDescription")}
          </p>
        </div>

        <button
          type="button"
          className="language-pair-settings__add-main-button"
          onClick={handleToggleAddPanel}
          disabled={isLoading || isSettingsLoading || isAvailableLoading}
        >
          {t("languagePair.addNewPair")}
        </button>
      </div>

      {isAddPanelOpen && (
        <div className="language-pair-settings__add-panel">
          <div className="language-pair-settings__add-panel-header">
            <div>
              <h2 className="language-pair-settings__subtitle">
                {t("languagePair.availablePairs")}
              </h2>

              <p className="language-pair-settings__muted">
                {t("languagePair.availablePairsDescription")}
              </p>
            </div>

            <button
              type="button"
              className="language-pair-settings__ghost-button"
              onClick={closeAddPanel}
            >
              {t("common.close")}
            </button>
          </div>

          <input
            type="search"
            className="language-pair-settings__search-input"
            value={availablePairSearch}
            onChange={(event) => setAvailablePairSearch(event.target.value)}
            placeholder={t("languagePair.searchPlaceholder")}
            disabled={isAvailableLoading}
          />

          {isAvailableLoading ? (
            <div className="language-pair-settings__empty">
              {t("common.loading")}
            </div>
          ) : visibleAvailablePairs.length > 0 ? (
            <div className="language-pair-settings__available-list">
              {visibleAvailablePairs.map((pair) => {
                const isMutating = mutatingPairId === pair.id;

                return (
                  <div
                    key={pair.id}
                    className="language-pair-settings__available-row"
                  >
                    <div className="language-pair-settings__row-main">
                      <div className="language-pair-settings__icon">
                        {pair.sourceLanguage.code.toUpperCase()}
                      </div>

                      <div className="language-pair-settings__pair-info">
                        <div className="language-pair-settings__pair-name">
                          {formatFullLanguagePair(pair)}
                        </div>

                        <div className="language-pair-settings__pair-code">
                          {formatShortLanguagePair(pair)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="language-pair-settings__select-button"
                      onClick={() => handleAddLanguagePair(pair.id)}
                      disabled={isMutating}
                    >
                      {isMutating ? t("common.loading") : t("languagePair.add")}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="language-pair-settings__empty">
              {filteredAvailablePairs.length > 0
                ? t("languagePair.notFoundBySearch")
                : t("languagePair.noAvailablePairs")}
            </div>
          )}
        </div>
      )}

      <div className="language-pair-settings__card">
        <div className="language-pair-settings__card-header">
          <div>
            <h2 className="language-pair-settings__subtitle">
              {t("languagePair.selectedPairs")}
            </h2>

            <p className="language-pair-settings__muted">
              {t("languagePair.linkedPairsHint")}
            </p>
          </div>
        </div>

        {isSettingsLoading ? (
          <div className="language-pair-settings__empty">
            {t("common.loading")}
          </div>
        ) : userLanguagePairs.length > 0 ? (
          <div className="language-pair-settings__list">
            {userLanguagePairs.map((item) => {
              const languagePair = item.languagePair;
              const isActive = isActivePair(item);
              const isHidden = isHiddenPair(item);
              const isCurrent =
                isActive && pageCurrentLanguagePair?.id === languagePair.id;
              const isMutating = mutatingPairId === languagePair.id;

              return (
                <div
                  key={item.id}
                  className={`language-pair-settings__row${
                    isHidden ? " language-pair-settings__row--hidden" : ""
                  }`}
                >
                  <div className="language-pair-settings__row-main">
                    <div className="language-pair-settings__icon">
                      {languagePair.sourceLanguage.code.toUpperCase()}
                    </div>

                    <div className="language-pair-settings__pair-info">
                      <div className="language-pair-settings__pair-title-row">
                        <div className="language-pair-settings__pair-name">
                          {formatFullLanguagePair(languagePair)}
                        </div>

                        {isCurrent ? (
                          <span className="language-pair-settings__current-inline-badge">
                            {t("languagePair.current")}
                          </span>
                        ) : (
                          <span
                            className={`language-pair-settings__status-badge${
                              isHidden
                                ? " language-pair-settings__status-badge--hidden"
                                : ""
                            }`}
                          >
                            {isHidden
                              ? t("languagePair.statusHidden")
                              : t("languagePair.statusActive")}
                          </span>
                        )}
                      </div>

                      <div className="language-pair-settings__pair-code">
                        {formatShortLanguagePair(languagePair)}
                      </div>
                    </div>
                  </div>

                  <div className="language-pair-settings__row-actions">
                    {isActive && !isCurrent && (
                      <button
                        type="button"
                        className="language-pair-settings__select-button"
                        onClick={() =>
                          handleSelectLanguagePair(languagePair.id)
                        }
                        disabled={isMutating}
                      >
                        {t("languagePair.select")}
                      </button>
                    )}

                    <div
                      className="language-pair-settings__actions-wrapper"
                      ref={
                        openedActionsId === item.id ? actionsMenuRef : undefined
                      }
                    >
                      <button
                        type="button"
                        className="language-pair-settings__dots-button"
                        onClick={() =>
                          setOpenedActionsId((prev) =>
                            prev === item.id ? null : item.id,
                          )
                        }
                        aria-label={t("languagePair.actions")}
                        disabled={isMutating}
                      >
                        ⋯
                      </button>

                      {openedActionsId === item.id && (
                        <div className="language-pair-settings__actions-menu">
                          {isHidden ? (
                            <button
                              type="button"
                              className="language-pair-settings__actions-item"
                              onClick={() =>
                                handleActivateLanguagePair(languagePair.id)
                              }
                            >
                              <span aria-hidden="true"></span>
                              {t("languagePair.activate")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="language-pair-settings__actions-item"
                              onClick={() =>
                                handleHideLanguagePair(languagePair.id)
                              }
                            >
                              <span aria-hidden="true"></span>
                              {t("languagePair.hide")}
                            </button>
                          )}

                          <button
                            type="button"
                            className="language-pair-settings__actions-item language-pair-settings__actions-item--danger"
                            onClick={() =>
                              handleRemoveLanguagePair(languagePair.id)
                            }
                          >
                            <span aria-hidden="true"></span>
                            {t("languagePair.delete")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="language-pair-settings__empty">
            {t("languagePair.noSelectedPairsDescription")}
          </div>
        )}
      </div>
    </section>
  );
}
