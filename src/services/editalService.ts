import { supabase } from "@/integrations/supabase/client";

export interface Anexo {
  titulo: string;
  url: string;
  tipo: string;
}

export interface CriterioAvaliacao {
  id: string;
  descricao: string;
  peso: number;
}

export interface Edital {
  id: string;
  prefeitura_id: string;
  codigo: string;
  nome: string;
  descricao: string;
  data_abertura: string;
  data_final_envio_projeto: string;
  horario_final_envio_projeto: string;
  status: 'recebendo_projetos' | 'avaliacao' | 'recurso' | 'contra_razao' | 'em_execucao' | 'finalizado' | 'rascunho' | 'arquivado';
  total_projetos: number;
  valor_maximo: number;
  prazo_avaliacao: number;
  modalidades: string[];
  regulamento: string[]; // Mantido para compatibilidade
  anexos: Anexo[];
  has_accountability_phase: boolean;
  data_prorrogacao?: string;
  criterios_avaliacao?: CriterioAvaliacao[];
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
  anexos: Anexo[];
  has_accountability_phase: boolean;
  data_prorrogacao?: string;
  criterios_avaliacao?: CriterioAvaliacao[];
}

export type UpdateEditalData = Partial<CreateEditalData>;

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
      const { anexos, criterios_avaliacao, ...rest } = data;
      const editalData = {
        ...rest,
        prefeitura_id: prefeituraId,
        created_by: userId,
        status: 'rascunho',
        total_projetos: 0
      };

      console.log('Criando edital com payload:', editalData);

      const { data: edital, error } = await (supabase
        .from('editais') as any)
        .insert(editalData)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado do Supabase ao criar edital:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      return edital;
    } catch (error) {
      console.error('Erro ao criar edital:', error);
      return null;
    }
  },

  async update(id: string, data: Partial<CreateEditalData>): Promise<Edital | null> {
    try {
      // Filtrar campos que não pertencem à tabela 'editais'
      const { anexos, criterios_avaliacao, id: _id, created_at: _ca, ...rest } = data as any;
      
      const updateData = {
        ...rest,
        updated_at: new Date().toISOString()
      };

      console.log(`Atualizando edital ${id} com payload:`, updateData);

      const { data: edital, error } = await (supabase
        .from('editais') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado do Supabase ao atualizar edital:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      return edital;
    } catch (error) {
      console.error('Erro ao atualizar edital:', error);
      return null;
    }
  },

  async updateStatus(id: string, status: Edital['status']): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('editais') as any)
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
      const { error } = await (supabase
        .from('editais') as any)
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

      const stats = (data as any[])?.reduce((acc, edital) => {
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
  },

  async getAnexos(editalId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('arquivos_edital')
        .select('*')
        .eq('edital_id', editalId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar anexos do edital:', error);
      return [];
    }
  }
};
