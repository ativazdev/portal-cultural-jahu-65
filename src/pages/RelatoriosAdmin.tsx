import { SidebarProvider } from "@/components/ui/sidebar";
import { PrefeituraHeader } from "@/components/PrefeituraHeader";
import { PrefeituraSidebar } from "@/components/PrefeituraSidebar";
import { RelatoriosAdminMain } from "@/components/RelatoriosAdminMain";

const RelatoriosAdmin = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-prefeitura-accent">
        <PrefeituraSidebar />
        <div className="flex-1 flex flex-col">
          <PrefeituraHeader />
          <RelatoriosAdminMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RelatoriosAdmin;