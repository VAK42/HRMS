"use client"
import { ButtonHTMLAttributes, ReactNode } from "react"
import { useTheme } from "@/lib/themeContext"
import { cn } from "@/lib/api"
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "dark"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}
export function Button({ variant = "primary", size = "md", loading = false, className, children, disabled, ...props }: ButtonProps) {
  const { isDark } = useTheme()
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-200 border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary: "border-green-600 bg-transparent hover:bg-green-600/10 text-green-600",
    secondary: isDark
      ? "border-slate-600 bg-transparent hover:bg-slate-600/10 text-slate-400 hover:text-slate-300"
      : "border-slate-300 bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-800",
    outline: isDark
      ? "border-slate-600 bg-transparent hover:bg-slate-600/10 text-slate-400 hover:text-slate-300"
      : "border-slate-300 bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-800",
    ghost: isDark
      ? "border-transparent bg-transparent hover:bg-slate-700/50 text-slate-400 hover:text-slate-300"
      : "border-transparent bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-800",
    danger: "border-red-600 bg-transparent hover:bg-red-600/10 text-red-500",
    dark: isDark
      ? "border-white bg-transparent hover:bg-white text-white hover:text-black"
      : "border-black bg-transparent hover:bg-black text-black hover:text-white",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  }
  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}