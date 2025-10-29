import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProponenteHeader } from "@/components/ProponenteHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowLeft, ChevronDown, Eye, Edit, Save, FileText, Loader2 } from "lucide-react";
import { useDashboardProponente } from "@/hooks/useDashboardProponente";
import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";

// Mapeamento de status para linguagem amigável
const statusLabels = {
  "recebido": "Recebido",
  "aguardando_avaliacao": "Aguardando Avaliação",
  "em_avaliacao": "Em Avaliação", 
  "aprovado": "Aprovado",
  "rejeitado": "Rejeitado",
  "em_execucao": "Em Execução",
  "rascunho": "Rascunho",
  "concluido": "Concluído"
};

// Opções de status para filtro
const statusOptions = [
  { value: "rascunho", label: "Rascunho" },
  { value: "recebido", label: "Recebido" },
  { value: "aguardando_avaliacao", label: "Aguardando Avaliação" },
  { value: "em_avaliacao", label: "Em Avaliação" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "em_execucao", label: "Em Execução" }
];

const MeusProjetos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUrl } = usePrefeituraUrl();
  const { projetos, editaisDisponiveis, loading, error } = useDashboardProponente();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [programaFilter, setProgramaFilter] = useState("todos-programas");
  const [anoFilter, setAnoFilter] = useState("todos-anos");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalVisualizacaoAberto, setIsModalVisualizacaoAberto] = useState(false);
  const [isModalEdicaoAberto, setIsModalEdicaoAberto] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<any>(null);

  // Extrair editais únicos dos projetos
  const editaisUnicos = projetos.reduce((acc, projeto) => {
    const edital = {
      id: projeto.edital_codigo,
      nome: projeto.edital_nome,
      codigo: projeto.edital_codigo
    };
    
    if (!acc.find(e => e.id === edital.id)) {
      acc.push(edital);
    }
    return acc;
  }, [] as Array<{id: string, nome: string, codigo: string}>);

  // Extrair anos únicos dos projetos
  const anosUnicos = projetos.reduce((acc, projeto) => {
    const ano = new Date(projeto.data_submissao).getFullYear().toString();
    if (!acc.includes(ano)) {
      acc.push(ano);
    }
    return acc;
  }, [] as string[]).sort((a, b) => b.localeCompare(a)); // Ordenar do mais recente para o mais antigo
  
  // Estados do formulário de edição
  const [formEdicao, setFormEdicao] = useState({
    nome: "",
    descricao: "",
    modalidade: "",
    inicioExecucao: "",
    duracaoMeses: "",
    terminoExecucao: "",
    orcamento: ""
  });

  // Funções para ações dos botões
  const handleEditarProjeto = (projeto: any) => {
    if (projeto.status === "rascunho") {
      console.log('Projeto rascunho:', projeto);
      console.log('IDs para busca:', { 
        edital_id: projeto.edital_id, 
        proponente_id: projeto.proponente_id 
      });
      
      // Redirecionar para a tela de preenchimento do projeto
      const url = getUrl(`nova-proposta?edital=${projeto.edital_id}&proponente=${projeto.proponente_id}`);
      console.log('URL gerada:', url);
      navigate(url);
      toast({
        title: "Continuando projeto",
        description: `Continuando o preenchimento do projeto "${projeto.nome}".`,
      });
    } else if (projeto.status === "recebido") {
      setProjetoSelecionado(projeto);
      // Preencher formulário com dados do projeto
      setFormEdicao({
        nome: projeto.nome,
        descricao: projeto.modalidade === "Artes Cênicas" 
          ? "Projeto teatral inovador que visa promover a cultura local através de apresentações em espaços públicos, envolvendo artistas da região e promovendo o acesso democrático à arte."
          : "Projeto de dança contemporânea que busca integrar diferentes estilos e promover a expressão corporal como forma de arte e inclusão social na comunidade.",
        modalidade: projeto.modalidade,
        inicioExecucao: "Janeiro 2025",
        duracaoMeses: "6",
        terminoExecucao: "Junho 2025",
        orcamento: projeto.modalidade === "Artes Cênicas" ? "25000" : "18000"
      });
      setIsModalEdicaoAberto(true);
      toast({
        title: "Modo de edição ativo",
        description: `Editando projeto "${projeto.nome}".`,
      });
    } else {
      toast({
        title: "Projeto não editável",
        description: "Este projeto não pode ser editado no status atual.",
        variant: "destructive",
      });
    }
  };

  const handleVisualizarProjeto = (projeto: any) => {
    setProjetoSelecionado(projeto);
    setIsModalVisualizacaoAberto(true);
    toast({
      title: "Projeto carregado",
      description: `Exibindo detalhes do projeto "${projeto.nome}".`,
    });
  };

  const handleSalvarEdicao = () => {
    toast({
      title: "Projeto salvo!",
      description: `As alterações do projeto "${formEdicao.nome}" foram salvas com sucesso.`,
    });
    setIsModalEdicaoAberto(false);
  };

  const handleInputEdicaoChange = (field: string, value: string) => {
    setFormEdicao(prev => ({ ...prev, [field]: value }));
  };

  const handleVoltarPagina = () => {
    navigate(getUrl("dashboard"));
  };

  const handlePrestacaoContas = (projeto: any) => {
    navigate(getUrl(`prestacao-contas/${projeto.id}`));
    toast({
      title: "Prestação de Contas",
      description: `Acessando prestação de contas do projeto "${projeto.nome}".`,
    });
  };

  const handleLimparFiltros = () => {
    setSearchTerm("");
    setProgramaFilter("todos-programas");
    setAnoFilter("todos-anos");
    setStatusFilter("");
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
  };

  const handleFiltrarPorStatus = (status: string) => {
    setStatusFilter(status);
    const statusLabel = statusLabels[status as keyof typeof statusLabels] || status;
    toast({
      title: "Filtro aplicado",
      description: `Mostrando projetos com status: ${statusLabel}`,
    });
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col">
            <ProponenteHeader />
            <main className="flex-1 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Carregando projetos...</span>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col">
            <ProponenteHeader />
            <main className="flex-1 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="h-12 w-12 text-red-500 mx-auto mb-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "rascunho": return "yellow";
      case "aprovado": return "green";
      case "aguardando_avaliacao": return "yellow";
      case "em_avaliacao": return "orange";
      case "rejeitado": return "red";
      case "recebido": return "blue";
      case "em_execucao": return "purple";
      default: return "gray";
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  // Filtrar projetos
  const projetosFiltrados = projetos.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.edital_codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.edital_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || projeto.status === statusFilter;
    
    const matchesPrograma = programaFilter === "todos-programas" || 
                           projeto.edital_codigo === programaFilter;
    
    const matchesAno = anoFilter === "todos-anos" || 
                      new Date(projeto.data_submissao).getFullYear().toString() === anoFilter;
    
    return matchesSearch && matchesStatus && matchesPrograma && matchesAno;
  });
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <ProponenteHeader />
          <main className="flex-1 p-6">
            

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus projetos</h1>

            {/* Filtros */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center mb-4">
                {/* Dropdowns */}
                <div className="flex gap-4">
                  <div className="w-48">
                    <Select value={programaFilter} onValueChange={setProgramaFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Programa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos-programas">Todos os Programas</SelectItem>
                        {editaisUnicos.map((edital) => (
                          <SelectItem key={edital.id} value={edital.codigo}>
                            {edital.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-48">
                    <Select value={anoFilter} onValueChange={setAnoFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos-anos">Todos os Anos</SelectItem>
                        {anosUnicos.map((ano) => (
                          <SelectItem key={ano} value={ano}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Campo de busca */}
                <div className="flex gap-2 ml-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Pesquisar projetos" 
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600"
                    onClick={handleLimparFiltros}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button 
                    key={status.value}
                    variant="outline" 
                    size="sm"
                    className={`text-xs border-gray-300 hover:bg-gray-50 ${
                      statusFilter === status.value ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
                    }`}
                    onClick={() => handleFiltrarPorStatus(status.value)}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Lista de Projetos */}
            <div className="space-y-4">
              {projetosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {projetos.length === 0 ? "Nenhum projeto encontrado" : "Nenhum projeto corresponde aos filtros"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {projetos.length === 0 
                      ? "Você ainda não possui projetos cadastrados no sistema."
                      : "Tente ajustar os filtros para encontrar seus projetos."
                    }
                  </p>
                  <Button onClick={() => navigate(getUrl('nova-proposta'))}>
                    Criar Novo Projeto
                  </Button>
                </div>
              ) : (
                projetosFiltrados.map((projeto) => {
                  const statusColor = getStatusColor(projeto.status);
                  const statusText = getStatusText(projeto.status);
                  const isEditable = projeto.status === "recebido" || projeto.status === "rascunho";
                  
                  return (
                <Card 
                  key={projeto.id} 
                  className={`border-l-4 ${
                        statusColor === "yellow"
                      ? "border-l-yellow-500 bg-yellow-50"
                          : statusColor === "green" 
                      ? "border-l-green-500 bg-green-50" 
                          : statusColor === "orange"
                          ? "border-l-orange-500 bg-orange-50"
                          : statusColor === "red"
                          ? "border-l-red-500 bg-red-50"
                          : statusColor === "blue"
                          ? "border-l-blue-500 bg-blue-50"
                          : statusColor === "purple"
                          ? "border-l-purple-500 bg-purple-50"
                          : "border-l-gray-400 bg-gray-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="space-y-3">
                          <div>
                                <span className="text-xs text-gray-500 block">ID do Projeto</span>
                                <span className="font-mono text-sm font-medium">{projeto.id.substring(0, 8)}...</span>
                          </div>
                          <div>
                                <span className="text-xs text-gray-500 block">Data de Submissão</span>
                                <span className="text-sm">{new Date(projeto.data_submissao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div>
                                <span className="text-xs text-gray-500 block">Valor Solicitado</span>
                                <span className="text-sm font-medium">
                                  R$ {projeto.valor_solicitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs text-gray-500 block">Nome do projeto</span>
                            <span className="font-medium text-sm">{projeto.nome}</span>
                          </div>
                          <div>
                                <span className="text-xs text-gray-500 block">Edital</span>
                                <span className="text-sm">{projeto.edital_nome}</span>
                          </div>
                          <div>
                                <span className="text-xs text-gray-500 block">Código do Edital</span>
                                <span className="text-sm">{projeto.edital_codigo}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 ml-4">
                        <Badge
                          variant="outline"
                          className={`text-xs px-3 py-1 ${
                                statusColor === "green"
                              ? "bg-green-100 text-green-800 border-green-300"
                                  : statusColor === "yellow"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                  : statusColor === "orange"
                                  ? "bg-orange-100 text-orange-800 border-orange-300"
                                  : statusColor === "red"
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : statusColor === "blue"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : statusColor === "purple"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : "bg-gray-100 text-gray-800 border-gray-300"
                              }`}
                            >
                              {statusText}
                        </Badge>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => {
                                  if (isEditable) {
                                handleEditarProjeto(projeto);
                              } else {
                                handleVisualizarProjeto(projeto);
                              }
                            }}
                          >
                                {projeto.status === "rascunho" ? (
                                  <><Edit className="h-4 w-4 mr-1" /> Continuar</>
                            ) : isEditable ? (
                                  <><Edit className="h-4 w-4 mr-1" /> Editar</>
                            ) : (
                                  <><Eye className="h-4 w-4 mr-1" /> Visualizar</>
                            )}
                          </Button>
                              {projeto.status === "aprovado" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => handlePrestacaoContas(projeto)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Prestação de Contas
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  );
                })
              )}
            </div>

            {/* Modal de Visualização do Projeto */}
            <Dialog open={isModalVisualizacaoAberto} onOpenChange={setIsModalVisualizacaoAberto}>
                  <DialogContent className="w-[90vw] h-[85vh] max-w-none flex flex-col">
                <DialogHeader className="pb-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        {projetoSelecionado?.nome}
                      </DialogTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span><strong>Edital:</strong> {projetoSelecionado?.edital_nome}</span>
                        <span><strong>Status:</strong> 
                          <Badge className={`ml-2 ${
                            projetoSelecionado?.status === "aprovado" ? "bg-green-100 text-green-800" :
                            projetoSelecionado?.status === "aguardando_avaliacao" ? "bg-yellow-100 text-yellow-800" :
                            projetoSelecionado?.status === "em_avaliacao" ? "bg-orange-100 text-orange-800" :
                            projetoSelecionado?.status === "rejeitado" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {getStatusText(projetoSelecionado?.status || '')}
                          </Badge>
                        </span>
                        <span><strong>Valor:</strong> R$ {projetoSelecionado?.valor_solicitado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Submetido em: {projetoSelecionado?.data_submissao ? new Date(projetoSelecionado.data_submissao).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>
                </DialogHeader>
                
                {projetoSelecionado && (
                  <Tabs defaultValue="proponente" className="w-full flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-8 bg-gray-50 p-1 rounded-lg flex-shrink-0">
                      <TabsTrigger value="proponente" className="text-xs">👤 Proponente</TabsTrigger>
                      <TabsTrigger value="projeto" className="text-xs">📋 Projeto</TabsTrigger>
                      <TabsTrigger value="publico" className="text-xs">👥 Público</TabsTrigger>
                      <TabsTrigger value="acessibilidade" className="text-xs">♿ Acessibilidade</TabsTrigger>
                      <TabsTrigger value="execucao" className="text-xs">⚡ Execução</TabsTrigger>
                      <TabsTrigger value="equipe" className="text-xs">👥 Equipe</TabsTrigger>
                      <TabsTrigger value="cronograma" className="text-xs">📅 Cronograma</TabsTrigger>
                      <TabsTrigger value="orcamento" className="text-xs">💰 Orçamento</TabsTrigger>
                    </TabsList>

                    {/* Aba: Proponente */}
                    <TabsContent value="proponente" className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            👤 Dados do Proponente
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-600">📝</span>
                                <span className="text-sm font-semibold text-gray-700">Nome</span>
                              </div>
                              <p className="text-gray-900 font-medium">{projetoSelecionado.proponente_nome || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-600">🏢</span>
                                <span className="text-sm font-semibold text-gray-700">Tipo</span>
                              </div>
                              <p className="text-gray-900 font-medium">{projetoSelecionado.proponente_tipo || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-600">🆔</span>
                                <span className="text-sm font-semibold text-gray-700">CPF/CNPJ</span>
                              </div>
                              <p className="text-gray-900 font-medium">{projetoSelecionado.proponente_cpf_cnpj || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-600">📍</span>
                                <span className="text-sm font-semibold text-gray-700">Cidade</span>
                              </div>
                              <p className="text-gray-900 font-medium">{projetoSelecionado.proponente_cidade || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-600">📞</span>
                                <span className="text-sm font-semibold text-gray-700">Telefone</span>
                              </div>
                              <p className="text-gray-900 font-medium">{projetoSelecionado.proponente_telefone || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-600">📊</span>
                                <span className="text-sm font-semibold text-gray-700">Status</span>
                              </div>
                              <Badge className={`${
                                projetoSelecionado.status === "aprovado" ? "bg-green-100 text-green-800" :
                                projetoSelecionado.status === "aguardando_avaliacao" ? "bg-yellow-100 text-yellow-800" :
                                projetoSelecionado.status === "em_avaliacao" ? "bg-orange-100 text-orange-800" :
                                projetoSelecionado.status === "rejeitado" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {getStatusText(projetoSelecionado.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba: Dados do Projeto */}
                    <TabsContent value="projeto" className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Dados do Projeto</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                              <span className="text-sm font-medium text-gray-600">Nome do Projeto</span>
                              <p className="text-sm font-medium text-gray-900">{projetoSelecionado.nome}</p>
                        </div>
                        <div>
                              <span className="text-sm font-medium text-gray-600">Categoria</span>
                              <p className="text-sm text-gray-900">{projetoSelecionado.modalidade || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Edital</span>
                              <p className="text-sm text-gray-900">{projetoSelecionado.edital_nome}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                              <span className="text-sm font-medium text-gray-600">Código do Edital</span>
                              <p className="text-sm text-gray-900">{projetoSelecionado.edital_codigo}</p>
                        </div>
                        <div>
                              <span className="text-sm font-medium text-gray-600">Data de Submissão</span>
                              <p className="text-sm text-gray-900">{new Date(projetoSelecionado.data_submissao).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                              <span className="text-sm font-medium text-gray-600">Valor Solicitado</span>
                              <p className="text-sm font-bold text-green-600">
                                R$ {projetoSelecionado.valor_solicitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-600">Descrição do Projeto</span>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                              {projetoSelecionado.descricao || 'Descrição não disponível'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                          <span className="text-sm font-medium text-gray-600">Objetivos</span>
                      <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.objetivos || 'Objetivos não disponíveis'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <span className="text-sm font-medium text-gray-600">Metas</span>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              Metas não especificadas
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba: Público Alvo */}
                    <TabsContent value="publico" className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Público Alvo</h3>
                        
                        <div className="space-y-3">
                          <span className="text-sm font-medium text-gray-600">Perfil do público a ser atingido</span>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.perfil_publico || 'Informação não disponível'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <span className="text-sm font-medium text-gray-600">Ação voltada prioritariamente para</span>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.publico_prioritario?.join(', ') || 'Informação não disponível'}
                            </p>
                            {projetoSelecionado.outro_publico_prioritario && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Outro:</strong> {projetoSelecionado.outro_publico_prioritario}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba: Acessibilidade */}
                    <TabsContent value="acessibilidade" className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Acessibilidade</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Acessibilidade Arquitetônica</h4>
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.acessibilidade_arquitetonica?.join(', ') || 'Não especificado'}
                            </p>
                            {projetoSelecionado.outra_acessibilidade_arquitetonica && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Outro:</strong> {projetoSelecionado.outra_acessibilidade_arquitetonica}
                              </p>
                            )}
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Acessibilidade Comunicacional</h4>
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.acessibilidade_comunicacional?.join(', ') || 'Não especificado'}
                            </p>
                            {projetoSelecionado.outra_acessibilidade_comunicacional && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Outro:</strong> {projetoSelecionado.outra_acessibilidade_comunicacional}
                              </p>
                            )}
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Acessibilidade Atitudinal</h4>
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.acessibilidade_atitudinal?.join(', ') || 'Não especificado'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <span className="text-sm font-medium text-gray-600">Como essas medidas serão implementadas?</span>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.implementacao_acessibilidade || 'Não especificado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba: Execução do Projeto */}
                    <TabsContent value="execucao" className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Execução do Projeto</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <span className="text-sm font-medium text-gray-600">Local de Execução</span>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                {projetoSelecionado.local_execucao || 'Local não especificado'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <span className="text-sm font-medium text-gray-600">Data de início</span>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                {projetoSelecionado.data_inicio ? new Date(projetoSelecionado.data_inicio).toLocaleDateString('pt-BR') : 'Não definido'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <span className="text-sm font-medium text-gray-600">Data final</span>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.data_final ? new Date(projetoSelecionado.data_final).toLocaleDateString('pt-BR') : 'Não definido'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-sm font-medium text-gray-600">Estratégia de divulgação</span>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {projetoSelecionado.estrategia_divulgacao || 'Estratégia não especificada'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba: Equipe do Projeto */}
                    <TabsContent value="equipe" className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Equipe do Projeto</h3>
                        {projetoSelecionado.equipe && projetoSelecionado.equipe.length > 0 ? (
                          <div className="space-y-4">
                            {projetoSelecionado.equipe.map((membro, index) => (
                              <div key={membro.id || index} className="p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                                    <span className="text-sm font-medium text-gray-600">Nome Completo</span>
                                    <p className="text-sm text-gray-900">{membro.nome}</p>
                          </div>
                          <div>
                                    <span className="text-sm font-medium text-gray-600">Função no Projeto</span>
                                    <p className="text-sm text-gray-900">{membro.funcao}</p>
                          </div>
                          <div>
                                    <span className="text-sm font-medium text-gray-600">CPF/CNPJ</span>
                                    <p className="text-sm text-gray-900">{membro.cpf_cnpj}</p>
                          </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-600">Características</span>
                                    <p className="text-sm text-gray-900">{membro.caracteristicas?.join(', ') || 'N/A'}</p>
                        </div>
                      </div>
                                <div className="mt-3">
                                  <span className="text-sm font-medium text-gray-600">Mini Currículo</span>
                                  <p className="text-sm text-gray-700 mt-1">{membro.mini_curriculo}</p>
                    </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Nenhum membro da equipe cadastrado</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Aba: Cronograma de Atividades */}
                    <TabsContent value="cronograma" className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            📅 Cronograma de Atividades
                          </h3>
                          {projetoSelecionado.cronograma && projetoSelecionado.cronograma.length > 0 ? (
                            <div className="space-y-4">
                              {projetoSelecionado.cronograma.map((atividade, index) => (
                                <div key={atividade.id || index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                        {atividade.ordem + 1}
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{atividade.nome_atividade}</h4>
                                        <p className="text-sm text-purple-600 font-medium">{atividade.etapa}</p>
                                      </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                      <p><strong>Início:</strong> {atividade.data_inicio ? new Date(atividade.data_inicio).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                      <p><strong>Fim:</strong> {atividade.data_fim ? new Date(atividade.data_fim).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Descrição da Atividade</h5>
                                    <p className="text-gray-700 leading-relaxed">{atividade.descricao}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📅</span>
                              </div>
                              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade cadastrada</h4>
                              <p className="text-gray-500">O cronograma ainda não foi preenchido para este projeto.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba: Planilha Orçamentária */}
                    <TabsContent value="orcamento" className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            💰 Planilha Orçamentária
                          </h3>
                        
                        {/* Recursos Financeiros de Outras Fontes */}
                        <div className="space-y-4">
                          <h4 className="text-md font-semibold text-gray-800">Recursos Financeiros de Outras Fontes</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-600">O projeto possui outras fontes de financiamento?</span>
                              <p className="text-sm text-gray-900 mt-1">
                                {projetoSelecionado.outras_fontes ? 'Sim' : 'Não'}
                              </p>
                        </div>
                            {projetoSelecionado.outras_fontes && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-600">Quais outras fontes?</span>
                                <p className="text-sm text-gray-900 mt-1">
                                  {projetoSelecionado.tipos_outras_fontes?.join(', ') || 'N/A'}
                                </p>
                              </div>
                            )}
                          </div>
                          {projetoSelecionado.detalhes_outras_fontes && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-600">Detalhe as fontes e valores</span>
                              <p className="text-sm text-gray-700 mt-1">{projetoSelecionado.detalhes_outras_fontes}</p>
                            </div>
                          )}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">O projeto prevê venda de produtos/ingressos?</span>
                            <p className="text-sm text-gray-900 mt-1">
                              {projetoSelecionado.venda_produtos ? 'Sim' : 'Não'}
                            </p>
                            {projetoSelecionado.detalhes_venda_produtos && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-600">Detalhe produtos, quantidades, valores e aplicação dos recursos</span>
                                <p className="text-sm text-gray-700 mt-1">{projetoSelecionado.detalhes_venda_produtos}</p>
                              </div>
                            )}
                      </div>
                    </div>
                        
                        {/* Itens de Despesa */}
                        <div className="space-y-4">
                          <h4 className="text-md font-semibold text-gray-800">Itens de Despesa</h4>
                          {projetoSelecionado.itens_orcamento && projetoSelecionado.itens_orcamento.length > 0 ? (
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Cabeçalho da tabela */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                              <div className="grid grid-cols-8 gap-4 text-sm font-semibold text-gray-700">
                                <div>📝 Descrição</div>
                                <div>📋 Justificativa</div>
                                <div>📏 Unidade</div>
                                <div>💰 Valor Unit.</div>
                                <div>🔢 Qtd</div>
                                <div>💵 Total</div>
                                <div>📄 Referência</div>
                                <div>⚙️ Ações</div>
                              </div>
                            </div>
                            
                            <div className="divide-y divide-gray-200">
                              {projetoSelecionado.itens_orcamento.map((item, index) => (
                                <div key={item.id || index} className="grid grid-cols-8 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                  <div className="text-gray-900 font-medium">{item.descricao}</div>
                                  <div className="text-gray-700 text-sm">{item.justificativa}</div>
                                  <div className="text-gray-700">{item.unidade_medida}</div>
                                  <div className="text-gray-700 font-medium">
                                    R$ {item.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-gray-700 font-medium">{item.quantidade}</div>
                                  <div className="text-green-600 font-bold text-lg">
                                    R$ {(item.valor_unitario * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-gray-500 text-sm">{item.referencia_preco || '-'}</div>
                                  <div className="text-gray-400">-</div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Resumo do Orçamento */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-t border-gray-200">
                              <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                                📊 Resumo do Orçamento
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-green-600">📦</span>
                                    <span className="text-sm font-semibold text-green-700">Total de Itens</span>
                                  </div>
                                  <p className="text-2xl font-bold text-green-800">{projetoSelecionado.itens_orcamento.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-green-600">💰</span>
                                    <span className="text-sm font-semibold text-green-700">Valor Total</span>
                                  </div>
                                  <p className="text-2xl font-bold text-green-800">
                                    R$ {projetoSelecionado.itens_orcamento.reduce((total, item) => 
                                      total + (item.valor_unitario * item.quantidade), 0
                                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-green-600">🎯</span>
                                    <span className="text-sm font-semibold text-green-700">Valor Solicitado</span>
                                  </div>
                                  <p className="text-2xl font-bold text-green-800">
                                    R$ {projetoSelecionado.valor_solicitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Nenhum item de orçamento cadastrado</p>
                          </div>
                        )}
                        </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Botões de Ação */}
                    {projetoSelecionado.status === "rascunho" && (
                      <div className="flex gap-4 pt-6 border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <Button 
                          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setIsModalVisualizacaoAberto(false);
                            handleEditarProjeto(projetoSelecionado);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Projeto
                        </Button>
                      </div>
                    )}
                  </Tabs>
                )}
              </DialogContent>
            </Dialog>

            {/* Modal de Edição do Projeto */}
            <Dialog open={isModalEdicaoAberto} onOpenChange={setIsModalEdicaoAberto}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Projeto - {projetoSelecionado?.nome}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-nome">Nome do Projeto *</Label>
                        <Input
                          id="edit-nome"
                          value={formEdicao.nome}
                          onChange={(e) => handleInputEdicaoChange("nome", e.target.value)}
                          placeholder="Nome do projeto"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-modalidade">Modalidade *</Label>
                        <Select 
                          value={formEdicao.modalidade} 
                          onValueChange={(value) => handleInputEdicaoChange("modalidade", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Artes Cênicas">Artes Cênicas</SelectItem>
                            <SelectItem value="Dança">Dança</SelectItem>
                            <SelectItem value="Música">Música</SelectItem>
                            <SelectItem value="Artes Visuais">Artes Visuais</SelectItem>
                            <SelectItem value="Literatura">Literatura</SelectItem>
                            <SelectItem value="Cinema e Audiovisual">Cinema e Audiovisual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-orcamento">Orçamento Solicitado *</Label>
                        <Input
                          id="edit-orcamento"
                          type="number"
                          value={formEdicao.orcamento}
                          onChange={(e) => handleInputEdicaoChange("orcamento", e.target.value)}
                          placeholder="Valor em reais"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-inicio">Início da Execução</Label>
                        <Input
                          id="edit-inicio"
                          value={formEdicao.inicioExecucao}
                          onChange={(e) => handleInputEdicaoChange("inicioExecucao", e.target.value)}
                          placeholder="Ex: Janeiro 2025"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-duracao">Duração (meses)</Label>
                        <Input
                          id="edit-duracao"
                          type="number"
                          value={formEdicao.duracaoMeses}
                          onChange={(e) => handleInputEdicaoChange("duracaoMeses", e.target.value)}
                          placeholder="Duração em meses"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-termino">Término da Execução</Label>
                        <Input
                          id="edit-termino"
                          value={formEdicao.terminoExecucao}
                          onChange={(e) => handleInputEdicaoChange("terminoExecucao", e.target.value)}
                          placeholder="Ex: Junho 2025"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Descrição do Projeto */}
                  <div className="space-y-3">
                    <Label htmlFor="edit-descricao">Descrição do Projeto *</Label>
                    <Textarea
                      id="edit-descricao"
                      value={formEdicao.descricao}
                      onChange={(e) => handleInputEdicaoChange("descricao", e.target.value)}
                      placeholder="Descreva detalhadamente seu projeto cultural..."
                      rows={6}
                    />
                  </div>

                  {/* Informações Não Editáveis */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Informações do Edital</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Número da Inscrição:</span>
                        <p className="font-mono">{projetoSelecionado?.numeroInscricao}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Edital:</span>
                        <p>{projetoSelecionado?.edital}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Proponente:</span>
                        <p>{projetoSelecionado?.proponente}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Ano:</span>
                        <p>{projetoSelecionado?.ano}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalEdicaoAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSalvarEdicao}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!formEdicao.nome || !formEdicao.descricao || !formEdicao.modalidade || !formEdicao.orcamento}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MeusProjetos;