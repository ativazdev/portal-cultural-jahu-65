import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck2, Clock, ThumbsUp, Star, Search, X, Eye, Check, AlertTriangle, List, FileText, Download, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tipos
export interface Avaliacao {
  id: string;
  projeto: {
    nome: string;
    categoria: string;
  };
  proponente: {
    nome: string;
    tipo: "PF" | "PJ";
  };
  parecerista: string;
  notaFinal: number;
  dataAvaliacao: string;
  status: "Avaliado" | "Aprovado" | "Rejeitado";
  criterios: {
    relevancia: number;
    viabilidade: number;
    impacto: number;
    orcamento: number;
    inovacao: number;
    sustentabilidade: number;
  };
  parecerTecnico: string;
  recomendacao: "Aprovação" | "Rejeição";
}

// Dados de exemplo
const avaliacoesExemplo: Avaliacao[] = [
  {
    id: "1",
    projeto: { nome: "Festival de Música Popular", categoria: "Música" },
    proponente: { nome: "João Silva", tipo: "PF" },
    parecerista: "Ana Costa",
    notaFinal: 8.5,
    dataAvaliacao: "2024-11-15",
    status: "Avaliado",
    criterios: { relevancia: 8.5, viabilidade: 7.0, impacto: 9.0, orcamento: 6.5, inovacao: 4.0, sustentabilidade: 3.5 },
    parecerTecnico: "Projeto com excelente potencial de impacto cultural na comunidade local.",
    recomendacao: "Aprovação"
  },
  {
    id: "2",
    projeto: { nome: "Teatro na Praça", categoria: "Teatro" },
    proponente: { nome: "Maria Santos", tipo: "PF" },
    parecerista: "Carlos Lima",
    notaFinal: 7.2,
    dataAvaliacao: "2024-11-14",
    status: "Aprovado",
    criterios: { relevancia: 7.5, viabilidade: 8.0, impacto: 7.0, orcamento: 7.5, inovacao: 3.0, sustentabilidade: 2.5 },
    parecerTecnico: "Proposta bem estruturada com cronograma realista.",
    recomendacao: "Aprovação"
  },
  {
    id: "3",
    projeto: { nome: "Oficina de Dança", categoria: "Dança" },
    proponente: { nome: "Pedro Costa", tipo: "PJ" },
    parecerista: "Lúcia Mendes",
    notaFinal: 6.8,
    dataAvaliacao: "2024-11-13",
    status: "Avaliado",
    criterios: { relevancia: 7.0, viabilidade: 6.0, impacto: 7.5, orcamento: 6.0, inovacao: 3.5, sustentabilidade: 4.0 },
    parecerTecnico: "Projeto adequado mas com algumas questões orçamentárias a serem revisadas.",
    recomendacao: "Aprovação"
  },
  {
    id: "4",
    projeto: { nome: "Arte Urbana", categoria: "Artes Visuais" },
    proponente: { nome: "Coletivo Arte", tipo: "PJ" },
    parecerista: "Roberto Silva",
    notaFinal: 9.1,
    dataAvaliacao: "2024-11-12",
    status: "Aprovado",
    criterios: { relevancia: 9.0, viabilidade: 8.5, impacto: 9.5, orcamento: 8.0, inovacao: 5.0, sustentabilidade: 4.5 },
    parecerTecnico: "Excelente projeto com alto potencial de transformação social.",
    recomendacao: "Aprovação"
  }
];

const pareceristas = [
  { nome: "Ana Costa", especialidade: "Música" },
  { nome: "Carlos Lima", especialidade: "Teatro" },
  { nome: "Lúcia Mendes", especialidade: "Artes Visuais" },
  { nome: "Roberto Silva", especialidade: "Dança" }
];

export const AvaliacoesAdminMain = () => {
  const { toast } = useToast();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(avaliacoesExemplo);
  const [filtros, setFiltros] = useState({
    busca: "",
    parecerista: "Todos",
    status: "Todos"
  });

  // Estados dos modais
  const [modalDetalhes, setModalDetalhes] = useState<{ aberto: boolean; avaliacao?: Avaliacao }>({ aberto: false });
  const [modalDecisao, setModalDecisao] = useState<{ aberto: boolean; avaliacao?: Avaliacao; tipo?: "aprovar" | "rejeitar" }>({ aberto: false });
  const [modalRankingAuto, setModalRankingAuto] = useState(false);
  const [modalRelatorioClass, setModalRelatorioClass] = useState(false);
  const [modalRelatorioCategoria, setModalRelatorioCategoria] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [configRanking, setConfigRanking] = useState({
    edital: "Edital PNAB 2024/01",
    notaMinima: 6.0,
    considerarOrcamento: true,
    orcamentos: {
      "Música": 500000,
      "Teatro": 400000,
      "Dança": 300000,
      "Artes Visuais": 350000,
      "Literatura": 250000
    }
  });
  const [configRelatorio, setConfigRelatorio] = useState({
    tipo: "Ranking Geral",
    formato: "PDF",
    incluirDados: false,
    incluirParecer: false,
    incluirNotas: false
  });
  const [configRelatorioCategoria, setConfigRelatorioCategoria] = useState({
    categoria: "Música",
    incluirGraficos: false,
    formato: "PDF"
  });

  // Filtrar avaliações
  const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
    const matchBusca = 
      avaliacao.projeto.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      avaliacao.proponente.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      avaliacao.parecerista.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchParecerista = filtros.parecerista === "Todos" || avaliacao.parecerista === filtros.parecerista;
    const matchStatus = filtros.status === "Todos" || avaliacao.status === filtros.status;
    
    return matchBusca && matchParecerista && matchStatus;
  });

  // Calcular métricas
  const metricas = {
    avaliacoesRecebidas: avaliacoes.filter(a => a.status === "Avaliado").length,
    pendenteDecisao: avaliacoes.filter(a => a.status === "Avaliado").length,
    projetosAprovados: avaliacoes.filter(a => a.status === "Aprovado").length,
    notaMediaGeral: (avaliacoes.reduce((acc, curr) => acc + curr.notaFinal, 0) / avaliacoes.length).toFixed(1)
  };

  // Funções
  const getNotaColor = (nota: number) => {
    if (nota >= 8.0) return "text-green-600 bg-green-50";
    if (nota >= 6.0) return "text-blue-600 bg-blue-50";
    if (nota >= 4.0) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Avaliado": "bg-blue-500/10 text-blue-500",
      "Aprovado": "bg-green-500/10 text-green-500",
      "Rejeitado": "bg-red-500/10 text-red-500"
    };
    return variants[status as keyof typeof variants] || "bg-gray-500/10 text-gray-500";
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

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleLimparFiltros = () => {
    setFiltros({ busca: "", parecerista: "Todos", status: "Todos" });
  };

  const confirmarDecisao = () => {
    if (!modalDecisao.avaliacao) return;

    const novoStatus = modalDecisao.tipo === "aprovar" ? "Aprovado" : "Rejeitado";
    
    setAvaliacoes(prev => prev.map(a => 
      a.id === modalDecisao.avaliacao!.id 
        ? { ...a, status: novoStatus as "Aprovado" | "Rejeitado" }
        : a
    ));

    toast({
      title: `Projeto ${novoStatus.toLowerCase()}`,
      description: `O projeto "${modalDecisao.avaliacao.projeto.nome}" foi ${novoStatus.toLowerCase()} com sucesso.`,
    });

    setModalDecisao({ aberto: false });
    setJustificativa("");
  };

  const gerarRankingAutomatico = () => {
    toast({
      title: "Ranking gerado com sucesso!",
      description: "67 projetos classificados, 22 em lista de espera",
    });
    setModalRankingAuto(false);
  };

  const gerarRelatorioClassificacao = () => {
    toast({
      title: "Relatório gerado",
      description: `Relatório de ${configRelatorio.tipo} gerado em formato ${configRelatorio.formato}`,
    });
    setModalRelatorioClass(false);
  };

  const exportarAvaliacoes = () => {
    toast({
      title: "Exportação realizada",
      description: "Planilha Excel com todas as avaliações foi gerada",
    });
  };

  const gerarRelatorioCategoria = () => {
    toast({
      title: "Relatório por categoria gerado",
      description: `Relatório da categoria ${configRelatorioCategoria.categoria} gerado com sucesso`,
    });
    setModalRelatorioCategoria(false);
  };

  return (
    <main className="flex-1 p-6 bg-prefeitura-accent">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-prefeitura-primary">Avaliações</h1>
          <p className="text-prefeitura-muted mt-2">Gerencie as avaliações dos pareceristas</p>
        </div>

        <Tabs defaultValue="avaliacoes" className="w-full">
          <TabsList>
            <TabsTrigger value="avaliacoes">Todas as Avaliações</TabsTrigger>
            <TabsTrigger value="ranking">Ranking por Categoria</TabsTrigger>
          </TabsList>

          <TabsContent value="avaliacoes" className="space-y-6">
            {/* Cards de Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliações Recebidas</CardTitle>
                  <FileCheck2 className="h-4 w-4 text-prefeitura-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-prefeitura-primary">{metricas.avaliacoesRecebidas}</div>
                  <p className="text-xs text-prefeitura-muted">Prontas para análise</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes de Decisão</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{metricas.pendenteDecisao}</div>
                  <p className="text-xs text-prefeitura-muted">Aguardando aprovação</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Aprovados</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{metricas.projetosAprovados}</div>
                  <p className="text-xs text-prefeitura-muted">Baseado nas avaliações</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nota Média Geral</CardTitle>
                  <Star className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">{metricas.notaMediaGeral}</div>
                  <p className="text-xs text-prefeitura-muted">Qualidade dos projetos</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros e Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-4">
                  <div className="col-span-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por projeto, proponente ou parecerista..."
                      value={filtros.busca}
                      onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                      className="pl-10"
                    />
                  </div>

                  <div className="col-span-2">
                    <Select value={filtros.parecerista} onValueChange={(value) => setFiltros({ ...filtros, parecerista: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Parecerista" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        {pareceristas.map((p) => (
                          <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Select value={filtros.status} onValueChange={(value) => setFiltros({ ...filtros, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        <SelectItem value="Avaliado">Avaliado</SelectItem>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Button variant="outline" onClick={handleLimparFiltros} className="w-full">
                      <X className="h-4 w-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Ações e Relatórios */}
            <Card>
              <CardHeader>
                <CardTitle>Ações e Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => setModalRankingAuto(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <List className="h-4 w-4 mr-2" />
                    Gerar Ranking Automático
                  </Button>
                  
                  <Button 
                    onClick={() => setModalRelatorioClass(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório de Classificação
                  </Button>
                  
                  <Button 
                    onClick={exportarAvaliacoes}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Avaliações
                  </Button>
                  
                  <Button 
                    onClick={() => setModalRelatorioCategoria(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatório por Categoria
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Avaliações */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações ({avaliacoesFiltradas.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Proponente</TableHead>
                        <TableHead>Parecerista</TableHead>
                        <TableHead>Nota Final</TableHead>
                        <TableHead>Data da Avaliação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {avaliacoesFiltradas.map((avaliacao) => (
                        <TableRow key={avaliacao.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{avaliacao.projeto.nome}</div>
                              <Badge className={`mt-1 ${getCategoriaColor(avaliacao.projeto.categoria)}`}>
                                {avaliacao.projeto.categoria}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{avaliacao.proponente.nome}</div>
                              <div className="text-sm text-muted-foreground">{avaliacao.proponente.tipo}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{avaliacao.parecerista}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-md font-bold ${getNotaColor(avaliacao.notaFinal)}`}>
                              {avaliacao.notaFinal.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell>{formatarData(avaliacao.dataAvaliacao)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(avaliacao.status)}>
                              {avaliacao.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModalDetalhes({ aberto: true, avaliacao })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {avaliacao.status === "Avaliado" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModalDecisao({ aberto: true, avaliacao, tipo: "aprovar" })}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModalDecisao({ aberto: true, avaliacao, tipo: "rejeitar" })}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["Música", "Teatro", "Dança", "Artes Visuais", "Literatura"].map((categoria) => {
                const projetosCategoria = avaliacoes
                  .filter(a => a.projeto.categoria === categoria)
                  .sort((a, b) => b.notaFinal - a.notaFinal)
                  .slice(0, 5);

                return (
                  <Card key={categoria}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge className={getCategoriaColor(categoria)}>
                          {categoria}
                        </Badge>
                        <span className="text-sm font-normal">Top 5</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {projetosCategoria.map((avaliacao, index) => (
                        <div key={avaliacao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-500">#{index + 1}</span>
                            <div>
                              <div className="font-medium text-sm">{avaliacao.projeto.nome}</div>
                              <div className="text-xs text-muted-foreground">{avaliacao.proponente.nome}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${getNotaColor(avaliacao.notaFinal).split(' ')[0]}`}>
                              {avaliacao.notaFinal.toFixed(1)}
                            </div>
                            <Badge className={`text-xs ${getStatusBadge(avaliacao.status)}`}>
                              {avaliacao.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {projetosCategoria.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum projeto avaliado nesta categoria
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Detalhes da Avaliação */}
        <Dialog open={modalDetalhes.aberto} onOpenChange={() => setModalDetalhes({ aberto: false })}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Avaliação</DialogTitle>
              <DialogDescription>
                Avaliação completa do projeto pelo parecerista
              </DialogDescription>
            </DialogHeader>
            
            {modalDetalhes.avaliacao && (
              <div className="space-y-6">
                {/* Cabeçalho */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Projeto</h3>
                    <p>{modalDetalhes.avaliacao.projeto.nome}</p>
                    <Badge className={`mt-1 ${getCategoriaColor(modalDetalhes.avaliacao.projeto.categoria)}`}>
                      {modalDetalhes.avaliacao.projeto.categoria}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold">Proponente</h3>
                    <p>{modalDetalhes.avaliacao.proponente.nome} ({modalDetalhes.avaliacao.proponente.tipo})</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Avaliado por: {modalDetalhes.avaliacao.parecerista}
                    </p>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <h3 className="font-semibold mb-4">Critérios de Avaliação</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Critérios Principais (0-10)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Relevância Cultural:</span>
                          <span className={`font-bold ${getNotaColor(modalDetalhes.avaliacao.criterios.relevancia).split(' ')[0]}`}>
                            {modalDetalhes.avaliacao.criterios.relevancia.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Viabilidade Técnica:</span>
                          <span className={`font-bold ${getNotaColor(modalDetalhes.avaliacao.criterios.viabilidade).split(' ')[0]}`}>
                            {modalDetalhes.avaliacao.criterios.viabilidade.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Impacto Social:</span>
                          <span className={`font-bold ${getNotaColor(modalDetalhes.avaliacao.criterios.impacto).split(' ')[0]}`}>
                            {modalDetalhes.avaliacao.criterios.impacto.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Orçamento:</span>
                          <span className={`font-bold ${getNotaColor(modalDetalhes.avaliacao.criterios.orcamento).split(' ')[0]}`}>
                            {modalDetalhes.avaliacao.criterios.orcamento.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Critérios Bônus (0-5)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Inovação:</span>
                          <span className="font-bold">{modalDetalhes.avaliacao.criterios.inovacao.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sustentabilidade:</span>
                          <span className="font-bold">{modalDetalhes.avaliacao.criterios.sustentabilidade.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Nota Final:</span>
                          <span className={`text-xl font-bold ${getNotaColor(modalDetalhes.avaliacao.notaFinal).split(' ')[0]}`}>
                            {modalDetalhes.avaliacao.notaFinal.toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parecer Técnico */}
                <div>
                  <h3 className="font-semibold mb-2">Parecer Técnico</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm leading-relaxed">{modalDetalhes.avaliacao.parecerTecnico}</p>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium">Recomendação: </span>
                    <Badge className={modalDetalhes.avaliacao.recomendacao === "Aprovação" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {modalDetalhes.avaliacao.recomendacao}
                    </Badge>
                  </div>
                </div>

                {/* Ações */}
                {modalDetalhes.avaliacao.status === "Avaliado" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setModalDetalhes({ aberto: false });
                        setModalDecisao({ aberto: true, avaliacao: modalDetalhes.avaliacao, tipo: "aprovar" });
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aprovar Projeto
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setModalDetalhes({ aberto: false });
                        setModalDecisao({ aberto: true, avaliacao: modalDetalhes.avaliacao, tipo: "rejeitar" });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar Projeto
                    </Button>
                    <Button variant="outline">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Solicitar Reavaliação
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Decisão */}
        <Dialog open={modalDecisao.aberto} onOpenChange={() => setModalDecisao({ aberto: false })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {modalDecisao.tipo === "aprovar" ? "Aprovar Projeto" : "Rejeitar Projeto"}
              </DialogTitle>
              <DialogDescription>
                {modalDecisao.tipo === "aprovar" 
                  ? `Confirma a aprovação do projeto "${modalDecisao.avaliacao?.projeto.nome}" baseado na avaliação?`
                  : `Confirma a rejeição do projeto "${modalDecisao.avaliacao?.projeto.nome}"?`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {modalDecisao.tipo === "aprovar" ? "Observações da aprovação (opcional)" : "Justificativa da rejeição (obrigatório)"}
                </label>
                <Textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder={modalDecisao.tipo === "aprovar" 
                    ? "Observações adicionais sobre a aprovação..."
                    : "Descreva os motivos da rejeição..."
                  }
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={confirmarDecisao}
                  disabled={modalDecisao.tipo === "rejeitar" && !justificativa.trim()}
                  className={modalDecisao.tipo === "aprovar" ? "bg-green-600 hover:bg-green-700" : ""}
                  variant={modalDecisao.tipo === "rejeitar" ? "destructive" : "default"}
                >
                  {modalDecisao.tipo === "aprovar" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
                </Button>
                <Button variant="outline" onClick={() => setModalDecisao({ aberto: false })}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Gerar Ranking Automático */}
        <Dialog open={modalRankingAuto} onOpenChange={setModalRankingAuto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerar Ranking Automático</DialogTitle>
              <DialogDescription>
                Configure os parâmetros para gerar o ranking automático dos projetos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Configurações do Ranking</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Edital</label>
                    <Select value={configRanking.edital} onValueChange={(value) => 
                      setConfigRanking(prev => ({ ...prev, edital: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Edital PNAB 2024/01">Edital PNAB 2024/01</SelectItem>
                        <SelectItem value="Edital PNAB 2024/02">Edital PNAB 2024/02</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Nota mínima para classificação</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={configRanking.notaMinima}
                      onChange={(e) => setConfigRanking(prev => ({ ...prev, notaMinima: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="considerarOrcamento"
                    checked={configRanking.considerarOrcamento}
                    onChange={(e) => setConfigRanking(prev => ({ ...prev, considerarOrcamento: e.target.checked }))}
                  />
                  <label htmlFor="considerarOrcamento" className="text-sm font-medium">
                    Considerar orçamento por categoria
                  </label>
                </div>
              </div>

              {configRanking.considerarOrcamento && (
                <div className="space-y-4">
                  <h4 className="font-medium">Orçamento por Categoria</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(configRanking.orcamentos).map(([categoria, valor]) => (
                      <div key={categoria} className="flex items-center justify-between">
                        <label className="text-sm font-medium">{categoria}:</label>
                        <div className="flex items-center">
                          <span className="text-sm mr-2">R$</span>
                          <Input
                            type="number"
                            value={valor}
                            onChange={(e) => setConfigRanking(prev => ({
                              ...prev,
                              orcamentos: { ...prev.orcamentos, [categoria]: parseInt(e.target.value) }
                            }))}
                            className="w-32"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setModalRankingAuto(false)}>
                Cancelar
              </Button>
              <Button onClick={gerarRankingAutomatico} className="bg-green-600 hover:bg-green-700 text-white">
                Gerar Ranking
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Relatório de Classificação */}
        <Dialog open={modalRelatorioClass} onOpenChange={setModalRelatorioClass}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Relatório de Classificação dos Projetos</DialogTitle>
              <DialogDescription>
                Configure as opções para gerar o relatório de classificação
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de relatório</label>
                <div className="mt-2 space-y-2">
                  {["Ranking Geral", "Apenas Classificados", "Lista de Espera", "Por Categoria"].map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={tipo}
                        name="tipoRelatorio"
                        checked={configRelatorio.tipo === tipo}
                        onChange={() => setConfigRelatorio(prev => ({ ...prev, tipo }))}
                      />
                      <label htmlFor={tipo} className="text-sm">{tipo}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Formato</label>
                <Select value={configRelatorio.formato} onValueChange={(value) => 
                  setConfigRelatorio(prev => ({ ...prev, formato: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF (para publicação oficial)</SelectItem>
                    <SelectItem value="Excel">Excel (para análise)</SelectItem>
                    <SelectItem value="CSV">CSV (para importação)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="incluirDados"
                    checked={configRelatorio.incluirDados}
                    onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirDados: e.target.checked }))}
                  />
                  <label htmlFor="incluirDados" className="text-sm">Incluir dados do proponente</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="incluirParecer"
                    checked={configRelatorio.incluirParecer}
                    onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirParecer: e.target.checked }))}
                  />
                  <label htmlFor="incluirParecer" className="text-sm">Incluir parecer dos pareceristas</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="incluirNotas"
                    checked={configRelatorio.incluirNotas}
                    onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirNotas: e.target.checked }))}
                  />
                  <label htmlFor="incluirNotas" className="text-sm">Incluir detalhamento das notas</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setModalRelatorioClass(false)}>
                Cancelar
              </Button>
              <Button onClick={gerarRelatorioClassificacao} className="bg-green-600 hover:bg-green-700 text-white">
                Gerar Relatório
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Relatório por Categoria */}
        <Dialog open={modalRelatorioCategoria} onOpenChange={setModalRelatorioCategoria}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Relatório por Categoria</DialogTitle>
              <DialogDescription>
                Selecione a categoria específica para gerar o relatório
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <div className="mt-2 space-y-2">
                  {["Música", "Teatro", "Dança", "Artes Visuais", "Literatura"].map((categoria) => (
                    <div key={categoria} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={categoria}
                        name="categoria"
                        checked={configRelatorioCategoria.categoria === categoria}
                        onChange={() => setConfigRelatorioCategoria(prev => ({ ...prev, categoria }))}
                      />
                      <label htmlFor={categoria} className="text-sm">{categoria}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="incluirGraficos"
                  checked={configRelatorioCategoria.incluirGraficos}
                  onChange={(e) => setConfigRelatorioCategoria(prev => ({ ...prev, incluirGraficos: e.target.checked }))}
                />
                <label htmlFor="incluirGraficos" className="text-sm">Incluir gráficos estatísticos</label>
              </div>

              <div>
                <label className="text-sm font-medium">Formato</label>
                <Select value={configRelatorioCategoria.formato} onValueChange={(value) => 
                  setConfigRelatorioCategoria(prev => ({ ...prev, formato: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setModalRelatorioCategoria(false)}>
                Cancelar
              </Button>
              <Button onClick={gerarRelatorioCategoria} className="bg-green-600 hover:bg-green-700 text-white">
                Gerar Relatório
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};