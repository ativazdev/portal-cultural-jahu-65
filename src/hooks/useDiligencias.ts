import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Diligencia {
  id: string;
  projeto_id: string;
  usuario_solicitante_id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'respondido' | 'aceito' | 'recusado';
  arquivo_url?: string;
  modelo_url?: string;
  modelo_nome?: string;
  data_resposta?: string;
  observacoes_resposta?: string;
  created_at: string;
  updated_at: string;
}

export const useDiligencias = (projetoId: string) => {
  const [diligencias, setDiligencias] = useState<Diligencia[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDiligencias = async () => {
    if (!projetoId) return;
    
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('projeto_solicitacoes_documentos') as any)
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiligencias(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar diligências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as diligências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiligencias();
  }, [projetoId]);

  const createDiligencia = async (titulo: string, descricao: string, modelo_url?: string, modelo_nome?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await (supabase
        .from('projeto_solicitacoes_documentos') as any)
        .insert({
          projeto_id: projetoId,
          usuario_solicitante_id: user.id,
          titulo,
          descricao,
          status: 'pendente',
          modelo_url,
          modelo_nome
        })
        .select()
        .single();

      if (error) throw error;
      
      setDiligencias(prev => [data, ...prev]);
      toast({
        title: "Diligência criada",
        description: "A solicitação de documento foi enviada ao proponente.",
      });
      return true;
    } catch (error: any) {
      console.error('Erro ao criar diligência:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar diligência.",
        variant: "destructive",
      });
      return false;
    }
  };

  const responderDiligencia = async (id: string, arquivoUrl: string, observacoes: string) => {
    try {
      const { data, error } = await (supabase
        .from('projeto_solicitacoes_documentos') as any)
        .update({
          arquivo_url: arquivoUrl,
          observacoes_resposta: observacoes,
          status: 'respondido',
          data_resposta: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDiligencias(prev => prev.map(d => d.id === id ? data : d));
      toast({
        title: "Diligência respondida",
        description: "O documento foi enviado com sucesso.",
      });
      return true;
    } catch (error: any) {
      console.error('Erro ao responder diligência:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao responder diligência.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStatusDiligencia = async (id: string, status: 'aceito' | 'recusado') => {
    try {
      const { data, error } = await (supabase
        .from('projeto_solicitacoes_documentos') as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDiligencias(prev => prev.map(d => d.id === id ? data : d));
      toast({
        title: "Status atualizado",
        description: `Diligência ${status === 'aceito' ? 'aceita' : 'recusada'} com sucesso.`,
      });
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar status da diligência:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDiligencia = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('projeto_solicitacoes_documentos') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDiligencias(prev => prev.filter(d => d.id !== id));
      toast({
        title: "Diligência removida",
        description: "A solicitação foi excluída com sucesso.",
      });
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar diligência:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir diligência.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    diligencias,
    loading,
    createDiligencia,
    responderDiligencia,
    updateStatusDiligencia,
    deleteDiligencia,
    refresh: fetchDiligencias
  };
};
