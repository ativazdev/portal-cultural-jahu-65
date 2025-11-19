import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardData {
  cards: {
    projetosSubmetidos: number;
    projetosAguardandoAvaliacao: number;
    projetosAprovados: number;
    valorInvestido: number;
    prestacaoContasPendente: number;
    duvidasPendentes: number;
    recursosPendentes: number;
    contraRazoesPendentes: number;
  };
  graficos: {
    categoriaProjetos: Array<{
      categoria: string;
      quantidade: number;
      valor: number;
    }>;
    projetosPorStatus: Array<{
      status: string;
      quantidade: number;
    }>;
  };
}

export const useDashboardPrefeitura = (prefeituraId: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('📊 Buscando dados do dashboard para prefeitura:', prefeituraId);
        setLoading(true);
        setError(null);

        // Buscar projetos
        const { data: projetos, error: projetosError } = await supabase
          .from('projetos')
          .select(`
            id,
            status,
            valor_solicitado,
            modalidade,
            created_at
          `)
          .eq('prefeitura_id', prefeituraId);

        if (projetosError) {
          console.error('❌ Erro ao buscar projetos:', projetosError);
          throw new Error('Erro ao buscar projetos');
        }

        console.log('📊 Projetos encontrados:', projetos?.length || 0);

        // Buscar prestações de contas pendentes
        const { data: prestacoes, error: prestacoesError } = await supabase
          .from('prestacoes_contas')
          .select('id, status')
          .eq('prefeitura_id', prefeituraId)
          .eq('status', 'pendente');

        if (prestacoesError) {
          console.error('❌ Erro ao buscar prestações:', prestacoesError);
          // Não falhar por causa disso, apenas logar
        }

        // Buscar dúvidas pendentes
        const { data: duvidas, error: duvidasError } = await supabase
          .from('duvidas')
          .select('id, fechada')
          .eq('fechada', false);

        if (duvidasError) {
          console.error('❌ Erro ao buscar dúvidas:', duvidasError);
          // Não falhar por causa disso, apenas logar
        }

        // Buscar recursos e contra-razões pendentes (apenas status pendente)
        const { data: recursos, error: recursosError } = await supabase
          .from('recursos')
          .select('id, tipo, status')
          .eq('prefeitura_id', prefeituraId)
          .eq('status', 'pendente');

        if (recursosError) {
          console.error('❌ Erro ao buscar recursos:', recursosError);
          // Não falhar por causa disso, apenas logar
        }

        const recursosPendentes = (recursos || []).filter(r => r.tipo === 'recurso').length;
        const contraRazoesPendentes = (recursos || []).filter(r => r.tipo === 'contra_razao').length;

        // Processar dados dos projetos
        const projetosData = projetos || [];
        const projetosSubmetidos = projetosData.length;
        const projetosAguardandoAvaliacao = projetosData.filter(p => p.status === 'em_avaliacao').length;
        const projetosAprovados = projetosData.filter(p => p.status === 'aprovado').length;
        const valorInvestido = projetosData
          .filter(p => p.status === 'aprovado')
          .reduce((sum, p) => sum + (p.valor_solicitado || 0), 0);

        // Agrupar por modalidade (categoria)
        const categoriaProjetos = projetosData.reduce((acc, projeto) => {
          const categoria = projeto.modalidade || 'Outros';
          const existing = acc.find(item => item.categoria === categoria);
          
          if (existing) {
            existing.quantidade += 1;
            existing.valor += projeto.valor_solicitado || 0;
          } else {
            acc.push({
              categoria,
              quantidade: 1,
              valor: projeto.valor_solicitado || 0
            });
          }
          
          return acc;
        }, [] as Array<{ categoria: string; quantidade: number; valor: number }>);

        // Agrupar por status
        const projetosPorStatus = [
          { status: 'Submetidos', quantidade: projetosSubmetidos },
          { status: 'Em Avaliação', quantidade: projetosAguardandoAvaliacao },
          { status: 'Aprovados', quantidade: projetosAprovados },
          { status: 'Rejeitados', quantidade: projetosData.filter(p => p.status === 'rejeitado').length }
        ];

        const dashboardData: DashboardData = {
          cards: {
            projetosSubmetidos,
            projetosAguardandoAvaliacao,
            projetosAprovados,
            valorInvestido,
            prestacaoContasPendente: prestacoes?.length || 0,
            duvidasPendentes: duvidas?.length || 0,
            recursosPendentes,
            contraRazoesPendentes
          },
          graficos: {
            categoriaProjetos,
            projetosPorStatus
          }
        };

        console.log('📊 Dados do dashboard processados:', dashboardData);
        setData(dashboardData);

      } catch (err) {
        console.error('❌ Erro ao buscar dados do dashboard:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        
        // Fallback para dados mockados em caso de erro
        const fallbackData: DashboardData = {
          cards: {
            projetosSubmetidos: 0,
            projetosAguardandoAvaliacao: 0,
            projetosAprovados: 0,
            valorInvestido: 0,
            prestacaoContasPendente: 0,
            duvidasPendentes: 0,
            recursosPendentes: 0,
            contraRazoesPendentes: 0
          },
          graficos: {
            categoriaProjetos: [],
            projetosPorStatus: []
          }
        };
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    if (prefeituraId) {
      fetchDashboardData();
    }
  }, [prefeituraId]);

  return { data, loading, error };
};
