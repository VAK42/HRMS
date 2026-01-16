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
interface Visit { id: number; employeeId: number; visitType: string; visitDate: string; reason: string; giftValue: number; notes: string }
export default function VisitsPage() {
  const { isDark } = useTheme()
  const [visits, setVisits] = useState<Visit[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Visit | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", visitType: "", visitDate: "", reason: "", giftValue: "", notes: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<Visit>>(`/visits?page=${page}&limit=10`); setVisits(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), giftValue: Number(formData.giftValue) || 0 }
    if (editing) await api.put(`/visits/${editing.id}`, payload)
    else await api.post("/visits", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bản Ghi Này?")) { await api.delete(`/visits/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (v: Visit & { employeeName?: string }) => v.employeeName || "-" },
    { key: "visitType", header: "Loại" },
    { key: "visitDate", header: "Ngày", render: (v: Visit) => formatDate(v.visitDate) },
    { key: "reason", header: "Lý Do" },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Thăm Hỏi</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Thăm Hỏi Đời Sống Nhân Viên</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", visitType: "", visitDate: "", reason: "", giftValue: "", notes: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Thăm Hỏi</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={visits} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(v) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(v); setFormData({ employeeId: String(v.employeeId), visitType: v.visitType, visitDate: v.visitDate, reason: v.reason, giftValue: String(v.giftValue), notes: v.notes }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Thăm Hỏi" : "Thêm Thăm Hỏi"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Loại Thăm Hỏi" value={formData.visitType} onChange={(e) => setFormData({ ...formData, visitType: e.target.value })} options={[{ value: "", label: "Chọn Loại" }, { value: "Birthday", label: "Sinh Nhật" }, { value: "Illness", label: "Ốm Đau" }, { value: "Wedding", label: "Đám Cưới" }, { value: "Funeral", label: "Tang Lễ" }]} required />
          <Input label="Ngày Thăm" type="date" value={formData.visitDate} onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })} required />
          <Input label="Giá Trị Quà" type="number" value={formData.giftValue} onChange={(e) => setFormData({ ...formData, giftValue: e.target.value })} />
          <Textarea label="Lý Do" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal></>
  )
}