"use client"
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "./api"
interface User {
  id: number
  username: string
  fullName: string
  role: string
  permissions: string
}
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}
const AuthContext = createContext<AuthContextType | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    if (initialized) return
    const checkAuth = async () => {
      if (pathname === "/login") {
        setLoading(false)
        setInitialized(true)
        return
      }
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")
      if (!token) {
        setLoading(false)
        setInitialized(true)
        router.replace("/login")
        return
      }
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          console.log("Invalid Stored User")
        }
      }
      try {
        const userData = await api.get<User>("/auth/me")
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.replace("/login")
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    checkAuth()
  }, [initialized, pathname, router])
  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/login", { username, password })
    localStorage.setItem("token", res.token)
    localStorage.setItem("user", JSON.stringify(res.user))
    setUser(res.user)
    router.replace("/dashboard")
  }, [router])

  const logout = useCallback(() => {
    api.post("/auth/logout", {}).catch(() => { })
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.replace("/login")
  }, [router])
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth Phải Được Sử Dụng Bên Trong AuthProvider")
  return context
}