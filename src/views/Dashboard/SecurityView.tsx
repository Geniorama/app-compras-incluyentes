import SecurityForm from "@/components/dashboard/SecurityForm";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function SecurityView() {
  return (
    <div className="flex container mx-auto mt-5 md:mt-10">
        <DashboardSidebar />
        <main className="w-full xl:w-3/4 px-4 md:px-0 md:pl-10">
            <SecurityForm />
        </main>
    </div>
  );
}
