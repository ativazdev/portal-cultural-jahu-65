import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ListTemplate, 
  ModalTemplate,
  ConfirmationModal,
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard
} from "@/components/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail,
  Building2,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { PareceristaModal } from "@/components/PareceristaModal";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";
import { usePareceristas } from "@/hooks/usePareceristas";
import { Parecerista } from "@/services/pareceristaService";


export const PrefeituraPareceristas = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { prefeitura, isAuthenticated } = usePrefeituraAuth();
  
  const {
    pareceristas,
    loading,
    error,
    createParecerista,
    updateParecerista,
    toggleStatus,
    deleteParecerista
  } = usePareceristas(prefeitura?.id || '');
  
  const [modalAberto, setModalAberto] = useState(false);
  const [pareceristaEditando, setPareceristaEditando] = useState<Parecerista | null>(null);
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    parecerista: Parecerista | null;
    acao: 'ativar' | 'inativar' | 'excluir' | null;
  }>({ aberto: false, parecerista: null, acao: null });
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<Parecerista[]>([]);

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...pareceristas];

    // Filtro por texto (nome e email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(term) || 
        item.email.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (activeFilters.status && activeFilters.status !== 'all') {
      filtered = filtered.filter(item => item.status === activeFilters.status);
    }

    // Filtro por especialidades
    if (activeFilters.especialidades && activeFilters.especialidades !== 'all') {
      filtered = filtered.filter(item => 
        item.especialidades && item.especialidades.includes(activeFilters.especialidades)
      );
    }

    setFilteredData(filtered);
  }, [pareceristas, searchTerm, activeFilters]);

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
      key: 'nome',
      label: 'Nome',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.nome}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
        </div>
      )
    },
    {
      key: 'area_atuacao',
      label: 'Área de Atuação',
      render: (item) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {item.area_atuacao}
        </Badge>
      )
    },
    {
      key: 'especialidade',
      label: 'Especialidades',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.especialidades.slice(0, 2).map((esp, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {esp}
            </Badge>
          ))}
          {item.especialidades.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{item.especialidades.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'experiencia_anos',
      label: 'Experiência',
      render: (item) => `${item.experiencia_anos || 0} anos`
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge className={item.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {item.status === 'ativo' ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'ultimo_acesso',
      label: 'Último Acesso',
      render: (item) => item.ultimo_acesso ? 
        new Date(item.ultimo_acesso).toLocaleDateString('pt-BR') : 
        'Nunca'
    }
  ];

  // Configuração dos filtros
  const filters: ListFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' }
      ]
    },
    {
      key: 'especialidades',
      label: 'Especialidades',
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
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleEditarParecerista(item)
    },
    {
      key: 'activate',
      label: 'Ativar',
      icon: <UserCheck className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleConfirmarAcao(item, 'ativar'),
      show: (item) => item.status === 'inativo'
    },
    {
      key: 'deactivate',
      label: 'Inativar',
      icon: <UserX className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleConfirmarAcao(item, 'inativar'),
      show: (item) => item.status === 'ativo'
    },
    {
      key: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleConfirmarAcao(item, 'excluir')
    }
  ];

  // Ações em lote
  const bulkActions: ListAction[] = [
    {
      key: 'activate',
      label: 'Ativar Selecionados',
      icon: <UserCheck className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        console.log('Ativando pareceristas:', items);
        toast({
          title: "Pareceristas ativados",
          description: `${items.length} pareceristas foram ativados.`,
        });
      }
    },
    {
      key: 'deactivate',
      label: 'Inativar Selecionados',
      icon: <UserX className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        console.log('Inativando pareceristas:', items);
        toast({
          title: "Pareceristas inativados",
          description: `${items.length} pareceristas foram inativados.`,
        });
      }
    }
  ];

  // Cards de status
  const statusCards: StatusCard[] = [
    {
      title: 'Total de Pareceristas',
      value: pareceristas.length,
      subtitle: 'cadastrados',
      color: 'blue',
      icon: <UserCheck className="h-6 w-6" />
    },
    {
      title: 'Pareceristas Ativos',
      value: pareceristas.filter(p => p.status === 'ativo').length,
      subtitle: 'em atividade',
      color: 'green',
      icon: <UserCheck className="h-6 w-6" />
    },
    {
      title: 'Pareceristas Inativos',
      value: pareceristas.filter(p => p.status === 'inativo').length,
      subtitle: 'inativos',
      color: 'red',
      icon: <UserX className="h-6 w-6" />
    }
  ];

  const handleNovoParecerista = () => {
    setPareceristaEditando(null);
    setModalAberto(true);
  };

  const handleEditarParecerista = (parecerista: Parecerista) => {
    setPareceristaEditando(parecerista);
    setModalAberto(true);
  };

  const handleConfirmarAcao = (parecerista: Parecerista, acao: 'ativar' | 'inativar' | 'excluir') => {
    setModalConfirmacao({ aberto: true, parecerista, acao });
  };

  const handleExecutarAcao = async () => {
    const { parecerista, acao } = modalConfirmacao;
    if (!parecerista) return;

    try {
      switch (acao) {
        case 'ativar':
          await toggleStatus(parecerista.id, 'ativo');
          break;
        case 'inativar':
          await toggleStatus(parecerista.id, 'inativo');
          break;
        case 'excluir':
          await deleteParecerista(parecerista.id);
          break;
      }
      setModalConfirmacao({ aberto: false, parecerista: null, acao: null });
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  const handleSalvarParecerista = async (dados: any) => {
    try {
      if (pareceristaEditando) {
        // Editar parecerista existente
        const success = await updateParecerista(pareceristaEditando.id, dados);
        if (success) {
          setModalAberto(false);
          setPareceristaEditando(null);
        }
      } else {
        // Criar novo parecerista
        const success = await createParecerista(dados);
        if (success) {
          setModalAberto(false);
          setPareceristaEditando(null);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar parecerista:', error);
    }
  };

  return (
    <PrefeituraLayout 
      title="Pareceristas" 
      description="Gerencie os pareceristas da prefeitura"
    >
      <ListTemplate
          data={filteredData}
          title="Gerenciar Pareceristas"
          subtitle="Cadastre e gerencie os pareceristas da prefeitura"
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
          onRefresh={() => window.location.reload()}
          headerActions={
            <Button onClick={handleNovoParecerista} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Parecerista
            </Button>
          }
        />

        {/* Modal de Cadastro/Edição */}
        <PareceristaModal
          open={modalAberto}
          onClose={() => {
            setModalAberto(false);
            setPareceristaEditando(null);
          }}
          onSave={handleSalvarParecerista}
          parecerista={pareceristaEditando}
          loading={loading}
        />

      {/* Modal de Confirmação */}
      <ConfirmationModal
        open={modalConfirmacao.aberto}
        onClose={() => setModalConfirmacao({ aberto: false, parecerista: null, acao: null })}
        onConfirm={handleExecutarAcao}
        title={`${modalConfirmacao.acao === 'ativar' ? 'Ativar' : modalConfirmacao.acao === 'inativar' ? 'Inativar' : 'Excluir'} Parecerista`}
        description={`Tem certeza que deseja ${modalConfirmacao.acao === 'ativar' ? 'ativar' : modalConfirmacao.acao === 'inativar' ? 'inativar' : 'excluir'} o parecerista "${modalConfirmacao.parecerista?.nome}"?`}
        confirmText={modalConfirmacao.acao === 'ativar' ? 'Ativar' : modalConfirmacao.acao === 'inativar' ? 'Inativar' : 'Excluir'}
        cancelText="Cancelar"
        variant={modalConfirmacao.acao === 'excluir' ? 'destructive' : 'default'}
        loading={loading}
      />
    </PrefeituraLayout>
  );
};
