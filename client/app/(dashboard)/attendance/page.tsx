'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Attendance, ApiResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Check, X, Download, LogIn, LogOut as LogOutIcon } from 'lucide-react';
export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (dateFilter) params.append('date', dateFilter);
      if (statusFilter) params.append('approvalStatus', statusFilter);
      const res = await api.get<ApiResponse<Attendance[]>>(`/attendance?${params}`);
      setRecords(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Lỗi Tải Chấm Công:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchToday = async () => {
    try {
      const res = await api.get<ApiResponse<Attendance>>('/attendance/today');
      setTodayRecord(res.data || null);
    } catch (error) {
      console.error('Lỗi Tải Chấm Công Hôm Nay:', error);
    }
  };
  useEffect(() => { fetchRecords(); fetchToday(); }, [page, dateFilter, statusFilter]);
  const handleCheckIn = async () => {
    try { await api.post('/attendance/checkIn', {}); fetchToday(); fetchRecords(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleCheckOut = async () => {
    try { await api.post('/attendance/checkOut', {}); fetchToday(); fetchRecords(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleApprove = async (id: string, status: 'approved' | 'rejected') => {
    try { await api.put(`/attendance/${id}/approve`, { status }); fetchRecords(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleExport = async () => { try { await api.download(`/attendance/export?date=${dateFilter}&approvalStatus=${statusFilter}`, 'chamCong.xlsx'); } catch (e) { alert(e instanceof Error ? e.message : 'Lỗi'); } };
  const formatTime = (time: string | null) => time ? time.substring(0, 5) : '-';
  const statusLabels: Record<string, string> = { pending: 'Chờ Duyệt', approved: 'Đã Duyệt', rejected: 'Từ Chối' };
  const statusBadgeClass: Record<string, string> = { pending: 'bg-yellow-100 text-gray-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-500' };
  return (
    <>
      <Header title="Chấm Công" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Chấm Công Hôm Nay</h3>
              <Clock size={20} className="text-gray-400" />
            </div>
            <div className="flex gap-4 items-center mb-4">
              <div className="flex-1">
                <div className="text-sm text-gray-500">Giờ Vào</div>
                <div className="text-2xl">{todayRecord?.checkIn ? formatTime(todayRecord.checkIn) : '--:--'}</div>
                {todayRecord?.checkInLate ? <div className="text-sm text-red-500">Trễ {todayRecord.checkInLate} Phút</div> : null}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">Giờ Ra</div>
                <div className="text-2xl">{todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : '--:--'}</div>
                {todayRecord?.checkOutEarly ? <div className="text-sm text-red-500">Sớm {todayRecord.checkOutEarly} Phút</div> : null}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-950 disabled:hover:text-white" onClick={handleCheckIn} disabled={!!todayRecord?.checkIn}><LogIn size={16} /> Check In</button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white" onClick={handleCheckOut} disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}><LogOutIcon size={16} /> Check Out</button>
            </div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg mb-4">Thống Kê Hôm Nay</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-sm text-gray-500">Giờ Làm Việc</div><div className="text-xl">{Number(todayRecord?.workingHours || 0).toFixed(1)} Giờ</div></div>
              <div><div className="text-sm text-gray-500">Tăng Ca</div><div className="text-xl">{Number(todayRecord?.overtimeHours || 0).toFixed(1)} Giờ</div></div>
              <div><div className="text-sm text-gray-500">Trạng Thái</div><span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[todayRecord?.approvalStatus || 'pending']}`}>{statusLabels[todayRecord?.approvalStatus || 'pending']}</span></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg">Lịch Sử Chấm Công</h3>
            {(user?.role === 'hrro' || user?.role === 'manager') && (<button className="px-3 py-1 text-xs inline-flex items-center gap-2 rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={handleExport}><Download size={14} /> Xuất Excel</button>)}
          </div>
          <div className="flex gap-3 mb-4">
            <input className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">Tất Cả Trạng Thái</option><option value="pending">Chờ Duyệt</option><option value="approved">Đã Duyệt</option><option value="rejected">Từ Chối</option></select>
          </div>
          {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr>{user?.role !== 'employee' && <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Nhân Viên</th>}<th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Ngày</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Giờ Vào</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Giờ Ra</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Số Giờ</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Trạng Thái</th>{(user?.role === 'hrro' || user?.role === 'manager') && <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Duyệt</th>}</tr></thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      {user?.role !== 'employee' && <td className="px-4 py-3 border-b border-gray-200">{r.employeeName || r.employeeCode}</td>}
                      <td className="px-4 py-3 border-b border-gray-200">{r.date}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{formatTime(r.checkIn)} {r.checkInLate ? <span className="text-sm text-red-500">(+{r.checkInLate}p)</span> : ''}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{formatTime(r.checkOut)} {r.checkOutEarly ? <span className="text-sm text-red-500">(-{r.checkOutEarly}p)</span> : ''}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{r.workingHours?.toFixed(1) || '-'} Giờ</td>
                      <td className="px-4 py-3 border-b border-gray-200"><span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[r.approvalStatus]}`}>{statusLabels[r.approvalStatus]}</span></td>
                      {(user?.role === 'hrro' || user?.role === 'manager') && (<td className="px-4 py-3 border-b border-gray-200">{r.approvalStatus === 'pending' && (<div className="flex gap-1"><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-green-50 text-green-700" onClick={() => handleApprove(r.id, 'approved')} title="Duyệt"><Check size={16} /></button><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-red-50 text-red-500" onClick={() => handleApprove(r.id, 'rejected')} title="Từ Chối"><X size={16} /></button></div>)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs inline-flex items-center gap-2 rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
              <button className="px-3 py-1 text-xs inline-flex items-center gap-2 rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}