"use client"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/charts/statsCard"
import { BarChart, DoughnutChart, LineChart } from "@/components/charts/charts"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/authContext"
import { useTheme } from "@/lib/themeContext"
import { api, formatDate } from "@/lib/api"
import { Users, Building2, Calendar, FileText, TrendingUp, Award, Clock, Briefcase, MapPin, Activity, Target, Zap } from "lucide-react"
import { useEffect, useState } from "react"
interface DashboardData {
  totalEmployees: number
  totalDepartments: number
  pendingLeaves: number
  activeContracts: number
  departmentStats: { name: string; employeeCount: number; avgSalary: number }[]
  recentLeaves: { id: number; fullName: string; leaveType: string; startDate: string; endDate: string; status: string }[]
  monthlyHires: number[]
  monthlyResigns: number[]
  performanceData: number[]
  topPerformers: { name: string; department: string; score: number }[]
  officeLocations: { city: string; employees: number; status: string }[]
  upcomingEvents: { title: string; date: string; type: string }[]
  recentHires: { name: string; position: string; date: string }[]
  recentActivities: { action: string; user: string; time: string }[]
  skillsDistribution: { skill: string; count: number }[]
}
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { isDark } = useTheme()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!authLoading && user) {
      api.get<DashboardData>("/dashboard/stats")
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user, authLoading])
  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
  const months = ["Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"]
  return (
    <div style={{ backgroundColor: isDark ? "#052e16" : "#ffffff", minHeight: "100vh" }}>
      <Navbar />
      <main className="pt-16 px-4 pb-6">
        <div className="w-full space-y-5">
          <div>
            <h1 className={`text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}>Bảng Điều Khiển</h1>
            <p className={`text-xs ${isDark ? "text-white/70" : "text-black/70"}`}>Chào Mừng Trở Lại, {user.fullName || user.username}</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => <div key={i} className={`h-24 rounded animate-pulse border ${isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"}`} />)}
            </div>
          ) : data && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatsCard title="Tổng Số Nhân Viên" value={data.totalEmployees} icon={<Users className="w-4 h-4" />} trend={{ value: 12, isPositive: true }} color="green" />
                <StatsCard title="Phòng Ban" value={data.totalDepartments} icon={<Building2 className="w-4 h-4" />} color="teal" />
                <StatsCard title="Nghỉ Phép Chờ Duyệt" value={data.pendingLeaves} icon={<Calendar className="w-4 h-4" />} color="violet" />
                <StatsCard title="Hợp Đồng Hiệu Lực" value={data.activeContracts} icon={<FileText className="w-4 h-4" />} color="indigo" />
                <StatsCard title="Hiệu Suất TB" value={`${Math.round(data.performanceData.reduce((a, b) => a + b, 0) / (data.performanceData.filter(x => x > 0).length || 1))}%`} icon={<TrendingUp className="w-4 h-4" />} trend={{ value: 5, isPositive: true }} color="cyan" />
                <StatsCard title="Vị Trí Tuyển Dụng" value="3" icon={<Briefcase className="w-4 h-4" />} color="purple" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatsCard title="Giờ Đào Tạo" value="156" icon={<Clock className="w-4 h-4" />} color="blue" />
                <StatsCard title="Giải Thưởng" value="24" icon={<Award className="w-4 h-4" />} trend={{ value: 8, isPositive: true }} color="green" />
                <StatsCard title="Văn Phòng" value={data.officeLocations.length} icon={<MapPin className="w-4 h-4" />} color="teal" />
                <StatsCard title="Dự Án Đang Chạy" value="18" icon={<Activity className="w-4 h-4" />} color="violet" />
                <StatsCard title="Mục Tiêu Đạt" value="92%" icon={<Target className="w-4 h-4" />} trend={{ value: 3, isPositive: true }} color="indigo" />
                <StatsCard title="Năng Suất" value="94%" icon={<Zap className="w-4 h-4" />} trend={{ value: 7, isPositive: true }} color="cyan" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader><CardTitle>Xu Hướng Tăng Trưởng Nhân Viên</CardTitle></CardHeader>
                  <CardContent><LineChart labels={months} data={data.monthlyHires} label="Nhân Viên Mới" /></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Phân Bố Phòng Ban</CardTitle></CardHeader>
                  <CardContent><DoughnutChart labels={data.departmentStats.map(d => d.name)} data={data.departmentStats.map(d => d.employeeCount)} /></CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Nhân Viên Theo Phòng Ban</CardTitle></CardHeader>
                  <CardContent><BarChart labels={data.departmentStats.map(d => d.name)} data={data.departmentStats.map(d => d.employeeCount)} label="Số Lượng" /></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Điểm Hiệu Suất Hàng Tháng</CardTitle></CardHeader>
                  <CardContent><LineChart labels={months} data={data.performanceData} label="Điểm" /></CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Lương Trung Bình Theo Phòng Ban</CardTitle></CardHeader>
                  <CardContent><BarChart labels={data.departmentStats.map(d => d.name)} data={data.departmentStats.map(d => d.avgSalary)} label="Lương ($)" /></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Xu Hướng Tuyển Dụng vs Thôi Việc</CardTitle></CardHeader>
                  <CardContent><BarChart labels={months} data={data.monthlyHires} label="Tuyển Dụng" /></CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle>Nhân Viên Xuất Sắc</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.topPerformers.length > 0 ? data.topPerformers.map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${i === 0 ? "bg-yellow-500/20 text-yellow-500" : i === 1 ? "bg-slate-400/20 text-slate-400" : i === 2 ? "bg-orange-500/20 text-orange-500" : isDark ? "bg-white/10 text-white/70" : "bg-black/10 text-black/70"}`}>{i + 1}</span>
                            <div>
                              <p className={`text-xs font-medium ${isDark ? "text-white" : "text-black"}`}>{p.name}</p>
                              <p className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>{p.department}</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-green-500">{p.score}%</span>
                        </div>
                      )) : <p className={`text-center text-xs py-4 ${isDark ? "text-white/50" : "text-black/50"}`}>Không Có Dữ Liệu</p>}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Vị Trí Văn Phòng</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.officeLocations.length > 0 ? data.officeLocations.map((loc, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${isDark ? "text-white/60" : "text-black/60"}`} />
                            <div>
                              <p className={`text-xs font-medium ${isDark ? "text-white" : "text-black"}`}>{loc.city}</p>
                              <p className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>{loc.employees} Nhân Viên</p>
                            </div>
                          </div>
                          <Badge variant={loc.status === "new" ? "info" : "success"}>{loc.status}</Badge>
                        </div>
                      )) : <p className={`text-center text-xs py-4 ${isDark ? "text-white/50" : "text-black/50"}`}>Không Có Dữ Liệu</p>}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Phân Bố Kỹ Năng</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.skillsDistribution.length > 0 ? data.skillsDistribution.map((s, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs ${isDark ? "text-white" : "text-black"}`}>{s.skill}</span>
                            <span className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>{s.count}</span>
                          </div>
                          <div className={`h-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                            <div className="h-full bg-green-950 rounded-full" style={{ width: `${(s.count / 50) * 100}%` }} />
                          </div>
                        </div>
                      )) : <p className={`text-center text-xs py-4 ${isDark ? "text-white/50" : "text-black/50"}`}>Không Có Dữ Liệu</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader><CardTitle>Yêu Cầu Nghỉ Phép Gần Đây</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className={`border-b ${isDark ? "border-white/10" : "border-black/10"}`}><th className={`text-left py-2 px-3 text-xs font-medium ${isDark ? "text-white/60" : "text-black/60"}`}>Nhân Viên</th><th className={`text-left py-2 px-3 text-xs font-medium ${isDark ? "text-white/60" : "text-black/60"}`}>Loại</th><th className={`text-left py-2 px-3 text-xs font-medium ${isDark ? "text-white/60" : "text-black/60"}`}>Thời Gian</th><th className={`text-left py-2 px-3 text-xs font-medium ${isDark ? "text-white/60" : "text-black/60"}`}>Trạng Thái</th></tr></thead>
                        <tbody>
                          {data.recentLeaves.map((leave) => (
                            <tr key={leave.id} className={`border-b transition-colors ${isDark ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-black/5"}`}>
                              <td className={`py-2 px-3 text-xs ${isDark ? "text-white" : "text-black"}`}>{leave.fullName}</td>
                              <td className={`py-2 px-3 text-xs ${isDark ? "text-white/70" : "text-black/70"}`}>{leave.leaveType}</td>
                              <td className={`py-2 px-3 text-xs ${isDark ? "text-white/70" : "text-black/70"}`}>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                              <td className="py-2 px-3"><Badge variant={leave.status === "Đã Duyệt" ? "success" : leave.status === "Chờ Duyệt" ? "warning" : "danger"}>{leave.status}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Sự Kiện Sắp Tới</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.upcomingEvents.length > 0 ? data.upcomingEvents.map((e, i) => (
                        <div key={i} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? "border-white/10" : "border-black/10"}`}>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? "text-white" : "text-black"}`}>{e.title}</p>
                            <p className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>{formatDate(e.date)}</p>
                          </div>
                          <Badge variant={e.type === "Cuộc Họp" ? "info" : e.type === "Đánh Giá" ? "warning" : e.type === "Đào Tạo" ? "success" : "default"}>{e.type}</Badge>
                        </div>
                      )) : <p className={`text-center text-xs py-4 ${isDark ? "text-white/50" : "text-black/50"}`}>Không Có Sự Kiện Sắp Tới</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Tuyển Dụng Gần Đây</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className={`border-b ${isDark ? "border-white/10" : "border-black/10"}`}><th className={`text-left py-2 px-3 text-xs font-medium ${isDark ? "text-white/60" : "text-black/60"}`}>Tên</th><th className={`text-left py-2 px-3 text-xs font-medium ${isDark ? "text-white/60" : "text-black/60"}`}>Vị Trí</th><th className={`text-left py-2 px-3 text-xs font-medium ${isDark ? "text-white/60" : "text-black/60"}`}>Ngày Bắt Đầu</th></tr></thead>
                        <tbody>
                          {data.recentHires.map((hire, i) => (
                            <tr key={i} className={`border-b transition-colors ${isDark ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-black/5"}`}>
                              <td className={`py-2 px-3 text-xs ${isDark ? "text-white" : "text-black"}`}>{hire.name}</td>
                              <td className={`py-2 px-3 text-xs ${isDark ? "text-white/70" : "text-black/70"}`}>{hire.position}</td>
                              <td className={`py-2 px-3 text-xs ${isDark ? "text-white/70" : "text-black/70"}`}>{formatDate(hire.date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Hoạt Động Gần Đây</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.recentActivities.map((a, i) => (
                        <div key={i} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? "border-white/10" : "border-black/10"}`}>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? "text-white" : "text-black"}`}>{a.action}</p>
                            <p className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>{a.user}</p>
                          </div>
                          <span className={`text-xs ${isDark ? "text-white/50" : "text-black/50"}`}>{formatDate(a.time)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}