import { supabase } from '@/integrations/supabase/client';

export interface Duvida {
  id: number;
  pergunta: string;
  resposta?: string;
  prefeitura_id: string;
  proponente_id?: string;
  parecerista_id?: string;
  fechada: boolean;
  respondida_por?: string;
  categoria?: string;
  created_at: string;
}

export interface CreateDuvidaData {
  pergunta: string;
  prefeitura_id: string;
  proponente_id?: string;
  parecerista_id?: string;
  categoria?: string;
}

export interface UpdateDuvidaData {
  resposta?: string;
  fechada?: boolean;
  respondida_por?: string;
}

export const duvidaService = {
  async getAll(prefeituraId: string): Promise<Duvida[]> {
    try {
      const { data, error } = await supabase
        .from('duvidas')
        .select(`
          *,
          proponente:usuarios_proponentes(nome, email),
          parecerista:pareceristas(nome, email)
        `)
        .eq('prefeitura_id', prefeituraId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar dúvidas:', error);
      return [];
    }
  },

  async getById(id: number): Promise<Duvida | null> {
    try {
      const { data, error } = await supabase
        .from('duvidas')
        .select(`
          *,
          proponente:usuarios_proponentes(nome, email),
          parecerista:pareceristas(nome, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar dúvida:', error);
      return null;
    }
  },

  async create(data: CreateDuvidaData): Promise<Duvida | null> {
    try {
      const { data: duvida, error } = await supabase
        .from('duvidas')
        .insert({
          pergunta: data.pergunta,
          prefeitura_id: data.prefeitura_id,
          proponente_id: data.proponente_id,
          parecerista_id: data.parecerista_id,
          categoria: data.categoria,
          fechada: false
        })
        .select()
        .single();

      if (error) throw error;
      return duvida;
    } catch (error) {
      console.error('Erro ao criar dúvida:', error);
      return null;
    }
  },

  async update(id: number, data: UpdateDuvidaData): Promise<Duvida | null> {
    try {
      const { data: duvida, error } = await supabase
        .from('duvidas')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return duvida;
    } catch (error) {
      console.error('Erro ao atualizar dúvida:', error);
      return null;
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('duvidas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar dúvida:', error);
      return false;
    }
  },

  async responder(id: number, resposta: string, respondidaPor: string): Promise<Duvida | null> {
    try {
      const { data: duvida, error } = await supabase
        .from('duvidas')
        .update({
          resposta,
          fechada: true,
          respondida_por: respondidaPor,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return duvida;
    } catch (error) {
      console.error('Erro ao responder dúvida:', error);
      return null;
    }
  }
};
