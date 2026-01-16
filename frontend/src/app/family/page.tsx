"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { ApiResponse, Employee } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface FamilyMember { id: number; employeeId: number; fullName: string; relationship: string; birthday: string; occupation: string; phone: string }
export default function FamilyPage() {
  const { isDark } = useTheme()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FamilyMember | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", fullName: "", relationship: "", birthday: "", occupation: "", phone: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<FamilyMember>>(`/familyMembers?page=${page}&limit=10&search=${search}`)
      setMembers(res.data)
      setTotal(res.total)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, search])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId) }
    if (editing) await api.put(`/familyMembers/${editing.id}`, payload)
    else await api.post("/familyMembers", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Bản Ghi Này?")) { await api.delete(`/familyMembers/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Nhân Viên", render: (m: FamilyMember & { employeeName?: string }) => m.employeeName || "-" },
    { key: "fullName", header: "Tên Thành Viên" },
    { key: "relationship", header: "Mối Quan Hệ" },
    { key: "birthday", header: "Ngày Sinh", render: (m: FamilyMember) => formatDate(m.birthday) },
    { key: "occupation", header: "Nghề Nghiệp" },
    { key: "phone", header: "Số Điện Thoại" },
  ]
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Thành Viên Gia Đình</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quan Hệ Gia Đình Nhân Viên</p></div>
            <Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", fullName: "", relationship: "", birthday: "", occupation: "", phone: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm Thành Viên</Button>
          </div>
          <Card><CardContent className="p-6">
            <DataTable columns={columns} data={members} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Tìm Kiếm Thành Viên..." loading={loading}
              actions={(m) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(m); setFormData({ employeeId: String(m.employeeId), fullName: m.fullName, relationship: m.relationship, birthday: m.birthday, occupation: m.occupation, phone: m.phone }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} />
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Thành Viên" : "Thêm Thành Viên"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Nhân Viên" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Chọn Nhân Viên" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Input label="Họ Và Tên" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
          <Select label="Mối Quan Hệ" value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })} options={[{ value: "", label: "Chọn" }, { value: "Spouse", label: "Vợ/Chồng" }, { value: "Child", label: "Con" }, { value: "Parent", label: "Cha/Mẹ" }, { value: "Sibling", label: "Anh/Chị/Em" }]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày Sinh" type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} />
            <Input label="Số Điện Thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <Input label="Nghề Nghiệp" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal>
    </>
  )
}