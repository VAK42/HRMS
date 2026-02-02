'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return null;
  return (
    <div>
      <Sidebar />
      <main className="ml-[250px] min-h-screen">
        {children}
      </main>
    </div>
  );
}