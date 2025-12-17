import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { gerarPDFsRankingZIP } from "@/utils/pdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import { Download, ArrowLeft, ChevronRight, ChevronLeft, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjetoRanking {
  id: string;
  nome: string;
  modalidade: string;
  tipo_concorrencia: string;
  nota_final: number | null;
  ranking: number;
  status: string;
  proponente: { nome: string };
  avaliacao_final: any;
}

export const PrefeituraExportarRanking = () => {
  const { nomePrefeitura, editalId } = useParams<{ nomePrefeitura: string; editalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projetosHabilitados, setProjetosHabilitados] = useState<ProjetoRanking[]>([]);
  const [projetosSelecionados, setProjetosSelecionados] = useState<string[]>([]);
  const [loadingProjetosHabilitados, setLoadingProjetosHabilitados] = useState(false);
  const [editalInfo, setEditalInfo] = useState<{ nome: string; codigo: string } | null>(null);
  const [rankingExpanded, setRankingExpanded] = useState(true);

  const getCategoriaLabel = (m: string) => {
    const labels: Record<string, string> = {
      'musica': 'Música',
      'teatro': 'Teatro',
      'danca': 'Dança',
      'artes_visuais': 'Artes Visuais',
      'literatura': 'Literatura',
      'cinema': 'Cinema',
      'cultura_popular': 'Cultura Popular',
      'circo': 'Circo',
      'outros': 'Outros'
    };
    return labels[m] || m;
  };

  const carregarProjetosHabilitados = async () => {
    if (!editalId) return;
    
    try {
      setLoadingProjetosHabilitados(true);
      
      // Buscar informações do edital
      const { data: editalData, error: editalError } = await supabase
        .from('editais')
        .select('nome, codigo')
        .eq('id', editalId)
        .single();

      if (editalError) throw editalError;
      if (editalData) {
        setEditalInfo({ 
          nome: (editalData as any).nome || '', 
          codigo: (editalData as any).codigo || '' 
        });
      }
      
      // Buscar projetos avaliados, habilitados, não habilitados, aprovados e rejeitados do edital
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          id,
          nome,
          modalidade,
          tipo_concorrencia,
          status,
          proponente:proponente_id (
            nome
          )
        `)
        .eq('edital_id', editalId)
        .in('status', ['avaliado', 'habilitado', 'nao_habilitado', 'aprovado', 'rejeitado'])
        .order('created_at', { ascending: false });

      if (projetosError) throw projetosError;

      // Buscar avaliações finais para cada projeto
      const projetosComAvaliacoes = await Promise.all(
        (projetosData || []).map(async (projeto) => {
          const { data: avaliacaoFinal } = await supabase
            .from('avaliacoes_final')
            .select('*')
            .eq('projeto_id', projeto.id)
            .single();

          return {
            ...projeto,
            nota_final: avaliacaoFinal ? (avaliacaoFinal as any).nota_final || null : null,
            avaliacao_final: avaliacaoFinal || null,
            ranking: 0 // Será calculado depois
          };
        })
      );

      // Calcular ranking por modalidade e tipo de concorrência
      const projetosComRanking = projetosComAvaliacoes.map(projeto => {
        const projetosMesmaCategoriaECategoria = projetosComAvaliacoes.filter(
          p => p.modalidade === projeto.modalidade && 
               p.tipo_concorrencia === projeto.tipo_concorrencia
        );
        
        // Ordenar por nota final (maior para menor)
        const ordenados = [...projetosMesmaCategoriaECategoria].sort((a, b) => {
          const notaA = a.nota_final || 0;
          const notaB = b.nota_final || 0;
          return notaB - notaA;
        });
        
        const ranking = ordenados.findIndex(p => p.id === projeto.id) + 1;
        
        return {
          ...projeto,
          ranking
        };
      });

      setProjetosHabilitados(projetosComRanking);
      
      // Selecionar automaticamente os projetos já habilitados e aprovados (aprovados são automaticamente habilitados)
      const habilitadosIds = projetosComRanking
        .filter(p => p.status === 'habilitado' || p.status === 'aprovado')
        .map(p => p.id);
      setProjetosSelecionados(habilitadosIds);
    } catch (error) {
      console.error('Erro ao carregar projetos avaliados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos avaliados.",
        variant: "destructive",
      });
    } finally {
      setLoadingProjetosHabilitados(false);
    }
  };

  useEffect(() => {
    carregarProjetosHabilitados();
  }, [editalId]);

  // Agrupar projetos habilitados por modalidade e tipo de concorrência para o ranking
  const projetosHabilitadosAgrupados = () => {
    const habilitados = projetosHabilitados.filter(p => 
      projetosSelecionados.includes(p.id)
    );
    
    const modalidades = Array.from(new Set(habilitados.map(p => p.modalidade)));
    
    return modalidades.map(modalidade => {
      const projetosCategoria = habilitados.filter(p => p.modalidade === modalidade);
      const amplaConcorrencia = projetosCategoria
        .filter(p => p.tipo_concorrencia === 'ampla_concorrencia')
        .sort((a, b) => (b.nota_final || 0) - (a.nota_final || 0));
      const cotistas = projetosCategoria
        .filter(p => p.tipo_concorrencia === 'cotistas')
        .sort((a, b) => (b.nota_final || 0) - (a.nota_final || 0));

      return {
        modalidade,
        amplaConcorrencia,
        cotistas
      };
    });
  };

  const handleGerarPDFs = async () => {
    try {
      // Obter todos os IDs dos projetos avaliados
      const todosProjetosIds = projetosHabilitados.map(p => p.id);
      
      // Projetos selecionados = habilitados
      const projetosSelecionadosIds = projetosSelecionados;
      
      // Projetos não selecionados = não habilitados
      const projetosNaoSelecionadosIds = todosProjetosIds.filter(id => !projetosSelecionadosIds.includes(id));

      // Filtrar projetos que podem ser atualizados (excluir aprovados e rejeitados)
      const projetosParaAtualizarHabilitado = projetosSelecionadosIds.filter(id => {
        const projeto = projetosHabilitados.find(p => p.id === id);
        return projeto && projeto.status !== 'aprovado' && projeto.status !== 'rejeitado';
      });

      const projetosParaAtualizarNaoHabilitado = projetosNaoSelecionadosIds.filter(id => {
        const projeto = projetosHabilitados.find(p => p.id === id);
        return projeto && projeto.status !== 'aprovado' && projeto.status !== 'rejeitado';
      });

      // Atualizar status dos projetos selecionados para 'habilitado' (exceto aprovados e rejeitados)
      for (const projetoId of projetosParaAtualizarHabilitado) {
        const { error } = await (supabase
          .from('projetos') as any)
          .update({ status: 'habilitado' })
          .eq('id', projetoId);
        if (error) throw error;
      }

      // Atualizar status dos projetos não selecionados para 'nao_habilitado' (exceto aprovados e rejeitados)
      for (const projetoId of projetosParaAtualizarNaoHabilitado) {
        const { error } = await (supabase
          .from('projetos') as any)
          .update({ status: 'nao_habilitado' })
          .eq('id', projetoId);
        if (error) throw error;
      }

      // DEPOIS: Filtrar projetos para exportar (apenas os selecionados/habilitados)
      const projetosParaExportar = projetosHabilitados.filter(p => 
        projetosSelecionadosIds.includes(p.id)
      );

      // Separar por tipo de concorrência
      const amplaConcorrencia = projetosParaExportar.filter(p => p.tipo_concorrencia === 'ampla_concorrencia');
      const cotistas = projetosParaExportar.filter(p => p.tipo_concorrencia === 'cotistas');

      // Gerar ZIP com os PDFs
      await gerarPDFsRankingZIP({
        amplaConcorrencia: amplaConcorrencia.length > 0 ? amplaConcorrencia : undefined,
        cotistas: cotistas.length > 0 ? cotistas : undefined,
        editalNome: editalInfo?.nome || 'Edital',
        editalCodigo: editalInfo?.codigo || ''
      });

      const totalPDFs = (amplaConcorrencia.length > 0 ? 1 : 0) + (cotistas.length > 0 ? 1 : 0);
      const totalAtualizados = projetosParaAtualizarHabilitado.length + projetosParaAtualizarNaoHabilitado.length;
      const totalAprovadosRejeitados = todosProjetosIds.length - totalAtualizados;
      
      toast({
        title: "Sucesso",
        description: `ZIP com ${totalPDFs} PDF(s) gerado com sucesso! ${projetosParaAtualizarHabilitado.length} projeto(s) habilitado(s), ${projetosParaAtualizarNaoHabilitado.length} não habilitado(s). ${totalAprovadosRejeitados > 0 ? `${totalAprovadosRejeitados} projeto(s) aprovado(s)/rejeitado(s) não foram alterados.` : ''}`,
      });

      // Recarregar projetos para atualizar a lista
      await carregarProjetosHabilitados();
    } catch (error) {
      console.error('Erro ao gerar PDFs e atualizar habilitação:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDFs e atualizar habilitação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <PrefeituraLayout
      title="Exportar Ranking de Projetos"
      description="Selecione os projetos que serão habilitados e visualize o ranking"
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/${nomePrefeitura}/editais/${editalId}/projetos`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleGerarPDFs}
            disabled={loadingProjetosHabilitados || projetosSelecionados.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Gerar PDFs
          </Button>
        </div>
      }
    >
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Painel Esquerdo - Lista de Projetos */}
        <div className={`flex-1 transition-all duration-300 ${rankingExpanded ? 'mr-4' : ''}`}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Projetos Avaliados</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {loadingProjetosHabilitados ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-500">Carregando projetos avaliados...</p>
                </div>
              ) : projetosHabilitados.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum projeto avaliado encontrado.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    const modalidades = Array.from(new Set(projetosHabilitados.map(p => p.modalidade)));

                    return modalidades.map(modalidade => {
                      const projetosCategoria = projetosHabilitados.filter(p => p.modalidade === modalidade);
                      const amplaConcorrencia = projetosCategoria.filter(p => p.tipo_concorrencia === 'ampla_concorrencia');
                      const cotistas = projetosCategoria.filter(p => p.tipo_concorrencia === 'cotistas');

                      return (
                        <div key={modalidade} className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                            {getCategoriaLabel(modalidade)}
                          </h3>
                          
                          {/* Ampla Concorrência */}
                          {amplaConcorrencia.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-700">Ampla Concorrência</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {amplaConcorrencia
                                  .sort((a, b) => (b.nota_final || 0) - (a.nota_final || 0))
                                  .map((projeto) => {
                                    const estaSelecionado = projetosSelecionados.includes(projeto.id);
                                    return (
                                      <div
                                        key={projeto.id}
                                        className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                                          estaSelecionado
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                          if (estaSelecionado) {
                                            setProjetosSelecionados(projetosSelecionados.filter(id => id !== projeto.id));
                                          } else {
                                            setProjetosSelecionados([...projetosSelecionados, projeto.id]);
                                          }
                                        }}
                                      >
                                        <div className="flex items-start gap-3">
                                          <Checkbox
                                            checked={estaSelecionado}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                setProjetosSelecionados([...projetosSelecionados, projeto.id]);
                                              } else {
                                                setProjetosSelecionados(projetosSelecionados.filter(id => id !== projeto.id));
                                              }
                                            }}
                                            className="mt-1"
                                          />
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-gray-900">{projeto.nome}</span>
                                              <Badge variant="outline" className="text-xs">
                                                #{projeto.ranking}º
                                              </Badge>
                                              {projeto.nota_final !== null && (
                                                <Badge className="bg-green-100 text-green-800 text-xs">
                                                  {projeto.nota_final.toFixed(1)} pts
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-600">{projeto.proponente?.nome || 'Proponente não informado'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Badge 
                                                className={`text-xs ${
                                                  projeto.status === 'habilitado' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : projeto.status === 'nao_habilitado'
                                                    ? 'bg-red-100 text-red-800'
                                                    : projeto.status === 'avaliado'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                              >
                                                {projeto.status === 'habilitado' ? 'Habilitado' : 
                                                 projeto.status === 'nao_habilitado' ? 'Não Habilitado' : 
                                                 projeto.status === 'avaliado' ? 'Avaliado' :
                                                 projeto.status}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* Cotistas */}
                          {cotistas.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-700">Cotistas</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {cotistas
                                  .sort((a, b) => (b.nota_final || 0) - (a.nota_final || 0))
                                  .map((projeto) => {
                                    const estaSelecionado = projetosSelecionados.includes(projeto.id);
                                    const isAprovado = projeto.status === 'aprovado';
                                    const isRejeitado = projeto.status === 'rejeitado';
                                    const podeAlterar = !isAprovado && !isRejeitado;
                                    
                                    return (
                                      <div
                                        key={projeto.id}
                                        className={`p-3 border rounded-lg transition-colors ${
                                          podeAlterar ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                                        } ${
                                          estaSelecionado
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                          if (!podeAlterar) return;
                                          if (estaSelecionado) {
                                            setProjetosSelecionados(projetosSelecionados.filter(id => id !== projeto.id));
                                          } else {
                                            setProjetosSelecionados([...projetosSelecionados, projeto.id]);
                                          }
                                        }}
                                      >
                                        <div className="flex items-start gap-3">
                                          <Checkbox
                                            checked={estaSelecionado}
                                            disabled={!podeAlterar}
                                            onCheckedChange={(checked) => {
                                              if (!podeAlterar) return;
                                              if (checked) {
                                                setProjetosSelecionados([...projetosSelecionados, projeto.id]);
                                              } else {
                                                setProjetosSelecionados(projetosSelecionados.filter(id => id !== projeto.id));
                                              }
                                            }}
                                            className="mt-1"
                                          />
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-gray-900">{projeto.nome}</span>
                                              <Badge variant="outline" className="text-xs">
                                                #{projeto.ranking}º
                                              </Badge>
                                              {projeto.nota_final !== null && (
                                                <Badge className="bg-green-100 text-green-800 text-xs">
                                                  {projeto.nota_final.toFixed(1)} pts
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-600">{projeto.proponente?.nome || 'Proponente não informado'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Badge 
                                                className={`text-xs ${
                                                  projeto.status === 'aprovado' 
                                                    ? 'bg-green-200 text-green-900 border-green-300' 
                                                    : projeto.status === 'rejeitado'
                                                    ? 'bg-red-200 text-red-900 border-red-300'
                                                    : projeto.status === 'habilitado' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : projeto.status === 'nao_habilitado'
                                                    ? 'bg-red-100 text-red-800'
                                                    : projeto.status === 'avaliado'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                              >
                                                {projeto.status === 'aprovado' ? 'Aprovado (Habilitado)' : 
                                                 projeto.status === 'rejeitado' ? 'Rejeitado' :
                                                 projeto.status === 'habilitado' ? 'Habilitado' : 
                                                 projeto.status === 'nao_habilitado' ? 'Não Habilitado' : 
                                                 projeto.status === 'avaliado' ? 'Avaliado' :
                                                 projeto.status}
                                              </Badge>
                                              {!podeAlterar && (
                                                <span className="text-xs text-gray-500 italic">
                                                  {isAprovado ? '(Não pode ser desabilitado)' : '(Não pode ser habilitado)'}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}

                  {projetosSelecionados.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sticky bottom-0">
                      <p className="text-sm font-medium text-blue-900">
                        {projetosSelecionados.length} projeto(s) selecionado(s)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel Direito - Ranking (Expansível) */}
        <div className={`transition-all duration-300 ${rankingExpanded ? 'w-96' : 'w-12'} flex-shrink-0`}>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              {rankingExpanded && <CardTitle>Ranking Habilitados</CardTitle>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRankingExpanded(!rankingExpanded)}
                className="h-8 w-8 p-0"
              >
                {rankingExpanded ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            {rankingExpanded && (
              <CardContent className="flex-1 overflow-y-auto">
                {projetosHabilitadosAgrupados().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Nenhum projeto habilitado ainda.</p>
                    <p className="text-xs mt-2">Selecione projetos na lista ao lado.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projetosHabilitadosAgrupados().map((grupo) => (
                      <div key={grupo.modalidade} className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
                          {getCategoriaLabel(grupo.modalidade)}
                        </h3>
                        
                        {/* Ampla Concorrência */}
                        {grupo.amplaConcorrencia.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-600">Ampla Concorrência</h4>
                            <div className="space-y-1">
                              {grupo.amplaConcorrencia.map((projeto, index) => {
                                // Recalcular ranking apenas entre os selecionados
                                const rankingNoGrupo = index + 1;
                                return (
                                  <div
                                    key={projeto.id}
                                    className="p-2 bg-gray-50 rounded border border-gray-200"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        #{rankingNoGrupo}º
                                      </Badge>
                                      {projeto.nota_final !== null && (
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                          {projeto.nota_final.toFixed(1)}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {projeto.nome}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {projeto.proponente?.nome || 'N/A'}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Cotistas */}
                        {grupo.cotistas.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-600">Cotistas</h4>
                            <div className="space-y-1">
                              {grupo.cotistas.map((projeto, index) => {
                                // Recalcular ranking apenas entre os selecionados
                                const rankingNoGrupo = index + 1;
                                return (
                                  <div
                                    key={projeto.id}
                                    className="p-2 bg-gray-50 rounded border border-gray-200"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        #{rankingNoGrupo}º
                                      </Badge>
                                      {projeto.nota_final !== null && (
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                          {projeto.nota_final.toFixed(1)}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {projeto.nome}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {projeto.proponente?.nome || 'N/A'}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </PrefeituraLayout>
  );
};

