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
import { Contract, Employee, ApiResponse } from "@/types"
import { useTheme } from "@/lib/themeContext"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
export default function ContractsPage() {
  const { isDark } = useTheme()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Contract | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", contractCode: "", contractType: "", startDate: "", endDate: "", baseSalary: "", status: "active" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<Contract>>(`/contracts?page=${page}&limit=10&search=${search}`)
      setContracts(res.data)
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
    const payload = { ...formData, employeeId: Number(formData.employeeId), baseSalary: Number(formData.baseSalary) }
    if (editing) await api.put(`/contracts/${editing.id}`, payload)
    else await api.post("/contracts", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Hợp Đồng Này?")) { await api.delete(`/contracts/${id}`); fetchData() } }
  const columns = [
    { key: "contractCode", header: "Mã Hợp Đồng", sortable: true },
    { key: "employeeName", header: "Nhân Viên", render: (c: Contract & { employeeName?: string }) => c.employeeName || "-" },
    { key: "contractType", header: "Loại" },
    { key: "startDate", header: "Ngày Bắt Đầu", render: (c: Contract) => formatDate(c.startDate) },
    { key: "endDate", header: "Ngày Kết Thúc", render: (c: Contract) => c.endDate ? formatDate(c.endDate) : "Dài Hạn" },
    { key: "baseSalary", header: "Lương Cơ Bản", render: (c: Contract) => formatCurrency(c.baseSalary) },
    { key: "status", header: "Trạng Thái", render: (c: Contract) => <Badge variant={c.status === "active" ? "success" : "danger"}>{c.status === "active" ? "Hiệu Lực" : "Hết Hạn"}</Badge> },
  ]
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Hợp Đồng</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quản Lý Hợp Đồng Nhân Viên</p></div>
            <Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", contractCode: "", contractType: "", startDate: "", endDate: "", baseSalary: "", status: "active" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Hợp Đồng</Button>
          </div>
          <Card><CardContent className="p-6">
            <DataTable columns={columns} data={contracts} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Tìm Kiếm Hợp Đồng..." loading={loading}
              actions={(c) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(c); setFormData({ employeeId: String(c.employeeId), contractCode: c.contractCode, contractType: c.contractType, startDate: c.startDate, endDate: c.endDate || "", baseSalary: String(c.baseSalary), status: c.status }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} />
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Hợp Đồng" : "Thêm Hợp Đồng"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Input label="Mã Hợp Đồng" value={formData.contractCode} onChange={(e) => setFormData({ ...formData, contractCode: e.target.value })} required />
          <Select label="Loại Hợp Đồng" value={formData.contractType} onChange={(e) => setFormData({ ...formData, contractType: e.target.value })} options={[{ value: "", label: "Chọn Loại" }, { value: "Permanent", label: "Dài Hạn" }, { value: "Fixed-Term", label: "Có Thời Hạn" }, { value: "Probation", label: "Thử Việc" }]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày Bắt Đầu" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            <Input label="Ngày Kết Thúc" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          </div>
          <Input label="Lương Cơ Bản" type="number" value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })} required />
          <Select label="Trạng Thái" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: "active", label: "Hiệu Lực" }, { value: "expired", label: "Hết Hạn" }]} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal>
    </>
  )
}