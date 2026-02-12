import { supabase } from "@/integrations/supabase/client";

export interface Recurso {
  id: string;
  prefeitura_id: string;
  projeto_id: string;
  proponente_id: string;
  tipo: 'recurso' | 'contra_razao';
  justificativa: string;
  status: 'pendente' | 'em_analise' | 'deferido' | 'indeferido';
  resposta?: string;
  respondido_por?: string;
  data_resposta?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecursoData {
  prefeitura_id: string;
  projeto_id: string;
  proponente_id: string;
  tipo: 'recurso' | 'contra_razao';
  justificativa: string;
}

export interface UpdateRecursoData {
  status?: 'pendente' | 'em_analise' | 'deferido' | 'indeferido';
  resposta?: string;
  respondido_por?: string;
}

export const recursosService = {
// Buscar todos os recursos de um usuário proponente (busca recursos de todos os proponentes do usuário)
  async getByProponente(usuarioId: string, client?: any): Promise<Recurso[]> {
    try {
      const supabaseClient = client || supabase;
      
      // Primeiro, buscar todos os proponentes do usuário
      const { data: proponentes, error: proponentesError } = await (supabaseClient
        .from('proponentes') as any)
        .select('id')
        .eq('usuario_id', usuarioId);

      if (proponentesError) throw proponentesError;

      if (!proponentes || proponentes.length === 0) {
        return [];
      }

      const proponenteIds = proponentes.map((p: any) => p.id);

      // Buscar recursos de todos os proponentes do usuário
      const { data, error } = await (supabaseClient
        .from('recursos') as any)
        .select('*')
        .in('proponente_id', proponenteIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Recurso[];
    } catch (error: any) {
      console.error('Erro ao buscar recursos do proponente:', error);
      throw error;
    }
  },

  // Buscar todos os recursos de um projeto
  async getByProjeto(projetoId: string, client?: any): Promise<Recurso[]> {
    try {
      const supabaseClient = client || supabase;
      const { data, error } = await (supabaseClient
        .from('recursos') as any)
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Recurso[];
    } catch (error: any) {
      console.error('Erro ao buscar recursos do projeto:', error);
      throw error;
    }
  },

  // Buscar todos os recursos de uma prefeitura
  async getByPrefeitura(prefeituraId: string, client?: any): Promise<Recurso[]> {
    try {
      const supabaseClient = client || supabase;
      const { data, error } = await (supabaseClient
        .from('recursos') as any)
        .select(`
          *,
          projeto:projetos(id, nome),
          proponente:proponentes(id, nome)
        `)
        .eq('prefeitura_id', prefeituraId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Recurso[];
    } catch (error: any) {
      console.error('Erro ao buscar recursos da prefeitura:', error);
      throw error;
    }
  },

  // Buscar recurso por ID
  async getById(id: string, client?: any): Promise<Recurso | null> {
    try {
      const supabaseClient = client || supabase;
      const { data, error } = await (supabaseClient
        .from('recursos') as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Recurso;
    } catch (error: any) {
      console.error('Erro ao buscar recurso:', error);
      return null;
    }
  },

  // Criar novo recurso
  async create(recursoData: CreateRecursoData, client?: any): Promise<Recurso> {
    try {
      console.log('🚀 Criando recurso/contrarrazão:', recursoData);
      const supabaseClient = client || supabase;
      const { data, error } = await (supabaseClient
        .from('recursos') as any)
        .insert([recursoData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase ao criar recurso:', error);
        throw error;
      }
      console.log('✅ Recurso criado com sucesso:', data);
      return data as Recurso;
    } catch (error: any) {
      console.error('❌ Erro Catch ao criar recurso:', error);
      throw error;
    }
  },

  // Atualizar recurso (para responder)
  async update(id: string, updateData: UpdateRecursoData, client?: any): Promise<Recurso> {
    try {
      const updatePayload: any = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      // Se houver resposta, atualizar data_resposta
      if (updateData.resposta) {
        updatePayload.data_resposta = new Date().toISOString();
      }

      console.log('📝 Atualizando recurso:', { id, updatePayload });
      
      const supabaseClient = client || supabase;

      const { data, error } = await (supabaseClient
        .from('recursos') as any)
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw new Error(error.message || 'Erro ao atualizar recurso');
      }

      console.log('✅ Recurso atualizado com sucesso:', data);
      return data as Recurso;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar recurso:', error);
      throw error;
    }
  },

  // Deletar recurso
  async delete(id: string, client?: any): Promise<boolean> {
    try {
      const supabaseClient = client || supabase;
      const { error } = await (supabaseClient
        .from('recursos') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar recurso:', error);
      return false;
    }
  },

  // Buscar recursos pendentes por edital
  async getPendentesByEdital(editalId: string, client?: any): Promise<{ recursos: number; contraRazoes: number; total: number }> {
    try {
      const supabaseClient = client || supabase;
      // Buscar projetos do edital
      const { data: projetos, error: projetosError } = await (supabaseClient
        .from('projetos') as any)
        .select('id')
        .eq('edital_id', editalId);

      if (projetosError) throw projetosError;

      if (!projetos || projetos.length === 0) {
        return { recursos: 0, contraRazoes: 0, total: 0 };
      }

      const projetoIds = projetos.map((p: any) => p.id);

      // Buscar recursos pendentes (apenas status pendente)
      const { data: recursos, error: recursosError } = await (supabaseClient
        .from('recursos') as any)
        .select('id, tipo, status')
        .in('projeto_id', projetoIds)
        .eq('status', 'pendente');

      if (recursosError) throw recursosError;

      const recursosCount = (recursos || []).filter((r: any) => r.tipo === 'recurso').length;
      const contraRazoesCount = (recursos || []).filter((r: any) => r.tipo === 'contra_razao').length;

      return {
        recursos: recursosCount,
        contraRazoes: contraRazoesCount,
        total: recursosCount + contraRazoesCount
      };
    } catch (error: any) {
      console.error('Erro ao buscar recursos pendentes por edital:', error);
      return { recursos: 0, contraRazoes: 0, total: 0 };
    }
  },

  // Buscar recursos pendentes por prefeitura (para dashboard)
  async getPendentesByPrefeitura(prefeituraId: string, client?: any): Promise<{ recursos: number; contraRazoes: number; total: number }> {
    try {
      const supabaseClient = client || supabase;
      const { data, error } = await (supabaseClient
        .from('recursos') as any)
        .select('id, tipo, status')
        .eq('prefeitura_id', prefeituraId)
        .eq('status', 'pendente');

      if (error) throw error;

      const recursosCount = (data || []).filter((r: any) => r.tipo === 'recurso').length;
      const contraRazoesCount = (data || []).filter((r: any) => r.tipo === 'contra_razao').length;

      return {
        recursos: recursosCount,
        contraRazoes: contraRazoesCount,
        total: recursosCount + contraRazoesCount
      };
    } catch (error: any) {
      console.error('Erro ao buscar recursos pendentes por prefeitura:', error);
      return { recursos: 0, contraRazoes: 0, total: 0 };
    }
  },

  // Buscar projetos com recursos pendentes por edital
  async getProjetosComRecursosPendentes(editalId: string, client?: any): Promise<Array<{ projeto: any; recurso: Recurso }>> {
    try {
      const supabaseClient = client || supabase;
      // Buscar projetos do edital
      const { data: projetos, error: projetosError } = await (supabaseClient
        .from('projetos') as any)
        .select('*')
        .eq('edital_id', editalId);

      if (projetosError) throw projetosError;

      if (!projetos || projetos.length === 0) {
        return [];
      }

      const projetoIds = projetos.map((p: any) => p.id);

      // Buscar recursos pendentes
      const { data: recursos, error: recursosError } = await (supabaseClient
        .from('recursos') as any)
        .select('*')
        .in('projeto_id', projetoIds)
        .eq('status', 'pendente')
        .eq('tipo', 'recurso');

      if (recursosError) throw recursosError;

      // Combinar projetos com seus recursos
      return (recursos || []).map((recurso: any) => ({
        projeto: projetos.find((p: any) => p.id === recurso.projeto_id),
        recurso: recurso as Recurso
      })).filter((item: any) => item.projeto);
    } catch (error: any) {
      console.error('Erro ao buscar projetos com recursos pendentes:', error);
      return [];
    }
  },

  // Buscar projetos com Contrarrazões pendentes por edital
  async getProjetosComContraRazoesPendentes(editalId: string, client?: any): Promise<Array<{ projeto: any; contraRazao: Recurso }>> {
    try {
      const supabaseClient = client || supabase;
      // Buscar projetos do edital
      const { data: projetos, error: projetosError } = await (supabaseClient
        .from('projetos') as any)
        .select('*')
        .eq('edital_id', editalId);

      if (projetosError) throw projetosError;

      if (!projetos || projetos.length === 0) {
        return [];
      }

      const projetoIds = projetos.map((p: any) => p.id);

      // Buscar Contrarrazões pendentes
      const { data: contraRazoes, error: contraRazoesError } = await (supabaseClient
        .from('recursos') as any)
        .select('*')
        .in('projeto_id', projetoIds)
        .eq('status', 'pendente')
        .eq('tipo', 'contra_razao');

      if (contraRazoesError) throw contraRazoesError;

      // Combinar projetos com suas Contrarrazões
      return (contraRazoes || []).map((contraRazao: any) => ({
        projeto: projetos.find((p: any) => p.id === contraRazao.projeto_id),
        contraRazao: contraRazao as Recurso
      })).filter((item: any) => item.projeto);
    } catch (error: any) {
      console.error('Erro ao buscar projetos com Contrarrazões pendentes:', error);
      return [];
    }
  },

  // Buscar TODOS os projetos com recursos por edital (não apenas pendentes)
  async getProjetosComRecursos(editalId: string, client?: any): Promise<Array<{ projeto: any; recurso: Recurso }>> {
    try {
      const supabaseClient = client || supabase;
      // Buscar projetos do edital
      const { data: projetos, error: projetosError } = await (supabaseClient
        .from('projetos') as any)
        .select('*')
        .eq('edital_id', editalId);

      if (projetosError) throw projetosError;

      if (!projetos || projetos.length === 0) {
        return [];
      }

      const projetoIds = projetos.map((p: any) => p.id);

      // Buscar TODOS os recursos (não apenas pendentes)
      const { data: recursos, error: recursosError } = await (supabaseClient
        .from('recursos') as any)
        .select('*')
        .in('projeto_id', projetoIds)
        .eq('tipo', 'recurso')
        .order('created_at', { ascending: false });

      if (recursosError) throw recursosError;

      // Combinar projetos com seus recursos
      return (recursos || []).map((recurso: any) => ({
        projeto: projetos.find((p: any) => p.id === recurso.projeto_id),
        recurso: recurso as Recurso
      })).filter((item: any) => item.projeto);
    } catch (error: any) {
      console.error('Erro ao buscar projetos com recursos:', error);
      return [];
    }
  },

  // Buscar TODOS os projetos com Contrarrazões por edital (não apenas pendentes)
  async getProjetosComContraRazoes(editalId: string, client?: any): Promise<Array<{ projeto: any; contraRazao: Recurso }>> {
    try {
      const supabaseClient = client || supabase;
      // Buscar projetos do edital
      const { data: projetos, error: projetosError } = await (supabaseClient
        .from('projetos') as any)
        .select('*')
        .eq('edital_id', editalId);

      if (projetosError) throw projetosError;

      if (!projetos || projetos.length === 0) {
        return [];
      }

      const projetoIds = projetos.map((p: any) => p.id);

      // Buscar TODAS as Contrarrazões (não apenas pendentes)
      const { data: contraRazoes, error: contraRazoesError } = await (supabaseClient
        .from('recursos') as any)
        .select('*')
        .in('projeto_id', projetoIds)
        .eq('tipo', 'contra_razao')
        .order('created_at', { ascending: false });

      if (contraRazoesError) throw contraRazoesError;

      // Combinar projetos com suas Contrarrazões
      return (contraRazoes || []).map((contraRazao: any) => ({
        projeto: projetos.find((p: any) => p.id === contraRazao.projeto_id),
        contraRazao: contraRazao as Recurso
      })).filter((item: any) => item.projeto);
    } catch (error: any) {
      console.error('Erro ao buscar projetos com Contrarrazões:', error);
      return [];
    }
  },
};

