"use client"
import { useAuth } from "@/lib/authContext"
import { useTheme } from "@/lib/themeContext"
import { Building2, Sun, Moon } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
export default function LoginPage() {
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(username, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login Failed!")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center">
        <Building2 className="w-64 h-64 text-white" strokeWidth={1} />
      </div>
      <div className={`w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 ${isDark ? "bg-black" : "bg-white"}`}>
        <div className="max-w-sm mx-auto w-full">
          <div className="absolute top-4 right-4">
            <button onClick={toggleTheme} className={`p-2 rounded border cursor-pointer transition-colors ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <div className="lg:hidden flex justify-center mb-8">
            <Building2 className={`w-12 h-12 ${isDark ? "text-white" : "text-black"}`} strokeWidth={1.5} />
          </div>
          <div className="hidden lg:block mb-6">
            <Building2 className={`w-8 h-8 ${isDark ? "text-white" : "text-black"}`} strokeWidth={1.5} />
          </div>
          <h1 className={`text-3xl font-bold mb-1 ${isDark ? "text-white" : "text-black"}`}>Welcome Back</h1>
          <p className={`text-base mb-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Sign In To HRMS</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 border border-red-500 rounded text-red-500 text-sm">{error}</div>}
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                autoFocus
                className={`w-full px-4 py-3 text-sm border rounded transition-colors focus:outline-none focus:ring-1 ${isDark ? "bg-black border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20" : "bg-white border-slate-300 text-black placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400/20"}`}
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className={`w-full px-4 py-3 text-sm border rounded transition-colors focus:outline-none focus:ring-1 ${isDark ? "bg-black border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20" : "bg-white border-slate-300 text-black placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400/20"}`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-sm font-medium rounded cursor-pointer transition-colors disabled:opacity-50 ${isDark ? "bg-white text-black hover:bg-slate-200" : "bg-black text-white hover:bg-slate-800"}`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <button
              type="button"
              className={`w-full py-3 text-sm font-medium rounded border cursor-pointer transition-colors ${isDark ? "border-slate-700 text-white hover:bg-slate-900" : "border-slate-300 text-black hover:bg-slate-50"}`}
            >
              Forgot Password?
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}