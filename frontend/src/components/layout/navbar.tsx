"use client"
import { Building2, ChevronDown, LogOut, Menu, X, Sun, Moon, User } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "@/lib/themeContext"
import { useAuth } from "@/lib/authContext"
import Link from "next/link"
const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "Personnel", children: [
      { label: "Employees", href: "/employees" },
      { label: "Org Chart", href: "/orgChart" },
      { label: "Degrees", href: "/degrees" },
      { label: "Family", href: "/family" },
      { label: "Contracts", href: "/contracts" },
      { label: "Documents", href: "/documents" },
      { label: "Health", href: "/health" },
    ]
  },
  {
    label: "Decisions", children: [
      { label: "Rewards", href: "/rewards" },
      { label: "Discipline", href: "/discipline" },
      { label: "Salary Adjust", href: "/salaryAdjust" },
      { label: "Appointments", href: "/appointments" },
      { label: "Transfers", href: "/transfers" },
      { label: "Terminations", href: "/terminations" },
    ]
  },
  {
    label: "Leave", children: [
      { label: "Leave Requests", href: "/leaveRequests" },
      { label: "Work Schedule", href: "/workSchedule" },
      { label: "Visits", href: "/visits" },
      { label: "Foreign Exit", href: "/foreignExit" },
    ]
  },
  { label: "Recruitment", href: "/recruitment" },
  { label: "Training", href: "/training" },
  { label: "Salary", href: "/salary" },
  { label: "KPI", href: "/kpi" },
  { label: "Reports", href: "/reports" },
  {
    label: "System", children: [
      { label: "Catalog", href: "/catalog" },
      { label: "Permissions", href: "/permissions" },
      { label: "Config", href: "/config" },
      { label: "Safety", href: "/safety" },
      { label: "Social Insurance", href: "/socialInsurance" },
    ]
  },
]
export function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  if (!user) return null
  const isActive = (href?: string, children?: { href: string }[]) => {
    if (href) return pathname === href
    if (children) return children.some(c => pathname === c.href)
    return false
  }
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-14 border-b transition-all duration-200 ${scrolled ? "backdrop-blur-sm shadow-sm" : ""}`} style={{ backgroundColor: isDark ? (scrolled ? "rgba(10, 15, 26, 0.95)" : "#0a0f1a") : (scrolled ? "rgba(255, 255, 255, 0.95)" : "#ffffff"), borderColor: isDark ? "#334155" : "#e2e8f0" }}>
      <div className="w-full px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Building2 className={`w-5 h-5 ${isDark ? "text-white" : "text-green-950"}`} />
            <span className={`font-semibold text-sm hidden sm:block ${isDark ? "text-white" : "text-black"}`}>HRMS</span>
          </Link>
          <div className="hidden lg:flex items-center gap-0.5" ref={dropdownRef}>
            {menuItems.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <button onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded cursor-pointer transition-all border ${isActive(undefined, item.children) ? "bg-green-950 text-white border-green-950" : isDark ? "text-white border-transparent hover:border-green-950 hover:text-green-950 hover:bg-white" : "text-black border-transparent hover:border-green-950 hover:text-green-950"}`}>
                    {item.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link href={item.href!} className={`px-2.5 py-1.5 text-xs rounded transition-all border ${isActive(item.href) ? "bg-green-950 text-white border-green-950" : isDark ? "text-white border-transparent hover:border-green-950 hover:text-green-950 hover:bg-white" : "text-black border-transparent hover:border-green-950 hover:text-green-950"}`}>
                    {item.label}
                  </Link>
                )}
                {item.children && openDropdown === item.label && (
                  <div className={`absolute top-full left-0 mt-1 w-44 py-1 border rounded shadow-lg ${isDark ? "bg-black border-black" : "bg-white border-black"}`}>
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} onClick={() => setOpenDropdown(null)} className={`block px-3 py-1.5 text-xs transition-colors ${pathname === child.href ? "bg-green-950 text-white" : isDark ? "text-white hover:text-green-950 hover:bg-white" : "text-black hover:text-green-950 hover:bg-green-950/10"}`}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={`p-1.5 rounded border cursor-pointer transition-colors ${isDark ? "border-white text-white" : "border-black text-green-950"}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded border ${isDark ? "border-white" : "border-black"}`}>
              <User className={`w-4 h-4 ${isDark ? "text-white" : "text-green-950"}`} />
              <span className={`text-xs ${isDark ? "text-white" : "text-black"}`}>{user.fullName || user.username}</span>
            </div>
            <button onClick={logout} className={`p-1.5 rounded border transition-colors cursor-pointer ${isDark ? "border-white text-red-400" : "border-black text-red-500 hover:text-red-400"}`}>
              <LogOut className="w-4 h-4" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-1.5 rounded border cursor-pointer ${isDark ? "border-black text-white" : "border-black text-black"}`}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className={`lg:hidden border-t max-h-[70vh] overflow-y-auto ${isDark ? "bg-black border-black" : "bg-white border-black"}`}>
          <div className="px-4 py-3 space-y-0.5">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)} className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded cursor-pointer border ${isActive(undefined, item.children) ? "bg-green-950 text-white border-green-950" : isDark ? "text-white border-transparent" : "text-black border-transparent"}`}>
                      {item.label}
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === item.label && (
                      <div className="pl-3 mt-0.5 space-y-0.5">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className={`block px-2.5 py-1.5 text-xs rounded ${pathname === child.href ? "bg-green-950 text-white" : isDark ? "text-white hover:text-green-950" : "text-black hover:text-green-950"}`}>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href!} onClick={() => setMobileOpen(false)} className={`block px-2.5 py-1.5 text-xs rounded border ${isActive(item.href) ? "bg-green-950 text-white border-green-950" : isDark ? "text-white border-transparent" : "text-black border-transparent"}`}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}