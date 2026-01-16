"use client"
import { useTheme } from "@/lib/themeContext"
import { SelectHTMLAttributes } from "react"
import { cn } from "@/lib/api"
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
}
export function Select({ label, error, options, className, ...props }: SelectProps) {
  const { isDark } = useTheme()
  return (
    <div className="space-y-1.5">
      {label && <label className={`block text-xs font-medium ${isDark ? "text-white" : "text-black"}`}>{label}</label>}
      <select
        className={cn(
          "w-full px-3 py-2 text-sm bg-transparent border rounded cursor-pointer transition-colors duration-200 focus:outline-none",
          isDark ? "border-white text-white [&>option]:bg-white [&>option]:text-black" : "border-black text-black [&>option]:bg-white [&>option]:text-black",
          error && "border-red-500",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}