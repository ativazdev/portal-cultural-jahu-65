import { SidebarProvider } from "@/components/ui/sidebar";
import { PareceristaHeader } from "@/components/PareceristaHeader";
import { PareceristaSidebar } from "@/components/PareceristaSidebar";
import { PareceristaMain } from "@/components/PareceristaMain";

const DashboardParecerista = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <PareceristaSidebar />
        <div className="flex-1 flex flex-col">
          <PareceristaHeader />
          <PareceristaMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardParecerista;