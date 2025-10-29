import { supabase } from "@/integrations/supabase/client";

export interface DocumentoHabilitacao {
  id: string;
  projeto_id: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  obrigatorio?: boolean;
  status?: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
  arquivo_nome?: string;
  arquivo_url?: string;
  arquivo_tamanho?: number;
  data_solicitacao?: string;
  data_upload?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentoHabilitacaoData {
  projeto_id: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  obrigatorio?: boolean;
  status?: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
}

export interface UpdateDocumentoHabilitacaoData {
  nome?: string;
  descricao?: string;
  tipo?: string;
  obrigatorio?: boolean;
  status?: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
  arquivo_nome?: string;
  arquivo_url?: string;
  arquivo_tamanho?: number;
  data_upload?: string;
}

export const documentoHabilitacaoService = {
  async getByProjeto(projetoId: string): Promise<DocumentoHabilitacao[]> {
    try {
      const { data, error } = await supabase
        .from('documentos_habilitacao')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar documentos de habilitação:', error);
      return [];
    }
  },

  async getById(id: string): Promise<DocumentoHabilitacao | null> {
    try {
      const { data, error } = await supabase
        .from('documentos_habilitacao')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar documento de habilitação:', error);
      return null;
    }
  },

  async create(data: CreateDocumentoHabilitacaoData): Promise<DocumentoHabilitacao | null> {
    try {
      const { data: newDoc, error } = await supabase
        .from('documentos_habilitacao')
        .insert({ ...data, status: 'pendente' })
        .select()
        .single();

      if (error) throw error;
      return newDoc;
    } catch (error) {
      console.error('Erro ao criar documento de habilitação:', error);
      return null;
    }
  },

  async createMultiple(docs: CreateDocumentoHabilitacaoData[]): Promise<DocumentoHabilitacao[]> {
    try {
      const docsWithStatus = docs.map(doc => ({ ...doc, status: 'pendente' as const }));
      const { data, error } = await supabase
        .from('documentos_habilitacao')
        .insert(docsWithStatus)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao criar múltiplos documentos:', error);
      return [];
    }
  },

  async update(id: string, data: UpdateDocumentoHabilitacaoData): Promise<DocumentoHabilitacao | null> {
    try {
      const { data: updatedDoc, error } = await supabase
        .from('documentos_habilitacao')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedDoc;
    } catch (error) {
      console.error('Erro ao atualizar documento de habilitação:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documentos_habilitacao')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar documento de habilitação:', error);
      return false;
    }
  },

  // Gerar documentos padrão baseado no tipo de proponente
  async gerarDocumentosPadrao(projetoId: string, tipoProponente: string): Promise<DocumentoHabilitacao[]> {
    let documentos: CreateDocumentoHabilitacaoData[] = [];

    if (tipoProponente === 'PJ') {
      documentos = [
        { 
          projeto_id: projetoId, 
          nome: 'CNPJ', 
          descricao: 'Inscrição no cadastro nacional de pessoa jurídica - CNPJ',
          tipo: 'cnpj',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'Atos Constitutivos', 
          descricao: 'Contrato social para no caso de pessoas jurídicas com fins lucrativos ou estatuto, nos casos de organizações da sociedade civil',
          tipo: 'atos_constitutivos',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'RG', 
          descricao: 'Documento de identidade (RG) do representante legal',
          tipo: 'rg',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'CPF', 
          descricao: 'Cadastro de Pessoa Física (CPF) do representante legal',
          tipo: 'cpf',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'Certidões da Pessoa Jurídica', 
          descricao: 'Certidão negativa de falência e recuperação judicial, Certidão negativa de débitos relativos a crédito tributário, Certidão negativa de débitos estaduais e municipais, Certidão negativa de débitos trabalhistas - CNDT',
          tipo: 'certidoes_pj',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'CRF/FGTS', 
          descricao: 'Certificado de regularidade do fundo de garantia do tempo de serviço - CRF/FGTS',
          tipo: 'crf_fgts',
          obrigatorio: true
        }
      ];
    } else if (tipoProponente === 'PF') {
      documentos = [
        { 
          projeto_id: projetoId, 
          nome: 'RG', 
          descricao: 'Documento de identidade (RG) do representante do grupo',
          tipo: 'rg',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'CPF', 
          descricao: 'Cadastro de Pessoa Física (CPF) do representante do grupo',
          tipo: 'cpf',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'Certidões do Representante', 
          descricao: 'Certidão negativa de débitos relativos créditos tributários federal e divida ativa da união em nome do representante do grupo, Certidões negativa de débito relativos ao crédito tributário estaduais e municipais, Certidão negativa de débitos trabalhistas - CNDT',
          tipo: 'certidoes_pf',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'Comprovante de Residência', 
          descricao: 'Comprovante de residência do representante do grupo',
          tipo: 'comprovante_residencia',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'Certidões Positivas com Efeito de Negativas', 
          descricao: 'Certidões positivas com efeito de negativas',
          tipo: 'certidoes_positivas',
          obrigatorio: true
        },
        { 
          projeto_id: projetoId, 
          nome: 'Declaração de Representação', 
          descricao: 'Declaração de representação, se for concorrer como um coletivo sem CNPJ',
          tipo: 'declaracao_representacao',
          obrigatorio: true
        }
      ];
    }

    if (documentos.length > 0) {
      return await this.createMultiple(documentos);
    }

    return [];
  }
};

