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
import { ApiResponse, Employee, Department } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface Transfer { id: number; employeeId: number; fromDepartmentId: number; toDepartmentId: number; decisionNumber: string; decisionDate: string; effectiveDate: string; reason: string }
export default function TransfersPage() {
  const { isDark } = useTheme()
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transfer | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", fromDepartmentId: "", toDepartmentId: "", decisionNumber: "", decisionDate: "", effectiveDate: "", reason: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<Transfer>>(`/transfers?page=${page}&limit=10`); setTransfers(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)); api.get<ApiResponse<Department>>("/departments").then(res => setDepartments(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), fromDepartmentId: Number(formData.fromDepartmentId), toDepartmentId: Number(formData.toDepartmentId) }
    if (editing) await api.put(`/transfers/${editing.id}`, payload)
    else await api.post("/transfers", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bản Ghi Này?")) { await api.delete(`/transfers/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (t: Transfer & { employeeName?: string }) => t.employeeName || "-" },
    { key: "fromDepartmentId", header: "Từ", render: (t: Transfer) => departments.find(d => d.id === t.fromDepartmentId)?.name || "-" },
    { key: "toDepartmentId", header: "Đến", render: (t: Transfer) => departments.find(d => d.id === t.toDepartmentId)?.name || "-" },
    { key: "decisionNumber", header: "Số Quyết Định" },
    { key: "effectiveDate", header: "Ngày Hiệu Lực", render: (t: Transfer) => formatDate(t.effectiveDate) },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Điều Chuyển</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Điều Chuyển Phòng Ban</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", fromDepartmentId: "", toDepartmentId: "", decisionNumber: "", decisionDate: "", effectiveDate: "", reason: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Điều Chuyển</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={transfers} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(t) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(t); setFormData({ employeeId: String(t.employeeId), fromDepartmentId: String(t.fromDepartmentId), toDepartmentId: String(t.toDepartmentId), decisionNumber: t.decisionNumber, decisionDate: t.decisionDate, effectiveDate: t.effectiveDate, reason: t.reason }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Điều Chuyển" : "Thêm Điều Chuyển"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Từ Phòng Ban" value={formData.fromDepartmentId} onChange={(e) => setFormData({ ...formData, fromDepartmentId: e.target.value })} options={[{ value: "", label: "Chọn" }, ...departments.map(d => ({ value: d.id, label: d.name }))]} required />
            <Select label="Đến Phòng Ban" value={formData.toDepartmentId} onChange={(e) => setFormData({ ...formData, toDepartmentId: e.target.value })} options={[{ value: "", label: "Chọn" }, ...departments.map(d => ({ value: d.id, label: d.name }))]} required />
          </div>
          <Input label="Số Quyết Định" value={formData.decisionNumber} onChange={(e) => setFormData({ ...formData, decisionNumber: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày Quyết Định" type="date" value={formData.decisionDate} onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })} required />
            <Input label="Ngày Hiệu Lực" type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} required />
          </div>
          <Textarea label="Lý Do" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal></>
  )
}