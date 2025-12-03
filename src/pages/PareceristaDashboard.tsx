import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Eye } from "lucide-react";
import { PareceristaLayout } from "@/components/layout/PareceristaLayout";
import { usePareceristaAuth } from "@/hooks/usePareceristaAuth";
import { getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjetoAvaliacao {
  id: string;
  nome: string;
  modalidade: string;
  descricao: string;
  status_projeto: string;
  status_avaliacao: string;
  proponente: {
    nome: string;
  };
  created_at: string;
}

export const PareceristaDashboard = () => {
  const { nomePrefeitura, editalId } = useParams<{ nomePrefeitura: string; editalId: string }>();
  const navigate = useNavigate();
  const { parecerista } = usePareceristaAuth();
  const { toast } = useToast();
  
  const [projetosAvaliados, setProjetosAvaliados] = useState(0);
  const [projetosPendentes, setProjetosPendentes] = useState(0);
  const [projetosParaAvaliar, setProjetosParaAvaliar] = useState<ProjetoAvaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      if (!parecerista || !editalId) return;

      try {
        setLoading(true);
        
        // Buscar todas as avaliações do parecerista para este edital
        const authClient = getAuthenticatedSupabaseClient('parecerista');
        const { data: avaliacoes, error: avaliacoesError } = await authClient
          .from('avaliacoes')
          .select(`
            id,
            status,
            projeto:projetos!inner (
              id,
              nome,
              modalidade,
              descricao,
              status,
              created_at,
              proponente:proponentes!inner (
                nome
              )
            )
          `)
          .eq('parecerista_id', parecerista.id)
          .eq('projeto.edital_id', editalId);

        if (avaliacoesError) throw avaliacoesError;

        // Contar avaliações
        const avaliacoesData = avaliacoes as any[];
        const totalAvaliacoes = avaliacoesData?.length || 0;
        const pendentes = avaliacoesData?.filter((a: any) => 
          a.status === 'pendente' || a.status === 'aguardando_parecerista'
        ).length || 0;
        
        setProjetosAvaliados(totalAvaliacoes);
        setProjetosPendentes(pendentes);

        // Filtrar projetos pendentes para exibir na lista
        const pendentesList = avaliacoesData
          ?.filter((a: any) => a.status === 'pendente' || a.status === 'aguardando_parecerista')
          .map((a: any) => ({
            id: a.projeto.id,
            nome: a.projeto.nome,
            modalidade: a.projeto.modalidade,
            descricao: a.projeto.descricao,
            status_projeto: a.projeto.status,
            status_avaliacao: a.status,
            proponente: {
              nome: a.projeto.proponente.nome
            },
            created_at: a.projeto.created_at
          })) || [];

        setProjetosParaAvaliar(pendentesList);
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [parecerista, editalId, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
      case 'aguardando_parecerista':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'em_avaliacao':
        return <Badge className="bg-blue-100 text-blue-800">Em Avaliação</Badge>;
      case 'avaliado':
        return <Badge className="bg-green-100 text-green-800">Avaliado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getProjetoStatusBadge = (status: string) => {
    switch (status) {
      case 'aguardando_avaliacao':
        return <Badge className="bg-orange-100 text-orange-800">Aguardando</Badge>;
      case 'em_avaliacao':
        return <Badge className="bg-blue-100 text-blue-800">Em Avaliação</Badge>;
      case 'avaliado':
        return <Badge className="bg-green-100 text-green-800">Avaliado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PareceristaLayout
      title="Dashboard"
      description="Painel de controle de avaliações"
      editalId={editalId}
    >
      <div className="space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projetos Avaliados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projetosAvaliados}</div>
              <p className="text-xs text-muted-foreground">
                Total de avaliações realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projetos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{projetosPendentes}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando sua avaliação
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Projetos para Avaliar */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos para Avaliar</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando projetos...
              </div>
            ) : projetosParaAvaliar.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum projeto pendente para avaliação
              </div>
            ) : (
              <div className="space-y-4">
                {projetosParaAvaliar.map((projeto) => (
                  <div
                    key={projeto.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{projeto.nome}</h3>
                        {getStatusBadge(projeto.status_avaliacao)}
                        {getProjetoStatusBadge(projeto.status_projeto)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {projeto.descricao}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span><strong>Modalidade:</strong> {projeto.modalidade}</span>
                        <span><strong>Proponente:</strong> {projeto.proponente.nome}</span>
                        <span><strong>Recebido em:</strong> {new Date(projeto.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/${nomePrefeitura}/parecerista/${editalId}/projetos/${projeto.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PareceristaLayout>
  );
};

