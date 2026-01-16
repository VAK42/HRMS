"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate, formatCurrency } from "@/lib/api"
import { Reward, Employee, ApiResponse } from "@/types"
import { useTheme } from "@/lib/themeContext"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
export default function RewardsPage() {
  const { isDark } = useTheme()
  const [rewards, setRewards] = useState<(Reward & { employeeName?: string })[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Reward | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", rewardType: "", decisionNumber: "", decisionDate: "", amount: "", reason: "" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<Reward & { employeeName?: string }>>(`/rewards?page=${page}&limit=10&search=${search}`)
      setRewards(res.data)
      setTotal(res.total)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, search])
  useEffect(() => { fetchData(); api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data)) }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId), amount: Number(formData.amount) }
    if (editing) await api.put(`/rewards/${editing.id}`, payload)
    else await api.post("/rewards", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Delete This Reward?")) { await api.delete(`/rewards/${id}`); fetchData() } }
  const columns = [
    { key: "employeeName", header: "Employee", render: (r: Reward & { employeeName?: string }) => r.employeeName || "-" },
    { key: "rewardType", header: "Type" },
    { key: "decisionNumber", header: "Decision No." },
    { key: "decisionDate", header: "Date", render: (r: Reward) => formatDate(r.decisionDate) },
    { key: "amount", header: "Amount", render: (r: Reward) => formatCurrency(r.amount) },
    { key: "reason", header: "Reason" },
  ]
  return (
    <div style={{ backgroundColor: isDark ? "#0a0f1a" : "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <main className="pt-16 px-4 pb-6">
        <div className="w-full space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}>Rewards</h1>
              <p className={`text-xs ${isDark ? "text-white" : "text-black"}`}>Manage Employee Rewards And Bonuses</p>
            </div>
            <Button variant="dark" onClick={() => { setEditing(null); setFormData({ employeeId: "", rewardType: "", decisionNumber: "", decisionDate: "", amount: "", reason: "" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Add Reward</Button>
          </div>
          <Card><CardContent className="p-4">
            <DataTable columns={columns} data={rewards} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Search Rewards..." loading={loading}
              actions={(r) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(r); setFormData({ employeeId: String(r.employeeId), rewardType: r.rewardType, decisionNumber: r.decisionNumber, decisionDate: r.decisionDate, amount: String(r.amount), reason: r.reason }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} />
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Reward" : "Add Reward"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Employee" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Select Employee" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Reward Type" value={formData.rewardType} onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })} options={[{ value: "", label: "Select Type" }, { value: "Performance Bonus", label: "Performance Bonus" }, { value: "Project Completion", label: "Project Completion" }, { value: "Innovation Award", label: "Innovation Award" }, { value: "Employee Of Month", label: "Employee Of Month" }]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Decision Number" value={formData.decisionNumber} onChange={(e) => setFormData({ ...formData, decisionNumber: e.target.value })} required />
            <Input label="Decision Date" type="date" value={formData.decisionDate} onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })} required />
          </div>
          <Input label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
          <Textarea label="Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Update" : "Create"}</Button></div>
        </form>
      </Modal>
    </div>
  )
}