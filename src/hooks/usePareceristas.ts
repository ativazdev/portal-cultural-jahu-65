import { useState, useEffect } from 'react';
import { pareceristaService, Parecerista, CreatePareceristaData } from '@/services/pareceristaService';
import { useToast } from '@/hooks/use-toast';

export const usePareceristas = (prefeituraId: string) => {
  const { toast } = useToast();
  const [pareceristas, setPareceristas] = useState<Parecerista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPareceristas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pareceristaService.getAll(prefeituraId);
      setPareceristas(data);
    } catch (err) {
      setError('Erro ao carregar pareceristas');
      console.error('Erro ao carregar pareceristas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prefeituraId) {
      loadPareceristas();
    }
  }, [prefeituraId]);

  const createParecerista = async (data: CreatePareceristaData) => {
    try {
      const parecerista = await pareceristaService.create(data, prefeituraId);
      if (parecerista) {
        setPareceristas(prev => [parecerista, ...prev]);
        toast({
          title: "Parecerista criado com sucesso!",
          description: "As credenciais foram enviadas por email.",
        });
        return true;
      } else {
        toast({
          title: "Erro ao criar parecerista",
          description: "Tente novamente mais tarde",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Erro ao criar parecerista:', err);
      toast({
        title: "Erro ao criar parecerista",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateParecerista = async (id: string, data: Partial<CreatePareceristaData>) => {
    try {
      const parecerista = await pareceristaService.update(id, data);
      if (parecerista) {
        setPareceristas(prev => 
          prev.map(p => p.id === id ? parecerista : p)
        );
        toast({
          title: "Parecerista atualizado com sucesso!",
        });
        return true;
      } else {
        toast({
          title: "Erro ao atualizar parecerista",
          description: "Tente novamente mais tarde",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Erro ao atualizar parecerista:', err);
      toast({
        title: "Erro ao atualizar parecerista",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleStatus = async (id: string, status: 'ativo' | 'inativo') => {
    try {
      const success = await pareceristaService.toggleStatus(id, status);
      if (success) {
        setPareceristas(prev => 
          prev.map(p => p.id === id ? { ...p, status } : p)
        );
        toast({
          title: `Parecerista ${status === 'ativo' ? 'ativado' : 'inativado'} com sucesso!`,
        });
        return true;
      } else {
        toast({
          title: "Erro ao alterar status",
          description: "Tente novamente mais tarde",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      toast({
        title: "Erro ao alterar status",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteParecerista = async (id: string) => {
    try {
      const success = await pareceristaService.delete(id);
      if (success) {
        setPareceristas(prev => prev.filter(p => p.id !== id));
        toast({
          title: "Parecerista excluído com sucesso!",
        });
        return true;
      } else {
        toast({
          title: "Erro ao excluir parecerista",
          description: "Tente novamente mais tarde",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Erro ao excluir parecerista:', err);
      toast({
        title: "Erro ao excluir parecerista",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    pareceristas,
    loading,
    error,
    createParecerista,
    updateParecerista,
    toggleStatus,
    deleteParecerista,
    refetch: loadPareceristas
  };
};