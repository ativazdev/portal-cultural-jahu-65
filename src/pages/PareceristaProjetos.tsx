import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
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
  data_recebimento: string;
}

export const PareceristaProjetos = () => {
  const { nomePrefeitura, editalId } = useParams<{ nomePrefeitura: string; editalId: string }>();
  const navigate = useNavigate();
  const { parecerista } = usePareceristaAuth();
  const { toast } = useToast();
  
  const [projetos, setProjetos] = useState<ProjetoAvaliacao[]>([]);
  const [filteredProjetos, setFilteredProjetos] = useState<ProjetoAvaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const carregarProjetos = async () => {
      if (!parecerista || !editalId) return;

      try {
        setLoading(true);
        
        // Buscar todas as avaliações do parecerista para este edital
        const authClient = getAuthenticatedSupabaseClient();
        const { data: avaliacoes, error: avaliacoesError } = await authClient
          .from('avaliacoes')
          .select(`
            id,
            status,
            data_atribuicao,
            projeto:projetos!inner (
              id,
              nome,
              modalidade,
              descricao,
              status,
              data_submissao,
              proponente:proponentes!inner (
                nome
              )
            )
          `)
          .eq('parecerista_id', parecerista.id)
          .eq('projeto.edital_id', editalId)
          .order('data_atribuicao', { ascending: false });

        if (avaliacoesError) throw avaliacoesError;

        const avaliacoesData = avaliacoes as any[];
        const projetosList = avaliacoesData?.map((a: any) => ({
          id: a.projeto.id,
          nome: a.projeto.nome,
          modalidade: a.projeto.modalidade,
          descricao: a.projeto.descricao,
          status_projeto: a.projeto.status,
          status_avaliacao: a.status,
          proponente: {
            nome: a.projeto.proponente.nome
          },
          data_recebimento: a.data_atribuicao || a.projeto.data_submissao
        })) || [];

        setProjetos(projetosList);
        setFilteredProjetos(projetosList);
      } catch (error: any) {
        console.error('Erro ao carregar projetos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar projetos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarProjetos();
  }, [parecerista, editalId, toast]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...projetos];

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proponente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.modalidade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.status_avaliacao === filterStatus);
    }

    setFilteredProjetos(filtered);
  }, [searchTerm, filterStatus, projetos]);

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
      case 'rascunho':
        return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case 'aguardando_parecerista':
        return <Badge className="bg-orange-100 text-orange-800">Aguardando Parecerista</Badge>;
      case 'aguardando_avaliacao':
        return <Badge className="bg-yellow-100 text-yellow-800">Aguardando Avaliação</Badge>;
      case 'recebido':
        return <Badge className="bg-blue-100 text-blue-800">Recebido</Badge>;
      case 'em_avaliacao':
        return <Badge className="bg-orange-100 text-orange-800">Em Avaliação</Badge>;
      case 'avaliado':
        return <Badge className="bg-purple-100 text-purple-800">Avaliado</Badge>;
      case 'habilitado':
        return <Badge className="bg-green-100 text-green-800">Habilitado</Badge>;
      case 'nao_habilitado':
        return <Badge className="bg-red-100 text-red-800">Não Habilitado</Badge>;
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'em_execucao':
        return <Badge className="bg-purple-100 text-purple-800">Em Execução</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PareceristaLayout
      title="Projetos"
      description="Projetos atribuídos para avaliação"
      editalId={editalId}
    >
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pesquisar por nome, proponente ou modalidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aguardando_parecerista">Aguardando</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_avaliacao">Em Avaliação</SelectItem>
                  <SelectItem value="avaliado">Avaliado</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Projetos */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos para Avaliar ({filteredProjetos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando projetos...
              </div>
            ) : filteredProjetos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum projeto encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjetos.map((projeto) => (
                  <div
                    key={projeto.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{projeto.nome}</h3>
                        {getStatusBadge(projeto.status_avaliacao)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {projeto.descricao}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span><strong>Modalidade:</strong> {projeto.modalidade}</span>
                        <span><strong>Proponente:</strong> {projeto.proponente.nome}</span>
                        <span><strong>Atribuído em:</strong> {new Date(projeto.data_recebimento).toLocaleDateString('pt-BR')}</span>
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

