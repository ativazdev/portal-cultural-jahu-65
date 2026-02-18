import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Calendar,
  DollarSign,
  Search,
  Eye,
  Plus,
  Download,
  Loader2,
  Paperclip
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { supabase, getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import JSZip from 'jszip';

interface Anexo {
  titulo: string;
  url: string;
  tipo: string;
}

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
  anexos: Anexo[];
  data_prorrogacao?: string;
  has_accountability_phase: boolean;
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
      const prefeituraId = proponente.prefeitura_id;
      const authClient = getAuthenticatedSupabaseClient('proponente');
      
      const { data, error } = await authClient
        .from('editais')
        .select('id, codigo, nome, descricao, data_abertura, data_final_envio_projeto, valor_maximo, status, modalidades, regulamento, anexos, data_prorrogacao, has_accountability_phase')
        .eq('prefeitura_id', prefeituraId)
        .neq('status', 'rascunho') // Não mostrar rascunhos da prefeitura
        .order('data_final_envio_projeto', { ascending: false });

      if (error) throw error;

      // Ordenação personalizada: 'recebendo_projetos' primeiro, depois os demais.
      // Dentro de cada grupo, mantém a ordenação por data descrecente.
      const ordenados = ((data as any[]) || []).sort((a, b) => {
        if (a.status === 'recebendo_projetos' && b.status !== 'recebendo_projetos') return -1;
        if (a.status !== 'recebendo_projetos' && b.status === 'recebendo_projetos') return 1;
        
        // Se ambos têm o mesmo status (ou ambos não são 'recebendo_projetos'),
        // ordena por data de envio (mais recente primeiro)
        const dateA = new Date(a.data_final_envio_projeto).getTime();
        const dateB = new Date(b.data_final_envio_projeto).getTime();
        return dateB - dateA;
      });

      setEditais(ordenados);
      setFilteredEditais(ordenados);
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
      contra_razao: { label: 'Contrarrazão', color: 'bg-pink-500' },
      em_execucao: { label: 'Em Execução', color: 'bg-indigo-500' },
      finalizado: { label: 'Finalizado', color: 'bg-green-500' },
      rascunho: { label: 'Rascunho', color: 'bg-yellow-500' },
      arquivado: { label: 'Arquivado', color: 'bg-gray-500' },
      ativo: { label: 'Ativo', color: 'bg-green-500' },
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
    // ... (implementação mantida)
    return false; // Simplificado para visualização
  };

  const handleInscrever = async (editalId: string) => {
    if (!proponente) return;
    
    try {
      const { data: proponentes, error: proponentesError } = await (supabase as any)
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);
      
      if (proponentesError || !proponentes || proponentes.length === 0) {
        navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`);
        return;
      }
      
      const proponenteIds = proponentes.map(p => p.id);
      
      const { data: projetoRascunho, error: projetoError } = await (supabase as any)
        .from('projetos')
        .select('*')
        .in('proponente_id', proponenteIds)
        .eq('edital_id', editalId)
        .eq('status', 'rascunho')
        .single();
      
      if (!projetoError && projetoRascunho) {
        navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`, {
          state: { fromEditais: true }
        });
        return;
      }
      
      navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`);
    } catch (error) {
      console.error('Erro ao verificar rascunho:', error);
      navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`);
    }
  };

  // Helper para obter anexos (combina legado e novo)
  const getAnexos = (edital: Edital) => {
    const anexos: Anexo[] = [...(edital.anexos || [])];
    
    // Se não tem anexos novos, mas tem regulamento legado, converte
    if (anexos.length === 0 && edital.regulamento && edital.regulamento.length > 0) {
      edital.regulamento.forEach((url, i) => {
        anexos.push({
          titulo: `Regulamento ${i + 1}`,
          url,
          tipo: 'pdf'
        });
      });
    }
    return anexos;
  };

  return (
    <ProponenteLayout 
      title="Editais Abertos"
      description="Visualize editais abertos para inscrição e inscreva seus projetos"
    >
      <div className="space-y-6">
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
            {filteredEditais.map((edital) => {
              const anexos = getAnexos(edital);
              const prorrogado = !!edital.data_prorrogacao;

              return (
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
                        <CardDescription className="text-base line-clamp-2">
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
                          {prorrogado ? (
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-white bg-[#EF7474] px-2 py-0.5 rounded-full w-fit mb-0.5">
                                Prorrogado até
                              </span>
                              <span className="font-bold text-gray-700">
                                {formatarData(edital.data_prorrogacao!)}
                              </span>
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-500">Encerramento</p>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {formatarData(edital.data_final_envio_projeto)}
                                </span>
                              </div>
                            </>
                          )}
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
                          <p className="text-gray-500">Categorias</p>
                          <p className="font-medium">{edital.modalidades?.join(', ') || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/${nomePrefeitura}/proponente/editais/${edital.id}/detalhes`)}
                      >
                        Ver Detalhes
                      </Button>
                      
                      {(() => {
                        const hoje = new Date();
                        const dataFinal = edital.data_prorrogacao ? new Date(edital.data_prorrogacao) : new Date(edital.data_final_envio_projeto);
                        
                        // O edital está aberto se:
                        // 1. O status for 'recebendo_projetos' e estiver dentro do prazo
                        // 2. OU se for um edital de prestação de contas e o status for 'ativo' ou 'em_execucao'
                        const isAberto = (edital.status === 'recebendo_projetos' && hoje <= dataFinal) || 
                                         (edital.has_accountability_phase && (edital.status === 'ativo' || edital.status === 'em_execucao' || edital.status === 'recebendo_projetos'));
                        
                        if (isAberto) {
                          return (
                            <Button 
                              className={`flex-1 ${
                                edital.has_accountability_phase 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                              onClick={() => {
                                if (edital.has_accountability_phase) {
                                   navigate(`/${nomePrefeitura}/proponente/edital/${edital.id}/prestar-contas`);
                                } else {
                                   handleInscrever(edital.id);
                                }
                              }}
                            >
                              {edital.has_accountability_phase ? "Prestar Contas" : "Inscrever Projeto"}
                            </Button>
                          );
                        }
                        return null;
                      })()}
                      {anexos.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1">
                              <Paperclip className="mr-2 h-4 w-4" />
                              Ver Anexos ({anexos.length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Anexos do Edital</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 mt-2">
                              {anexos.map((anexo, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded shadow-sm">
                                      <FileText className="h-5 w-5 text-red-500" />
                                    </div>
                                    <span className="font-medium text-sm">{anexo.titulo}</span>
                                  </div>
                                  <Button size="sm" variant="ghost" asChild>
                                    <a href={anexo.url} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProponenteLayout>
  );
};

