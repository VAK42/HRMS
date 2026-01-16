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
import { ApiResponse, Employee, Department, Position } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface Appointment { id: number; employeeId: number; positionId: number; decisionNumber: string; decisionDate: string; effectiveDate: string; notes: string }
export default function AppointmentsPage() {
  const { isDark } = useTheme()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", positionId: "", decisionNumber: "", decisionDate: "", effectiveDate: "", notes: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<Appointment>>(`/appointments?page=${page}&limit=10`); setAppointments(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)); api.get<ApiResponse<Position>>("/positions").then(res => setPositions(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), positionId: Number(formData.positionId) }
    if (editing) await api.put(`/appointments/${editing.id}`, payload)
    else await api.post("/appointments", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bản Ghi Này?")) { await api.delete(`/appointments/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (a: Appointment & { employeeName?: string }) => a.employeeName || "-" },
    { key: "positionId", header: "Vị Trí", render: (a: Appointment) => positions.find(p => p.id === a.positionId)?.name || "-" },
    { key: "decisionNumber", header: "Số Quyết Định" },
    { key: "decisionDate", header: "Ngày Quyết Định", render: (a: Appointment) => formatDate(a.decisionDate) },
    { key: "effectiveDate", header: "Ngày Hiệu Lực", render: (a: Appointment) => formatDate(a.effectiveDate) },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Bổ Nhiệm</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quyết Định Bổ Nhiệm Vị Trí</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", positionId: "", decisionNumber: "", decisionDate: "", effectiveDate: "", notes: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Quyết Định</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={appointments} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(a) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(a); setFormData({ employeeId: String(a.employeeId), positionId: String(a.positionId), decisionNumber: a.decisionNumber, decisionDate: a.decisionDate, effectiveDate: a.effectiveDate, notes: a.notes }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Quyết Định" : "Thêm Quyết Định"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Vị Trí" value={formData.positionId} onChange={(e) => setFormData({ ...formData, positionId: e.target.value })} options={[{ value: "", label: "Chọn Vị Trí" }, ...positions.map(p => ({ value: p.id, label: p.name }))]} required />
          <Input label="Số Quyết Định" value={formData.decisionNumber} onChange={(e) => setFormData({ ...formData, decisionNumber: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày Quyết Định" type="date" value={formData.decisionDate} onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })} required />
            <Input label="Ngày Hiệu Lực" type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} required />
          </div>
          <Textarea label="Ghi Chú" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal></>
  )
}