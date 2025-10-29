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

  // Atribuir parecerista a um projeto
  const atribuirParecerista = async (projetoId: string, pareceristaId: string) => {
    try {
      setLoading(true);

      // Atualizar projeto
      const { error: projetoError } = await supabase
        .from('projetos')
        .update({
          parecerista_id: pareceristaId,
          status: 'em_avaliacao',
          updated_at: new Date().toISOString()
        })
        .eq('id', projetoId);

      if (projetoError) throw projetoError;

      // Atualizar contador de projetos do parecerista
      const { error: pareceristaError } = await supabase
        .from('pareceristas')
        .update({
          projetos_em_analise: supabase.sql`projetos_em_analise + 1`
        })
        .eq('id', pareceristaId);

      if (pareceristaError) throw pareceristaError;

      // Recarregar dados
      await buscarProjetos();
      await buscarPareceristas();

      toast({
        title: 'Parecerista atribuído!',
        description: 'O parecerista foi atribuído ao projeto com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao atribuir parecerista:', err);
      toast({
        title: 'Erro ao atribuir parecerista',
        description: 'Não foi possível atribuir o parecerista ao projeto.',
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
    atribuirParecerista,
    decidirProjeto,
    filtrarProjetos,
    calcularMetricas,
    atualizarStatusProjeto
  };
}
