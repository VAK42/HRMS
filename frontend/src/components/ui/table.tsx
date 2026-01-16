"use client"
import { ChevronUp, ChevronDown, Search } from "lucide-react"
import { useTheme } from "@/lib/themeContext"
import { ReactNode, useState } from "react"
import { Pagination } from "./pagination"
import { Input } from "./input"
interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => ReactNode
}
interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  totalItems?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onSearch?: (search: string) => void
  searchPlaceholder?: string
  actions?: (item: T) => ReactNode
  loading?: boolean
  emptyMessage?: string
}
export function DataTable<T extends { id: number }>({
  columns, data, totalItems = 0, currentPage = 1, pageSize = 10,
  onPageChange, onSearch, searchPlaceholder = "Tìm Kiếm...",
  actions, loading = false, emptyMessage = "Không Có Dữ Liệu"
}: DataTableProps<T>) {
  const { isDark } = useTheme()
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }
  const handleSearch = (value: string) => {
    setSearch(value)
    onSearch?.(value)
  }
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = (a as Record<string, unknown>)[sortKey]
    const bVal = (b as Record<string, unknown>)[sortKey]
    if (aVal == null) return 1
    if (bVal == null) return -1
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1
    return 0
  })
  const totalPages = Math.ceil(totalItems / pageSize)
  return (
    <div className="space-y-4">
      {onSearch && (
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            <Input
              className="pl-9"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      )}
      <div className={`overflow-x-auto border rounded ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`text-left py-2.5 px-3 text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-500"} ${col.sortable ? "cursor-pointer hover:text-green-500 select-none" : ""}`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === String(col.key) && (
                      sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className={`text-left py-2.5 px-3 text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-500"}`}>Hành Động</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className={`border-b ${isDark ? "border-slate-700/50" : "border-slate-100"}`}>
                  {columns.map((_, j) => <td key={j} className="py-2.5 px-3"><div className={`h-4 rounded animate-pulse ${isDark ? "bg-slate-700" : "bg-slate-100"}`} /></td>)}
                  {actions && <td className="py-2.5 px-3"><div className={`h-4 w-16 rounded animate-pulse ${isDark ? "bg-slate-700" : "bg-slate-100"}`} /></td>}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className={`py-8 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{emptyMessage}</td></tr>
            ) : (
              sortedData.map((item) => (
                <tr key={item.id} className={`border-b transition-colors ${isDark ? "border-slate-700/50 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"}`}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className={`py-2.5 px-3 text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[String(col.key)] ?? "")}
                    </td>
                  ))}
                  {actions && <td className="py-2.5 px-3"><div className="flex items-center gap-1">{actions(item)}</div></td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  )
}