"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AlertCircle } from "lucide-react";

type ExamAnswer = {
  id: number;
  score: number | null;
};

interface ResultsChartProps {
  answers?: ExamAnswer[];
}

export function ResultsChart({ answers = [] }: ResultsChartProps) {
  const { chartData, emptyData } = useMemo(() => {
    const validScores = answers
      .filter((a) => a.score !== null)
      .map((a) => a.score as number);

    if (validScores.length === 0) {
      return { chartData: [], emptyData: true };
    }

    const dataPoints = validScores.length;
    let numberOfBins = Math.min(10, Math.max(5, Math.ceil(dataPoints / 2)));

    const minScore = Math.max(0, Math.floor(Math.min(...validScores)));
    const maxScoreValue = Math.ceil(Math.max(...validScores));

    const range = maxScoreValue - minScore;
    const binSize = Math.max(1, Math.ceil(range / numberOfBins));
    numberOfBins = Math.ceil(range / binSize);

    const bins: number[] = Array(numberOfBins).fill(0);

    validScores.forEach((score) => {
      const binIndex = Math.min(
        Math.floor((score - minScore) / binSize),
        numberOfBins - 1
      );
      bins[binIndex]++;
    });

    const data = bins.map((count, index) => {
      const rangeStart = minScore + index * binSize;
      const rangeEnd = Math.min(
        minScore + (index + 1) * binSize,
        maxScoreValue
      );
      const label = `${rangeStart}${
        rangeStart !== rangeEnd ? `-${rangeEnd}` : ""
      }`;

      return {
        range: label,
        count,
      };
    });

    return { chartData: data, emptyData: false };
  }, [answers]);

  const chartConfig = {
    count: {
      label: "Envios",
      color: "#7c3aed",
    },
  } satisfies ChartConfig;

  if (emptyData) {
    return (
      <div className="flex flex-col items-center justify-center h-[120px] w-full text-muted-foreground border rounded-md border-dashed">
        <AlertCircle className="h-4 w-4 mb-2" />
        <p className="text-sm">Nenhum dado de pontuação disponível</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[120px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="range"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          fontSize={10}
        />
        <YAxis tickLine={false} tickMargin={8} axisLine={false} fontSize={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="count"
          fill={chartConfig.count.color}
          radius={4}
          maxBarSize={50}
        />
      </BarChart>
    </ChartContainer>
  );
}
