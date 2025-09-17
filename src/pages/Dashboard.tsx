import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardMain } from "@/components/DashboardMain";

const Dashboard = () => {
  // Sistema sem autenticação - acesso livre
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <DashboardMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;