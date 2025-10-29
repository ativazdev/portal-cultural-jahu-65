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
import { FileCheck2, Clock, ThumbsUp, Star, Search, X, Eye, Check, AlertTriangle, List, FileText, Download, BarChart3, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAvaliacoes, AvaliacaoCompleta, AvaliacaoFiltros, AvaliacaoMetricas } from "@/hooks/useAvaliacoes";
import { 
  ListTemplate, 
  DetailsModal,
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard
} from "@/components/templates";

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
  numeroInscricao?: string;
  ano?: string;
  edital?: string;
}

// Função para converter AvaliacaoCompleta para Avaliacao (compatibilidade)
const converterAvaliacao = (avaliacaoCompleta: AvaliacaoCompleta): Avaliacao => {
  return {
    id: avaliacaoCompleta.id,
    projeto: { 
      nome: avaliacaoCompleta.projeto.nome,
      categoria: avaliacaoCompleta.projeto.categoria || avaliacaoCompleta.projeto.modalidade || 'N/A'
    },
    proponente: { 
      nome: avaliacaoCompleta.projeto.proponente?.nome || 'Proponente não encontrado',
      tipo: (avaliacaoCompleta.projeto.proponente?.tipo as "PF" | "PJ") || "PF"
    },
    parecerista: avaliacaoCompleta.parecerista?.nome || 'Parecerista não encontrado',
    notaFinal: Number(avaliacaoCompleta.nota_final || 0),
    dataAvaliacao: avaliacaoCompleta.data_avaliacao || avaliacaoCompleta.created_at,
    status: mapearStatus(avaliacaoCompleta.status),
    criterios: {
      relevancia: Number(avaliacaoCompleta.nota_relevancia || 0),
      viabilidade: Number(avaliacaoCompleta.nota_viabilidade || 0),
      impacto: Number(avaliacaoCompleta.nota_impacto || 0),
      orcamento: Number(avaliacaoCompleta.nota_orcamento || 0),
      inovacao: Number(avaliacaoCompleta.nota_inovacao || 0),
      sustentabilidade: Number(avaliacaoCompleta.nota_sustentabilidade || 0)
    },
    parecerTecnico: avaliacaoCompleta.parecer_tecnico || 'Parecer não disponível',
    recomendacao: mapearRecomendacao(avaliacaoCompleta.recomendacao),
    numeroInscricao: avaliacaoCompleta.projeto.numero_inscricao,
    ano: "2025",
    edital: avaliacaoCompleta.projeto.edital?.nome || 'Edital não encontrado'
  };
};

// Mapear status do banco para interface
const mapearStatus = (status: string): "Avaliado" | "Aprovado" | "Rejeitado" => {
  const statusMap: Record<string, "Avaliado" | "Aprovado" | "Rejeitado"> = {
    'em_analise': 'Avaliado',
    'aprovado': 'Aprovado',
    'rejeitado': 'Rejeitado'
  };
  return statusMap[status] || 'Avaliado';
};

// Mapear recomendação do banco para interface
const mapearRecomendacao = (recomendacao: string): "Aprovação" | "Rejeição" => {
  return recomendacao === 'aprovacao' ? 'Aprovação' : 'Rejeição';
};

const categorias = ["Música", "Teatro", "Dança", "Artes Visuais", "Literatura"];

export const AvaliacoesAdminMain = () => {
  const { toast } = useToast();
  const { 
    avaliacoes: avaliacoesCompletas, 
    pareceristas, 
    editais, 
    loading, 
    error,
    aprovarProjeto,
    rejeitarProjeto,
    filtrarAvaliacoes,
    calcularMetricas
  } = useAvaliacoes();

  const [filtros, setFiltros] = useState<AvaliacaoFiltros>({
    busca: "",
    parecerista: "Todos",
    status: "Todos",
    edital: "Todos"
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
    notaMinima: 30.0,
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

  // Estados para ranking por edital-categoria
  const [editalSelecionado, setEditalSelecionado] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  // Converter avaliações completas para formato da interface
  const avaliacoes = avaliacoesCompletas.map(converterAvaliacao);

  // Filtrar avaliações usando o hook
  const avaliacoesFiltradas = filtrarAvaliacoes(filtros).map(converterAvaliacao);

  // Calcular métricas usando o hook
  const metricasCompletas = calcularMetricas();
  const metricas = {
    avaliacoesRecebidas: metricasCompletas.avaliacoesRecebidas,
    pendenteDecisao: metricasCompletas.pendenteDecisao,
    projetosAprovados: metricasCompletas.projetosAprovados,
    notaMediaGeral: metricasCompletas.notaMediaGeral.toFixed(1)
  };

  // Configuração das colunas para o ListTemplate
  const columns: ListColumn[] = [
    {
      key: 'projeto',
      label: 'Projeto',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.projeto.nome}</div>
          <Badge className={`${getCategoriaColor(item.projeto.categoria)}`}>
            {item.projeto.categoria}
          </Badge>
        </div>
      )
    },
    {
      key: 'proponente',
      label: 'Proponente',
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.proponente.nome}</div>
          <div className="text-sm text-gray-500">{item.proponente.tipo}</div>
        </div>
      )
    },
    {
      key: 'parecerista',
      label: 'Parecerista',
      render: (item) => item.parecerista
    },
    {
      key: 'notaFinal',
      label: 'Nota Final',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-md font-bold ${getNotaColor(item.notaFinal)}`}>
          {item.notaFinal.toFixed(1)}
        </span>
      )
    },
    {
      key: 'dataAvaliacao',
      label: 'Data da Avaliação',
      render: (item) => formatarData(item.dataAvaliacao)
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge className={getStatusBadge(item.status)}>
          {item.status}
        </Badge>
      )
    }
  ];

  // Configuração dos filtros
  const filters: ListFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Avaliado', label: 'Avaliado' },
        { value: 'Aprovado', label: 'Aprovado' },
        { value: 'Rejeitado', label: 'Rejeitado' }
      ]
    },
    {
      key: 'parecerista',
      label: 'Parecerista',
      type: 'select',
      options: [
        { value: 'Todos', label: 'Todos' },
        ...pareceristas.map(p => ({ value: p.nome, label: p.nome }))
      ]
    },
    {
      key: 'edital',
      label: 'Edital',
      type: 'select',
      options: [
        { value: 'Todos', label: 'Todos' },
        ...editais.map(e => ({ value: e.codigo, label: e.codigo }))
      ]
    }
  ];

  // Configuração das ações
  const actions: ListAction[] = [
    {
      key: 'view',
      label: 'Visualizar',
      icon: <Eye className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => setModalDetalhes({ aberto: true, avaliacao: item })
    },
    {
      key: 'approve',
      label: 'Aprovar',
      icon: <Check className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => setModalDecisao({ aberto: true, avaliacao: item, tipo: "aprovar" }),
      show: (item) => item.status === "Avaliado"
    },
    {
      key: 'reject',
      label: 'Rejeitar',
      icon: <X className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => setModalDecisao({ aberto: true, avaliacao: item, tipo: "rejeitar" }),
      show: (item) => item.status === "Avaliado"
    }
  ];

  // Ações em lote
  const bulkActions: ListAction[] = [
    {
      key: 'export',
      label: 'Exportar Selecionados',
      icon: <Download className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        exportarAvaliacoes();
      }
    },
    {
      key: 'approve',
      label: 'Aprovar Selecionados',
      icon: <Check className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        console.log('Aprovando avaliações:', items);
      }
    }
  ];

  // Cards de status
  const statusCards: StatusCard[] = [
    {
      title: 'Avaliações Recebidas',
      value: metricas.avaliacoesRecebidas,
      subtitle: 'prontas para análise',
      color: 'blue',
      icon: <FileCheck2 className="h-6 w-6" />
    },
    {
      title: 'Pendentes de Decisão',
      value: metricas.pendenteDecisao,
      subtitle: 'aguardando aprovação',
      color: 'orange',
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: 'Projetos Aprovados',
      value: metricas.projetosAprovados,
      subtitle: 'baseado nas avaliações',
      color: 'green',
      icon: <ThumbsUp className="h-6 w-6" />
    },
    {
      title: 'Nota Média Geral',
      value: metricas.notaMediaGeral,
      subtitle: 'qualidade dos projetos',
      color: 'purple',
      icon: <Star className="h-6 w-6" />
    }
  ];

  // Funções
  const getNotaColor = (nota: number) => {
    if (nota >= 60) return "text-green-600 bg-green-50"; // 85%+ da nota máxima (70)
    if (nota >= 50) return "text-blue-600 bg-blue-50";  // 70%+ da nota máxima (70)
    if (nota >= 40) return "text-orange-600 bg-orange-50"; // 55%+ da nota máxima (70)
    return "text-red-600 bg-red-50"; // Abaixo de 55%
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
    setFiltros({ busca: "", parecerista: "Todos", status: "Todos", edital: "Todos" });
  };

  const confirmarDecisao = async () => {
    if (!modalDecisao.avaliacao) return;

    try {
      if (modalDecisao.tipo === "aprovar") {
        await aprovarProjeto(modalDecisao.avaliacao.id, justificativa);
      } else {
        await rejeitarProjeto(modalDecisao.avaliacao.id, justificativa);
      }

      setModalDecisao({ aberto: false });
      setJustificativa("");
    } catch (error) {
      console.error('Erro ao confirmar decisão:', error);
    }
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

  const handleBaixarDocumentos = (avaliacao: Avaliacao) => {
    toast({
      title: "Download iniciado",
      description: `Baixando documentos do projeto "${avaliacao.projeto.nome}"`,
    });
  };

    return (
      <main className="flex-1 p-6 bg-prefeitura-accent">
        <div className="max-w-7xl mx-auto space-y-6">
        <Tabs defaultValue="avaliacoes" className="w-full">
          <TabsList>
            <TabsTrigger value="avaliacoes">Todas as Avaliações</TabsTrigger>
            <TabsTrigger value="ranking">Ranking por edital - Categoria</TabsTrigger>
          </TabsList>

          <TabsContent value="avaliacoes" className="space-y-6">
            <ListTemplate
              data={avaliacoesFiltradas}
              title="Avaliações"
              subtitle="Gerencie as avaliações dos pareceristas"
              columns={columns}
              filters={filters}
              actions={actions}
              bulkActions={bulkActions}
              statusCards={statusCards}
              searchable={true}
              selectable={true}
              sortable={true}
              loading={loading}
              error={error}
              onSearch={(term) => setFiltros(prev => ({ ...prev, busca: term }))}
              onFilterChange={(newFilters) => {
                setFiltros(prev => ({
                  ...prev,
                  status: newFilters.status || 'Todos',
                  parecerista: newFilters.parecerista || 'Todos',
                  edital: newFilters.edital || 'Todos'
                }));
              }}
              onSort={(column, direction) => console.log('Ordenação:', column, direction)}
              onSelect={(items) => console.log('Selecionados:', items)}
              onRefresh={() => window.location.reload()}
              headerActions={
                <div className="flex flex-wrap gap-4">
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
              }
            />
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            {/* Seleção de Edital */}
            <Card>
              <CardHeader>
                <CardTitle>1. Selecione o Edital</CardTitle>
                <CardDescription>Escolha o edital para visualizar o ranking</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={editalSelecionado} onValueChange={setEditalSelecionado}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um edital..." />
                  </SelectTrigger>
                  <SelectContent className="w-[600px] max-h-[60vh] overflow-y-auto">
                    {editais.map((edital) => (
                      <SelectItem key={edital.id} value={edital.nome} className="py-3">
                        <div className="flex flex-col space-y-1 w-full">
                          <div className="font-semibold text-sm truncate">
                            {edital.nome}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <strong>Código:</strong> {edital.codigo} | <strong>Fechamento:</strong> {edital.dataFechamento} às {edital.horarioFechamento}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Seleção de Categoria - só aparece após edital selecionado */}
            {editalSelecionado && (
              <Card>
                <CardHeader>
                  <CardTitle>2. Selecione a Categoria</CardTitle>
                  <CardDescription>Escolha a categoria cultural para o ranking</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Ranking de Projetos - só aparece após edital e categoria selecionados */}
            {editalSelecionado && categoriaSelecionada && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    3. Ranking de Projetos
                    <Badge className={getCategoriaColor(categoriaSelecionada)}>
                      {categoriaSelecionada}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Projetos da categoria {categoriaSelecionada} ordenados por nota final
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const projetosRanking = avaliacoes
                        .filter(a => a.projeto.categoria === categoriaSelecionada)
                        .sort((a, b) => b.notaFinal - a.notaFinal);

                      if (projetosRanking.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">
                              Nenhum projeto encontrado para a categoria {categoriaSelecionada}
                            </p>
                          </div>
                        );
                      }

                      return projetosRanking.map((avaliacao, index) => {
                        const getStatusColor = (status: string) => {
                          if (status === "Aprovado") return "green";
                          if (status === "Rejeitado") return "red";
                          return "gray";
                        };

                        const statusColor = getStatusColor(avaliacao.status);

                        return (
                          <Card
                            key={avaliacao.id}
                            className={`border-l-4 ${
                              statusColor === "green"
                                ? "border-l-green-500 bg-green-50"
                                : statusColor === "red"
                                ? "border-l-red-500 bg-red-50"
                                : "border-l-gray-400 bg-gray-50"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="grid grid-cols-2 gap-6 flex-1">
                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-xs text-gray-500 block">Posição no ranking</span>
                                      <span className="font-mono text-sm font-medium">#{index + 1}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block">Nº da inscrição</span>
                                      <span className="font-mono text-sm font-medium">{avaliacao.numeroInscricao || "N/A"}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block">Ano</span>
                                      <span className="text-sm">{avaliacao.ano || "2025"}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block">Proponente</span>
                                      <span className="text-sm">{avaliacao.proponente.nome}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-xs text-gray-500 block">Nome do projeto</span>
                                      <span className="font-medium text-sm">{avaliacao.projeto.nome}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block">Título do edital</span>
                                      <span className="text-sm">{avaliacao.edital || editalSelecionado || "N/A"}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block">Modalidade</span>
                                      <span className="text-sm">{avaliacao.projeto.categoria}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block">Nota final</span>
                                      <span className={`font-bold text-sm px-2 py-1 rounded ${getNotaColor(avaliacao.notaFinal)}`}>
                                        {avaliacao.notaFinal.toFixed(1)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 ml-4">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-3 py-1 ${
                                      statusColor === "green"
                                        ? "bg-green-100 text-green-800 border-green-300"
                                        : statusColor === "red"
                                        ? "bg-red-100 text-red-800 border-red-300"
                                        : "bg-gray-100 text-gray-800 border-gray-300"
                                    }`}
                                  >
                                    {avaliacao.status}
                                  </Badge>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                      onClick={() => handleBaixarDocumentos(avaliacao)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Baixar documentos
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instruções quando nada foi selecionado */}
            {!editalSelecionado && (
              <Card className="border-dashed">
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    <List className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Visualizar Ranking por Edital e Categoria</h3>
                    <p className="text-sm">
                      Para visualizar o ranking, primeiro selecione um edital, depois uma categoria.
                      Os projetos serão exibidos em ordem decrescente de nota final.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Detalhes da Avaliação */}
        <DetailsModal
          open={modalDetalhes.aberto}
          onClose={() => setModalDetalhes({ aberto: false })}
          title="Detalhes da Avaliação"
          data={modalDetalhes.avaliacao || {}}
          sections={modalDetalhes.avaliacao ? [
            {
              title: 'Informações do Projeto',
              fields: [
                { key: 'projeto.nome', label: 'Nome do Projeto', value: modalDetalhes.avaliacao.projeto.nome, type: 'text' },
                { key: 'projeto.categoria', label: 'Categoria', value: modalDetalhes.avaliacao.projeto.categoria, type: 'badge', color: 'info' },
                { key: 'proponente.nome', label: 'Proponente', value: modalDetalhes.avaliacao.proponente.nome, type: 'text' },
                { key: 'proponente.tipo', label: 'Tipo do Proponente', value: modalDetalhes.avaliacao.proponente.tipo, type: 'badge', color: 'default' }
              ]
            },
            {
              title: 'Informações da Avaliação',
              fields: [
                { key: 'parecerista', label: 'Parecerista', value: modalDetalhes.avaliacao.parecerista, type: 'text' },
                { key: 'dataAvaliacao', label: 'Data da Avaliação', value: modalDetalhes.avaliacao.dataAvaliacao, type: 'date' },
                { key: 'notaFinal', label: 'Nota Final', value: `${modalDetalhes.avaliacao.notaFinal.toFixed(1)}/70`, type: 'text' },
                { key: 'status', label: 'Status', value: modalDetalhes.avaliacao.status, type: 'badge', color: 'success' }
              ]
            },
            {
              title: 'Critérios de Avaliação',
              fields: [
                { key: 'criterios.relevancia', label: 'Relevância Cultural', value: modalDetalhes.avaliacao.criterios.relevancia, type: 'number' },
                { key: 'criterios.viabilidade', label: 'Viabilidade Técnica', value: modalDetalhes.avaliacao.criterios.viabilidade, type: 'number' },
                { key: 'criterios.impacto', label: 'Impacto Social', value: modalDetalhes.avaliacao.criterios.impacto, type: 'number' },
                { key: 'criterios.orcamento', label: 'Orçamento', value: modalDetalhes.avaliacao.criterios.orcamento, type: 'number' },
                { key: 'criterios.inovacao', label: 'Inovação', value: modalDetalhes.avaliacao.criterios.inovacao, type: 'number' },
                { key: 'criterios.sustentabilidade', label: 'Sustentabilidade', value: modalDetalhes.avaliacao.criterios.sustentabilidade, type: 'number' }
              ]
            },
            {
              title: 'Parecer Técnico',
              fields: [
                { key: 'parecerTecnico', label: 'Parecer', value: modalDetalhes.avaliacao.parecerTecnico, type: 'textarea' },
                { key: 'recomendacao', label: 'Recomendação', value: modalDetalhes.avaliacao.recomendacao, type: 'badge', color: modalDetalhes.avaliacao.recomendacao === "Aprovação" ? 'success' : 'destructive' }
              ]
            }
          ] : []}
          actions={[
            {
              key: 'approve',
              label: 'Aprovar Projeto',
              icon: <Check className="h-4 w-4" />,
              onClick: () => {
                        setModalDetalhes({ aberto: false });
                        setModalDecisao({ aberto: true, avaliacao: modalDetalhes.avaliacao, tipo: "aprovar" });
              },
              show: () => modalDetalhes.avaliacao?.status === "Avaliado"
            },
            {
              key: 'reject',
              label: 'Rejeitar Projeto',
              icon: <X className="h-4 w-4" />,
              onClick: () => {
                        setModalDetalhes({ aberto: false });
                        setModalDecisao({ aberto: true, avaliacao: modalDetalhes.avaliacao, tipo: "rejeitar" });
              },
              show: () => modalDetalhes.avaliacao?.status === "Avaliado"
            },
            {
              key: 'reassess',
              label: 'Solicitar Reavaliação',
              icon: <AlertTriangle className="h-4 w-4" />,
              onClick: () => console.log('Solicitando reavaliação'),
              show: () => modalDetalhes.avaliacao?.status === "Avaliado"
            }
          ]}
        />

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