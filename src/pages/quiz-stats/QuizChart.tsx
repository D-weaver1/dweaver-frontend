import { useEffect, useRef } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartConfiguration,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  DoughnutController,
  RadarController,
  BarController,
  LineController,
} from "chart.js";
import type { QuizStatsChart } from "./interfaces";
import { isPercentSeries, toNumber } from "./utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  DoughnutController,
  RadarController,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const CHART_COLORS = ["#2f7d46", "#2874a6", "#d08c24", "#9b59b6", "#e74c3c"];

function getConfigKey(config: ChartConfiguration) {
  return `${config.type}-${config.data.labels?.join(",")}`;
}

function ChartCanvas({
  chartId,
  config,
  height,
  ariaLabel,
}: {
  chartId: string;
  config: ChartConfiguration;
  height: number;
  ariaLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    chartRef.current?.destroy();
    chartRef.current = new ChartJS(canvas, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getConfigKey(config)]);

  return (
    <div style={{ height }}>
      <canvas id={chartId} ref={canvasRef} aria-label={ariaLabel} />
    </div>
  );
}

function DoughnutChartCanvas({
  chartId,
  config,
  height,
  ariaLabel,
}: {
  chartId: string;
  config: ChartConfiguration<"doughnut", number[], string>;
  height: number;
  ariaLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"doughnut", number[], string> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    console.log("Rendering doughnut chart with config:", config);

    if (!canvas) {
      return;
    }

    chartRef.current?.destroy();
    chartRef.current = new ChartJS(canvas, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ height }}>
      <canvas id={chartId} ref={canvasRef} aria-label={ariaLabel} />
    </div>
  );
}

interface QuizChartProps {
  chart: QuizStatsChart;
  chartKey: string;
}

export function QuizChart({ chart, chartKey }: QuizChartProps) {
  if (!chart.data?.length || !chart.series?.length) {
    return <div className="quiz-stats__empty">No data available</div>;
  }

  const labels = chart.data.map((item) => String(item[chart.xKey] ?? "-"));

  const datasets = chart.series.map((series, index) => ({
    label: series.label,
    data: chart.data.map((item) => toNumber(item[series.key])),
    borderColor: CHART_COLORS[index % CHART_COLORS.length],
    backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}66`,
    pointRadius: 2,
    borderWidth: 2,
  }));

  if (chart.chartType === "line") {
    const hasPercentSeries = chart.series.some((series) =>
      isPercentSeries(series.key),
    );

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
      },
      scales: {
        y: {
          ticks: {
            callback: (value: string | number) =>
              hasPercentSeries ? `${value}%` : String(value),
          },
        },
      },
    };

    return (
      <ChartCanvas
        chartId={chartKey}
        height={290}
        ariaLabel="Quiz line chart"
        config={{
          type: "line",
          data: { labels, datasets },
          options,
        }}
      />
    );
  }

  if (chart.chartType === "bar") {
    const barDatasets = chart.series.map((series, index) => {
      const percentSeries = isPercentSeries(series.key);

      return {
        label: series.label,
        data: chart.data.map((item) => toNumber(item[series.key])),
        borderColor: CHART_COLORS[index % CHART_COLORS.length],
        backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}B3`,
        borderWidth: 1,
        yAxisID: percentSeries ? "yPct" : "yCount",
      };
    });

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
      },
      scales: {
        yPct: {
          type: "linear" as const,
          position: "left" as const,
          ticks: { callback: (value: string | number) => `${value}%` },
          grid: { drawOnChartArea: true },
        },
        yCount: {
          type: "linear" as const,
          position: "right" as const,
          grid: { drawOnChartArea: false },
        },
      },
    };

    return (
      <ChartCanvas
        chartId={chartKey}
        height={290}
        ariaLabel="Quiz bar chart"
        config={{
          type: "bar",
          data: { labels, datasets: barDatasets },
          options,
        }}
      />
    );
  }

  if (chart.chartType === "radar") {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
      },
      scales: {
        r: {
          ticks: {
            callback: (value: string | number) => String(value),
          },
        },
      },
    };

    return (
      <ChartCanvas
        chartId={chartKey}
        height={330}
        ariaLabel="Quiz radar chart"
        config={{
          type: "radar",
          data: { labels, datasets },
          options,
        }}
      />
    );
  }

  const donutSeries = chart.series[0];
  const donutData = chart.data.map((item) => toNumber(item[donutSeries.key]));

  return (
    <DoughnutChartCanvas
      chartId={chartKey}
      height={330}
      ariaLabel="Quiz donut chart"
      config={{
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              label: donutSeries.label,
              data: donutData,
              backgroundColor: labels.map(
                (_, index) => CHART_COLORS[index % CHART_COLORS.length],
              ),
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" as const },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  if (isPercentSeries(donutSeries.key)) {
                    return `${context.label}: ${Math.round(value)}%`;
                  }

                  return `${context.label}: ${value}`;
                },
              },
            },
          },
          cutout: "56%",
        },
      }}
    />
  );
}
