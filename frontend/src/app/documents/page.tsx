"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api, formatDate } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { ApiResponse, Employee } from "@/types"
import { Upload, FileText, Download, Trash2 } from "lucide-react"
import { useEffect, useState, useRef } from "react"
interface Document { id: number; employeeId: number; documentType: string; fileName: string; filePath: string; uploadedAt: string }
export default function DocumentsPage() {
  const { isDark } = useTheme()
  const [documents, setDocuments] = useState<Document[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ employeeId: "", documentType: "", fileName: "" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<Document>>("/documents")
      setDocuments(res.data)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }
  useEffect(() => {
    fetchData()
    api.get<ApiResponse<Employee>>("/employees").then(res => setEmployees(res.data))
  }, [])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFormData({ ...formData, fileName: file.name })
    }
  }
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return alert("Please select a file")
    const payload = {
      employeeId: Number(formData.employeeId),
      documentType: formData.documentType,
      fileName: formData.fileName,
      filePath: `/uploads/${formData.fileName}`,
      uploadedAt: new Date().toISOString()
    }
    await api.post("/documents", payload)
    setModalOpen(false)
    setSelectedFile(null)
    setFormData({ employeeId: "", documentType: "", fileName: "" })
    fetchData()
  }
  const handleDownload = (doc: Document) => {
    const content = `Document: ${doc.fileName}\nType: ${doc.documentType}\nUploaded: ${formatDate(doc.uploadedAt)}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = doc.fileName
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleDelete = async (id: number) => { if (confirm("Delete This Document?")) { await api.delete(`/documents/${id}`); fetchData() } }
  return (
    <><Navbar /><main className="pt-24 px-4 lg:px-8 pb-8"><div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Documents</h1><p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>File Repository</p></div>
        <Button variant="dark" onClick={() => { setFormData({ employeeId: "", documentType: "", fileName: "" }); setSelectedFile(null); setModalOpen(true) }}><Upload className="w-4 h-4" /> Upload Document</Button>
      </div>
      <Card><CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12"><FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-white/50" : "text-black/50"}`} /><p className={isDark ? "text-white/50" : "text-black/50"}>No Documents Uploaded</p></div>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/10 hover:bg-black/10"}`}>
                <div className="flex items-center gap-3"><FileText className="w-8 h-8 text-green-500" /><div><p className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{doc.fileName}</p><p className={`text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>{doc.documentType} • {formatDate(doc.uploadedAt)}</p></div></div>
                <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}><Download className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>
    </div></main>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document" size="md">
        <form onSubmit={handleUpload} className="space-y-4">
          <Select label="Employee" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} options={[{ value: "", label: "Select Employee" }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} required />
          <Select label="Document Type" value={formData.documentType} onChange={(e) => setFormData({ ...formData, documentType: e.target.value })} options={[{ value: "", label: "Select Type" }, { value: "ID Card", label: "ID Card" }, { value: "Passport", label: "Passport" }, { value: "Contract", label: "Contract" }, { value: "Certificate", label: "Certificate" }, { value: "Resume", label: "Resume" }, { value: "Other", label: "Other" }]} required />
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-black"}`}>Select File</label>
            <input ref={fileInputRef} type="file" onChange={handleFileChange} className={`w-full px-3 py-2 border rounded transition-colors ${isDark ? "bg-transparent border-white text-white" : "bg-transparent border-black text-black"}`} required />
            {selectedFile && <p className={`mt-2 text-sm ${isDark ? "text-white/70" : "text-black/70"}`}>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>}
          </div>
          <Input label="File Name" value={formData.fileName} onChange={(e) => setFormData({ ...formData, fileName: e.target.value })} required />
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">Upload</Button></div>
        </form>
      </Modal></>
  )
}