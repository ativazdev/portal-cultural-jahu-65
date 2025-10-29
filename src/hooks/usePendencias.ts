import { useState, useEffect } from 'react';
import { pendenciaService, Pendencia, CreatePendenciaData, UpdatePendenciaData } from '@/services/pendenciaService';

export const usePendencias = (projetoId: string) => {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPendencias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pendenciaService.getByProjeto(projetoId);
      setPendencias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pendências');
    } finally {
      setLoading(false);
    }
  };

  const createPendencia = async (data: CreatePendenciaData): Promise<boolean> => {
    try {
      const result = await pendenciaService.create(data);
      if (result) {
        await loadPendencias(); // Recarregar a lista
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pendência');
      return false;
    }
  };

  const updatePendencia = async (id: number, data: UpdatePendenciaData): Promise<boolean> => {
    try {
      const result = await pendenciaService.update(id, data);
      if (result) {
        await loadPendencias(); // Recarregar a lista
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pendência');
      return false;
    }
  };

  const deletePendencia = async (id: number): Promise<boolean> => {
    try {
      const success = await pendenciaService.delete(id);
      if (success) {
        await loadPendencias(); // Recarregar a lista
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar pendência');
      return false;
    }
  };

  useEffect(() => {
    if (projetoId) {
      loadPendencias();
    }
  }, [projetoId]);

  return {
    pendencias,
    loading,
    error,
    createPendencia,
    updatePendencia,
    deletePendencia,
    refresh: loadPendencias
  };
};
