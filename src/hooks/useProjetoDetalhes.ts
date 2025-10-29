import { useState, useEffect } from 'react';
import { projetoService, ProjetoWithDetails } from '@/services/projetoService';

export const useProjetoDetalhes = (projetoId: string) => {
  const [projeto, setProjeto] = useState<ProjetoWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjeto = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projetoService.getById(projetoId);
      setProjeto(data);
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
