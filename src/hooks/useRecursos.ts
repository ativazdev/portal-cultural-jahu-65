import { useState, useEffect } from 'react';
import { recursosService, Recurso, CreateRecursoData, UpdateRecursoData } from '@/services/recursosService';
import { useToast } from '@/hooks/use-toast';
import { getAuthenticatedSupabaseClient } from '@/integrations/supabase/client';


export const useRecursos = (proponenteId?: string, projetoId?: string, prefeituraId?: string) => {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecursos = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Recurso[] = [];
      
      if (proponenteId) {
        data = await recursosService.getByProponente(proponenteId);
      } else if (projetoId) {
        data = await recursosService.getByProjeto(projetoId);
      } else if (prefeituraId) {
        data = await recursosService.getByPrefeitura(prefeituraId);
      }

      setRecursos(data);
    } catch (err: any) {
      console.error('Erro ao buscar recursos:', err);
      setError(err.message || 'Erro ao buscar recursos');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os recursos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proponenteId || projetoId || prefeituraId) {
      fetchRecursos();
    } else {
      setLoading(false);
    }
  }, [proponenteId, projetoId, prefeituraId]);

  const createRecurso = async (recursoData: CreateRecursoData): Promise<boolean> => {
    try {
      setLoading(true);
      const client = getAuthenticatedSupabaseClient('proponente');
      await recursosService.create(recursoData, client);
      
      toast({
        title: 'Recurso criado',
        description: 'Seu recurso foi enviado com sucesso.',
      });
      
      await fetchRecursos();
      return true;
    } catch (err: any) {
      console.error('Erro ao criar recurso:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível criar o recurso.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRecurso = async (id: string, updateData: UpdateRecursoData): Promise<boolean> => {
    try {
      setLoading(true);
      const client = getAuthenticatedSupabaseClient('proponente');
      await recursosService.update(id, updateData, client);
      
      toast({
        title: 'Recurso atualizado',
        description: 'O recurso foi atualizado com sucesso.',
      });
      
      await fetchRecursos();
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar recurso:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível atualizar o recurso.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecurso = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const client = getAuthenticatedSupabaseClient('proponente');
      const success = await recursosService.delete(id, client);
      
      if (success) {
        toast({
          title: 'Recurso removido',
          description: 'O recurso foi removido com sucesso.',
        });
        await fetchRecursos();
      }
      
      return success;
    } catch (err: any) {
      console.error('Erro ao deletar recurso:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível remover o recurso.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    recursos,
    loading,
    error,
    refresh: fetchRecursos,
    createRecurso,
    updateRecurso,
    deleteRecurso,
  };
};

