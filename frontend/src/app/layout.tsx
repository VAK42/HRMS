import type { Metadata } from "next"
import { Outfit, Work_Sans } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})
export const metadata: Metadata = {
  title: "HRMS - Hệ Thống Quản Lý Nhân Sự",
  description: "Hệ Thống Quản Lý Nhân Sự Hiện Đại",
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${workSans.variable} font-sans antialiased min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}