import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Eye,
  FolderOpen,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";

export const ProponenteProjetos = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proponente } = useProponenteAuth();
  
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjetos, setFilteredProjetos] = useState<any[]>([]);

  useEffect(() => {
    if (proponente?.id) {
      carregarProjetos();
    }
  }, [nomePrefeitura, proponente]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = projetos.filter(projeto => 
        projeto.nome.toLowerCase().includes(term) || 
        projeto.descricao?.toLowerCase().includes(term)
      );
      setFilteredProjetos(filtered);
    } else {
      setFilteredProjetos(projetos);
    }
  }, [searchTerm, projetos]);

  const carregarProjetos = async () => {
    if (!proponente?.id) {
      return;
    }
    
    try {
      setLoading(true);

      const authClient = getAuthenticatedSupabaseClient();
      
      // Buscar os proponentes vinculados ao usuário
      const { data: proponentes, error: proponentesError } = await authClient
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);
      
      if (proponentesError || !proponentes || proponentes.length === 0) {
        setProjetos([]);
        setFilteredProjetos([]);
        return;
      }
      
      const proponenteIds = (proponentes as any[]).map(p => p.id);
      
      // Buscar projetos dos proponentes com dados do edital
      const { data, error } = await authClient
        .from('projetos')
        .select(`
          *,
          edital:editais (
            id,
            nome,
            codigo,
            data_abertura,
            data_final_envio_projeto,
            valor_maximo
          )
        `)
        .in('proponente_id', proponenteIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjetos(data || []);
      setFilteredProjetos(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      'rascunho': { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: <FileText className="h-4 w-4" /> },
      'aguardando_parecerista': { label: 'Aguardando Parecerista', color: 'bg-orange-100 text-orange-800', icon: <Clock className="h-4 w-4" /> },
      'aguardando_avaliacao': { label: 'Aguardando Avaliação', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
      'recebido': { label: 'Recebido', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4" /> },
      'em_avaliacao': { label: 'Em Avaliação', color: 'bg-orange-100 text-orange-800', icon: <Search className="h-4 w-4" /> },
      'avaliado': { label: 'Avaliado', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="h-4 w-4" /> },
      'habilitado': { label: 'Habilitado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      'nao_habilitado': { label: 'Não Habilitado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
      'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      'rejeitado': { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
      'em_execucao': { label: 'Em Execução', color: 'bg-purple-100 text-purple-800', icon: <PlayCircle className="h-4 w-4" /> },
      'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> }
    };
    return configs[status] || configs['rascunho'];
  };

  return (
    <ProponenteLayout 
      title="Meus Projetos"
      description="Visualize e gerencie seus projetos inscritos"
    >
      <div className="space-y-6">
        {/* Busca */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Projetos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjetos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum projeto encontrado' : 'Você ainda não possui projetos inscritos'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredProjetos.map((projeto) => {
              const statusConfig = getStatusConfig(projeto.status);
              const edital = (projeto.edital as any);
              
              return (
                <Card key={projeto.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusConfig.color} flex items-center gap-2`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{projeto.nome}</h3>
                          <p className="text-gray-600 mt-1">{projeto.descricao}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium">Modalidade: {projeto.modalidade}</span>
                          {edital?.codigo && (
                            <span className="font-medium">Edital: {edital.codigo}</span>
                          )}
                          {edital?.nome && (
                            <span className="text-gray-600">{edital.nome}</span>
                          )}
                          {projeto.data_submissao ? (
                            <span>Enviado em: {new Date(projeto.data_submissao).toLocaleDateString('pt-BR')}</span>
                          ) : (
                            <span className="text-orange-600 font-medium">Rascunho não enviado</span>
                          )}
                        </div>
                        {edital && (edital.data_abertura || edital.data_final_envio_projeto) && (
                          <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t">
                            {edital.data_abertura && (
                              <span>Abertura: {new Date(edital.data_abertura).toLocaleDateString('pt-BR')}</span>
                            )}
                            {edital.data_final_envio_projeto && (
                              <span>Encerramento: {new Date(edital.data_final_envio_projeto).toLocaleDateString('pt-BR')}</span>
                            )}
                            {edital.valor_maximo && (
                              <span className="font-medium text-gray-600">
                                Valor máximo: R$ {edital.valor_maximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          if (projeto.status === 'rascunho') {
                            navigate(`/${nomePrefeitura}/proponente/editais/${edital?.id || projeto.edital_id}/cadastrar-projeto`, {
                              state: { projetoId: projeto.id }
                            });
                          } else {
                            navigate(`/${nomePrefeitura}/proponente/projetos/${projeto.id}`);
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        {projeto.status === 'rascunho' ? (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Finalizar Inscrição
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </>
                        )}
                      </Button>
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

