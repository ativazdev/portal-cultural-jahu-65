import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ArrowLeft, Building2, Calendar } from "lucide-react";
import { usePareceristaAuth } from "@/hooks/usePareceristaAuth";
import { getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditalDisponivel {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  data_abertura: string;
  data_final_envio_projeto: string;
  status: string;
  modalidades: string[];
  total_avaliacoes: number;
  total_pendentes: number;
}

export const PareceristaSelecionarEdital = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { parecerista, prefeitura, logout } = usePareceristaAuth();
  const { toast } = useToast();
  
  const [editais, setEditais] = useState<EditalDisponivel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarEditais = async () => {
      if (!parecerista) return;

      try {
        setLoading(true);
        
        // Buscar avaliações do parecerista com dados do projeto e edital
        const authClient = getAuthenticatedSupabaseClient('parecerista');
        const { data: avaliacoes, error: avaliacoesError } = await authClient
          .from('avaliacoes')
          .select(`
            id,
            status,
            projeto:projetos!inner (
              id,
              edital:editais!inner (
                id,
                codigo,
                nome,
                descricao,
                data_abertura,
                data_final_envio_projeto,
                status,
                modalidades
              )
            )
          `)
          .eq('parecerista_id', parecerista.id);

        if (avaliacoesError) throw avaliacoesError;

        // Extrair editais únicos
        const editaisUnicos = new Map<string, EditalDisponivel>();
        
        avaliacoes?.forEach((avaliacao: any) => {
          const edital = avaliacao.projeto.edital;
          if (!editaisUnicos.has(edital.id)) {
            editaisUnicos.set(edital.id, {
              id: edital.id,
              codigo: edital.codigo,
              nome: edital.nome,
              descricao: edital.descricao,
              data_abertura: edital.data_abertura,
              data_final_envio_projeto: edital.data_final_envio_projeto,
              status: edital.status,
              modalidades: edital.modalidades,
              total_avaliacoes: 0,
              total_pendentes: 0
            });
          }
        });

        // Contar avaliações por edital
        const editaisList = Array.from(editaisUnicos.values());
        
        for (const edital of editaisList) {
          // Buscar avaliações deste parecerista para projetos deste edital
          const { data: projetosEdital } = await authClient
            .from('projetos')
            .select('id')
            .eq('edital_id', edital.id);

          const projetoIds = (projetosEdital as any[])?.map((p: any) => p.id) || [];
          
          if (projetoIds.length > 0) {
            const { data: avals } = await authClient
              .from('avaliacoes')
              .select('status')
              .eq('parecerista_id', parecerista.id)
              .in('projeto_id', projetoIds);

            if (avals) {
              const avalsData = avals as any[];
              edital.total_avaliacoes = avalsData.length;
              edital.total_pendentes = avalsData.filter((a: any) => a.status === 'pendente' || a.status === 'aguardando_parecerista').length;
            }
          }
        }

        setEditais(editaisList);
      } catch (error: any) {
        console.error('Erro ao carregar editais:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar editais disponíveis",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarEditais();
  }, [parecerista, toast]);

  const handleSelecionarEdital = (editalId: string) => {
    // Salvar edital selecionado no localStorage
    localStorage.setItem('edital_selecionado', editalId);
    navigate(`/${nomePrefeitura}/parecerista/${editalId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="mt-4 text-gray-600">Carregando editais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2 uppercase tracking-wider">
              <Building2 className="h-3 w-3" />
              Parecerista • {prefeitura?.nome || 'Portal Cultural'}
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Selecionar Edital
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl">
              Bem-vindo, <span className="text-slate-900 font-semibold">{parecerista?.nome}</span>. 
              Selecione abaixo o edital que deseja gerenciar hoje.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={logout}
              className="group flex items-center gap-2 border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl"
            >
              Sair da conta
            </Button>
          </div>
        </div>

        {/* Info Bar */}
        {prefeitura && (
          <div className="mb-8 p-4 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl flex items-center gap-3 text-slate-600 shadow-sm">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Instituição</p>
              <p className="text-sm font-medium text-slate-700">{prefeitura.nome} • {prefeitura.municipio}, {prefeitura.estado}</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        {editais.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-md border border-slate-200 border-dashed rounded-3xl p-16 text-center max-w-md mx-auto">
            <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Nenhum edital disponível
            </h3>
            <p className="text-slate-500 mb-8">
              Você ainda não possui projetos atribuídos para avaliação neste momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {editais.map((edital) => (
              <div 
                key={edital.id} 
                className="group relative"
                onClick={() => handleSelecionarEdital(edital.id)}
              >
                {/* Decoration Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[2rem] blur opacity-0 group-hover:opacity-15 transition duration-500 group-hover:duration-200"></div>
                
                <Card className="relative bg-white/70 backdrop-blur-xl border-2 border-slate-200/60 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/40 rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer h-full flex flex-col hover:border-blue-100">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                        <FileText className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-transparent font-mono text-[10px] tracking-tighter">
                        {edital.codigo}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors duration-300">
                      {edital.nome}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
                      {edital.descricao}
                    </p>
                    
                    {/* Time & Scope Chips */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-medium">
                        <Calendar className="h-3 w-3 text-blue-500" />
                        Até {new Date(edital.data_final_envio_projeto).toLocaleDateString('pt-BR')}
                      </div>
                      {edital.modalidades.slice(0, 2).map((mod, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-medium">
                          {mod}
                        </div>
                      ))}
                      {edital.modalidades.length > 2 && (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-[11px] font-medium">
                          +{edital.modalidades.length - 2}
                        </div>
                      )}
                    </div>

                    {/* Dashboard Metrics Widgets */}
                    <div className="mt-auto grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl group-hover:bg-white transition-colors duration-300">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl font-black text-slate-900">{edital.total_avaliacoes}</p>
                        <p className="text-[10px] text-slate-500">Projetos</p>
                      </div>
                      <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl group-hover:bg-white transition-colors duration-300">
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Pendentes</p>
                        <p className="text-2xl font-black text-orange-600">{edital.total_pendentes}</p>
                        <p className="text-[10px] text-orange-500">A avaliar</p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold group-hover:bg-blue-600 transition-all duration-300">
                        Acessar Dashboard
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

