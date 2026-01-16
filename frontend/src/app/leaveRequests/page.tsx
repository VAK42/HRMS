"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { LeaveRequest, Employee, ApiResponse } from "@/types"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
export default function LeaveRequestsPage() {
  const { isDark } = useTheme()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LeaveRequest | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", leaveType: "", startDate: "", endDate: "", days: "", reason: "", status: "pending" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<LeaveRequest>>(`/leaveRequests?page=${page}&limit=10&search=${search}`)
      setLeaves(res.data)
      setTotal(res.total)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, search])
  useEffect(() => {
    fetchData()
    api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data))
  }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), days: Number(formData.days) }
    if (editing) await api.put(`/leaveRequests/${editing.id}`, payload)
    else await api.post("/leaveRequests", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleStatusChange = async (id: number, status: string) => {
    await api.put(`/leaveRequests/${id}`, { status })
    fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Bạn Có Chắc Muốn Xóa?")) { await api.delete(`/leaveRequests/${id}`); fetchData() } }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge variant="success">Đã Duyệt</Badge>
      case "pending": return <Badge variant="warning">Chờ Duyệt</Badge>
      case "rejected": return <Badge variant="danger">Từ Chối</Badge>
      default: return <Badge>{status}</Badge>
    }
  }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (l: LeaveRequest & { employeeName?: string }) => l.employeeName || l.fullName || "-" },
    { key: "leaveType", header: "Loại" },
    { key: "startDate", header: "Ngày Bắt Đầu", render: (l: LeaveRequest) => formatDate(l.startDate) },
    { key: "endDate", header: "Ngày Kết Thúc", render: (l: LeaveRequest) => formatDate(l.endDate) },
    { key: "days", header: "Số Ngày" },
    { key: "reason", header: "Lý Do" },
    { key: "status", header: "Trạng Thái", render: (l: LeaveRequest) => getStatusBadge(l.status) },
  ]
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Yêu Cầu Nghỉ Phép</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quản Lý Yêu Cầu Nghỉ Phép Của Nhân Viên</p></div>
            <Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", leaveType: "", startDate: "", endDate: "", days: "", reason: "", status: "pending" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Tạo Yêu Cầu</Button>
          </div>
          <Card><CardContent className="p-6">
            <DataTable columns={columns} data={leaves} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Tìm Kiếm..." loading={loading}
              actions={(l) => (
                <>
                  {l.status === "pending" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(l.id, "approved")}><Check className="w-4 h-4 text-green-400" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(l.id, "rejected")}><X className="w-4 h-4 text-red-400" /></Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(l); setFormData({ employeeId: String(l.employeeId), leaveType: l.leaveType, startDate: l.startDate, endDate: l.endDate, days: String(l.days), reason: l.reason, status: l.status }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(l.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </>
              )} />
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Yêu Cầu Nghỉ Phép" : "Thêm Yêu Cầu Nghỉ Phép"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Loại Nghỉ Phép" value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })} options={[{ value: "", label: "Chọn Loại" }, { value: "Annual Leave", label: "Nghỉ Phép Năm" }, { value: "Sick Leave", label: "Nghỉ Ốm" }, { value: "Unpaid Leave", label: "Nghỉ Không Lương" }]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày Bắt Đầu" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            <Input label="Ngày Kết Thúc" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
          </div>
          <Input label="Số Ngày Nghỉ" type="number" value={formData.days} onChange={(e) => setFormData({ ...formData, days: e.target.value })} required />
          <Textarea label="Lý Do" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal>
    </>
  )
}