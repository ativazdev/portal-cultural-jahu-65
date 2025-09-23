import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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

// Dados dos editais disponíveis
const editaisDisponiveis = [
  { id: 1, codigo: "PNAB-2025-001", nome: "PNAB 2025 - Edital de Fomento Cultural" },
  { id: 2, codigo: "PNAB-2025-002", nome: "Edital de Apoio às Artes Cênicas" },
  { id: 3, codigo: "PNAB-2025-003", nome: "Fomento à Música Popular Brasileira" },
  { id: 4, codigo: "PNAB-2025-004", nome: "Artes Visuais e Exposições" },
];

const menuItems = [
  { title: "Início", icon: Home, url: "/dashboard-parecerista" },
  { title: "Meus Projetos para Avaliar", icon: FileText, url: "/projetos-avaliar" },
  { title: "Projetos Avaliados", icon: CheckSquare, url: "/projetos-avaliados" },
  { title: "Meu Perfil", icon: User, url: "/meu-perfil-parecerista" },
  { title: "Ajuda", icon: HelpCircle, url: "/ajuda" },
];

export const PareceristaSidebar = () => {
  const { signOut } = useAuth();
  const { open } = useSidebar();
  const navigate = useNavigate();
  const [editaisOpen, setEditaisOpen] = useState(false);
  const [editalSelecionado, setEditalSelecionado] = useState<number | null>(null);

  // Carregar edital selecionado do localStorage
  useEffect(() => {
    const editalId = localStorage.getItem("editalSelecionado");
    if (editalId) {
      setEditalSelecionado(parseInt(editalId));
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleSelecionarEdital = (editalId: number) => {
    setEditalSelecionado(editalId);
    localStorage.setItem("editalSelecionado", editalId.toString());
    setEditaisOpen(false);
  };

  const handleTrocarEdital = () => {
    navigate("/selecionar-edital");
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
      </SidebarContent>
    </Sidebar>
  );
};