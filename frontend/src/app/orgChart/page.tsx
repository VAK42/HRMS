"use client"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useTheme } from "@/lib/themeContext"
import { User, ChevronDown, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Tree, TreeNode as OrgTreeNode } from "react-organizational-chart"
interface Employee {
  id: number
  fullName: string
  employeeCode: string
  position: string
  department: string
  managerId: number | null
}
interface TreeNode extends Employee {
  children: TreeNode[]
  expanded?: boolean
}
export default function OrgChartPage() {
  const { isDark } = useTheme()
  const [tree, setTree] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([1]))
  useEffect(() => {
    const fetchData = async () => {
      try {
        const employees = await api.get<Employee[]>("/orgChart")
        const buildTree = (parentId: number | null): TreeNode[] => {
          return employees
            .filter(e => e.managerId === parentId)
            .map(e => ({ ...e, children: buildTree(e.id) }))
        }
        setTree(buildTree(null))
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const OrgNode = ({ node }: { node: TreeNode }) => (
    <div className={`inline-block px-4 py-3 rounded border text-center min-w-[140px] ${isDark ? "bg-transparent border-white" : "bg-white border-black"}`}>
      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${isDark ? "bg-white/10 border border-white/30" : "bg-black/10 border border-black/30"}`}>
        <User className={`w-5 h-5 ${isDark ? "text-white" : "text-black"}`} />
      </div>
      <div className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-black"}`}>{node.fullName}</div>
      <div className={`text-xs truncate ${isDark ? "text-white/60" : "text-black/60"}`}>{node.position}</div>
      <div className={`text-xs truncate ${isDark ? "text-white/40" : "text-black/40"}`}>{node.department}</div>
    </div>
  )
  const renderOrgTree = (node: TreeNode): React.ReactNode => {
    if (node.children.length === 0) {
      return <OrgTreeNode label={<OrgNode node={node} />} key={node.id} />
    }
    return (
      <OrgTreeNode label={<OrgNode node={node} />} key={node.id}>
        {node.children.map(child => renderOrgTree(child))}
      </OrgTreeNode>
    )
  }
  const EmployeeNode = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedIds.has(node.id)
    return (
      <div className="relative">
        {level > 0 && (
          <div className={`absolute left-4 -top-4 w-px h-4 ${isDark ? "bg-white/30" : "bg-black/30"}`} />
        )}
        <div className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${isDark ? "bg-transparent border-white hover:bg-white/10" : "bg-white border-black hover:bg-black/10"}`} onClick={() => hasChildren && toggleExpand(node.id)}>
          {hasChildren ? (
            isExpanded ? <ChevronDown className={`w-4 h-4 ${isDark ? "text-white" : "text-black"}`} /> : <ChevronRight className={`w-4 h-4 ${isDark ? "text-white" : "text-black"}`} />
          ) : (
            <div className="w-4 h-4" />
          )}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 border border-white/30" : "bg-black/10 border border-black/30"}`}>
            <User className={`w-4 h-4 ${isDark ? "text-white" : "text-black"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-black"}`}>{node.fullName}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"}`}>{node.employeeCode}</span>
            </div>
            <div className={`text-xs truncate ${isDark ? "text-white/60" : "text-black/60"}`}>{node.position} • {node.department}</div>
          </div>
          {hasChildren && (
            <span className={`text-xs ${isDark ? "text-white/50" : "text-black/50"}`}>{node.children.length} Cấp Dưới</span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className={`ml-6 mt-2 pl-4 border-l space-y-2 ${isDark ? "border-white/30" : "border-black/30"}`}>
            {node.children.map(child => (
              <EmployeeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }
  return (
    <div style={{ backgroundColor: isDark ? "#0a0f1a" : "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <main className="pt-16 px-4 pb-6">
        <div className="w-full space-y-5">
          <div>
            <h1 className={`text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}>Sơ Đồ Tổ Chức</h1>
            <p className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>Cấu Trúc Nhân Sự</p>
          </div>
          <Card>
            <CardHeader><CardTitle>Sơ Đồ Cây</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`h-14 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                  ))}
                </div>
              ) : tree.length === 0 ? (
                <p className={`text-center py-8 text-xs ${isDark ? "text-white/50" : "text-black/50"}`}>Không Tìm Thấy Nhân Viên</p>
              ) : (
                <div className="overflow-x-auto py-6">
                  <Tree
                    lineWidth="2px"
                    lineColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                    lineBorderRadius="4px"
                    label={<OrgNode node={tree[0]} />}
                  >
                    {tree[0]?.children.map(child => renderOrgTree(child))}
                  </Tree>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Danh Sách Nhân Viên</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-14 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                  ))}
                </div>
              ) : tree.length === 0 ? (
                <p className={`text-center py-8 text-xs ${isDark ? "text-white/50" : "text-black/50"}`}>Không Tìm Thấy Nhân Viên</p>
              ) : (
                <div className="space-y-2">
                  {tree.map(node => (
                    <EmployeeNode key={node.id} node={node} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}