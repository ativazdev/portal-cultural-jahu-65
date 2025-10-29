import { supabase } from "@/integrations/supabase/client";

export interface ContaMonitorada {
  id: string;
  prefeitura_id: string;
  projeto_id: string;
  proponente_id: string;
  banco: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: string;
  consentimento_id?: string;
  consentimento_ativo?: boolean;
  data_consentimento?: string;
  data_expiracao_consentimento?: string;
  saldo_atual?: number;
  valor_total_recebido?: number;
  valor_total_gasto?: number;
  ultima_atualizacao?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContaMonitoradaData {
  prefeitura_id: string;
  projeto_id: string;
  proponente_id: string;
  banco: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: string;
  consentimento_id?: string;
  consentimento_ativo?: boolean;
  data_consentimento?: string;
  data_expiracao_consentimento?: string;
  saldo_atual?: number;
  valor_total_recebido?: number;
  valor_total_gasto?: number;
  ultima_atualizacao?: string;
  status?: string;
}

export interface UpdateContaMonitoradaData {
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: string;
  consentimento_id?: string;
  consentimento_ativo?: boolean;
  data_consentimento?: string;
  data_expiracao_consentimento?: string;
  saldo_atual?: number;
  valor_total_recebido?: number;
  valor_total_gasto?: number;
  ultima_atualizacao?: string;
  status?: string;
}

export const contaMonitoradaService = {
  async getByProjeto(projetoId: string): Promise<ContaMonitorada[]> {
    try {
      const { data, error } = await supabase
        .from('contas_monitoradas')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar contas monitoradas:', error);
      return [];
    }
  },

  async getById(id: string): Promise<ContaMonitorada | null> {
    try {
      const { data, error } = await supabase
        .from('contas_monitoradas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar conta monitorada:', error);
      return null;
    }
  },

  async create(data: CreateContaMonitoradaData): Promise<ContaMonitorada | null> {
    try {
      const { data: result, error } = await supabase
        .from('contas_monitoradas')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Erro ao criar conta monitorada:', error);
      return null;
    }
  },

  async update(id: string, data: UpdateContaMonitoradaData): Promise<ContaMonitorada | null> {
    try {
      const { data: result, error } = await supabase
        .from('contas_monitoradas')
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
      console.error('Erro ao atualizar conta monitorada:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contas_monitoradas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar conta monitorada:', error);
      return false;
    }
  }
};
