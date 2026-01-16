import { ReactNode } from "react"
import { cn } from "@/lib/api"
interface BadgeProps {
  children: ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
}
export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "border-slate-500 text-slate-400",
    success: "border-green-600 text-green-500",
    warning: "border-yellow-600 text-yellow-500",
    danger: "border-red-600 text-red-500",
    info: "border-blue-600 text-blue-500",
  }
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-transparent", variants[variant], className)}>
      {children}
    </span>
  )
}