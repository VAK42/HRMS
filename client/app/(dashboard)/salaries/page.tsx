'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Salary, ApiResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Download, Calculator, Check, CreditCard, Search, Eye, DollarSign, X } from 'lucide-react';
export default function SalariesPage() {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [search, setSearch] = useState('');
  const [viewSalary, setViewSalary] = useState<Salary | null>(null);
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10', month: String(month), year: String(year) });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await api.get<ApiResponse<Salary[]>>(`/salaries?${params}`);
      setSalaries(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Lỗi Tải Bảng Lương:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, [page, month, year, statusFilter, search]);
  const handleCalculate = async () => {
    if (!confirm(`Tính Lương Tháng ${month}/${year}?`)) return;
    try {
      setCalculating(true);
      const res = await api.post<ApiResponse<null>>('/salaries/calculate', { month, year });
      alert(res.message || 'Thành Công');
      fetchData();
    } catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    finally { setCalculating(false); }
  };
  const handleApprove = async (id: string) => {
    try { await api.put(`/salaries/${id}/approve`, {}); fetchData(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handlePay = async (id: string) => {
    try { await api.put(`/salaries/${id}/pay`, {}); fetchData(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleExport = async () => { try { await api.download(`/salaries/export?month=${month}&year=${year}`, `bangLuong${month}${year}.xlsx`); } catch (e) { alert(e instanceof Error ? e.message : 'Lỗi'); } };
  const formatMoney = (n: number) => n?.toLocaleString('vi-VN') || '0';
  const statusLabels: Record<string, string> = { draft: 'Nháp', approved: 'Đã Duyệt', paid: 'Đã Trả' };
  const statusBadgeClass: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', approved: 'bg-yellow-100 text-gray-800', paid: 'bg-green-100 text-green-800' };
  return (
    <>
      <Header title="Bảng Lương" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">Bảng Lương Tháng {month}/{year}</h2>
          {user?.role === 'hrro' && (
            <div className="flex gap-2">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={handleExport}><Download size={16} /> Xuất Excel</button>
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" onClick={handleCalculate} disabled={calculating}><Calculator size={16} /> {calculating ? 'Đang Tính...' : 'Tính Lương'}</button>
            </div>
          )}
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" placeholder="Tìm Kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={month} onChange={e => { setMonth(parseInt(e.target.value)); setPage(1); }}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}</select>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={year} onChange={e => { setYear(parseInt(e.target.value)); setPage(1); }}>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}><option value="">Tất Cả Trạng Thái</option><option value="draft">Nháp</option><option value="approved">Đã Duyệt</option><option value="paid">Đã Trả</option></select>
          </div>
          {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Nhân Viên</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Ngày Công</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Lương CB</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Phụ Cấp</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Gross</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">BH+Thuế</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Net</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Trạng Thái</th>{user?.role === 'hrro' && <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Thao Tác</th>}</tr></thead>
                <tbody>
                  {salaries.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b border-gray-200"><div className="">{s.employeeName}</div><div className="text-sm text-gray-500">{s.employeeCode}</div></td>
                      <td className="px-4 py-3 border-b border-gray-200">{s.workingDays}/{s.standardWorkingDays}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{formatMoney(s.basicSalary)} ₫</td>
                      <td className="px-4 py-3 border-b border-gray-200">{formatMoney(s.allowances)} ₫</td>
                      <td className="px-4 py-3 border-b border-gray-200">{formatMoney(s.grossSalary)} ₫</td>
                      <td className="px-4 py-3 border-b border-gray-200 text-sm">{formatMoney(s.socialInsurance + s.healthInsurance + s.unemploymentInsurance + s.personalIncomeTax)} ₫</td>
                      <td className="px-4 py-3 border-b border-gray-200 text-green-700">{formatMoney(s.netSalary)} ₫</td>
                      <td className="px-4 py-3 border-b border-gray-200"><span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[s.status]}`}>{statusLabels[s.status]}</span></td>
                      {user?.role === 'hrro' && (
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="flex gap-1">
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewSalary(s)} title="Xem"><Eye size={16} /></button>
                            {s.status === 'draft' && <button className="px-3 py-1 text-xs inline-flex items-center gap-2 rounded cursor-pointer bg-green-950 text-white hover:bg-green-900" onClick={() => handleApprove(s.id)}><Check size={14} /> Duyệt</button>}
                            {s.status === 'approved' && <button className="px-3 py-1 text-xs inline-flex items-center gap-2 rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => handlePay(s.id)}><CreditCard size={14} /> Trả</button>}
                          </div>
                        </td>
                      )}
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
      {viewSalary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewSalary(null)}>
          <div className="bg-white rounded shadow-lg max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">Chi Tiết Bảng Lương</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewSalary(null)}><X size={20} /></button></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded bg-green-100 flex items-center justify-center text-green-800"><DollarSign size={32} /></div>
                <div><div className="text-xl font-medium">{viewSalary.employeeName}</div><div className="text-sm text-gray-500">{viewSalary.employeeCode} • Tháng {month}/{year}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Ngày Công:</span> {viewSalary.workingDays}/{viewSalary.standardWorkingDays}</div>
                <div><span className="text-gray-500">Lương Cơ Bản:</span> {formatMoney(viewSalary.basicSalary)} ₫</div>
                <div><span className="text-gray-500">Phụ Cấp:</span> {formatMoney(viewSalary.allowances)} ₫</div>
                <div><span className="text-gray-500">Lương Gross:</span> {formatMoney(viewSalary.grossSalary)} ₫</div>
                <div><span className="text-gray-500">BHXH (8%):</span> {formatMoney(viewSalary.socialInsurance)} ₫</div>
                <div><span className="text-gray-500">BHYT (1.5%):</span> {formatMoney(viewSalary.healthInsurance)} ₫</div>
                <div><span className="text-gray-500">BHTN (1%):</span> {formatMoney(viewSalary.unemploymentInsurance)} ₫</div>
                <div><span className="text-gray-500">Thuế TNCN:</span> {formatMoney(viewSalary.personalIncomeTax)} ₫</div>
                <div className="col-span-2 pt-2 border-t border-gray-200"><span className="text-gray-500">Lương Net:</span> <span className="text-xl text-green-700 font-medium">{formatMoney(viewSalary.netSalary)} ₫</span></div>
                <div><span className="text-gray-500">Trạng Thái:</span> <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[viewSalary.status]}`}>{statusLabels[viewSalary.status]}</span></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setViewSalary(null)}>Đóng</button></div>
          </div>
        </div>
      )}
    </>
  );
}