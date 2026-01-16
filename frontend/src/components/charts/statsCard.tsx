"use client"
import { useTheme } from "@/lib/themeContext"
import { Card } from "@/components/ui/card"
import { ReactNode } from "react"
interface StatsCardProps {
  title: string
  value: number | string
  icon: ReactNode
  trend?: { value: number; isPositive: boolean }
  color?: "green" | "blue" | "cyan" | "violet" | "indigo" | "teal" | "purple"
}
export function StatsCard({ title, value, icon, trend, color = "green" }: StatsCardProps) {
  const { isDark } = useTheme()
  const colors = {
    green: "border-green-500 text-green-500 bg-green-500/10",
    blue: "border-blue-500 text-blue-500 bg-blue-500/10",
    cyan: "border-cyan-500 text-cyan-500 bg-cyan-500/10",
    violet: "border-violet-500 text-violet-500 bg-violet-500/10",
    indigo: "border-indigo-500 text-indigo-500 bg-indigo-500/10",
    teal: "border-teal-500 text-teal-500 bg-teal-500/10",
    purple: "border-purple-500 text-purple-500 bg-purple-500/10",
  }
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>{title}</p>
          <p className={`text-xl font-semibold mt-1 ${isDark ? "text-slate-100" : "text-black"}`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}%
            </p>
          )}
        </div>
        <div className={`p-2 rounded border ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}