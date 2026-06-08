import type {
  QuizStatsChart,
  QuizStatsResponse,
  QuizStatsValue,
} from "./interfaces";

const PERCENT_KEY_MATCHER = /(pct|accuracy|score)/i;

export function toNumber(value: QuizStatsValue) {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isPercentSeries(key: string) {
  return PERCENT_KEY_MATCHER.test(key);
}

export function formatAsPercent(value: QuizStatsValue) {
  return `${Math.round(toNumber(value))}%`;
}

export function prettifyKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getOrderedCharts(stats: QuizStatsResponse | undefined) {
  if (!stats?.charts) {
    return [] as Array<{ key: string; chart: QuizStatsChart }>;
  }

  const entries = Object.entries(stats.charts).map(([key, chart]) => ({
    key,
    chart,
  }));

  return entries.sort((a, b) => {
    const aIndex = stats.chartIdeas.findIndex(
      (idea) => idea.dataPath === `charts.${a.key}`,
    );
    const bIndex = stats.chartIdeas.findIndex(
      (idea) => idea.dataPath === `charts.${b.key}`,
    );

    if (aIndex === -1 && bIndex === -1) {
      return 0;
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });
}

export function getIdeaByDataPath(stats: QuizStatsResponse | undefined) {
  if (!stats?.chartIdeas) {
    return new Map<string, QuizStatsResponse["chartIdeas"][number]>();
  }

  return new Map(stats.chartIdeas.map((idea) => [idea.dataPath, idea]));
}
