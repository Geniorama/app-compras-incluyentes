"use client";

import DashboardNavbar from "./Navbar";
import DashboardSidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="flex container mx-auto pt-20">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <main className="flex-1 p-4 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
} 