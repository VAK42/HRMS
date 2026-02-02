'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { LeaveRequest, LeaveType, LeaveBalance, ApiResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Download, Check, X, Search, Eye, CalendarDays, Ban, Trash2 } from 'lucide-react';
export default function LeaveRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [search, setSearch] = useState('');
  const [viewRequest, setViewRequest] = useState<LeaveRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const [reqRes, typesRes, balRes] = await Promise.all([
        api.get<ApiResponse<LeaveRequest[]>>(`/leaveRequests?${params}`),
        api.get<ApiResponse<LeaveType[]>>('/leaveRequests/types'),
        api.get<ApiResponse<LeaveBalance[]>>('/leaveRequests/balance')
      ]);
      setRequests(reqRes.data || []);
      setTotalPages(reqRes.pagination?.totalPages || 1);
      setLeaveTypes(typesRes.data || []);
      setBalances(balRes.data || []);
    } catch (error) {
      console.error('Lỗi Tải Đơn Xin Nghỉ:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, [page, statusFilter, search]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/leaveRequests', formData); setShowModal(false); setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' }); fetchData(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleApprove = async (id: string) => {
    try { await api.put(`/leaveRequests/${id}/approve`, { status: 'approved' }); fetchData(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const openRejectModal = (id: string) => { setRejectId(id); setRejectionReason(''); setShowRejectModal(true); };
  const handleReject = async () => {
    try { await api.put(`/leaveRequests/${rejectId}/approve`, { status: 'rejected', rejectionReason }); setShowRejectModal(false); fetchData(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleCancel = async (id: string) => {
    if (confirm('Xác Nhận Hủy Đơn?')) {
      try { await api.put(`/leaveRequests/${id}/cancel`, {}); fetchData(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Xác Nhận Xóa Đơn Này?')) {
      try { await api.delete(`/leaveRequests/${id}`); fetchData(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  const handleExport = async () => { try { await api.download('/leaveRequests/export', 'donXinNghi.xlsx'); } catch (e) { alert(e instanceof Error ? e.message : 'Lỗi'); } };
  const statusLabels: Record<string, string> = { pending: 'Chờ Duyệt', approved: 'Đã Duyệt', rejected: 'Từ Chối', cancelled: 'Đã Hủy' };
  const statusBadgeClass: Record<string, string> = { pending: 'bg-yellow-100 text-gray-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-500', cancelled: 'bg-gray-100 text-gray-600' };
  return (
    <>
      <Header title="Đơn Xin Nghỉ" />
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {balances.map(b => (
            <div key={b.id} className="bg-white rounded shadow p-5">
              <div className="text-sm text-gray-500">{b.leaveTypeName}</div>
              <div className="text-2xl">{b.remainingDays}/{b.totalDays}</div>
              <div className="text-xs text-gray-500">Còn Lại / Tổng</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-gray-900">Danh Sách Đơn</h2>
          <div className="flex gap-2">
            {(user?.role === 'hrro' || user?.role === 'manager') && (<button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={handleExport}><Download size={16} /> Xuất Excel</button>)}
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" onClick={() => setShowModal(true)}><Plus size={16} /> Tạo Đơn</button>
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" placeholder="Tìm Kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700 min-w-[150px]" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}><option value="">Tất Cả Trạng Thái</option><option value="pending">Chờ Duyệt</option><option value="approved">Đã Duyệt</option><option value="rejected">Từ Chối</option><option value="cancelled">Đã Hủy</option></select>
          </div>
          {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr>{user?.role !== 'employee' && <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Nhân Viên</th>}<th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Loại Nghỉ</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Từ Ngày</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Đến Ngày</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Số Ngày</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Lý Do</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Trạng Thái</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Thao Tác</th></tr></thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      {user?.role !== 'employee' && <td className="px-4 py-3 border-b border-gray-200">{r.employeeName}</td>}
                      <td className="px-4 py-3 border-b border-gray-200">{r.leaveTypeName}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{r.startDate}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{r.endDate}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{r.totalDays}</td>
                      <td className="px-4 py-3 border-b border-gray-200 max-w-[200px] truncate">{r.reason}</td>
                      <td className="px-4 py-3 border-b border-gray-200"><span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[r.status]}`}>{statusLabels[r.status]}</span></td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex gap-1">
                          <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewRequest(r)} title="Xem"><Eye size={16} /></button>
                          {r.status === 'pending' && (user?.role === 'hrro' || user?.role === 'manager') && (<><button className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" onClick={() => handleApprove(r.id)} title="Duyệt"><Check size={14} /></button><button className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded cursor-pointer bg-red-500 text-white border border-red-500 hover:bg-white hover:text-red-500" onClick={() => openRejectModal(r.id)} title="Từ Chối"><X size={14} /></button></>)}
                          {r.status === 'pending' && r.employeeId === user?.employeeId && (<button className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => handleCancel(r.id)} title="Hủy"><Ban size={14} /></button>)}
                          {user?.role === 'hrro' && (<button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-red-50 text-red-500" onClick={() => handleDelete(r.id)} title="Xóa"><Trash2 size={16} /></button>)}
                        </div>
                      </td>
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
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded shadow-lg max-w-lg w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">Tạo Đơn Xin Nghỉ</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Loại Nghỉ</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.leaveTypeId} onChange={e => setFormData({ ...formData, leaveTypeId: e.target.value })} required><option value="">Chọn Loại Nghỉ</option>{leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm text-gray-700 mb-1">Từ Ngày</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required /></div><div><label className="block text-sm text-gray-700 mb-1">Đến Ngày</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required /></div></div>
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Lý Do</label><textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" rows={3} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} required></textarea></div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button type="button" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950">Gửi Đơn</button></div>
            </form>
          </div>
        </div>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded shadow-lg max-w-lg w-[90%]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">Từ Chối Đơn</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setShowRejectModal(false)}><X size={20} /></button></div>
            <div className="p-6"><label className="block text-sm text-gray-700 mb-1">Lý Do Từ Chối</label><textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" rows={3} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} required></textarea></div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setShowRejectModal(false)}>Hủy</button><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-red-500 text-white hover:opacity-90" onClick={handleReject}>Từ Chối</button></div>
          </div>
        </div>
      )}
      {viewRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewRequest(null)}>
          <div className="bg-white rounded shadow-lg max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">Chi Tiết Đơn Xin Nghỉ</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewRequest(null)}><X size={20} /></button></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded bg-yellow-100 flex items-center justify-center text-yellow-800"><CalendarDays size={32} /></div>
                <div><div className="text-xl font-medium">{viewRequest.leaveTypeName}</div><div className="text-sm text-gray-500">{viewRequest.employeeName}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Từ Ngày:</span> {viewRequest.startDate}</div>
                <div><span className="text-gray-500">Đến Ngày:</span> {viewRequest.endDate}</div>
                <div><span className="text-gray-500">Số Ngày:</span> {viewRequest.totalDays}</div>
                <div><span className="text-gray-500">Trạng Thái:</span> <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[viewRequest.status]}`}>{statusLabels[viewRequest.status]}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Lý Do:</span> {viewRequest.reason}</div>
                {viewRequest.rejectionReason && <div className="col-span-2"><span className="text-gray-500">Lý Do Từ Chối:</span> {viewRequest.rejectionReason}</div>}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setViewRequest(null)}>Đóng</button></div>
          </div>
        </div>
      )}
    </>
  );
}