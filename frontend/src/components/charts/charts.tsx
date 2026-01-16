"use client"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js"
import { Bar, Doughnut, Line } from "react-chartjs-2"
import { useTheme } from "@/lib/themeContext"
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)
const coldColors = [
  "#1e3a8a",
  "#0c4a6e",
  "#4c1d95",
  "#164e63",
  "#312e81",
  "#134e4a",
  "#581c87",
  "#93c5fd",
  "#67e8f9",
  "#c4b5fd",
]
interface BarChartProps {
  labels: string[]
  data: number[]
  label?: string
}
export function BarChart({ labels, data, label = "Giá Trị" }: BarChartProps) {
  const { isDark } = useTheme()
  return (
    <div style={{ height: "250px" }}>
      <Bar
        data={{
          labels,
          datasets: [{
            label,
            data,
            backgroundColor: data.map((_, i) => coldColors[i % coldColors.length]),
            borderRadius: 4,
            borderWidth: 0,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              titleColor: isDark ? "#f1f5f9" : "#0f172a",
              bodyColor: isDark ? "#cbd5e1" : "#475569",
              borderColor: isDark ? "#334155" : "#e2e8f0",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 4,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: isDark ? "#64748b" : "#64748b", font: { size: 10 } },
            },
            y: {
              grid: { color: isDark ? "#1e293b" : "#f1f5f9" },
              ticks: { color: isDark ? "#64748b" : "#64748b", font: { size: 10 } },
            },
          },
        }}
      />
    </div>
  )
}
interface DoughnutChartProps {
  labels: string[]
  data: number[]
}
export function DoughnutChart({ labels, data }: DoughnutChartProps) {
  const { isDark } = useTheme()
  return (
    <div style={{ height: "250px" }}>
      <Doughnut
        data={{
          labels,
          datasets: [{
            data,
            backgroundColor: data.map((_, i) => coldColors[i % coldColors.length]),
            borderWidth: 0,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "right",
              labels: {
                color: isDark ? "#94a3b8" : "#475569",
                font: { size: 10 },
                boxWidth: 12,
                padding: 8,
              },
            },
            tooltip: {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              titleColor: isDark ? "#f1f5f9" : "#0f172a",
              bodyColor: isDark ? "#cbd5e1" : "#475569",
              borderColor: isDark ? "#334155" : "#e2e8f0",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 4,
            },
          },
        }}
      />
    </div>
  )
}
interface LineChartProps {
  labels: string[]
  data: number[]
  label?: string
}
export function LineChart({ labels, data, label = "Giá Trị" }: LineChartProps) {
  const { isDark } = useTheme()
  return (
    <div style={{ height: "250px" }}>
      <Line
        data={{
          labels,
          datasets: [{
            label,
            data,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "#22c55e",
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              titleColor: isDark ? "#f1f5f9" : "#0f172a",
              bodyColor: isDark ? "#cbd5e1" : "#475569",
              borderColor: isDark ? "#334155" : "#e2e8f0",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 4,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: isDark ? "#64748b" : "#64748b", font: { size: 10 } },
            },
            y: {
              grid: { color: isDark ? "#1e293b" : "#f1f5f9" },
              ticks: { color: isDark ? "#64748b" : "#64748b", font: { size: 10 } },
            },
          },
        }}
      />
    </div>
  )
}