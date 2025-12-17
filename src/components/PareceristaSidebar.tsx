import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  User,
  FileText,
  CheckSquare,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Headphones,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
// import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { ModalContatoSuporte } from "@/components/ModalContatoSuporte";
import { APP_VERSION } from "@/config/version";
import { supabase } from "@/integrations/supabase/client";

// Dados dos editais disponíveis
const editaisDisponiveis = [
  { id: 1, codigo: "PNAB-2025-001", nome: "PNAB 2025 - Edital de Fomento Cultural" },
  { id: 2, codigo: "PNAB-2025-002", nome: "Edital de Apoio às Artes Cênicas" },
  { id: 3, codigo: "PNAB-2025-003", nome: "Fomento à Música Popular Brasileira" },
  { id: 4, codigo: "PNAB-2025-004", nome: "Artes Visuais e Exposições" },
];

const menuItemsBase = [
  { title: "Início", icon: Home, path: "parecerista/dashboard" },
  { title: "Meus Projetos para Avaliar", icon: FileText, path: "parecerista/projetos-avaliar" },
  { title: "Projetos Avaliados", icon: CheckSquare, path: "parecerista/projetos-avaliados" },
  { title: "Meu Perfil", icon: User, path: "parecerista/meu-perfil" },
  { title: "Ajuda", icon: HelpCircle, path: "ajuda" },
];

export const PareceristaSidebar = () => {
  const { signOut } = useAuth();
  const { open } = useSidebar();
  const navigate = useNavigate();
  // const { getUrl } = usePrefeituraUrl();
  const getUrl = (path: string) => path; // Mock function
  const [editaisOpen, setEditaisOpen] = useState(false);
  const [editalSelecionado, setEditalSelecionado] = useState<number | null>(null);
  const [modalSuporteOpen, setModalSuporteOpen] = useState(false);
  const [temContatoSuporte, setTemContatoSuporte] = useState(false);
  
  // Verificar se há contato de suporte para parecerista
  useEffect(() => {
    const carregarContatoSuporte = async () => {
      try {
        const { data, error } = await supabase
          .from('contato_suporte')
          .select('whatsapp, email, telefone')
          .eq('role', 'parecerista')
          .eq('ativo', true)
          .maybeSingle();

        // Se não há erro e há dados, verificar se tem contato
        if (!error && data) {
          const temContato = !!(data as any).whatsapp || !!(data as any).email || !!(data as any).telefone;
          setTemContatoSuporte(temContato);
        } else {
          // Se não encontrou registro ou houve erro, não mostrar botão
          setTemContatoSuporte(false);
        }
      } catch (error) {
        console.error('Erro ao carregar contato de suporte:', error);
        setTemContatoSuporte(false);
      }
    };

    carregarContatoSuporte();
  }, []);
  
  // Gerar menu com URLs da prefeitura
  const menuItems = useMemo(() => menuItemsBase.map(item => ({ ...item, url: getUrl(item.path) })), [getUrl]);

  // Carregar edital selecionado do localStorage
  useEffect(() => {
    const carregarEditalSelecionado = () => {
      const editalId = localStorage.getItem("editalSelecionado");
      if (editalId) {
        setEditalSelecionado(parseInt(editalId));
      } else {
        setEditalSelecionado(null);
      }
    };

    carregarEditalSelecionado();

    // Listener para mudanças no edital selecionado
    const handleEditalChange = () => {
      carregarEditalSelecionado();
    };

    window.addEventListener("editalSelecionadoChanged", handleEditalChange);

    return () => {
      window.removeEventListener("editalSelecionadoChanged", handleEditalChange);
    };
  }, []);

  const handleLogout = async () => {
    const logoutUrl = await signOut();
    navigate(logoutUrl);
  };

  const handleSelecionarEdital = (editalId: number) => {
    setEditalSelecionado(editalId);
    localStorage.setItem("editalSelecionado", editalId.toString());

    // Dispara evento para atualizar outros componentes
    window.dispatchEvent(new CustomEvent("editalSelecionadoChanged"));

    setEditaisOpen(false);
  };

  const handleTrocarEdital = () => {
    navigate(getUrl("selecionar-edital"));
  };

  const editalAtual = editalSelecionado
    ? editaisDisponiveis.find(e => e.id === editalSelecionado)
    : null;

  return (
    <Sidebar className={open ? "w-64" : "w-14"} collapsible="icon">
      <SidebarContent className="bg-white border-r">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Edital Selecionado */}
              {editalAtual && open && (
                <SidebarMenuItem>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                    <div className="text-xs text-blue-600 font-medium mb-1">Edital Atual</div>
                    <div className="text-sm font-semibold text-blue-900 mb-1">
                      {editalAtual.codigo}
                    </div>
                    <div className="text-xs text-blue-700 leading-tight mb-2">
                      {editalAtual.nome}
                    </div>
                    <button
                      onClick={handleTrocarEdital}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Trocar edital
                    </button>
                  </div>
                </SidebarMenuItem>
              )}

              {/* Dropdown de Editais */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setEditaisOpen(!editaisOpen)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    {open && <span>Editais</span>}
                  </div>
                  {open && (
                    <div className="text-gray-500">
                      {editaisOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {editaisOpen && open && (
                <>
                  {editaisDisponiveis.map((edital) => (
                    <SidebarMenuItem key={edital.id}>
                      <SidebarMenuButton
                        className={`ml-6 text-sm ${
                          editalSelecionado === edital.id
                            ? "bg-blue-100 text-blue-900 font-medium"
                            : "text-gray-600 hover:text-blue-700"
                        }`}
                        onClick={() => handleSelecionarEdital(edital.id)}
                      >
                        <FolderOpen className="h-3 w-3" />
                        <div className="flex flex-col items-start">
                          <span className="text-xs">{edital.codigo}</span>
                          
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="ml-6 text-sm text-blue-600 hover:text-blue-800"
                      onClick={handleTrocarEdital}
                    >
                      <FolderOpen className="h-3 w-3" />
                      <span>Ver todos os editais</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* Menu Items Principais */}
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => navigate(item.url)}>
                    <item.icon className="h-4 w-4" />
                    {open && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {temContatoSuporte && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setModalSuporteOpen(true)}
                  >
                    <Headphones className="h-4 w-4" />
                    {open && <span>Suporte</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {open && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {open && (
          <div className="p-4 border-t text-center">
            <p className="text-xs text-muted-foreground">versão {APP_VERSION}</p>
          </div>
        )}
      </SidebarContent>
      
      {/* Modal de Contato Suporte */}
      <ModalContatoSuporte
        open={modalSuporteOpen}
        onClose={() => setModalSuporteOpen(false)}
        role="parecerista"
      />
    </Sidebar>
  );
};