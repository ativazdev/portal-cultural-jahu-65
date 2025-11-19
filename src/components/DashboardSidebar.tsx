import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  User,
  FileText,
  Calendar,
  Users,
  Settings,
  MessageSquare,
  Building,
  AlertCircle,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
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

const menuItemsBase = [
  { title: "Início", icon: Home, path: "dashboard" },
];

const minhaContaItemsBase = [
  { title: "Meus projetos", icon: FileText, path: "meus-projetos" },
  { title: "Meus proponentes", icon: Users, path: "meus-proponentes" },
  { title: "Alterar meus dados", icon: Settings, path: "alterar-dados" },
];

const otherItemsBase = [
  { title: "Comunicação", icon: MessageSquare, path: "comunicacao" },
  { title: "Minhas Pendências", icon: AlertCircle, path: "pendencias" },
];

export const DashboardSidebar = () => {
  const { signOut } = useAuth();
  const { open } = useSidebar();
  const navigate = useNavigate();
  // const { getUrl } = usePrefeituraUrl();
  const getUrl = (path: string) => path; // Mock function
  const [minhaContaOpen, setMinhaContaOpen] = useState(true);
  const [ajudaOpen, setAjudaOpen] = useState(false);
  const [modalSuporteOpen, setModalSuporteOpen] = useState(false);
  
  // Gerar menus com URLs da prefeitura
  const menuItems = useMemo(() => menuItemsBase.map(item => ({ ...item, url: getUrl(item.path) })), [getUrl]);
  const minhaContaItems = useMemo(() => minhaContaItemsBase.map(item => ({ ...item, url: getUrl(item.path) })), [getUrl]);
  const otherItems = useMemo(() => otherItemsBase.map(item => ({ ...item, url: getUrl(item.path) })), [getUrl]);

  const handleLogout = async () => {
    const logoutUrl = await signOut();
    navigate(logoutUrl);
  };

  return (
    <Sidebar className={open ? "w-64" : "w-14"} collapsible="icon">
      <SidebarContent className="bg-white border-r">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => navigate(item.url)}>
                    <item.icon className="h-4 w-4" />
                    {open && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Minha Conta */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setMinhaContaOpen(!minhaContaOpen)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {open && <span>Minha Conta</span>}
                  </div>
                  {open && (
                    <div className="text-gray-500">
                      {minhaContaOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {minhaContaOpen && open && (
                <>
                  {minhaContaItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        className="ml-6 text-sm text-gray-600 hover:text-cultural-primary"
                        onClick={() => navigate(item.url)}
                      >
                        <item.icon className="h-3 w-3" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
              
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => navigate(item.url)}>
                    <item.icon className="h-4 w-4" />
                    {open && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setModalSuporteOpen(true)}
                >
                  <Headphones className="h-4 w-4" />
                  {open && <span>Suporte</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
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
      
      {/* Modal de Contato Suporte */}
      <ModalContatoSuporte
        open={modalSuporteOpen}
        onClose={() => setModalSuporteOpen(false)}
      />
    </Sidebar>
  );
};