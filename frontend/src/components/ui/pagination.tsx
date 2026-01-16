"use client"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useTheme } from "@/lib/themeContext"
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { isDark } = useTheme()
  if (totalPages <= 1) return null
  return (
    <div className="mt-6 flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"}`}
        aria-label="Trang Đầu"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"}`}
        aria-label="Trang Trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {currentPage > 2 && (
        <span className={`px-2 ${isDark ? "text-white" : "text-black"}`}>...</span>
      )}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className={`px-4 py-2 font-medium transition-colors border rounded cursor-pointer bg-transparent ${isDark ? "text-white border-white hover:bg-white hover:text-black" : "text-black border-black hover:bg-black hover:text-white"}`}
        >
          {currentPage - 1}
        </button>
      )}
      <button
        className={`px-4 py-2 font-medium transition-colors border rounded cursor-pointer ${isDark ? "bg-white text-black border-white" : "bg-black text-white border-black"}`}
      >
        {currentPage}
      </button>
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-4 py-2 font-medium transition-colors border rounded cursor-pointer bg-transparent ${isDark ? "text-white border-white hover:bg-white hover:text-black" : "text-black border-black hover:bg-black hover:text-white"}`}
        >
          {currentPage + 1}
        </button>
      )}
      {currentPage < totalPages - 1 && (
        <span className={`px-2 ${isDark ? "text-white" : "text-black"}`}>...</span>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"}`}
        aria-label="Trang Sau"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"}`}
        aria-label="Trang Cuối"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  )
}