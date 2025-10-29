import { useState, useEffect } from 'react';
import { duvidaService, Duvida, CreateDuvidaData, UpdateDuvidaData } from '@/services/duvidaService';

export const useDuvidas = (prefeituraId: string) => {
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDuvidas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await duvidaService.getAll(prefeituraId);
      setDuvidas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dúvidas');
    } finally {
      setLoading(false);
    }
  };

  const createDuvida = async (data: CreateDuvidaData): Promise<boolean> => {
    try {
      const duvida = await duvidaService.create(data);
      if (duvida) {
        await loadDuvidas();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar dúvida');
      return false;
    }
  };

  const updateDuvida = async (id: number, data: UpdateDuvidaData): Promise<boolean> => {
    try {
      const duvida = await duvidaService.update(id, data);
      if (duvida) {
        await loadDuvidas();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dúvida');
      return false;
    }
  };

  const deleteDuvida = async (id: number): Promise<boolean> => {
    try {
      const success = await duvidaService.delete(id);
      if (success) {
        await loadDuvidas();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar dúvida');
      return false;
    }
  };

  const responderDuvida = async (id: number, resposta: string, respondidaPor: string): Promise<boolean> => {
    try {
      const duvida = await duvidaService.responder(id, resposta, respondidaPor);
      if (duvida) {
        await loadDuvidas();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao responder dúvida');
      return false;
    }
  };

  useEffect(() => {
    if (prefeituraId) {
      loadDuvidas();
    }
  }, [prefeituraId]);

  return {
    duvidas,
    loading,
    error,
    createDuvida,
    updateDuvida,
    deleteDuvida,
    responderDuvida,
    refresh: loadDuvidas
  };
};
