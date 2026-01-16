"use client"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { Shield, Check } from "lucide-react"
import { useEffect, useState } from "react"
interface Role { id: number; name: string; permissions: string }
interface Department { id: number; name: string }
const modules = ["Dashboard", "Personnel", "Decisions", "Leave", "Recruitment", "Salary", "Reports", "System"]
export default function PermissionsPage() {
  const { isDark } = useTheme()
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([
      api.get<{ data: Role[] }>("/systemRoles").then(res => setRoles(res.data)),
      api.get<{ data: Department[] }>("/departments").then(res => setDepartments(res.data))
    ]).finally(() => setLoading(false))
  }, [])
  const togglePermission = async (roleId: number, module: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return
    const perms = role.permissions === "all" ? modules : role.permissions?.split(",") || []
    const newPerms = perms.includes(module) ? perms.filter(p => p !== module) : [...perms, module]
    await api.put(`/systemRoles/${roleId}`, { permissions: newPerms.join(",") })
    setRoles(roles.map(r => r.id === roleId ? { ...r, permissions: newPerms.join(",") } : r))
  }
  const hasPermission = (role: Role, module: string) => role.permissions === "all" || role.permissions?.split(",").includes(module)
  const ByRoleContent = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className={`h-32 rounded-xl animate-pulse ${isDark ? "bg-white/5" : "bg-black/5"}`} />)}</div>
      ) : (
        roles.map(role => (
          <Card key={role.id}>
            <CardHeader><div className="flex items-center gap-2"><Shield className={`w-5 h-5 ${isDark ? "text-white" : "text-green-950"}`} /><CardTitle>{role.name}</CardTitle></div></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {modules.map(mod => (
                  <button key={mod} onClick={() => togglePermission(role.id, mod)} className={`flex items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${hasPermission(role, mod) ? "bg-green-950/30 border-green-950/50 text-green-950 dark:text-white" : isDark ? "bg-white/5 border-white/20 text-white hover:bg-white/10" : "bg-black/5 border-black/20 text-black hover:bg-black/10"}`}>
                    {hasPermission(role, mod) && <Check className="w-4 h-4" />}
                    {mod}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
  const ByDeptContent = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className={`h-16 rounded-xl animate-pulse ${isDark ? "bg-white/5" : "bg-black/5"}`} />)}</div>
      ) : (
        departments.map(dept => (
          <Card key={dept.id} hover className="p-4">
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{dept.name}</span>
              <span className="text-sm text-green-950 dark:text-green-400">Full Access</span>
            </div>
          </Card>
        ))
      )}
    </div>
  )
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Permissions</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Manage System Access Control</p></div>
          <Tabs
            tabs={[
              { id: "role", label: "By Role", content: <ByRoleContent /> },
              { id: "dept", label: "By Department", content: <ByDeptContent /> },
            ]}
          />
        </div>
      </main>
    </>
  )
}