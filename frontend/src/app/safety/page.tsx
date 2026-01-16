"use client"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/lib/themeContext"
import { api } from "@/lib/api"
import { Shield, HardHat, AlertTriangle, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
interface SafetyStats {
  safetyScore: number
  equipmentIssued: number
  incidentsCount: number
  compliance: string
}
export default function SafetyPage() {
  const { isDark } = useTheme()
  const [stats, setStats] = useState<SafetyStats | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get<SafetyStats>("/safety/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Labor Protection</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Workplace Safety Management</p></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? "bg-green-950/50" : "bg-green-950/10"}`}><Shield className={`w-6 h-6 ${isDark ? "text-white" : "text-green-950"}`} /></div><div><p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Safety Score</p>
              {loading ? <div className={`h-8 w-16 mt-1 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-black/10"}`} /> : <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>{stats?.safetyScore || 0}%</p>}
            </div></div></Card>
            <Card className="p-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? "bg-green-950/50" : "bg-green-950/10"}`}><HardHat className={`w-6 h-6 ${isDark ? "text-white" : "text-green-950"}`} /></div><div><p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Equipment Issued</p>
              {loading ? <div className={`h-8 w-16 mt-1 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-black/10"}`} /> : <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>{stats?.equipmentIssued || 0}</p>}
            </div></div></Card>
            <Card className="p-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? "bg-green-950/50" : "bg-green-950/10"}`}><AlertTriangle className={`w-6 h-6 ${isDark ? "text-white" : "text-green-950"}`} /></div><div><p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Incidents</p>
              {loading ? <div className={`h-8 w-16 mt-1 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-black/10"}`} /> : <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>{stats?.incidentsCount || 0}</p>}
            </div></div></Card>
            <Card className="p-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? "bg-green-950/50" : "bg-green-950/10"}`}><CheckCircle className={`w-6 h-6 ${isDark ? "text-white" : "text-green-950"}`} /></div><div><p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Compliance</p>
              {loading ? <div className={`h-8 w-16 mt-1 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-black/10"}`} /> : <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>{stats?.compliance || "0%"}</p>}
            </div></div></Card>
          </div>
          <Card><CardHeader><CardTitle>Safety Equipment Plan</CardTitle></CardHeader><CardContent><p className={`text-center py-12 ${isDark ? "text-white/50" : "text-black/50"}`}>No Safety Equipment Plans Configured</p></CardContent></Card>
        </div>
      </main>
    </>
  )
}