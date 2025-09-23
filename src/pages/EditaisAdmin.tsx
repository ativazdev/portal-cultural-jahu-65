import { SidebarProvider } from "@/components/ui/sidebar";
import { PrefeituraHeader } from "@/components/PrefeituraHeader";
import { PrefeituraSidebar } from "@/components/PrefeituraSidebar";
import { EditaisAdminMain } from "@/components/EditaisAdminMain";

const EditaisAdmin = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-prefeitura-accent">
        <PrefeituraSidebar />
        <div className="flex-1 flex flex-col">
          <PrefeituraHeader />
          <EditaisAdminMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EditaisAdmin;