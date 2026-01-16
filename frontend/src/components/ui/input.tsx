"use client"
import { InputHTMLAttributes, TextareaHTMLAttributes } from "react"
import { useTheme } from "@/lib/themeContext"
import { cn } from "@/lib/api"
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}
export function Input({ label, error, className, ...props }: InputProps) {
  const { isDark } = useTheme()
  return (
    <div className="space-y-1.5">
      {label && <label className={`block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-700"}`}>{label}</label>}
      <input
        className={cn(
          "w-full px-3 py-2 text-sm bg-transparent border rounded transition-colors duration-200",
          isDark ? "border-slate-600 text-slate-200 placeholder-slate-500 focus:border-green-600" : "border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-600",
          "focus:outline-none focus:ring-1 focus:ring-green-600/20",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
export function Textarea({ label, error, className, ...props }: TextareaProps) {
  const { isDark } = useTheme()
  return (
    <div className="space-y-1.5">
      {label && <label className={`block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-700"}`}>{label}</label>}
      <textarea
        className={cn(
          "w-full px-3 py-2 text-sm bg-transparent border rounded transition-colors duration-200 resize-none min-h-[80px]",
          isDark ? "border-slate-600 text-slate-200 placeholder-slate-500 focus:border-green-600" : "border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-600",
          "focus:outline-none focus:ring-1 focus:ring-green-600/20",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}