import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, ArrowLeft, ChevronDown, Eye, Edit, Save, FileText } from "lucide-react";

const projetos = [
  {
    id: 1,
    numeroInscricao: "08/2025-1756.7345.5351",
    nome: "Projeto PNAB - Teatro",
    edital: "EDITAL PNAB - CULTURA JAÚ",
    modalidade: "Artes Cênicas",
    proponente: "Ativar Produções LTDA",
    status: "Projetos em Edição",
    ano: "2025",
    programa: "PNAB 1",
    statusColor: "gray",
    buttonText: "Editar"
  },
  {
    id: 2,
    numeroInscricao: "07/2025-1756.8912.3348",
    nome: "Projeto PNAB - Dança", 
    edital: "EDITAL PNAB - CULTURA JAÚ",
    modalidade: "Dança",
    proponente: "Ativar Produções LTDA",
    status: "Aprovado",
    ano: "2025",
    programa: "PNAB 2",
    statusColor: "green",
    buttonText: "Visualizar"
  }
];

const statusOptions = [
  "Projetos em Edição",
  "Inscritos", 
  "Aprovado",
  "Reprovado",
  "Indeferido"
];

const MeusProjetos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [programaFilter, setProgramaFilter] = useState("todos-programas");
  const [anoFilter, setAnoFilter] = useState("todos-anos");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalVisualizacaoAberto, setIsModalVisualizacaoAberto] = useState(false);
  const [isModalEdicaoAberto, setIsModalEdicaoAberto] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<any>(null);
  
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
    if (projeto.status === "Projetos em Edição") {
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
    navigate("/dashboard");
  };

  const handlePrestacaoContas = (projeto: any) => {
    navigate(`/prestacao-contas/${projeto.id}`);
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
    toast({
      title: "Filtro aplicado",
      description: `Mostrando projetos com status: ${status}`,
    });
  };

  // Carrega rascunhos locais
  const rascunhos: any[] = JSON.parse(localStorage.getItem('rascunhosProjetos') || '[]');
  const todosProjetos = [...rascunhos, ...projetos];

  // Filtrar projetos
  const projetosFiltrados = todosProjetos.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.numeroInscricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrograma = programaFilter === "todos-programas" || projeto.programa === programaFilter;
    const matchesAno = anoFilter === "todos-anos" || projeto.ano === anoFilter;
    const matchesStatus = !statusFilter || projeto.status === statusFilter;
    
    return matchesSearch && matchesPrograma && matchesAno && matchesStatus;
  });
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
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
                        <SelectItem value="PNAB 1">PNAB 1</SelectItem>
                        <SelectItem value="PNAB 2">PNAB 2</SelectItem>
                        <SelectItem value="PNAB 3">PNAB 3</SelectItem>
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
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
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
                    key={status}
                    variant="outline" 
                    size="sm"
                    className={`text-xs border-gray-300 hover:bg-gray-50 ${
                      statusFilter === status ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
                    }`}
                    onClick={() => handleFiltrarPorStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Lista de Projetos */}
            <div className="space-y-4">
              {projetosFiltrados.map((projeto) => (
                <Card 
                  key={projeto.id} 
                  className={`border-l-4 ${
                    projeto.statusColor === "green" 
                      ? "border-l-green-500 bg-green-50" 
                      : projeto.statusColor === "gray"
                      ? "border-l-gray-400 bg-gray-50"
                      : "border-l-purple-500 bg-purple-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs text-gray-500 block">Nº da inscrição</span>
                            <span className="font-mono text-sm font-medium">{projeto.numeroInscricao}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Ano</span>
                            <span className="text-sm">{projeto.ano}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Proponente</span>
                            <span className="text-sm">{projeto.proponente}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs text-gray-500 block">Nome do projeto</span>
                            <span className="font-medium text-sm">{projeto.nome}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Título do edital</span>
                            <span className="text-sm">{projeto.edital}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Modalidade</span>
                            <span className="text-sm">{projeto.modalidade}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 ml-4">
                        <Badge
                          variant="outline"
                          className={`text-xs px-3 py-1 ${
                            projeto.statusColor === "green"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : projeto.statusColor === "gray"
                              ? "bg-gray-100 text-gray-800 border-gray-300"
                              : "bg-purple-100 text-purple-800 border-purple-300"
                          }`}
                        >
                          {projeto.status}
                        </Badge>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => {
                              if (projeto.buttonText === "Editar") {
                                handleEditarProjeto(projeto);
                              } else {
                                handleVisualizarProjeto(projeto);
                              }
                            }}
                          >
                            {projeto.buttonText === "Editar" ? (
                              <><Edit className="h-4 w-4 mr-1" /> {projeto.buttonText}</>
                            ) : (
                              <><Eye className="h-4 w-4 mr-1" /> {projeto.buttonText}</>
                            )}
                          </Button>
                          {projeto.status === "Aprovado" && (
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
              ))}
            </div>

            {/* Modal de Visualização do Projeto */}
            <Dialog open={isModalVisualizacaoAberto} onOpenChange={setIsModalVisualizacaoAberto}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detalhes do Projeto - {projetoSelecionado?.nome}</DialogTitle>
                </DialogHeader>
                
                {projetoSelecionado && (
                  <div className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Número da Inscrição</span>
                          <p className="font-mono text-sm">{projetoSelecionado.numeroInscricao}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Nome do Projeto</span>
                          <p className="font-medium">{projetoSelecionado.nome}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Edital</span>
                          <p className="text-sm">{projetoSelecionado.edital}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Modalidade</span>
                          <p className="text-sm">{projetoSelecionado.modalidade}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Proponente</span>
                          <p className="text-sm">{projetoSelecionado.proponente}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Status</span>
                          <Badge 
                            className={`${
                              projetoSelecionado.statusColor === "green"
                                ? "bg-green-100 text-green-800"
                                : projetoSelecionado.statusColor === "gray"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {projetoSelecionado.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Descrição do Projeto */}
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-600">Descrição do Projeto</span>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {projetoSelecionado.modalidade === "Artes Cênicas" 
                            ? "Projeto teatral inovador que visa promover a cultura local através de apresentações em espaços públicos, envolvendo artistas da região e promovendo o acesso democrático à arte."
                            : "Projeto de dança contemporânea que busca integrar diferentes estilos e promover a expressão corporal como forma de arte e inclusão social na comunidade."
                          }
                        </p>
                      </div>
                    </div>

                    {/* Cronograma */}
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-600">Cronograma de Execução</span>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Início:</span>
                            <p>Janeiro 2025</p>
                          </div>
                          <div>
                            <span className="font-medium">Duração:</span>
                            <p>6 meses</p>
                          </div>
                          <div>
                            <span className="font-medium">Término:</span>
                            <p>Junho 2025</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Orçamento */}
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-600">Orçamento Solicitado</span>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {projetoSelecionado.modalidade === "Artes Cênicas" ? "25.000,00" : "18.000,00"}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Valor total solicitado para execução do projeto
                        </p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-4 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsModalVisualizacaoAberto(false)}
                        className="flex-1"
                      >
                        Fechar
                      </Button>
                      {projetoSelecionado.status === "Projetos em Edição" && (
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setIsModalVisualizacaoAberto(false);
                            handleEditarProjeto(projetoSelecionado);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Projeto
                        </Button>
                      )}
                    </div>
                  </div>
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