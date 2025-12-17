import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edital } from '@/services/editalService';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

interface EditalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  edital?: Edital | null;
  loading?: boolean;
}

const modalidades = [
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

export const EditalModal = ({ open, onClose, onSave, edital, loading = false }: EditalModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    data_abertura: '',
    data_final_envio_projeto: '',
    horario_final_envio_projeto: '',
    valor_maximo: '',
    prazo_avaliacao: '',
    modalidades: [] as string[],
    regulamento: [] as string[]
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Inicializar dados do formulário
  useEffect(() => {
    if (edital) {
      setFormData({
        codigo: edital.codigo || '',
        nome: edital.nome || '',
        descricao: edital.descricao || '',
        data_abertura: edital.data_abertura || '',
        data_final_envio_projeto: edital.data_final_envio_projeto || '',
        horario_final_envio_projeto: edital.horario_final_envio_projeto || '',
        valor_maximo: edital.valor_maximo?.toString() || '',
        prazo_avaliacao: edital.prazo_avaliacao?.toString() || '',
        modalidades: edital.modalidades || [],
        regulamento: edital.regulamento || []
      });
    } else {
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        data_abertura: '',
        data_final_envio_projeto: '',
        horario_final_envio_projeto: '',
        valor_maximo: '',
        prazo_avaliacao: '',
        modalidades: [],
        regulamento: []
      });
    }
    setUploadedFiles([]);
    // Resetar estado de submissão quando o modal abrir/fechar
    setIsSubmitting(false);
  }, [edital, open]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoriaChange = (modalidade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      modalidades: checked 
        ? [...prev.modalidades, modalidade]
        : prev.modalidades.filter(m => m !== modalidade)
    }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Apenas arquivos PDF são permitidos.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of pdfFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('editais')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('editais')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        regulamento: [...prev.regulamento, ...uploadedUrls]
      }));

      toast({
        title: "Sucesso",
        description: `${uploadedUrls.length} arquivo(s) enviado(s) com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload dos arquivos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      regulamento: prev.regulamento.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de todos os campos obrigatórios
    if (!formData.codigo.trim()) {
      toast({
        title: "Erro",
        description: "O código do edital é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do edital é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.descricao.trim()) {
      toast({
        title: "Erro",
        description: "A descrição é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.data_abertura) {
      toast({
        title: "Erro",
        description: "A data de abertura é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.data_final_envio_projeto) {
      toast({
        title: "Erro",
        description: "A data final para envio é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.horario_final_envio_projeto) {
      toast({
        title: "Erro",
        description: "O horário final é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.valor_maximo || formData.valor_maximo.trim() === '' || isNaN(parseFloat(formData.valor_maximo)) || parseFloat(formData.valor_maximo) <= 0) {
      toast({
        title: "Erro",
        description: "O valor máximo é obrigatório e deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.prazo_avaliacao || formData.prazo_avaliacao.trim() === '' || isNaN(parseInt(formData.prazo_avaliacao)) || parseInt(formData.prazo_avaliacao) <= 0) {
      toast({
        title: "Erro",
        description: "O prazo de avaliação é obrigatório e deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (formData.modalidades.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma categoria.",
        variant: "destructive",
      });
      return;
    }

    if (formData.regulamento.length === 0) {
      toast({
        title: "Erro",
        description: "É necessário anexar pelo menos um arquivo PDF do regulamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const dataToSave = {
        ...formData,
        valor_maximo: parseFloat(formData.valor_maximo),
        prazo_avaliacao: parseInt(formData.prazo_avaliacao)
      };
      
      await onSave(dataToSave);
      // Resetar estado após sucesso
      setIsSubmitting(false);
    } catch (error) {
      // Em caso de erro, também resetar o estado
      setIsSubmitting(false);
      console.error('Erro ao salvar edital:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {edital ? 'Editar Edital' : 'Novo Edital'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do edital
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código do Edital *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                placeholder="PNAB-2024-001"
                required
              />
            </div>

            <div>
              <Label htmlFor="nome">Nome do Edital *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Programa Nacional de Apoio à Cultura"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descrição detalhada do edital..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_abertura">Data de Abertura *</Label>
              <Input
                id="data_abertura"
                type="date"
                value={formData.data_abertura}
                onChange={(e) => handleInputChange('data_abertura', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="data_final_envio_projeto">Data Final para Envio *</Label>
              <Input
                id="data_final_envio_projeto"
                type="date"
                value={formData.data_final_envio_projeto}
                onChange={(e) => handleInputChange('data_final_envio_projeto', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horario_final_envio_projeto">Horário Final *</Label>
              <Input
                id="horario_final_envio_projeto"
                type="time"
                value={formData.horario_final_envio_projeto}
                onChange={(e) => handleInputChange('horario_final_envio_projeto', e.target.value)}
                placeholder="23:59"
                required
              />
            </div>

            <div>
              <Label htmlFor="valor_maximo">Valor Máximo (R$) *</Label>
              <Input
                id="valor_maximo"
                type="number"
                value={formData.valor_maximo}
                onChange={(e) => handleInputChange('valor_maximo', e.target.value)}
                placeholder="50000"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prazo_avaliacao">Prazo de Avaliação (dias) *</Label>
            <Input
              id="prazo_avaliacao"
              type="number"
              value={formData.prazo_avaliacao}
              onChange={(e) => handleInputChange('prazo_avaliacao', e.target.value)}
              placeholder="30"
              min="1"
              required
            />
          </div>

          <div>
            <Label>Categorias *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {modalidades.map((modalidade) => (
                <div key={modalidade.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={modalidade.value}
                    checked={formData.modalidades.includes(modalidade.value)}
                    onCheckedChange={(checked) => 
                      handleCategoriaChange(modalidade.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={modalidade.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {modalidade.label}
                  </Label>
                </div>
              ))}
            </div>
            {formData.modalidades.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                Selecione pelo menos uma categoria
              </p>
            )}
          </div>

          <div>
            <Label>Regulamento (PDFs) *</Label>
            <div className="mt-2">
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
              <Label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : 'Selecionar PDFs'}
              </Label>
            </div>
            {formData.regulamento.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                É necessário anexar pelo menos um arquivo PDF
              </p>
            )}

            {formData.regulamento.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Arquivos anexados:</p>
                {formData.regulamento.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm text-gray-700">
                        {url.split('/').pop()}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || 
                loading || 
                !formData.codigo.trim() ||
                !formData.nome.trim() ||
                !formData.descricao.trim() ||
                !formData.data_abertura ||
                !formData.data_final_envio_projeto ||
                !formData.horario_final_envio_projeto ||
                !formData.valor_maximo ||
                !formData.prazo_avaliacao ||
                formData.modalidades.length === 0 ||
                formData.regulamento.length === 0
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                edital ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
