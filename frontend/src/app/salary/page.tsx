"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatCurrency } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { SalaryRecord, Employee, ApiResponse } from "@/types"
import { Plus, Edit, Trash2, Download } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
export default function SalaryPage() {
  const { isDark } = useTheme()
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SalaryRecord | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", month: "", year: "", baseSalary: "", allowances: "", bonuses: "", deductions: "", netSalary: "", status: "pending" })
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<SalaryRecord>>(`/salaryRecords?page=${page}&limit=10&month=${filterMonth}&year=${filterYear}`)
      setSalaries(res.data)
      setTotal(res.total)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, filterMonth, filterYear])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), month: Number(formData.month), year: Number(formData.year), baseSalary: Number(formData.baseSalary), allowances: Number(formData.allowances), bonuses: Number(formData.bonuses), deductions: Number(formData.deductions), netSalary: Number(formData.netSalary) }
    if (editing) await api.put(`/salaryRecords/${editing.id}`, payload)
    else await api.post("/salaryRecords", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bản Ghi Này?")) { await api.delete(`/salaryRecords/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (s: SalaryRecord & { employeeName?: string }) => s.employeeName || "-" },
    { key: "month", header: "Kỳ Lương", render: (s: SalaryRecord) => `${s.month}/${s.year}` },
    { key: "baseSalary", header: "Lương Cơ Bản", render: (s: SalaryRecord) => formatCurrency(s.baseSalary) },
    { key: "allowances", header: "Phụ Cấp", render: (s: SalaryRecord) => formatCurrency(s.allowances) },
    { key: "bonuses", header: "Thưởng", render: (s: SalaryRecord) => formatCurrency(s.bonuses) },
    { key: "deductions", header: "Khấu Trừ", render: (s: SalaryRecord) => formatCurrency(s.deductions) },
    { key: "netSalary", header: "Thực Lĩnh", render: (s: SalaryRecord) => <span className="font-semibold text-green-400">{formatCurrency(s.netSalary)}</span> },
    { key: "status", header: "Trạng Thái", render: (s: SalaryRecord) => <Badge variant={s.status === "paid" ? "success" : s.status === "pending" ? "warning" : "info"}>{s.status === "paid" ? "Đã TT" : s.status === "pending" ? "Chờ Duyệt" : "Đang XL"}</Badge> },
  ]
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))
  const years = Array.from({ length: 5 }, (_, i) => ({ value: new Date().getFullYear() - i, label: String(new Date().getFullYear() - i) }))
  const exportToCSV = () => {
    const headers = "Nhân Viên,Kỳ Lương,Lương Cơ Bản,Phụ Cấp,Thưởng,Khấu Trừ,Thực Lĩnh,Trạng Thái"
    const rows = (salaries as (SalaryRecord & { employeeName?: string })[]).map(s =>
      `${s.employeeName || "-"},${s.month}/${s.year},${s.baseSalary},${s.allowances},${s.bonuses},${s.deductions},${s.netSalary},${s.status}`
    ).join("\n")
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `salary_report_${filterMonth}_${filterYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Quản Lý Lương</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quản Lý Bảng Lương Nhân Viên</p></div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={exportToCSV}><Download className="w-4 h-4" /> Xuất File</Button>
              <Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", month: String(filterMonth), year: String(filterYear), baseSalary: "", allowances: "0", bonuses: "0", deductions: "0", netSalary: "", status: "pending" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Bản Ghi</Button>
            </div>
          </div>
          <Card><CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <Select value={String(filterMonth)} onChange={(e) => setFilterMonth(Number(e.target.value))} options={months} className="w-40" />
              <Select value={String(filterYear)} onChange={(e) => setFilterYear(Number(e.target.value))} options={years} className="w-32" />
            </div>
            <DataTable columns={columns} data={salaries} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} emptyMessage="Không Có Dữ Liệu Lương"
              actions={(s) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(s); setFormData({ employeeId: String(s.employeeId), month: String(s.month), year: String(s.year), baseSalary: String(s.baseSalary), allowances: String(s.allowances), bonuses: String(s.bonuses), deductions: String(s.deductions), netSalary: String(s.netSalary), status: s.status }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} />
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Bản Ghi Lương" : "Thêm Bản Ghi Lương"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tháng" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} options={months} required />
            <Select label="Năm" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} options={years} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Lương Cơ Bản" type="number" value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })} required />
            <Input label="Phụ Cấp" type="number" value={formData.allowances} onChange={(e) => setFormData({ ...formData, allowances: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Thưởng" type="number" value={formData.bonuses} onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })} />
            <Input label="Khấu Trừ" type="number" value={formData.deductions} onChange={(e) => setFormData({ ...formData, deductions: e.target.value })} />
          </div>
          <Input label="Thực Lĩnh" type="number" value={formData.netSalary} onChange={(e) => setFormData({ ...formData, netSalary: e.target.value })} required />
          <Select label="Trạng Thái" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: "pending", label: "Chờ Duyệt" }, { value: "processing", label: "Đang XL" }, { value: "paid", label: "Đã TT" }]} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal>
    </>
  )
}