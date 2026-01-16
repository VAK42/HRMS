"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { BarChart } from "@/components/charts/charts"
import { api } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { ApiResponse, Employee } from "@/types"
import { TrendingUp, Target, Award, Plus } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface KpiRecord { id: number; employeeId: number; month: number; year: number; targetScore: number; actualScore: number; rating: string; employeeName?: string }
export default function KpiPage() {
  const { isDark } = useTheme()
  const [kpiRecords, setKpiRecords] = useState<KpiRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ employeeId: "", month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), targetScore: "80", actualScore: "", rating: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<KpiRecord>>("/kpiRecords")
      setKpiRecords(res.data || [])
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    fetchData()
    api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data || []))
  }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const actualScore = Number(formData.actualScore)
    let rating = "Needs Improvement"
    if (actualScore >= 90) rating = "Excellent"
    else if (actualScore >= 80) rating = "Good"
    else if (actualScore >= 70) rating = "Satisfactory"
    const payload = {
      employeeId: Number(formData.employeeId),
      month: Number(formData.month),
      year: Number(formData.year),
      targetScore: Number(formData.targetScore),
      actualScore,
      rating
    }
    await api.post("/kpiRecords", payload)
    setModalOpen(false)
    setFormData({ employeeId: "", month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), targetScore: "80", actualScore: "", rating: "" })
    fetchData()
  }
  const avgScore = kpiRecords.length > 0 ? (kpiRecords.reduce((sum, r) => sum + (r.actualScore || 0), 0) / kpiRecords.length).toFixed(1) : "0"
  const targetsMet = kpiRecords.length > 0 ? Math.round((kpiRecords.filter(r => r.actualScore >= r.targetScore).length / kpiRecords.length) * 100) : 0
  const topPerformers = kpiRecords.filter(r => r.actualScore >= 90).length
  const employeeScores = kpiRecords.reduce((acc, r) => {
    const name = r.employeeName?.split(" ")[0] || `Emp ${r.employeeId}`
    if (!acc[name]) acc[name] = []
    acc[name].push(r.actualScore)
    return acc
  }, {} as Record<string, number[]>)
  const chartLabels = Object.keys(employeeScores).slice(0, 8)
  const chartData = chartLabels.map(name => {
    const scores = employeeScores[name]
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  })
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))
  const years = Array.from({ length: 3 }, (_, i) => ({ value: new Date().getFullYear() - i, label: String(new Date().getFullYear() - i) }))
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Quản Lý KPI</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Theo Dõi Hiệu Suất Nhân Viên</p></div>
            <Button variant="dark" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Thêm Bản Ghi KPI</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? "bg-green-950/50" : "bg-green-950/10"}`}><TrendingUp className={`w-6 h-6 ${isDark ? "text-white" : "text-green-950"}`} /></div><div><p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Điểm Trung Bình</p><p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>{avgScore}%</p></div></div></Card>
            <Card className="p-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? "bg-green-950/50" : "bg-green-950/10"}`}><Target className={`w-6 h-6 ${isDark ? "text-white" : "text-green-950"}`} /></div><div><p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Đạt Mục Tiêu</p><p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>{targetsMet}%</p></div></div></Card>
            <Card className="p-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? "bg-green-950/50" : "bg-green-950/10"}`}><Award className={`w-6 h-6 ${isDark ? "text-white" : "text-green-950"}`} /></div><div><p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Nhân Viên Xuất Sắc</p><p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>{topPerformers}</p></div></div></Card>
          </div>
          <Card><CardHeader><CardTitle>Điểm Hiệu Suất Nhân Viên</CardTitle></CardHeader><CardContent>
            {loading ? (
              <div className={`h-64 rounded-xl animate-pulse ${isDark ? "bg-white/5" : "bg-black/5"}`} />
            ) : chartLabels.length === 0 ? (
              <div className={`h-64 flex items-center justify-center ${isDark ? "text-white/50" : "text-black/50"}`}>
                <p>Không Tìm Thấy Dữ Liệu KPI. Nhấn "Thêm Bản Ghi KPI" Để Thêm Dữ Liệu.</p>
              </div>
            ) : (
              <BarChart labels={chartLabels} data={chartData} label="Điểm Trung Bình" />
            )}
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Thêm Bản Ghi KPI" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tháng" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} options={months} />
            <Select label="Năm" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} options={years} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Điểm Mục Tiêu (%)" type="number" min="0" max="100" value={formData.targetScore} onChange={(e) => setFormData({ ...formData, targetScore: e.target.value })} required />
            <Input label="Điểm Thực Tế (%)" type="number" min="0" max="100" value={formData.actualScore} onChange={(e) => setFormData({ ...formData, actualScore: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">Thêm Bản Ghi</Button></div>
        </form>
      </Modal>
    </>
  )
}