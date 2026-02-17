import React, { ReactNode, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  User, 
  FileText, 
  HelpCircle,
  LogOut,
  ClipboardList,
  CheckSquare,
  Download,
  Headphones,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseLayout } from "./BaseLayout";
import { usePareceristaAuth } from "@/hooks/usePareceristaAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import JSZip from 'jszip';
import { ModalContatoSuporte } from "@/components/ModalContatoSuporte";
import { APP_VERSION } from "@/config/version";
import { FixedHeader } from "@/components/layout/FixedHeader";


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
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingArquivos, setLoadingArquivos] = useState(false);
  const [modalSuporteOpen, setModalSuporteOpen] = useState(false);
  const [linkTutorial, setLinkTutorial] = useState<string | null>(null);
  const [temContatoSuporte, setTemContatoSuporte] = useState(false);

  // Buscar link do tutorial e verificar se há contato de suporte baseado no role
  useEffect(() => {
    const carregarDadosSuporte = async () => {
      try {
        const { data, error } = await supabase
          .from('contato_suporte')
          .select('link_tutorial, whatsapp, email, telefone')
          .eq('role', 'parecerista')
          .eq('ativo', true)
          .maybeSingle();

        // Se não há erro e há dados, processar
        if (!error && data) {
          if ((data as any).link_tutorial) {
            setLinkTutorial((data as any).link_tutorial);
          } else {
            setLinkTutorial(null);
          }
          // Verificar se há pelo menos um meio de contato
          const temContato = !!(data as any).whatsapp || !!(data as any).email || !!(data as any).telefone;
          setTemContatoSuporte(temContato);
        } else {
          // Se não encontrou registro ou houve erro, não mostrar botão
          setLinkTutorial(null);
          setTemContatoSuporte(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de suporte:', error);
        setLinkTutorial(null);
        setTemContatoSuporte(false);
      }
    };

    if (isAuthenticated && parecerista) {
      carregarDadosSuporte();
    } else {
      // Resetar quando não autenticado
      setLinkTutorial(null);
      setTemContatoSuporte(false);
    }
  }, [isAuthenticated, parecerista]);

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

  const handleDownloadRegulamento = async () => {
    if (!editalId) {
      toast({
        title: "Erro",
        description: "Edital não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingArquivos(true);

      // Buscar edital e pegar a coluna regulamento
      const { data: edital, error: editalError } = await supabase
        .from('editais')
        .select('regulamento, nome, codigo')
        .eq('id', editalId)
        .single();

      if (editalError) throw editalError;

      const editalData = edital as any;

      if (!editalData || !editalData.regulamento || (editalData.regulamento as string[]).length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum arquivo de regulamento encontrado para este edital.",
        });
        return;
      }

      const urlsRegulamento = editalData.regulamento as string[];
      const zip = new JSZip();

      // Baixar cada arquivo e adicionar ao ZIP
      for (let i = 0; i < urlsRegulamento.length; i++) {
        try {
          const url = urlsRegulamento[i];
          
          // Extrair o nome do arquivo e path do storage da URL
          // A URL pode ser uma URL pública completa do Supabase Storage
          let fileName: string;
          let storagePath: string;

          if (url.startsWith('http://') || url.startsWith('https://')) {
            // URL pública completa - extrair o path do storage
            // Formato: https://[project].supabase.co/storage/v1/object/public/editais/[nome_arquivo]
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            // Procurar pelo bucket 'editais' e pegar o que vem depois
            const bucketIndex = pathParts.indexOf('editais');
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              storagePath = pathParts.slice(bucketIndex + 1).join('/');
              fileName = pathParts[pathParts.length - 1] || `arquivo_${i + 1}.pdf`;
            } else {
              // Fallback: pegar última parte do path
              storagePath = pathParts[pathParts.length - 1];
              fileName = pathParts[pathParts.length - 1] || `arquivo_${i + 1}.pdf`;
            }
          } else {
            // Já é um path do storage (apenas o nome do arquivo)
            storagePath = url;
            fileName = url.split('/').pop() || `arquivo_${i + 1}.pdf`;
          }

          // Baixar arquivo do storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('editais')
            .download(storagePath);

          if (downloadError) {
            console.error(`Erro ao baixar arquivo ${fileName}:`, downloadError);
            // Tentar baixar diretamente pela URL se o download do storage falhar
            try {
              const response = await fetch(url);
              if (response.ok) {
                const blob = await response.blob();
                zip.file(fileName, blob);
              } else {
                console.error(`Erro ao baixar arquivo ${fileName} via URL:`, response.statusText);
              }
            } catch (fetchError) {
              console.error(`Erro ao fazer fetch do arquivo ${fileName}:`, fetchError);
            }
            continue;
          }

          if (fileData) {
            // Adicionar arquivo ao ZIP
            zip.file(fileName, fileData);
          }
        } catch (err) {
          console.error(`Erro ao processar arquivo ${i + 1}:`, err);
        }
      }

      // Gerar ZIP e fazer download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      const editalNome = editalData.nome || 'edital';
      const editalCodigo = editalData.codigo || editalId;
      link.download = `regulamento_${editalCodigo}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);

      toast({
        title: "Sucesso",
        description: `Regulamento baixado com ${urlsRegulamento.length} arquivo(s) em ZIP!`,
      });
    } catch (error) {
      console.error('Erro ao baixar arquivos do regulamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar arquivos do regulamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingArquivos(false);
    }
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
      <div className="min-h-screen bg-background pt-20">
        <FixedHeader />
        <div className="flex bg-background">
          {/* Sidebar */}
          <aside 
            className={cn(
              "fixed left-0 z-40 w-72 border-r border-slate-200 bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 shadow-lg shadow-slate-200/50",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
            style={{ top: '80px', height: 'calc(100vh - 80px)' }}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header - App Brand */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm tracking-tight">Parecerista</p>
                    {prefeitura && (
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{prefeitura.municipio}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-xl hover:bg-slate-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              {navigation.length > 0 && (
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                  <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start py-6 px-4 rounded-2xl transition-all duration-200 group relative",
                          isActive 
                            ? "bg-blue-50 text-blue-700 font-bold shadow-sm shadow-blue-100/50" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                        onClick={() => {
                          navigate(item.href);
                          setSidebarOpen(false);
                        }}
                      >
                        {isActive && (
                          <div className="absolute left-1 w-1 h-6 bg-blue-600 rounded-full" />
                        )}
                        <Icon className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                        )} />
                        {item.name}
                      </Button>
                    );
                  })}
                  
                  {linkTutorial && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start py-6 px-4 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 group"
                      onClick={() => {
                        window.open(linkTutorial, '_blank', 'noopener,noreferrer');
                        setSidebarOpen(false);
                      }}
                    >
                      <BookOpen className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                      Tutorial Interativo
                    </Button>
                  )}
                </nav>
              )}

              {/* Bottom Actions */}
              <div className="p-6 border-t border-slate-100 space-y-3 bg-slate-50/50">
                {editalId && (
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl transition-all h-11"
                      onClick={handleTrocarEdital}
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Trocar Edital
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl transition-all h-11"
                      onClick={handleDownloadRegulamento}
                      disabled={loadingArquivos}
                    >
                      <Download className={cn("mr-2 h-4 w-4", loadingArquivos && "animate-spin")} />
                      {loadingArquivos ? 'Baixando...' : 'Regulamento (.zip)'}
                    </Button>
                  </div>
                )}
                
                {temContatoSuporte && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl h-11"
                    onClick={() => setModalSuporteOpen(true)}
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Central de Suporte
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-11"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Encerrar Sessão
                </Button>
              </div>

              {/* User Profile Footer */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 border-2 border-slate-50 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm">
                      {parecerista.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate leading-tight">{parecerista.nome}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{parecerista.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-1">
                  <Badge variant="outline" className="text-[10px] font-mono py-0 text-slate-400 border-slate-200 rounded-full">
                    v{APP_VERSION}
                  </Badge>
                  <p className="text-[10px] text-slate-300 font-medium tracking-tighter italic">CULTURAL JAHU</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Overlay para mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              style={{ top: '80px' }}
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden lg:pl-72 min-h-[calc(100vh-80px)]">
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
      </div>
      
      {/* Modal de Contato Suporte */}
      <ModalContatoSuporte
        open={modalSuporteOpen}
        onClose={() => setModalSuporteOpen(false)}
        role="parecerista"
      />
    </BaseLayout>
  );
};

