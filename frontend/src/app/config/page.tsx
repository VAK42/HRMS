"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { Save } from "lucide-react"
import { useEffect, useState } from "react"
interface Config { id: number; configKey: string; configValue: string; description: string }
export default function ConfigPage() {
  const { isDark } = useTheme()
  const [configs, setConfigs] = useState<Config[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  useEffect(() => {
    api.get<{ data: Config[] }>("/config")
      .then(res => {
        setConfigs(res.data)
        const data: Record<string, string> = {}
        res.data.forEach(c => { data[c.configKey] = c.configValue })
        setFormData(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  const handleSave = async () => {
    setSaving(true)
    try {
      for (const config of configs) {
        if (formData[config.configKey] !== config.configValue) {
          await api.put(`/config/${config.id}`, { configValue: formData[config.configKey] })
        }
      }
      alert("Configuration Saved Successfully!")
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Configuration</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>System Settings</p></div>
            <Button variant="dark" onClick={handleSave} loading={saving}><Save className="w-4 h-4" /> Save Changes</Button>
          </div>
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className={`h-16 rounded-xl animate-pulse ${isDark ? "bg-white/5" : "bg-black/5"}`} />)}</div>
              ) : configs.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? "text-white/50" : "text-black/50"}`}>No Configuration Found</p>
              ) : (
                configs.map(config => (
                  <Input
                    key={config.id}
                    label={config.description || config.configKey}
                    value={formData[config.configKey] || ""}
                    onChange={(e) => setFormData({ ...formData, [config.configKey]: e.target.value })}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}