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
import { TrainingCourse, ApiResponse } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
export default function TrainingPage() {
  const { isDark } = useTheme()
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TrainingCourse | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", startDate: "", endDate: "", instructor: "", location: "", status: "planned" })
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<TrainingCourse>>(`/trainingCourses?page=${page}&limit=10&search=${search}`)
      setCourses(res.data)
      setTotal(res.total)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, search])
  useEffect(() => { fetchData() }, [fetchData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) await api.put(`/trainingCourses/${editing.id}`, formData)
    else await api.post("/trainingCourses", formData)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Delete This Course?")) { await api.delete(`/trainingCourses/${id}`); fetchData() } }
  const columns = [
    { key: "name", header: "Course Name", sortable: true },
    { key: "instructor", header: "Instructor" },
    { key: "startDate", header: "Start Date", render: (c: TrainingCourse) => formatDate(c.startDate) },
    { key: "endDate", header: "End Date", render: (c: TrainingCourse) => formatDate(c.endDate) },
    { key: "location", header: "Location" },
    { key: "status", header: "Status", render: (c: TrainingCourse) => <Badge variant={c.status === "completed" ? "success" : c.status === "ongoing" ? "info" : "warning"}>{c.status === "completed" ? "Completed" : c.status === "ongoing" ? "Ongoing" : "Planned"}</Badge> },
  ]
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Training</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Manage Training Courses</p></div>
            <Button variant="dark" onClick={() => { setEditing(null); setFormData({ name: "", description: "", startDate: "", endDate: "", instructor: "", location: "", status: "planned" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Add Course</Button>
          </div>
          <Card><CardContent className="p-6">
            <DataTable columns={columns} data={courses} totalItems={total} currentPage={page} pageSize={10} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Search Courses..." loading={loading}
              actions={(c) => (<><Button variant="ghost" size="sm" onClick={() => { setEditing(c); setFormData({ name: c.name, description: c.description, startDate: c.startDate, endDate: c.endDate, instructor: c.instructor, location: c.location, status: c.status }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></>)} />
          </CardContent></Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Course" : "Add Course"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Course Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            <Input label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Instructor" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} />
            <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          </div>
          <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: "planned", label: "Planned" }, { value: "ongoing", label: "Ongoing" }, { value: "completed", label: "Completed" }]} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Update" : "Create"}</Button></div>
        </form>
      </Modal>
    </>
  )
}