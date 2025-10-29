import React, { ReactNode, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Building2, 
  Home, 
  Users, 
  FileText, 
  FolderOpen, 
  HelpCircle,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseLayout, Container, PageHeader, PageContent } from "./BaseLayout";
import { UserProfile } from "@/components/auth/UserProfile";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";

interface PrefeituraLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
}

export const PrefeituraLayout = ({ 
  children, 
  title, 
  description, 
  headerActions 
}: PrefeituraLayoutProps) => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, loading, profile } = usePrefeituraAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verificar se está autenticado e tem profile válido
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || !profile)) {
      navigate(`/${nomePrefeitura}/login`);
    }
  }, [loading, isAuthenticated, profile, navigate, nomePrefeitura]);

  const navigation = [
    { name: "Dashboard", href: `/${nomePrefeitura}/dashboard`, icon: Home },
    { name: "Pareceristas", href: `/${nomePrefeitura}/pareceristas`, icon: Users },
    { name: "Editais", href: `/${nomePrefeitura}/editais`, icon: FileText },
    { name: "Dúvidas", href: `/${nomePrefeitura}/duvidas`, icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
  };

  // Exibir loading enquanto verifica autenticação
  if (loading) {
    return (
      <BaseLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando...</p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Se não estiver autenticado, não renderizar o layout
  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <BaseLayout>
      <div className="flex h-screen bg-background">
        {/* Sidebar Mobile */}
        <div className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}>
          <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="text-lg font-semibold">Prefeitura</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                  >
                    {React.createElement(item.icon, { className: "mr-2 h-4 w-4" })}
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-background border-r">
            <div className="flex h-16 items-center px-4 border-b">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <span className="text-lg font-semibold">Prefeitura</span>
                  <p className="text-xs text-muted-foreground capitalize">
                    {nomePrefeitura?.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    {React.createElement(item.icon, { className: "mr-2 h-4 w-4" })}
                    {item.name}
                  </Button>
                );
              })}
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Header Mobile */}
          <div className="lg:hidden flex h-16 items-center justify-between px-4 border-b bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">Prefeitura</span>
            </div>
            {isAuthenticated && <UserProfile />}
          </div>

          {/* Page Header */}
          {title && (
            <PageHeader 
              title={title} 
              description={description}
              className="hidden lg:block"
            >
              <div className="flex items-center space-x-4">
                {headerActions}
                {isAuthenticated && <UserProfile />}
              </div>
            </PageHeader>
          )}

          {/* Page Content */}
          <PageContent>
            {children}
          </PageContent>
        </div>
      </div>
    </BaseLayout>
  );
};
