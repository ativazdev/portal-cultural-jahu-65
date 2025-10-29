import { useState, useEffect } from 'react';
import { contaMonitoradaService, ContaMonitorada, CreateContaMonitoradaData, UpdateContaMonitoradaData } from '@/services/contaMonitoradaService';

export const useContasMonitoradas = (projetoId: string) => {
  const [contas, setContas] = useState<ContaMonitorada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contaMonitoradaService.getByProjeto(projetoId);
      setContas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contas monitoradas');
    } finally {
      setLoading(false);
    }
  };

  const createConta = async (data: CreateContaMonitoradaData) => {
    try {
      const result = await contaMonitoradaService.create(data);
      if (result) {
        await loadContas();
        return result;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta monitorada');
      return null;
    }
  };

  const updateConta = async (id: string, data: UpdateContaMonitoradaData) => {
    try {
      const result = await contaMonitoradaService.update(id, data);
      if (result) {
        await loadContas();
        return result;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar conta monitorada');
      return null;
    }
  };

  const deleteConta = async (id: string) => {
    try {
      const success = await contaMonitoradaService.delete(id);
      if (success) {
        await loadContas();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar conta monitorada');
      return false;
    }
  };

  const refresh = () => {
    loadContas();
  };

  useEffect(() => {
    if (projetoId) {
      loadContas();
    }
  }, [projetoId]);

  return {
    contas,
    loading,
    error,
    createConta,
    updateConta,
    deleteConta,
    refresh
  };
};
