"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate, formatCurrency } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { ApiResponse, Employee } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface SalaryAdjust { id: number; employeeId: number; adjustType: string; decisionNumber: string; decisionDate: string; oldSalary: number; newSalary: number; reason: string }
export default function SalaryAdjustPage() {
  const { isDark } = useTheme()
  const [adjustments, setAdjustments] = useState<SalaryAdjust[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SalaryAdjust | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", adjustType: "", decisionNumber: "", decisionDate: "", oldSalary: "", newSalary: "", reason: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<SalaryAdjust>>(`/salaryAdjustments?page=${page}&limit=10`); setAdjustments(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), oldSalary: Number(formData.oldSalary), newSalary: Number(formData.newSalary) }
    if (editing) await api.put(`/salaryAdjustments/${editing.id}`, payload)
    else await api.post("/salaryAdjustments", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bản Ghi Này?")) { await api.delete(`/salaryAdjustments/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (s: SalaryAdjust & { employeeName?: string }) => s.employeeName || "-" },
    { key: "adjustType", header: "Loại" },
    { key: "decisionNumber", header: "Số Quyết Định" },
    { key: "decisionDate", header: "Ngày", render: (s: SalaryAdjust) => formatDate(s.decisionDate) },
    { key: "oldSalary", header: "Lương Cũ", render: (s: SalaryAdjust) => formatCurrency(s.oldSalary) },
    { key: "newSalary", header: "Lương Mới", render: (s: SalaryAdjust) => <span className="text-green-400 font-medium">{formatCurrency(s.newSalary)}</span> },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Điều Chỉnh Lương</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quản Lý Thay Đổi Lương</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", adjustType: "", decisionNumber: "", decisionDate: "", oldSalary: "", newSalary: "", reason: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Điều Chỉnh</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={adjustments} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(s) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(s); setFormData({ employeeId: String(s.employeeId), adjustType: s.adjustType, decisionNumber: s.decisionNumber, decisionDate: s.decisionDate, oldSalary: String(s.oldSalary), newSalary: String(s.newSalary), reason: s.reason }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Điều Chỉnh" : "Thêm Điều Chỉnh"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Loại Điều Chỉnh" value={formData.adjustType} onChange={(e) => setFormData({ ...formData, adjustType: e.target.value })} options={[{ value: "", label: "Chọn Loại" }, { value: "Increase", label: "Tăng Lương" }, { value: "Decrease", label: "Giảm Lương" }, { value: "Promotion", label: "Thăng Chức" }]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Số Quyết Định" value={formData.decisionNumber} onChange={(e) => setFormData({ ...formData, decisionNumber: e.target.value })} required />
            <Input label="Ngày Quyết Định" type="date" value={formData.decisionDate} onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Lương Cũ" type="number" value={formData.oldSalary} onChange={(e) => setFormData({ ...formData, oldSalary: e.target.value })} required />
            <Input label="Lương Mới" type="number" value={formData.newSalary} onChange={(e) => setFormData({ ...formData, newSalary: e.target.value })} required />
          </div>
          <Textarea label="Lý Do" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal></>
  )
}