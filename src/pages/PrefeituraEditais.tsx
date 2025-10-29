import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ListTemplate, 
  ConfirmationModal,
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard
} from "@/components/templates";
import { EditalModal } from "@/components/EditalModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Archive, 
  ArchiveRestore,
  Eye,
  FileText,
  Building2,
  LogOut,
  Calendar,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { useEditaisPrefeitura } from "@/hooks/useEditaisPrefeitura";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";
import { Edital } from "@/services/editalService";

export const PrefeituraEditais = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { prefeitura, user } = usePrefeituraAuth();

  const {
    editais,
    loading,
    error,
    createEdital,
    updateEdital,
    deleteEdital,
    toggleStatus,
    refresh
  } = useEditaisPrefeitura(prefeitura?.id || '');

  const [modalAberto, setModalAberto] = useState(false);
  const [editalEditando, setEditalEditando] = useState<Edital | null>(null);
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    edital: Edital | null;
    acao: 'arquivar' | 'desarquivar' | 'excluir' | null;
  }>({ aberto: false, edital: null, acao: null });

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<Edital[]>([]);

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...editais];

    // Filtro por texto (nome e código)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(term) || 
        item.codigo.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (activeFilters.status && activeFilters.status !== 'all') {
      filtered = filtered.filter(item => item.status === activeFilters.status);
    }

    setFilteredData(filtered);
  }, [editais, searchTerm, activeFilters]);

  // Funções de busca e filtro
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setActiveFilters(newFilters);
  };

  // Configuração das colunas
  const columns: ListColumn[] = [
    {
      key: 'codigo',
      label: 'Código',
      sortable: true,
      render: (item) => (
        <div className="font-mono text-sm font-medium text-blue-600">
          {item.codigo}
        </div>
      )
    },
    {
      key: 'nome',
      label: 'Nome do Edital',
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-900 truncate">{item.nome}</p>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.descricao}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge 
          className={
            item.status === 'aberto' ? 'bg-green-100 text-green-800' :
            item.status === 'rascunho' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }
        >
          {item.status === 'aberto' ? 'Ativo' : 
           item.status === 'rascunho' ? 'Rascunho' : 'Arquivado'}
        </Badge>
      )
    },
    {
      key: 'data_abertura',
      label: 'Data de Abertura',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {new Date(item.data_abertura).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      key: 'data_final_envio_projeto',
      label: 'Prazo Final',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {new Date(item.data_final_envio_projeto).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      key: 'total_projetos',
      label: 'Projetos',
      render: (item) => (
        <div className="text-sm font-medium text-gray-900">
          {item.total_projetos}
        </div>
      )
    },
    {
      key: 'valor_maximo',
      label: 'Valor Máximo',
      render: (item) => (
        <div className="text-sm font-medium text-gray-900">
          R$ {item.valor_maximo?.toLocaleString('pt-BR') || 'N/A'}
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
        { value: 'aberto', label: 'Ativo' },
        { value: 'rascunho', label: 'Rascunho' },
        { value: 'arquivado', label: 'Arquivado' }
      ]
    }
  ];

  // Configuração das ações
  const actions: ListAction[] = [
    {
      key: 'editar',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      variant: 'outline',
      onClick: (item) => {
        setEditalEditando(item);
        setModalAberto(true);
      }
    },
    {
      key: 'arquivar',
      label: 'Arquivar',
      icon: <Archive className="h-4 w-4" />,
      variant: 'outline',
      onClick: (item) => {
        setModalConfirmacao({ aberto: true, edital: item, acao: 'arquivar' });
      },
      show: (item) => item.status === 'aberto'
    },
    {
      key: 'desarquivar',
      label: 'Desarquivar',
      icon: <ArchiveRestore className="h-4 w-4" />,
      variant: 'outline',
      onClick: (item) => {
        setModalConfirmacao({ aberto: true, edital: item, acao: 'desarquivar' });
      },
      show: (item) => item.status === 'arquivado'
    },
    {
      key: 'ver_projetos',
      label: 'Ver Projetos',
      icon: <Eye className="h-4 w-4" />,
      variant: 'default',
      onClick: (item) => {
        navigate(`/${nomePrefeitura}/editais/${item.id}/projetos`);
      }
    }
  ];

  // Ações em lote
  const bulkActions: ListAction[] = [
    {
      key: 'arquivar_lote',
      label: 'Arquivar Selecionados',
      icon: <Archive className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        console.log('Arquivar em lote:', items);
      }
    }
  ];

  // Cards de status
  const statusCards: StatusCard[] = [
    {
      title: 'Total de Editais',
      value: editais.length.toString(),
      subtitle: 'Cadastrados no sistema',
      icon: <FileText className="h-4 w-4" />,
      color: 'blue'
    },
    {
      title: 'Editais Ativos',
      value: editais.filter(e => e.status === 'aberto').length.toString(),
      subtitle: 'Em andamento',
      icon: <Calendar className="h-4 w-4" />,
      color: 'green'
    },
    {
      title: 'Rascunhos',
      value: editais.filter(e => e.status === 'rascunho').length.toString(),
      subtitle: 'Em elaboração',
      icon: <Edit className="h-4 w-4" />,
      color: 'orange'
    },
    {
      title: 'Arquivados',
      value: editais.filter(e => e.status === 'arquivado').length.toString(),
      subtitle: 'Finalizados',
      icon: <Archive className="h-4 w-4" />,
      color: 'gray'
    }
  ];

  // Handlers
  const handleNovoEdital = () => {
    setEditalEditando(null);
    setModalAberto(true);
  };

  const handleSalvarEdital = async (dados: any) => {
    try {
      if (editalEditando) {
        const success = await updateEdital(editalEditando.id, dados);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Edital atualizado com sucesso!",
          });
          setModalAberto(false);
          setEditalEditando(null);
        } else {
          toast({
            title: "Erro",
            description: "Erro ao atualizar edital. Tente novamente.",
            variant: "destructive",
          });
        }
      } else {
        const success = await createEdital(dados, user?.id || '');
        if (success) {
          toast({
            title: "Sucesso",
            description: "Edital criado com sucesso!",
          });
          setModalAberto(false);
          setEditalEditando(null);
        } else {
          toast({
            title: "Erro",
            description: "Erro ao criar edital. Tente novamente.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar edital:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar edital. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExecutarAcao = async () => {
    const { edital, acao } = modalConfirmacao;
    if (!edital) return;

    try {
      switch (acao) {
        case 'arquivar':
          await toggleStatus(edital.id, 'arquivado');
          break;
        case 'desarquivar':
          await toggleStatus(edital.id, 'aberto');
          break;
        case 'excluir':
          await deleteEdital(edital.id);
          break;
      }
      setModalConfirmacao({ aberto: false, edital: null, acao: null });
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  if (error) {
    return (
      <PrefeituraLayout 
        title="Editais" 
        description="Gerencie os editais da prefeitura"
      >
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar editais: {error}</p>
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
      title="Editais" 
      description="Gerencie os editais da prefeitura"
    >
      <div className="p-6">
        <ListTemplate
          data={filteredData}
          title="Gerenciar Editais"
          subtitle="Cadastre e gerencie os editais de projetos culturais"
          columns={columns}
          filters={filters}
          actions={actions}
          bulkActions={bulkActions}
          statusCards={statusCards}
          searchable={true}
          selectable={true}
          sortable={true}
          loading={loading}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onSort={(column, direction) => console.log('Ordenação:', column, direction)}
          onSelect={(items) => console.log('Selecionados:', items)}
          onRefresh={refresh}
          headerActions={
            <Button onClick={handleNovoEdital} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Edital
            </Button>
          }
        />

        {/* Modal de Cadastro/Edição */}
        <EditalModal
          open={modalAberto}
          onClose={() => {
            setModalAberto(false);
            setEditalEditando(null);
          }}
          onSave={handleSalvarEdital}
          edital={editalEditando}
          loading={loading}
        />

        {/* Modal de Confirmação */}
        <ConfirmationModal
          open={modalConfirmacao.aberto}
          onClose={() => setModalConfirmacao({ aberto: false, edital: null, acao: null })}
          onConfirm={handleExecutarAcao}
          title={`${modalConfirmacao.acao === 'arquivar' ? 'Arquivar' : modalConfirmacao.acao === 'desarquivar' ? 'Desarquivar' : 'Excluir'} Edital`}
          description={`Tem certeza que deseja ${modalConfirmacao.acao === 'arquivar' ? 'arquivar' : modalConfirmacao.acao === 'desarquivar' ? 'desarquivar' : 'excluir'} o edital "${modalConfirmacao.edital?.nome}"?`}
          confirmText={modalConfirmacao.acao === 'arquivar' ? 'Arquivar' : modalConfirmacao.acao === 'desarquivar' ? 'Desarquivar' : 'Excluir'}
          cancelText="Cancelar"
          variant={modalConfirmacao.acao === 'excluir' ? 'destructive' : 'default'}
          loading={loading}
        />
      </div>
    </PrefeituraLayout>
  );
};