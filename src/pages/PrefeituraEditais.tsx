import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  // Use useMemo to prevent creating a new array on every render
  const editais = useMemo(() => {
    return editaisPrefeitura.map(e => ({
      ...e,
      status: String(e.status || 'rascunho') as Edital['status']
    }));
  }, [editaisPrefeitura]);

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
  const ultimaAtualizacaoRecursos = useRef<number>(0);
  const editalIdsAnterior = useRef<string>('');

  // Função para carregar recursos pendentes
  const carregarRecursosPendentes = useCallback(async () => {
    if (editais.length === 0) {
      setRecursosPendentesPorEdital({});
      return;
    }

    const agora = Date.now();
    const editalIdsAtual = editais.map(e => e.id).sort().join(',');
    
    // Evitar chamadas muito frequentes (mínimo 5 minutos entre chamadas, exceto se os editais mudaram)
    if (editalIdsAtual === editalIdsAnterior.current && agora - ultimaAtualizacaoRecursos.current < 5 * 60 * 1000) {
      return;
    }

    ultimaAtualizacaoRecursos.current = agora;
    editalIdsAnterior.current = editalIdsAtual;

    try {
      // Buscar todos os projetos de todos os editais de uma vez
      const editalIds = editais.map(e => e.id);
      
      const { data: projetos, error: projetosError } = await supabase
        .from('projetos')
        .select('id, edital_id')
        .in('edital_id', editalIds);

      if (projetosError) throw projetosError;

      if (!projetos || projetos.length === 0) {
        setRecursosPendentesPorEdital({});
        return;
      }

      // Agrupar projetos por edital
      const projetosPorEdital: Record<string, string[]> = {};
      const projetosData = (projetos || []) as Array<{ id: string; edital_id: string }>;
      projetosData.forEach((projeto) => {
        if (!projetosPorEdital[projeto.edital_id]) {
          projetosPorEdital[projeto.edital_id] = [];
        }
        projetosPorEdital[projeto.edital_id].push(projeto.id);
      });

      // Buscar todos os recursos pendentes de uma vez
      const todosProjetoIds = projetosData.map((p) => p.id);
      
      if (todosProjetoIds.length === 0) {
        setRecursosPendentesPorEdital({});
        return;
      }

      const { data: recursos, error: recursosError } = await supabase
        .from('recursos')
        .select('id, tipo, status, projeto_id')
        .in('projeto_id', todosProjetoIds)
        .eq('status', 'pendente');

      if (recursosError) throw recursosError;

      // Contar recursos por edital
      const recursosPorEdital: Record<string, number> = {};
      const recursosData = (recursos || []) as Array<{ id: string; tipo: string; status: string; projeto_id: string }>;
      
      editais.forEach(edital => {
        const projetoIds = projetosPorEdital[edital.id] || [];
        const recursosDoEdital = recursosData.filter(r => projetoIds.includes(r.projeto_id));
        const total = recursosDoEdital.length;
        
        if (total > 0) {
          recursosPorEdital[edital.id] = total;
        }
      });

      setRecursosPendentesPorEdital(recursosPorEdital);
    } catch (error) {
      console.error('Erro ao carregar recursos pendentes:', error);
      setRecursosPendentesPorEdital({});
    }
  }, [editais]);

  // Carregar recursos apenas quando os editais mudarem (carregamento inicial)
  useEffect(() => {
    if (editais.length > 0) {
      carregarRecursosPendentes();
    }
  }, [editais.length]); // Só quando a quantidade de editais mudar

  // Atualizar recursos a cada 5 minutos
  useEffect(() => {
    if (editais.length === 0) return;

    const intervalId = setInterval(() => {
      carregarRecursosPendentes();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(intervalId);
  }, [editais.length, carregarRecursosPendentes]);

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
      key: 'edital',
      label: 'Edital',
      sortable: true,
      width: 'w-48 md:w-44',
      render: (item) => {
        const temRecursosPendentes = recursosPendentesPorEdital[item.id] && recursosPendentesPorEdital[item.id] > 0;
        return (
          <div className="max-w-[16rem] md:max-w-[20rem]">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-mono text-xs font-medium text-blue-600 truncate flex-shrink-0">
                {item.codigo}
              </div>
              {item.has_accountability_phase && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 px-1.5 py-0 text-[10px]">
                  Prestação de Contas
                </Badge>
              )}
              {temRecursosPendentes && (
                <div className="flex items-center gap-0.5 flex-shrink-0" title={`${recursosPendentesPorEdital[item.id]} recursos/Contrarrazões pendentes`}>
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-xs font-bold text-red-500">{recursosPendentesPorEdital[item.id]}</span>
                </div>
              )}
            </div>
            <p className="font-medium text-gray-900 truncate text-xs">{item.nome}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 hidden md:block">{item.descricao}</p>
          </div>
        );
      }
    },
    {
      key: 'periodo',
      label: 'Período',
      width: 'w-32 md:w-36',
      render: (item) => (
        <div className="text-xs text-gray-600 space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Abertura:</span>
            <span className="whitespace-nowrap">{new Date(item.data_abertura).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Prazo:</span>
            <span className={`whitespace-nowrap ${item.data_prorrogacao ? 'line-through text-gray-400' : ''}`}>
              {new Date(item.data_final_envio_projeto).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </span>
          </div>
          {item.data_prorrogacao && (
             <div className="flex items-center gap-1 text-red-600 font-bold">
               <span>Prorrogado para:</span>
               <span className="whitespace-nowrap">
                 {new Date(item.data_prorrogacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
               </span>
             </div>
          )}
        </div>
      )
    },
    {
      key: 'valor_maximo',
      label: 'Valor',
      width: 'w-18 md:w-20',
      render: (item) => {
        const valor = item.valor_maximo || 0;
        const valorEmMilhares = valor / 1000;
        return (
          <div className="text-xs font-medium text-gray-900 whitespace-nowrap">
            {valorEmMilhares >= 1000 
              ? `R$ ${(valorEmMilhares / 1000).toFixed(1)}M`
              : valorEmMilhares >= 1
              ? `R$ ${valorEmMilhares.toFixed(0)} mil`
              : `R$ ${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
            }
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-28 md:w-32',
      render: (item) => {
        const currentStatus = String(item.status || 'rascunho').trim();
        return (
          <Select 
            value={currentStatus} 
            onValueChange={(newStatus) => handleAlterarStatusInline(item, newStatus)}
          >
            <SelectTrigger className="w-auto min-w-[80px] md:min-w-[100px] max-w-[110px] md:max-w-[130px] h-auto border-0 bg-transparent hover:bg-transparent focus:ring-0 p-0 shadow-none [&>svg]:h-3 [&>svg]:w-3 [&>svg]:hidden md:[&>svg]:block">
              <Badge className={`${getStatusColor(currentStatus)} text-xs px-1 py-0.5 md:px-1.5`}>
                <span className="truncate max-w-[70px] md:max-w-[90px]">{getStatusLabel(currentStatus)}</span>
              </Badge>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recebendo_projetos">Recebendo Projetos</SelectItem>
              <SelectItem value="avaliacao">Avaliação</SelectItem>
              <SelectItem value="recurso">Recurso</SelectItem>
              <SelectItem value="contra_razao">Contrarrazão</SelectItem>
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
        { value: 'contra_razao', label: 'Contrarrazão' },
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
        return "Contrarrazão";
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
    },
    {
      title: 'Prestação de Contas',
      value: editais.filter(e => e.has_accountability_phase).length.toString(),
      subtitle: 'Editais Especiais',
      icon: <Building2 className="h-4 w-4" />,
      color: 'purple'
    }
  ];

  // Handlers
  const handleNovoEdital = () => {
    setEditalEditando(null);
    setModalAberto(true);
  };

  const handleSalvarEdital = async (dados: any): Promise<void> => {
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
          await refreshPrefeitura();
        } else {
          toast({
            title: "Erro",
            description: "Erro ao atualizar edital. Tente novamente.",
            variant: "destructive",
          });
          throw new Error('Erro ao atualizar edital');
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
          await refreshPrefeitura();
        } else {
          toast({
            title: "Erro",
            description: "Erro ao criar edital. Tente novamente.",
            variant: "destructive",
          });
          throw new Error('Erro ao criar edital');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar edital:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar edital. Tente novamente.",
        variant: "destructive",
      });
      throw error; // Re-throw para que o modal possa tratar o erro
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
        <div className="p-4 md:p-6 text-center text-red-600">
          <p>Erro ao carregar editais: {error}</p>
          <Button onClick={refreshPrefeitura} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </PrefeituraLayout>
    );
  }

  return (
    <PrefeituraLayout 
      title="Editais" 
      description="Gerencie os editais da prefeitura"
    >
      <ListTemplate
        data={filteredData}
        title="Gerenciar Editais"
        subtitle="Cadastre e gerencie os editais de projetos culturais"
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
        onRefresh={async () => {
          await refreshPrefeitura();
          await carregarRecursosPendentes();
        }}
        headerActions={
          <Button onClick={handleNovoEdital} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Edital
          </Button>
        }
      />

      {/* Modal de Cadastro/Edição */}
      <EditalModal
        key={editalEditando ? editalEditando.id : 'novo-edital'}
        open={modalAberto}
        onClose={() => {
          setModalAberto(false);
          // Pequeno delay para limpar o estado apenas após a animação fechar, se necessário, 
          // ou limpar imediatamente se não causar problemas visuais.
          // Aqui limpamos imediatamente para simplicidade.
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
    </PrefeituraLayout>
  );
};