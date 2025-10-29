import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePrefeitura } from '@/contexts/PrefeituraContext';

export interface ProjetoCompleto {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  objetivos: string;
  valorSolicitado: number;
  dataSubmissao: string;
  status: string;
  // Dados do proponente
  proponente: {
    id: string;
    nome: string;
    tipo: string;
    cpf: string | null;
    cnpj: string | null;
    cidade: string | null;
    telefone: string | null;
    email: string | null;
  } | null;
  // Dados do edital
  edital: {
    id: string;
    nome: string;
    codigo: string;
    descricao: string | null;
  } | null;
  // Dados do parecerista
  parecerista: {
    id: string;
    nome: string;
    email: string;
  } | null;
  // Dados relacionados
  equipe: Array<{
    id: string;
    nome: string;
    funcao: string;
    cpf_cnpj: string | null;
    indigena: boolean;
    lgbtqiapn: boolean;
    preto_pardo: boolean;
    deficiencia: boolean;
    mini_curriculo: string | null;
  }>;
  cronograma: Array<{
    id: string;
    nome_atividade: string;
    etapa: string;
    descricao: string;
    data_inicio: string;
    data_fim: string;
    ordem: number;
  }>;
  orcamento: Array<{
    id: string;
    descricao: string;
    justificativa: string;
    unidade_medida: string;
    valor_unitario: number;
    quantidade: number;
    referencia_preco: string | null;
    ordem: number;
  }>;
  // Dados do projeto
  perfilPublico: string | null;
  publicoPrioritario: string[] | null;
  outroPublicoPrioritario: string | null;
  acessibilidadeArquitetonica: string[] | null;
  outraAcessibilidadeArquitetonica: string | null;
  acessibilidadeComunicacional: string[] | null;
  outraAcessibilidadeComunicacional: string | null;
  acessibilidadeAtitudinal: string[] | null;
  implementacaoAcessibilidade: string | null;
  localExecucao: string | null;
  dataInicio: string | null;
  dataFinal: string | null;
  estrategiaDivulgacao: string | null;
  outrasFontes: boolean | null;
  detalhesOutrasFontes: string | null;
  tiposOutrasFontes: string[] | null;
  vendaProdutos: boolean | null;
  detalhesVendaProdutos: string | null;
}

export function useProjetoCompleto(projetoId: string | null) {
  const [projeto, setProjeto] = useState<ProjetoCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { prefeitura } = usePrefeitura();

  const buscarProjeto = async () => {
    if (!projetoId || !prefeitura?.id) {
      setProjeto(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chamar a Edge Function diretamente
      const supabaseUrl = supabase.supabaseUrl;
      const response = await fetch(`${supabaseUrl}/functions/v1/get-projeto-completo?projeto_id=${projetoId}&prefeitura_id=${prefeitura.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar projeto');
      }

      const data = await response.json();
      setProjeto(data);
    } catch (err) {
      console.error('Erro ao buscar projeto completo:', err);
      setError('Erro ao carregar dados do projeto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProjeto();
  }, [projetoId, prefeitura?.id]);

  return {
    projeto,
    loading,
    error,
    refetch: buscarProjeto
  };
}
