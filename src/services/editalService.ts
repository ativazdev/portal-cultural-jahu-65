import { supabase } from "@/integrations/supabase/client";

export interface Edital {
  id: string;
  prefeitura_id: string;
  codigo: string;
  nome: string;
  descricao: string;
  data_abertura: string;
  data_final_envio_projeto: string;
  horario_final_envio_projeto: string;
  status: 'rascunho' | 'ativo' | 'arquivado';
  total_projetos: number;
  valor_maximo: number;
  prazo_avaliacao: number;
  modalidades: string[];
  regulamento: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateEditalData {
  codigo: string;
  nome: string;
  descricao: string;
  data_abertura: string;
  data_final_envio_projeto: string;
  horario_final_envio_projeto: string;
  valor_maximo: number;
  prazo_avaliacao: number;
  modalidades: string[];
  regulamento: string[];
}

export const editalService = {
  async getAll(prefeituraId: string): Promise<Edital[]> {
    try {
      const { data, error } = await supabase
        .from('editais')
        .select('*')
        .eq('prefeitura_id', prefeituraId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar editais:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Edital | null> {
    try {
      const { data, error } = await supabase
        .from('editais')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar edital:', error);
      return null;
    }
  },

  async create(data: CreateEditalData, prefeituraId: string, userId: string): Promise<Edital | null> {
    try {
      const editalData = {
        ...data,
        prefeitura_id: prefeituraId,
        created_by: userId,
        status: 'rascunho',
        total_projetos: 0
      };

      const { data: edital, error } = await supabase
        .from('editais')
        .insert(editalData)
        .select()
        .single();

      if (error) throw error;
      return edital;
    } catch (error) {
      console.error('Erro ao criar edital:', error);
      return null;
    }
  },

  async update(id: string, data: Partial<CreateEditalData>): Promise<Edital | null> {
    try {
      const { data: edital, error } = await supabase
        .from('editais')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return edital;
    } catch (error) {
      console.error('Erro ao atualizar edital:', error);
      return null;
    }
  },

  async updateStatus(id: string, status: Edital['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('editais')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao alterar status do edital:', error);
      return false;
    }
  },

  async archive(id: string): Promise<boolean> {
    return this.updateStatus(id, 'arquivado');
  },

  async unarchive(id: string): Promise<boolean> {
    return this.updateStatus(id, 'aberto');
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('editais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar edital:', error);
      return false;
    }
  },

  async getStats(prefeituraId: string): Promise<{
    total: number;
    abertos: number;
    fechados: number;
    arquivados: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('editais')
        .select('status')
        .eq('prefeitura_id', prefeituraId);

      if (error) throw error;

      const stats = data?.reduce((acc, edital) => {
        acc.total++;
        acc[edital.status as keyof typeof acc]++;
        return acc;
      }, {
        total: 0,
        abertos: 0,
        fechados: 0,
        arquivados: 0
      }) || { total: 0, abertos: 0, fechados: 0, arquivados: 0 };

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos editais:', error);
      return { total: 0, abertos: 0, fechados: 0, arquivados: 0 };
    }
  }
};
