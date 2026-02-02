'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Contract, ApiResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Download, FileText, Edit, X, Search, Eye, Trash2 } from 'lucide-react';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor').then(m => m.RichTextEditor), { ssr: false });
export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<{ id: string; fullName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({ contractNumber: '', employeeId: '', contractType: 'definite', startDate: '', endDate: '', grossSalary: '', salaryType: 'gross', workingHoursPerDay: '8', workingDaysPerWeek: '5', content: '' });
  const [search, setSearch] = useState('');
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await api.get<ApiResponse<Contract[]>>(`/contracts?${params}`);
      setContracts(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Lỗi Tải Hợp Đồng:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchEmployees = async () => {
    try {
      const res = await api.get<ApiResponse<{ id: string; fullName: string }[]>>('/employees?limit=100');
      setEmployees((res.data || []).map(e => ({ id: e.id, fullName: e.fullName })));
    } catch (error) {
      console.error('Lỗi Tải Nhân Viên:', error);
    }
  };
  useEffect(() => { fetchData(); fetchEmployees(); }, [page, statusFilter, search]);
  const openModal = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({ contractNumber: contract.contractNumber, employeeId: contract.employeeId, contractType: contract.contractType, startDate: contract.startDate, endDate: contract.endDate || '', grossSalary: String(contract.grossSalary), salaryType: contract.salaryType, workingHoursPerDay: String(contract.workingHoursPerDay), workingDaysPerWeek: String(contract.workingDaysPerWeek), content: contract.content });
    } else {
      setEditingContract(null);
      setFormData({ contractNumber: '', employeeId: '', contractType: 'definite', startDate: '', endDate: '', grossSalary: '', salaryType: 'gross', workingHoursPerDay: '8', workingDaysPerWeek: '5', content: '' });
    }
    setShowModal(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, grossSalary: parseFloat(formData.grossSalary), workingHoursPerDay: parseInt(formData.workingHoursPerDay), workingDaysPerWeek: parseInt(formData.workingDaysPerWeek) };
      if (editingContract) { await api.put(`/contracts/${editingContract.id}`, data); }
      else { await api.post('/contracts', data); }
      setShowModal(false);
      fetchData();
    } catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleActivate = async (id: string) => {
    if (confirm('Xác Nhận Kích Hoạt Hợp Đồng?')) {
      try { await api.put(`/contracts/${id}/activate`, {}); fetchData(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  const handleExportTxt = (contract: Contract) => {
    const stripHtml = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    };

    const content = `THÔNG TIN HỢP ĐỒNG
===================
Số Hợp Đồng: ${contract.contractNumber}
Nhân Viên: ${contract.employeeName}
Loại Hợp Đồng: ${typeLabels[contract.contractType]}
Trạng Thái: ${statusLabels[contract.status]}

CHI TIẾT
--------
Ngày Bắt Đầu: ${contract.startDate}
Ngày Kết Thúc: ${contract.endDate || 'Không Có'}
Mức Lương (Gross): ${contract.grossSalary?.toLocaleString('vi-VN')} ₫
Thời Gian Làm Việc: ${contract.workingHoursPerDay} Giờ/Ngày, ${contract.workingDaysPerWeek} Ngày/Tuần

NỘI DUNG HỢP ĐỒNG
-----------------
${stripHtml(contract.content || '')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HopDong_${contract.contractNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDelete = async (id: string) => {
    if (confirm('Xác Nhận Xóa Hợp Đồng Này?')) {
      try { await api.delete(`/contracts/${id}`); fetchData(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  const handleExport = async () => { try { await api.download('/contracts/export', 'hopDong.xlsx'); } catch (e) { alert(e instanceof Error ? e.message : 'Lỗi'); } };
  const typeLabels: Record<string, string> = { probation: 'Thử Việc', definite: 'Xác Định', indefinite: 'Không Xác Định' };
  const statusLabels: Record<string, string> = { draft: 'Nháp', active: 'Hiệu Lực', expired: 'Hết Hạn', terminated: 'Đã Hủy' };
  const statusBadgeClass: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', active: 'bg-green-100 text-green-800', expired: 'bg-yellow-100 text-gray-800', terminated: 'bg-red-100 text-red-500' };
  return (
    <>
      <Header title="Hợp Đồng" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">Danh Sách Hợp Đồng</h2>
          <div className="flex gap-2">
            {user?.role === 'hrro' && <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={handleExport}><Download size={16} /> Xuất Excel</button>}
            {user?.role === 'hrro' && <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" onClick={() => openModal()}><Plus size={16} /> Thêm Mới</button>}
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" placeholder="Tìm Kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700 min-w-[150px]" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}><option value="">Tất Cả Trạng Thái</option><option value="draft">Nháp</option><option value="active">Hiệu Lực</option><option value="expired">Hết Hạn</option></select>
          </div>
          {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Số HĐ</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Nhân Viên</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Loại</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Bắt Đầu</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Kết Thúc</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Lương</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Trạng Thái</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Thao Tác</th></tr></thead>
                <tbody>
                  {contracts.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b border-gray-200">{c.contractNumber}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{c.employeeName}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{typeLabels[c.contractType]}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{c.startDate}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{c.endDate || '-'}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{c.grossSalary?.toLocaleString('vi-VN')} ₫</td>
                      <td className="px-4 py-3 border-b border-gray-200"><span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[c.status]}`}>{statusLabels[c.status]}</span></td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex gap-1">
                          <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewContract(c)} title="Xem"><Eye size={16} /></button>
                          <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => handleExportTxt(c)} title="Xuất File"><FileText size={16} /></button>
                          {user?.role === 'hrro' && c.status === 'draft' && (<><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => openModal(c)}><Edit size={16} /></button><button className="px-3 py-1 text-xs inline-flex items-center gap-2 rounded cursor-pointer bg-green-950 text-white hover:bg-green-900" onClick={() => handleActivate(c.id)}>Kích Hoạt</button></>)}
                          {user?.role === 'hrro' && (<button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-red-50 text-red-500" onClick={() => handleDelete(c.id)} title="Xóa"><Trash2 size={16} /></button>)}
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
          <div className="bg-white rounded shadow-lg max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">{editingContract ? 'Cập Nhật Hợp Đồng' : 'Tạo Hợp Đồng'}</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-700 mb-1">Số Hợp Đồng</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.contractNumber} onChange={e => setFormData({ ...formData, contractNumber: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Nhân Viên</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} required><option value="">Chọn Nhân Viên</option>{employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}</select></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Loại Hợp Đồng</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.contractType} onChange={e => setFormData({ ...formData, contractType: e.target.value })}><option value="probation">Thử Việc</option><option value="definite">Xác Định Thời Hạn</option><option value="indefinite">Không Xác Định</option></select></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Lương Gross (VNĐ)</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="number" value={formData.grossSalary} onChange={e => setFormData({ ...formData, grossSalary: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Ngày Bắt Đầu</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Ngày Kết Thúc</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Giờ Làm/Ngày</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="number" value={formData.workingHoursPerDay} onChange={e => setFormData({ ...formData, workingHoursPerDay: e.target.value })} /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Ngày Làm/Tuần</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="number" value={formData.workingDaysPerWeek} onChange={e => setFormData({ ...formData, workingDaysPerWeek: e.target.value })} /></div>
                </div>
                <div className="mt-4"><label className="block text-sm text-gray-700 mb-1">Nội Dung Hợp Đồng <span className="text-red-500">*</span></label><RichTextEditor content={formData.content} onChange={(html) => setFormData({ ...formData, content: html })} placeholder="Nội Dung Chi Tiết Hợp Đồng..." /></div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button type="button" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950">{editingContract ? 'Cập Nhật' : 'Tạo Mới'}</button></div>
            </form>
          </div>
        </div>
      )}
      {viewContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewContract(null)}>
          <div className="bg-white rounded shadow-lg max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">Chi Tiết Hợp Đồng</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewContract(null)}><X size={20} /></button></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded bg-blue-100 flex items-center justify-center text-blue-800"><FileText size={32} /></div>
                <div><div className="text-xl font-medium">{viewContract.contractNumber}</div><div className="text-sm text-gray-500">{viewContract.employeeName}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Loại HĐ:</span> {typeLabels[viewContract.contractType]}</div>
                <div><span className="text-gray-500">Trạng Thái:</span> <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[viewContract.status]}`}>{statusLabels[viewContract.status]}</span></div>
                <div><span className="text-gray-500">Ngày Bắt Đầu:</span> {viewContract.startDate}</div>
                <div><span className="text-gray-500">Ngày Kết Thúc:</span> {viewContract.endDate || '-'}</div>
                <div><span className="text-gray-500">Lương Gross:</span> {viewContract.grossSalary?.toLocaleString('vi-VN')} ₫</div>
                <div><span className="text-gray-500">Giờ Làm/Ngày:</span> {viewContract.workingHoursPerDay}h</div>
                {viewContract.content && <div className="col-span-2"><span className="text-gray-500">Nội Dung:</span><div className="mt-1 p-3 bg-gray-50 rounded text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: viewContract.content }}></div></div>}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setViewContract(null)}>Đóng</button></div>
          </div>
        </div>
      )}
    </>
  );
}