"use client"
import { HTMLAttributes, ReactNode } from "react"
import { useTheme } from "@/lib/themeContext"
import { cn } from "@/lib/api"
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}
export function Card({ children, hover = false, className, ...props }: CardProps) {
  const { isDark } = useTheme()
  return (
    <div className={cn(
      "rounded border",
      isDark ? "bg-slate-900/60 border-slate-700/60" : "bg-white border-slate-200 shadow-sm",
      hover && `transition-all duration-200 cursor-pointer ${isDark ? "hover:border-slate-600" : "hover:border-slate-300 hover:shadow"}`,
      className
    )} {...props}>
      {children}
    </div>
  )
}
export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isDark } = useTheme()
  return <div className={cn(`px-5 py-4 border-b ${isDark ? "border-slate-700/60" : "border-slate-100"}`, className)} {...props}>{children}</div>
}
export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props}>{children}</div>
}
export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { isDark } = useTheme()
  return <h3 className={cn(`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-900"}`, className)} {...props}>{children}</h3>
}