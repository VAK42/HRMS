"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { Employee, Department, Position, ApiResponse } from "@/types"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
export default function EmployeesPage() {
  const { isDark } = useTheme()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    employeeCode: "", fullName: "", email: "", phone: "", birthday: "",
    gender: "", idNumber: "", address: "", departmentId: "", positionId: "", startDate: "", status: "active"
  })
  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<Employee>>(`/employees?page=${page}&limit=10&search=${search}`)
      setEmployees(res.data)
      setTotal(res.total)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [page, search])
  useEffect(() => {
    fetchEmployees()
    api.get<ApiResponse<Department>>("/departments").then(res => setDepartments(res.data))
    api.get<ApiResponse<Position>>("/positions").then(res => setPositions(res.data))
  }, [fetchEmployees])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...formData, departmentId: Number(formData.departmentId), positionId: Number(formData.positionId) }
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, payload)
      } else {
        await api.post("/employees", payload)
      }
      setModalOpen(false)
      setEditingEmployee(null)
      resetForm()
      fetchEmployees()
    } catch (error) {
      console.error(error)
    }
  }
  const handleDelete = async (id: number) => {
    if (confirm("Bạn Có Chắc Chắn Muốn Xóa Nhân Viên Này?")) {
      await api.delete(`/employees/${id}`)
      fetchEmployees()
    }
  }
  const resetForm = () => {
    setFormData({ employeeCode: "", fullName: "", email: "", phone: "", birthday: "", gender: "", idNumber: "", address: "", departmentId: "", positionId: "", startDate: "", status: "active" })
  }
  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp)
    setFormData({
      employeeCode: emp.employeeCode, fullName: emp.fullName, email: emp.email || "", phone: emp.phone || "",
      birthday: emp.birthday || "", gender: emp.gender || "", idNumber: emp.idNumber || "", address: emp.address || "",
      departmentId: String(emp.departmentId || ""), positionId: String(emp.positionId || ""), startDate: emp.startDate || "", status: emp.status
    })
    setModalOpen(true)
  }
  const columns = [
    { key: "employeeCode", header: "Mã Nhân Viên", sortable: true },
    { key: "fullName", header: "Họ Tên", sortable: true },
    { key: "email", header: "Email" },
    { key: "phone", header: "SĐT" },
    { key: "departmentId", header: "Phòng Ban", render: (emp: Employee) => departments.find(d => d.id === emp.departmentId)?.name || "-" },
    { key: "positionId", header: "Vị Trí", render: (emp: Employee) => positions.find(p => p.id === emp.positionId)?.name || "-" },
    { key: "startDate", header: "Ngày Bắt Đầu", render: (emp: Employee) => formatDate(emp.startDate) },
    {
      key: "status", header: "Trạng Thái", render: (emp: Employee) => (
        <Badge variant={emp.status === "active" ? "success" : "danger"}>{emp.status === "active" ? "Hoạt Động" : "Ngừng HĐ"}</Badge>
      )
    },
  ]
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Nhân Viên</h1>
              <p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quản Lý Hồ Sơ Nhân Viên</p>
            </div>
            <Button variant="dark" onClick={() => { resetForm(); setEditingEmployee(null); setModalOpen(true) }}>
              <Plus className="w-4 h-4" /> Thêm Nhân Viên
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <DataTable
                columns={columns}
                data={employees}
                totalItems={total}
                currentPage={page}
                pageSize={10}
                onPageChange={setPage}
                onSearch={setSearch}
                searchPlaceholder="Tìm Kiếm Nhân Viên..."
                loading={loading}
                actions={(emp) => (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(emp)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(emp.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  </>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingEmployee ? "Sửa Nhân Viên" : "Thêm Nhân Viên"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Mã Nhân Viên" value={formData.employeeCode} onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })} required />
            <Input label="Họ Tên" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <Input label="SĐT" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            <Input label="Ngày Sinh" type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} required />
            <Select label="Giới Tính" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} options={[{ value: "", label: "Chọn Giới Tính" }, { value: "Male", label: "Nam" }, { value: "Female", label: "Nữ" }]} required />
            <Input label="CCCD/CMND" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} required />
            <Input label="Ngày Bắt Đầu" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            <Select label="Phòng Ban" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} options={[{ value: "", label: "Chọn Phòng Ban" }, ...departments.map(d => ({ value: d.id, label: d.name }))]} required />
            <Select label="Vị Trí" value={formData.positionId} onChange={(e) => setFormData({ ...formData, positionId: e.target.value })} options={[{ value: "", label: "Chọn Vị Trí" }, ...positions.map(p => ({ value: p.id, label: p.name }))]} required />
            <Select label="Trạng Thái" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: "active", label: "Hoạt Động" }, { value: "inactive", label: "Ngừng HĐ" }]} required />
          </div>
          <Textarea label="Địa Chỉ" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit">{editingEmployee ? "Cập Nhật" : "Tạo Mới"}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}