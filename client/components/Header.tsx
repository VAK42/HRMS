'use client';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon } from 'lucide-react';
interface HeaderProps {
  title: string;
}
export const Header = ({ title }: HeaderProps) => {
  const { user } = useAuth();
  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-30">
      <h1 className="text-xl text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-green-100 flex items-center justify-center text-green-800">
          <UserIcon size={18} />
        </div>
        <span className="text-sm">{user?.employee?.fullName || user?.email}</span>
      </div>
    </header>
  );
};