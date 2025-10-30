import { supabase } from "@/integrations/supabase/client";

export interface Pendencia {
  id: number;
  created_at: string;
  text: string;
  projeto_id: string;
  criado_por: string;
  criado_por_nome?: string; // Nome do usuário que criou a pendência
  arquivo?: string; // URL do arquivo
  realizada: boolean; // Status se a pendência foi realizada
}

export interface CreatePendenciaData {
  text: string;
  projeto_id: string;
  criado_por?: string;
  arquivo?: string;
  descricao?: string; // Para compatibilidade com a tela do proponente
}

export interface UpdatePendenciaData {
  text?: string;
  arquivo?: string;
  realizada?: boolean;
}

export const pendenciaService = {
  async getByProjeto(projetoId: string): Promise<Pendencia[]> {
    try {
      const { data, error } = await supabase
        .from('pendencias')
        .select(`
          *,
          criado_por_nome:user_profiles!criado_por(nome)
        `)
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(item => ({
        ...item,
        criado_por_nome: item.criado_por_nome?.nome || 'Usuário'
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);
      return [];
    }
  },

  async create(data: CreatePendenciaData): Promise<Pendencia | null> {
    try {
      const insertData: any = {
        projeto_id: data.projeto_id,
        text: data.descricao || data.text,
        arquivo: data.arquivo || null,
        realizada: false
      };
      
      // Só adiciona criado_por se for fornecido
      if (data.criado_por) {
        insertData.criado_por = data.criado_por;
      }

      const { data: result, error } = await supabase
        .from('pendencias')
        .insert(insertData)
        .select(`
          *,
          criado_por_nome:user_profiles!criado_por(nome)
        `)
        .single();

      if (error) throw error;
      
      return {
        ...result,
        criado_por_nome: result.criado_por_nome?.nome || 'Usuário'
      };
    } catch (error) {
      console.error('Erro ao criar pendência:', error);
      return null;
    }
  },

  async update(id: number, data: UpdatePendenciaData): Promise<Pendencia | null> {
    try {
      const { data: result, error } = await supabase
        .from('pendencias')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          criado_por_nome:user_profiles!criado_por(nome)
        `)
        .single();

      if (error) throw error;
      
      return {
        ...result,
        criado_por_nome: result.criado_por_nome?.nome || 'Usuário'
      };
    } catch (error) {
      console.error('Erro ao atualizar pendência:', error);
      return null;
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pendencias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar pendência:', error);
      return false;
    }
  }
};
