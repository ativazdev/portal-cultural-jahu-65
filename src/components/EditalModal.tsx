import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edital, Anexo, CriterioAvaliacao } from '@/services/editalService';
import { Upload, X, Loader2, Calendar, FileText, Plus, Edit2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  edital?: Edital | null;
  loading?: boolean;
}

const modalidadesList = [
  { value: 'musica', label: 'Música' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'danca', label: 'Dança' },
  { value: 'artes_visuais', label: 'Artes Visuais' },
  { value: 'literatura', label: 'Literatura' },
  { value: 'cinema', label: 'Cinema' },
  { value: 'cultura_popular', label: 'Cultura Popular' },
  { value: 'circo', label: 'Circo' },
  { value: 'outros', label: 'Outros' }
];

const initialFormState = {
  codigo: '',
  nome: '',
  descricao: '',
  data_abertura: '',
  data_final_envio_projeto: '',
  horario_final_envio_projeto: '',
  valor_maximo: '',
  prazo_avaliacao: '30',
  modalidades: [] as string[],
  regulamento: [] as string[],
  anexos: [] as Anexo[],
  has_accountability_phase: false,
  data_prorrogacao: '',
  criterios_avaliacao: [] as CriterioAvaliacao[]
};

export const EditalModal = ({ open, onClose, onSave, edital, loading = false }: EditalModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProrrogation, setShowProrrogation] = useState(false);

  // Initialize state directly from props
  const [formData, setFormData] = useState(() => {
    if (edital) {
      // Normalize anexos/regulamentos
      let anexosIniciais = edital.anexos || [];
      if (anexosIniciais.length === 0 && edital.regulamento && edital.regulamento.length > 0) {
        anexosIniciais = edital.regulamento.map((url, index) => ({
          titulo: `Regulamento ${index + 1}`,
          url,
          tipo: 'pdf'
        }));
      }

      return {
        codigo: edital.codigo || '',
        nome: edital.nome || '',
        descricao: edital.descricao || '',
        data_abertura: edital.data_abertura ? edital.data_abertura.split('T')[0] : '',
        data_final_envio_projeto: edital.data_final_envio_projeto ? edital.data_final_envio_projeto.split('T')[0] : '',
        horario_final_envio_projeto: edital.horario_final_envio_projeto || '',
        valor_maximo: edital.valor_maximo ? edital.valor_maximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
        prazo_avaliacao: edital.prazo_avaliacao?.toString() || '30',
        modalidades: edital.modalidades || [],
        regulamento: edital.regulamento || [],
        anexos: anexosIniciais,
        has_accountability_phase: edital.has_accountability_phase || false,
        data_prorrogacao: edital.data_prorrogacao ? edital.data_prorrogacao.split('T')[0] : '',
        criterios_avaliacao: edital.criterios_avaliacao || []
      };
    }
    return initialFormState;
  });

  useEffect(() => {
    if (open) {
      if (edital) {
        let anexosIniciais = edital.anexos || [];
        if (anexosIniciais.length === 0 && edital.regulamento && edital.regulamento.length > 0) {
          anexosIniciais = edital.regulamento.map((url, index) => ({
            titulo: `Regulamento ${index + 1}`,
            url,
            tipo: 'pdf'
          }));
        }

        setFormData({
          codigo: edital.codigo || '',
          nome: edital.nome || '',
          descricao: edital.descricao || '',
          data_abertura: edital.data_abertura ? edital.data_abertura.split('T')[0] : '',
          data_final_envio_projeto: edital.data_final_envio_projeto ? edital.data_final_envio_projeto.split('T')[0] : '',
          horario_final_envio_projeto: edital.horario_final_envio_projeto || '',
          valor_maximo: edital.valor_maximo ? edital.valor_maximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
          prazo_avaliacao: edital.prazo_avaliacao?.toString() || '30',
          modalidades: edital.modalidades || [],
          regulamento: edital.regulamento || [],
          anexos: anexosIniciais,
          has_accountability_phase: edital.has_accountability_phase || false,
          data_prorrogacao: edital.data_prorrogacao ? edital.data_prorrogacao.split('T')[0] : '',
          criterios_avaliacao: edital.criterios_avaliacao || []
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [open, edital]);

  const [tempAnexoTitulo, setTempAnexoTitulo] = useState('');
  const [uploading, setUploading] = useState(false);

  // Input Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModalidadeChange = (modalidade: string) => {
    setFormData(prev => {
      const current = prev.modalidades;
      if (current.includes(modalidade)) {
        return { ...prev, modalidades: current.filter(m => m !== modalidade) };
      } else {
        return { ...prev, modalidades: [...current, modalidade] };
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast({ title: "Erro", description: "Apenas arquivos PDF são permitidos.", variant: "destructive" });
      return;
    }

    // Default title to filename if empty, but allow user to change it later
    const tituloFinal = tempAnexoTitulo.trim() || file.name.replace('.pdf', '');

    setUploading(true);
    try {
      // Sanitize filename: remove accents, special chars, replace spaces with -
      const sanitizedName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "-");
      
      const fileName = `${Date.now()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from('editais')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('editais')
        .getPublicUrl(fileName);

      const novoAnexo: Anexo = {
        titulo: tituloFinal,
        url: publicUrl,
        tipo: 'pdf'
      };

      setFormData(prev => ({
        ...prev,
        anexos: [...prev.anexos, novoAnexo],
        regulamento: [...prev.regulamento, publicUrl]
      }));

      setTempAnexoTitulo(''); // Reset title input
      toast({ title: "Sucesso", description: "Arquivo anexado com sucesso." });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({ title: "Erro", description: "Falha ao fazer upload do arquivo.", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAnexo = (index: number) => {
    setFormData(prev => {
      const newAnexos = [...prev.anexos];
      newAnexos.splice(index, 1);
      return {
        ...prev,
        anexos: newAnexos,
        regulamento: newAnexos.map(a => a.url)
      };
    });
  };

  const updateAnexoTitulo = (index: number, newTitle: string) => {
    setFormData(prev => {
      const newAnexos = [...prev.anexos];
      newAnexos[index] = { ...newAnexos[index], titulo: newTitle };
      return { ...prev, anexos: newAnexos };
    });
  };

  const addCriterio = () => {
    setFormData(prev => ({
      ...prev,
      criterios_avaliacao: [
        ...prev.criterios_avaliacao,
        { id: crypto.randomUUID(), descricao: '', peso: 0 }
      ]
    }));
  };

  const removeCriterio = (id: string) => {
    setFormData(prev => ({
      ...prev,
      criterios_avaliacao: prev.criterios_avaliacao.filter(c => c.id !== id)
    }));
  };

  const updateCriterio = (id: string, field: 'descricao' | 'peso', value: any) => {
    setFormData(prev => ({
      ...prev,
      criterios_avaliacao: prev.criterios_avaliacao.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.codigo || !formData.nome || !formData.descricao) {
        toast({ title: "Atenção", description: "Preencha os campos obrigatórios de identificação.", variant: "destructive" }); 
        return;
    }
    if (!formData.data_abertura || !formData.data_final_envio_projeto || !formData.horario_final_envio_projeto) {
        toast({ title: "Atenção", description: "Preencha as datas e horários corretamente.", variant: "destructive" });
        return;
    }
    if (!formData.valor_maximo) {
        toast({ title: "Atenção", description: "Informe o valor máximo.", variant: "destructive" });
        return;
    }
    
    
    if (formData.modalidades.length === 0) {
        toast({ title: "Atenção", description: "Selecione pelo menos uma categoria.", variant: "destructive" });
        return;
    }
    // Validation for anexos slightly relaxed - requires at least one if prestação not enabled, or just warn?
    // User requested "Upload obrigatório de arquivo PDF" broadly.
    // Validation for anexos
    if (formData.anexos.length === 0) {
        const msg = formData.has_accountability_phase 
            ? "Para editais de Prestação de Contas, é necessário anexar os modelos de documentos."
            : "É necessário anexar pelo menos um arquivo PDF (ex: Regulamento).";
        toast({ title: "Atenção", description: msg, variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
        const dataToSave = {
            ...formData,
            valor_maximo: parseFloat(formData.valor_maximo.replace(/\./g, '').replace(',', '.')),
            prazo_avaliacao: parseInt(formData.prazo_avaliacao) || 30,
            // Convert empty strings to null for DB timestamp fields
            data_prorrogacao: formData.data_prorrogacao || null,
            data_abertura: formData.data_abertura || null,
            data_final_envio_projeto: formData.data_final_envio_projeto || null,
            horario_final_envio_projeto: formData.horario_final_envio_projeto || null,
        };
        await onSave(dataToSave);
    } catch (error) {
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] w-full max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
        <DialogHeader className="p-6 pb-4 bg-white border-b sticky top-0 z-10">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {edital ? 'Editar Edital' : 'Novo Edital'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do edital abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Section 1: Identification */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Identificação</h3>
             </div>
             <div className="bg-white p-5 rounded-lg border shadow-sm grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4">
                  <Label htmlFor="codigo" className="text-sm font-medium text-gray-700">Código do Edital <span className="text-red-500">*</span></Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={e => handleInputChange('codigo', e.target.value)}
                    placeholder="Ex: EDITAL-01/2024"
                    className="mt-1.5 bg-gray-50"
                  />
                </div>
                <div className="col-span-12 md:col-span-8">
                  <Label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome do Edital <span className="text-red-500">*</span></Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={e => handleInputChange('nome', e.target.value)}
                    placeholder="Ex: Fomento à Cultura 2024"
                    className="mt-1.5 bg-gray-50"
                  />
                </div>
                <div className="col-span-12">
                  <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">Descrição Completa <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={e => handleInputChange('descricao', e.target.value)}
                    placeholder="Descreva o objetivo e o público-alvo do edital..."
                    className="mt-1.5 resize-none h-24 bg-gray-50"
                  />
                </div>
             </div>
          </section>

          {/* Section 2: Cronograma & Prorrogação */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div className="flex justify-between w-full items-center">
                    <h3 className="font-semibold text-gray-800">Cronograma</h3>
                </div>
             </div>
             
             <div className="bg-white p-5 rounded-lg border shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="data_abertura" className="text-sm font-medium text-gray-700">Data de Abertura <span className="text-red-500">*</span></Label>
                      <Input
                        id="data_abertura"
                        type="date"
                        value={formData.data_abertura}
                        onChange={e => handleInputChange('data_abertura', e.target.value)}
                        className="mt-1.5 bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                          <Label htmlFor="data_final" className="text-sm font-medium text-gray-700">Data Final para Envio <span className="text-red-500">*</span></Label>
                          {edital && !showProrrogation && !formData.data_prorrogacao && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => setShowProrrogation(true)}
                              >
                                + Prorrogar
                              </Button>
                          )}
                      </div>
                      
                      <div className="flex gap-2 items-center">
                          <Input
                            id="data_final"
                            type="date"
                            value={formData.data_final_envio_projeto}
                            onChange={e => handleInputChange('data_final_envio_projeto', e.target.value)}
                            className={`bg-gray-50 ${formData.data_prorrogacao ? 'text-gray-400 line-through' : ''}`}
                            disabled={!!formData.data_prorrogacao}
                          />
                          {formData.data_prorrogacao && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 whitespace-nowrap">
                                  Prorrogado
                              </Badge>
                          )}
                      </div>
                      
                      {/* Área de Prorrogação */}
                      {(showProrrogation || formData.data_prorrogacao) && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md animate-in fade-in slide-in-from-top-2">
                              <div className="flex items-center justify-between mb-2">
                                  <Label className="text-xs font-bold text-orange-800 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" /> Nova Data (Prorrogação)
                                  </Label>
                                  {!formData.data_prorrogacao && (
                                     <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-5 text-[10px] text-orange-600 hover:bg-orange-100 hover:text-orange-900 px-2"
                                        onClick={() => setShowProrrogation(false)}
                                      >
                                        Cancelar
                                      </Button>
                                  )}
                              </div>
                              <Input
                                type="date"
                                value={formData.data_prorrogacao}
                                onChange={e => handleInputChange('data_prorrogacao', e.target.value)}
                                className="bg-white border-orange-300 focus-visible:ring-orange-400"
                                min={formData.data_final_envio_projeto}
                              />
                              <p className="text-[10px] text-orange-600 mt-1.5">
                                  Ao definir esta data, o status "Prorrogado" será exibido aos proponentes.
                              </p>
                          </div>
                      )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="horario_final" className="text-sm font-medium text-gray-700">Horário Final (Limite) <span className="text-red-500">*</span></Label>
                       <Input
                        id="horario_final"
                        type="time"
                        value={formData.horario_final_envio_projeto}
                        onChange={e => handleInputChange('horario_final_envio_projeto', e.target.value)}
                        className="mt-1.5 bg-gray-50"
                      />
                    </div>
                    {/* Placeholder vazio para alinhar se necessário */}
                </div>
             </div>
          </section>

          {/* Section 3: Financeiro e Regras */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <AlertCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Financeiro e Regras</h3>
             </div>
             
             <div className="bg-white p-5 rounded-lg border shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="valor_maximo" className="text-sm font-medium text-gray-700">Valor Máximo por Projeto <span className="text-red-500">*</span></Label>
                      <div className="relative mt-1.5">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                          <Input
                            id="valor_maximo"
                            value={formData.valor_maximo}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                const numberValue = parseFloat(value) / 100;
                                const formatted = numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                handleInputChange('valor_maximo', formatted);
                            }}
                            placeholder="0,00"
                            className="pl-9 bg-gray-50 font-mono text-lg"
                          />
                      </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="prazo" className="text-sm font-medium text-gray-700">Prazo de Avaliação (dias) <span className="text-red-500">*</span></Label>
                        <Input
                          id="prazo"
                          type="number"
                          value={formData.prazo_avaliacao}
                          onChange={e => handleInputChange('prazo_avaliacao', e.target.value)}
                          placeholder="30"
                          className="mt-1.5 bg-gray-50"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-md border border-slate-200">
                    <div className="space-y-0.5">
                        <Label htmlFor="prestacao_contas" className="text-base font-medium text-slate-900">Fase de Prestação de Contas?</Label>
                        <p className="text-xs text-slate-500">
                           Habilita uma etapa específica para envio de relatórios financeiros após a execução.
                        </p>
                    </div>
                    <Switch
                        id="prestacao_contas"
                        checked={formData.has_accountability_phase}
                        onCheckedChange={(checked) => handleInputChange('has_accountability_phase', checked)}
                    />
                </div>
             </div>
          </section>

          {/* Section 4: Categorias */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Categorias</h3>
             </div>
             
             <div className="bg-white p-5 rounded-lg border shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {modalidadesList.map((modalidade) => (
                      <div key={modalidade.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`modalidade-${modalidade.value}`}
                          checked={formData.modalidades.includes(modalidade.value)}
                          onCheckedChange={() => handleModalidadeChange(modalidade.value)}
                        />
                        <label 
                          htmlFor={`modalidade-${modalidade.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {modalidade.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
          </section>

          {/* Section 5: Critérios de Avaliação */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-800">Critérios de Avaliação</h3>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addCriterio}
                className="text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Critério
              </Button>
            </div>

            <div className="space-y-3">
              {formData.criterios_avaliacao.map((criterio) => (
                <div key={criterio.id} className="flex gap-3 items-start bg-amber-50/50 p-4 rounded-lg border border-amber-100 group">
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-amber-900 mb-1 block">Descrição do Critério</Label>
                    <Input 
                      value={criterio.descricao}
                      onChange={(e) => updateCriterio(criterio.id, 'descricao', e.target.value)}
                      placeholder="Ex: Relevância cultural do projeto"
                      className="bg-white border-amber-200"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs font-semibold text-amber-900 mb-1 block">Peso</Label>
                    <Input 
                      type="number"
                      value={criterio.peso}
                      onChange={(e) => updateCriterio(criterio.id, 'peso', parseFloat(e.target.value) || 0)}
                      className="bg-white border-amber-200"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="mt-6 text-amber-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => removeCriterio(criterio.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formData.criterios_avaliacao.length === 0 && (
                <div className="text-center py-6 text-gray-400 bg-gray-50 border border-dashed rounded-lg">
                  Nenhum critério de avaliação configurado.
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Anexos */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">
                    {formData.has_accountability_phase ? 'Documentação e Prestação de Contas' : 'Anexos do Edital'}
                    <span className="ml-2 text-sm font-normal text-gray-500">({formData.anexos.length})</span>
                </h3>
             </div>
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-medium text-blue-900">Adicionar Novo Arquivo</Label> 
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <Input
                                  placeholder="Título do arquivo (Ex: Edital Completo, Anexo I...)"
                                  value={tempAnexoTitulo}
                                  onChange={(e) => setTempAnexoTitulo(e.target.value)}
                                  className="bg-white"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                      type="file"
                                      id="file-upload"
                                      accept=".pdf"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                      disabled={uploading}
                                    />
                                    <label
                                      htmlFor="file-upload"
                                      className={`flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      {uploading ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          Enviando...
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="w-4 h-4" />
                                          Selecionar PDF
                                        </>
                                      )}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-blue-600">
                            * O título definido aqui será o nome exibido para download. Se deixar em branco, usaremos o nome do arquivo.
                        </p>
                    </div>
                </div>

                {formData.anexos.length > 0 ? (
                    <div className="border rounded-md divide-y">
                        {formData.anexos.map((anexo, index) => (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="bg-red-100 p-2 rounded text-red-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 mr-4">
                                        <Input
                                          value={anexo.titulo}
                                          onChange={(e) => updateAnexoTitulo(index, e.target.value)}
                                          className="h-8 text-sm font-medium border-transparent hover:border-gray-300 focus:border-blue-500 bg-transparent px-1.5 -ml-1.5 w-full transition-colors"
                                        />
                                        <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block mt-0.5 ml-0.5">
                                            Visualizar/Baixar
                                        </a>
                                    </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAnexo(index)}
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-dashed">
                        Nenhum anexo adicionado ainda.
                    </div>
                )}
             </section>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-0 -mx-6 px-6 border-t mt-8 z-10">
             <Button variant="ghost" onClick={onClose} disabled={isSubmitting} type="button">
                Cancelar
             </Button>
             <Button type="submit" disabled={isSubmitting || uploading} className="bg-blue-900 hover:bg-blue-800 min-w-[140px]">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                {edital ? 'Salvar Alterações' : 'Criar Edital'}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
