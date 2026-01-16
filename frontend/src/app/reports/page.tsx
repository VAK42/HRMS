"use client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { api, formatDate, formatCurrency } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { Employee } from "@/types"
import { Download, Filter, Check } from "lucide-react"
import { useEffect, useState } from "react"
interface ReportEmployee extends Employee {
  departmentName?: string
  positionName?: string
  baseSalary?: number
  contractType?: string
}
interface ColumnDef {
  key: string
  header: string
  visible: boolean
  sortable?: boolean
  render?: (e: ReportEmployee) => React.ReactNode
}
export default function ReportsPage() {
  const { isDark } = useTheme()
  const [employees, setEmployees] = useState<ReportEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [columnDefs, setColumnDefs] = useState<ColumnDef[]>([
    { key: "employeeCode", header: "Mã NV", visible: true, sortable: true },
    { key: "fullName", header: "Họ Tên", visible: true, sortable: true },
    { key: "email", header: "Email", visible: true },
    { key: "phone", header: "SĐT", visible: true },
    { key: "departmentName", header: "Phòng Ban", visible: true },
    { key: "positionName", header: "Chức Vụ", visible: true },
    { key: "startDate", header: "Ngày Bắt Đầu", visible: true },
    { key: "contractType", header: "Loại Hợp Đồng", visible: true },
    { key: "baseSalary", header: "Lương Tối Thiểu", visible: true },
    { key: "gender", header: "Giới Tính", visible: false },
    { key: "dateOfBirth", header: "Ngày Sinh", visible: false },
    { key: "idNumber", header: "CMND/CCCD", visible: false },
    { key: "address", header: "Địa Chỉ", visible: false },
  ])
  useEffect(() => {
    api.get<ReportEmployee[]>("/reports/employees")
      .then(setEmployees)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  const toggleColumn = (key: string) => {
    setColumnDefs(prev => prev.map(col => col.key === key ? { ...col, visible: !col.visible } : col))
  }
  const visibleColumns = columnDefs.filter(col => col.visible).map(col => ({
    key: col.key,
    header: col.header,
    sortable: col.sortable,
    render: col.key === "startDate" ? (e: ReportEmployee) => formatDate(e.startDate) :
      col.key === "baseSalary" ? (e: ReportEmployee) => e.baseSalary ? formatCurrency(e.baseSalary) : "-" :
        col.key === "dateOfBirth" ? undefined : undefined
  }))
  const exportToCSV = () => {
    const visibleCols = columnDefs.filter(col => col.visible)
    const headers = visibleCols.map(col => col.header).join(",")
    const rows = employees.map(emp =>
      visibleCols.map(col => {
        const value = emp[col.key as keyof ReportEmployee]
        if (col.key === "startDate" || col.key === "dateOfBirth") return formatDate(value as string)
        if (col.key === "baseSalary") return value || ""
        return value || ""
      }).join(",")
    ).join("\n")
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `employee_report_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Báo Cáo</h1>
              <p className={`mt-1 ${isDark ? "text-white" : "text-black"}`}>Báo Cáo Nhân Viên Chi Tiết</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCustomizeOpen(true)}><Filter className="w-4 h-4" /> Tùy Chỉnh Cột</Button>
              <Button variant="dark" onClick={exportToCSV}><Download className="w-4 h-4" /> Xuất Báo Cáo</Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Danh Sách Nhân Viên Chi Tiết ({columnDefs.filter(c => c.visible).length} Cột)</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={visibleColumns}
                data={employees}
                totalItems={employees.length}
                loading={loading}
                emptyMessage="Không Có Dữ Liệu Nhân Viên"
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Modal isOpen={customizeOpen} onClose={() => setCustomizeOpen(false)} title="Tùy Chỉnh Cột" size="sm">
        <div className="space-y-2">
          <p className={`text-sm mb-4 ${isDark ? "text-white/70" : "text-black/70"}`}>Chọn Cột Để Hiển Thị Trong Báo Cáo:</p>
          {columnDefs.map(col => (
            <button
              key={col.key}
              onClick={() => toggleColumn(col.key)}
              className={`w-full flex items-center justify-between p-3 rounded border transition-colors cursor-pointer ${col.visible ? isDark ? "bg-green-900/30 border-green-500/50" : "bg-green-100 border-green-500" : isDark ? "bg-transparent border-white/20 hover:bg-white/5" : "bg-transparent border-black/20 hover:bg-black/5"}`}
            >
              <span className={isDark ? "text-white" : "text-black"}>{col.header}</span>
              {col.visible && <Check className="w-4 h-4 text-green-500" />}
            </button>
          ))}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setCustomizeOpen(false)}>Đóng</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}