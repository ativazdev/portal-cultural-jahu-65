import { useState, useEffect } from 'react';
import { projetoService, ProjetoWithDetails } from '@/services/projetoService';
import { getAuthenticatedSupabaseClient } from '@/integrations/supabase/client';

export const useProjetoDetalhes = (projetoId: string, userType?: 'parecerista' | 'proponente') => {
  const [projeto, setProjeto] = useState<ProjetoWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjeto = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Se userType for fornecido, usar cliente autenticado
      if (userType) {
        const authClient = getAuthenticatedSupabaseClient(userType);
        const { data, error: fetchError } = await authClient
          .from('projetos')
          .select(`
            *,
            edital:edital_id (nome, codigo, valor_maximo, has_accountability_phase, anexos, regulamento),
            proponente:proponente_id (*),
            equipe:equipe_projeto (*),
            atividades:atividades_projeto (*),
            orcamento:itens_orcamento_projeto (*),
            metas:metas_projeto (*)
          `)
          .eq('id', projetoId)
          .single();

        if (fetchError) throw fetchError;
        setProjeto(data as ProjetoWithDetails);
      } else {
        // Fallback para o serviço padrão (prefeitura)
        const data = await projetoService.getById(projetoId);
        setProjeto(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projeto');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: ProjetoWithDetails['status']): Promise<boolean> => {
    try {
      const success = await projetoService.updateStatus(projetoId, status);
      if (success) {
        await loadProjeto();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status do projeto');
      return false;
    }
  };

  useEffect(() => {
    if (projetoId) {
      loadProjeto();
    }
  }, [projetoId]);

  return {
    projeto,
    loading,
    error,
    updateStatus,
    refresh: loadProjeto
  };
};
