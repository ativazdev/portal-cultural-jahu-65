import { supabase } from "@/integrations/supabase/client";

export interface Parecerista {
  id: string;
  prefeitura_id: string;
  email: string;
  senha_hash: string;
  nome: string;
  cpf: string;
  rg: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  data_nascimento: string;
  area_atuacao: string;
  especialidades: string[];
  experiencia_anos: number;
  formacao_academica: string;
  mini_curriculo: string;
  status: string;
  data_ativacao: string | null;
  ultimo_acesso: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePareceristaData {
  email: string;
  nome: string;
  cpf: string;
  rg: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  data_nascimento: string;
  area_atuacao: string;
  especialidades: string[];
  experiencia_anos: number;
  formacao_academica: string;
  mini_curriculo: string;
}

export const pareceristaService = {
  async getAll(prefeituraId: string): Promise<Parecerista[]> {
    try {
      const { data, error } = await supabase
        .from('pareceristas')
        .select('*')
        .eq('prefeitura_id', prefeituraId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pareceristas:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Parecerista | null> {
    try {
      const { data, error } = await supabase
        .from('pareceristas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar parecerista:', error);
      return null;
    }
  },

  async create(data: CreatePareceristaData, prefeituraId: string): Promise<Parecerista | null> {
    try {
      // Chamar a edge function para cadastrar parecerista e enviar email
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${(supabase as any).supabaseUrl}/functions/v1/cadastrar-parecerista`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'src': (supabase as any).supabaseUrl, // Used only for constructing the URL
          'Authorization': `Bearer ${session?.access_token || (supabase as any).supabaseKey}`,
        },
        body: JSON.stringify({
          prefeitura_id: prefeituraId,
          email: data.email,
          nome: data.nome,
          cpf: data.cpf,
          rg: data.rg,
          telefone: data.telefone,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          data_nascimento: data.data_nascimento,
          area_atuacao: data.area_atuacao,
          especialidades: data.especialidades,
          experiencia_anos: data.experiencia_anos,
          formacao_academica: data.formacao_academica,
          mini_curriculo: data.mini_curriculo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar parecerista');
      }

      const result = await response.json();
      
      if (result.success) {
        // Buscar o parecerista criado para retornar os dados completos
        const { data: parecerista, error: fetchError } = await supabase
          .from('pareceristas')
          .select('*')
          .eq('id', result.parecerista.id)
          .single();

        if (fetchError) throw fetchError;
        return parecerista;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao criar parecerista:', error);
      return null;
    }
  },

  async update(id: string, data: Partial<CreatePareceristaData>): Promise<Parecerista | null> {
    try {
      const { data: parecerista, error } = await (supabase
        .from('pareceristas') as any)
        .update({
          ...data,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return parecerista;
    } catch (error) {
      console.error('Erro ao atualizar parecerista:', error);
      return null;
    }
  },

  async toggleStatus(id: string, status: 'ativo' | 'inativo'): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('pareceristas') as any)
        .update({
          status,
          data_ativacao: status === 'ativo' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao alterar status do parecerista:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pareceristas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar parecerista:', error);
      return false;
    }
  }
};
