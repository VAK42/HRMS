'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Position, Department, ApiResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, X, Search, Eye, Briefcase } from 'lucide-react';
export default function PositionsPage() {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [viewPosition, setViewPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', level: '1', departmentId: '', baseSalary: '' });
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.append('search', search);
      if (deptFilter) params.append('departmentId', deptFilter);
      const [posRes, deptRes] = await Promise.all([
        api.get<ApiResponse<Position[]>>(`/positions?${params}`),
        api.get<ApiResponse<Department[]>>('/departments/all')
      ]);
      setPositions(posRes.data || []);
      setTotalPages(posRes.pagination?.totalPages || 1);
      setDepartments(deptRes.data || []);
    } catch (error) { console.error('Lỗi Tải Vị Trí:', error); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, search, deptFilter]);
  const openModal = (pos?: Position) => {
    if (pos) {
      setEditingPosition(pos);
      setFormData({ name: pos.name, code: pos.code, level: String(pos.level), departmentId: pos.departmentId, baseSalary: String(pos.baseSalary) });
    } else {
      setEditingPosition(null);
      setFormData({ name: '', code: '', level: '1', departmentId: '', baseSalary: '' });
    }
    setShowModal(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, level: parseInt(formData.level), baseSalary: parseFloat(formData.baseSalary) };
      if (editingPosition) { await api.put(`/positions/${editingPosition.id}`, data); }
      else { await api.post('/positions', data); }
      setShowModal(false);
      fetchData();
    } catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Xác Nhận Xóa Vị Trí?')) {
      try { await api.delete(`/positions/${id}`); fetchData(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  return (
    <>
      <Header title="Quản Lý Vị Trí" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">Danh Sách Vị Trí</h2>
          {user?.role === 'hrro' && <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" onClick={() => openModal()}><Plus size={16} /> Thêm Mới</button>}
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" placeholder="Tìm Kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700 min-w-[150px]" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}><option value="">Tất Cả Phòng Ban</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          </div>
          {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Vị Trí</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Cấp Bậc</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Phòng Ban</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Lương Cơ Bản</th><th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Số NV</th>{user?.role === 'hrro' && <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Thao Tác</th>}</tr></thead>
                <tbody>
                  {positions.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded bg-blue-100 flex items-center justify-center text-blue-800"><Briefcase size={16} /></div>
                          <div><div>{p.name}</div><div className="text-sm text-gray-500">{p.code}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200"><span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-600">Level {p.level}</span></td>
                      <td className="px-4 py-3 border-b border-gray-200">{p.departmentName}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{p.baseSalary?.toLocaleString('vi-VN')} ₫</td>
                      <td className="px-4 py-3 border-b border-gray-200">{p.employeeCount || 0}</td>
                      {user?.role === 'hrro' && (
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="flex gap-1">
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewPosition(p)} title="Xem"><Eye size={16} /></button>
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => openModal(p)} title="Sửa"><Edit size={16} /></button>
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => handleDelete(p.id)} title="Xóa"><Trash2 size={16} /></button>
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
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded shadow-lg max-w-lg w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">{editingPosition ? 'Cập Nhật Vị Trí' : 'Thêm Vị Trí'}</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Tên Vị Trí</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Mã Vị Trí</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required /></div>
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Cấp Bậc</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="number" min="1" max="10" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} required /></div>
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Phòng Ban</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })} required><option value="">Chọn Phòng Ban</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Lương Cơ Bản (VNĐ)</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="number" value={formData.baseSalary} onChange={e => setFormData({ ...formData, baseSalary: e.target.value })} required /></div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button type="button" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950">{editingPosition ? 'Cập Nhật' : 'Thêm Mới'}</button></div>
            </form>
          </div>
        </div>
      )}
      {viewPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewPosition(null)}>
          <div className="bg-white rounded shadow-lg max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">Thông Tin Vị Trí</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewPosition(null)}><X size={20} /></button></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded bg-blue-100 flex items-center justify-center text-blue-800"><Briefcase size={32} /></div>
                <div><div className="text-xl font-medium">{viewPosition.name}</div><div className="text-sm text-gray-500">{viewPosition.code}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Cấp Bậc:</span> Level {viewPosition.level}</div>
                <div><span className="text-gray-500">Số Nhân Viên:</span> {viewPosition.employeeCount || 0}</div>
                <div><span className="text-gray-500">Phòng Ban:</span> {viewPosition.departmentName}</div>
                <div><span className="text-gray-500">Lương Cơ Bản:</span> {viewPosition.baseSalary?.toLocaleString('vi-VN')} ₫</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setViewPosition(null)}>Đóng</button></div>
          </div>
        </div>
      )}
    </>
  );
}