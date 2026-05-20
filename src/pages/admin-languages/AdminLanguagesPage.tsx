import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { adminLanguagesApi } from "@/features/admin-languages/api/adminLanguagesApi";
import type {
  Language,
  LanguagePair,
} from "@/features/admin-languages/model/adminLanguages.types";
import { useAuth } from "@/features/auth/model/useAuth";

function getAvailableTargetLanguages(
  sourceLanguageId: string,
  languages: Language[],
  languagePairs: LanguagePair[],
) {
  if (!sourceLanguageId) {
    return [];
  }

  const existingTargetLanguageIds = new Set(
    languagePairs
      .filter((pair) => pair.sourceLanguage.id === sourceLanguageId)
      .map((pair) => pair.targetLanguage.id),
  );

  return languages.filter(
    (language) =>
      language.id !== sourceLanguageId &&
      !existingTargetLanguageIds.has(language.id),
  );
}

function getFirstSourceLanguageWithAvailableTarget(
  languages: Language[],
  languagePairs: LanguagePair[],
) {
  return (
    languages.find(
      (language) =>
        getAvailableTargetLanguages(language.id, languages, languagePairs)
          .length > 0,
    )?.id ?? ""
  );
}

function resolveLanguagePairSelection(params: {
  languages: Language[];
  languagePairs: LanguagePair[];
  currentSourceLanguageId: string;
  currentTargetLanguageId: string;
}) {
  const {
    languages,
    languagePairs,
    currentSourceLanguageId,
    currentTargetLanguageId,
  } = params;

  const sourceLanguageExists = languages.some(
    (language) => language.id === currentSourceLanguageId,
  );

  const sourceLanguageId = sourceLanguageExists
    ? currentSourceLanguageId
    : getFirstSourceLanguageWithAvailableTarget(languages, languagePairs);

  const availableTargetLanguages = getAvailableTargetLanguages(
    sourceLanguageId,
    languages,
    languagePairs,
  );

  const targetLanguageStillAvailable = availableTargetLanguages.some(
    (language) => language.id === currentTargetLanguageId,
  );

  const targetLanguageId = targetLanguageStillAvailable
    ? currentTargetLanguageId
    : availableTargetLanguages[0]?.id ?? "";

  return {
    sourceLanguageId,
    targetLanguageId,
  };
}

export function AdminLanguagesPage() {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [languagePairs, setLanguagePairs] = useState<LanguagePair[]>([]);

  const [languageName, setLanguageName] = useState("");
  const [languageCode, setLanguageCode] = useState("");

  const [sourceLanguageId, setSourceLanguageId] = useState("");
  const [targetLanguageId, setTargetLanguageId] = useState("");

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isCreatingLanguage, setIsCreatingLanguage] = useState(false);
  const [isCreatingPair, setIsCreatingPair] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const sourceLanguageOptions = useMemo(
    () =>
      languages.filter(
        (language) =>
          getAvailableTargetLanguages(language.id, languages, languagePairs)
            .length > 0,
      ),
    [languages, languagePairs],
  );

  const targetLanguageOptions = useMemo(
    () =>
      getAvailableTargetLanguages(
        sourceLanguageId,
        languages,
        languagePairs,
      ),
    [languages, languagePairs, sourceLanguageId],
  );

  useEffect(() => {
    if (isAuthLoading || !isAdmin) {
      return;
    }

    let isCancelled = false;

    Promise.all([
      adminLanguagesApi.getLanguages(),
      adminLanguagesApi.getLanguagePairs(),
    ])
      .then(([languagesResponse, languagePairsResponse]) => {
        if (isCancelled) {
          return;
        }

        const resolvedSelection = resolveLanguagePairSelection({
          languages: languagesResponse,
          languagePairs: languagePairsResponse,
          currentSourceLanguageId: sourceLanguageId,
          currentTargetLanguageId: targetLanguageId,
        });

        setLanguages(languagesResponse);
        setLanguagePairs(languagePairsResponse);
        setSourceLanguageId(resolvedSelection.sourceLanguageId);
        setTargetLanguageId(resolvedSelection.targetLanguageId);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : t("admin.languages.errors.loadFailed"),
        );
      })
      .finally(() => {
        if (isCancelled) {
          return;
        }

        setIsLoadingPage(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, isAdmin, t]);

  async function reloadData() {
    const [languagesResponse, languagePairsResponse] = await Promise.all([
      adminLanguagesApi.getLanguages(),
      adminLanguagesApi.getLanguagePairs(),
    ]);

    const resolvedSelection = resolveLanguagePairSelection({
      languages: languagesResponse,
      languagePairs: languagePairsResponse,
      currentSourceLanguageId: sourceLanguageId,
      currentTargetLanguageId: targetLanguageId,
    });

    setLanguages(languagesResponse);
    setLanguagePairs(languagePairsResponse);
    setSourceLanguageId(resolvedSelection.sourceLanguageId);
    setTargetLanguageId(resolvedSelection.targetLanguageId);
  }

  function handleSourceLanguageChange(nextSourceLanguageId: string) {
    setSourceLanguageId(nextSourceLanguageId);

    const nextTargetLanguageOptions = getAvailableTargetLanguages(
      nextSourceLanguageId,
      languages,
      languagePairs,
    );

    setTargetLanguageId(nextTargetLanguageOptions[0]?.id ?? "");
  }

  async function handleCreateLanguage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      setIsCreatingLanguage(true);

      await adminLanguagesApi.createLanguage({
        name: languageName,
        code: languageCode,
      });

      setMessage(t("admin.languages.languageCreated"));
      setLanguageName("");
      setLanguageCode("");

      await reloadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("admin.languages.errors.createLanguageFailed"),
      );
    } finally {
      setIsCreatingLanguage(false);
    }
  }

  async function handleCreateLanguagePair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!sourceLanguageId || !targetLanguageId) {
      setError(t("admin.languages.errors.chooseLanguages"));
      return;
    }

    if (sourceLanguageId === targetLanguageId) {
      setError(t("admin.languages.errors.sameLanguages"));
      return;
    }

    const pairAlreadyExists = languagePairs.some(
      (pair) =>
        pair.sourceLanguage.id === sourceLanguageId &&
        pair.targetLanguage.id === targetLanguageId,
    );

    if (pairAlreadyExists) {
      setError(t("admin.languages.errors.pairAlreadyExists"));
      return;
    }

    try {
      setIsCreatingPair(true);

      await adminLanguagesApi.createLanguagePair({
        sourceLanguageId,
        targetLanguageId,
      });

      setMessage(t("admin.languages.pairCreated"));

      await reloadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("admin.languages.errors.createPairFailed"),
      );
    } finally {
      setIsCreatingPair(false);
    }
  }

  if (isAuthLoading || (isAdmin && isLoadingPage)) {
    return (
      <section className="admin-page">
        <p className="materials-empty">{t("common.loading")}</p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="admin-page">
        <div className="admin-panel-card">
          <p className="page-label">{t("admin.common.adminPanel")}</p>
          <h1>{t("admin.common.accessDenied")}</h1>
          <p className="page-description">
            {t("admin.common.accessDeniedDescription")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-panel-header">
        <div>
          <p className="page-label">{t("admin.common.adminPanel")}</p>
          <h1>{t("admin.languages.title")}</h1>
          <p className="page-description">
            {t("admin.languages.description")}
          </p>
        </div>

        <button type="button" className="secondary-button" onClick={reloadData}>
          {t("admin.common.refresh")}
        </button>
      </div>

      {(error || message) && (
        <div className="admin-panel-card">
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
        </div>
      )}

      <div className="admin-two-column-grid">
        <form
          className="admin-panel-card admin-ai-form"
          onSubmit={handleCreateLanguage}
        >
          <div>
            <p className="page-label">{t("admin.languages.language")}</p>
            <h2>{t("admin.languages.addLanguage")}</h2>
          </div>

          <label>
            {t("admin.languages.languageName")}
            <input
              value={languageName}
              onChange={(event) => setLanguageName(event.target.value)}
              placeholder={t("admin.languages.languageNamePlaceholder")}
              required
            />
          </label>

          <label>
            {t("admin.languages.languageCode")}
            <input
              value={languageCode}
              onChange={(event) =>
                setLanguageCode(event.target.value.toLowerCase())
              }
              placeholder={t("admin.languages.languageCodePlaceholder")}
              required
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={isCreatingLanguage}
          >
            {isCreatingLanguage
              ? t("admin.languages.adding")
              : t("admin.languages.addLanguageButton")}
          </button>
        </form>

        <form
          className="admin-panel-card admin-ai-form"
          onSubmit={handleCreateLanguagePair}
        >
          <div>
            <p className="page-label">{t("admin.languages.languagePair")}</p>
            <h2>{t("admin.languages.addPair")}</h2>
          </div>

          <label>
            {t("admin.languages.sourceLanguage")}
            <select
              value={sourceLanguageId}
              onChange={(event) =>
                handleSourceLanguageChange(event.target.value)
              }
              required
            >
              {sourceLanguageOptions.length === 0 ? (
                <option value="">
                  {t("admin.languages.noAvailableSourceLanguages")}
                </option>
              ) : (
                sourceLanguageOptions.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name} ({language.code})
                  </option>
                ))
              )}
            </select>
          </label>

          <label>
            {t("admin.languages.targetLanguage")}
            <select
              value={targetLanguageId}
              onChange={(event) => setTargetLanguageId(event.target.value)}
              required
            >
              {targetLanguageOptions.length === 0 ? (
                <option value="">
                  {t("admin.languages.noAvailableLanguages")}
                </option>
              ) : (
                targetLanguageOptions.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name} ({language.code})
                  </option>
                ))
              )}
            </select>
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={
              isCreatingPair ||
              languages.length < 2 ||
              !sourceLanguageId ||
              !targetLanguageId ||
              targetLanguageOptions.length === 0
            }
          >
            {isCreatingPair
              ? t("admin.languages.adding")
              : t("admin.languages.addPairButton")}
          </button>
        </form>
      </div>

      <div className="admin-two-column-grid">
        <div className="admin-panel-card">
          <div>
            <p className="page-label">{t("admin.languages.directory")}</p>
            <h2>{t("admin.languages.addedLanguages")}</h2>
          </div>

          {languages.length === 0 ? (
            <p className="materials-empty">
              {t("admin.languages.noLanguages")}
            </p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("admin.languages.name")}</th>
                    <th>{t("admin.languages.code")}</th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((language) => (
                    <tr key={language.id}>
                      <td>{language.name}</td>
                      <td>{language.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-panel-card">
          <div>
            <p className="page-label">{t("admin.languages.directions")}</p>
            <h2>{t("admin.languages.addedPairs")}</h2>
          </div>

          {languagePairs.length === 0 ? (
            <p className="materials-empty">{t("admin.languages.noPairs")}</p>
          ) : (
            <div className="admin-language-pair-list">
              {languagePairs.map((pair) => (
                <div key={pair.id} className="admin-language-pair-item">
                  <span>
                    {pair.sourceLanguage.name} ({pair.sourceLanguage.code})
                  </span>
                  <strong>→</strong>
                  <span>
                    {pair.targetLanguage.name} ({pair.targetLanguage.code})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}