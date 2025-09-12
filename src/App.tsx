import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CadastroProponente from "./pages/CadastroProponente";
import Dashboard from "./pages/Dashboard";
import DashboardParecerista from "./pages/DashboardParecerista";
import DashboardPrefeitura from "./pages/DashboardPrefeitura";
import ProjetosAdmin from "./pages/ProjetosAdmin";
import AvaliacoesAdmin from "./pages/AvaliacoesAdmin";
import RankingAvaliacoes from "./pages/RankingAvaliacoes";
import PrestacoesAdmin from "./pages/PrestacoesAdmin";
import OpenBankingAdmin from "./pages/OpenBankingAdmin";
import ProjetosAvaliar from "./pages/ProjetosAvaliar";
import ProjetosAvaliados from "./pages/ProjetosAvaliados";
import AvaliarProjeto from "./pages/AvaliarProjeto";
import MeusProponentes from "./pages/MeusProponentes";
import MinhasPendencias from "./pages/MinhasPendencias";
import Comunicacao from "./pages/Comunicacao";
import MeusProjetos from "./pages/MeusProjetos";
import AlterarMeusDados from "./pages/AlterarMeusDados";
import PrestacaoContas from "./pages/PrestacaoContas";
import PrestacaoContasDetalhada from "./pages/PrestacaoContasDetalhada";
import DetalhesEdital from "./pages/DetalhesEdital";
import MeuPerfilParecerista from "./pages/MeuPerfilParecerista";
import Ajuda from "./pages/Ajuda";
import NovaPropostaProjeto from "./pages/NovaPropostaProjeto";
import CronogramaExecucao from "./pages/CronogramaExecucao";
import PlanilhaOrcamentaria from "./pages/PlanilhaOrcamentaria";
import NotFound from "./pages/NotFound";
import RelatoriosAdmin from "./pages/RelatoriosAdmin";
import ComunicacoesAdmin from "./pages/ComunicacoesAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cadastro-proponente" element={<CadastroProponente />} />
          <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard-parecerista" element={<DashboardParecerista />} />
          <Route path="/dashboard-prefeitura" element={<DashboardPrefeitura />} />
          <Route path="/projetos-admin" element={<ProjetosAdmin />} />
          <Route path="/avaliacoes-admin" element={<AvaliacoesAdmin />} />
          <Route path="/ranking-avaliacoes" element={<RankingAvaliacoes />} />
          <Route path="/prestacoes-admin" element={<PrestacoesAdmin />} />
          <Route path="/openbanking-admin" element={<OpenBankingAdmin />} />
          <Route path="/relatorios-admin" element={<RelatoriosAdmin />} />
          <Route path="/comunicacoes-admin" element={<ComunicacoesAdmin />} />
        <Route path="/projetos-avaliar" element={<ProjetosAvaliar />} />
        <Route path="/projetos-avaliados" element={<ProjetosAvaliados />} />
        <Route path="/avaliar-projeto/:id" element={<AvaliarProjeto />} />
        <Route path="/meu-perfil-parecerista" element={<MeuPerfilParecerista />} />
        <Route path="/ajuda" element={<Ajuda />} />
        <Route path="/nova-proposta" element={<NovaPropostaProjeto />} />
        <Route path="/cronograma-execucao" element={<CronogramaExecucao />} />
        <Route path="/planilha-orcamentaria" element={<PlanilhaOrcamentaria />} />
          <Route path="/meus-proponentes" element={<MeusProponentes />} />
          <Route path="/pendencias" element={<MinhasPendencias />} />
          <Route path="/comunicacao" element={<Comunicacao />} />
          <Route path="/meus-projetos" element={<MeusProjetos />} />
          <Route path="/alterar-dados" element={<AlterarMeusDados />} />
          <Route path="/prestacao-contas" element={<PrestacaoContas />} />
          <Route path="/prestacao-contas-detalhada" element={<PrestacaoContasDetalhada />} />
          <Route path="/detalhes-edital" element={<DetalhesEdital />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
