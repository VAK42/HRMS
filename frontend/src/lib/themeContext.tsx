"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
type Theme = "dark" | "light"
interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}
const ThemeContext = createContext<ThemeContextType>({ theme: "dark", isDark: true, toggleTheme: () => { } })
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme") as Theme
    if (stored) setTheme(stored)
  }, [])
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", theme)
      document.body.style.backgroundColor = theme === "dark" ? "#0a0f1a" : "#ffffff"
      document.body.style.color = theme === "dark" ? "#e2e8f0" : "#1e293b"
    }
  }, [theme, mounted])
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")
  const isDark = theme === "dark"
  if (!mounted) {
    return <div style={{ backgroundColor: "#0a0f1a", minHeight: "100vh" }}>{children}</div>
  }
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <div style={{ backgroundColor: isDark ? "#0a0f1a" : "#ffffff", color: isDark ? "#e2e8f0" : "#1e293b", minHeight: "100vh" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
export function useTheme() {
  return useContext(ThemeContext)
}