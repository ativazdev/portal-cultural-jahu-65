import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Search,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Building2,
  Clock,
  X,
  Download,
  Filter
} from "lucide-react";

interface Prestacao {
  id: string;
  projeto: string;
  categoria: string;
  proponente: string;
  tipo: string;
  valor: number;
  dataEntrega: string;
  prazo: string;
  status: string;
  openBanking: "conforme" | "alerta" | "irregularidade" | "nao-monitorado";
}

interface StatusCard {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

export const PrestacoesAdminMain = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [prazoFilter, setPrazoFilter] = useState("todos");
  const [selectedPrestacoes, setSelectedPrestacoes] = useState<string[]>([]);
  const [selectedPrestacao, setSelectedPrestacao] = useState<Prestacao | null>(null);
  const [isAnaliseModalOpen, setIsAnaliseModalOpen] = useState(false);
  const [isCorrecoesModalOpen, setIsCorrecoesModalOpen] = useState(false);
  const [isOpenBankingModalOpen, setIsOpenBankingModalOpen] = useState(false);

  const statusCards: StatusCard[] = [
    {
      title: "Prestações Recebidas",
      value: "28",
      subtitle: "Aguardando análise",
      color: "blue",
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Em Análise",
      value: "12",
      subtitle: "Sendo verificadas",
      color: "orange",
      icon: <Search className="h-6 w-6" />
    },
    {
      title: "Prestações Aprovadas",
      value: "45",
      subtitle: "Contas aceitas",
      color: "green",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: "Com Pendências",
      value: "8",
      subtitle: "Precisam correções",
      color: "red",
      icon: <AlertTriangle className="h-6 w-6" />
    }
  ];

  const prestacoes: Prestacao[] = [
    {
      id: "1",
      projeto: "Projeto PNAB - Teatro",
      categoria: "Artes Cênicas",
      proponente: "Ativar Produções LTDA",
      tipo: "PJ",
      valor: 25000,
      dataEntrega: "15/11/2024",
      prazo: "5 dias",
      status: "Recebida",
      openBanking: "conforme"
    },
    {
      id: "2",
      projeto: "Projeto PNAB - Dança",
      categoria: "Dança",
      proponente: "Ativar Produções LTDA",
      tipo: "PJ",
      valor: 18000,
      dataEntrega: "10/11/2024",
      prazo: "Atrasado",
      status: "Em Análise",
      openBanking: "alerta"
    },
    {
      id: "3",
      projeto: "Festival de Música Popular",
      categoria: "Música",
      proponente: "João Silva",
      tipo: "PF",
      valor: 30000,
      dataEntrega: "08/11/2024",
      prazo: "Aprovada",
      status: "Aprovada",
      openBanking: "conforme"
    },
    {
      id: "4",
      projeto: "Arte Urbana",
      categoria: "Artes Visuais",
      proponente: "Coletivo Arte",
      tipo: "PJ",
      valor: 22000,
      dataEntrega: "20/11/2024",
      prazo: "15 dias",
      status: "Com Pendências",
      openBanking: "irregularidade"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recebida": return "bg-blue-100 text-blue-800";
      case "Em Análise": return "bg-orange-100 text-orange-800";
      case "Aprovada": return "bg-green-100 text-green-800";
      case "Com Pendências": return "bg-red-100 text-red-800";
      case "Atrasada": return "bg-red-200 text-red-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getOpenBankingIcon = (status: string) => {
    switch (status) {
      case "conforme": return <span className="text-green-600">✅</span>;
      case "alerta": return <span className="text-yellow-600">⚠️</span>;
      case "irregularidade": return <span className="text-red-600">❌</span>;
      case "nao-monitorado": return <span className="text-gray-400">➖</span>;
      default: return <span className="text-gray-400">➖</span>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCardColor = (color: string) => {
    switch (color) {
      case "blue": return "border-l-4 border-l-blue-500 bg-blue-50";
      case "orange": return "border-l-4 border-l-orange-500 bg-orange-50";
      case "green": return "border-l-4 border-l-green-500 bg-green-50";
      case "red": return "border-l-4 border-l-red-500 bg-red-50";
      default: return "border-l-4 border-l-gray-500 bg-gray-50";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "orange": return "text-orange-600";
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const handleSelectPrestacao = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPrestacoes([...selectedPrestacoes, id]);
    } else {
      setSelectedPrestacoes(selectedPrestacoes.filter(item => item !== id));
    }
  };

  const handleAnaliseClick = (prestacao: Prestacao) => {
    setSelectedPrestacao(prestacao);
    setIsAnaliseModalOpen(true);
  };

  const handleCorrecoesClick = (prestacao: Prestacao) => {
    setSelectedPrestacao(prestacao);
    setIsCorrecoesModalOpen(true);
  };

  // Novas funções para ações dos botões
  const handleAprovarPrestacao = (prestacao: Prestacao) => {
    toast({
      title: "Prestação aprovada!",
      description: `A prestação do projeto "${prestacao.projeto}" foi aprovada com sucesso.`,
    });
  };

  const handleOpenBanking = (prestacao: Prestacao) => {
    setSelectedPrestacao(prestacao);
    setIsOpenBankingModalOpen(true);
  };

  // Ações em lote
  const handleAprovarSelecionadas = () => {
    toast({
      title: `${selectedPrestacoes.length} prestações aprovadas!`,
      description: "As prestações selecionadas foram aprovadas com sucesso.",
    });
    setSelectedPrestacoes([]);
  };

  const handleMarcarEmAnalise = () => {
    toast({
      title: `${selectedPrestacoes.length} prestações em análise!`,
      description: "As prestações selecionadas foram marcadas como em análise.",
    });
    setSelectedPrestacoes([]);
  };

  const handleExportarSelecionadas = () => {
    toast({
      title: "Exportação iniciada!",
      description: `Exportando ${selectedPrestacoes.length} prestações selecionadas.`,
    });
  };

  // Ações dos relatórios
  const handleRelatorioConformidade = () => {
    toast({
      title: "Relatório de Conformidade",
      description: "Gerando relatório de conformidade das prestações...",
    });
  };

  const handleExportarPrestacoes = () => {
    toast({
      title: "Exportação iniciada!",
      description: "Exportando todas as prestações de contas...",
    });
  };

  const handleRelatorioOpenBanking = () => {
    navigate("/openbanking-admin");
  };

  // Ações do modal de análise
  const handleSalvarAnalise = () => {
    toast({
      title: "Análise salva!",
      description: "A análise técnica foi salva com sucesso.",
    });
  };

  const handleAprovarPrestacaoModal = () => {
    toast({
      title: "Prestação aprovada!",
      description: `A prestação do projeto "${selectedPrestacao?.projeto}" foi aprovada.`,
    });
    setIsAnaliseModalOpen(false);
  };

  const handleSolicitarCorrecoes = () => {
    setIsAnaliseModalOpen(false);
    setIsCorrecoesModalOpen(true);
  };

  const handleRejeitarPrestacao = () => {
    toast({
      title: "Prestação rejeitada!",
      description: `A prestação do projeto "${selectedPrestacao?.projeto}" foi rejeitada.`,
      variant: "destructive",
    });
    setIsAnaliseModalOpen(false);
  };

  // Ação do modal de correções
  const handleEnviarSolicitacao = () => {
    toast({
      title: "Solicitação enviada!",
      description: "A solicitação de correções foi enviada ao proponente.",
    });
    setIsCorrecoesModalOpen(false);
  };

  const filteredPrestacoes = prestacoes.filter(prestacao => {
    const matchesSearch = prestacao.projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prestacao.proponente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || prestacao.status === statusFilter;
    const matchesPrazo = prazoFilter === "todos" || 
                        (prazoFilter === "atrasadas" && prestacao.prazo === "Atrasado") ||
                        (prazoFilter === "vencendo" && prestacao.prazo.includes("dias")) ||
                        (prazoFilter === "no-prazo" && !prestacao.prazo.includes("Atrasado") && prestacao.prazo !== "Aprovada");
    
    return matchesSearch && matchesStatus && matchesPrazo;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-prefeitura-primary">
            Prestações de Contas
          </h1>
          <p className="text-prefeitura-muted">
            Analise e valide as prestações de contas dos projetos
          </p>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card, index) => (
          <Card key={index} className={getCardColor(card.color)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>
                <div className={getIconColor(card.color)}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por projeto ou proponente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Recebida">Recebidas</SelectItem>
                <SelectItem value="Em Análise">Em Análise</SelectItem>
                <SelectItem value="Aprovada">Aprovadas</SelectItem>
                <SelectItem value="Com Pendências">Com Pendências</SelectItem>
                <SelectItem value="Atrasada">Atrasadas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={prazoFilter} onValueChange={setPrazoFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="no-prazo">No prazo</SelectItem>
                <SelectItem value="vencendo">Vencendo (7 dias)</SelectItem>
                <SelectItem value="atrasadas">Atrasadas</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("todos");
                setPrazoFilter("todos");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações em Lote */}
      {selectedPrestacoes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedPrestacoes.length} selecionada(s)
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAprovarSelecionadas}
                >
                  Aprovar Selecionadas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarcarEmAnalise}
                >
                  Marcar como Em Análise
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportarSelecionadas}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Selecionadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Prestações */}
      <Card>
        <CardHeader>
          <CardTitle>Prestações de Contas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Proponente</TableHead>
                  <TableHead>Valor do Projeto</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Open Banking</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrestacoes.map((prestacao) => (
                  <TableRow key={prestacao.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPrestacoes.includes(prestacao.id)}
                        onCheckedChange={(checked) => 
                          handleSelectPrestacao(prestacao.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{prestacao.projeto}</div>
                        <Badge variant="secondary" className="text-xs">
                          {prestacao.categoria}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{prestacao.proponente}</div>
                        <Badge variant="outline" className="text-xs">
                          {prestacao.tipo}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(prestacao.valor)}
                    </TableCell>
                    <TableCell>{prestacao.dataEntrega}</TableCell>
                    <TableCell>
                      <span className={prestacao.prazo === "Atrasado" ? "text-red-600 font-medium" : ""}>
                        {prestacao.prazo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(prestacao.status)}>
                        {prestacao.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {getOpenBankingIcon(prestacao.openBanking)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAnaliseClick(prestacao)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {prestacao.status === "Recebida" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600"
                            onClick={() => handleAprovarPrestacao(prestacao)}
                            title="Aprovar prestação"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600"
                          onClick={() => handleCorrecoesClick(prestacao)}
                          title="Solicitar correções"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600"
                          onClick={() => handleOpenBanking(prestacao)}
                          title="Ver Open Banking"
                        >
                          <Building2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios de Prestação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline"
              onClick={handleRelatorioConformidade}
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatório de Conformidade
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportarPrestacoes}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Prestações
            </Button>
            <Button 
              variant="outline"
              onClick={handleRelatorioOpenBanking}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Relatório Open Banking
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Análise Completa */}
      <Dialog open={isAnaliseModalOpen} onOpenChange={setIsAnaliseModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análise Completa - {selectedPrestacao?.projeto}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="relatorio" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="relatorio">Relatório de Execução</TabsTrigger>
              <TabsTrigger value="comprovantes">Comprovantes</TabsTrigger>
              <TabsTrigger value="openbanking">Open Banking</TabsTrigger>
              <TabsTrigger value="analise">Análise Técnica</TabsTrigger>
            </TabsList>
            
            <TabsContent value="relatorio" className="space-y-4">
              {selectedPrestacao && (
                <div className="space-y-6">
                  {/* 1. Dados do Projeto */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3 text-blue-600">1. Dados do Projeto</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Nome do projeto</Label>
                        <p className="mt-1">{selectedPrestacao.projeto}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Nome do agente cultural proponente</Label>
                        <p className="mt-1">{selectedPrestacao.proponente}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Nº do Termo de Execução Cultural</Label>
                        <p className="mt-1">TEC-2025-{selectedPrestacao.id.padStart(3, '0')}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Vigência do projeto</Label>
                        <p className="mt-1">01/01/2025 a 31/12/2025</p>
                      </div>
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Valor repassado</Label>
                        <p className="mt-1 text-green-600 font-medium">{formatCurrency(selectedPrestacao.valor)}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Data de entrega do relatório</Label>
                        <p className="mt-1">{selectedPrestacao.dataEntrega}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Resultados do Projeto */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3 text-green-600">2. Resultados do Projeto</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Resumo</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedPrestacao.categoria === "Artes Cênicas" ?
                            "O projeto teatral foi executado conforme cronograma estabelecido, promovendo a cultura local através de apresentações em espaços públicos. Foram realizadas 8 apresentações, com público total de 1.200 pessoas, superando as expectativas iniciais." :
                          selectedPrestacao.categoria === "Dança" ?
                            "O projeto de dança contemporânea integrou diferentes estilos e promoveu a expressão corporal como forma de arte. Realizamos 12 oficinas e 3 apresentações públicas, com participação de 150 pessoas nas atividades." :
                            "O projeto foi desenvolvido de acordo com o planejamento inicial, alcançando todas as metas propostas e beneficiando diretamente a comunidade local através das ações culturais implementadas."
                          }
                        </p>
                      </div>

                      <div>
                        <Label className="font-medium text-sm text-gray-600">As ações planejadas foram realizadas?</Label>
                        <p className="text-sm mt-1">✅ Sim, todas as ações foram feitas conforme o planejado</p>
                      </div>

                      <div>
                        <Label className="font-medium text-sm text-gray-600">Ações desenvolvidas</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedPrestacao.categoria === "Artes Cênicas" ?
                            "Realizadas 8 apresentações teatrais nos seguintes locais: Teatro Municipal (2 apresentações), Praça Central (3 apresentações), Escola Municipal (2 apresentações), Casa da Cultura (1 apresentação). Cada apresentação teve duração média de 90 minutos, com público médio de 150 pessoas por sessão." :
                          selectedPrestacao.categoria === "Dança" ?
                            "Desenvolvidas 12 oficinas de dança contemporânea no período de março a novembro de 2025. As oficinas foram realizadas no Centro Cultural, com aulas semanais de 2 horas cada. Realizamos 3 apresentações públicas: Festival de Inverno, Semana da Cultura e Mostra de Fim de Ano." :
                            "As ações foram desenvolvidas conforme cronograma estabelecido, incluindo todas as etapas previstas no projeto original."
                          }
                        </p>
                      </div>

                      <div>
                        <Label className="font-medium text-sm text-gray-600">Cumprimento das Metas</Label>
                        <div className="mt-2 space-y-2">
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium text-sm">META 1 - Realizar apresentações culturais</p>
                            <p className="text-xs text-green-600 mt-1">✅ Integralmente cumprida</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Meta superada: planejadas 6 apresentações, realizadas 8 apresentações
                            </p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium text-sm">META 2 - Capacitar participantes</p>
                            <p className="text-xs text-green-600 mt-1">✅ Integralmente cumprida</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Capacitados 45 participantes em técnicas artísticas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Produtos Gerados */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3 text-purple-600">3. Produtos Gerados</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-sm text-gray-600">A execução gerou produtos?</Label>
                        <p className="text-sm mt-1">✅ Sim</p>
                      </div>

                      <div>
                        <Label className="font-medium text-sm text-gray-600">Produtos culturais gerados</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Vídeo (3)</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Catálogo (1)</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Espetáculo (8)</span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Site (1)</span>
                        </div>
                      </div>

                      <div>
                        <Label className="font-medium text-sm text-gray-600">Como ficaram disponíveis</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Os vídeos das apresentações estão disponibilizados no canal YouTube do projeto.
                          O catálogo foi impresso em 500 exemplares e distribuído gratuitamente.
                          O site do projeto (www.teatrojau.com.br) mantém todas as informações e galeria de fotos.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Público Alcançado */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3 text-orange-600">4. Público Alcançado</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Quantidade de pessoas beneficiadas</Label>
                        <p className="text-sm mt-1 font-medium">
                          {selectedPrestacao.categoria === "Artes Cênicas" ? "1.200 pessoas" :
                          selectedPrestacao.categoria === "Dança" ? "150 pessoas" :
                          "800 pessoas"}
                        </p>
                      </div>

                      <div>
                        <Label className="font-medium text-sm text-gray-600">Mecanismos de mensuração</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Foram utilizadas listas de presença em todas as atividades, contagem de público nas apresentações,
                          registros fotográficos e controle de participantes nas oficinas. A mensuração foi realizada pela
                          equipe de produção em cada evento.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5. Equipe do Projeto */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3 text-indigo-600">5. Equipe do Projeto</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-sm text-gray-600">Quantidade de pessoas na equipe</Label>
                        <p className="text-sm mt-1">12 pessoas</p>
                      </div>

                      <div>
                        <Label className="font-medium text-sm text-gray-600">Houve mudanças na equipe?</Label>
                        <p className="text-sm mt-1">Não</p>
                      </div>

                      <div>
                        <Label className="font-medium text-sm text-gray-600">Profissionais do projeto</Label>
                        <div className="mt-2 text-xs">
                          <div className="grid grid-cols-4 gap-2 p-2 bg-white rounded border font-medium">
                            <span>Nome</span>
                            <span>Função</span>
                            <span>Pessoa Negra/Indígena</span>
                            <span>PcD</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 p-2 border-l border-r border-b text-xs">
                            <span>Maria Silva</span>
                            <span>Diretora</span>
                            <span>Sim</span>
                            <span>Não</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 p-2 border-l border-r border-b text-xs">
                            <span>João Santos</span>
                            <span>Ator</span>
                            <span>Não</span>
                            <span>Não</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 p-2 border-l border-r border-b text-xs rounded-b">
                            <span>+ 10 profissionais</span>
                            <span>Diversos</span>
                            <span>40%</span>
                            <span>8%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6-9. Seções Restantes Resumidas */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3 text-gray-600">6-9. Outras Informações</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="font-medium text-gray-600">Locais de Realização</Label>
                        <p className="text-muted-foreground">Jaú - SP (Presencial)</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Divulgação</Label>
                        <p className="text-muted-foreground">Instagram, Facebook, cartazes</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Anexos</Label>
                        <p className="text-muted-foreground">12 documentos anexados</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Status</Label>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(selectedPrestacao.status)}`}>
                          {selectedPrestacao.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comprovantes" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Nota Fiscal 001.pdf</span>
                  <Badge className="bg-green-100 text-green-800">Validado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Recibo Aluguel Local.pdf</span>
                  <Badge className="bg-green-100 text-green-800">Validado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Fotos do Evento.zip</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="openbanking" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Movimentações Relacionadas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Recebimento PNAB</span>
                      <span className="text-green-600">+ R$ 25.000,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagamento Equipamentos</span>
                      <span className="text-red-600">- R$ 8.500,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagamento Pessoal</span>
                      <span className="text-red-600">- R$ 12.000,00</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Alertas de Conformidade</h4>
                  <div className="text-sm text-green-600">
                    ✅ Todos os gastos estão dentro das categorias permitidas
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analise" className="space-y-4">
              <div>
                <Label className="font-medium">Parecer do Analista</Label>
                <Textarea 
                  placeholder="Digite sua análise técnica..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="font-medium">Checklist de Verificação</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <Label>Relatório completo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <Label>Comprovantes válidos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label>Gastos conformes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <Label>Metas cumpridas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <Label>Open Banking OK</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label className="font-medium">Recomendação</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione uma recomendação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprovar">Aprovar</SelectItem>
                    <SelectItem value="correcoes">Solicitar Correções</SelectItem>
                    <SelectItem value="rejeitar">Rejeitar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAnaliseModalOpen(false)}>
              Fechar
            </Button>
            <Button 
              variant="outline"
              onClick={handleSalvarAnalise}
            >
              Salvar Análise
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAprovarPrestacaoModal}
            >
              Aprovar Prestação
            </Button>
            <Button 
              variant="outline" 
              className="border-orange-500 text-orange-600"
              onClick={handleSolicitarCorrecoes}
            >
              Solicitar Correções
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejeitarPrestacao}
            >
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Solicitar Correções */}
      <Dialog open={isCorrecoesModalOpen} onOpenChange={setIsCorrecoesModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Solicitar Correções</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Tipo de Pendência</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Label>Documentos faltantes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Label>Comprovantes inválidos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Label>Relatório incompleto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Label>Gastos não conformes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Label>Outros</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="font-medium">Documentos Necessários</Label>
              <Textarea 
                placeholder="Liste os documentos que precisam ser enviados ou corrigidos"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="font-medium">Observações</Label>
              <Textarea 
                placeholder="Detalhe as correções necessárias"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="font-medium">Prazo para Correção</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="45">45 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCorrecoesModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleEnviarSolicitacao}
            >
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Open Banking */}
      <Dialog open={isOpenBankingModalOpen} onOpenChange={setIsOpenBankingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Extrato Open Banking - {selectedPrestacao?.projeto}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações do Projeto */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="font-medium text-sm text-gray-600">Projeto</Label>
                  <p className="font-medium">{selectedPrestacao?.projeto}</p>
                </div>
                <div>
                  <Label className="font-medium text-sm text-gray-600">Proponente</Label>
                  <p className="font-medium">{selectedPrestacao?.proponente}</p>
                </div>
                <div>
                  <Label className="font-medium text-sm text-gray-600">Valor do Projeto</Label>
                  <p className="font-medium text-green-600">
                    {selectedPrestacao && formatCurrency(selectedPrestacao.valor)}
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-sm text-gray-600">Status Open Banking</Label>
                  <div className="flex items-center gap-2">
                    {selectedPrestacao && getOpenBankingIcon(selectedPrestacao.openBanking)}
                    <span className="text-sm font-medium">
                      {selectedPrestacao?.openBanking === "conforme" ? "Conforme" :
                       selectedPrestacao?.openBanking === "alerta" ? "Com Alertas" :
                       selectedPrestacao?.openBanking === "irregularidade" ? "Irregularidade" : "Não Monitorado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Valor Recebido</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedPrestacao && formatCurrency(selectedPrestacao.valor)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Valor Gasto</p>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedPrestacao && formatCurrency(selectedPrestacao.valor * 0.95)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Saldo Restante</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedPrestacao && formatCurrency(selectedPrestacao.valor * 0.05)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Extrato de Movimentações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extrato de Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div>
                      <p className="font-medium">Recebimento PNAB</p>
                      <p className="text-sm text-gray-600">15/10/2024 - 14:30</p>
                      <p className="text-xs text-gray-500">PIX - Prefeitura Municipal de Jaú</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      + {selectedPrestacao && formatCurrency(selectedPrestacao.valor)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div>
                      <p className="font-medium">Pagamento - Equipamentos de Som</p>
                      <p className="text-sm text-gray-600">18/10/2024 - 10:15</p>
                      <p className="text-xs text-gray-500">TED - Som & Cia Equipamentos</p>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      - {formatCurrency(8500)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div>
                      <p className="font-medium">Pagamento - Cachê Artistas</p>
                      <p className="text-sm text-gray-600">20/10/2024 - 16:45</p>
                      <p className="text-xs text-gray-500">PIX - Diversos</p>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      - {formatCurrency(12000)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div>
                      <p className="font-medium">Pagamento - Material Gráfico</p>
                      <p className="text-sm text-gray-600">22/10/2024 - 09:20</p>
                      <p className="text-xs text-gray-500">DOC - Gráfica Rápida</p>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      - {formatCurrency(2500)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div>
                      <p className="font-medium">Pagamento - Alimentação Equipe</p>
                      <p className="text-sm text-gray-600">25/10/2024 - 12:30</p>
                      <p className="text-xs text-gray-500">Cartão - Restaurante Central</p>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      - {formatCurrency(1750)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análise de Conformidade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Conformidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedPrestacao?.openBanking === "conforme" ? (
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 text-2xl">✅</span>
                        <div>
                          <h4 className="font-medium text-green-800">Movimentações Conformes</h4>
                          <p className="text-sm text-green-700">
                            Todos os gastos estão dentro das categorias permitidas pelo edital.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : selectedPrestacao?.openBanking === "alerta" ? (
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-600 text-2xl">⚠️</span>
                        <div>
                          <h4 className="font-medium text-yellow-800">Alertas Identificados</h4>
                          <p className="text-sm text-yellow-700">
                            Algumas movimentações precisam de verificação adicional.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div className="flex items-center gap-3">
                        <span className="text-red-600 text-2xl">❌</span>
                        <div>
                          <h4 className="font-medium text-red-800">Irregularidades Detectadas</h4>
                          <p className="text-sm text-red-700">
                            Foram identificadas movimentações que não estão em conformidade com o edital.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm">Categorias Permitidas</h5>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Equipamentos</span>
                          <span className="text-green-600">✓ Conforme</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cachê Artistas</span>
                          <span className="text-green-600">✓ Conforme</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Material Gráfico</span>
                          <span className="text-green-600">✓ Conforme</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Alimentação</span>
                          <span className="text-green-600">✓ Conforme</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm">Limites por Categoria</h5>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Equipamentos (40%)</span>
                          <span className="text-blue-600">34% usado</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cachê (50%)</span>
                          <span className="text-blue-600">48% usado</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Material (10%)</span>
                          <span className="text-blue-600">10% usado</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Alimentação (5%)</span>
                          <span className="text-blue-600">7% usado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOpenBankingModalOpen(false)}>
              Fechar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Extrato
            </Button>
            <Button onClick={() => navigate("/openbanking-admin")}>
              Ver Análise Completa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};