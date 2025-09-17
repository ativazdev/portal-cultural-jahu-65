import { SidebarProvider } from "@/components/ui/sidebar";
import { PrefeituraHeader } from "@/components/PrefeituraHeader";
import { PrefeituraSidebar } from "@/components/PrefeituraSidebar";
import { CadastroPareceristaMain } from "@/components/CadastroPareceristaMain";

const CadastroPareceristas = () => {
  // Sistema sem autenticação - acesso livre
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-prefeitura-accent">
        <PrefeituraSidebar />
        <div className="flex-1 flex flex-col">
          <PrefeituraHeader />
          <CadastroPareceristaMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CadastroPareceristas;
