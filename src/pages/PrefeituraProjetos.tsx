import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ListTemplate, 
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard
} from "@/components/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye,
  FileText,
  Building2,
  LogOut,
  ArrowLeft,
  Filter,
  Search,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  Archive,
  Download
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { useProjetosEdital } from "@/hooks/useProjetosEdital";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";
import { Projeto } from "@/services/projetoService";
import { gerarPDF } from "@/utils/pdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import { recursosService, Recurso } from "@/services/recursosService";
import { AlertCircle, MessageSquare, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PrefeituraProjetos = () => {
  const { nomePrefeitura, editalId } = useParams<{ nomePrefeitura: string; editalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { prefeitura } = usePrefeituraAuth();

  const {
    projetos,
    loading,
    error,
    updateStatus,
    getStats,
    refresh
  } = useProjetosEdital(editalId || '');

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<Projeto[]>([]);


  // Estado para recursos pendentes (para badges)
  const [recursosPendentes, setRecursosPendentes] = useState<{ recursos: number; contraRazoes: number; total: number }>({ recursos: 0, contraRazoes: 0, total: 0 });
  // Estado para todos os recursos/contra-razões (para exibir nas abas)
  const [projetosComRecursos, setProjetosComRecursos] = useState<Array<{ projeto: any; recurso: Recurso }>>([]);
  const [projetosComContraRazoes, setProjetosComContraRazoes] = useState<Array<{ projeto: any; contraRazao: Recurso }>>([]);
  const [activeTab, setActiveTab] = useState<'projetos' | 'recursos' | 'contra_razao'>('projetos');
  const [showModalResponder, setShowModalResponder] = useState(false);
  const [recursoParaResponder, setRecursoParaResponder] = useState<Recurso | null>(null);
  const [respostaRecurso, setRespostaRecurso] = useState('');
  const [statusResposta, setStatusResposta] = useState<'deferido' | 'indeferido'>('deferido');
  const [respondendoRecurso, setRespondendoRecurso] = useState(false);
  const [projetoProcessando, setProjetoProcessando] = useState<string | null>(null);
  const { user, profile } = usePrefeituraAuth();


  // Buscar recursos pendentes (para badges) e todos os recursos/contra-razões (para abas)
  useEffect(() => {
    const carregarRecursos = async () => {
      if (editalId) {
        // Buscar apenas pendentes para os badges
        const dados = await recursosService.getPendentesByEdital(editalId);
        setRecursosPendentes(dados);
        
        // Buscar TODOS os recursos e contra-razões para exibir nas abas
        const projetosRecursos = await recursosService.getProjetosComRecursos(editalId);
        const projetosContraRazoes = await recursosService.getProjetosComContraRazoes(editalId);
        setProjetosComRecursos(projetosRecursos);
        setProjetosComContraRazoes(projetosContraRazoes);
      }
    };
    carregarRecursos();
  }, [editalId]);

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...projetos];

    // Filtro por texto (nome e número de inscrição)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(term) || 
        item.numero_inscricao.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (activeFilters.status && activeFilters.status !== 'all') {
      filtered = filtered.filter(item => item.status === activeFilters.status);
    }

    // Filtro por modalidade
    if (activeFilters.modalidade && activeFilters.modalidade !== 'all') {
      filtered = filtered.filter(item => item.modalidade === activeFilters.modalidade);
    }

    setFilteredData(filtered);
  }, [projetos, searchTerm, activeFilters]);

  // Funções de busca e filtro
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setActiveFilters(newFilters);
  };

  // Obter estatísticas
  const stats = getStats();

  // Configuração das colunas
  const columns: ListColumn[] = [
    {
      key: 'numero_inscricao',
      label: 'Nº Inscrição',
      sortable: true,
      render: (item) => (
        <div className="font-mono text-sm font-medium text-blue-600">
          {item.numero_inscricao}
        </div>
      )
    },
    {
      key: 'nome',
      label: 'Nome do Projeto',
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-900 truncate">{item.nome}</p>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.descricao}</p>
        </div>
      )
    },
    {
      key: 'modalidade',
      label: 'Modalidade',
      render: (item) => (
        <Badge variant="outline" className="text-xs">
          {item.modalidade}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => {
        const statusConfig = {
          'rascunho': { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: <FileText className="h-3 w-3" /> },
          'aguardando_parecerista': { label: 'Aguardando Parecerista', color: 'bg-orange-100 text-orange-800', icon: <Clock className="h-3 w-3" /> },
          'aguardando_avaliacao': { label: 'Aguardando Avaliação', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
          'recebido': { label: 'Recebido', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-3 w-3" /> },
          'em_avaliacao': { label: 'Em Avaliação', color: 'bg-orange-100 text-orange-800', icon: <Search className="h-3 w-3" /> },
          'avaliado': { label: 'Avaliado', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="h-3 w-3" /> },
          'habilitado': { label: 'Habilitado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
          'nao_habilitado': { label: 'Não Habilitado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
          'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
          'rejeitado': { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
          'em_execucao': { label: 'Em Execução', color: 'bg-purple-100 text-purple-800', icon: <PlayCircle className="h-3 w-3" /> },
          'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> }
        };
        
        const config = statusConfig[item.status] || statusConfig['rascunho'];
        
        return (
          <Badge className={`${config.color} flex items-center gap-1`}>
            {config.icon}
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'data_submissao',
      label: 'Data Submissão',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {item.data_submissao ? new Date(item.data_submissao).toLocaleDateString('pt-BR') : '-'}
        </div>
      )
    },
    {
      key: 'valor_solicitado',
      label: 'Valor Solicitado',
      render: (item) => (
        <div className="text-sm font-medium text-gray-900">
          R$ {item.valor_solicitado?.toLocaleString('pt-BR') || '0'}
        </div>
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
        { value: 'aguardando_avaliacao', label: 'Aguardando Avaliação' },
        { value: 'recebido', label: 'Recebido' },
        { value: 'em_avaliacao', label: 'Em Avaliação' },
        { value: 'avaliado', label: 'Avaliado' },
        { value: 'aprovado', label: 'Aprovado' },
        { value: 'rejeitado', label: 'Rejeitado' },
        { value: 'em_execucao', label: 'Em Execução' },
        { value: 'concluido', label: 'Concluído' }
      ]
    },
    {
      key: 'modalidade',
      label: 'Modalidade',
      type: 'select',
      options: [
        { value: 'musica', label: 'Música' },
        { value: 'teatro', label: 'Teatro' },
        { value: 'danca', label: 'Dança' },
        { value: 'artes_visuais', label: 'Artes Visuais' },
        { value: 'literatura', label: 'Literatura' },
        { value: 'cinema', label: 'Cinema' },
        { value: 'cultura_popular', label: 'Cultura Popular' },
        { value: 'circo', label: 'Circo' },
        { value: 'outros', label: 'Outros' }
      ]
    }
  ];

  // Função para aprovar projeto
  const handleAprovarProjeto = async (projeto: Projeto) => {
    try {
      setProjetoProcessando(projeto.id);
      const { error } = await (supabase
        .from('projetos') as any)
        .update({ status: 'aprovado' })
        .eq('id', projeto.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Projeto "${projeto.nome}" aprovado com sucesso!`,
      });

      // Recarregar projetos
      await refresh();
    } catch (error) {
      console.error('Erro ao aprovar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar projeto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProjetoProcessando(null);
    }
  };

  // Função para recusar projeto
  const handleRecusarProjeto = async (projeto: Projeto) => {
    try {
      setProjetoProcessando(projeto.id);
      const { error } = await (supabase
        .from('projetos') as any)
        .update({ status: 'rejeitado' })
        .eq('id', projeto.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Projeto "${projeto.nome}" recusado com sucesso!`,
      });

      // Recarregar projetos
      await refresh();
    } catch (error) {
      console.error('Erro ao recusar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao recusar projeto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProjetoProcessando(null);
    }
  };

  // Configuração das ações
  const actions: ListAction[] = [
    {
      key: 'ver_projeto',
      label: 'Ver Projeto',
      icon: <Eye className="h-4 w-4" />,
      variant: 'default',
      onClick: (item) => {
        navigate(`/${nomePrefeitura}/editais/${editalId}/projetos/${item.id}`);
      }
    },
    {
      key: 'aprovar',
      label: 'Aprovar',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'default',
      onClick: (item) => handleAprovarProjeto(item),
      show: (item) => item.status === 'habilitado',
      className: 'bg-green-600 hover:bg-green-700 text-white',
      loading: (item) => projetoProcessando === item.id
    },
    {
      key: 'recusar',
      label: 'Recusar',
      icon: <XCircle className="h-4 w-4" />,
      variant: 'default',
      onClick: (item) => handleRecusarProjeto(item),
      show: (item) => item.status === 'habilitado',
      className: 'bg-red-600 hover:bg-red-700 text-white',
      loading: (item) => projetoProcessando === item.id
    }
  ];

  // Cards de status
  const statusCards: StatusCard[] = [
    {
      title: 'Total de Projetos',
      value: stats.total.toString(),
      subtitle: 'Inscritos no edital',
      icon: <FileText className="h-4 w-4" />,
      color: 'blue'
    },
    {
      title: 'Aguardando Avaliação',
      value: stats.aguardando_avaliacao.toString(),
      subtitle: 'Aguardando início da avaliação',
      icon: <Clock className="h-4 w-4" />,
      color: 'orange'
    },
    {
      title: 'Em Avaliação',
      value: stats.em_avaliacao.toString(),
      subtitle: 'Sendo avaliados',
      icon: <Search className="h-4 w-4" />,
      color: 'orange'
    },
    {
      title: 'Aprovados',
      value: stats.aprovados.toString(),
      subtitle: 'Projetos aprovados',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'green'
    },
    {
      title: 'Rejeitados',
      value: stats.rejeitados.toString(),
      subtitle: 'Projetos rejeitados',
      icon: <XCircle className="h-4 w-4" />,
      color: 'red'
    },
    {
      title: 'Valor Total',
      value: `R$ ${stats.valor_total.toLocaleString('pt-BR')}`,
      subtitle: 'Valor solicitado',
      icon: <DollarSign className="h-4 w-4" />,
      color: 'purple'
    },
    {
      title: 'Recursos Pendentes',
      value: recursosPendentes.recursos.toString(),
      subtitle: 'Aguardando resposta',
      icon: <AlertCircle className="h-4 w-4" />,
      color: recursosPendentes.recursos > 0 ? 'red' : 'gray'
    },
    {
      title: 'Contra-razões Pendentes',
      value: recursosPendentes.contraRazoes.toString(),
      subtitle: 'Aguardando resposta',
      icon: <AlertCircle className="h-4 w-4" />,
      color: recursosPendentes.contraRazoes > 0 ? 'orange' : 'gray'
    }
  ];

  if (error) {
    return (
      <PrefeituraLayout 
        title="Projetos do Edital" 
        description="Visualize os projetos submetidos para este edital"
      >
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar projetos: {error}</p>
            <Button onClick={refresh} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </PrefeituraLayout>
    );
  }

  return (
    <PrefeituraLayout 
      title="Projetos do Edital" 
      description="Visualize os projetos submetidos para este edital"
    >
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/${nomePrefeitura}/editais`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Editais
          </Button>
          <Button
            onClick={() => {
              navigate(`/${nomePrefeitura}/editais/${editalId}/exportar-ranking`);
            }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Ranking
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="projetos">Projetos</TabsTrigger>
            <TabsTrigger value="recursos">
              Recursos
              {recursosPendentes.recursos > 0 && (
                <Badge className="ml-2 bg-red-500">{recursosPendentes.recursos}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contra_razao">
              Contra-razão
              {recursosPendentes.contraRazoes > 0 && (
                <Badge className="ml-2 bg-orange-500">{recursosPendentes.contraRazoes}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projetos" className="space-y-4">
            <ListTemplate
              data={filteredData}
              title="Projetos do Edital"
              subtitle="Visualize e gerencie os projetos submetidos para este edital"
              columns={columns}
              filters={filters}
              actions={actions}
              statusCards={statusCards}
              searchable={true}
              selectable={false}
              sortable={true}
              loading={loading}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              onSort={(column, direction) => console.log('Ordenação:', column, direction)}
              onRefresh={refresh}
            />
          </TabsContent>

          <TabsContent value="recursos" className="space-y-4">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              {projetosComRecursos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum recurso encontrado</p>
              ) : (
                <div className="space-y-4">
                  {projetosComRecursos.map((item) => (
                    <div key={item.recurso.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{item.projeto.nome}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.projeto.numero_inscricao}
                            </Badge>
                            <Badge 
                              className={
                                item.recurso.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                item.recurso.status === 'em_analise' ? 'bg-blue-100 text-blue-800' :
                                item.recurso.status === 'deferido' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {item.recurso.status === 'pendente' ? 'Pendente' :
                               item.recurso.status === 'em_analise' ? 'Em Análise' :
                               item.recurso.status === 'deferido' ? 'Deferido' :
                               'Indeferido'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Justificativa:</strong> {item.recurso.justificativa}
                          </p>
                          {item.recurso.resposta && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-1">Resposta:</p>
                              <p className="text-sm text-gray-600">{item.recurso.resposta}</p>
                              {item.recurso.data_resposta && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Respondido em: {new Date(item.recurso.data_resposta).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Enviado em: {new Date(item.recurso.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {item.recurso.status === 'pendente' && (
                          <Button
                            onClick={() => {
                              setRecursoParaResponder(item.recurso);
                              setShowModalResponder(true);
                              setRespostaRecurso('');
                              setStatusResposta('deferido');
                            }}
                            className="ml-4"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Responder Recurso
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contra_razao" className="space-y-4">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Contra-razões</h3>
              {projetosComContraRazoes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma contra-razão encontrada</p>
              ) : (
                <div className="space-y-4">
                  {projetosComContraRazoes.map((item) => (
                    <div key={item.contraRazao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{item.projeto.nome}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.projeto.numero_inscricao}
                            </Badge>
                            <Badge 
                              className={
                                item.contraRazao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                item.contraRazao.status === 'em_analise' ? 'bg-blue-100 text-blue-800' :
                                item.contraRazao.status === 'deferido' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {item.contraRazao.status === 'pendente' ? 'Pendente' :
                               item.contraRazao.status === 'em_analise' ? 'Em Análise' :
                               item.contraRazao.status === 'deferido' ? 'Deferido' :
                               'Indeferido'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Justificativa:</strong> {item.contraRazao.justificativa}
                          </p>
                          {item.contraRazao.resposta && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-1">Resposta:</p>
                              <p className="text-sm text-gray-600">{item.contraRazao.resposta}</p>
                              {item.contraRazao.data_resposta && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Respondido em: {new Date(item.contraRazao.data_resposta).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Enviado em: {new Date(item.contraRazao.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {item.contraRazao.status === 'pendente' && (
                          <Button
                            onClick={() => {
                              setRecursoParaResponder(item.contraRazao);
                              setShowModalResponder(true);
                              setRespostaRecurso('');
                              setStatusResposta('deferido');
                            }}
                            className="ml-4"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Responder Contra-razão
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Responder Recurso/Contra-razão */}
      <Dialog open={showModalResponder} onOpenChange={setShowModalResponder}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Responder {recursoParaResponder?.tipo === 'recurso' ? 'Recurso' : 'Contra-razão'}
            </DialogTitle>
            <DialogDescription>
              Forneça uma resposta para o {recursoParaResponder?.tipo === 'recurso' ? 'recurso' : 'contra-razão'} e defina o status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {recursoParaResponder && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Justificativa do {recursoParaResponder.tipo === 'recurso' ? 'recurso' : 'contra-razão'}:</p>
                <p className="text-sm text-gray-600">{recursoParaResponder.justificativa}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="status">Status da Resposta</Label>
              <Select value={statusResposta} onValueChange={(v) => setStatusResposta(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deferido">Deferido</SelectItem>
                  <SelectItem value="indeferido">Indeferido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resposta">Resposta</Label>
              <Textarea
                id="resposta"
                placeholder="Digite sua resposta..."
                value={respostaRecurso}
                onChange={(e) => setRespostaRecurso(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModalResponder(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!recursoParaResponder || !respostaRecurso.trim()) {
                  toast({
                    title: "Erro",
                    description: "Por favor, preencha a resposta.",
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  setRespondendoRecurso(true);
                  await recursosService.update(recursoParaResponder.id, {
                    resposta: respostaRecurso,
                    status: statusResposta,
                    respondido_por: profile?.id || user?.id
                  });

                  toast({
                    title: "Sucesso",
                    description: `${recursoParaResponder.tipo === 'recurso' ? 'Recurso' : 'Contra-razão'} respondido com sucesso!`,
                  });

                  // Recarregar dados
                  const dados = await recursosService.getPendentesByEdital(editalId || '');
                  setRecursosPendentes(dados);
                  // Recarregar todos os recursos/contra-razões (não apenas pendentes)
                  const projetosRecursos = await recursosService.getProjetosComRecursos(editalId || '');
                  const projetosContraRazoes = await recursosService.getProjetosComContraRazoes(editalId || '');
                  setProjetosComRecursos(projetosRecursos);
                  setProjetosComContraRazoes(projetosContraRazoes);

                  setShowModalResponder(false);
                  setRecursoParaResponder(null);
                  setRespostaRecurso('');
                } catch (error: any) {
                  console.error('Erro ao responder recurso:', error);
                  const errorMessage = error?.message || error?.error?.message || 'Erro desconhecido';
                  toast({
                    title: "Erro",
                    description: errorMessage || "Não foi possível responder. Tente novamente.",
                    variant: "destructive"
                  });
                } finally {
                  setRespondendoRecurso(false);
                }
              }}
              disabled={respondendoRecurso}
            >
              {respondendoRecurso ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Resposta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PrefeituraLayout>
  );
};