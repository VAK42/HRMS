"use client"
import { useTheme } from "@/lib/themeContext"
import { ReactNode, useState } from "react"
import { cn } from "@/lib/api"
interface Tab {
  id: string
  label: string
  content: ReactNode
}
interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}
export function Tabs({ tabs, defaultTab }: TabsProps) {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  return (
    <div>
      <div className={`flex gap-1 p-1 border rounded mb-5 ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer",
              activeTab === tab.id ? `${isDark ? "bg-slate-700 text-slate-200" : "bg-white text-slate-800 shadow-sm"}` : `${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs.find((t) => t.id === activeTab)?.content}</div>
    </div>
  )
}