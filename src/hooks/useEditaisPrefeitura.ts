import { useState, useEffect } from 'react';
import { editalService, Edital, CreateEditalData, UpdateEditalData } from '@/services/editalService';

export const useEditaisPrefeitura = (prefeituraId: string) => {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEditais = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await editalService.getAll(prefeituraId);
      setEditais(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar editais');
    } finally {
      setLoading(false);
    }
  };

  const createEdital = async (data: CreateEditalData, userId: string): Promise<boolean> => {
    try {
      const edital = await editalService.create(data, prefeituraId, userId);
      if (edital) {
        await loadEditais();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar edital');
      return false;
    }
  };

  const updateEdital = async (id: string, data: UpdateEditalData): Promise<boolean> => {
    try {
      const edital = await editalService.update(id, data);
      if (edital) {
        await loadEditais();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar edital');
      return false;
    }
  };

  const deleteEdital = async (id: string): Promise<boolean> => {
    try {
      const success = await editalService.delete(id);
      if (success) {
        await loadEditais();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar edital');
      return false;
    }
  };

  const toggleStatus = async (id: string, status: 'aberto' | 'arquivado'): Promise<boolean> => {
    try {
      const success = await editalService.updateStatus(id, status);
      if (success) {
        await loadEditais();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status do edital');
      return false;
    }
  };

  useEffect(() => {
    if (prefeituraId) {
      loadEditais();
    }
  }, [prefeituraId]);

  return {
    editais,
    loading,
    error,
    createEdital,
    updateEdital,
    deleteEdital,
    toggleStatus,
    refresh: loadEditais
  };
};
