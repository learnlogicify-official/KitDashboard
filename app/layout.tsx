import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexAcademy Dashboard",
  description: "Student Performance Analytics Dashboard for NexAcademy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <nav className="bg-white/80 backdrop-blur-sm border-b border-indigo-100/50">
          <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-600">NexAcademy</span>
                </div>
                <div className="ml-10 flex items-center space-x-4">
                  <Link
                    href="/"
                    className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium bg-indigo-50"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
