import { useState, useEffect } from 'react';
import { movimentacaoFinanceiraService, MovimentacaoFinanceira, CreateMovimentacaoFinanceiraData, UpdateMovimentacaoFinanceiraData } from '@/services/movimentacaoFinanceiraService';

export const useMovimentacoesFinanceiras = (projetoId: string, contaId?: string) => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovimentacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movimentacaoFinanceiraService.getByProjeto(projetoId, contaId);
      setMovimentacoes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar movimentações financeiras');
    } finally {
      setLoading(false);
    }
  };

  const createMovimentacao = async (data: CreateMovimentacaoFinanceiraData) => {
    try {
      const result = await movimentacaoFinanceiraService.create(data);
      if (result) {
        await loadMovimentacoes();
        return result;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar movimentação financeira');
      return null;
    }
  };

  const updateMovimentacao = async (id: string, data: UpdateMovimentacaoFinanceiraData) => {
    try {
      const result = await movimentacaoFinanceiraService.update(id, data);
      if (result) {
        await loadMovimentacoes();
        return result;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar movimentação financeira');
      return null;
    }
  };

  const deleteMovimentacao = async (id: string) => {
    try {
      const success = await movimentacaoFinanceiraService.delete(id);
      if (success) {
        await loadMovimentacoes();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar movimentação financeira');
      return false;
    }
  };

  const refresh = () => {
    loadMovimentacoes();
  };

  useEffect(() => {
    if (projetoId) {
      loadMovimentacoes();
    }
  }, [projetoId, contaId]);

  return {
    movimentacoes,
    loading,
    error,
    createMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
    refresh
  };
};
