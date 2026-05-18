import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { adminAiAnalysisApi } from "@/features/admin-ai-analysis/api/adminAiAnalysisApi";
import type {
  AiAnalysisJob,
  Language,
  LanguagePair,
} from "@/features/admin-ai-analysis/model/adminAiAnalysis.types";
import { useAuth } from "@/features/auth/model/useAuth";

const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const ACTIVE_JOB_STATUSES = new Set([
  "pending",
  "processing",
  "waiting_rate_limit",
]);

export function AdminAiAnalysisPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [languagePairs, setLanguagePairs] = useState<LanguagePair[]>([]);
  const [jobs, setJobs] = useState<AiAnalysisJob[]>([]);

  const [title, setTitle] = useState("");
  const [languageLevel, setLanguageLevel] = useState("A2");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [originalText, setOriginalText] = useState("");

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const sourceLanguageOptions = useMemo(() => {
    const availableSourceCodes = new Set(
      languagePairs.map((pair) => pair.sourceLanguage.code),
    );

    return languages.filter((language) =>
      availableSourceCodes.has(language.code),
    );
  }, [languages, languagePairs]);

  const targetLanguageOptions = useMemo(() => {
    const availableTargetCodes = new Set(
      languagePairs
        .filter((pair) => pair.sourceLanguage.code === sourceLanguage)
        .map((pair) => pair.targetLanguage.code),
    );

    return languages.filter((language) =>
      availableTargetCodes.has(language.code),
    );
  }, [languages, languagePairs, sourceLanguage]);

  const hasActiveJobs = jobs.some((job) => ACTIVE_JOB_STATUSES.has(job.status));

  const loadJobs = useCallback(async () => {
    try {
      const jobsResponse = await adminAiAnalysisApi.getJobs();
      setJobs(jobsResponse);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading || !isAdmin) {
      return;
    }

    let isCancelled = false;

    Promise.all([
      adminAiAnalysisApi.getLanguages(),
      adminAiAnalysisApi.getLanguagePairs(),
      adminAiAnalysisApi.getJobs(),
    ])
      .then(([languagesResponse, languagePairsResponse, jobsResponse]) => {
        if (isCancelled) {
          return;
        }

        setLanguages(languagesResponse);
        setLanguagePairs(languagePairsResponse);
        setJobs(jobsResponse);

        const firstAvailableSourceLanguage =
          languagePairsResponse[0]?.sourceLanguage.code ??
          languagesResponse[0]?.code ??
          "";

        setSourceLanguage((currentSourceLanguage) => {
          if (currentSourceLanguage) {
            return currentSourceLanguage;
          }

          return firstAvailableSourceLanguage;
        });
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити дані адмінпанелі",
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
  }, [isAuthLoading, isAdmin]);

  useEffect(() => {
    if (!hasActiveJobs) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadJobs();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasActiveJobs, loadJobs]);

  function handleSourceLanguageChange(nextSourceLanguage: string) {
    setSourceLanguage(nextSourceLanguage);

    const availableTargetCodes = new Set(
      languagePairs
        .filter((pair) => pair.sourceLanguage.code === nextSourceLanguage)
        .map((pair) => pair.targetLanguage.code),
    );

    setTargetLanguages((currentTargetLanguages) =>
      currentTargetLanguages.filter((languageCode) =>
        availableTargetCodes.has(languageCode),
      ),
    );
  }

  function toggleTargetLanguage(languageCode: string) {
    setTargetLanguages((currentTargetLanguages) => {
      if (currentTargetLanguages.includes(languageCode)) {
        return currentTargetLanguages.filter((code) => code !== languageCode);
      }

      return [...currentTargetLanguages, languageCode];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!sourceLanguage) {
      setError("Оберіть мову оригіналу");
      return;
    }

    if (targetLanguages.length === 0) {
      setError("Оберіть хоча б одну цільову мову");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await adminAiAnalysisApi.createJobs({
        title,
        language_level: languageLevel,
        source_language: sourceLanguage,
        target_languages: targetLanguages,
        original_text: originalText,
      });

      setMessage(`Створено задач: ${response.jobs.length}`);
      setTitle("");
      setOriginalText("");
      setTargetLanguages([]);

      await loadJobs();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося створити задачі AI-обробки",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || (isAdmin && isLoadingPage)) {
    return (
      <section className="admin-page">
        <p className="materials-empty">Завантаження...</p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="admin-page">
        <div className="admin-panel-card">
          <p className="page-label">Адмінпанель</p>
          <h1>Доступ заборонено</h1>
          <p className="page-description">
            Ця сторінка доступна лише користувачам з роллю ADMIN.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-panel-header">
        <div>
          <p className="page-label">Адмінпанель</p>
          <h1>AI-обробка текстів</h1>
          <p className="page-description">
            Створіть задачу на автоматизований лексичний аналіз тексту. Worker
            обробить її у фоновому режимі.
          </p>
        </div>

        <button type="button" className="secondary-button" onClick={loadJobs}>
          Оновити jobs
        </button>
      </div>

      <form className="admin-panel-card admin-ai-form" onSubmit={handleSubmit}>
        <label>
          Назва матеріалу
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Наприклад: The Student Project"
            required
          />
        </label>

        <div className="admin-form-grid">
          <label>
            Рівень
            <select
              value={languageLevel}
              onChange={(event) => setLanguageLevel(event.target.value)}
              required
            >
              {LANGUAGE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label>
            Мова оригіналу
            <select
              value={sourceLanguage}
              onChange={(event) =>
                handleSourceLanguageChange(event.target.value)
              }
              required
            >
              {sourceLanguageOptions.length === 0 ? (
                <option value="">Немає доступних мовних пар</option>
              ) : (
                sourceLanguageOptions.map((language) => (
                  <option key={language.id} value={language.code}>
                    {language.name} ({language.code})
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <div>
          <span className="admin-field-label">Цільові мови</span>

          {!sourceLanguage ? (
            <p className="admin-help-text">Спочатку оберіть мову оригіналу.</p>
          ) : targetLanguageOptions.length === 0 ? (
            <p className="admin-help-text">
              Для обраної мови оригіналу ще немає доступних мовних пар.
            </p>
          ) : (
            <div className="admin-checkbox-list">
              {targetLanguageOptions.map((language) => (
                <label key={language.id} className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={targetLanguages.includes(language.code)}
                    onChange={() => toggleTargetLanguage(language.code)}
                  />
                  <span>
                    {language.name} ({language.code})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <label>
          Оригінальний текст
          <textarea
            value={originalText}
            onChange={(event) => setOriginalText(event.target.value)}
            placeholder="Вставте текст для AI-обробки..."
            rows={10}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting || targetLanguageOptions.length === 0}
        >
          {isSubmitting ? "Створення задач..." : "Надіслати на AI-обробку"}
        </button>
      </form>

      <div className="admin-panel-card">
        <div className="admin-jobs-header">
          <div>
            <p className="page-label">Черга</p>
            <h2>Останні задачі</h2>
          </div>
        </div>

        {jobs.length === 0 ? (
          <p className="materials-empty">Задачі ще не створені.</p>
        ) : (
          <div className="admin-jobs-list">
            {jobs.map((job) => (
              <article key={job.id} className="admin-job-card">
                <div className="admin-job-card-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p>
                      {job.source_language} → {job.target_language} ·{" "}
                      {job.language_level}
                    </p>
                  </div>

                  <span className={`job-status job-status--${job.status}`}>
                    {job.status}
                  </span>
                </div>

                <div className="admin-job-meta">
                  <span>attempts: {job.attempt_count}</span>
                  {job.next_attempt_at && (
                    <span>
                      next: {new Date(job.next_attempt_at).toLocaleString()}
                    </span>
                  )}
                  {job.completed_at && (
                    <span>
                      completed: {new Date(job.completed_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {job.error_message && (
                  <p className="admin-job-error">{job.error_message}</p>
                )}

                {job.result_json ? (
                  <details className="admin-job-result">
                    <summary>Показати result_json</summary>
                    <pre>{JSON.stringify(job.result_json, null, 2)}</pre>
                  </details>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
