'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { ApiResponse } from '@/lib/types';
import { User, ChevronDown, ChevronRight } from 'lucide-react';
interface Employee { id: string; fullName: string; employeeCode: string; positionName: string; departmentName: string; managerId: string | null; }
interface EmpNode extends Employee { children: EmpNode[]; }
export default function OrgChartPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<ApiResponse<Employee[]>>('/employees/orgchart');
        const emps = res.data || [];
        setEmployees(emps);
        const rootIds = emps.filter(e => !e.managerId || !emps.find(m => m.id === e.managerId)).map(e => e.id);
        setExpanded(new Set(rootIds));
      } catch (error) { console.error('Lỗi Tải Dữ Liệu:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);
  const buildTree = (emps: Employee[], managerId: string | null = null): EmpNode[] => {
    return emps.filter(e => (e.managerId || null) === managerId).map(e => ({ ...e, children: buildTree(emps, e.id) }));
  };
  const toggle = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpanded(newExpanded);
  };
  const renderEmployee = (emp: EmpNode, level: number = 0) => (
    <div key={emp.id} style={{ marginLeft: level * 32 }}>
      <div className="flex items-center gap-3 p-3 bg-white rounded shadow mb-2 hover:bg-gray-50 cursor-pointer" onClick={() => emp.children.length > 0 && toggle(emp.id)}>
        {emp.children.length > 0 ? (expanded.has(emp.id) ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />) : <div className="w-4" />}
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><User size={20} className="text-green-800" /></div>
        <div className="flex-1">
          <div className="font-medium">{emp.fullName}</div>
          <div className="text-sm text-gray-500">{emp.positionName} • {emp.departmentName}</div>
        </div>
        {emp.children.length > 0 && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{emp.children.length} Nhân Viên</span>}
      </div>
      {expanded.has(emp.id) && emp.children.map(child => renderEmployee(child, level + 1))}
    </div>
  );
  const tree = buildTree(employees);
  return (
    <>
      <Header title="Sơ Đồ Tổ Chức" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">Cây Nhân Sự</h2>
          <span className="text-sm text-gray-500">{employees.length} Nhân Viên</span>
        </div>
        {loading ? (<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div></div>) : tree.length === 0 ? (
          <div className="bg-white rounded shadow p-6 text-center py-12">
            <div className="w-20 h-20 rounded bg-green-100 flex items-center justify-center mx-auto mb-6"><User size={40} className="text-green-800" /></div>
            <h3 className="text-xl mb-2">Chưa Có Nhân Viên</h3>
            <p className="text-gray-500">Thêm Nhân Viên Và Thiết Lập Quản Lý Trực Tiếp Để Xem Sơ Đồ Tổ Chức!</p>
          </div>
        ) : (
          <div className="max-w-4xl">{tree.map(e => renderEmployee(e))}</div>
        )}
      </div>
    </>
  );
}