import { useState, useEffect } from 'react';
import { avaliacaoService, Avaliacao, CreateAvaliacaoData, UpdateAvaliacaoData } from '@/services/avaliacaoService';

export const useAvaliacoes = (projetoId: string, prefeituraId: string) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [pareceristas, setPareceristas] = useState<Array<{
    id: string;
    nome: string;
    especialidades: string[];
    experiencia_anos: number;
    area_atuacao: string | null;
    formacao_academica: string | null;
    mini_curriculo: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvaliacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await avaliacaoService.getByProjeto(projetoId);
      setAvaliacoes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const loadPareceristas = async () => {
    try {
      const data = await avaliacaoService.getPareceristasDisponiveis(prefeituraId);
      setPareceristas(data);
    } catch (err) {
      console.error('Erro ao carregar pareceristas:', err);
    }
  };

  const createAvaliacao = async (data: CreateAvaliacaoData): Promise<boolean> => {
    try {
      const result = await avaliacaoService.create(data);
      if (result) {
        await loadAvaliacoes(); // Recarregar a lista
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar avaliação');
      return false;
    }
  };

  const updateAvaliacao = async (id: string, data: UpdateAvaliacaoData): Promise<boolean> => {
    try {
      const result = await avaliacaoService.update(id, data);
      if (result) {
        await loadAvaliacoes(); // Recarregar a lista
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar avaliação');
      return false;
    }
  };

  const deleteAvaliacao = async (id: string): Promise<boolean> => {
    try {
      const success = await avaliacaoService.delete(id);
      if (success) {
        await loadAvaliacoes(); // Recarregar a lista
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar avaliação');
      return false;
    }
  };

  useEffect(() => {
    if (projetoId && prefeituraId) {
      loadAvaliacoes();
      loadPareceristas();
    }
  }, [projetoId, prefeituraId]);

  return {
    avaliacoes,
    pareceristas,
    loading,
    error,
    createAvaliacao,
    updateAvaliacao,
    deleteAvaliacao,
    refresh: loadAvaliacoes
  };
};