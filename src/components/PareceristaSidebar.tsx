import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  User,
  FileText,
  CheckSquare,
  HelpCircle,
  LogOut,
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
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={signOut}
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