import { supabase } from "@/integrations/supabase/client";

export interface PrestacaoContas {
  id: string;
  prefeitura_id: string;
  projeto_id: string;
  proponente_id: string;
  tipo?: string;
  valor_executado?: number;
  data_entrega?: string;
  prazo_entrega?: string;
  status?: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'exigencia';
  status_open_banking?: 'nao_monitorado' | 'monitorado' | 'validado' | 'inconsistente' | 'conforme';
  relatorio_atividades?: string;
  relatorio_financeiro?: string;
  comprovantes_url?: string;
  parecer_analise?: string;
  analisado_por?: string;
  analisado_por_nome?: string;
  data_analise?: string;
  movimentacao_financeira_id?: string;
  exigencia?: string;
  motivo_rejeicao?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePrestacaoContasData {
  prefeitura_id: string;
  projeto_id: string;
  proponente_id: string;
  tipo?: string;
  valor_executado?: number;
  data_entrega?: string;
  prazo_entrega?: string;
  relatorio_atividades?: string;
  relatorio_financeiro?: string;
  comprovantes_url?: string;
}

export interface UpdatePrestacaoContasData {
  tipo?: string;
  valor_executado?: number;
  data_entrega?: string;
  prazo_entrega?: string;
  status?: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'exigencia';
  status_open_banking?: 'nao_monitorado' | 'monitorado' | 'validado' | 'inconsistente' | 'conforme';
  relatorio_atividades?: string;
  relatorio_financeiro?: string;
  comprovantes_url?: string;
  parecer_analise?: string;
  analisado_por?: string;
  data_analise?: string;
  movimentacao_financeira_id?: string;
  exigencia?: string;
  motivo_rejeicao?: string;
}

export const prestacaoContasService = {
  async getByProjeto(projetoId: string): Promise<PrestacaoContas[]> {
    try {
      const { data, error } = await supabase
        .from('prestacoes_contas')
        .select(`
          *,
          analisador:user_profiles!analisado_por(nome)
        `)
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear dados para incluir nome do analisador
      return (data || []).map((item: any) => ({
        ...item,
        analisado_por_nome: item.analisador?.nome
      }));
    } catch (error) {
      console.error('Erro ao buscar prestações de contas:', error);
      return [];
    }
  },

  async getById(id: string): Promise<PrestacaoContas | null> {
    try {
      const { data, error } = await supabase
        .from('prestacoes_contas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar prestação de contas:', error);
      return null;
    }
  },

  async create(data: CreatePrestacaoContasData): Promise<PrestacaoContas | null> {
    try {
      const { data: result, error } = await supabase
        .from('prestacoes_contas')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Erro ao criar prestação de contas:', error);
      return null;
    }
  },

  async update(id: string, data: UpdatePrestacaoContasData): Promise<PrestacaoContas | null> {
    try {
      const { data: result, error } = await supabase
        .from('prestacoes_contas')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Erro ao atualizar prestação de contas:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('prestacoes_contas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar prestação de contas:', error);
      return false;
    }
  }
};
