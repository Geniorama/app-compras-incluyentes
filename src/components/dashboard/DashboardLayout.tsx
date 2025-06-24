// import DashboardNavbar from "./Navbar";
import DashboardNavbar from "./Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="pt-16 pb-20 md:pb-0">
          {children}
      </div>
    </div>
  );
} 