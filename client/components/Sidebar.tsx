'use client';
import { LayoutDashboard, Users, Building2, Briefcase, Clock, CalendarDays, FileText, DollarSign, Shield, LogOut, User as UserIcon, Network } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
const navItems = [
  { href: '/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard, hrroOnly: true },
  { href: '/employees', label: 'Nhân Viên', icon: Users, hrroOnly: true },
  { href: '/departments', label: 'Phòng Ban', icon: Building2, hrroOnly: true },
  { href: '/orgChart', label: 'Sơ Đồ Tổ Chức', icon: Network },
  { href: '/positions', label: 'Vị Trí', icon: Briefcase, hrroOnly: true },
  { href: '/attendance', label: 'Chấm Công', icon: Clock },
  { href: '/leaveRequests', label: 'Đơn Xin Nghỉ', icon: CalendarDays },
  { href: '/contracts', label: 'Hợp Đồng', icon: FileText },
  { href: '/salaries', label: 'Bảng Lương', icon: DollarSign },
  { href: '/insurance', label: 'Bảo Hiểm', icon: Shield, hrroOnly: true }
];
export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const filteredNav = navItems.filter(item => !item.hrroOnly || user?.role === 'hrro');
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[250px] bg-black text-white flex flex-col z-40">
      <div className="p-6 border-b border-gray-800">
        <div className="text-xl">HRMS</div>
        <div className="text-sm text-gray-400 mt-1">Quản Lý Nhân Sự</div>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {filteredNav.map(item => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-6 py-3 text-sm transition-all ${pathname === item.href ? 'bg-white text-green-950' : 'text-gray-300 hover:bg-gray-900 hover:text-white'}`}>
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded bg-gray-800 flex items-center justify-center">
            <UserIcon size={18} />
          </div>
          <div>
            <div className="text-sm">{user?.employee?.fullName || user?.email}</div>
            <div className="text-xs text-gray-400">{user?.role === 'hrro' ? 'HRRO' : user?.role === 'manager' ? 'Trưởng Phòng' : 'Nhân Viên'}</div>
          </div>
        </div>
        <button onClick={logout} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-white text-green-950 border border-white hover:bg-gray-100">
          <LogOut size={16} />
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
};