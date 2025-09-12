import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Filter,
  ArrowLeft
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [prazoFilter, setPrazoFilter] = useState("todos");
  const [selectedPrestacoes, setSelectedPrestacoes] = useState<string[]>([]);
  const [selectedPrestacao, setSelectedPrestacao] = useState<Prestacao | null>(null);
  const [isAnaliseModalOpen, setIsAnaliseModalOpen] = useState(false);
  const [isCorrecoesModalOpen, setIsCorrecoesModalOpen] = useState(false);

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
      projeto: "Festival de Música Popular",
      categoria: "Música",
      proponente: "João Silva",
      tipo: "PF",
      valor: 25000,
      dataEntrega: "15/11/2024",
      prazo: "5 dias",
      status: "Recebida",
      openBanking: "conforme"
    },
    {
      id: "2",
      projeto: "Teatro na Praça",
      categoria: "Teatro",
      proponente: "Maria Santos",
      tipo: "PJ",
      valor: 18000,
      dataEntrega: "10/11/2024",
      prazo: "Atrasado",
      status: "Em Análise",
      openBanking: "alerta"
    },
    {
      id: "3",
      projeto: "Oficina de Dança",
      categoria: "Dança",
      proponente: "Pedro Costa",
      tipo: "PF",
      valor: 12000,
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
      valor: 30000,
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard-prefeitura")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
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
                <Button variant="outline" size="sm">
                  Aprovar Selecionadas
                </Button>
                <Button variant="outline" size="sm">
                  Marcar como Em Análise
                </Button>
                <Button variant="outline" size="sm">
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
                          <Button variant="ghost" size="sm" className="text-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600"
                          onClick={() => handleCorrecoesClick(prestacao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600">
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
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Relatório de Conformidade
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Prestações
            </Button>
            <Button variant="outline">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Projeto</Label>
                  <p>{selectedPrestacao?.projeto}</p>
                </div>
                <div>
                  <Label className="font-medium">Valor</Label>
                  <p>{selectedPrestacao && formatCurrency(selectedPrestacao.valor)}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">Resumo da Execução</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  O projeto foi executado conforme cronograma estabelecido, atingindo todas as metas propostas...
                </p>
              </div>
              <div>
                <Label className="font-medium">Resultados Alcançados</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Foram realizados 10 espetáculos, com público total de 2.500 pessoas...
                </p>
              </div>
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
            <Button variant="outline">
              Salvar Análise
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Aprovar Prestação
            </Button>
            <Button variant="outline" className="border-orange-500 text-orange-600">
              Solicitar Correções
            </Button>
            <Button variant="destructive">
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
            <Button className="bg-orange-600 hover:bg-orange-700">
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};