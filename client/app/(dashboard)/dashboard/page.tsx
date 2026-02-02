'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { DashboardStats, ChartData, ApiResponse } from '@/lib/types';
import { Users, Building2, Clock, CalendarDays, UserCheck, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
const COLORS = ['#052e16', '#166534', '#15803d', '#22c55e', '#4ade80', '#86efac'];
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deptData, setDeptData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [attendanceData, setAttendanceData] = useState<ChartData[]>([]);
  const [hiringData, setHiringData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, deptRes, statusRes, attendanceRes, hiringRes] = await Promise.all([
          api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
          api.get<ApiResponse<ChartData[]>>('/dashboard/employeesByDepartment'),
          api.get<ApiResponse<ChartData[]>>('/dashboard/employeeStatus'),
          api.get<ApiResponse<ChartData[]>>('/dashboard/monthlyAttendance'),
          api.get<ApiResponse<ChartData[]>>('/dashboard/hiringTrends')
        ]);
        setStats(statsRes.data || null);
        setDeptData(deptRes.data || []);
        setStatusData(statusRes.data || []);
        setAttendanceData(attendanceRes.data || []);
        setHiringData(hiringRes.data || []);
      } catch (error) {
        console.error('Lỗi Tải Dữ Liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return (
      <>
        <Header title="Bảng Điều Khiển" />
        <div className="p-6">
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div>
          </div>
        </div>
      </>
    );
  }
  const statusLabels: Record<string, string> = { active: 'Đang Làm Việc', probation: 'Thử Việc', terminated: 'Đã Nghỉ Việc', resigned: 'Đã Nghỉ' };
  return (
    <>
      <Header title="Bảng Điều Khiển" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Tổng Nhân Viên</span>
              <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center"><Users size={20} className="text-green-800" /></div>
            </div>
            <div className="text-2xl text-gray-900">{stats?.totalEmployees || 0}</div>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Đang Làm Việc</span>
              <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center"><UserCheck size={20} className="text-green-800" /></div>
            </div>
            <div className="text-2xl text-gray-900">{stats?.activeEmployees || 0}</div>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Thử Việc</span>
              <div className="w-10 h-10 rounded bg-yellow-100 flex items-center justify-center"><AlertCircle size={20} className="text-yellow-500" /></div>
            </div>
            <div className="text-2xl text-gray-900">{stats?.probationEmployees || 0}</div>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Phòng Ban</span>
              <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center"><Building2 size={20} className="text-blue-500" /></div>
            </div>
            <div className="text-2xl text-gray-900">{stats?.totalDepartments || 0}</div>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Chấm Công Hôm Nay</span>
              <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center"><Clock size={20} className="text-green-800" /></div>
            </div>
            <div className="text-2xl text-gray-900">{stats?.todayAttendance || 0}</div>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Đơn Chờ Duyệt</span>
              <div className="w-10 h-10 rounded bg-yellow-100 flex items-center justify-center"><CalendarDays size={20} className="text-yellow-500" /></div>
            </div>
            <div className="text-2xl text-gray-900">{stats?.pendingLeaves || 0}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg text-gray-900 mb-4">Nhân Viên Theo Phòng Ban</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#052e16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg text-gray-900 mb-4">Trạng Thái Nhân Viên</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData.map(s => ({ ...s, name: statusLabels[s.status || ''] || s.status }))} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} outerRadius={80} dataKey="count">
                    {statusData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg text-gray-900 mb-4">Chấm Công Theo Tháng</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#052e16" strokeWidth={2} name="Số Lượt" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg text-gray-900 mb-4">Tuyển Dụng Theo Tháng</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hiringData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#052e16" radius={[4, 4, 0, 0]} name="Nhân Viên Mới" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}