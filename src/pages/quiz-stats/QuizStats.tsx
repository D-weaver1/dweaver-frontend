import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { http } from "@/shared/api/http";
import { useAuth } from "@/features/auth/model/useAuth";
import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";
import type { QuizStatsResponse } from "./interfaces";
import { QuizChart } from "./QuizChart";
import {
  formatAsPercent,
  getIdeaByDataPath,
  getOrderedCharts,
  prettifyKey,
} from "./utils";

import "./styles.css";

export function QuizStats() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { currentLanguagePair, isLoading: isLanguagePairLoading } =
    useLanguagePair();

  const currentPairKey = currentLanguagePair
    ? `${currentLanguagePair.sourceLanguage.code}-${currentLanguagePair.targetLanguage.code}`
    : "no-pair";

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quiz-stats", currentPairKey],
    queryFn: () => http<QuizStatsResponse>("/quizzes/stats"),
    enabled: isAuthenticated && Boolean(currentLanguagePair),
  });

  const ideaByDataPath = getIdeaByDataPath(stats);
  const orderedCharts = getOrderedCharts(stats);

  if (isAuthLoading || isLanguagePairLoading) {
    return <div>Loading user context...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in to view quiz statistics.</div>;
  }

  if (!currentLanguagePair) {
    return <div>Select a language pair to view statistics.</div>;
  }

  if (isLoading) {
    return <div>Loading quiz statistics...</div>;
  }

  if (isError || !stats) {
    return <div>Could not load quiz statistics.</div>;
  }

  return (
    <section className="container-box quiz-stats">
      <header className="quiz-stats__header">
        <div>
          <h1>Quiz Statistics</h1>
          <p>
            Insights from your attempts, grouped by trend, quiz type, and
            language pair.
          </p>
        </div>

        <Link to="/quizzes" className="primary-button">
          Back to quizzes
        </Link>
      </header>

      <div className="quiz-stats__summary-grid">
        <article className="quiz-stats__summary-card">
          <span>Total attempts</span>
          <strong>{stats.summary.totalAttempts}</strong>
        </article>
        <article className="quiz-stats__summary-card">
          <span>Average score</span>
          <strong>{formatAsPercent(stats.summary.avgScorePct)}</strong>
        </article>
        <article className="quiz-stats__summary-card">
          <span>Best score</span>
          <strong>{formatAsPercent(stats.summary.bestScorePct)}</strong>
        </article>
        <article className="quiz-stats__summary-card">
          <span>Overall accuracy</span>
          <strong>{formatAsPercent(stats.summary.overallAccuracyPct)}</strong>
        </article>
      </div>

      <div className="quiz-stats__charts-grid">
        {orderedCharts.map(({ key, chart }) => {
          const idea = ideaByDataPath.get(`charts.${key}`);
          const title = idea?.title ?? prettifyKey(key);

          return (
            <article key={key} className="quiz-stats__chart-card">
              <div className="quiz-stats__chart-head">
                <h2>{title}</h2>
                <span>{chart.chartType.toUpperCase()}</span>
              </div>
              {idea?.description && (
                <p className="quiz-stats__chart-description">
                  {idea.description}
                </p>
              )}
              <QuizChart chart={chart} chartKey={key} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
