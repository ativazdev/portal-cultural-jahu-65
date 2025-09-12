import { SidebarProvider } from "@/components/ui/sidebar";
import { PrefeituraHeader } from "@/components/PrefeituraHeader";
import { PrefeituraSidebar } from "@/components/PrefeituraSidebar";
import { PrefeituraMain } from "@/components/PrefeituraMain";

const DashboardPrefeitura = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-prefeitura-accent">
        <PrefeituraSidebar />
        <div className="flex-1 flex flex-col">
          <PrefeituraHeader />
          <PrefeituraMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPrefeitura;