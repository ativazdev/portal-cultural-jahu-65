import { useState } from "react";
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
} from "lucide-react";
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
  { title: "Início", icon: Home, url: "/dashboard" },
];

const minhaContaItems = [
  { title: "Meus projetos", icon: FileText, url: "/meus-projetos" },
  { title: "Meus proponentes", icon: Users, url: "/meus-proponentes" },
  { title: "Alterar meus dados", icon: Settings, url: "/alterar-dados" },
];

const otherItems = [
  { title: "Comunicação", icon: MessageSquare, url: "/comunicacao" },
  { title: "Minhas Pendências", icon: AlertCircle, url: "/pendencias" },
];

export const DashboardSidebar = () => {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const [minhaContaOpen, setMinhaContaOpen] = useState(true);
  const [ajudaOpen, setAjudaOpen] = useState(false);

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
                <SidebarMenuButton className="text-red-600 hover:text-red-700 hover:bg-red-50">
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