"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { ApiResponse, Employee } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface Degree { id: number; employeeId: number; degreeType: string; major: string; institution: string; graduationYear: number }
export default function DegreesPage() {
  const { isDark } = useTheme()
  const [degrees, setDegrees] = useState<Degree[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Degree | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", degreeType: "", major: "", institution: "", graduationYear: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<Degree>>(`/degrees?page=${page}&limit=10&search=${search}`)
      setDegrees(res.data)
      setTotal(res.total)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, search])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), graduationYear: Number(formData.graduationYear) }
    if (editing) await api.put(`/degrees/${editing.id}`, payload)
    else await api.post("/degrees", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bằng Cấp Này?")) { await api.delete(`/degrees/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (d: Degree & { employeeName?: string }) => d.employeeName || "-" },
    { key: "degreeType", header: "Loại Bằng Cấp" },
    { key: "major", header: "Chuyên Ngành" },
    { key: "institution", header: "Nơi Đào Tạo" },
    { key: "graduationYear", header: "Năm TN" },
  ]
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Bằng Cấp</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Trình Độ Chuyên Môn Nhân Viên</p></div>
            <Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", degreeType: "", major: "", institution: "", graduationYear: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Bằng Cấp</Button>
          </div>
          <Card><CardContent className="p-6">
            <DataTable columns={columns} data={degrees} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Tìm Kiếm Bằng Cấp..." loading={loading}
              actions={(d) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(d); setFormData({ employeeId: String(d.employeeId), degreeType: d.degreeType, major: d.major, institution: d.institution, graduationYear: String(d.graduationYear) }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} />
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Bằng Cấp" : "Thêm Bằng Cấp"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Loại Bằng Cấp" value={formData.degreeType} onChange={(e) => setFormData({ ...formData, degreeType: e.target.value })} options={[{ value: "", label: "Chọn Loại" }, { value: "Bachelor", label: "Cử Nhân" }, { value: "Master", label: "Thạc Sĩ" }, { value: "PhD", label: "Tiến Sĩ" }, { value: "Certificate", label: "Chứng Chỉ" }]} required />
          <Input label="Chuyên Ngành" value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} required />
          <Input label="Nơi Đào Tạo" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} required />
          <Input label="Năm Tốt Nghiệp" type="number" value={formData.graduationYear} onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })} required />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal>
    </>
  )
}