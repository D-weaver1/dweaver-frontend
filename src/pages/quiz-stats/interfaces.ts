export type QuizStatsValue = string | number | null;

export type QuizStatsDataPoint = Record<string, QuizStatsValue>;

export type QuizStatsChartType = "line" | "bar" | "radar" | "donut";

export interface QuizStatsSeries {
  key: string;
  label: string;
}

export interface QuizStatsChart {
  chartType: QuizStatsChartType;
  xKey: string;
  series: QuizStatsSeries[];
  data: QuizStatsDataPoint[];
}

export interface QuizStatsSummary {
  totalAttempts: number;
  avgScorePct: number;
  bestScorePct: number;
  overallAccuracyPct: number;
}

export interface QuizStatsChartIdea {
  id: string;
  title: string;
  recommendedChart: string;
  dataPath: string;
  description: string;
}

export interface QuizStatsResponse {
  summary: QuizStatsSummary;
  charts: Record<string, QuizStatsChart>;
  chartIdeas: QuizStatsChartIdea[];
}
