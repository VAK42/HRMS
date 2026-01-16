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
import { ApiResponse, Employee } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
interface ForeignExit { id: number; employeeId: number; destination: string; purpose: string; departureDate: string; returnDate: string; status: string }
export default function ForeignExitPage() {
  const { isDark } = useTheme()
  const [exits, setExits] = useState<ForeignExit[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ForeignExit | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", destination: "", purpose: "", departureDate: "", returnDate: "", status: "pending" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<ForeignExit>>(`/foreignExits?page=${page}&limit=10`); setExits(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId) }
    if (editing) await api.put(`/foreignExits/${editing.id}`, payload)
    else await api.post("/foreignExits", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Delete This Record?")) { await api.delete(`/foreignExits/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Employee", render: (e: ForeignExit & { employeeName?: string }) => e.employeeName || "-" },
    { key: "destination", header: "Destination" },
    { key: "purpose", header: "Purpose" },
    { key: "departureDate", header: "Departure", render: (e: ForeignExit) => formatDate(e.departureDate) },
    { key: "returnDate", header: "Return", render: (e: ForeignExit) => formatDate(e.returnDate) },
    { key: "status", header: "Status", render: (e: ForeignExit) => <Badge variant={e.status === "approved" ? "success" : e.status === "pending" ? "warning" : "danger"}>{e.status}</Badge> },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Foreign Exit</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>International Travel Tracking</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", destination: "", purpose: "", departureDate: "", returnDate: "", status: "pending" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Add Record</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={exits} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(e) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(e); setFormData({ employeeId: String(e.employeeId), destination: e.destination, purpose: e.purpose, departureDate: e.departureDate, returnDate: e.returnDate, status: e.status }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Record" : "Add Record"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Employee" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Select Employee" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Input label="Destination" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} required />
          <Textarea label="Purpose" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Departure Date" type="date" value={formData.departureDate} onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })} required />
            <Input label="Return Date" type="date" value={formData.returnDate} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} required />
          </div>
          <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }]} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Update" : "Create"}</Button></div>
        </form>
      </Modal></>
  )
}