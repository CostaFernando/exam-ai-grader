"use client";

import { useEffect, useRef } from "react";

type ExamAnswer = {
  id: number;
  score: number | null;
};

interface ResultsChartProps {
  answers?: ExamAnswer[];
}

export function ResultsChart({ answers = [] }: ResultsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Create score distribution from real data
    const scoreRanges = [
      "0-10",
      "11-20",
      "21-30",
      "31-40",
      "41-50",
      "51-60",
      "61-70",
      "71-80",
      "81-90",
      "91-100",
    ];
    const distribution = Array(10).fill(0);

    // Count scores in each range
    answers.forEach((answer) => {
      if (answer.score !== null) {
        const index = Math.min(Math.floor(answer.score / 10), 9);
        distribution[index]++;
      }
    });

    // Canvas dimensions
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const barWidth = width / scoreRanges.length - 4;
    const maxValue = Math.max(...distribution, 1); // Prevent division by zero

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw bars
    distribution.forEach((value, index) => {
      const barHeight = (value / maxValue) * (height - 30);
      const x = index * (barWidth + 4) + 2;
      const y = height - barHeight - 20;

      // Draw bar
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = "#6b7280";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(scoreRanges[index], x + barWidth / 2, height - 5);
    });
  }, [answers]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={120}
      className="w-full h-full"
    />
  );
}
