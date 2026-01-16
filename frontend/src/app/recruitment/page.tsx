"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate, formatCurrency } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { RecruitmentPost, Department, ApiResponse } from "@/types"
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
export default function RecruitmentPage() {
  const { isDark } = useTheme()
  const [posts, setPosts] = useState<RecruitmentPost[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RecruitmentPost | null>(null)
  const [formData, setFormData] = useState({ title: "", departmentId: "", jobType: "", salaryMin: "", salaryMax: "", deadline: "", description: "", requirements: "", status: "open" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<RecruitmentPost>>(`/recruitmentPosts?page=${page}&limit=10&search=${search}`)
      setPosts(res.data)
      setTotal(res.total)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, search])
  useEffect(() => {
    fetchData()
    api.get<ApiResponse<Department>>("/departments").then(res => setDepartments(res.data))
  }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, departmentId: Number(formData.departmentId), salaryMin: Number(formData.salaryMin), salaryMax: Number(formData.salaryMax) }
    if (editing) await api.put(`/recruitmentPosts/${editing.id}`, payload)
    else await api.post("/recruitmentPosts", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Delete This Job Post?")) { await api.delete(`/recruitmentPosts/${id}`); fetchData() } }
  const columns = [
    { key: "title", header: "Position", sortable: true },
    { key: "departmentId", header: "Department", render: (p: RecruitmentPost) => departments.find(d => d.id === p.departmentId)?.name || "-" },
    { key: "jobType", header: "Type" },
    { key: "salaryMin", header: "Salary Range", render: (p: RecruitmentPost) => `${formatCurrency(p.salaryMin)} - ${formatCurrency(p.salaryMax)}` },
    { key: "deadline", header: "Deadline", render: (p: RecruitmentPost) => formatDate(p.deadline) },
    { key: "candidateCount", header: "Candidates", render: (p: RecruitmentPost) => <span className="flex items-center gap-1"><Users className="w-4 h-4" />{p.candidateCount}</span> },
    { key: "status", header: "Status", render: (p: RecruitmentPost) => <Badge variant={p.status === "open" ? "success" : p.status === "closed" ? "danger" : "warning"}>{p.status === "open" ? "Open" : p.status === "closed" ? "Closed" : "Paused"}</Badge> },
  ]
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Recruitment</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Manage Job Postings And Candidates</p></div>
            <Button variant="dark" onClick={() => { setEditing(null); setFormData({ title: "", departmentId: "", jobType: "", salaryMin: "", salaryMax: "", deadline: "", description: "", requirements: "", status: "open" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Add Job Post</Button>
          </div>
          <Card><CardContent className="p-6">
            <DataTable columns={columns} data={posts} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Search Jobs..." loading={loading}
              actions={(p) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(p); setFormData({ title: p.title, departmentId: String(p.departmentId), jobType: p.jobType, salaryMin: String(p.salaryMin), salaryMax: String(p.salaryMax), deadline: p.deadline, description: p.description, requirements: p.requirements, status: p.status }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} />
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Job Post" : "Add Job Post"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Job Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Department" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} options={[{ value: "", label: "Select Department" }, ...departments.map(d => ({ value: d.id, label: d.name }))]} required />
            <Select label="Job Type" value={formData.jobType} onChange={(e) => setFormData({ ...formData, jobType: e.target.value })} options={[{ value: "", label: "Select Type" }, { value: "Full-Time", label: "Full-Time" }, { value: "Part-Time", label: "Part-Time" }, { value: "Contract", label: "Contract" }, { value: "Remote", label: "Remote" }]} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Min Salary" type="number" value={formData.salaryMin} onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })} required />
            <Input label="Max Salary" type="number" value={formData.salaryMax} onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })} required />
            <Input label="Deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
          </div>
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Textarea label="Requirements" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} />
          <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: "open", label: "Open" }, { value: "paused", label: "Paused" }, { value: "closed", label: "Closed" }]} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Update" : "Create"}</Button></div>
        </form>
      </Modal>
    </>
  )
}