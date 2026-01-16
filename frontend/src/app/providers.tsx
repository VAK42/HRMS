"use client"
import { ThemeProvider } from "@/lib/themeContext"
import { AuthProvider } from "@/lib/authContext"
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}