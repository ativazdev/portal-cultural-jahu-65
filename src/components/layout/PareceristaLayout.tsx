import React, { ReactNode, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  User, 
  FileText, 
  HelpCircle,
  LogOut,
  ClipboardList,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseLayout } from "./BaseLayout";
import { usePareceristaAuth } from "@/hooks/usePareceristaAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PareceristaLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  editalId?: string;
}

export const PareceristaLayout = ({ 
  children, 
  title, 
  description, 
  headerActions,
  editalId
}: PareceristaLayoutProps) => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, loading, parecerista, prefeitura } = usePareceristaAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verificar se está autenticado e tem parecerista válido
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || !parecerista)) {
      navigate(`/${nomePrefeitura}/parecerista/login`);
    }
  }, [loading, isAuthenticated, parecerista, navigate, nomePrefeitura]);

  const navigation = editalId ? [
    { name: "Dashboard", href: `/${nomePrefeitura}/parecerista/${editalId}/dashboard`, icon: ClipboardList },
    { name: "Projetos", href: `/${nomePrefeitura}/parecerista/${editalId}/projetos`, icon: FileText },
    { name: "Suporte", href: `/${nomePrefeitura}/parecerista/${editalId}/suporte`, icon: HelpCircle },
  ] : [];

  const handleLogout = () => {
    logout();
  };

  const handleTrocarEdital = () => {
    navigate(`/${nomePrefeitura}/parecerista/selecionar-edital`);
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
  if (!isAuthenticated || !parecerista) {
    return null;
  }

  return (
    <BaseLayout>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 border-r bg-white transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo / Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Parecerista</p>
                  {prefeitura && (
                    <p className="text-xs text-gray-500">{prefeitura.municipio}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            {navigation.length > 0 && (
              <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-green-50 text-green-700 hover:bg-green-100"
                      )}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
            )}

            {/* Trocar Edital e Logout */}
            <div className="p-4 border-t space-y-2">
              {editalId && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleTrocarEdital}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Trocar Edital
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>

            {/* User Info */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-green-600 text-white">
                    {parecerista.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{parecerista.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{parecerista.email}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 border-b bg-background">
            <div className="flex h-full items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                {prefeitura && (
                  <div>
                    <p className="text-sm font-medium">{prefeitura.nome}</p>
                    <p className="text-xs text-gray-500">{prefeitura.municipio} - {prefeitura.estado}</p>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {(title || description || headerActions) && (
              <div className="border-b bg-background">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between py-6">
                    <div>
                      {title && (
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                      )}
                      {description && (
                        <p className="text-muted-foreground mt-1">{description}</p>
                      )}
                    </div>
                    {headerActions && <div>{headerActions}</div>}
                  </div>
                </div>
              </div>
            )}
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </BaseLayout>
  );
};

