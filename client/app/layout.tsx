import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'HRMS - Hệ Thống Quản Lý Nhân Sự',
  description: 'Hệ Thống Quản Lý Nhân Sự Doanh Nghiệp'
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}