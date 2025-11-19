import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ArrowLeft, Building2 } from "lucide-react";
import { usePareceristaAuth } from "@/hooks/usePareceristaAuth";
import { supabase } from "@/integrations/supabase/client";
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
        const { data: avaliacoes, error: avaliacoesError } = await supabase
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
          const { data: projetosEdital } = await supabase
            .from('projetos')
            .select('id')
            .eq('edital_id', edital.id);

          const projetoIds = projetosEdital?.map(p => p.id) || [];
          
          if (projetoIds.length > 0) {
            const { data: avals } = await supabase
              .from('avaliacoes')
              .select('status')
              .eq('parecerista_id', parecerista.id)
              .in('projeto_id', projetoIds);

            if (avals) {
              edital.total_avaliacoes = avals.length;
              edital.total_pendentes = avals.filter(a => a.status === 'pendente' || a.status === 'aguardando_parecerista').length;
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Selecionar Edital</h1>
              <p className="text-gray-600 mt-1">
                Escolha o edital que deseja avaliar
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-red-600 hover:text-red-700"
            >
              Sair
            </Button>
          </div>
          
          {prefeitura && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span>{prefeitura.nome} - {prefeitura.municipio}/{prefeitura.estado}</span>
            </div>
          )}
        </div>

        {/* Lista de Editais */}
        {editais.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum edital disponível
            </h3>
            <p className="text-gray-600">
              Você ainda não foi atribuído a nenhuma avaliação.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {editais.map((edital) => (
              <Card
                key={edital.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelecionarEdital(edital.id)}
              >
                <CardHeader>
                  <div>
                    <CardTitle className="text-lg">{edital.nome}</CardTitle>
                    <CardDescription className="mt-1">
                      {edital.codigo}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {edital.descricao}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <strong>Abertura:</strong> {new Date(edital.data_abertura).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <strong>Prazo final:</strong> {new Date(edital.data_final_envio_projeto).toLocaleDateString('pt-BR')}
                    </div>
                    {edital.modalidades.length > 0 && (
                      <div>
                        <strong>Modalidades:</strong> {edital.modalidades.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500">Avaliações</div>
                      <div className="text-lg font-semibold">{edital.total_avaliacoes}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pendentes</div>
                      <div className="text-lg font-semibold text-orange-600">{edital.total_pendentes}</div>
                    </div>
                  </div>

                  <Button className="w-full mt-4" variant="outline">
                    Acessar Edital
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

