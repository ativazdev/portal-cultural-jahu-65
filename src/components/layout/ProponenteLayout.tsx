import React, { ReactNode, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  User, 
  FileText, 
  FolderOpen, 
  HelpCircle,
  LogOut,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseLayout } from "./BaseLayout";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProponenteLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
}

export const ProponenteLayout = ({ 
  children, 
  title, 
  description, 
  headerActions 
}: ProponenteLayoutProps) => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, loading, proponente, prefeitura } = useProponenteAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verificar se está autenticado e tem proponente válido
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || !proponente)) {
      navigate(`/${nomePrefeitura}/proponente/login`);
    }
  }, [loading, isAuthenticated, proponente, navigate, nomePrefeitura]);

  const navigation = [
    { name: "Editais", href: `/${nomePrefeitura}/proponente/editais`, icon: FileText },
    { name: "Meus Projetos", href: `/${nomePrefeitura}/proponente/projetos`, icon: FolderOpen },
    { name: "Proponentes", href: `/${nomePrefeitura}/proponente/proponentes`, icon: Briefcase },
    { name: "Suporte", href: `/${nomePrefeitura}/proponente/suporte`, icon: HelpCircle },
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
  if (!isAuthenticated || !proponente) {
    return null;
  }

  return (
    <BaseLayout>
      <div className="flex h-screen bg-background">
        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
              <div className="flex h-16 items-center justify-between px-4 border-b">
                <div className="flex items-center space-x-2">
                  <User className="h-8 w-8 text-primary" />
                  <span className="text-lg font-semibold">Proponente</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>{proponente.nome.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{proponente.nome}</p>
                    <p className="text-xs text-gray-500 truncate">{proponente.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Desktop */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r">
          <div className="flex h-16 items-center px-4 border-b">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">Proponente</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback>{proponente.nome.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{proponente.nome}</p>
                <p className="text-xs text-gray-500 truncate">{proponente.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

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

