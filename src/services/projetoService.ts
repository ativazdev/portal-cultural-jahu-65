import { supabase } from "@/integrations/supabase/client";

export interface Projeto {
  id: string;
  prefeitura_id: string;
  edital_id: string;
  proponente_id: string;
  nome: string;
  modalidade: string;
  descricao: string;
  objetivos: string;
  perfil_publico: string;
  publico_prioritario: string[];
  outro_publico_prioritario: string;
  acessibilidade_arquitetonica: string[];
  outra_acessibilidade_arquitetonica: string;
  acessibilidade_comunicacional: string[];
  outra_acessibilidade_comunicacional: string;
  acessibilidade_atitudinal: string[];
  implementacao_acessibilidade: string;
  local_execucao: string;
  data_inicio: string;
  data_final: string;
  estrategia_divulgacao: string;
  valor_solicitado: number;
  outras_fontes: boolean;
  tipos_outras_fontes: string[];
  detalhes_outras_fontes: string;
  venda_produtos: boolean;
  detalhes_venda_produtos: string;
  status: 'rascunho' | 'submetido' | 'em_avaliacao' | 'aprovado' | 'rejeitado' | 'arquivado' | 'habilitado' | 'nao_habilitado' | 'aguardando_parecerista' | 'aguardando_avaliacao' | 'avaliado' | 'recebido' | 'em_execucao' | 'concluido' | 'prestacao_enviada' | 'suplente' | 'desclassificado';
  data_submissao: string | null;
  motivo_rejeicao?: string;
  necessita_comprovante_residencia: boolean;
  numero_inscricao: string;
  created_at: string;
  updated_at: string;
  valor_maximo_projeto: number;
  anexos_prestacao?: Array<{
    titulo: string;
    url: string;
    tipo: string;
  }>;
}

export interface ProjetoWithDetails extends Projeto {
  edital: {
    nome: string;
    codigo: string;
  };
  proponente: {
    id: string;
    nome: string;
    nome_artistico?: string;
    email: string;
    tipo: string;
    telefone?: string;
    endereco?: string;
    cep?: string;
    cidade?: string;
    estado?: string;
    cpf?: string;
    cnpj?: string;
    rg?: string;
    data_nascimento?: string;
    mini_curriculo?: string;
    comunidade_tradicional?: string;
    outra_comunidade?: string;
    genero?: string;
    raca?: string;
    pcd?: boolean;
    tipo_deficiencia?: string;
    outra_deficiencia?: string;
    escolaridade?: string;
    renda_mensal?: string;
    programa_social?: string;
    outro_programa_social?: string;
    concorre_cotas?: boolean;
    tipo_cotas?: string;
    funcao_artistica?: string;
    outra_funcao_artistica?: string;
    representa_coletivo?: boolean;
    nome_coletivo?: string;
    ano_coletivo?: string;
    inscricao_estadual?: string;
    nome_representante?: string;
    cpf_representante?: string;
    razao_social?: string;
  };
  equipe: Array<{
    nome: string;
    funcao: string;
    email?: string;
    cpf_cnpj?: string;
    indigena?: boolean;
    lgbtqiapn?: boolean;
    preto_pardo?: boolean;
    deficiencia?: boolean;
    mini_curriculo?: string;
  }>;
  atividades: Array<{
    nome?: string; // legado
    nome_atividade?: string;
    etapa?: string;
    descricao: string;
    data_inicio: string;
    data_fim: string;
  }>;
  orcamento: Array<{
    id: string;
    descricao: string;
    justificativa: string;
    unidade_medida: string;
    valor_unitario: number;
    quantidade: number;
    referencia_preco: string;
    ordem: number;
  }>;
  metas: Array<{
    nome: string;
    descricao: string;
    indicador: string;
    valor_meta: number;
  }>;
}

export const projetoService = {
  async getAll(prefeituraId: string, editalId?: string): Promise<Projeto[]> {
    try {
      let query = supabase
        .from('projetos')
        .select('*')
        .eq('prefeitura_id', prefeituraId);

      if (editalId) {
        query = query.eq('edital_id', editalId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any[]) || [];
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
  },

  async getById(id: string): Promise<ProjetoWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          edital:edital_id (nome, codigo, valor_maximo, has_accountability_phase),
          proponente:proponente_id (*),
          equipe:equipe_projeto (*),
          atividades:atividades_projeto (*),
          orcamento:itens_orcamento_projeto (*),
          metas:metas_projeto (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      return null;
    }
  },

  async getByEdital(editalId: string): Promise<Projeto[]> {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('edital_id', editalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any[]) || [];
    } catch (error) {
      console.error('Erro ao buscar projetos do edital:', error);
      return [];
    }
  },

  async updateStatus(id: string, status: Projeto['status'], motivoRejeicao?: string): Promise<boolean> {
    try {
      // Garantir que ao submeter, o status seja aguardando_parecerista se necessário
      const finalStatus = status === 'submetido' ? 'aguardando_parecerista' : status;
      
      const updateData: any = {
        status: finalStatus,
        updated_at: new Date().toISOString()
      };

      if (motivoRejeicao !== undefined) {
        updateData.motivo_rejeicao = motivoRejeicao;
      }
      
      const { error } = await (supabase
        .from('projetos') as any)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao alterar status do projeto:', error);
      return false;
    }
  },

  async getStats(prefeituraId: string): Promise<{
    total: number;
    submetidos: number;
    em_avaliacao: number;
    aprovados: number;
    rejeitados: number;
    valor_total: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('status, valor_solicitado')
        .eq('prefeitura_id', prefeituraId);

      if (error) throw error;

      const stats = (data as any[])?.reduce((acc, projeto) => {
        acc.total++;
        acc[projeto.status as keyof typeof acc]++;
        acc.valor_total += projeto.valor_solicitado || 0;
        return acc;
      }, {
        total: 0,
        submetidos: 0,
        em_avaliacao: 0,
        aprovados: 0,
        rejeitados: 0,
        valor_total: 0
      }) || { total: 0, submetidos: 0, em_avaliacao: 0, aprovados: 0, rejeitados: 0, valor_total: 0 };

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos projetos:', error);
      return { total: 0, submetidos: 0, em_avaliacao: 0, aprovados: 0, rejeitados: 0, valor_total: 0 };
    }
  },

  async getByCategory(prefeituraId: string): Promise<Array<{ modalidade: string; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('modalidade')
        .eq('prefeitura_id', prefeituraId);

      if (error) throw error;

      const categories = (data as any[])?.reduce((acc, projeto) => {
        const modalidade = projeto.modalidade || 'Outros';
        acc[modalidade] = ((acc[modalidade] as number) || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return Object.entries(categories).map(([modalidade, count]) => ({
        modalidade,
        count: count as number
      }));
    } catch (error) {
      console.error('Erro ao buscar projetos por modalidade:', error);
      return [];
    }
  }
};
