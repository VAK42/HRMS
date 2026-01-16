"use client"
import { useTheme } from "@/lib/themeContext"
import { ReactNode, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/api"
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: "sm" | "md" | "lg"
}
export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const { isDark } = useTheme()
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])
  if (!isOpen) return null
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn(
        "relative w-full border rounded shadow-lg",
        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200",
        sizes[size]
      )}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h2 className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{title}</h2>
          <button onClick={onClose} className={`p-1.5 rounded border cursor-pointer transition-colors ${isDark ? "border-slate-600 hover:bg-slate-700 text-slate-400" : "border-slate-300 hover:bg-slate-100 text-slate-500"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}