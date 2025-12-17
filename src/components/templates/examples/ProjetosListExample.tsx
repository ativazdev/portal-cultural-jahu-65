import React, { useState } from 'react';
import { 
  ListTemplate, 
  DataDisplayTemplate,
  DetailsModal,
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard,
  type DataSection,
  type MetricCard
} from '../index';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  DollarSign,
  Calendar,
  BarChart3,
  TrendingUp
} from 'lucide-react';

// Exemplo de uso do ListTemplate para Projetos
export const ProjetosListExample: React.FC = () => {
  const [projetos, setProjetos] = useState([
    {
      id: '1',
      nome: 'Festival de Música Popular',
      modalidade: 'Música',
      proponente: 'João Silva',
      tipoProponente: 'PF',
      valorSolicitado: 25000,
      dataSubmissao: '2025-01-15',
      status: 'Em Avaliação',
      parecerista: 'Maria Santos',
      edital: 'PNAB-2025-001',
      notaFinal: 8.5
    },
    {
      id: '2',
      nome: 'Teatro Comunitário',
      modalidade: 'Artes Cênicas',
      proponente: 'Grupo Teatral ABC',
      tipoProponente: 'PJ',
      valorSolicitado: 40000,
      dataSubmissao: '2025-01-20',
      status: 'Aprovado',
      parecerista: 'Carlos Lima',
      edital: 'PNAB-2025-001',
      notaFinal: 9.2
    },
    {
      id: '3',
      nome: 'Exposição de Artes Visuais',
      modalidade: 'Artes Visuais',
      proponente: 'Ana Costa',
      tipoProponente: 'PF',
      valorSolicitado: 15000,
      dataSubmissao: '2025-01-25',
      status: 'Rejeitado',
      parecerista: 'Pedro Oliveira',
      edital: 'PNAB-2025-001',
      notaFinal: 6.1
    }
  ]);

  const [selectedProjeto, setSelectedProjeto] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Configuração das colunas
  const columns: ListColumn[] = [
    {
      key: 'nome',
      label: 'Projeto',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.nome}</div>
          <div className="text-sm text-gray-500">{item.modalidade}</div>
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
          'Em Avaliação': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
          'Aprovado': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
          'Rejeitado': { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
          'Recebido': { color: 'bg-blue-100 text-blue-800', icon: <FileText className="h-3 w-3" /> }
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
      key: 'notaFinal',
      label: 'Nota Final',
      sortable: true,
      render: (item) => (
        <div className="text-center">
          <div className={`font-bold ${item.notaFinal >= 7 ? 'text-green-600' : item.notaFinal >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
            {item.notaFinal.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">/10</div>
        </div>
      )
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
        { value: 'Em Avaliação', label: 'Em Avaliação' },
        { value: 'Aprovado', label: 'Aprovado' },
        { value: 'Rejeitado', label: 'Rejeitado' }
      ]
    },
    {
      key: 'modalidade',
      label: 'Categoria',
      type: 'select',
      options: [
        { value: 'Música', label: 'Música' },
        { value: 'Artes Cênicas', label: 'Artes Cênicas' },
        { value: 'Artes Visuais', label: 'Artes Visuais' },
        { value: 'Dança', label: 'Dança' },
        { value: 'Literatura', label: 'Literatura' }
      ]
    },
    {
      key: 'parecerista',
      label: 'Parecerista',
      type: 'select',
      options: [
        { value: 'Maria Santos', label: 'Maria Santos' },
        { value: 'Carlos Lima', label: 'Carlos Lima' },
        { value: 'Pedro Oliveira', label: 'Pedro Oliveira' }
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
      onClick: (item) => {
        setSelectedProjeto(item);
        setIsDetailsModalOpen(true);
      }
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => {
        console.log('Editando projeto:', item);
      }
    },
    {
      key: 'evaluate',
      label: 'Avaliar',
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => {
        console.log('Avaliando projeto:', item);
      },
      show: (item) => item.status === 'Em Avaliação'
    },
    {
      key: 'approve',
      label: 'Aprovar',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => {
        console.log('Aprovando projeto:', item);
      },
      show: (item) => item.status === 'Em Avaliação'
    },
    {
      key: 'reject',
      label: 'Rejeitar',
      icon: <XCircle className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => {
        console.log('Rejeitando projeto:', item);
      },
      show: (item) => item.status === 'Em Avaliação'
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
      icon: <FileText className="h-6 w-6" />,
      trend: {
        value: 15,
        isPositive: true,
        period: 'vs mês anterior'
      }
    },
    {
      title: 'Em Avaliação',
      value: projetos.filter(p => p.status === 'Em Avaliação').length,
      subtitle: 'aguardando parecer',
      color: 'orange',
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: 'Aprovados',
      value: projetos.filter(p => p.status === 'Aprovado').length,
      subtitle: 'projetos aprovados',
      color: 'green',
      icon: <CheckCircle className="h-6 w-6" />,
      trend: {
        value: 8,
        isPositive: true,
        period: 'vs mês anterior'
      }
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

  // Seções para o modal de detalhes
  const getProjectSections = (projeto: any): DataSection[] => [
    {
      title: 'Informações do Projeto',
      fields: [
        { key: 'nome', label: 'Nome do Projeto', value: projeto.nome, type: 'text' },
        { key: 'modalidade', label: 'Categoria', value: projeto.modalidade, type: 'badge', color: 'info' },
        { key: 'edital', label: 'Edital', value: projeto.edital, type: 'text' },
        { key: 'dataSubmissao', label: 'Data de Submissão', value: projeto.dataSubmissao, type: 'date' }
      ]
    },
    {
      title: 'Proponente',
      fields: [
        { key: 'proponente', label: 'Nome', value: projeto.proponente, type: 'text' },
        { key: 'tipoProponente', label: 'Tipo', value: projeto.tipoProponente, type: 'badge', color: 'default' }
      ]
    },
    {
      title: 'Avaliação',
      fields: [
        { key: 'valorSolicitado', label: 'Valor Solicitado', value: projeto.valorSolicitado, type: 'currency' },
        { key: 'notaFinal', label: 'Nota Final', value: projeto.notaFinal, type: 'number' },
        { key: 'parecerista', label: 'Parecerista', value: projeto.parecerista, type: 'text' },
        { key: 'status', label: 'Status', value: projeto.status, type: 'badge', color: 'success' }
      ]
    }
  ];

  // Métricas para o modal de detalhes
  const getProjectMetrics = (projeto: any): MetricCard[] => [
    {
      title: 'Valor Solicitado',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projeto.valorSolicitado),
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green'
    },
    {
      title: 'Nota Final',
      value: `${projeto.notaFinal.toFixed(1)}/10`,
      icon: <BarChart3 className="h-6 w-6" />,
      color: projeto.notaFinal >= 7 ? 'green' : projeto.notaFinal >= 5 ? 'orange' : 'red',
      progress: { value: projeto.notaFinal * 10, max: 100, label: 'Avaliação' }
    },
    {
      title: 'Dias desde Submissão',
      value: Math.floor((new Date().getTime() - new Date(projeto.dataSubmissao).getTime()) / (1000 * 60 * 60 * 24)),
      subtitle: 'dias',
      icon: <Calendar className="h-6 w-6" />,
      color: 'blue'
    }
  ];

  return (
    <>
      <ListTemplate
        data={projetos}
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
        onSearch={(term) => console.log('Busca:', term)}
        onFilterChange={(filters) => console.log('Filtros:', filters)}
        onSort={(column, direction) => console.log('Ordenação:', column, direction)}
        onSelect={(items) => console.log('Selecionados:', items)}
      />

      {/* Modal de detalhes */}
      <DetailsModal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes do Projeto"
        data={selectedProjeto || {}}
        sections={selectedProjeto ? getProjectSections(selectedProjeto) : []}
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

      {/* Exemplo de DataDisplayTemplate standalone */}
      {selectedProjeto && (
        <div className="mt-8">
          <DataDisplayTemplate
            data={selectedProjeto}
            title="Análise Detalhada"
            sections={getProjectSections(selectedProjeto)}
            metrics={getProjectMetrics(selectedProjeto)}
            layout="single"
          />
        </div>
      )}
    </>
  );
};

export default ProjetosListExample;
