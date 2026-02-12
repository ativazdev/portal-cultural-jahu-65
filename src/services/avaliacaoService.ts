import { supabase } from "@/integrations/supabase/client";

export interface Avaliacao {
  id: string;
  prefeitura_id: string;
  projeto_id: string;
  parecerista_id: string;
  parecerista_nome?: string; // Nome do parecerista
  nota_relevancia?: number;
  nota_viabilidade?: number;
  nota_impacto?: number;
  nota_orcamento?: number;
  nota_inovacao?: number;
  nota_sustentabilidade?: number;
  nota_final?: number;
  parecer_tecnico?: string;
  recomendacao?: string;
  status: 'aguardando_parecerista' | 'pendente' | 'em_avaliacao' | 'avaliado';
  data_atribuicao: string;
  data_inicio_avaliacao?: string;
  data_conclusao?: string;
  data_avaliacao?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAvaliacaoData {
  prefeitura_id: string;
  projeto_id: string;
  parecerista_id?: string;
  status?: 'aguardando_parecerista' | 'pendente' | 'em_avaliacao' | 'avaliado';
}

export interface UpdateAvaliacaoData {
  parecerista_id?: string;
  nota_relevancia?: number;
  nota_viabilidade?: number;
  nota_impacto?: number;
  nota_orcamento?: number;
  nota_inovacao?: number;
  nota_sustentabilidade?: number;
  nota_final?: number;
  parecer_tecnico?: string;
  recomendacao?: string;
  status?: 'aguardando_parecerista' | 'pendente' | 'em_avaliacao' | 'avaliado';
  data_inicio_avaliacao?: string;
  data_conclusao?: string;
  data_avaliacao?: string;
}

export const avaliacaoService = {
  async getByProjeto(projetoId: string): Promise<Avaliacao[]> {
    try {
      const { data, error } = await (supabase
        .from('avaliacoes' as any) as any)
        .select(`
          *,
          parecerista_nome:pareceristas(nome)
        `)
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        parecerista_nome: item.parecerista_nome?.nome || 'Parecerista não encontrado'
      }));
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Avaliacao | null> {
    try {
      const { data, error } = await (supabase
        .from('avaliacoes' as any) as any)
        .select(`
          *,
          parecerista_nome:pareceristas(nome)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...(data as any),
        parecerista_nome: (data as any).parecerista_nome?.nome || 'Parecerista não encontrado'
      };
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
      return null;
    }
  },

  async create(data: CreateAvaliacaoData): Promise<Avaliacao | null> {
    try {
      const { data: result, error } = await supabase
        .from('avaliacoes')
        .insert({
          ...data,
          status: data.status || 'aguardando_parecerista'
        })
        .select(`
          *,
          parecerista_nome:pareceristas(nome)
        `)
        .single();

      if (error) throw error;
      
      return {
        ...result,
        parecerista_nome: result.parecerista_nome?.nome || 'Parecerista não encontrado'
      };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      return null;
    }
  },

  async update(id: string, data: UpdateAvaliacaoData): Promise<Avaliacao | null> {
    try {
      const { data: result, error } = await supabase
        .from('avaliacoes')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          parecerista_nome:pareceristas(nome)
        `)
        .single();

      if (error) throw error;
      
      return {
        ...result,
        parecerista_nome: result.parecerista_nome?.nome || 'Parecerista não encontrado'
      };
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      return false;
    }
  },

  async getPareceristasDisponiveis(prefeituraId: string): Promise<Array<{
    id: string;
    nome: string;
    especialidades: string[];
    experiencia_anos: number;
    area_atuacao: string | null;
    formacao_academica: string | null;
    mini_curriculo: string | null;
  }>> {
    try {
      const { data, error } = await supabase
        .from('pareceristas')
        .select('id, nome, especialidades, experiencia_anos, area_atuacao, formacao_academica, mini_curriculo')
        .eq('prefeitura_id', prefeituraId)
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pareceristas:', error);
      return [];
    }
  },

  async getAvaliacaoFinal(projetoId: string): Promise<any | null> {
    try {
      // Usando select e limit(1) em vez de single() para ser mais resiliente a erros de schema cache/406
      const { data, error } = await (supabase
        .from('avaliacoes_final' as any) as any)
        .select('*')
        .eq('projeto_id', projetoId)
        .limit(1);

      if (error) {
        // Se a tabela não existe ou há erro de cache, logar e retornar null silenciosamente
        console.warn('Erro ao buscar avaliação final (pode ser schema cache):', error.message);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Erro ao buscar avaliação final:', error);
      return null;
    }
  },

  async getAvaliacoesIndividuais(projetoId: string): Promise<Avaliacao[]> {
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          parecerista_nome:pareceristas(nome)
        `)
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        parecerista_nome: item.parecerista_nome?.nome || 'Parecerista não encontrado'
      }));
    } catch (error) {
      console.error('Erro ao buscar avaliações individuais:', error);
      return [];
    }
  }
};
