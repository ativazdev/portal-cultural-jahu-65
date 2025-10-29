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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { useProjetosEdital } from "@/hooks/useProjetosEdital";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";
import { Projeto } from "@/services/projetoService";
import { gerarPDF } from "@/utils/pdfGenerator";

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

  // Estados para modal de exportação
  const [showExportModal, setShowExportModal] = useState(false);
  const [tipoExportacao, setTipoExportacao] = useState<'ranking' | 'aprovados' | 'proponentes'>('ranking');
  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState<string[]>([]);

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
          'aguardando_avaliacao': { label: 'Aguardando Avaliação', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
          'recebido': { label: 'Recebido', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-3 w-3" /> },
          'em_avaliacao': { label: 'Em Avaliação', color: 'bg-orange-100 text-orange-800', icon: <Search className="h-3 w-3" /> },
          'avaliado': { label: 'Avaliado', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="h-3 w-3" /> },
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
      color: 'yellow'
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
              setShowExportModal(true);
              setModalidadesSelecionadas([]);
            }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

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
      </div>

      {/* Modal de Exportação */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exportar Projetos</DialogTitle>
            <DialogDescription>
              Selecione o tipo de exportação e as modalidades desejadas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Tipo de Exportação */}
            <div className="space-y-3">
              <Label>Tipo de Exportação</Label>
              <div className="grid grid-cols-1 gap-3">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    tipoExportacao === 'ranking' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTipoExportacao('ranking')}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      tipoExportacao === 'ranking' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {tipoExportacao === 'ranking' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <h4 className="font-medium">Ranking de Classificação</h4>
                      <p className="text-sm text-gray-500">Separados por modalidade</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    tipoExportacao === 'aprovados' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTipoExportacao('aprovados')}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      tipoExportacao === 'aprovados' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {tipoExportacao === 'aprovados' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <h4 className="font-medium">Projetos Aprovados</h4>
                      <p className="text-sm text-gray-500">Separados por modalidade</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    tipoExportacao === 'proponentes' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTipoExportacao('proponentes')}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      tipoExportacao === 'proponentes' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {tipoExportacao === 'proponentes' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <h4 className="font-medium">Proponentes Contemplados</h4>
                      <p className="text-sm text-gray-500">Com dados do projeto, separados por modalidade</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modalidades */}
            <div className="space-y-3">
              <Label>Modalidades</Label>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {Array.from(new Set(projetos.map(p => p.modalidade))).map((modalidade) => (
                  <div key={modalidade} className="flex items-center space-x-2">
                    <Checkbox
                      id={`modalidade-${modalidade}`}
                      checked={modalidadesSelecionadas.includes(modalidade)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setModalidadesSelecionadas([...modalidadesSelecionadas, modalidade]);
                        } else {
                          setModalidadesSelecionadas(modalidadesSelecionadas.filter(m => m !== modalidade));
                        }
                      }}
                    />
                    <Label htmlFor={`modalidade-${modalidade}`} className="text-sm cursor-pointer">
                      {modalidade}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                try {
                  // Filtrar projetos pelas modalidades selecionadas
                  const projetosParaExportar = projetos.filter(p => 
                    modalidadesSelecionadas.includes(p.modalidade)
                  );

                  if (projetosParaExportar.length === 0) {
                    toast({
                      title: "Atenção",
                      description: "Nenhum projeto encontrado para as modalidades selecionadas.",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Gerar PDF
                  await gerarPDF({
                    tipo: tipoExportacao,
                    modalidades: modalidadesSelecionadas,
                    projetos: projetosParaExportar,
                  });

                  toast({
                    title: "Sucesso",
                    description: "PDF gerado com sucesso!",
                  });

                  setShowExportModal(false);
                } catch (error) {
                  console.error('Erro ao gerar PDF:', error);
                  toast({
                    title: "Erro",
                    description: "Erro ao gerar PDF. Tente novamente.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={modalidadesSelecionadas.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PrefeituraLayout>
  );
};