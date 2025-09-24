import { SidebarProvider } from "@/components/ui/sidebar";
import { PrefeituraHeader } from "@/components/PrefeituraHeader";
import { PrefeituraSidebar } from "@/components/PrefeituraSidebar";
import { OpenBankingAdminMain } from "@/components/OpenBankingAdminMain";

const OpenBankingAdmin = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-prefeitura-accent">
        <PrefeituraSidebar />
        <div className="flex-1 flex flex-col">
          <PrefeituraHeader />
          <OpenBankingAdminMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OpenBankingAdmin;