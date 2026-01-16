"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { Plus, Edit, Trash2, Building2, Briefcase, FileText, Globe, GraduationCap } from "lucide-react"
import { useEffect, useState } from "react"
interface CatalogItem { id: number; catalogType: string; name: string; code: string; description: string; isActive: number }
const catalogTypes = [
  { value: "department", label: "Phòng Ban", icon: Building2 },
  { value: "position", label: "Vị Trí", icon: Briefcase },
  { value: "contractType", label: "Loại Hợp Đồng", icon: FileText },
  { value: "leaveType", label: "Loại Nghỉ Phép", icon: FileText },
  { value: "nationality", label: "Quốc Tịch", icon: Globe },
  { value: "degreeType", label: "Loại Bằng Cấp", icon: GraduationCap },
]
export default function CatalogPage() {
  const { isDark } = useTheme()
  const [activeType, setActiveType] = useState("department")
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [formData, setFormData] = useState({ name: "", code: "", description: "", isActive: "1" })
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get<{ data: CatalogItem[] }>(`/catalog?catalogType=${activeType}`)
      setItems(res.data)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [activeType])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...formData, catalogType: activeType, isActive: Number(formData.isActive) }
    if (editing) await api.put(`/catalog/${editing.id}`, payload)
    else await api.post("/catalog", payload)
    setModalOpen(false); setEditing(null); fetchData()
  }
  const handleDelete = async (id: number) => { if (confirm("Xóa Mục Này?")) { await api.delete(`/catalog/${id}`); fetchData() } }
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Quản Lý Danh Mục</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Quản Lý Danh Mục Hệ Thống</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="p-4">
                <div className="space-y-1">
                  {catalogTypes.map(type => (
                    <button key={type.value} onClick={() => setActiveType(type.value)} className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${activeType === type.value ? "bg-green-950 text-white" : isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}>
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{catalogTypes.find(t => t.value === activeType)?.label}</CardTitle>
                <Button variant="dark" size="sm" onClick={() => { setEditing(null); setFormData({ name: "", code: "", description: "", isActive: "1" }); setModalOpen(true) }}><Plus className="w-4 h-4" /> Thêm</Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className={`h-12 rounded-lg animate-pulse ${isDark ? "bg-white/5" : "bg-black/5"}`} />)}</div>
                ) : items.length === 0 ? (
                  <p className={`text-center py-8 ${isDark ? "text-white/50" : "text-black/50"}`}>Không Có Dữ Liệu</p>
                ) : (
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/10 hover:bg-black/10"}`}>
                        <div>
                          <p className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{item.name}</p>
                          <p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>{item.code} {item.description && `- ${item.description}`}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setFormData({ name: item.name, code: item.code || "", description: item.description || "", isActive: String(item.isActive) }); setModalOpen(true) }}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa Danh Mục" : "Thêm Danh Mục"} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Tên" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Mã" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
          <Input label="Mô Tả" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Select label="Trạng Thái" value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value })} options={[{ value: "1", label: "Hoạt Động" }, { value: "0", label: "Ngừng HĐ" }]} />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit">{editing ? "Cập Nhật" : "Tạo Mới"}</Button></div>
        </form>
      </Modal>
    </>
  )
}