import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, ArrowLeft } from "lucide-react";
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
  pendencias_contagem: number;
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
        const authClient = getAuthenticatedSupabaseClient('parecerista');
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
        const projetoIds = avaliacoesData?.map((a: any) => a.projeto.id) || [];

        // Buscar contagem de pendências (diligências) respondidas para estes projetos
        let pendenciasCounts: Record<string, number> = {};
        if (projetoIds.length > 0) {
          const { data: pendencias, error: pendenciasError } = await authClient
            .from('projeto_solicitacoes_documentos')
            .select('projeto_id')
            .in('projeto_id', projetoIds)
            .eq('status', 'respondido');
          
          if (!pendenciasError && pendencias) {
            pendencias.forEach((p: any) => {
              pendenciasCounts[p.projeto_id] = (pendenciasCounts[p.projeto_id] || 0) + 1;
            });
          }
        }

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
          data_recebimento: a.data_atribuicao || a.projeto.data_submissao,
          pendencias_contagem: pendenciasCounts[a.projeto.id] || 0
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
      title="Projetos Atribuídos"
      description="Gerencie e avalie os projetos vinculados a você neste edital"
      editalId={editalId}
    >
      <div className="space-y-8 pb-12">
        {/* Modern Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-end bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="flex-1 space-y-1.5 min-w-[300px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pesquisar</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Nome do projeto, proponente ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="w-full md:w-64 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filtrar Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-12 bg-white border-slate-200 rounded-2xl shadow-sm">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="aguardando_parecerista">Aguardando Início</SelectItem>
                <SelectItem value="pendente">Pendente de Ajuste</SelectItem>
                <SelectItem value="em_avaliacao">Em Avaliação Ativa</SelectItem>
                <SelectItem value="avaliado">Avaliação Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
            }}
            className="h-12 px-6 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all font-medium"
          >
            Limpar
          </Button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="font-medium">Sincronizando projetos...</p>
            </div>
          ) : filteredProjetos.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-md border border-slate-200 border-dashed rounded-[32px] p-24 text-center">
              <div className="bg-slate-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Nenhum projeto encontrado
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">
                Tente ajustar sua busca ou filtros para encontrar o que procura.
              </p>
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
                className="rounded-2xl border-slate-200"
              >
                Resetar Filtros
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Lista de Avaliações ({filteredProjetos.length})
                </h2>
              </div>
              
              {filteredProjetos.map((projeto) => (
                <Card
                  key={projeto.id}
                  className="group relative overflow-hidden bg-white hover:bg-slate-50 border-slate-200/60 rounded-[32px] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 cursor-pointer border-2 hover:border-blue-100"
                  onClick={() => navigate(`/${nomePrefeitura}/parecerista/${editalId}/projetos/${projeto.id}`)}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      {/* Status & Alerts Column */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(projeto.status_avaliacao)}
                          {getProjetoStatusBadge(projeto.status_projeto)}
                        </div>
                        
                        {projeto.pendencias_contagem > 0 && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl text-[11px] font-bold animate-pulse shadow-lg shadow-blue-200">
                            <Eye className="h-3 w-3" />
                            {projeto.pendencias_contagem} {projeto.pendencias_contagem === 1 ? 'PENDÊNCIA RESPONDIDA' : 'PENDÊNCIAS RESPONDIDAS'}
                          </div>
                        )}
                      </div>

                      {/* Main Info Column */}
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {projeto.nome}
                          </h3>
                          <p className="text-sm font-medium text-slate-500">
                            por <span className="text-slate-900">{projeto.proponente.nome}</span>
                          </p>
                        </div>
                        
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 max-w-3xl">
                          {projeto.descricao}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 px-3 py-1.5 rounded-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {projeto.modalidade}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 px-3 py-1.5 rounded-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Recebido em: {new Date(projeto.data_recebimento).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      {/* Action Column */}
                      <div className="flex items-center justify-end lg:pl-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-200">
                          <ArrowLeft className="h-6 w-6 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PareceristaLayout>
  );
};

