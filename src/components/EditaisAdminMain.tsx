import { useState, useRef } from "react";
import { Search, Plus, Edit, Archive, Download, Upload, Calendar, FileText, Eye, MoreHorizontal, Trash2, Loader2, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEditais, type EditalCompleto, type NovoEditalData } from "@/hooks/useEditais";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ListTemplate, 
  ModalTemplate, 
  ConfirmationModal,
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard,
  type ModalField
} from "@/components/templates";

export const EditaisAdminMain = () => {
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [editalEditando, setEditalEditando] = useState<EditalCompleto | null>(null);
  const [showArquivarDialog, setShowArquivarDialog] = useState(false);
  const [editalParaArquivar, setEditalParaArquivar] = useState<EditalCompleto | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const { toast } = useToast();
  
  const {
    editais,
    loading,
    error,
    criarEdital,
    atualizarEdital,
    arquivarEdital,
    deletarArquivo,
    removerEditalOrfao,
    getArquivoUrl
  } = useEditais();

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    descricao: "",
    dataAbertura: "",
    dataFinalEnvioProjeto: "",
    horarioFinalEnvioProjeto: "",
    valorMaximo: "",
    prazoAvaliacao: "",
    modalidades: [] as string[],
    arquivos: [] as File[]
  });

  // Configuração das colunas para o ListTemplate
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
          <Badge className={statusColors[item.status as keyof typeof statusColors]}>
            {getStatusLabel(item.status)}
          </Badge>
        );
      }
    },
    {
      key: 'data_abertura',
      label: 'Data de Abertura',
      render: (item) => formatarData(item.data_abertura)
    },
    {
      key: 'data_final_envio_projeto',
      label: 'Data Final',
      render: (item) => formatarData(item.data_final_envio_projeto)
    },
    {
      key: 'valor_maximo',
      label: 'Valor Máximo',
      render: (item) => item.valor_maximo ? 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_maximo) : 
        'N/A'
    },
    {
      key: 'total_projetos_inscritos',
      label: 'Projetos',
      render: (item) => (
        <div className="text-center">
          <div className="font-bold">{item.total_projetos_inscritos}</div>
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
    }
  ];

  // Configuração das ações
  const actions: ListAction[] = [
    {
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleEditarEdital(item)
    },
    {
      key: 'archive',
      label: 'Arquivar',
      icon: <Archive className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleArquivarEdital(item),
      show: (item) => item.status === "ativo"
    },
    {
      key: 'delete',
      label: 'Remover',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (item) => handleRemoverEdital(item)
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
        toast({
          title: "Exportação iniciada",
          description: `Exportando ${items.length} editais selecionados.`,
        });
      }
    },
    {
      key: 'archive',
      label: 'Arquivar Selecionados',
      icon: <Archive className="h-4 w-4" />,
      variant: 'outline',
      onClick: (items) => {
        toast({
          title: "Arquivamento em lote",
          description: `Arquivando ${items.length} editais selecionados.`,
        });
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
      value: editais.filter(e => e.status === "ativo").length,
      subtitle: 'em andamento',
      color: 'green',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(editais.reduce((sum, e) => sum + (e.valor_maximo || 0), 0)),
      subtitle: 'disponível',
      color: 'purple',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Projetos Inscritos',
      value: editais.reduce((sum, e) => sum + e.total_projetos_inscritos, 0),
      subtitle: 'total',
      color: 'orange',
      icon: <Users className="h-6 w-6" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 border-green-200";
      case "arquivado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rascunho":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "arquivado":
        return "Arquivado";
      case "rascunho":
        return "Rascunho";
      default:
        return status;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      arquivos: [...prev.arquivos, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      arquivos: prev.arquivos.filter((_, i) => i !== index)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(fileExtension);
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        arquivos: [...prev.arquivos, ...validFiles]
      }));
    }

    if (validFiles.length < files.length) {
      toast({
        title: "Alguns arquivos foram ignorados",
        description: "Apenas arquivos PDF, DOC, DOCX, XLS, XLSX, PNG, JPG e JPEG são aceitos.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      codigo: "",
      descricao: "",
      dataAbertura: "",
      dataFinalEnvioProjeto: "",
      horarioFinalEnvioProjeto: "",
      valorMaximo: "",
      prazoAvaliacao: "",
      modalidades: [],
      arquivos: []
    });
    setEditalEditando(null);
    setUploadProgress({});
  };

  const handleNovoEdital = () => {
    resetForm();
    setIsModalAberto(true);
  };

  const handleEditarEdital = (edital: EditalCompleto) => {
    setEditalEditando(edital);
    setFormData({
      nome: edital.nome,
      codigo: edital.codigo,
      descricao: edital.descricao || "",
      dataAbertura: edital.data_abertura,
      dataFinalEnvioProjeto: edital.data_final_envio_projeto,
      horarioFinalEnvioProjeto: edital.horario_final_envio_projeto,
      valorMaximo: edital.valor_maximo?.toString() || "",
      prazoAvaliacao: edital.prazo_avaliacao?.toString() || "",
      modalidades: edital.modalidades || [],
      arquivos: []
    });
    setIsModalAberto(true);
  };

  const handleSalvarEdital = async () => {
    // Validações básicas
    if (!formData.nome || !formData.codigo || !formData.dataAbertura || !formData.dataFinalEnvioProjeto || !formData.horarioFinalEnvioProjeto) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validar datas
    const dataAbertura = new Date(formData.dataAbertura);
    const dataFinal = new Date(formData.dataFinalEnvioProjeto);
    
    if (dataAbertura >= dataFinal) {
      toast({
        title: "Erro de validação",
        description: "A data final deve ser posterior à data de abertura.",
        variant: "destructive"
      });
      return;
    }

    // Validar valor máximo se informado
    if (formData.valorMaximo && (isNaN(parseFloat(formData.valorMaximo)) || parseFloat(formData.valorMaximo) < 0)) {
      toast({
        title: "Erro de validação",
        description: "O valor máximo deve ser um número positivo.",
        variant: "destructive"
      });
      return;
    }

    // Validar prazo de avaliação se informado
    if (formData.prazoAvaliacao && (isNaN(parseInt(formData.prazoAvaliacao)) || parseInt(formData.prazoAvaliacao) < 1)) {
      toast({
        title: "Erro de validação",
        description: "O prazo de avaliação deve ser um número maior que zero.",
        variant: "destructive"
      });
      return;
    }

    try {
      const dados: NovoEditalData = {
        codigo: formData.codigo.trim(),
        nome: formData.nome.trim(),
        descricao: formData.descricao?.trim() || undefined,
        data_abertura: formData.dataAbertura,
        data_final_envio_projeto: formData.dataFinalEnvioProjeto,
        horario_final_envio_projeto: formData.horarioFinalEnvioProjeto,
        valor_maximo: formData.valorMaximo ? parseFloat(formData.valorMaximo) : undefined,
        prazo_avaliacao: formData.prazoAvaliacao ? parseInt(formData.prazoAvaliacao) : undefined,
        modalidades: formData.modalidades.length > 0 ? formData.modalidades : undefined
      };

      if (editalEditando) {
        // Editando edital existente
        await atualizarEdital(editalEditando.id, dados, formData.arquivos);
      } else {
        // Criando novo edital
        await criarEdital(dados, formData.arquivos);
      }

      setIsModalAberto(false);
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar edital:', err);
      
      // Não mostrar toast duplicado (já é mostrado no hook)
      // Apenas log do erro para debug
    }
  };

  const handleArquivarEdital = (edital: EditalCompleto) => {
    setEditalParaArquivar(edital);
    setShowArquivarDialog(true);
  };

  const confirmarArquivamento = async () => {
    if (editalParaArquivar) {
      try {
        await arquivarEdital(editalParaArquivar.id);
      } catch (err) {
        console.error('Erro ao arquivar edital:', err);
      toast({
          title: "Erro ao arquivar",
          description: "Não foi possível arquivar o edital. Tente novamente.",
          variant: "destructive"
      });
      }
    }
    setShowArquivarDialog(false);
    setEditalParaArquivar(null);
  };

  const handleDeletarArquivo = async (arquivo: any) => {
    if (!editalEditando) return;

    try {
      await deletarArquivo(editalEditando.id, arquivo.id, arquivo.url);
    } catch (err) {
      console.error('Erro ao deletar arquivo:', err);
      toast({
        title: "Erro ao deletar arquivo",
        description: "Não foi possível deletar o arquivo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleRemoverEdital = async (edital: EditalCompleto) => {
    try {
      await removerEditalOrfao(edital.id);
      toast({
        title: "Edital removido!",
        description: `O edital "${edital.nome}" foi removido com sucesso.`,
      });
    } catch (err) {
      console.error('Erro ao remover edital:', err);
      toast({
        title: "Erro ao remover edital",
        description: "Não foi possível remover o edital. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarTamanhoArquivo = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
        loading={loading}
        error={error}
        onSearch={(term) => console.log('Busca:', term)}
        onFilterChange={(filters) => console.log('Filtros:', filters)}
        onSort={(column, direction) => console.log('Ordenação:', column, direction)}
        onSelect={(items) => console.log('Selecionados:', items)}
        onRefresh={() => window.location.reload()}
        headerActions={
            <Button onClick={handleNovoEdital} className="bg-primary hover:bg-primary/90" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Edital
            </Button>
        }
      />

        {/* Modal de Cadastro/Edição */}
      <ModalTemplate
        open={isModalAberto}
        onClose={() => {
          setIsModalAberto(false);
          resetForm();
        }}
        title={editalEditando ? "Editar Edital" : "Novo Edital"}
        description="Preencha os dados do edital"
        size="2xl"
        fields={[
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
          },
          {
            key: 'dataAbertura',
            label: 'Data de Abertura',
            type: 'date',
            required: true
          },
          {
            key: 'dataFinalEnvioProjeto',
            label: 'Data Final de Envio',
            type: 'date',
            required: true
          },
          {
            key: 'horarioFinalEnvioProjeto',
            label: 'Horário Final de Envio',
            type: 'text',
            required: true,
            placeholder: '23:59'
          },
          {
            key: 'prazoAvaliacao',
            label: 'Prazo para Avaliação (dias)',
            type: 'number',
            placeholder: '30'
          }
        ]}
        formData={formData}
        onFormChange={(key, value) => handleInputChange(key, value)}
        actions={[
          {
            key: 'save',
            label: editalEditando ? 'Salvar Alterações' : 'Criar Edital',
            onClick: handleSalvarEdital,
            loading: loading,
            icon: <FileText className="h-4 w-4" />
          }
        ]}
      />

      {/* Modal de confirmação de arquivamento */}
      <ConfirmationModal
        open={showArquivarDialog}
        onClose={() => setShowArquivarDialog(false)}
        onConfirm={confirmarArquivamento}
        title="Arquivar Edital"
        description={`Tem certeza que deseja arquivar o edital "${editalParaArquivar?.nome}"? Esta ação não pode ser desfeita e o edital ficará indisponível para novos projetos.`}
        confirmText="Arquivar Edital"
        cancelText="Cancelar"
        variant="default"
      />
    </>
  );
};