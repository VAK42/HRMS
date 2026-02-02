'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Employee, Department, Position, ApiResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Download, Edit, Trash2, User as UserIcon, X, Eye, FileText, UserX } from 'lucide-react';
export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [managers, setManagers] = useState<{ id: string; fullName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ employeeCode: '', firstName: '', lastName: '', fullName: '', email: '', phone: '', personalEmail: '', dateOfBirth: '', gender: 'male', nationalId: '', nationalIdDate: '', nationalIdPlace: '', taxCode: '', bankAccount: '', bankName: '', bankBranch: '', permanentAddress: '', currentAddress: '', positionId: '', departmentId: '', managerId: '', isManager: 0, hireDate: '', employmentStatus: 'probation', employmentType: 'fullTime' });
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.append('search', search);
      if (deptFilter) params.append('departmentId', deptFilter);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get<ApiResponse<Employee[]>>(`/employees?${params}`);
      setEmployees(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Lỗi Tải Nhân Viên:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchDropdowns = async () => {
    try {
      const [deptRes, posRes, mgrRes] = await Promise.all([
        api.get<ApiResponse<Department[]>>('/departments/all'),
        api.get<ApiResponse<Position[]>>('/positions/all'),
        api.get<ApiResponse<{ id: string; fullName: string }[]>>('/employees/managers')
      ]);
      setDepartments(deptRes.data || []);
      setPositions(posRes.data || []);
      setManagers(mgrRes.data || []);
    } catch (error) {
      console.error('Lỗi Tải Dropdown:', error);
    }
  };
  useEffect(() => { fetchEmployees(); fetchDropdowns(); }, [page, search, deptFilter, statusFilter]);
  const handleExport = async () => { try { await api.download('/employees/export', 'nhanVien.xlsx'); } catch (e) { alert(e instanceof Error ? e.message : 'Lỗi'); } };
  const openModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      const position = positions.find(p => p.id === emp.positionId);
      const isManager = position && position.level <= 2 ? 1 : 0;
      setFormData({ employeeCode: emp.employeeCode, firstName: emp.firstName, lastName: emp.lastName, fullName: emp.fullName, email: emp.email, phone: emp.phone, personalEmail: emp.personalEmail, dateOfBirth: emp.dateOfBirth, gender: emp.gender, nationalId: emp.nationalId, nationalIdDate: emp.nationalIdDate, nationalIdPlace: emp.nationalIdPlace, taxCode: emp.taxCode, bankAccount: emp.bankAccount, bankName: emp.bankName, bankBranch: emp.bankBranch, permanentAddress: emp.permanentAddress, currentAddress: emp.currentAddress, positionId: emp.positionId, departmentId: emp.departmentId, managerId: isManager ? '' : (emp.managerId || ''), isManager, hireDate: emp.hireDate, employmentStatus: emp.employmentStatus, employmentType: emp.employmentType });
    } else {
      setEditingEmployee(null);
      setFormData({ employeeCode: '', firstName: '', lastName: '', fullName: '', email: '', phone: '', personalEmail: '', dateOfBirth: '', gender: 'male', nationalId: '', nationalIdDate: '', nationalIdPlace: '', taxCode: '', bankAccount: '', bankName: '', bankBranch: '', permanentAddress: '', currentAddress: '', positionId: '', departmentId: '', managerId: '', isManager: 0, hireDate: '', employmentStatus: 'probation', employmentType: 'fullTime' });
    }
    setShowModal(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, fullName: `${formData.lastName} ${formData.firstName}` };
      if (editingEmployee) { await api.put(`/employees/${editingEmployee.id}`, data); }
      else { await api.post('/employees', data); }
      setShowModal(false);
      fetchEmployees();
    } catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Xác Nhận Xóa Nhân Viên Này?')) {
      try { await api.delete(`/employees/${id}`); fetchEmployees(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  const handleTerminate = async (id: string) => {
    if (confirm('Xác Nhận Cho Nghỉ Việc Nhân Viên Này?')) {
      try {
        await api.put(`/employees/${id}`, { employmentStatus: 'terminated', terminationDate: new Date().toISOString().split('T')[0] });
        setViewEmployee(null);
        fetchEmployees();
      } catch (error) { alert(error instanceof Error ? error.message : 'Lỗi'); }
    }
  };
  const handleExportPdf = (emp: Employee) => {
    const content = `THÔNG TIN NHÂN VIÊN
===================
Mã Nhân Viên: ${emp.employeeCode}
Họ Và Tên: ${emp.fullName}
Email: ${emp.email}
Điện Thoại: ${emp.phone}
Email Cá Nhân: ${emp.personalEmail}

THÔNG TIN CÁ NHÂN
-----------------
Ngày Sinh: ${emp.dateOfBirth}
Giới Tính: ${emp.gender === 'male' ? 'Nam' : emp.gender === 'female' ? 'Nữ' : 'Khác'}
CCCD/CMND: ${emp.nationalId}
Ngày Cấp: ${emp.nationalIdDate}
Nơi Cấp: ${emp.nationalIdPlace}
Mã Số Thuế: ${emp.taxCode}

THÔNG TIN NGÂN HÀNG
-------------------
Số Tài Khoản: ${emp.bankAccount}
Ngân Hàng: ${emp.bankName}
Chi Nhánh: ${emp.bankBranch}

ĐỊA CHỈ
-------
Địa Chỉ Thường Trú: ${emp.permanentAddress}
Địa Chỉ Hiện Tại: ${emp.currentAddress}

THÔNG TIN CÔNG VIỆC
-------------------
Phòng Ban: ${emp.departmentName || ''}
Vị Trí: ${emp.positionName || ''}
Quản Lý: ${emp.managerName || 'Không Có'}
Là Trưởng Phòng: ${emp.isManager ? 'Có' : 'Không'}
Ngày Vào Làm: ${emp.hireDate}
Loại Hợp Đồng: ${emp.employmentType === 'fullTime' ? 'Toàn Thời Gian' : emp.employmentType === 'partTime' ? 'Bán Thời Gian' : emp.employmentType === 'contract' ? 'Hợp Đồng' : 'Thực Tập'}
Trạng Thái: ${emp.employmentStatus === 'active' ? 'Đang Làm Việc' : emp.employmentStatus === 'probation' ? 'Thử Việc' : 'Đã Nghỉ Việc'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${emp.employeeCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const isManagerPosition = () => {
    const selectedPosition = positions.find(p => p.id === formData.positionId);
    return selectedPosition && selectedPosition.level <= 2;
  };
  const handlePositionChange = (positionId: string) => {
    const selectedPosition = positions.find(p => p.id === positionId);
    const isManager = selectedPosition && selectedPosition.level <= 2 ? 1 : 0;
    setFormData({
      ...formData,
      positionId,
      isManager,
      managerId: isManager ? '' : formData.managerId
    });
  };
  const statusLabels: Record<string, string> = { active: 'Đang Làm Việc', probation: 'Thử Việc', terminated: 'Đã Nghỉ', resigned: 'Đã Nghỉ' };
  const statusBadgeClass: Record<string, string> = { active: 'bg-green-100 text-green-800', probation: 'bg-yellow-100 text-gray-800', terminated: 'bg-red-100 text-red-500', resigned: 'bg-gray-100 text-gray-600' };
  return (
    <>
      <Header title="Quản Lý Nhân Viên" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">Danh Sách Nhân Viên</h2>
          <div className="flex gap-2">
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={handleExport}><Download size={16} /> Xuất Excel</button>
            {user?.role === 'hrro' && (<button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" onClick={() => openModal()}><Plus size={16} /> Thêm Mới</button>)}
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" placeholder="Tìm Kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700 min-w-[150px]" value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
              <option value="">Tất Cả Phòng Ban</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700 min-w-[150px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">Tất Cả Trạng Thái</option>
              <option value="active">Đang Làm Việc</option>
              <option value="probation">Thử Việc</option>
              <option value="terminated">Đã Nghỉ Việc</option>
            </select>
          </div>
          {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Nhân Viên</th>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Phòng Ban</th>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Vị Trí</th>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Ngày Vào</th>
                    <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Trạng Thái</th>
                    {user?.role === 'hrro' && <th className="font-normal text-left px-4 py-3 bg-gray-50 text-gray-700 border-b border-gray-200">Thao Tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded bg-green-100 flex items-center justify-center text-green-800"><UserIcon size={16} /></div>
                          <div>
                            <div className="">{emp.fullName}</div>
                            <div className="text-sm text-gray-500">{emp.employeeCode} • {emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">{emp.departmentName}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{emp.positionName}</td>
                      <td className="px-4 py-3 border-b border-gray-200">{emp.hireDate}</td>
                      <td className="px-4 py-3 border-b border-gray-200"><span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[emp.employmentStatus]}`}>{statusLabels[emp.employmentStatus]}</span></td>
                      {user?.role === 'hrro' && (
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="flex gap-1">
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewEmployee(emp)} title="Xem"><Eye size={16} /></button>
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => openModal(emp)} title="Sửa"><Edit size={16} /></button>
                            <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => handleDelete(emp.id)} title="Xóa"><Trash2 size={16} /></button>
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
              <button className="px-3 py-1 text-xs inline-flex items-center justify-center gap-2 rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
              <button className="px-3 py-1 text-xs inline-flex items-center justify-center gap-2 rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded shadow-lg max-w-[700px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg">{editingEmployee ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3>
              <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-700 mb-1">Mã NV</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.employeeCode} onChange={e => setFormData({ ...formData, employeeCode: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Email</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Họ</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Tên</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Điện Thoại</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Email Cá Nhân</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.personalEmail} onChange={e => setFormData({ ...formData, personalEmail: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Ngày Sinh</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Giới Tính</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select></div>
                  <div><label className="block text-sm text-gray-700 mb-1">CCCD/CMND</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.nationalId} onChange={e => setFormData({ ...formData, nationalId: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Ngày Cấp</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="date" value={formData.nationalIdDate} onChange={e => setFormData({ ...formData, nationalIdDate: e.target.value })} required /></div>
                  <div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">Nơi Cấp</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.nationalIdPlace} onChange={e => setFormData({ ...formData, nationalIdPlace: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Mã Số Thuế</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.taxCode} onChange={e => setFormData({ ...formData, taxCode: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Số Tài Khoản</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.bankAccount} onChange={e => setFormData({ ...formData, bankAccount: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Ngân Hàng</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Chi Nhánh</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.bankBranch} onChange={e => setFormData({ ...formData, bankBranch: e.target.value })} required /></div>
                  <div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">Địa Chỉ Thường Trú</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.permanentAddress} onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })} required /></div>
                  <div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">Địa Chỉ Hiện Tại</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" value={formData.currentAddress} onChange={e => setFormData({ ...formData, currentAddress: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Phòng Ban</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })} required><option value="">Chọn Phòng Ban</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Vị Trí</label><select className={`w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700 ${!formData.departmentId ? 'bg-gray-100' : ''}`} value={formData.positionId} onChange={e => handlePositionChange(e.target.value)} required disabled={!formData.departmentId}><option value="">Chọn Vị Trí</option>{positions.filter(p => !formData.departmentId || p.departmentId === formData.departmentId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Là Trưởng Phòng</label><select className={`w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700 ${isManagerPosition() ? 'bg-gray-100' : ''}`} value={formData.isManager} disabled><option value={0}>Không</option><option value={1}>Có</option></select></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Quản Lý Trực Tiếp</label><select className={`w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700 ${isManagerPosition() ? 'bg-gray-100' : ''}`} value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })} required={!isManagerPosition()} disabled={isManagerPosition()}><option value="">Chọn Quản Lý</option>{managers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}</select></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Ngày Vào Làm</label><input className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700" type="date" value={formData.hireDate} onChange={e => setFormData({ ...formData, hireDate: e.target.value })} required /></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Loại Hợp Đồng</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.employmentType} onChange={e => setFormData({ ...formData, employmentType: e.target.value })}><option value="fullTime">Toàn Thời Gian</option><option value="partTime">Bán Thời Gian</option><option value="contract">Hợp Đồng</option><option value="intern">Thực Tập</option></select></div>
                  <div><label className="block text-sm text-gray-700 mb-1">Trạng Thái</label><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-green-700" value={formData.employmentStatus} onChange={e => setFormData({ ...formData, employmentStatus: e.target.value })}><option value="probation">Thử Việc</option><option value="active">Đang Làm Việc</option><option value="terminated">Đã Nghỉ Việc</option></select></div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
                <button type="button" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950">{editingEmployee ? 'Cập Nhật' : 'Thêm Mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewEmployee(null)}>
          <div className="bg-white rounded shadow-lg max-w-[700px] w-[90%] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg">Thông Tin Nhân Viên</h3>
              <button className="p-2 rounded bg-transparent border-none cursor-pointer hover:bg-gray-100" onClick={() => setViewEmployee(null)}><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded bg-green-100 flex items-center justify-center text-green-800"><UserIcon size={32} /></div>
                <div>
                  <div className="text-xl font-medium">{viewEmployee.fullName}</div>
                  <div className="text-sm text-gray-500">{viewEmployee.employeeCode} - {viewEmployee.positionName}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2 font-medium text-gray-700 border-b pb-1">Thông Tin Liên Hệ</div>
                <div><span className="text-gray-500">Email:</span> {viewEmployee.email}</div>
                <div><span className="text-gray-500">Điện Thoại:</span> {viewEmployee.phone}</div>
                <div><span className="text-gray-500">Email Cá Nhân:</span> {viewEmployee.personalEmail}</div>
                <div></div>
                <div className="col-span-2 font-medium text-gray-700 border-b pb-1 mt-2">Thông Tin Cá Nhân</div>
                <div><span className="text-gray-500">Ngày Sinh:</span> {viewEmployee.dateOfBirth}</div>
                <div><span className="text-gray-500">Giới Tính:</span> {viewEmployee.gender === 'male' ? 'Nam' : viewEmployee.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                <div><span className="text-gray-500">CCCD/CMND:</span> {viewEmployee.nationalId}</div>
                <div><span className="text-gray-500">Ngày Cấp:</span> {viewEmployee.nationalIdDate}</div>
                <div className="col-span-2"><span className="text-gray-500">Nơi Cấp:</span> {viewEmployee.nationalIdPlace}</div>
                <div><span className="text-gray-500">Mã Số Thuế:</span> {viewEmployee.taxCode}</div>
                <div></div>
                <div className="col-span-2 font-medium text-gray-700 border-b pb-1 mt-2">Thông Tin Ngân Hàng</div>
                <div><span className="text-gray-500">Số Tài Khoản:</span> {viewEmployee.bankAccount}</div>
                <div><span className="text-gray-500">Ngân Hàng:</span> {viewEmployee.bankName}</div>
                <div><span className="text-gray-500">Chi Nhánh:</span> {viewEmployee.bankBranch}</div>
                <div></div>
                <div className="col-span-2 font-medium text-gray-700 border-b pb-1 mt-2">Địa Chỉ</div>
                <div className="col-span-2"><span className="text-gray-500">Thường Trú:</span> {viewEmployee.permanentAddress}</div>
                <div className="col-span-2"><span className="text-gray-500">Hiện Tại:</span> {viewEmployee.currentAddress}</div>
                <div className="col-span-2 font-medium text-gray-700 border-b pb-1 mt-2">Thông Tin Công Việc</div>
                <div><span className="text-gray-500">Phòng Ban:</span> {viewEmployee.departmentName}</div>
                <div><span className="text-gray-500">Vị Trí:</span> {viewEmployee.positionName}</div>
                <div><span className="text-gray-500">Quản Lý:</span> {viewEmployee.managerName || 'Không Có'}</div>
                <div><span className="text-gray-500">Là Trưởng Phòng:</span> {viewEmployee.isManager ? 'Có' : 'Không'}</div>
                <div><span className="text-gray-500">Ngày Vào Làm:</span> {viewEmployee.hireDate}</div>
                <div><span className="text-gray-500">Loại Hợp Đồng:</span> {viewEmployee.employmentType === 'fullTime' ? 'Toàn Thời Gian' : viewEmployee.employmentType === 'partTime' ? 'Bán Thời Gian' : viewEmployee.employmentType === 'contract' ? 'Hợp Đồng' : 'Thực Tập'}</div>
                <div><span className="text-gray-500">Trạng Thái:</span> <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusBadgeClass[viewEmployee.employmentStatus]}`}>{statusLabels[viewEmployee.employmentStatus]}</span></div>
              </div>
            </div>
            <div className="flex justify-between gap-2 px-6 py-4 border-t border-gray-200">
              <div>
                {viewEmployee.employmentStatus !== 'terminated' && viewEmployee.employmentStatus !== 'resigned' && (
                  <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-red-600 text-white border border-red-600 hover:bg-white hover:text-red-600" onClick={() => handleTerminate(viewEmployee.id)}><UserX size={16} /> Cho Nghỉ Việc</button>
                )}
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => handleExportPdf(viewEmployee)}><FileText size={16} /> Xuất File</button>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" onClick={() => setViewEmployee(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}