import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DadosProjetoRascunho {
  // Dados básicos do projeto
  nome?: string;
  modalidade?: string;
  modalidade?: string;
  descricao?: string;
  objetivos?: string;
  perfil_publico?: string;
  publico_prioritario?: string[];
  outro_publico_prioritario?: string;
  
  // Acessibilidade
  acessibilidade_arquitetonica?: string[];
  outra_acessibilidade_arquitetonica?: string;
  acessibilidade_comunicacional?: string[];
  outra_acessibilidade_comunicacional?: string;
  acessibilidade_atitudinal?: string[];
  implementacao_acessibilidade?: string;
  
  // Execução
  local_execucao?: string;
  data_inicio?: string;
  data_final?: string;
  estrategia_divulgacao?: string;
  
  // Financeiro
  valor_solicitado?: number;
  outras_fontes?: string | boolean;
  detalhes_outras_fontes?: string;
  venda_produtos?: boolean | string;
  detalhes_venda_produtos?: string;
  
  // Metas
  metas?: Array<{
    descricao: string;
  }>;
  
  // Equipe
  equipe?: Array<{
    nome: string;
    funcao: string;
    cpfCnpj?: string;
    indigena?: boolean;
    lgbtqiapn?: boolean;
    pretoPardo?: boolean;
    deficiencia?: boolean;
    miniCurriculo?: string;
    experiencia?: string;
  }>;
}

export interface ProjetoRascunho {
  id: string;
  proponente_id: string;
  edital_id: string;
  dados: DadosProjetoRascunho;
  etapa_atual: string; // 'formulario', 'cronograma', 'orcamento'
  updated_at: string;
}

export function useRascunhoProjeto(proponenteId?: string, editalId?: string) {
  const [rascunho, setRascunho] = useState<ProjetoRascunho | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar rascunho existente
  const buscarRascunho = async () => {
    if (!proponenteId || !editalId) {
      console.log('IDs não fornecidos:', { proponenteId, editalId });
      return;
    }

    console.log('Buscando rascunho com IDs:', { proponenteId, editalId });

    try {
      setLoading(true);
      setError(null);

      console.log('Executando query com filtros:', {
        proponente_id: proponenteId,
        edital_id: editalId,
        status: 'rascunho'
      });

      const { data, error: rascunhoError } = await supabase
        .from('projetos')
        .select(`
          id,
          proponente_id,
          edital_id,
          nome,
          modalidade,
          modalidade,
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
          valor_solicitado,
          outras_fontes,
          detalhes_outras_fontes,
          venda_produtos,
          detalhes_venda_produtos,
          updated_at,
          metas_projeto (
            descricao
          ),
          equipe_projeto (
            nome,
            funcao,
            cpf_cnpj,
            indigena,
            lgbtqiapn,
            preto_pardo,
            deficiencia,
            mini_curriculo
          )
        `)
        .eq('proponente_id', proponenteId)
        .eq('edital_id', editalId)
        .eq('status', 'rascunho')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (rascunhoError && rascunhoError.code !== 'PGRST116') {
        console.error('Erro ao buscar rascunho:', rascunhoError);
        throw rascunhoError;
      }

      console.log('Dados encontrados:', data);

      if (data) {
        const projetoRascunho: ProjetoRascunho = {
          id: data.id,
          proponente_id: data.proponente_id,
          edital_id: data.edital_id,
          etapa_atual: 'formulario', // Será determinado pelos dados presentes
          updated_at: data.updated_at,
          dados: {
            nome: data.nome,
            modalidade: data.modalidade,
            modalidade: data.modalidade,
            descricao: data.descricao,
            objetivos: data.objetivos,
            perfil_publico: data.perfil_publico,
            publico_prioritario: data.publico_prioritario,
            outro_publico_prioritario: data.outro_publico_prioritario,
            acessibilidade_arquitetonica: data.acessibilidade_arquitetonica,
            outra_acessibilidade_arquitetonica: data.outra_acessibilidade_arquitetonica,
            acessibilidade_comunicacional: data.acessibilidade_comunicacional,
            outra_acessibilidade_comunicacional: data.outra_acessibilidade_comunicacional,
            acessibilidade_atitudinal: data.acessibilidade_atitudinal,
            implementacao_acessibilidade: data.implementacao_acessibilidade,
            local_execucao: data.local_execucao,
            data_inicio: data.data_inicio,
            data_final: data.data_final,
            estrategia_divulgacao: data.estrategia_divulgacao,
            valor_solicitado: data.valor_solicitado,
            outras_fontes: data.outras_fontes,
            detalhes_outras_fontes: data.detalhes_outras_fontes,
            venda_produtos: data.venda_produtos,
            detalhes_venda_produtos: data.detalhes_venda_produtos,
            metas: data.metas_projeto?.map(m => ({
              descricao: m.descricao
            })) || [],
            equipe: data.equipe_projeto?.map(e => {
              console.log('Dados da equipe do banco:', e);
              return {
                nome: e.nome,
                funcao: e.funcao,
                cpfCnpj: e.cpf_cnpj,
                indigena: e.indigena,
                lgbtqiapn: e.lgbtqiapn,
                pretoPardo: e.preto_pardo,
                deficiencia: e.deficiencia,
                miniCurriculo: e.mini_curriculo,
                experiencia: e.mini_curriculo
              };
            }) || []
          }
        };

        console.log('Rascunho definido:', projetoRascunho);
        setRascunho(projetoRascunho);
      } else {
        console.log('Nenhum rascunho encontrado');
      }
    } catch (err: any) {
      console.error('Erro ao buscar rascunho:', err);
      setError(err.message || 'Erro ao carregar rascunho');
    } finally {
      setLoading(false);
    }
  };

  // Salvar rascunho
  const salvarRascunho = async (dados: DadosProjetoRascunho, etapaAtual: string = 'formulario') => {
    if (!proponenteId || !editalId) {
      setError('ID do proponente ou edital não fornecido');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Preparar dados para inserção
      const dadosProjeto = {
        prefeitura_id: '58666af4-7539-4da5-96dd-5ee416e9ee73', // ID da prefeitura de Jaú
        edital_id: editalId,
        proponente_id: proponenteId,
        status: 'rascunho' as const,
        nome: dados.nome || '',
        modalidade: dados.modalidade || 'teatro',
        modalidade: dados.modalidade || '',
        descricao: dados.descricao || '',
        objetivos: dados.objetivos || '',
        perfil_publico: dados.perfil_publico || '',
        publico_prioritario: dados.publico_prioritario || [],
        outro_publico_prioritario: dados.outro_publico_prioritario || '',
        acessibilidade_arquitetonica: dados.acessibilidade_arquitetonica || [],
        outra_acessibilidade_arquitetonica: dados.outra_acessibilidade_arquitetonica || '',
        acessibilidade_comunicacional: dados.acessibilidade_comunicacional || [],
        outra_acessibilidade_comunicacional: dados.outra_acessibilidade_comunicacional || '',
        acessibilidade_atitudinal: dados.acessibilidade_atitudinal || [],
        implementacao_acessibilidade: dados.implementacao_acessibilidade || '',
        local_execucao: dados.local_execucao || '',
        data_inicio: dados.data_inicio || null,
        data_final: dados.data_final || null,
        estrategia_divulgacao: dados.estrategia_divulgacao || '',
        valor_solicitado: dados.valor_solicitado || 0,
        outras_fontes: dados.outras_fontes === 'sim' || dados.outras_fontes === true,
        detalhes_outras_fontes: dados.detalhes_outras_fontes || '',
        venda_produtos: dados.venda_produtos === true || dados.venda_produtos === 'sim',
        detalhes_venda_produtos: dados.detalhes_venda_produtos || ''
      };

      let projetoId: string;

      if (rascunho?.id) {
        // Atualizar rascunho existente
        const { data, error: updateError } = await supabase
          .from('projetos')
          .update(dadosProjeto)
          .eq('id', rascunho.id)
          .select('id')
          .single();

        if (updateError) throw updateError;
        projetoId = data.id;

        // Remover metas e equipe antigas
        await supabase.from('metas_projeto').delete().eq('projeto_id', projetoId);
        await supabase.from('equipe_projeto').delete().eq('projeto_id', projetoId);
      } else {
        // Criar novo rascunho
        const { data, error: insertError } = await supabase
          .from('projetos')
          .insert(dadosProjeto)
          .select('id')
          .single();

        if (insertError) throw insertError;
        projetoId = data.id;
      }

      // Inserir metas
      if (dados.metas && dados.metas.length > 0) {
        const metasParaInserir = dados.metas.map((meta, index) => ({
          projeto_id: projetoId,
          descricao: meta.descricao,
          ordem: index
        }));

        const { error: metasError } = await supabase
          .from('metas_projeto')
          .insert(metasParaInserir);

        if (metasError) throw metasError;
      }

      // Inserir equipe
      if (dados.equipe && dados.equipe.length > 0) {
        console.log('Dados da equipe para salvar:', dados.equipe);
        const equipeParaInserir = dados.equipe.map(membro => {
          console.log('Membro para inserir:', membro);
          return {
            projeto_id: projetoId,
            nome: membro.nome,
            funcao: membro.funcao,
            cpf_cnpj: membro.cpfCnpj || '',
            indigena: membro.indigena || false,
            lgbtqiapn: membro.lgbtqiapn || false,
            preto_pardo: membro.pretoPardo || false,
            deficiencia: membro.deficiencia || false,
            mini_curriculo: membro.miniCurriculo || membro.experiencia || ''
          };
        });
        console.log('Equipe para inserir no banco:', equipeParaInserir);

        const { error: equipeError } = await supabase
          .from('equipe_projeto')
          .insert(equipeParaInserir);

        if (equipeError) throw equipeError;
      }

      // Atualizar estado local
      const novoRascunho: ProjetoRascunho = {
        id: projetoId,
        proponente_id: proponenteId,
        edital_id: editalId,
        etapa_atual: etapaAtual,
        updated_at: new Date().toISOString(),
        dados
      };

      setRascunho(novoRascunho);

      console.log('Rascunho salvo:', novoRascunho);
      return projetoId;

    } catch (err: any) {
      console.error('Erro ao salvar rascunho:', err);
      setError(err.message || 'Erro ao salvar rascunho');
      
      toast({
        title: "Erro ao salvar rascunho",
        description: "Não foi possível salvar o progresso. Tente novamente.",
        variant: "destructive"
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Carregar rascunho quando IDs mudarem
  useEffect(() => {
    if (proponenteId && editalId) {
      buscarRascunho();
    }
  }, [proponenteId, editalId]);

  return {
    rascunho,
    loading,
    error,
    salvarRascunho,
    buscarRascunho
  };
}
