import { useState } from "react";
import {
  BarChart3,
  FileText,
  Users,
  CreditCard,
  Banknote,
  PieChart,
  MessageSquare,
  LogOut,
  Home,
  UserPlus,
  FolderOpen
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard-prefeitura",
    icon: Home,
  },
  {
    title: "Editais",
    url: "/editais-admin",
    icon: FolderOpen,
  },
  {
    title: "Projetos",
    url: "/projetos-admin",
    icon: FileText,
  },
  {
    title: "Avaliações",
    url: "/avaliacoes-admin",
    icon: Users,
  },
  {
    title: "Pareceristas",
    url: "/cadastro-pareceristas",
    icon: UserPlus,
  },
  {
    title: "Prestações",
    url: "/prestacoes-admin",
    icon: CreditCard,
  },
  {
    title: "Open Banking",
    url: "/openbanking-admin",
    icon: Banknote,
  },
  {
    title: "Relatórios",
    url: "/relatorios-admin",
    icon: PieChart,
  },
  {
    title: "Comunicações",
    url: "/comunicacoes-admin",
    icon: MessageSquare,
  },
];

export const PrefeituraSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { state } = useSidebar();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent className="bg-white border-r border-prefeitura-secondary">
        <SidebarGroup>
          <SidebarGroupLabel className="text-prefeitura-primary font-semibold">
            {state !== "collapsed" && "Navegação Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.url)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${isActive(item.url) 
                        ? 'bg-prefeitura-primary text-white' 
                        : 'text-prefeitura-muted hover:bg-prefeitura-secondary hover:text-prefeitura-primary'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    {state !== "collapsed" && <span className="font-medium">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <SidebarMenuButton
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {state !== "collapsed" && <span className="font-medium">Sair</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};