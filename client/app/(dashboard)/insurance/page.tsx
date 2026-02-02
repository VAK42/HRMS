'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { ApiResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Search, Eye, Plus, Edit, Trash2, X, Download } from 'lucide-react';
interface InsuranceRecord { id: string; employeeId: string; employeeName: string; employeeCode: string; departmentName: string; socialInsuranceNumber: string; healthInsuranceNumber: string; healthInsurancePlace: string; registrationDate: string; socialInsuranceRate: number; healthInsuranceRate: number; unemploymentInsuranceRate: number; baseSalaryForInsurance: number; status: string; }
interface Employee { id: string; fullName: string; employeeCode: string; }
export default function InsurancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<InsuranceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewRecord, setViewRecord] = useState<InsuranceRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InsuranceRecord | null>(null);
  const [formData, setFormData] = useState({ employeeId: '', socialInsuranceNumber: '', healthInsuranceNumber: '', healthInsurancePlace: '', registrationDate: '', baseSalaryForInsurance: '' });
  const fetchData = async () => {
    try {
      setLoading(true);
      const [insRes, empRes] = await Promise.all([
        api.get<ApiResponse<InsuranceRecord[]>>('/insurance'),
        api.get<ApiResponse<Employee[]>>('/employees?limit=1000')
      ]);
      setRecords(insRes.data || []);
      setEmployees(empRes.data || []);
    } catch (error) { console.error('Lỗi Tải Bảo Hiểm:', error); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  const openModal = (record?: InsuranceRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ employeeId: record.employeeId, socialInsuranceNumber: record.socialInsuranceNumber, healthInsuranceNumber: record.healthInsuranceNumber, healthInsurancePlace: record.healthInsurancePlace, registrationDate: record.registrationDate, baseSalaryForInsurance: String(record.baseSalaryForInsurance) });
    } else {
      setEditingRecord(null);
      setFormData({ employeeId: '', socialInsuranceNumber: '', healthInsuranceNumber: '', healthInsurancePlace: '', registrationDate: '', baseSalaryForInsurance: '' });
    }
    setShowModal(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, baseSalaryForInsurance: parseFloat(formData.baseSalaryForInsurance) || 0 };
      if (editingRecord) { await api.put(`/insurance/${editingRecord.id}`, data); }
      else { await api.post('/insurance', data); }
      setShowModal(false);
      fetchData();
    } catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Xác Nhận Xóa Bảo Hiểm Này?')) {
      try { await api.delete(`/insurance/${id}`); fetchData(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  const filteredRecords = records.filter(r => r.employeeName?.toLowerCase().includes(search.toLowerCase()) || r.employeeCode?.toLowerCase().includes(search.toLowerCase()) || r.socialInsuranceNumber?.toLowerCase().includes(search.toLowerCase()));
  const statusLabels: Record<string, string> = { active: 'Đang Tham Gia', suspended: 'Tạm Dừng', terminated: 'Đã Nghỉ' };
  const statusBadgeClass: Record<string, string> = { active: 'bg-green-100 text-green-800', suspended: 'bg-yellow-100 text-yellow-800', terminated: 'bg-red-100 text-red-500' };
  const existingEmployeeIds = records.map(r => r.employeeId);
  const availableEmployees = editingRecord ? employees : employees.filter(e => !existingEmployeeIds.includes(e.id));
  return (
    <>
      <Header title="Quản Lý Bảo Hiểm" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">Danh Sách Bảo Hiểm</h2>
          {user?.role === 'hrro' && <div className="flex gap-2"><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => api.download('/insurance/export', 'baoHiem.xlsx')}><Download size={16} /> Xuất Excel</button><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" onClick={() => openModal()}><Plus size={16} /> Thêm Mới</button></div>}
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" placeholder="Tìm Kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Nhân Viên</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Số BHXH</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Số BHYT</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Ngày ĐK</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Mức Đóng</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Trạng Thái</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Thao Tác</th></tr></thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Không Có Dữ Liệu</td></tr>
                  ) : filteredRecords.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded bg-green-100 flex items-center justify-center text-green-800"><Shield size={16} /></div>
                          <div><div>{r.employeeName}</div><div className="text-sm text-gray-500">{r.employeeCode}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">{r.socialInsuranceNumber}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{r.healthInsuranceNumber}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{r.registrationDate}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{r.baseSalaryForInsurance?.toLocaleString('vi-VN')} ₫</td>
                      <td className="px-4 py-3 border-b border-gray-200"><span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[r.status]}`}>{statusLabels[r.status]}</span></td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex gap-1">
                          <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewRecord(r)} title="Xem"><Eye size={16} /></button>
                          {user?.role === 'hrro' && <><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => openModal(r)} title="Sửa"><Edit size={16} /></button><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100 text-red-500" onClick={() => handleDelete(r.id)} title="Xóa"><Trash2 size={16} /></button></>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded shadow-lg max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">{editingRecord ? 'Cập Nhật Bảo Hiểm' : 'Thêm Bảo Hiểm'}</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm text-gray-700 mb-1">Nhân Viên</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} required disabled={!!editingRecord}><option value="">Chọn Nhân Viên</option>{availableEmployees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>)}</select></div>
                <div><label className="block text-sm text-gray-700 mb-1">Số BHXH</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.socialInsuranceNumber} onChange={e => setFormData({ ...formData, socialInsuranceNumber: e.target.value })} required /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Số BHYT</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.healthInsuranceNumber} onChange={e => setFormData({ ...formData, healthInsuranceNumber: e.target.value })} required /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Nơi Đăng Ký KCB</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.healthInsurancePlace} onChange={e => setFormData({ ...formData, healthInsurancePlace: e.target.value })} required /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Ngày Đăng Ký</label><input type="date" className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.registrationDate} onChange={e => setFormData({ ...formData, registrationDate: e.target.value })} required /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Mức Lương Đóng BH (VNĐ)</label><input type="number" className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.baseSalaryForInsurance} onChange={e => setFormData({ ...formData, baseSalaryForInsurance: e.target.value })} required /></div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button type="button" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950">{editingRecord ? 'Cập Nhật' : 'Thêm Mới'}</button></div>
            </form>
          </div>
        </div>
      )}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewRecord(null)}>
          <div className="bg-white rounded shadow-lg max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">Chi Tiết Bảo Hiểm</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewRecord(null)}><X size={20} /></button></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded bg-green-100 flex items-center justify-center text-green-800"><Shield size={32} /></div>
                <div><div className="text-xl font-medium">{viewRecord.employeeName}</div><div className="text-sm text-gray-500">{viewRecord.employeeCode} • {viewRecord.departmentName}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Số BHXH:</span> {viewRecord.socialInsuranceNumber}</div>
                <div><span className="text-gray-500">Số BHYT:</span> {viewRecord.healthInsuranceNumber}</div>
                <div><span className="text-gray-500">Nơi KCB:</span> {viewRecord.healthInsurancePlace || '-'}</div>
                <div><span className="text-gray-500">Ngày Đăng Ký:</span> {viewRecord.registrationDate}</div>
                <div><span className="text-gray-500">Mức Đóng:</span> {viewRecord.baseSalaryForInsurance?.toLocaleString('vi-VN')} ₫</div>
                <div><span className="text-gray-500">Trạng Thái:</span> <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[viewRecord.status]}`}>{statusLabels[viewRecord.status]}</span></div>
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <div className="text-gray-500 mb-2">Tỷ Lệ Đóng:</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded"><div className="text-blue-700 font-medium">{viewRecord.socialInsuranceRate}%</div><div className="text-xs text-gray-500">BHXH</div></div>
                    <div className="p-2 bg-green-50 rounded"><div className="text-green-700 font-medium">{viewRecord.healthInsuranceRate}%</div><div className="text-xs text-gray-500">BHYT</div></div>
                    <div className="p-2 bg-yellow-50 rounded"><div className="text-yellow-700 font-medium">{viewRecord.unemploymentInsuranceRate}%</div><div className="text-xs text-gray-500">BHTN</div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setViewRecord(null)}>Đóng</button></div>
          </div>
        </div>
      )}
    </>
  );
}