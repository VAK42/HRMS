'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Department, ApiResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, X, Building2, Search, Eye } from 'lucide-react';
export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<{ id: string; fullName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewDepartment, setViewDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', managerId: '', parentDepartmentId: '' });
  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, mgrRes] = await Promise.all([
        api.get<ApiResponse<Department[]>>('/departments'),
        api.get<ApiResponse<{ id: string; fullName: string }[]>>('/employees/managers')
      ]);
      setDepartments(deptRes.data || []);
      setManagers(mgrRes.data || []);
    } catch (error) {
      console.error('Lỗi Tải Phòng Ban:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);
  const openModal = (dept?: Department) => {
    if (dept) {
      setEditingDepartment(dept);
      setFormData({ name: dept.name, code: dept.code, managerId: dept.managerId || '', parentDepartmentId: dept.parentDepartmentId || '' });
    } else {
      setEditingDepartment(null);
      setFormData({ name: '', code: '', managerId: '', parentDepartmentId: '' });
    }
    setShowModal(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) { await api.put(`/departments/${editingDepartment.id}`, formData); }
      else { await api.post('/departments', formData); }
      setShowModal(false);
      fetchData();
    } catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Xác Nhận Xóa Phòng Ban?')) {
      try { await api.delete(`/departments/${id}`); fetchData(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <Header title="Quản Lý Phòng Ban" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">Danh Sách Phòng Ban</h2>
          {user?.role === 'hrro' && <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" onClick={() => openModal()}><Plus size={16} /> Thêm Mới</button>}
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" placeholder="Tìm Kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Phòng Ban</th>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Trưởng Phòng</th>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Số Nhân Viên</th>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Phòng Ban Cha</th>
                    {user?.role === 'hrro' && <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Thao Tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded bg-green-100 flex items-center justify-center text-green-800"><Building2 size={16} /></div>
                          <div><div>{d.name}</div><div className="text-sm text-gray-500">{d.code}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">{d.managerName || '-'}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{d.employeeCount || 0}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{departments.find(p => p.id === d.parentDepartmentId)?.name || '-'}</td>
                      {user?.role === 'hrro' && (
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="flex gap-1">
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewDepartment(d)} title="Xem"><Eye size={16} /></button>
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => openModal(d)} title="Sửa"><Edit size={16} /></button>
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => handleDelete(d.id)} title="Xóa"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      )}
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
          <div className="bg-white rounded shadow-lg max-w-lg w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">{editingDepartment ? 'Cập Nhật Phòng Ban' : 'Thêm Phòng Ban'}</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Tên Phòng Ban</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Mã Phòng Ban</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required /></div>
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Trưởng Phòng</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })}><option value="">Chọn Trưởng Phòng</option>{managers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}</select></div>
                <div className="mb-4"><label className="block text-sm text-gray-700 mb-1">Phòng Ban Cha</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.parentDepartmentId} onChange={e => setFormData({ ...formData, parentDepartmentId: e.target.value })}><option value="">Không Có</option>{departments.filter(dd => dd.id !== editingDepartment?.id).map(dd => <option key={dd.id} value={dd.id}>{dd.name}</option>)}</select></div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button type="button" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950">{editingDepartment ? 'Cập Nhật' : 'Thêm Mới'}</button></div>
            </form>
          </div>
        </div>
      )}
      {viewDepartment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewDepartment(null)}>
          <div className="bg-white rounded shadow-lg max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg">Thông Tin Phòng Ban</h3><button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewDepartment(null)}><X size={20} /></button></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded bg-green-100 flex items-center justify-center text-green-800"><Building2 size={32} /></div>
                <div><div className="text-xl font-medium">{viewDepartment.name}</div><div className="text-sm text-gray-500">{viewDepartment.code}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Trưởng Phòng:</span> {viewDepartment.managerName || 'Chưa Có'}</div>
                <div><span className="text-gray-500">Số Nhân Viên:</span> {viewDepartment.employeeCount || 0}</div>
                <div><span className="text-gray-500">Phòng Ban Cha:</span> {departments.find(p => p.id === viewDepartment.parentDepartmentId)?.name || 'Không Có'}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200"><button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setViewDepartment(null)}>Đóng</button></div>
          </div>
        </div>
      )}
    </>
  );
}