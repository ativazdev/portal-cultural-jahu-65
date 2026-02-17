import { useState } from "react";
import { useDocumentosHabilitacao } from "@/hooks/useDocumentosHabilitacao";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, FileText, CheckCircle, FileDown, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTemplateLabel } from "@/constants/editalTemplates";

interface ProjectAttachmentsProps {
  projetoId: string;
  editalFiles?: any[];
}

export const ProjectAttachments = ({ projetoId, editalFiles = [] }: ProjectAttachmentsProps) => {
  const { toast } = useToast();
  const { documentos, loading, refresh, deleteDocumento, createDocumento } = useDocumentosHabilitacao(projetoId);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotName?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Arquivo não permitido",
        description: "Apenas PDF, Word e imagens (JPG, PNG) são aceitos.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(slotName || 'geral');
    try {
      const fileExt = file.name.split('.').pop();
      // Usar o slotName (nome técnico do campo) se disponível, caso contrário usar o nome do arquivo sanitizado
      const baseFileName = slotName 
        ? slotName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_")
        : file.name.split('.')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_");
      
      const fileName = `${baseFileName}.${fileExt}`;
      const filePath = `anexos_projetos/${projetoId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos_habilitacao')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos_habilitacao')
        .getPublicUrl(filePath);

      const success = await createDocumento({
        projeto_id: projetoId,
        nome: file.name,
        descricao: slotName || 'Anexo de Inscrição',
        tipo: slotName ? 'template_projeto' : 'anexo_projeto',
        obrigatorio: false,
        status: 'enviado' as any 
      });

      if (success) {
        // Obter o documento recém criado para atualizar com a URL
        const docs = await (supabase as any)
          .from('documentos_habilitacao')
          .select('id')
          .eq('projeto_id', projetoId)
          .eq('nome', file.name)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (docs.data?.[0]) {
          await (supabase as any)
            .from('documentos_habilitacao')
            .update({
              arquivo_url: publicUrl,
              arquivo_nome: fileName, // Usar o novo nome do arquivo para consistência
              arquivo_tamanho: file.size,
              data_upload: new Date().toISOString()
            })
            .eq('id', docs.data[0].id);
        }

        toast({
          title: "Sucesso",
          description: "Arquivo enviado com sucesso!",
        });
        refresh();
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este anexo?')) return;
    
    const success = await deleteDocumento(id);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Anexo excluído com sucesso!",
      });
    }
  };

  // Separar arquivos enviados
  // 1. Arquivos que pertencem a um slot de template do edital
  const templateFiles = documentos.filter(d => 
    editalFiles.some(ef => (ef.titulo || ef.nome) === d.descricao)
  );
  
  // 2. Outros arquivos (anexos gerais)
  const otherFiles = documentos.filter(d => 
    !editalFiles.some(ef => (ef.titulo || ef.nome) === d.descricao)
  );

  console.log('Documentos processados:', { templateFiles, otherFiles, editalFiles });

  return (
    <div className="space-y-6">
      {/* Slots para Modelos do Edital */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-blue-900 border-b pb-2">Templates e Modelos do Edital</h4>
        
        {editalFiles.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
            <p className="text-xs text-gray-500 italic">Nenhum modelo específico anexado ao edital.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {editalFiles.map((file) => {
              const rawTitle = file.titulo || file.nome;
              const fileTitle = getTemplateLabel(rawTitle);
              const uploadedDoc = templateFiles.find(d => d.descricao === rawTitle || d.descricao === fileTitle);
              const currentSlotUploading = uploading === rawTitle;

              return (
                <div key={file.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{fileTitle}</p>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileDown className="h-3 w-3" />
                          Baixar Modelo para preencher
                        </a>
                      </div>
                    </div>
                    
                    <div>
                      {uploadedDoc ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enviado
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeletar(uploadedDoc.id)}
                            className="text-red-500 hover:bg-red-50 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            className="hidden"
                            id={`upload-${file.id}`}
                            onChange={(e) => handleFileUpload(e, rawTitle)}
                            disabled={!!uploading}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <Label htmlFor={`upload-${file.id}`} className="cursor-pointer">
                            <Button asChild size="sm" variant="outline" disabled={!!uploading} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                              <span>
                                {currentSlotUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                                {currentSlotUploading ? 'Enviando...' : 'Subir preenchido'}
                              </span>
                            </Button>
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadedDoc && (
                    <div className="pl-12 py-2 border-t border-dashed border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs text-gray-500 truncate italic">{uploadedDoc.nome}</span>
                        <span className="text-[10px] text-gray-400">
                          {uploadedDoc.arquivo_tamanho ? `(${(uploadedDoc.arquivo_tamanho / 1024 / 1024).toFixed(2)} MB)` : ''}
                        </span>
                      </div>
                      <a href={uploadedDoc.arquivo_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline">
                        Visualizar meu arquivo
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Outros Anexos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-bold text-gray-700">Outros Anexos / Portfólio</h4>
          <div className="relative">
            <input
              type="file"
              className="hidden"
              id="file-upload-geral"
              onChange={(e) => handleFileUpload(e)}
              disabled={!!uploading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Label htmlFor="file-upload-geral" className="cursor-pointer">
              <Button asChild variant="outline" size="sm" disabled={!!uploading} className="cursor-pointer">
                <span>
                  {uploading === 'geral' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {uploading === 'geral' ? 'Enviando...' : 'Adicionar Outro Arquivo'}
                </span>
              </Button>
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : otherFiles.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm text-gray-500 italic">Nenhum anexo extra enviado.</p>
            </div>
          ) : (
            otherFiles.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm group">
                <div className="flex items-center gap-3 truncate pr-4">
                  <div className="bg-gray-50 p-2 rounded">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-sm truncate">{doc.nome}</p>
                    <p className="text-[10px] text-gray-400">
                      {doc.arquivo_tamanho ? `${(doc.arquivo_tamanho / 1024 / 1024).toFixed(2)} MB` : 'Tamanho desconhecido'} 
                      {doc.data_upload && ` • ${new Date(doc.data_upload).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileDown className="h-4 w-4 text-blue-600" />
                    </Button>
                  </a>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                    onClick={() => handleDeletar(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
