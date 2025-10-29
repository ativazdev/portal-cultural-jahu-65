import { useState, useEffect } from 'react';
import { prestacaoContasService, PrestacaoContas, CreatePrestacaoContasData, UpdatePrestacaoContasData } from '@/services/prestacaoContasService';

export const usePrestacoesContas = (projetoId: string) => {
  const [prestacoes, setPrestacoes] = useState<PrestacaoContas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrestacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prestacaoContasService.getByProjeto(projetoId);
      setPrestacoes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar prestações de contas');
    } finally {
      setLoading(false);
    }
  };

  const createPrestacao = async (data: CreatePrestacaoContasData) => {
    try {
      const result = await prestacaoContasService.create(data);
      if (result) {
        await loadPrestacoes();
        return result;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar prestação de contas');
      return null;
    }
  };

  const updatePrestacao = async (id: string, data: UpdatePrestacaoContasData) => {
    try {
      const result = await prestacaoContasService.update(id, data);
      if (result) {
        await loadPrestacoes();
        return result;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar prestação de contas');
      return null;
    }
  };

  const deletePrestacao = async (id: string) => {
    try {
      const success = await prestacaoContasService.delete(id);
      if (success) {
        await loadPrestacoes();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar prestação de contas');
      return false;
    }
  };

  const refresh = () => {
    loadPrestacoes();
  };

  useEffect(() => {
    if (projetoId) {
      loadPrestacoes();
    }
  }, [projetoId]);

  return {
    prestacoes,
    loading,
    error,
    createPrestacao,
    updatePrestacao,
    deletePrestacao,
    refresh
  };
};
