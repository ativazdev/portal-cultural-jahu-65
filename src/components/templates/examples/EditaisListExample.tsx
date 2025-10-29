import React, { useState } from 'react';
import { 
  ListTemplate, 
  ModalTemplate, 
  ConfirmationModal,
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard,
  type ModalField
} from '../index';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Archive, 
  Download, 
  Plus,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';

// Exemplo de uso do ListTemplate para Editais
export const EditaisListExample: React.FC = () => {
  const [editais, setEditais] = useState([
    {
      id: '1',
      nome: 'PNAB 2025 - Edital de Fomento Cultural',
      codigo: 'PNAB-2025-001',
      status: 'ativo',
      dataAbertura: '2025-01-15',
      dataFinal: '2025-03-15',
      valorMaximo: 50000,
      totalProjetos: 45,
      criadoEm: '2025-01-10'
    },
    {
      id: '2',
      nome: 'PNAB 2025 - Edital de Artes Cênicas',
      codigo: 'PNAB-2025-002',
      status: 'rascunho',
      dataAbertura: '2025-02-01',
      dataFinal: '2025-04-01',
      valorMaximo: 30000,
      totalProjetos: 0,
      criadoEm: '2025-01-20'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEdital, setSelectedEdital] = useState<any>(null);
  const [formData, setFormData] = useState({});

  // Configuração das colunas
  const columns: ListColumn[] = [
    {
      key: 'nome',
      label: 'Nome do Edital',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.nome}</div>
          <div className="text-sm text-gray-500">{item.codigo}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => {
        const statusColors = {
          ativo: 'bg-green-100 text-green-800',
          rascunho: 'bg-yellow-100 text-yellow-800',
          arquivado: 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'dataAbertura',
      label: 'Data de Abertura',
      render: (item) => new Date(item.dataAbertura).toLocaleDateString('pt-BR')
    },
    {
      key: 'dataFinal',
      label: 'Data Final',
      render: (item) => new Date(item.dataFinal).toLocaleDateString('pt-BR')
    },
    {
      key: 'valorMaximo',
      label: 'Valor Máximo',
      render: (item) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(item.valorMaximo)
    },
    {
      key: 'totalProjetos',
      label: 'Projetos',
      render: (item) => (
        <div className="text-center">
          <div className="font-bold">{item.totalProjetos}</div>
          <div className="text-xs text-gray-500">inscritos</div>
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
        { value: 'ativo', label: 'Ativo' },
        { value: 'rascunho', label: 'Rascunho' },
        { value: 'arquivado', label: 'Arquivado' }
      ]
    },
    {
      key: 'categoria',
      label: 'Categoria',
      type: 'select',
      options: [
        { value: 'fomento', label: 'Fomento' },
        { value: 'artes-cenicas', label: 'Artes Cênicas' },
        { value: 'musica', label: 'Música' }
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
        setSelectedEdital(item);
        setIsModalOpen(true);
      }
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => {
        setSelectedEdital(item);
        setFormData(item);
        setIsModalOpen(true);
      }
    },
    {
      key: 'archive',
      label: 'Arquivar',
      icon: <Archive className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => {
        setSelectedEdital(item);
        setIsDeleteModalOpen(true);
      },
      show: (item) => item.status === 'ativo'
    },
    {
      key: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => {
        setSelectedEdital(item);
        setIsDeleteModalOpen(true);
      }
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
        console.log('Exportando editais:', items);
      }
    },
    {
      key: 'archive',
      label: 'Arquivar Selecionados',
      icon: <Archive className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        console.log('Arquivando editais:', items);
      }
    }
  ];

  // Cards de status
  const statusCards: StatusCard[] = [
    {
      title: 'Total de Editais',
      value: editais.length,
      subtitle: 'cadastrados',
      color: 'blue',
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: 'Editais Ativos',
      value: editais.filter(e => e.status === 'ativo').length,
      subtitle: 'em andamento',
      color: 'green',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(editais.reduce((sum, e) => sum + e.valorMaximo, 0)),
      subtitle: 'disponível',
      color: 'purple',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Projetos Inscritos',
      value: editais.reduce((sum, e) => sum + e.totalProjetos, 0),
      subtitle: 'total',
      color: 'orange',
      icon: <Users className="h-6 w-6" />
    }
  ];

  // Campos do modal de formulário
  const formFields: ModalField[] = [
    {
      key: 'nome',
      label: 'Nome do Edital',
      type: 'text',
      required: true,
      placeholder: 'Ex: PNAB 2025 - Edital de Fomento Cultural'
    },
    {
      key: 'codigo',
      label: 'Código',
      type: 'text',
      required: true,
      placeholder: 'Ex: PNAB-2025-001'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'rascunho', label: 'Rascunho' },
        { value: 'ativo', label: 'Ativo' },
        { value: 'arquivado', label: 'Arquivado' }
      ]
    },
    {
      key: 'dataAbertura',
      label: 'Data de Abertura',
      type: 'date',
      required: true
    },
    {
      key: 'dataFinal',
      label: 'Data Final',
      type: 'date',
      required: true
    },
    {
      key: 'valorMaximo',
      label: 'Valor Máximo (R$)',
      type: 'number',
      placeholder: '50000.00'
    },
    {
      key: 'descricao',
      label: 'Descrição',
      type: 'textarea',
      rows: 3,
      placeholder: 'Descrição detalhada do edital...'
    }
  ];

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Salvando edital:', formData);
    setIsModalOpen(false);
    setFormData({});
  };

  const handleDelete = () => {
    console.log('Excluindo edital:', selectedEdital);
    setIsDeleteModalOpen(false);
    setSelectedEdital(null);
  };

  return (
    <>
      <ListTemplate
        data={editais}
        title="Gerenciar Editais"
        subtitle="Crie, edite e gerencie os editais do sistema"
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
        headerActions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Edital
          </button>
        }
      />

      {/* Modal de formulário */}
      <ModalTemplate
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({});
        }}
        title={selectedEdital ? 'Editar Edital' : 'Novo Edital'}
        description="Preencha os dados do edital"
        size="2xl"
        fields={formFields}
        formData={formData}
        onFormChange={handleFormChange}
        actions={[
          {
            key: 'save',
            label: selectedEdital ? 'Salvar Alterações' : 'Criar Edital',
            onClick: handleSave,
            icon: <FileText className="h-4 w-4" />
          }
        ]}
      />

      {/* Modal de confirmação */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o edital "${selectedEdital?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
};

export default EditaisListExample;
