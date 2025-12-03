import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Calendar,
  DollarSign,
  Search,
  Eye,
  Plus,
  Download,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { supabase, getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import JSZip from 'jszip';

interface Edital {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  data_abertura: string;
  data_final_envio_projeto: string;
  valor_maximo: number;
  status: string;
  modalidades: string[];
  regulamento?: string[];
}

export const ProponenteEditais = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proponente } = useProponenteAuth();
  
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEditais, setFilteredEditais] = useState<Edital[]>([]);
  const [downloadingEditalId, setDownloadingEditalId] = useState<string | null>(null);

  useEffect(() => {
    if (proponente?.id) {
      carregarEditais();
    }
  }, [nomePrefeitura, proponente]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = editais.filter(edital => 
        edital.nome.toLowerCase().includes(term) || 
        edital.codigo.toLowerCase().includes(term) ||
        edital.descricao.toLowerCase().includes(term)
      );
      setFilteredEditais(filtered);
    } else {
      setFilteredEditais(editais);
    }
  }, [searchTerm, editais]);

  const carregarEditais = async () => {
    if (!proponente?.id || !proponente?.prefeitura_id) {
      return;
    }
    
    try {
      setLoading(true);

      // Usar o prefeitura_id diretamente do objeto proponente (já vem do login)
      const prefeituraId = proponente.prefeitura_id;

      // Buscar editais recebendo projetos (incluindo regulamento)
      const authClient = getAuthenticatedSupabaseClient('proponente');
      const { data, error } = await authClient
        .from('editais')
        .select('id, codigo, nome, descricao, data_abertura, data_final_envio_projeto, valor_maximo, status, modalidades, regulamento')
        .eq('prefeitura_id', prefeituraId)
        .eq('status', 'recebendo_projetos')
        .order('data_final_envio_projeto', { ascending: true });

      if (error) throw error;

      setEditais(data || []);
      setFilteredEditais(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar editais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar editais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      recebendo_projetos: { label: 'Recebendo Projetos', color: 'bg-blue-500' },
      avaliacao: { label: 'Avaliação', color: 'bg-orange-500' },
      recurso: { label: 'Recurso', color: 'bg-purple-500' },
      contra_razao: { label: 'Contra-razão', color: 'bg-pink-500' },
      em_execucao: { label: 'Em Execução', color: 'bg-indigo-500' },
      finalizado: { label: 'Finalizado', color: 'bg-green-500' },
      rascunho: { label: 'Rascunho', color: 'bg-yellow-500' },
      arquivado: { label: 'Arquivado', color: 'bg-gray-500' },
      ativo: { label: 'Ativo', color: 'bg-green-500' }, // Legacy
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const verificarSeInscreveu = async (editalId: string) => {
    if (!proponente) return false;
    
    try {
      // Primeiro, buscar os proponentes vinculados ao usuário
      const { data: proponentes, error: proponentesError } = await (supabase as any)
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);
      
      if (proponentesError || !proponentes || proponentes.length === 0) {
        return false;
      }
      
      const proponenteIds = proponentes.map(p => p.id);
      
      // Verificar se existe um projeto para algum dos proponentes do usuário
      const { data, error } = await (supabase as any)
        .from('projetos')
        .select('id')
        .in('proponente_id', proponenteIds)
        .eq('edital_id', editalId)
        .single();
      
      return !error && data !== null;
    } catch {
      return false;
    }
  };

  const handleInscrever = async (editalId: string) => {
    if (!proponente) return;
    
    try {
      // Primeiro, buscar os proponentes vinculados ao usuário
      const { data: proponentes, error: proponentesError } = await (supabase as any)
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);
      
      if (proponentesError || !proponentes || proponentes.length === 0) {
        // Se não tem proponentes, ir direto para o cadastro
        navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`);
        return;
      }
      
      const proponenteIds = proponentes.map(p => p.id);
      
      // Verificar se existe um projeto em rascunho para este edital
      const { data: projetoRascunho, error: projetoError } = await (supabase as any)
        .from('projetos')
        .select('*')
        .in('proponente_id', proponenteIds)
        .eq('edital_id', editalId)
        .eq('status', 'rascunho')
        .single();
      
      // Se encontrou rascunho, navegar com flag para abrir modal
      if (!projetoError && projetoRascunho) {
        navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`, {
          state: { fromEditais: true }
        });
        return;
      }
      
      // Se não tem rascunho, navegar normalmente sem flag
      navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`);
    } catch (error) {
      console.error('Erro ao verificar rascunho:', error);
      // Em caso de erro, navegar mesmo assim
      navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`);
    }
  };

  const handleVerProjeto = async (editalId: string) => {
    if (!proponente) return;
    
    try {
      // Primeiro, buscar os proponentes vinculados ao usuário
      const { data: proponentes, error: proponentesError } = await (supabase as any)
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);
      
      if (proponentesError || !proponentes || proponentes.length === 0) {
        toast({
          title: "Aviso",
          description: "Você ainda não possui um projeto inscrito neste edital",
        });
        return;
      }
      
      const proponenteIds = proponentes.map(p => p.id);
      
      // Buscar o projeto para algum dos proponentes do usuário
      const { data, error } = await (supabase as any)
        .from('projetos')
        .select('id')
        .in('proponente_id', proponenteIds)
        .eq('edital_id', editalId)
        .single();
      
      if (error || !data) {
        toast({
          title: "Aviso",
          description: "Você ainda não possui um projeto inscrito neste edital",
        });
        return;
      }

      navigate(`/${nomePrefeitura}/proponente/projetos/${data.id}`);
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao buscar projeto",
        variant: "destructive",
      });
    }
  };

  const handleDownloadRegulamento = async (edital: Edital) => {
    if (!edital.regulamento || edital.regulamento.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum arquivo de regulamento encontrado para este edital.",
      });
      return;
    }

    try {
      setDownloadingEditalId(edital.id);
      const urlsRegulamento = edital.regulamento as string[];
      const zip = new JSZip();

      // Baixar cada arquivo e adicionar ao ZIP
      for (let i = 0; i < urlsRegulamento.length; i++) {
        try {
          const url = urlsRegulamento[i];
          
          // Extrair o nome do arquivo e path do storage da URL
          let fileName: string;
          let storagePath: string;

          if (url.startsWith('http://') || url.startsWith('https://')) {
            // URL pública completa - extrair o path do storage
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            // Procurar pelo bucket 'editais' e pegar o que vem depois
            const bucketIndex = pathParts.indexOf('editais');
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              storagePath = pathParts.slice(bucketIndex + 1).join('/');
              fileName = pathParts[pathParts.length - 1] || `arquivo_${i + 1}.pdf`;
            } else {
              // Fallback: pegar última parte do path
              storagePath = pathParts[pathParts.length - 1];
              fileName = pathParts[pathParts.length - 1] || `arquivo_${i + 1}.pdf`;
            }
          } else {
            // Já é um path do storage (apenas o nome do arquivo)
            storagePath = url;
            fileName = url.split('/').pop() || `arquivo_${i + 1}.pdf`;
          }

          // Baixar arquivo do storage
          const authClient = getAuthenticatedSupabaseClient('proponente');
          const { data: fileData, error: downloadError } = await authClient.storage
            .from('editais')
            .download(storagePath);

          if (downloadError) {
            console.error(`Erro ao baixar arquivo ${fileName}:`, downloadError);
            // Tentar baixar diretamente pela URL se o download do storage falhar
            try {
              const response = await fetch(url);
              if (response.ok) {
                const blob = await response.blob();
                zip.file(fileName, blob);
              } else {
                console.error(`Erro ao baixar arquivo ${fileName} via URL:`, response.statusText);
              }
            } catch (fetchError) {
              console.error(`Erro ao fazer fetch do arquivo ${fileName}:`, fetchError);
            }
            continue;
          }

          if (fileData) {
            // Adicionar arquivo ao ZIP
            zip.file(fileName, fileData);
          }
        } catch (err) {
          console.error(`Erro ao processar arquivo ${i + 1}:`, err);
        }
      }

      // Gerar ZIP e fazer download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `regulamento_${edital.codigo}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);

      toast({
        title: "Sucesso",
        description: `Regulamento baixado com ${urlsRegulamento.length} arquivo(s) em ZIP!`,
      });
    } catch (error) {
      console.error('Erro ao baixar arquivos do regulamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar arquivos do regulamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDownloadingEditalId(null);
    }
  };

  return (
    <ProponenteLayout 
      title="Editais Abertos"
      description="Visualize editais abertos para inscrição e inscreva seus projetos"
    >
      <div className="space-y-6">
        {/* Busca */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Editais */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredEditais.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum edital encontrado' : 'Nenhum edital aberto no momento'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredEditais.map((edital) => (
              <Card key={edital.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {edital.codigo}
                        </Badge>
                        {getStatusBadge(edital.status)}
                      </div>
                      <CardTitle className="text-2xl">{edital.nome}</CardTitle>
                      <CardDescription className="text-base">
                        {edital.descricao}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Encerramento</p>
                        <p className="font-medium">{formatarData(edital.data_final_envio_projeto)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Valor Máximo</p>
                        <p className="font-medium">{formatarMoeda(edital.valor_maximo)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Modalidades</p>
                        <p className="font-medium">{edital.modalidades?.join(', ') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleInscrever(edital.id)}
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Inscrever Projeto
                    </Button>
                    {edital.regulamento && edital.regulamento.length > 0 && (
                      <Button
                        onClick={() => handleDownloadRegulamento(edital)}
                        variant="outline"
                        size="sm"
                        disabled={downloadingEditalId === edital.id}
                      >
                        {downloadingEditalId === edital.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Baixando...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar Regulamento
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProponenteLayout>
  );
};

