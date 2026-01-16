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
interface HealthRecord { id: number; employeeId: number; height: number; weight: number; bloodType: string; allergies: string; checkupDate: string; notes: string }
export default function HealthPage() {
  const { isDark } = useTheme()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<HealthRecord | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", height: "", weight: "", bloodType: "", allergies: "", checkupDate: "", notes: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<HealthRecord>>(`/healthRecords?page=${page}&limit=10`); setRecords(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), height: Number(formData.height), weight: Number(formData.weight) }
    if (editing) await api.put(`/healthRecords/${editing.id}`, payload)
    else await api.post("/healthRecords", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Delete This Record?")) { await api.delete(`/healthRecords/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Employee", render: (h: HealthRecord & { employeeName?: string }) => h.employeeName || "-" },
    { key: "height", header: "Height (cm)" },
    { key: "weight", header: "Weight (kg)" },
    { key: "bloodType", header: "Blood Type" },
    { key: "checkupDate", header: "Checkup Date", render: (h: HealthRecord) => formatDate(h.checkupDate) },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Health Records</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Employee Health Information</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", height: "", weight: "", bloodType: "", allergies: "", checkupDate: "", notes: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Add Record</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={records} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(h) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(h); setFormData({ employeeId: String(h.employeeId), height: String(h.height), weight: String(h.weight), bloodType: h.bloodType, allergies: h.allergies, checkupDate: h.checkupDate, notes: h.notes }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(h.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Record" : "Add Record"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Employee" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Select Employee" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Height (cm)" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
            <Input label="Weight (kg)" type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
            <Select label="Blood Type" value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} options={[{ value: "", label: "Select" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "AB", label: "AB" }, { value: "O", label: "O" }]} />
          </div>
          <Input label="Checkup Date" type="date" value={formData.checkupDate} onChange={(e) => setFormData({ ...formData, checkupDate: e.target.value })} />
          <Input label="Allergies" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} />
          <Textarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Update" : "Create"}</Button></div>
        </form>
      </Modal></>
  )
}