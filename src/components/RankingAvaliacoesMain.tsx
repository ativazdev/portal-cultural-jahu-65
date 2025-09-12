import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Star, 
  Search, 
  Download, 
  Settings, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tipos
export interface ProjetoRanking {
  id: string;
  nome: string;
  categoria: string;
  proponente: {
    nome: string;
    tipo: "PF" | "PJ";
  };
  notaFinal: number;
  valorSolicitado: number;
  dataSubmissao: string;
  status: "Classificado" | "Lista de Espera" | "Desclassificado";
  posicao: number;
  edital: string;
}

export interface OrcamentoCategoria {
  categoria: string;
  orcamentoTotal: number;
  orcamentoComprometido: number;
  notaCorte: number;
  classificados: number;
  listaEspera: number;
}

// Dados de exemplo
const projetosRanking: ProjetoRanking[] = [
  {
    id: "1",
    nome: "Arte Urbana Transformadora",
    categoria: "Artes Visuais",
    proponente: { nome: "Coletivo Jovem", tipo: "PJ" },
    notaFinal: 9.4,
    valorSolicitado: 28000,
    dataSubmissao: "2024-11-10",
    status: "Classificado",
    posicao: 1,
    edital: "Edital 2024/01"
  },
  {
    id: "2",
    nome: "Festival de Música Popular",
    categoria: "Música",
    proponente: { nome: "João Silva", tipo: "PF" },
    notaFinal: 9.2,
    valorSolicitado: 25000,
    dataSubmissao: "2024-11-11",
    status: "Classificado",
    posicao: 2,
    edital: "Edital 2024/01"
  },
  {
    id: "3",
    nome: "Teatro Inclusivo",
    categoria: "Teatro",
    proponente: { nome: "Maria Santos", tipo: "PF" },
    notaFinal: 8.9,
    valorSolicitado: 22000,
    dataSubmissao: "2024-11-12",
    status: "Classificado",
    posicao: 3,
    edital: "Edital 2024/01"
  },
  {
    id: "4",
    nome: "Dança Contemporânea",
    categoria: "Dança",
    proponente: { nome: "Pedro Costa", tipo: "PJ" },
    notaFinal: 8.7,
    valorSolicitado: 18000,
    dataSubmissao: "2024-11-13",
    status: "Classificado",
    posicao: 4,
    edital: "Edital 2024/01"
  },
  {
    id: "5",
    nome: "Sarau Literário",
    categoria: "Literatura",
    proponente: { nome: "Ana Lima", tipo: "PF" },
    notaFinal: 8.5,
    valorSolicitado: 15000,
    dataSubmissao: "2024-11-14",
    status: "Classificado",
    posicao: 5,
    edital: "Edital 2024/01"
  },
  {
    id: "6",
    nome: "Show Beneficente",
    categoria: "Música",
    proponente: { nome: "Carlos Banda", tipo: "PF" },
    notaFinal: 7.9,
    valorSolicitado: 20000,
    dataSubmissao: "2024-11-15",
    status: "Lista de Espera",
    posicao: 6,
    edital: "Edital 2024/01"
  },
  {
    id: "7",
    nome: "Oficina de Cerâmica",
    categoria: "Artes Visuais",
    proponente: { nome: "Rita Arte", tipo: "PF" },
    notaFinal: 7.8,
    valorSolicitado: 16000,
    dataSubmissao: "2024-11-16",
    status: "Lista de Espera",
    posicao: 7,
    edital: "Edital 2024/01"
  }
];

const orcamentoCategorias: OrcamentoCategoria[] = [
  {
    categoria: "Música",
    orcamentoTotal: 500000,
    orcamentoComprometido: 380000,
    notaCorte: 7.8,
    classificados: 12,
    listaEspera: 5
  },
  {
    categoria: "Teatro",
    orcamentoTotal: 400000,
    orcamentoComprometido: 350000,
    notaCorte: 7.5,
    classificados: 15,
    listaEspera: 3
  },
  {
    categoria: "Dança",
    orcamentoTotal: 300000,
    orcamentoComprometido: 280000,
    notaCorte: 8.0,
    classificados: 8,
    listaEspera: 4
  },
  {
    categoria: "Artes Visuais",
    orcamentoTotal: 350000,
    orcamentoComprometido: 320000,
    notaCorte: 7.9,
    classificados: 10,
    listaEspera: 6
  },
  {
    categoria: "Literatura",
    orcamentoTotal: 250000,
    orcamentoComprometido: 180000,
    notaCorte: 7.6,
    classificados: 6,
    listaEspera: 4
  }
];

export const RankingAvaliacoesMain = () => {
  const { toast } = useToast();
  const [projetosData, setProjetosData] = useState<ProjetoRanking[]>(projetosRanking);
  const [orcamentoData, setOrcamentoData] = useState<OrcamentoCategoria[]>(orcamentoCategorias);
  const [filtros, setFiltros] = useState({
    busca: "",
    edital: "Todos",
    categoria: "Todos"
  });
  const [projetosSelecionados, setProjetosSelecionados] = useState<string[]>([]);
  const [modalRanking, setModalRanking] = useState(false);
  const [configRanking, setConfigRanking] = useState({
    notaMinima: 6.0,
    criterioDesempate: "dataSubmissao"
  });

  // Filtrar projetos
  const projetosFiltrados = projetosData.filter(projeto => {
    const matchBusca = 
      projeto.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      projeto.proponente.nome.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchEdital = filtros.edital === "Todos" || projeto.edital === filtros.edital;
    const matchCategoria = filtros.categoria === "Todos" || projeto.categoria === filtros.categoria;
    
    return matchBusca && matchEdital && matchCategoria;
  });

  // Calcular métricas
  const metricas = {
    avaliacoesConcluidas: projetosData.length,
    projetosClassificados: projetosData.filter(p => p.status === "Classificado").length,
    listaEspera: projetosData.filter(p => p.status === "Lista de Espera").length,
    notaCorteMedia: (orcamentoData.reduce((acc, curr) => acc + curr.notaCorte, 0) / orcamentoData.length).toFixed(1)
  };

  // Funções auxiliares
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Classificado": return "bg-green-500/10 text-green-500";
      case "Lista de Espera": return "bg-orange-500/10 text-orange-500";
      case "Desclassificado": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 9.0) return "text-green-600 bg-green-50 font-bold";
    if (nota >= 8.0) return "text-blue-600 bg-blue-50 font-bold";
    if (nota >= 7.0) return "text-orange-600 bg-orange-50 font-bold";
    return "text-red-600 bg-red-50 font-bold";
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      "Música": "bg-blue-500/10 text-blue-500",
      "Teatro": "bg-purple-500/10 text-purple-500",
      "Dança": "bg-pink-500/10 text-pink-500",
      "Artes Visuais": "bg-green-500/10 text-green-500",
      "Literatura": "bg-yellow-500/10 text-yellow-500"
    };
    return colors[categoria as keyof typeof colors] || "bg-gray-500/10 text-gray-500";
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularSaldo = (orcamento: OrcamentoCategoria) => {
    return orcamento.orcamentoTotal - orcamento.orcamentoComprometido;
  };

  const calcularPercentualUtilizado = (orcamento: OrcamentoCategoria) => {
    return Math.round((orcamento.orcamentoComprometido / orcamento.orcamentoTotal) * 100);
  };

  const gerarRankingAutomatico = () => {
    // Simular geração de ranking
    toast({
      title: "Ranking gerado com sucesso!",
      description: `${metricas.projetosClassificados} projetos classificados, ${metricas.listaEspera} em lista de espera`,
    });
    setModalRanking(false);
  };

  const exportarRanking = (formato: string) => {
    toast({
      title: `Exportando ranking em ${formato}`,
      description: "O arquivo será baixado em breve...",
    });
  };

  const toggleProjetoSelecionado = (projetoId: string) => {
    setProjetosSelecionados(prev => 
      prev.includes(projetoId) 
        ? prev.filter(id => id !== projetoId)
        : [...prev, projetoId]
    );
  };

  const selecionarTodos = (checked: boolean) => {
    if (checked) {
      setProjetosSelecionados(projetosFiltrados.map(p => p.id));
    } else {
      setProjetosSelecionados([]);
    }
  };

  return (
    <main className="flex-1 p-6 bg-prefeitura-accent">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-prefeitura-primary">Avaliações e Rankings</h1>
          <p className="text-prefeitura-muted mt-2">Gerencie avaliações e gere rankings automáticos</p>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações Concluídas</CardTitle>
              <Trophy className="h-4 w-4 text-prefeitura-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-prefeitura-primary">{metricas.avaliacoesConcluidas}</div>
              <p className="text-xs text-prefeitura-muted">Prontas para ranking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Classificados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{metricas.projetosClassificados}</div>
              <p className="text-xs text-prefeitura-muted">Dentro do orçamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lista de Espera</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{metricas.listaEspera}</div>
              <p className="text-xs text-prefeitura-muted">Acima da nota de corte</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nota de Corte Média</CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{metricas.notaCorteMedia}</div>
              <p className="text-xs text-prefeitura-muted">Todas as categorias</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Controles */}
        <Card>
          <CardHeader>
            <CardTitle>Controles e Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <Select value={filtros.edital} onValueChange={(value) => setFiltros({ ...filtros, edital: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Edital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Edital 2024/01">Edital 2024/01</SelectItem>
                    <SelectItem value="Edital 2024/02">Edital 2024/02</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Select value={filtros.categoria} onValueChange={(value) => setFiltros({ ...filtros, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Música">Música</SelectItem>
                    <SelectItem value="Teatro">Teatro</SelectItem>
                    <SelectItem value="Dança">Dança</SelectItem>
                    <SelectItem value="Artes Visuais">Artes Visuais</SelectItem>
                    <SelectItem value="Literatura">Literatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar projeto ou proponente..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-10"
                />
              </div>

              <div className="col-span-2">
                <Button 
                  onClick={() => setModalRanking(true)}
                  className="w-full bg-prefeitura-primary hover:bg-prefeitura-primary/90"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Gerar Ranking
                </Button>
              </div>

              <div className="col-span-3 flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => exportarRanking("PDF")}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportarRanking("Excel")}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abas Principais */}
        <Tabs defaultValue="ranking-geral" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ranking-geral">Ranking Geral</TabsTrigger>
            <TabsTrigger value="por-categoria">Por Categoria</TabsTrigger>
            <TabsTrigger value="todas-avaliacoes">Todas as Avaliações</TabsTrigger>
          </TabsList>

          {/* Aba Ranking Geral */}
          <TabsContent value="ranking-geral" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ranking Geral ({projetosFiltrados.length} projetos)</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="select-all"
                        checked={projetosSelecionados.length === projetosFiltrados.length}
                        onCheckedChange={selecionarTodos}
                      />
                      <Label htmlFor="select-all" className="text-sm">Selecionar todos</Label>
                    </div>
                    {projetosSelecionados.length > 0 && (
                      <Badge variant="secondary">
                        {projetosSelecionados.length} selecionados
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Posição</TableHead>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Proponente</TableHead>
                        <TableHead>Nota Final</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Valor Solicitado</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projetosFiltrados.map((projeto) => (
                        <TableRow 
                          key={projeto.id}
                          className={
                            projeto.status === "Classificado" ? "bg-green-50/50" :
                            projeto.status === "Lista de Espera" ? "bg-orange-50/50" :
                            "bg-red-50/50"
                          }
                        >
                          <TableCell>
                            <Checkbox
                              checked={projetosSelecionados.includes(projeto.id)}
                              onCheckedChange={() => toggleProjetoSelecionado(projeto.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">#{projeto.posicao}</span>
                              {projeto.posicao <= 3 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{projeto.nome}</div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{projeto.proponente.nome}</div>
                              <div className="text-sm text-muted-foreground">{projeto.proponente.tipo}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-md ${getNotaColor(projeto.notaFinal)}`}>
                              {projeto.notaFinal.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoriaColor(projeto.categoria)}>
                              {projeto.categoria}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatarValor(projeto.valorSolicitado)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(projeto.status)}>
                              {projeto.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Por Categoria */}
          <TabsContent value="por-categoria" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orcamentoData.map((orcamento) => (
                <Card key={orcamento.categoria}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Badge className={getCategoriaColor(orcamento.categoria)}>
                          {orcamento.categoria}
                        </Badge>
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Informações Orçamentárias */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Orçamento disponível:</span>
                        <span className="font-medium">{formatarValor(orcamento.orcamentoTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Orçamento comprometido:</span>
                        <span className="font-medium text-orange-600">{formatarValor(orcamento.orcamentoComprometido)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Saldo:</span>
                        <span className="font-medium text-green-600">{formatarValor(calcularSaldo(orcamento))}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-prefeitura-primary h-2 rounded-full transition-all"
                          style={{ width: `${calcularPercentualUtilizado(orcamento)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-center text-muted-foreground">
                        {calcularPercentualUtilizado(orcamento)}% utilizado
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{orcamento.classificados}</div>
                        <div className="text-xs text-muted-foreground">Classificados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{orcamento.listaEspera}</div>
                        <div className="text-xs text-muted-foreground">Lista de Espera</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Nota de corte</div>
                        <div className={`text-xl font-bold ${getNotaColor(orcamento.notaCorte).split(' ')[0]}`}>
                          {orcamento.notaCorte.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Top 3 Projetos */}
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="font-medium text-sm">Top 3 Projetos</h4>
                      {projetosData
                        .filter(p => p.categoria === orcamento.categoria)
                        .slice(0, 3)
                        .map((projeto, index) => (
                          <div key={projeto.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">#{index + 1}</span>
                              <div>
                                <div className="font-medium text-xs">{projeto.nome}</div>
                                <div className="text-xs text-muted-foreground">{projeto.proponente.nome}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-sm ${getNotaColor(projeto.notaFinal).split(' ')[0]}`}>
                                {projeto.notaFinal.toFixed(1)}
                              </div>
                              <Badge className={`text-xs ${getStatusColor(projeto.status)}`}>
                                {projeto.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aba Todas as Avaliações */}
          <TabsContent value="todas-avaliacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Avaliações ({projetosFiltrados.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Proponente</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Nota Final</TableHead>
                        <TableHead>Valor Solicitado</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Edital</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projetosFiltrados.map((projeto) => (
                        <TableRow key={projeto.id}>
                          <TableCell className="font-medium">{projeto.nome}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{projeto.proponente.nome}</div>
                              <div className="text-sm text-muted-foreground">{projeto.proponente.tipo}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoriaColor(projeto.categoria)}>
                              {projeto.categoria}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-md ${getNotaColor(projeto.notaFinal)}`}>
                              {projeto.notaFinal.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell>{formatarValor(projeto.valorSolicitado)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(projeto.status)}>
                              {projeto.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{projeto.edital}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Configuração de Ranking */}
        <Dialog open={modalRanking} onOpenChange={setModalRanking}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Gerar Ranking Automático</DialogTitle>
              <DialogDescription>
                Configure os parâmetros para geração automática do ranking
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Parâmetros Gerais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nota-minima">Nota mínima para aprovação</Label>
                  <Input
                    id="nota-minima"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={configRanking.notaMinima}
                    onChange={(e) => setConfigRanking({ ...configRanking, notaMinima: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="criterio-desempate">Critério de desempate</Label>
                  <Select 
                    value={configRanking.criterioDesempate} 
                    onValueChange={(value) => setConfigRanking({ ...configRanking, criterioDesempate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dataSubmissao">Data de submissão</SelectItem>
                      <SelectItem value="idadeProponente">Idade do proponente</SelectItem>
                      <SelectItem value="valorSolicitado">Valor solicitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Orçamento por Categoria */}
              <div>
                <h3 className="font-semibold mb-4">Orçamento por Categoria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orcamentoData.map((orcamento) => (
                    <div key={orcamento.categoria} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoriaColor(orcamento.categoria)}>
                          {orcamento.categoria}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">R$</span>
                        <Input
                          type="number"
                          value={orcamento.orcamentoTotal}
                          onChange={(e) => {
                            const novoOrcamento = [...orcamentoData];
                            const index = novoOrcamento.findIndex(o => o.categoria === orcamento.categoria);
                            novoOrcamento[index].orcamentoTotal = parseInt(e.target.value);
                            setOrcamentoData(novoOrcamento);
                          }}
                          className="w-32 text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={gerarRankingAutomatico} className="bg-green-600 hover:bg-green-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Gerar Ranking
                </Button>
                <Button variant="outline" onClick={() => setModalRanking(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};