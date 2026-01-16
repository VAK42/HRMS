"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { ApiResponse, Department, Employee } from "@/types"
import { useEffect, useState, useCallback } from "react"
import { Input, Textarea } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { useTheme } from "@/lib/themeContext"
import { Modal } from "@/components/ui/modal"
import { api, formatDate } from "@/lib/api"
interface ScheduleEvent { id: number; employeeId: number; eventType: string; title: string; startDate: string; endDate: string; notes: string; employeeName?: string }
export default function WorkSchedulePage() {
  const { isDark } = useTheme()
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDept, setSelectedDept] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", eventType: "", title: "", startDate: "", endDate: "", notes: "" })
  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<ScheduleEvent>>(`/scheduleEvents`)
      setEvents(res.data || [])
    } catch (error) { console.error(error) }
  }, [])
  useEffect(() => {
    api.get<ApiResponse<Department>>("/departments").then(res => setDepartments(res.data))
    api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data))
    fetchEvents()
  }, [fetchEvents])
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  const openAddEvent = (day?: number) => {
    const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : ""
    setFormData({ employeeId: "", eventType: "", title: "", startDate: dateStr, endDate: dateStr, notes: "" })
    setSelectedDay(day || null)
    setSelectedEvent(null)
    setModalOpen(true)
  }
  const openEventDetail = (event: ScheduleEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setDetailOpen(true)
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, employeeId: Number(formData.employeeId) }
    await api.post("/scheduleEvents", payload)
    setModalOpen(false)
    fetchEvents()
  }
  const handleDelete = async (id: number) => {
    if (confirm("Delete This Event?")) {
      await api.delete(`/scheduleEvents/${id}`)
      setDetailOpen(false)
      fetchEvents()
    }
  }
  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    let filtered = events.filter(e => e.startDate <= dateStr && e.endDate >= dateStr)
    if (selectedDept) {
      const deptEmployees = employees.filter(emp => emp.departmentId === Number(selectedDept)).map(emp => emp.id)
      filtered = filtered.filter(e => deptEmployees.includes(e.employeeId))
    }
    return filtered
  }
  const getEmployeeName = (employeeId: number) => {
    const emp = employees.find(e => e.id === employeeId)
    return emp?.fullName || "Unknown"
  }
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Work Schedule</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Business Trip Calendar</p></div>
            <Button variant="dark" onClick={() => openAddEvent()}><Plus className="w-4 h-4" /> Add Event</Button>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={prevMonth} className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-black/10"}`}><ChevronLeft className="w-5 h-5" /></button>
                <CardTitle>{monthName}</CardTitle>
                <button onClick={nextMonth} className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-black/10"}`}><ChevronRight className="w-5 h-5" /></button>
              </div>
              <Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} options={[{ value: "", label: "All Departments" }, ...departments.map(d => ({ value: String(d.id), label: d.name }))]} className="w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} className={`text-center text-sm font-medium py-2 ${isDark ? "text-white" : "text-black"}`}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="h-24" />)}
                {days.map(day => {
                  const dayEvents = getEventsForDay(day)
                  const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()
                  return (
                    <div
                      key={day}
                      onClick={() => openAddEvent(day)}
                      className={`h-24 p-2 rounded-lg border transition-colors cursor-pointer ${isDark ? "bg-white/5 border-white/20 hover:bg-white/10" : "bg-black/5 border-black/20 hover:bg-black/10"}`}
                    >
                      <span className={`text-sm ${isToday ? "bg-green-950 text-white px-2 py-1 rounded-full" : isDark ? "text-white" : "text-black"}`}>{day}</span>
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            onClick={(e) => openEventDetail(event, e)}
                            className="text-xs px-1 py-0.5 rounded truncate text-white bg-green-950 hover:bg-green-900 cursor-pointer"
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <span className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>+{dayEvents.length - 2} More</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedDay ? `Add Event - ${monthName.split(" ")[0]} ${selectedDay}` : "Add Event"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Employee" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Select Employee" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Event Type" value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} options={[{ value: "", label: "Select Type" }, { value: "Business Trip", label: "Business Trip" }, { value: "Leave", label: "Leave" }, { value: "Training", label: "Training" }, { value: "Meeting", label: "Meeting" }, { value: "Other", label: "Other" }]} required />
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            <Input label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
          </div>
          <Textarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">Create Event</Button></div>
        </form>
      </Modal>
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Event Details" size="md">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Title</p>
                <p className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{selectedEvent.title}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Type</p>
                <p className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{selectedEvent.eventType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Employee</p>
                <p className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{selectedEvent.employeeName || getEmployeeName(selectedEvent.employeeId)}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Duration</p>
                <p className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{formatDate(selectedEvent.startDate)} - {formatDate(selectedEvent.endDate)}</p>
              </div>
            </div>
            {selectedEvent.notes && (
              <div>
                <p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Notes</p>
                <p className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{selectedEvent.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => handleDelete(selectedEvent.id)}><Trash2 className="w-4 h-4 text-red-400" /> Delete</Button>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}