import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Eye, 
  Download,
  Filter,
  ArrowLeft
} from "lucide-react";

interface ContaMonitorada {
  id: string;
  proponente: string;
  tipoProponente: string;
  projeto: string;
  categoria: string;
  banco: string;
  valorRecebido: number;
  ultimaMovimentacao: string;
  status: string;
}

interface Movimentacao {
  id: string;
  data: string;
  descricao: string;
  tipo: string;
  valor: number;
}

interface StatusCard {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

export const OpenBankingAdminMain = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [periodoFilter, setPeriodoFilter] = useState("30");
  const [selectedConta, setSelectedConta] = useState<ContaMonitorada | null>(null);
  const [isExtratoModalOpen, setIsExtratoModalOpen] = useState(false);

  const statusCards: StatusCard[] = [
    {
      title: "Contas Monitoradas",
      value: "67",
      subtitle: "Proponentes ativos",
      color: "blue",
      icon: <Building2 className="h-6 w-6" />
    },
    {
      title: "Valor Total Monitorado",
      value: "R$ 2.1M",
      subtitle: "Recursos em acompanhamento",
      color: "purple",
      icon: <DollarSign className="h-6 w-6" />
    }
  ];

  const contasMonitoradas: ContaMonitorada[] = [
    {
      id: "1",
      proponente: "João Silva",
      tipoProponente: "PF",
      projeto: "Festival de Música",
      categoria: "Música",
      banco: "Banco do Brasil",
      valorRecebido: 25000,
      ultimaMovimentacao: "15/11/2024",
      status: "Ativa"
    },
    {
      id: "2",
      proponente: "Maria Santos",
      tipoProponente: "PJ",
      projeto: "Teatro na Praça",
      categoria: "Teatro",
      banco: "Caixa",
      valorRecebido: 18000,
      ultimaMovimentacao: "14/11/2024",
      status: "Ativa"
    },
    {
      id: "3",
      proponente: "Pedro Costa",
      tipoProponente: "PF",
      projeto: "Oficina de Dança",
      categoria: "Dança",
      banco: "Itaú",
      valorRecebido: 12000,
      ultimaMovimentacao: "13/11/2024",
      status: "Ativa"
    },
    {
      id: "4",
      proponente: "Coletivo Arte",
      tipoProponente: "PJ",
      projeto: "Arte Urbana",
      categoria: "Artes Visuais",
      banco: "Santander",
      valorRecebido: 30000,
      ultimaMovimentacao: "12/11/2024",
      status: "Inativa"
    }
  ];


  const movimentacoes: Movimentacao[] = [
    {
      id: "1",
      data: "15/11/2024",
      descricao: "Compra Material Gráfico - Gráfica Express",
      tipo: "Débito",
      valor: 850
    },
    {
      id: "2",
      data: "14/11/2024",
      descricao: "Transferência PIX - João Santos",
      tipo: "Débito",
      valor: 1500
    },
    {
      id: "3",
      data: "13/11/2024",
      descricao: "Pagamento Fornecedor - Som & Luz Ltda",
      tipo: "Débito",
      valor: 2200
    },
    {
      id: "4",
      data: "12/11/2024",
      descricao: "Saque Caixa Eletrônico",
      tipo: "Débito",
      valor: 800
    },
    {
      id: "5",
      data: "10/11/2024",
      descricao: "Depósito - Prefeitura Municipal",
      tipo: "Crédito",
      valor: 25000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa": return "bg-green-100 text-green-800";
      case "Inativa": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
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
      case "red": return "border-l-4 border-l-red-500 bg-red-50";
      case "green": return "border-l-4 border-l-green-500 bg-green-50";
      case "purple": return "border-l-4 border-l-purple-500 bg-purple-50";
      default: return "border-l-4 border-l-gray-500 bg-gray-50";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "red": return "text-red-600";
      case "green": return "text-green-600";
      case "purple": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const handleExtratoClick = (conta: ContaMonitorada) => {
    setSelectedConta(conta);
    setIsExtratoModalOpen(true);
    toast({
      title: "Extrato carregado!",
      description: `Extrato do projeto "${conta.projeto}" carregado com sucesso.`,
    });
  };

  // Funções para botões de extração
  const handleExtratoConsolidado = () => {
    toast({
      title: "Extrato Consolidado",
      description: "Gerando extrato consolidado de todas as contas monitoradas...",
    });
  };

  const handleRelatorioContas = () => {
    toast({
      title: "Relatório de Contas",
      description: "Gerando relatório detalhado das contas bancárias...",
    });
  };

  const handleExportarExtrato = () => {
    toast({
      title: "Exportação iniciada!",
      description: `Exportando extrato do projeto "${selectedConta?.projeto}"...`,
    });
  };

  const filteredContas = contasMonitoradas.filter(conta => {
    const matchesSearch = conta.proponente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conta.projeto.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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
            Open Banking
          </h1>
          <p className="text-prefeitura-muted">
            Monitore as contas bancárias dos proponentes em tempo real
          </p>
        </div>
      </div>

      {/* Cards de Monitoramento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Filtros e Controles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por proponente ou projeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setPeriodoFilter("30");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Contas Monitoradas */}
      <Card>
        <CardHeader>
          <CardTitle>Contas Monitoradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proponente</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Valor Recebido</TableHead>
                  <TableHead>Última Movimentação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{conta.proponente}</div>
                        <Badge variant="outline" className="text-xs">
                          {conta.tipoProponente}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{conta.projeto}</div>
                        <Badge variant="secondary" className="text-xs">
                          {conta.categoria}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{conta.banco}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(conta.valorRecebido)}
                    </TableCell>
                    <TableCell>{conta.ultimaMovimentacao}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(conta.status)}>
                        {conta.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExtratoClick(conta)}
                        className="text-blue-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Extrato
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Simplificados */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Open Banking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleExtratoConsolidado}
          >
            <Download className="h-4 w-4 mr-2" />
            Extrato Consolidado
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleRelatorioContas}
          >
            <Download className="h-4 w-4 mr-2" />
            Relatório de Contas
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Extrato Simplificado */}
      <Dialog open={isExtratoModalOpen} onOpenChange={setIsExtratoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Extrato Bancário</DialogTitle>
          </DialogHeader>
          
          {selectedConta && (
            <div className="space-y-6">
              {/* Cabeçalho do Extrato */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedConta.proponente}</h3>
                    <p className="text-muted-foreground">{selectedConta.projeto}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Banco: {selectedConta.banco}</p>
                    <p className="text-sm font-medium">Valor total recebido: {formatCurrency(selectedConta.valorRecebido)}</p>
                  </div>
                </div>
              </div>

              {/* Resumo Básico */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{movimentacoes.length}</div>
                  <div className="text-sm text-muted-foreground">Total de movimentações</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">R$ 2.450</div>
                  <div className="text-sm text-muted-foreground">Saldo atual</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">30 dias</div>
                  <div className="text-sm text-muted-foreground">Período consultado</div>
                </div>
              </div>

              {/* Tabela de Movimentações */}
              <div>
                <h4 className="font-semibold mb-4">Movimentações</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoes.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell>{mov.data}</TableCell>
                          <TableCell>{mov.descricao}</TableCell>
                          <TableCell>
                            <Badge variant={mov.tipo === "Crédito" ? "default" : "outline"}>
                              {mov.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            mov.tipo === "Crédito" ? "text-green-600" : "text-red-600"
                          }`}>
                            {mov.tipo === "Crédito" ? "+" : "-"}{formatCurrency(mov.valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={handleExportarExtrato}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Extrato
                </Button>
                <Button variant="outline" onClick={() => setIsExtratoModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};