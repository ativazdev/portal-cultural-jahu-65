import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePrefeitura } from '@/contexts/PrefeituraContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Projeto = Tables<'projetos'>;
type Proponente = Tables<'proponentes'>;
type Edital = Tables<'editais'>;
type Parecerista = Tables<'pareceristas'>;
type DocumentoHabilitacao = Tables<'documentos_habilitacao'>;
type Avaliacao = Tables<'avaliacoes'>;

export interface ProjetoCompleto extends Projeto {
  proponente: Proponente | null;
  edital: Edital;
  parecerista?: Parecerista;
  documentos_habilitacao?: DocumentoHabilitacao[];
  avaliacao?: Avaliacao;
}

export interface ProjetoFiltros {
  busca: string;
  parecerista: string;
  edital: string;
  status: string;
}

export interface ProjetoMetricas {
  recebidos: number;
  emAvaliacao: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
  emExecucao: number;
}

export function useProjetos() {
  const [projetos, setProjetos] = useState<ProjetoCompleto[]>([]);
  const [pareceristas, setPareceristas] = useState<Parecerista[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { prefeitura } = usePrefeitura();
  const { toast } = useToast();

  // Buscar todos os projetos da prefeitura
  const buscarProjetos = async () => {
    if (!prefeitura?.id) {
      setError('Prefeitura não identificada');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar projetos com relações (sem proponente por enquanto)
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          *,
          edital:editais(*),
          parecerista:pareceristas(*),
          documentos_habilitacao(*),
          avaliacao:avaliacoes(*)
        `)
        .eq('prefeitura_id', prefeitura.id)
        .order('created_at', { ascending: false });

      if (projetosError) throw projetosError;

      // Buscar proponentes separadamente
      const { data: proponentesData, error: proponentesError } = await supabase
        .from('proponentes')
        .select('*')
        .eq('prefeitura_id', prefeitura.id);

      if (proponentesError) throw proponentesError;

      // Fazer o match manual dos proponentes com os projetos
      const projetosCompletos = projetosData?.map(projeto => {
        const proponente = proponentesData?.find(p => p.id === projeto.proponente_id);
        return {
          ...projeto,
          proponente: proponente || null
        };
      }) || [];

      setProjetos(projetosCompletos);
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
      setError('Erro ao carregar projetos');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os projetos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar pareceristas da prefeitura
  const buscarPareceristas = async () => {
    if (!prefeitura?.id) return;

    try {
      const { data: pareceristasData, error: pareceristasError } = await supabase
        .from('pareceristas')
        .select('*')
        .eq('prefeitura_id', prefeitura.id)
        .eq('status', 'ativo')
        .order('nome');

      if (pareceristasError) throw pareceristasError;

      setPareceristas(pareceristasData || []);
    } catch (err) {
      console.error('Erro ao buscar pareceristas:', err);
    }
  };

  // Buscar editais ativos da prefeitura
  const buscarEditais = async () => {
    if (!prefeitura?.id) return;

    try {
      const { data: editaisData, error: editaisError } = await supabase
        .from('editais')
        .select('*')
        .eq('prefeitura_id', prefeitura.id)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (editaisError) throw editaisError;

      setEditais(editaisData || []);
    } catch (err) {
      console.error('Erro ao buscar editais:', err);
    }
  };

  // Atribuir parecerista(s) a um projeto (suporte a múltiplos pareceristas)
  const atribuirParecerista = async (projetoId: string, pareceristaIds: string | string[]) => {
    try {
      setLoading(true);

      // Converter para array se for string único
      const ids = Array.isArray(pareceristaIds) ? pareceristaIds : [pareceristaIds];

      if (!prefeitura?.id) {
        throw new Error('Prefeitura não identificada');
      }

      // Buscar projeto para obter prefeitura_id e status
      const { data: projeto, error: projetoFetchError } = await supabase
        .from('projetos')
        .select('prefeitura_id, parecerista_id, status')
        .eq('id', projetoId)
        .single();

      if (projetoFetchError) throw projetoFetchError;

      // Verificar se já existe uma avaliação final para este projeto
      let avaliacaoFinalId: string | null = null;
      const { data: avaliacaoFinalExistente } = await supabase
        .from('avaliacoes_final')
        .select('id')
        .eq('projeto_id', projetoId)
        .single();

      if (avaliacaoFinalExistente) {
        avaliacaoFinalId = avaliacaoFinalExistente.id;
      } else {
        // Criar avaliação final primeiro
        const { data: novaAvaliacaoFinal, error: avaliacaoFinalError } = await supabase
          .from('avaliacoes_final')
          .insert({
            prefeitura_id: projeto.prefeitura_id || prefeitura.id,
            projeto_id: projetoId,
            quantidade_pareceristas: ids.length,
            status: 'pendente'
          })
          .select('id')
          .single();

        if (avaliacaoFinalError) throw avaliacaoFinalError;
        avaliacaoFinalId = novaAvaliacaoFinal.id;
      }

      // Verificar quais pareceristas já têm avaliações
      const { data: avaliacoesExistentes } = await supabase
        .from('avaliacoes')
        .select('parecerista_id')
        .eq('projeto_id', projetoId);

      const pareceristasJaAtribuidos = avaliacoesExistentes?.map(a => a.parecerista_id) || [];
      const novosPareceristas = ids.filter(id => !pareceristasJaAtribuidos.includes(id));

      // Criar avaliações para os novos pareceristas vinculadas à avaliação final
      if (novosPareceristas.length > 0 && avaliacaoFinalId) {
        const avaliacoesParaCriar = novosPareceristas.map(pareceristaId => ({
          prefeitura_id: projeto.prefeitura_id || prefeitura.id,
          projeto_id: projetoId,
          parecerista_id: pareceristaId,
          avaliacao_final_id: avaliacaoFinalId,
          status: 'pendente',
          data_atribuicao: new Date().toISOString()
        }));

        const { error: avaliacoesError } = await supabase
          .from('avaliacoes')
          .insert(avaliacoesParaCriar);

        if (avaliacoesError) throw avaliacoesError;

        // Atualizar quantidade de pareceristas na avaliação final
        const totalPareceristas = (avaliacoesExistentes?.length || 0) + novosPareceristas.length;
        await supabase
          .from('avaliacoes_final')
          .update({ quantidade_pareceristas: totalPareceristas })
          .eq('id', avaliacaoFinalId);

        // Atualizar contador de projetos dos pareceristas
        for (const id of novosPareceristas) {
          await supabase
            .from('pareceristas')
            .update({
              projetos_em_analise: supabase.sql`projetos_em_analise + 1`
            })
            .eq('id', id);
        }
      }

      // Atualizar status do projeto para aguardando_avaliacao quando pareceristas são atribuídos
      const totalAvaliacoes = (avaliacoesExistentes?.length || 0) + novosPareceristas.length;
      if (totalAvaliacoes > 0 && projeto.status === 'aguardando_parecerista') {
        const { error: projetoError } = await supabase
          .from('projetos')
          .update({
            status: 'aguardando_avaliacao',
            updated_at: new Date().toISOString()
          })
          .eq('id', projetoId);

        if (projetoError) throw projetoError;
      }

      // Recarregar dados
      await buscarProjetos();
      await buscarPareceristas();

      toast({
        title: novosPareceristas.length > 1 ? 'Pareceristas atribuídos!' : 'Parecerista atribuído!',
        description: `${novosPareceristas.length} parecerista(s) foi/foram atribuído(s) ao projeto com sucesso.`,
      });
    } catch (err) {
      console.error('Erro ao atribuir parecerista:', err);
      toast({
        title: 'Erro ao atribuir parecerista',
        description: 'Não foi possível atribuir o(s) parecerista(s) ao projeto.',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remover parecerista de um projeto
  const removerParecerista = async (projetoId: string, pareceristaId: string) => {
    try {
      setLoading(true);

      // Buscar avaliação
      const { data: avaliacao, error: avaliacaoFetchError } = await supabase
        .from('avaliacoes')
        .select('id, status')
        .eq('projeto_id', projetoId)
        .eq('parecerista_id', pareceristaId)
        .single();

      if (avaliacaoFetchError) throw avaliacaoFetchError;

      // Deletar avaliação
      const { error: deleteError } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', avaliacao.id);

      if (deleteError) throw deleteError;

      // Atualizar contador do parecerista apenas se a avaliação não estava concluída
      if (avaliacao.status !== 'avaliado') {
        const { error: pareceristaError } = await supabase
          .from('pareceristas')
          .update({
            projetos_em_analise: supabase.sql`GREATEST(0, projetos_em_analise - 1)`
          })
          .eq('id', pareceristaId);

        if (pareceristaError) throw pareceristaError;
      }

      // Recarregar dados
      await buscarProjetos();
      await buscarPareceristas();

      toast({
        title: 'Parecerista removido!',
        description: 'O parecerista foi removido do projeto com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao remover parecerista:', err);
      toast({
        title: 'Erro ao remover parecerista',
        description: 'Não foi possível remover o parecerista do projeto.',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Aprovar ou rejeitar projeto
  const decidirProjeto = async (projetoId: string, decisao: 'aprovado' | 'rejeitado', justificativa?: string) => {
    try {
      setLoading(true);

      // Buscar projeto atual
      const { data: projetoAtual } = await supabase
        .from('projetos')
        .select('parecerista_id')
        .eq('id', projetoId)
        .single();

      // Atualizar projeto
      const { error: projetoError } = await supabase
        .from('projetos')
        .update({
          status: decisao,
          updated_at: new Date().toISOString()
        })
        .eq('id', projetoId);

      if (projetoError) throw projetoError;

      // Atualizar contador do parecerista se houver
      if (projetoAtual?.parecerista_id) {
        const { error: pareceristaError } = await supabase
          .from('pareceristas')
          .update({
            projetos_em_analise: supabase.sql`projetos_em_analise - 1`,
            total_avaliacoes: supabase.sql`total_avaliacoes + 1`
          })
          .eq('id', projetoAtual.parecerista_id);

        if (pareceristaError) throw pareceristaError;
      }

      // Recarregar dados
      await buscarProjetos();
      await buscarPareceristas();

      const mensagem = decisao === 'aprovado' ? 'aprovado' : 'rejeitado';
      toast({
        title: `Projeto ${mensagem}!`,
        description: `O projeto foi ${mensagem} com sucesso.`,
      });
    } catch (err) {
      console.error('Erro ao decidir projeto:', err);
      toast({
        title: 'Erro ao decidir projeto',
        description: 'Não foi possível processar a decisão.',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Filtrar projetos
  const filtrarProjetos = (filtros: ProjetoFiltros): ProjetoCompleto[] => {
    return projetos.filter(projeto => {
      // Busca em nome do projeto, proponente e categoria
      const matchBusca = !filtros.busca || 
        projeto.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        (projeto.proponente && projeto.proponente.nome.toLowerCase().includes(filtros.busca.toLowerCase())) ||
        (projeto.categoria && projeto.categoria.toLowerCase().includes(filtros.busca.toLowerCase()));

      // Filtro por parecerista
      const matchParecerista = filtros.parecerista === "Todos" ||
        (filtros.parecerista === "Não atribuído" && !projeto.parecerista) ||
        (projeto.parecerista && projeto.parecerista.nome === filtros.parecerista);

      // Filtro por edital
      const matchEdital = filtros.edital === "Todos" ||
        (projeto.edital && projeto.edital.codigo === filtros.edital);

      // Filtro por status
      const matchStatus = filtros.status === "Todos" ||
        projeto.status === filtros.status;

      return matchBusca && matchParecerista && matchEdital && matchStatus;
    });
  };

  // Calcular métricas
  const calcularMetricas = (): ProjetoMetricas => {
    return {
      recebidos: projetos.filter(p => p.status === 'recebido').length,
      emAvaliacao: projetos.filter(p => p.status === 'em_avaliacao').length,
      pendentes: projetos.filter(p => p.status === 'avaliado').length,
      aprovados: projetos.filter(p => p.status === 'aprovado').length,
      rejeitados: projetos.filter(p => p.status === 'rejeitado').length,
      emExecucao: projetos.filter(p => p.status === 'em_execucao').length
    };
  };

  // Atualizar status do projeto
  const atualizarStatusProjeto = async (projetoId: string, novoStatus: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('projetos')
        .update({
          status: novoStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', projetoId);

      if (error) throw error;

      await buscarProjetos();

      toast({
        title: 'Status atualizado!',
        description: 'O status do projeto foi atualizado com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status do projeto.',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (prefeitura?.id) {
      buscarProjetos();
      buscarPareceristas();
      buscarEditais();
    }
  }, [prefeitura?.id]);

  return {
    projetos,
    pareceristas,
    editais,
    loading,
    error,
    buscarProjetos,
    buscarEditais,
    atribuirParecerista,
    removerParecerista,
    decidirProjeto,
    filtrarProjetos,
    calcularMetricas,
    atualizarStatusProjeto
  };
}
