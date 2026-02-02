'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng Nhập Thất Bại');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white rounded shadow p-6 w-full max-w-[400px] m-4 border border-green-950">
        <div className="text-center mb-8">
          <div className="w-[60px] h-[60px] rounded bg-green-950 flex items-center justify-center mx-auto mb-4 text-white">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl text-gray-900 mb-1">HRMS</h1>
          <p className="text-gray-500">Đăng Nhập Hệ Thống</p>
        </div>
        {error && <div className="p-4 rounded mb-4 bg-red-100 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" placeholder="email@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Mật Khẩu</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950" disabled={loading}>
            {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}
          </button>
        </form>

      </div>
    </div>
  );
}