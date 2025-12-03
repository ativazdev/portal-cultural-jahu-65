import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// import { useAuthState } from './useAuthCustom';
// import { usePrefeitura } from '@/contexts/PrefeituraContext';

export interface ProjetoProponente {
  id: string;
  proponente_id: string;
  edital_id: string;
  nome: string;
  edital_nome: string;
  edital_codigo: string;
  status: string;
  data_submissao: string;
  valor_solicitado: number;
  parecerista_nome?: string;
  descricao?: string;
  objetivos?: string;
  perfil_publico?: string;
  publico_prioritario?: string[];
  outro_publico_prioritario?: string;
  acessibilidade_arquitetonica?: string[];
  outra_acessibilidade_arquitetonica?: string;
  acessibilidade_comunicacional?: string[];
  outra_acessibilidade_comunicacional?: string;
  acessibilidade_atitudinal?: string[];
  implementacao_acessibilidade?: string;
  local_execucao?: string;
  data_inicio?: string;
  data_final?: string;
  estrategia_divulgacao?: string;
  outras_fontes?: boolean;
  detalhes_outras_fontes?: string;
  tipos_outras_fontes?: string[];
  venda_produtos?: boolean;
  detalhes_venda_produtos?: string;
  proponente_nome?: string;
  proponente_tipo?: string;
  proponente_cpf_cnpj?: string;
  proponente_cidade?: string;
  proponente_telefone?: string;
  itens_orcamento?: Array<{
    id: string;
    descricao: string;
    justificativa: string;
    unidade_medida: string;
    valor_unitario: number;
    quantidade: number;
    referencia_preco?: string;
    ordem: number;
  }>;
  equipe?: Array<{
    id: string;
    nome: string;
    funcao: string;
    cpf_cnpj: string;
    caracteristicas: string[];
    mini_curriculo: string;
  }>;
  cronograma?: Array<{
    id: string;
    nome_atividade: string;
    etapa: string;
    descricao: string;
    data_inicio: string;
    data_fim: string;
    ordem: number;
  }>;
}

export interface EditalDisponivel {
  id: string;
  nome: string;
  codigo: string;
  descricao: string;
  data_abertura: string;
  data_final_envio_projeto: string;
  horario_final_envio_projeto: string;
  status: string;
  valor_maximo: number;
  modalidades: string[];
  total_projetos?: number;
  prazo_avaliacao?: number;
}

export interface DashboardMetricas {
  totalProjetos: number;
  projetosEmAvaliacao: number;
  projetosAprovados: number;
  projetosRejeitados: number;
}

export function useDashboardProponente() {
  const [projetos, setProjetos] = useState<ProjetoProponente[]>([]);
  const [editaisDisponiveis, setEditaisDisponiveis] = useState<EditalDisponivel[]>([]);
  const [metricas, setMetricas] = useState<DashboardMetricas>({
    totalProjetos: 0,
    projetosEmAvaliacao: 0,
    projetosAprovados: 0,
    projetosRejeitados: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const { user, userType } = useAuthState();
  // const { prefeitura } = usePrefeitura();
  const user = { id: "test-user" };
  const userType = "proponente";
  const prefeitura = { id: "test-prefeitura" };

  // Buscar projetos do proponente
  const buscarProjetos = async () => {
    if (!user || !prefeitura?.id) {
      console.log('Usuário ou prefeitura não encontrados:', { user: !!user, prefeitura: !!prefeitura?.id });
      return;
    }

    try {
      // Buscar usuário proponente usando cliente autenticado
      const { getAuthenticatedSupabaseClient } = await import('@/integrations/supabase/client');
      const authClient = getAuthenticatedSupabaseClient('proponente');
      const { data: usuarioProponente, error: usuarioError } = await authClient
        .from('usuarios_proponentes')
        .select('id')
        .eq('id', user.id)
        .single();

      if (usuarioError) {
        console.log('Erro ao buscar usuário proponente:', usuarioError);
        setProjetos([]);
        return;
      }

      // Buscar proponentes vinculados ao usuário
      const { data: proponentes, error: proponentesError } = await supabase
        .from('proponentes')
        .select('id')
        .eq('usuario_id', usuarioProponente.id);

      if (proponentesError) throw proponentesError;

      if (!proponentes || proponentes.length === 0) {
        setProjetos([]);
        return;
      }

      const proponenteIds = proponentes.map(p => p.id);

      // Buscar projetos dos proponentes
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          id,
          proponente_id,
          edital_id,
          nome,
          status,
          data_submissao,
          valor_solicitado,
          descricao,
          objetivos,
          perfil_publico,
          publico_prioritario,
          outro_publico_prioritario,
          acessibilidade_arquitetonica,
          outra_acessibilidade_arquitetonica,
          acessibilidade_comunicacional,
          outra_acessibilidade_comunicacional,
          acessibilidade_atitudinal,
          implementacao_acessibilidade,
          local_execucao,
          data_inicio,
          data_final,
          estrategia_divulgacao,
          outras_fontes,
          detalhes_outras_fontes,
          tipos_outras_fontes,
          venda_produtos,
          detalhes_venda_produtos,
          editais!inner (
            id,
            nome,
            codigo
          ),
          pareceristas (
            nome
          )
        `)
        .in('proponente_id', proponenteIds)
        .eq('prefeitura_id', prefeitura.id)
        .order('data_submissao', { ascending: false });

      if (projetosError) throw projetosError;

      // Buscar dados completos para cada projeto
      const projetosComItens = await Promise.all(
        projetosData?.map(async (projeto) => {
          // Buscar itens de orçamento
          const { data: itensOrcamento, error: itensError } = await supabase
            .from('itens_orcamento_projeto')
            .select('*')
            .eq('projeto_id', projeto.id)
            .order('ordem');

          // Buscar equipe do projeto
          const { data: equipe, error: equipeError } = await supabase
            .from('equipe_projeto')
            .select('*')
            .eq('projeto_id', projeto.id);

          // Buscar cronograma do projeto
          const { data: cronograma, error: cronogramaError } = await supabase
            .from('atividades_projeto')
            .select('*')
            .eq('projeto_id', projeto.id)
            .order('ordem');

          if (itensError) {
            console.error('Erro ao buscar itens de orçamento:', itensError);
          }
          if (equipeError) {
            console.error('Erro ao buscar equipe:', equipeError);
          }
          if (cronogramaError) {
            console.error('Erro ao buscar cronograma:', cronogramaError);
          }

          return {
            ...projeto,
            itens_orcamento: itensOrcamento || [],
            equipe: equipe || [],
            cronograma: cronograma || []
          };
        }) || []
      );

      // Buscar informações dos proponentes separadamente
      console.log('Buscando proponentes com IDs:', proponenteIds);
      
      const { data: proponentesData, error: proponentesDataError } = await supabase
        .from('proponentes')
        .select('id, nome, tipo, cpf, cnpj, cidade, telefone')
        .in('id', proponenteIds);

      if (proponentesDataError) {
        console.error('Erro ao buscar proponentes:', proponentesDataError);
      } else {
        console.log('Proponentes encontrados:', proponentesData);
      }

      // Criar mapa de proponentes para lookup rápido
      const proponentesMap = new Map();
      proponentesData?.forEach(prop => {
        proponentesMap.set(prop.id, { 
          nome: prop.nome, 
          tipo: prop.tipo,
          cpf: prop.cpf,
          cnpj: prop.cnpj,
          cpf_cnpj: prop.cpf || prop.cnpj, // Usar cpf ou cnpj dependendo do tipo
          cidade: prop.cidade,
          telefone: prop.telefone
        });
      });

      const projetosFormatados = projetosComItens?.map(projeto => {
        const proponente = proponentesMap.get(projeto.proponente_id);
        console.log('Mapeando projeto:', projeto.nome, 'com proponente:', proponente);
        return {
          id: projeto.id,
          proponente_id: projeto.proponente_id,
          edital_id: projeto.edital_id,
          nome: projeto.nome,
          edital_nome: projeto.editais?.nome || 'N/A',
          edital_codigo: projeto.editais?.codigo || 'N/A',
          status: projeto.status,
          data_submissao: projeto.data_submissao,
          valor_solicitado: projeto.valor_solicitado || 0,
          parecerista_nome: projeto.pareceristas?.nome,
          descricao: projeto.descricao,
          objetivos: projeto.objetivos,
          perfil_publico: projeto.perfil_publico,
          publico_prioritario: projeto.publico_prioritario,
          outro_publico_prioritario: projeto.outro_publico_prioritario,
          acessibilidade_arquitetonica: projeto.acessibilidade_arquitetonica,
          outra_acessibilidade_arquitetonica: projeto.outra_acessibilidade_arquitetonica,
          acessibilidade_comunicacional: projeto.acessibilidade_comunicacional,
          outra_acessibilidade_comunicacional: projeto.outra_acessibilidade_comunicacional,
          acessibilidade_atitudinal: projeto.acessibilidade_atitudinal,
          implementacao_acessibilidade: projeto.implementacao_acessibilidade,
          local_execucao: projeto.local_execucao,
          data_inicio: projeto.data_inicio,
          data_final: projeto.data_final,
          estrategia_divulgacao: projeto.estrategia_divulgacao,
          outras_fontes: projeto.outras_fontes,
          detalhes_outras_fontes: projeto.detalhes_outras_fontes,
          tipos_outras_fontes: projeto.tipos_outras_fontes,
          venda_produtos: projeto.venda_produtos,
          detalhes_venda_produtos: projeto.detalhes_venda_produtos,
          proponente_nome: proponente?.nome || 'N/A',
          proponente_tipo: proponente?.tipo || 'N/A',
          proponente_cpf_cnpj: proponente?.cpf_cnpj || 'N/A',
          proponente_cidade: proponente?.cidade || 'N/A',
          proponente_telefone: proponente?.telefone || 'N/A',
          itens_orcamento: projeto.itens_orcamento || [],
          equipe: projeto.equipe || [],
          cronograma: projeto.cronograma || []
        };
      }) || [];

      setProjetos(projetosFormatados);

      // Calcular métricas
      const metricasCalculadas = {
        totalProjetos: projetosFormatados.length,
        projetosEmAvaliacao: projetosFormatados.filter(p => p.status === 'em_avaliacao').length,
        projetosAprovados: projetosFormatados.filter(p => p.status === 'aprovado').length,
        projetosRejeitados: projetosFormatados.filter(p => p.status === 'rejeitado').length
      };

      setMetricas(metricasCalculadas);
    } catch (err: any) {
      console.error('Erro ao buscar projetos:', err);
      setError(err.message || 'Erro ao carregar projetos');
    }
  };

  // Buscar editais disponíveis
  const buscarEditaisDisponiveis = async () => {
    if (!prefeitura?.id) {
      console.log('Prefeitura não encontrada para buscar editais');
      return;
    }

    try {
      const { data: editaisData, error } = await supabase
        .from('editais')
        .select(`
          id,
          nome,
          codigo,
          descricao,
          data_abertura,
          data_final_envio_projeto,
          horario_final_envio_projeto,
          status,
          valor_maximo,
          modalidades,
          total_projetos,
          prazo_avaliacao
        `)
        .eq('prefeitura_id', prefeitura.id)
        .eq('status', 'ativo')
        .order('data_final_envio_projeto', { ascending: true });

      if (error) throw error;

      const editaisFormatados = editaisData?.map(edital => ({
        id: edital.id,
        nome: edital.nome,
        codigo: edital.codigo,
        descricao: edital.descricao,
        data_abertura: edital.data_abertura,
        data_final_envio_projeto: edital.data_final_envio_projeto,
        horario_final_envio_projeto: edital.horario_final_envio_projeto,
        status: edital.status,
        valor_maximo: edital.valor_maximo || 0,
        modalidades: edital.modalidades || [],
        total_projetos: edital.total_projetos,
        prazo_avaliacao: edital.prazo_avaliacao
      })) || [];

      setEditaisDisponiveis(editaisFormatados);
    } catch (err: any) {
      console.error('Erro ao buscar editais:', err);
      setError(err.message || 'Erro ao carregar editais');
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      if (!user || !prefeitura?.id) return;

      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          buscarProjetos(),
          buscarEditaisDisponiveis()
        ]);
      } catch (err: any) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [user, prefeitura?.id]);

  return {
    projetos,
    editaisDisponiveis,
    metricas,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          buscarProjetos(),
          buscarEditaisDisponiveis()
        ]);
      } finally {
        setLoading(false);
      }
    }
  };
}
