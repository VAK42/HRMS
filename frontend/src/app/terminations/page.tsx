"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { ApiResponse, Employee } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface Termination { id: number; employeeId: number; terminationType: string; decisionNumber: string; decisionDate: string; effectiveDate: string; reason: string; severancePay: number }
export default function TerminationsPage() {
  const { isDark } = useTheme()
  const [terminations, setTerminations] = useState<Termination[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Termination | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", terminationType: "", decisionNumber: "", decisionDate: "", effectiveDate: "", reason: "", severancePay: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<Termination>>(`/terminations?page=${page}&limit=10`); setTerminations(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), severancePay: Number(formData.severancePay) || 0 }
    if (editing) await api.put(`/terminations/${editing.id}`, payload)
    else await api.post("/terminations", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bản Ghi Này?")) { await api.delete(`/terminations/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (t: Termination & { employeeName?: string }) => t.employeeName || "-" },
    { key: "terminationType", header: "Loại" },
    { key: "decisionNumber", header: "Số Quyết Định" },
    { key: "decisionDate", header: "Ngày Quyết Định", render: (t: Termination) => formatDate(t.decisionDate) },
    { key: "effectiveDate", header: "Ngày Hiệu Lực", render: (t: Termination) => formatDate(t.effectiveDate) },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Chấm Dứt Hợp Đồng</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quản Lý Chấm Dứt Hợp Đồng</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", terminationType: "", decisionNumber: "", decisionDate: "", effectiveDate: "", reason: "", severancePay: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Bản Ghi</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={terminations} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(t) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(t); setFormData({ employeeId: String(t.employeeId), terminationType: t.terminationType, decisionNumber: t.decisionNumber, decisionDate: t.decisionDate, effectiveDate: t.effectiveDate, reason: t.reason, severancePay: String(t.severancePay) }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Bản Ghi" : "Thêm Bản Ghi"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Loại Chấm Dứt" value={formData.terminationType} onChange={(e) => setFormData({ ...formData, terminationType: e.target.value })} options={[{ value: "", label: "Chọn Loại" }, { value: "Resignation", label: "Thôi Việc" }, { value: "End Of Contract", label: "Hết Hợp Đồng" }, { value: "Mutual Agreement", label: "Thỏa Thuận Chung" }, { value: "Layoff", label: "Sa Thải" }]} required />
          <Input label="Số Quyết Định" value={formData.decisionNumber} onChange={(e) => setFormData({ ...formData, decisionNumber: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày Quyết Định" type="date" value={formData.decisionDate} onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })} required />
            <Input label="Ngày Hiệu Lực" type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} required />
          </div>
          <Input label="Trợ Cấp Thôi Việc" type="number" value={formData.severancePay} onChange={(e) => setFormData({ ...formData, severancePay: e.target.value })} />
          <Textarea label="Lý Do" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal></>
  )
}