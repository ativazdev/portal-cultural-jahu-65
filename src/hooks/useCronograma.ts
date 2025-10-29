import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AtividadeCronograma {
  id?: string;
  projeto_id?: string;
  nome_atividade: string;
  etapa: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  ordem: number;
}

export interface ProjetoData {
  id: string;
  nome: string;
  proponente_nome: string;
  proponente_id: string;
}

export function useCronograma(projetoId?: string) {
  const [atividades, setAtividades] = useState<AtividadeCronograma[]>([]);
  const [projetoData, setProjetoData] = useState<ProjetoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar dados do projeto
  const buscarProjetoData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: projetoError } = await supabase
        .from('projetos')
        .select(`
          id,
          nome,
          proponente_id,
          proponentes (
            nome
          )
        `)
        .eq('id', id)
        .single();

      if (projetoError) throw projetoError;

      if (data) {
        setProjetoData({
          id: data.id,
          nome: data.nome,
          proponente_nome: data.proponentes?.nome || 'Proponente',
          proponente_id: data.proponente_id
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados do projeto:', err);
      setError(err.message || 'Erro ao carregar dados do projeto');
    } finally {
      setLoading(false);
    }
  };

  // Buscar atividades do cronograma
  const buscarAtividades = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: atividadesError } = await supabase
        .from('atividades_projeto')
        .select('*')
        .eq('projeto_id', id)
        .order('ordem', { ascending: true });

      if (atividadesError) throw atividadesError;

      setAtividades(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar atividades:', err);
      setError(err.message || 'Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  // Salvar atividades do cronograma
  const salvarAtividades = async (novasAtividades: AtividadeCronograma[]) => {
    if (!projetoId) {
      setError('ID do projeto não fornecido');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Primeiro, remover atividades existentes
      const { error: deleteError } = await supabase
        .from('atividades_projeto')
        .delete()
        .eq('projeto_id', projetoId);

      if (deleteError) throw deleteError;

      // Inserir novas atividades
      const atividadesParaInserir = novasAtividades.map((atividade, index) => ({
        projeto_id: projetoId,
        nome_atividade: atividade.nome_atividade,
        etapa: atividade.etapa,
        descricao: atividade.descricao,
        data_inicio: atividade.data_inicio,
        data_fim: atividade.data_fim,
        ordem: index
      }));

      const { error: insertError } = await supabase
        .from('atividades_projeto')
        .insert(atividadesParaInserir);

      if (insertError) throw insertError;

      // Atualizar estado local
      setAtividades(novasAtividades);

      toast({
        title: "Cronograma salvo!",
        description: "As atividades foram salvas com sucesso.",
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao salvar atividades:', err);
      setError(err.message || 'Erro ao salvar atividades');
      
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cronograma. Tente novamente.",
        variant: "destructive"
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando projetoId mudar
  useEffect(() => {
    if (projetoId) {
      buscarProjetoData(projetoId);
      buscarAtividades(projetoId);
    }
  }, [projetoId]);

  return {
    atividades,
    projetoData,
    loading,
    error,
    salvarAtividades,
    buscarAtividades,
    buscarProjetoData
  };
}
