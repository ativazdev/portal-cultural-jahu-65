import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginParecerista from "./pages/LoginParecerista";
import LoginProponente from "./pages/LoginProponente";
import Dashboard from "./pages/Dashboard";
import DashboardParecerista from "./pages/DashboardParecerista";
import { PrefeituraLogin } from "./pages/PrefeituraLogin";
import { PrefeituraDashboard } from "./pages/PrefeituraDashboard";
import { PrefeituraPareceristas } from "./pages/PrefeituraPareceristas";
import { PrefeituraEditais } from "./pages/PrefeituraEditais";
import { PrefeituraProjetos } from "./pages/PrefeituraProjetos";
import { PrefeituraProjetoDetalhes } from "./pages/PrefeituraProjetoDetalhes";
import { PrefeituraExportarRanking } from "./pages/PrefeituraExportarRanking";
import { PrefeituraDuvidas } from "./pages/PrefeituraDuvidas";
import { ProponenteLogin } from "./pages/ProponenteLogin";
import { ProponenteCadastro } from "./pages/ProponenteCadastro";
import { ProponenteSolicitarRedefinicaoSenha } from "./pages/ProponenteSolicitarRedefinicaoSenha";
import { ProponenteRedefinicaoSenha } from "./pages/ProponenteRedefinicaoSenha";
import { ProponenteEditais } from "./pages/ProponenteEditais";
import { ProponenteProjetos } from "./pages/ProponenteProjetos";
import { ProponenteProjetoDetalhes } from "./pages/ProponenteProjetoDetalhes";
import { ProponenteSuporte } from "./pages/ProponenteSuporte";
import { ProponenteProponentes } from "./pages/ProponenteProponentes";
import { ProponenteCadastrarProjeto } from "./pages/ProponenteCadastrarProjeto";
import { PareceristaLogin } from "./pages/PareceristaLogin";
import { PareceristaSelecionarEdital } from "./pages/PareceristaSelecionarEdital";
import { PareceristaDashboard } from "./pages/PareceristaDashboard";
import { PareceristaProjetos } from "./pages/PareceristaProjetos";
import { PareceristaProjetoDetalhes } from "./pages/PareceristaProjetoDetalhes";
import { PareceristaSuporte } from "./pages/PareceristaSuporte";
import { AuthGuard } from "./components/auth/AuthGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          {/* Rotas da Prefeitura */}
          <Route path="/:nomePrefeitura/login" element={<PrefeituraLogin />} />
          <Route path="/:nomePrefeitura/dashboard" element={
            <AuthGuard>
              <PrefeituraDashboard />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/pareceristas" element={
            <AuthGuard>
              <PrefeituraPareceristas />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/editais" element={
            <AuthGuard>
              <PrefeituraEditais />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/editais/:editalId/projetos" element={
            <AuthGuard>
              <PrefeituraProjetos />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/editais/:editalId/projetos/:projetoId" element={
            <AuthGuard>
              <PrefeituraProjetoDetalhes />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/editais/:editalId/exportar-ranking" element={
            <AuthGuard>
              <PrefeituraExportarRanking />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/duvidas" element={
            <AuthGuard>
              <PrefeituraDuvidas />
            </AuthGuard>
          } />
          
          {/* Rotas do Proponente */}
          <Route path="/:nomePrefeitura/proponente/login" element={<ProponenteLogin />} />
          <Route path="/:nomePrefeitura/proponente/cadastro" element={<ProponenteCadastro />} />
          <Route path="/:nomePrefeitura/proponente/solicitar-redefinicao-senha" element={<ProponenteSolicitarRedefinicaoSenha />} />
          <Route path="/:nomePrefeitura/proponente/redefinicao-senha" element={<ProponenteRedefinicaoSenha />} />
          <Route path="/:nomePrefeitura/proponente/editais" element={
            <AuthGuard>
              <ProponenteEditais />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/proponente/editais/:editalId/cadastrar-projeto" element={
            <AuthGuard>
              <ProponenteCadastrarProjeto />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/proponente/projetos" element={
            <AuthGuard>
              <ProponenteProjetos />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/proponente/projetos/:projetoId" element={
            <AuthGuard>
              <ProponenteProjetoDetalhes />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/proponente/suporte" element={
            <AuthGuard>
              <ProponenteSuporte />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/proponente/proponentes" element={
            <AuthGuard>
              <ProponenteProponentes />
            </AuthGuard>
          } />
          
          {/* Rotas do Parecerista */}
          <Route path="/:nomePrefeitura/parecerista/login" element={<PareceristaLogin />} />
          <Route path="/:nomePrefeitura/parecerista/selecionar-edital" element={
            <AuthGuard>
              <PareceristaSelecionarEdital />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/parecerista/:editalId/dashboard" element={
            <AuthGuard>
              <PareceristaDashboard />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/parecerista/:editalId/projetos" element={
            <AuthGuard>
              <PareceristaProjetos />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/parecerista/:editalId/projetos/:projetoId" element={
            <AuthGuard>
              <PareceristaProjetoDetalhes />
            </AuthGuard>
          } />
          <Route path="/:nomePrefeitura/parecerista/:editalId/suporte" element={
            <AuthGuard>
              <PareceristaSuporte />
            </AuthGuard>
          } />
          
          {/* Rotas existentes mantidas */}
          <Route path="/login-parecerista" element={<LoginParecerista />} />
          <Route path="/login-proponente" element={<LoginProponente />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/parecerista/dashboard" element={<DashboardParecerista />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;
