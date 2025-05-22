import SecurityForm from "@/components/dashboard/SecurityForm";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function SecurityView() {
  return (
    <div className="flex container mx-auto mt-10">
        <DashboardSidebar />
        <main className="w-3/3 xl:w-3/4 pl-10">
            <SecurityForm />
        </main>
    </div>
  );
}
