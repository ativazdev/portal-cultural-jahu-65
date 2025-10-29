import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ItemOrcamento {
  id?: string;
  descricao: string;
  justificativa: string;
  unidade_medida: string;
  valor_unitario: number;
  quantidade: number;
  referencia_preco?: string;
  ordem: number;
}

export interface DadosProjetoPlanilha {
  id: string;
  nome: string;
  valor_maximo_projeto?: number;
  valor_solicitado?: number;
  proponente_nome: string;
  edital_nome: string;
  edital_valor_maximo?: number;
  outras_fontes?: boolean | null;
  detalhes_outras_fontes?: string | null;
  tipos_outras_fontes?: string[] | null;
}

export function usePlanilhaOrcamentaria(projetoId?: string) {
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [projetoData, setProjetoData] = useState<DadosProjetoPlanilha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const buscarProjetoData = useCallback(async () => {
    if (!projetoId) return;
    
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          id,
          nome,
          valor_maximo_projeto,
          valor_solicitado,
          outras_fontes,
          detalhes_outras_fontes,
          tipos_outras_fontes,
          proponente_id,
          editais (
            nome,
            valor_maximo
          )
        `)
        .eq('id', projetoId)
        .single();

      if (error) throw error;

      if (data) {
        setProjetoData({
          id: data.id,
          nome: data.nome,
          valor_maximo_projeto: data.valor_maximo_projeto,
          valor_solicitado: data.valor_solicitado,
          proponente_nome: 'Proponente', // Nome fixo por enquanto
          edital_nome: data.editais?.nome || 'Edital Desconhecido',
          edital_valor_maximo: data.editais?.valor_maximo,
          outras_fontes: data.outras_fontes,
          detalhes_outras_fontes: data.detalhes_outras_fontes,
          tipos_outras_fontes: data.tipos_outras_fontes
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados do projeto:', err);
      setError(err.message || 'Erro ao carregar dados do projeto.');
    }
  }, [projetoId]);

  const buscarItens = useCallback(async () => {
    if (!projetoId) return;
    
    try {
      const { data, error } = await supabase
        .from('itens_orcamento_projeto')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setItens(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar itens do orçamento:', err);
      setError(err.message || 'Erro ao carregar itens do orçamento.');
    }
  }, [projetoId]);

  useEffect(() => {
    if (projetoId) {
      setLoading(true);
      Promise.all([buscarProjetoData(), buscarItens()])
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setItens([]);
      setProjetoData(null);
    }
  }, [projetoId, buscarProjetoData, buscarItens]);

  const salvarItens = async (novosItens: ItemOrcamento[]) => {
    if (!projetoId) {
      toast({
        title: "Erro",
        description: "ID do projeto não encontrado para salvar itens.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Remover itens antigos
      const { error: deleteError } = await supabase
        .from('itens_orcamento_projeto')
        .delete()
        .eq('projeto_id', projetoId);

      if (deleteError) throw deleteError;

      // Inserir novos itens
      const itensComProjetoId = novosItens.map((item, index) => ({
        ...item,
        projeto_id: projetoId,
        ordem: index,
      }));

      if (itensComProjetoId.length > 0) {
        const { error: insertError } = await supabase
          .from('itens_orcamento_projeto')
          .insert(itensComProjetoId);

        if (insertError) throw insertError;
      }

      // Calcular valor total e atualizar projeto
      const valorTotal = novosItens.reduce((total, item) => 
        total + (item.valor_unitario * item.quantidade), 0
      );

      const { error: updateError } = await supabase
        .from('projetos')
        .update({ valor_solicitado: valorTotal })
        .eq('id', projetoId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Itens de orçamento salvos com sucesso!",
      });
      
      buscarItens(); // Recarregar itens após salvar
      buscarProjetoData(); // Recarregar dados do projeto
      return true;
    } catch (err: any) {
      console.error('Erro ao salvar itens do orçamento:', err);
      toast({
        title: "Erro ao salvar",
        description: err.message || "Não foi possível salvar os itens. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const atualizarValorMaximoProjeto = async (novoValorMaximo: number) => {
    if (!projetoId) {
      toast({
        title: "Erro",
        description: "ID do projeto não encontrado.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('projetos')
        .update({ valor_maximo_projeto: novoValorMaximo })
        .eq('id', projetoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Valor máximo do projeto atualizado!",
      });
      
      buscarProjetoData(); // Recarregar dados do projeto
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar valor máximo:', err);
      toast({
        title: "Erro ao atualizar",
        description: err.message || "Não foi possível atualizar o valor máximo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const calcularValorTotal = () => {
    return itens.reduce((total, item) => total + (item.valor_unitario * item.quantidade), 0);
  };

  const calcularValorMaximo = () => {
    // Prioridade: valor_maximo_projeto > valor_maximo do edital > 30000 (fallback)
    return projetoData?.valor_maximo_projeto || 
           projetoData?.edital_valor_maximo || 
           30000;
  };

  const calcularSaldoDisponivel = () => {
    const valorMaximo = calcularValorMaximo();
    const valorTotal = calcularValorTotal();
    return valorMaximo - valorTotal;
  };

  return {
    itens,
    projetoData,
    loading,
    error,
    salvarItens,
    atualizarValorMaximoProjeto,
    buscarItens,
    buscarProjetoData,
    calcularValorTotal,
    calcularValorMaximo,
    calcularSaldoDisponivel
  };
}
