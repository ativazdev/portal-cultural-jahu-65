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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { recursosService } from "@/services/recursosService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const PrefeituraEditais = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { prefeitura, user } = usePrefeituraAuth();

  const {
    editais: editaisPrefeitura,
    loading: loadingPrefeitura,
    error: errorPrefeitura,
    createEdital,
    updateEdital,
    deleteEdital,
    refresh: refreshPrefeitura
  } = useEditaisPrefeitura(prefeitura?.id || '');

  // Normalizar editais para garantir que status seja string
  const editais = editaisPrefeitura.map(e => ({
    ...e,
    status: String(e.status || 'rascunho')
  }));
  const loading = loadingPrefeitura;
  const error = errorPrefeitura;

  const [modalAberto, setModalAberto] = useState(false);
  const [editalEditando, setEditalEditando] = useState<Edital | null>(null);
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    edital: Edital | null;
    acao: 'excluir' | null;
  }>({ aberto: false, edital: null, acao: null });
  const [modalConfirmacaoStatus, setModalConfirmacaoStatus] = useState<{
    aberto: boolean;
    edital: Edital | null;
    novoStatus: string | null;
  }>({ aberto: false, edital: null, novoStatus: null });
  

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<Edital[]>([]);
  const [recursosPendentesPorEdital, setRecursosPendentesPorEdital] = useState<Record<string, number>>({});

  // Buscar recursos pendentes por edital
  useEffect(() => {
    const carregarRecursosPendentes = async () => {
      const recursos: Record<string, number> = {};
      for (const edital of editais) {
        const dados = await recursosService.getPendentesByEdital(edital.id);
        if (dados.total > 0) {
          recursos[edital.id] = dados.total;
        }
      }
      setRecursosPendentesPorEdital(recursos);
    };
    if (editais.length > 0) {
      carregarRecursosPendentes();
    }
  }, [editais]);

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
      render: (item) => {
        const temRecursosPendentes = recursosPendentesPorEdital[item.id] && recursosPendentesPorEdital[item.id] > 0;
        return (
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 truncate">{item.nome}</p>
              {temRecursosPendentes && (
                <div className="flex items-center gap-1" title={`${recursosPendentesPorEdital[item.id]} recursos/contra-razões pendentes`}>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold text-red-500">{recursosPendentesPorEdital[item.id]}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.descricao}</p>
          </div>
        );
      }
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
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => {
        const currentStatus = String(item.status || 'rascunho').trim();
        return (
          <Select 
            value={currentStatus} 
            onValueChange={(newStatus) => handleAlterarStatusInline(item, newStatus)}
          >
            <SelectTrigger className="w-auto min-w-[120px] max-w-[200px] h-auto border-0 bg-transparent hover:bg-transparent focus:ring-0 p-0 shadow-none [&>span:first-child]:hidden [&>svg]:hidden">
              <SelectValue />
              <div className="flex items-center gap-1 pointer-events-none">
                <Badge className={getStatusColor(currentStatus)}>
                  {getStatusLabel(currentStatus)}
                </Badge>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recebendo_projetos">Recebendo Projetos</SelectItem>
              <SelectItem value="avaliacao">Avaliação</SelectItem>
              <SelectItem value="recurso">Recurso</SelectItem>
              <SelectItem value="contra_razao">Contra-razão</SelectItem>
              <SelectItem value="em_execucao">Em Execução</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              {currentStatus === 'rascunho' && (
                <SelectItem value="rascunho">Rascunho</SelectItem>
              )}
              <SelectItem value="arquivado">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        );
      }
    }
  ];

  // Configuração dos filtros
  const filters: ListFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'recebendo_projetos', label: 'Recebendo Projetos' },
        { value: 'avaliacao', label: 'Avaliação' },
        { value: 'recurso', label: 'Recurso' },
        { value: 'contra_razao', label: 'Contra-razão' },
        { value: 'em_execucao', label: 'Em Execução' },
        { value: 'finalizado', label: 'Finalizado' },
        { value: 'rascunho', label: 'Rascunho' },
        { value: 'arquivado', label: 'Arquivado' }
      ]
    }
  ];

  // Funções auxiliares para status
  const getStatusColor = (status: string | null | undefined) => {
    if (!status) {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
    
    const normalizedStatus = String(status).trim().toLowerCase();
    
    switch (normalizedStatus) {
      case "recebendo_projetos":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "avaliacao":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "recurso":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "contra_razao":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "em_execucao":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "finalizado":
        return "bg-green-100 text-green-800 border-green-200";
      case "arquivado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rascunho":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string | null | undefined) => {
    if (!status) {
      return "Sem Status";
    }
    
    const normalizedStatus = String(status).trim().toLowerCase();
    
    switch (normalizedStatus) {
      case "recebendo_projetos":
        return "Recebendo Projetos";
      case "avaliacao":
        return "Avaliação";
      case "recurso":
        return "Recurso";
      case "contra_razao":
        return "Contra-razão";
      case "em_execucao":
        return "Em Execução";
      case "finalizado":
        return "Finalizado";
      case "arquivado":
        return "Arquivado";
      case "rascunho":
        return "Rascunho";
      default:
        return String(status) || "Sem Status";
    }
  };

  const atualizarStatusEdital = async (id: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('editais')
        .update({
          status: novoStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao atualizar status do edital:', err);
      throw err;
    }
  };

  const handleAlterarStatusInline = async (edital: any, novoStatus: string) => {
    const currentStatus = String(edital.status || 'rascunho').trim();
    if (currentStatus === novoStatus) return;
    
    // Se está saindo de rascunho, mostrar modal de confirmação
    if (currentStatus === 'rascunho' && novoStatus !== 'rascunho') {
      setModalConfirmacaoStatus({
        aberto: true,
        edital: edital,
        novoStatus: novoStatus
      });
      return;
    }
    
    // Se não está saindo de rascunho, atualizar diretamente
    await confirmarAlteracaoStatus(edital, novoStatus);
  };

  const confirmarAlteracaoStatus = async (edital: Edital | null, novoStatus: string | null) => {
    if (!edital || !novoStatus) return;
    
    try {
      await atualizarStatusEdital(edital.id, novoStatus);
      toast({
        title: "Status atualizado",
        description: `O status do edital "${edital.nome}" foi alterado para "${getStatusLabel(novoStatus)}".`,
      });
      await refreshPrefeitura();
      setModalConfirmacaoStatus({ aberto: false, edital: null, novoStatus: null });
    } catch (err) {
      console.error('Erro ao atualizar status do edital:', err);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do edital. Tente novamente.",
        variant: "destructive"
      });
    }
  };


  // Configuração das ações
  const actions: ListAction[] = [
    {
      key: 'ver_projetos',
      label: 'Ver Projetos',
      icon: <Eye className="h-4 w-4" />,
      variant: 'default',
      onClick: (item) => {
        navigate(`/${nomePrefeitura}/editais/${item.id}/projetos`);
      }
    },
    {
      key: 'editar',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      variant: 'outline',
      onClick: (item) => {
        setEditalEditando(item);
        setModalAberto(true);
      },
      show: (item) => {
        const status = String(item.status || '').trim().toLowerCase();
        return status === 'rascunho';
      }
    }
  ];

  // Ações em lote
  const bulkActions: ListAction[] = [];

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
      title: 'Recebendo Projetos',
      value: editais.filter(e => String(e.status || '').toLowerCase() === 'recebendo_projetos').length.toString(),
      subtitle: 'Em andamento',
      icon: <Calendar className="h-4 w-4" />,
      color: 'green'
    },
    {
      title: 'Rascunhos',
      value: editais.filter(e => String(e.status || '').toLowerCase() === 'rascunho').length.toString(),
      subtitle: 'Em elaboração',
      icon: <Edit className="h-4 w-4" />,
      color: 'orange'
    },
    {
      title: 'Arquivados',
      value: editais.filter(e => String(e.status || '').toLowerCase() === 'arquivado').length.toString(),
      subtitle: 'Finalizados',
      icon: <FileText className="h-4 w-4" />,
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
      if (acao === 'excluir') {
        await deleteEdital(edital.id);
        toast({
          title: "Sucesso",
          description: "Edital excluído com sucesso!",
        });
      }
      setModalConfirmacao({ aberto: false, edital: null, acao: null });
      await refreshPrefeitura();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar ação. Tente novamente.",
        variant: "destructive",
      });
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
            <Button onClick={refreshPrefeitura} className="mt-4">
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
      <div className="p-6 w-full overflow-hidden">
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
          onRefresh={refreshPrefeitura}
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

        {/* Modal de Confirmação - Excluir */}
        <ConfirmationModal
          open={modalConfirmacao.aberto}
          onClose={() => setModalConfirmacao({ aberto: false, edital: null, acao: null })}
          onConfirm={handleExecutarAcao}
          title="Excluir Edital"
          description={`Tem certeza que deseja excluir o edital "${modalConfirmacao.edital?.nome}"?`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
          loading={loading}
        />

        {/* Modal de Confirmação - Mudança de Status de Rascunho */}
        <Dialog open={modalConfirmacaoStatus.aberto} onOpenChange={(open) => {
          if (!open) {
            setModalConfirmacaoStatus({ aberto: false, edital: null, novoStatus: null });
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Alteração de Status</DialogTitle>
              <DialogDescription className="space-y-3">
                <p>
                  Você está prestes a alterar o status do edital <strong>"{modalConfirmacaoStatus.edital?.nome}"</strong> de <strong>"Rascunho"</strong> para <strong>"{getStatusLabel(modalConfirmacaoStatus.novoStatus || '')}"</strong>.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 font-semibold">
                    ⚠️ ATENÇÃO: Após esta alteração, não será mais possível editar este edital ou voltar o status para "Rascunho".
                  </p>
                </div>
                <p>
                  Tem certeza que deseja continuar?
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModalConfirmacaoStatus({ aberto: false, edital: null, novoStatus: null })}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => confirmarAlteracaoStatus(modalConfirmacaoStatus.edital, modalConfirmacaoStatus.novoStatus)}
                disabled={loading}
              >
                {loading ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PrefeituraLayout>
  );
};