import { supabase } from "@/integrations/supabase/client";

export interface MovimentacaoFinanceira {
  id: string;
  prefeitura_id: string;
  projeto_id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data_movimentacao: string;
  origem_destino?: string;
  metodo_pagamento?: string;
  documento_fiscal?: string;
  categoria_despesa?: string;
  status_validacao?: 'pendente' | 'validado' | 'rejeitado';
  observacao?: string;
  conta_id?: string;
  created_at: string;
}

export interface CreateMovimentacaoFinanceiraData {
  prefeitura_id: string;
  projeto_id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data_movimentacao: string;
  origem_destino?: string;
  metodo_pagamento?: string;
  documento_fiscal?: string;
  categoria_despesa?: string;
  observacao?: string;
  conta_id?: string;
}

export interface UpdateMovimentacaoFinanceiraData {
  tipo?: string;
  descricao?: string;
  valor?: number;
  data_movimentacao?: string;
  origem_destino?: string;
  metodo_pagamento?: string;
  documento_fiscal?: string;
  categoria_despesa?: string;
  status_validacao?: 'pendente' | 'validado' | 'rejeitado';
  observacao?: string;
  conta_id?: string;
}

export const movimentacaoFinanceiraService = {
  async getByProjeto(projetoId: string, contaId?: string): Promise<MovimentacaoFinanceira[]> {
    try {
      let query = supabase
        .from('movimentacoes_financeiras')
        .select('*')
        .eq('projeto_id', projetoId);

      if (contaId) {
        query = query.eq('conta_id', contaId);
      }

      const { data, error } = await query.order('data_movimentacao', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar movimentações financeiras:', error);
      return [];
    }
  },

  async getById(id: string): Promise<MovimentacaoFinanceira | null> {
    try {
      const { data, error } = await supabase
        .from('movimentacoes_financeiras')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar movimentação financeira:', error);
      return null;
    }
  },

  async create(data: CreateMovimentacaoFinanceiraData): Promise<MovimentacaoFinanceira | null> {
    try {
      const { data: result, error } = await supabase
        .from('movimentacoes_financeiras')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Erro ao criar movimentação financeira:', error);
      return null;
    }
  },

  async update(id: string, data: UpdateMovimentacaoFinanceiraData): Promise<MovimentacaoFinanceira | null> {
    try {
      const { data: result, error } = await supabase
        .from('movimentacoes_financeiras')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Erro ao atualizar movimentação financeira:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('movimentacoes_financeiras')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar movimentação financeira:', error);
      return false;
    }
  }
};
