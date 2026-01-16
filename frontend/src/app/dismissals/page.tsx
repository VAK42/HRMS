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
interface Dismissal { id: number; employeeId: number; dismissalType: string; decisionNumber: string; decisionDate: string; effectiveDate: string; reason: string }
export default function DismissalsPage() {
  const { isDark } = useTheme()
  const [dismissals, setDismissals] = useState<Dismissal[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Dismissal | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", dismissalType: "", decisionNumber: "", decisionDate: "", effectiveDate: "", reason: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get<ApiResponse<Dismissal>>(`/dismissals?page=${page}&limit=10`); setDismissals(res.data); setTotal(res.total) }
    catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId) }
    if (editing) await api.put(`/dismissals/${editing.id}`, payload)
    else await api.post("/dismissals", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Delete This Record?")) { await api.delete(`/dismissals/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Employee", render: (d: Dismissal & { employeeName?: string }) => d.employeeName || "-" },
    { key: "dismissalType", header: "Type" },
    { key: "decisionNumber", header: "Decision No." },
    { key: "decisionDate", header: "Decision Date", render: (d: Dismissal) => formatDate(d.decisionDate) },
    { key: "effectiveDate", header: "Effective Date", render: (d: Dismissal) => formatDate(d.effectiveDate) },
  ]
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Dismissals</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Job Dismissal Records</p></div><Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", dismissalType: "", decisionNumber: "", decisionDate: "", effectiveDate: "", reason: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Add Record</Button></div>
      <Card><CardContent className="p-6"><DataTable columns={columns} data={dismissals} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} loading={loading} actions={(d) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(d); setFormData({ employeeId: String(d.employeeId), dismissalType: d.dismissalType, decisionNumber: d.decisionNumber, decisionDate: d.decisionDate, effectiveDate: d.effectiveDate, reason: d.reason }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} /></CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Record" : "Add Record"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Employee" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Select Employee" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Dismissal Type" value={formData.dismissalType} onChange={(e) => setFormData({ ...formData, dismissalType: e.target.value })} options={[{ value: "", label: "Select Type" }, { value: "Voluntary", label: "Voluntary" }, { value: "Involuntary", label: "Involuntary" }, { value: "Retirement", label: "Retirement" }]} required />
          <Input label="Decision Number" value={formData.decisionNumber} onChange={(e) => setFormData({ ...formData, decisionNumber: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Decision Date" type="date" value={formData.decisionDate} onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })} required />
            <Input label="Effective Date" type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} required />
          </div>
          <Textarea label="Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Update" : "Create"}</Button></div>
        </form>
      </Modal></>
  )
}