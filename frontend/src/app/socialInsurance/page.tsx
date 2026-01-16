"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate, formatCurrency } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { ApiResponse, Employee } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface SocialInsurance { id: number; employeeId: number; insuranceNumber: string; startDate: string; monthlyContribution: number; status: string }
export default function SocialInsurancePage() {
  const { isDark } = useTheme()
  const [records, setRecords] = useState<SocialInsurance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SocialInsurance | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", insuranceNumber: "", startDate: "", monthlyContribution: "", status: "active" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<SocialInsurance>>(`/socialInsurance?page=${page}&limit=10`); setRecords(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), monthlyContribution: Number(formData.monthlyContribution) }
    if (editing) await api.put(`/socialInsurance/${editing.id}`, payload)
    else await api.post("/socialInsurance", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bản Ghi Này?")) { await api.delete(`/socialInsurance/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (s: SocialInsurance & { employeeName?: string }) => s.employeeName || "-" },
    { key: "insuranceNumber", header: "Số BHXH" },
    { key: "startDate", header: "Ngày Bắt Đầu", render: (s: SocialInsurance) => formatDate(s.startDate) },
    { key: "monthlyContribution", header: "Đóng Hằng Tháng", render: (s: SocialInsurance) => formatCurrency(s.monthlyContribution) },
    { key: "status", header: "Trạng Thái", render: (s: SocialInsurance) => <Badge variant={s.status === "active" ? "success" : "danger"}>{s.status === "active" ? "Hoạt Động" : "Ngừng Hoạt Động"}</Badge> },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Bảo Hiểm Xã Hội</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Hồ Sơ Bảo Hiểm</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", insuranceNumber: "", startDate: "", monthlyContribution: "", status: "active" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Bản Ghi</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={records} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(s) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(s); setFormData({ employeeId: String(s.employeeId), insuranceNumber: s.insuranceNumber, startDate: s.startDate, monthlyContribution: String(s.monthlyContribution), status: s.status }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Bản Ghi" : "Thêm Bản Ghi"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Input label="Số Bảo Hiểm" value={formData.insuranceNumber} onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })} required />
          <Input label="Ngày Bắt Đầu" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
          <Input label="Mức Đóng Hằng Tháng" type="number" value={formData.monthlyContribution} onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })} required />
          <Select label="Trạng Thái" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: "active", label: "Hoạt Động" }, { value: "inactive", label: "Ngừng Hoạt Động" }]} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal></>
  )
}