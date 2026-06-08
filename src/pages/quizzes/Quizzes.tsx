import { http } from "@/shared/api/http";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import type { DictionariesResponse, QuizzesResponse } from "./interfaces";

import "./styles.css";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/model/useAuth";

export function Quizzes() {
  const { t } = useTranslation();

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { currentLanguagePair, isLoading: isLanguagePairLoading } =
    useLanguagePair();

  const currentPairKey = currentLanguagePair
    ? `${currentLanguagePair.sourceLanguage.code}-${currentLanguagePair.targetLanguage.code}`
    : "no-pair";

  const {
    data: quizzes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quizzes", currentPairKey],
    queryFn: () => http<QuizzesResponse>("/quizzes"),
    enabled: isAuthenticated && Boolean(currentLanguagePair),
  });

  const { data: dictionaries } = useQuery({
    queryKey: ["dictionaries", currentPairKey],
    queryFn: () => http<DictionariesResponse>("/dictionaries"),
    enabled: isAuthenticated && Boolean(currentLanguagePair),
  });

  const [isAdding, setIsAdding] = useState(false);
  const [mode, setMode] = useState<"all" | "started" | "completed">("started");
  const navigate = useNavigate();

  const visibleQuizzes = useMemo(() => {
    if (!quizzes || !currentLanguagePair) {
      return [];
    }

    let result = quizzes.filter(
      (quiz) =>
        quiz.sourceLanguage.code === currentLanguagePair.sourceLanguage.code &&
        quiz.targetLanguage.code === currentLanguagePair.targetLanguage.code,
    );

    if (mode === "started") {
      result = result.filter((quiz) =>
        quiz.attempts.some((attempt) => !attempt.completedAt),
      );
    } else if (mode === "completed") {
      result = result.filter(
        (quiz) =>
          quiz.attempts.every((attempt) => attempt.completedAt) &&
          quiz.attempts.length > 0,
      );
    }

    return result;
  }, [quizzes, currentLanguagePair, mode]);

  if (isAuthLoading || isLanguagePairLoading) {
    return <div>{t("common.loading")}</div>;
  }

  if (!isAuthenticated) {
    return <div>{t("quizzes.authRequired")}</div>;
  }

  if (!currentLanguagePair) {
    return <div>{t("quizzes.choosePairRequired")}</div>;
  }

  if (isLoading) {
    return <div>{t("quizzes.loading")}</div>;
  }

  if (isError || !quizzes) {
    return <div>{t("quizzes.loadError")}</div>;
  }

  const handleAdd = async () => {
    if (isAdding) {
      return;
    }

    if (!dictionaries?.length) {
      toast.error(t("quizzes.noDictionaries"));
      return;
    }

    const dictionary = dictionaries.find(
      (dict) =>
        dict.source.code === currentLanguagePair.sourceLanguage.code &&
        dict.target.code === currentLanguagePair.targetLanguage.code,
    );

    if (!dictionary) {
      toast.error(t("quizzes.noDictionaryForPair"));
      return;
    }

    setIsAdding(true);

    try {
      const response = await http<{ id: string }>(
        `/dictionaries/${dictionary.id}/generate-quiz`,
        {
          method: "POST",
        },
      );

      navigate("/quizzes/" + response.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("quizzes.unknownError");

      toast.error(t("quizzes.createError", { message }));
      console.error("Failed to create quiz", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className="container-box quizzes">
      <div className="quizzes__header">
        <div className="quizzes__header-btns">
          <h1>{t("quizzes.title")}</h1>
          <div className="btn-group">
            {["all", "started", "completed"].map((m) => (
              <button
                key={m}
                type="button"
                className={`btn ${mode === m ? "btn-active" : ""}`}
                onClick={() => setMode(m as "all" | "started" | "completed")}
              >
                {t(`quizzes.filter.${m}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="quizzes__header-btns">
          <Link to="/quiz-stats" className="primary-button">
            {t("quizzes.viewStats")}
          </Link>
          <Link to="/dictionary" className="primary-button">
            {t("quizzes.viewDictionary")}
          </Link>
          <button
            type="button"
            className="primary-button"
            onClick={handleAdd}
            disabled={isAdding}
          >
            {isAdding ? t("quizzes.creating") : t("quizzes.newQuiz")}
          </button>
        </div>
      </div>

      {visibleQuizzes.length === 0 && <p>{t("quizzes.notFound")}</p>}

      <ul className="quiz-list">
        {visibleQuizzes.map((quiz) => {
          const hasActive = quiz.attempts.some(
            (attempt) => !attempt.completedAt,
          );
          const latest = quiz.attempts.at(0);

          return (
            <li key={quiz.id} className="quiz-list__item">
              <div>
                {quiz.title
                  ? quiz.title
                  : `${quiz.sourceLanguage.name} -> ${quiz.targetLanguage.name}`}
              </div>

              <div className="quiz-list__item-btns">
                {latest && !hasActive && (
                  <span className="quiz-list__item-last">
                    {t("quizzes.lastAttempt", {
                      correct: latest.correct,
                      total: latest.total,
                    })}
                  </span>
                )}

                <Link
                  to={"/quizzes/" + quiz.id}
                  className="quiz-list__item-start"
                >
                  {hasActive
                    ? t("quizzes.continueQuiz")
                    : t("quizzes.startQuiz")}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
