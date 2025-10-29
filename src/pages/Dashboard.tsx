import { SidebarProvider } from "@/components/ui/sidebar";
import { ProponenteHeader } from "@/components/ProponenteHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardMain } from "@/components/DashboardMain";

const Dashboard = () => {
  // Sistema sem autenticação - acesso livre
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <ProponenteHeader />
          <DashboardMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;