import { useState } from "react";
import { Eye, Edit, CheckCircle, XCircle, User, BarChart3, Clock, FileText, DollarSign, Users } from "lucide-react";
import { useProjetos, type ProjetoCompleto, type ProjetoFiltros, type ProjetoMetricas } from "@/hooks/useProjetos";
import { 
  ListTemplate, 
  DetailsModal,
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard
} from "@/components/templates";

// Tipos (mantidos para compatibilidade com componentes filhos)
export interface DocumentoHabilitacao {
  id: string;
  nome: string;
  descricao: string;
  arquivo?: {
    nome: string;
    url: string;
    dataUpload: string;
  };
  obrigatorio: boolean;
  dataSolicitacao: string;
  status?: "pendente" | "enviado" | "aprovado" | "rejeitado";
  tipo?: "rg" | "cpf" | "certidao_negativa" | "certidao_trabalhista" | "comprovante_residencia" | "cnpj" | "atos_constitutivos" | "certidao_falencia" | "crf_fgts" | "declaracao_representacao" | "outros";
}

export interface Projeto {
  id: string;
  nome: string;
  categoria: string;
  proponente: string;
  tipoProponente: "PF" | "PJ" | "Grupo";
  valorSolicitado: number;
  dataSubmissao: string;
  status: "Recebido" | "Aguardando Avaliação" | "Em Avaliação" | "Avaliado" | "Aprovado" | "Rejeitado" | "Em execução";
  parecerista?: string;
  edital: string;
  documentosHabilitacao?: DocumentoHabilitacao[];
  necessitaComprovanteResidencia?: boolean;
}

export interface Parecerista {
  id: string;
  nome: string;
  especialidade: string;
  projetosEmAnalise: number;
}

// Função para converter ProjetoCompleto para Projeto (compatibilidade)
const converterProjeto = (projetoCompleto: ProjetoCompleto): Projeto => {
  return {
    id: projetoCompleto.id,
    nome: projetoCompleto.nome,
    categoria: projetoCompleto.categoria || '',
    proponente: projetoCompleto.proponente?.nome || 'Proponente não encontrado',
    tipoProponente: (projetoCompleto.proponente?.tipo as "PF" | "PJ" | "Grupo") || "PF",
    valorSolicitado: Number(projetoCompleto.valor_solicitado),
    dataSubmissao: projetoCompleto.data_submissao || projetoCompleto.created_at,
    status: mapearStatus(projetoCompleto.status),
    parecerista: projetoCompleto.parecerista?.nome,
    edital: projetoCompleto.edital?.codigo || 'Edital não encontrado',
    documentosHabilitacao: projetoCompleto.documentos_habilitacao?.map(doc => ({
      id: doc.id,
      nome: doc.nome,
      descricao: doc.descricao || '',
      obrigatorio: doc.obrigatorio || false,
      dataSolicitacao: doc.data_solicitacao || doc.created_at,
      status: doc.status as "pendente" | "enviado" | "aprovado" | "rejeitado",
      tipo: doc.tipo as any,
      arquivo: doc.arquivo_nome ? {
        nome: doc.arquivo_nome,
        url: doc.arquivo_url || '',
        dataUpload: doc.data_upload || doc.created_at
      } : undefined
    })),
    necessitaComprovanteResidencia: projetoCompleto.necessita_comprovante_residencia || false
  };
};

// Mapear status do banco para interface
const mapearStatus = (status: string): "Recebido" | "Em Avaliação" | "Avaliado" | "Aprovado" | "Rejeitado" | "Em execução" => {
  const statusMap: Record<string, "Recebido" | "Em Avaliação" | "Avaliado" | "Aprovado" | "Rejeitado" | "Em execução"> = {
    'recebido': 'Recebido',
    'em_avaliacao': 'Em Avaliação',
    'avaliado': 'Avaliado',
    'aprovado': 'Aprovado',
    'rejeitado': 'Rejeitado',
    'em_execucao': 'Em execução'
  };
  return statusMap[status] || 'Recebido';
};

// Converter métricas do banco para interface
const converterMetricas = (metricas: ProjetoMetricas) => {
  return {
    recebidos: metricas.recebidos,
    emAvaliacao: metricas.emAvaliacao,
    pendentes: metricas.pendentes,
    aprovados: metricas.aprovados
  };
};

export const ProjetosAdminMain = () => {
  // Hook personalizado para gerenciar projetos
  const {
    projetos: projetosCompletos,
    pareceristas: pareceristasCompletos,
    editais: editaisCompletos,
    loading,
    error,
    atribuirParecerista,
    decidirProjeto,
    filtrarProjetos,
    calcularMetricas
  } = useProjetos();

  const [filtros, setFiltros] = useState<ProjetoFiltros>({
    busca: "",
    parecerista: "Todos",
    edital: "Todos",
    status: "Todos"
  });
  
  // Estados dos modais
  const [modalDetalhes, setModalDetalhes] = useState<{ aberto: boolean; projeto?: Projeto }>({ aberto: false });
  const [modalParecerista, setModalParecerista] = useState<{ aberto: boolean; projeto?: Projeto }>({ aberto: false });
  const [modalDecisao, setModalDecisao] = useState<{ aberto: boolean; projeto?: Projeto }>({ aberto: false });

  // Converter projetos para formato compatível
  const projetos = projetosCompletos.map(converterProjeto);
  
  // Converter pareceristas para formato compatível
  const pareceristas = pareceristasCompletos.map(p => ({
    id: p.id,
    nome: p.nome,
    especialidade: p.especialidade?.join(', ') || '',
    projetosEmAnalise: p.projetos_em_analise || 0
  }));

  // Converter editais para formato compatível
  const editais = editaisCompletos.map(e => ({
    codigo: e.codigo,
    nome: e.nome
  }));

  // Filtrar projetos usando o hook
  const projetosFiltrados = filtrarProjetos(filtros).map(converterProjeto);

  // Calcular métricas usando o hook
  const metricas = converterMetricas(calcularMetricas());

  // Configuração das colunas para o ListTemplate
  const columns: ListColumn[] = [
    {
      key: 'nome',
      label: 'Projeto',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.nome}</div>
          <div className="text-sm text-gray-500">{item.categoria}</div>
        </div>
      )
    },
    {
      key: 'proponente',
      label: 'Proponente',
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.proponente}</div>
          <div className="text-sm text-gray-500">{item.tipoProponente}</div>
        </div>
      )
    },
    {
      key: 'valorSolicitado',
      label: 'Valor Solicitado',
      sortable: true,
      render: (item) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(item.valorSolicitado)
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => {
        const statusConfig = {
          'Recebido': { color: 'bg-blue-100 text-blue-800', icon: <FileText className="h-3 w-3" /> },
          'Aguardando Avaliação': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
          'Em Avaliação': { color: 'bg-orange-100 text-orange-800', icon: <BarChart3 className="h-3 w-3" /> },
          'Avaliado': { color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="h-3 w-3" /> },
          'Aprovado': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
          'Rejeitado': { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
          'Em execução': { color: 'bg-indigo-100 text-indigo-800', icon: <Clock className="h-3 w-3" /> }
        };
        const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig['Recebido'];
        
        return (
          <div className="flex items-center gap-2">
            {config.icon}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              {item.status}
            </span>
          </div>
        );
      }
    },
    {
      key: 'parecerista',
      label: 'Parecerista',
      render: (item) => item.parecerista || 'Não atribuído'
    },
    {
      key: 'dataSubmissao',
      label: 'Data de Submissão',
      render: (item) => new Date(item.dataSubmissao).toLocaleDateString('pt-BR')
    }
  ];

  // Configuração dos filtros
  const filters: ListFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Recebido', label: 'Recebido' },
        { value: 'Aguardando Avaliação', label: 'Aguardando Avaliação' },
        { value: 'Em Avaliação', label: 'Em Avaliação' },
        { value: 'Avaliado', label: 'Avaliado' },
        { value: 'Aprovado', label: 'Aprovado' },
        { value: 'Rejeitado', label: 'Rejeitado' },
        { value: 'Em execução', label: 'Em execução' }
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
      onClick: (item) => handleVerDetalhes(item)
    },
    {
      key: 'assign',
      label: 'Atribuir Parecerista',
      icon: <User className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleAtribuirParecerista(item),
      show: (item) => item.status === 'Recebido' || item.status === 'Aguardando Avaliação'
    },
    {
      key: 'evaluate',
      label: 'Avaliar',
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleVerAvaliacao(item),
      show: (item) => item.status === 'Em Avaliação'
    },
    {
      key: 'approve',
      label: 'Aprovar',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleAprovarRejeitar(item),
      show: (item) => item.status === 'Avaliado'
    },
    {
      key: 'reject',
      label: 'Rejeitar',
      icon: <XCircle className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleAprovarRejeitar(item),
      show: (item) => item.status === 'Avaliado'
    }
  ];

  // Ações em lote
  const bulkActions: ListAction[] = [
    {
      key: 'export',
      label: 'Exportar Selecionados',
      icon: <FileText className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        console.log('Exportando projetos:', items);
      }
    },
    {
      key: 'assign',
      label: 'Atribuir Parecerista',
      icon: <User className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        console.log('Atribuindo parecerista para:', items);
      }
    }
  ];

  // Cards de status
  const statusCards: StatusCard[] = [
    {
      title: 'Total de Projetos',
      value: projetos.length,
      subtitle: 'inscritos',
      color: 'blue',
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: 'Em Avaliação',
      value: metricas.emAvaliacao,
      subtitle: 'aguardando parecer',
      color: 'orange',
      icon: <BarChart3 className="h-6 w-6" />
    },
    {
      title: 'Aprovados',
      value: metricas.aprovados,
      subtitle: 'projetos aprovados',
      color: 'green',
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(projetos.reduce((sum, p) => sum + p.valorSolicitado, 0)),
      subtitle: 'solicitado',
      color: 'purple',
      icon: <DollarSign className="h-6 w-6" />
    }
  ];

  // Handlers
  const handleVerDetalhes = (projeto: Projeto) => {
    setModalDetalhes({ aberto: true, projeto });
  };

  const handleAtribuirParecerista = (projeto: Projeto) => {
    setModalParecerista({ aberto: true, projeto });
  };

  const handleVerAvaliacao = (projeto: Projeto) => {
    setModalDecisao({ aberto: true, projeto });
  };

  const handleAprovarRejeitar = (projeto: Projeto) => {
    setModalDecisao({ aberto: true, projeto });
  };

  const confirmarAtribuicao = async (projetoId: string, pareceristaId: string) => {
    try {
      await atribuirParecerista(projetoId, pareceristaId);
    setModalParecerista({ aberto: false });
    } catch (err) {
      console.error('Erro ao atribuir parecerista:', err);
    }
  };

  const confirmarDecisao = async (projetoId: string, decisao: "Aprovado" | "Rejeitado", justificativa: string) => {
    try {
      const statusDecisao = decisao === "Aprovado" ? "aprovado" : "rejeitado";
      await decidirProjeto(projetoId, statusDecisao, justificativa);
    setModalDecisao({ aberto: false });
    } catch (err) {
      console.error('Erro ao decidir projeto:', err);
    }
  };

  const handleAtualizarProjeto = (projetoAtualizado: Projeto) => {
    // Esta função pode ser implementada se necessário para atualizações locais
    // Por enquanto, os dados são atualizados automaticamente pelo hook
    console.log('Projeto atualizado:', projetoAtualizado);
  };

  return (
    <>
      <ListTemplate
        data={projetosFiltrados}
        title="Gestão de Projetos"
        subtitle="Gerencie todos os projetos da PNAB"
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
      />

      {/* Modal de detalhes */}
      <DetailsModal
        open={modalDetalhes.aberto}
        onClose={() => setModalDetalhes({ aberto: false })}
        title="Detalhes do Projeto"
        data={modalDetalhes.projeto || {}}
        sections={modalDetalhes.projeto ? [
          {
            title: 'Informações do Projeto',
            fields: [
              { key: 'nome', label: 'Nome do Projeto', value: modalDetalhes.projeto.nome, type: 'text' },
              { key: 'categoria', label: 'Categoria', value: modalDetalhes.projeto.categoria, type: 'badge', color: 'info' },
              { key: 'proponente', label: 'Proponente', value: modalDetalhes.projeto.proponente, type: 'text' },
              { key: 'tipoProponente', label: 'Tipo', value: modalDetalhes.projeto.tipoProponente, type: 'badge', color: 'default' },
              { key: 'valorSolicitado', label: 'Valor Solicitado', value: modalDetalhes.projeto.valorSolicitado, type: 'currency' },
              { key: 'status', label: 'Status', value: modalDetalhes.projeto.status, type: 'badge', color: 'success' },
              { key: 'dataSubmissao', label: 'Data de Submissão', value: modalDetalhes.projeto.dataSubmissao, type: 'date' },
              { key: 'parecerista', label: 'Parecerista', value: modalDetalhes.projeto.parecerista || 'Não atribuído', type: 'text' },
              { key: 'edital', label: 'Edital', value: modalDetalhes.projeto.edital, type: 'text' }
            ]
          }
        ] : []}
        actions={[
          {
            key: 'edit',
            label: 'Editar',
            icon: <Edit className="h-4 w-4" />,
            onClick: () => console.log('Editando projeto')
          },
          {
            key: 'evaluate',
            label: 'Avaliar',
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => console.log('Avaliando projeto')
          }
        ]}
      />

      {/* Modais existentes mantidos para compatibilidade */}
        <AtribuirPareceristaModal 
          aberto={modalParecerista.aberto}
          projeto={modalParecerista.projeto}
          pareceristas={pareceristas}
          onFechar={() => setModalParecerista({ aberto: false })}
          onConfirmar={confirmarAtribuicao}
        />

        <DecisaoFinalModal 
          aberto={modalDecisao.aberto}
          projeto={modalDecisao.projeto}
          onFechar={() => setModalDecisao({ aberto: false })}
          onConfirmar={confirmarDecisao}
        />
    </>
  );
};