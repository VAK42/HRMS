'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin"></div>
    </div>
  );
}