import { SidebarProvider } from "@/components/ui/sidebar";
import { PrefeituraHeader } from "@/components/PrefeituraHeader";
import { PrefeituraSidebar } from "@/components/PrefeituraSidebar";
import { RankingAvaliacoesMain } from "@/components/RankingAvaliacoesMain";

const RankingAvaliacoes = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-prefeitura-accent">
        <PrefeituraSidebar />
        <div className="flex-1 flex flex-col">
          <PrefeituraHeader />
          <RankingAvaliacoesMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RankingAvaliacoes;