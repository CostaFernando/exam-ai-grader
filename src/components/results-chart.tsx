"use client"

import { useEffect, useRef } from "react"

export function ResultsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Mock data for score distribution
    const data = [2, 5, 8, 12, 15, 10, 6, 3]
    const labels = ["0-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "91-100"]

    // Canvas dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const barWidth = width / data.length - 4
    const maxValue = Math.max(...data)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw bars
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * (height - 30)
      const x = index * (barWidth + 4) + 2
      const y = height - barHeight - 20

      // Draw bar
      ctx.fillStyle = "#a855f7"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw label
      ctx.fillStyle = "#6b7280"
      ctx.font = "8px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(labels[index], x + barWidth / 2, height - 5)
    })
  }, [])

  return <canvas ref={canvasRef} width={300} height={120} className="w-full h-full" />
}
