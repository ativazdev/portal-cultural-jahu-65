import { useState, useEffect } from 'react';
import { projetoService, Projeto } from '@/services/projetoService';

export const useProjetosEdital = (editalId: string) => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjetos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projetoService.getByEdital(editalId);
      // Filtrar projetos em rascunho - não devem ser exibidos na tela da prefeitura
      const filteredData = data.filter(projeto => projeto.status !== 'rascunho');
      setProjetos(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Projeto['status']): Promise<boolean> => {
    try {
      const success = await projetoService.updateStatus(id, status);
      if (success) {
        await loadProjetos();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status do projeto');
      return false;
    }
  };

  const getStats = () => {
    // Filtrar projetos em rascunho para as estatísticas também
    const projetosVisiveis = projetos.filter(p => p.status !== 'rascunho');
    
    const stats = {
      total: projetosVisiveis.length,
      aguardando_avaliacao: projetosVisiveis.filter(p => p.status === 'aguardando_avaliacao').length,
      recebidos: projetosVisiveis.filter(p => p.status === 'recebido').length,
      em_avaliacao: projetosVisiveis.filter(p => p.status === 'em_avaliacao').length,
      avaliados: projetosVisiveis.filter(p => p.status === 'avaliado').length,
      aprovados: projetosVisiveis.filter(p => p.status === 'aprovado').length,
      rejeitados: projetosVisiveis.filter(p => p.status === 'rejeitado').length,
      em_execucao: projetosVisiveis.filter(p => p.status === 'em_execucao').length,
      concluidos: projetosVisiveis.filter(p => p.status === 'concluido').length,
      valor_total: projetosVisiveis.reduce((sum, p) => sum + (p.valor_solicitado || 0), 0)
    };
    return stats;
  };

  useEffect(() => {
    if (editalId) {
      loadProjetos();
    }
  }, [editalId]);

  return {
    projetos,
    loading,
    error,
    updateStatus,
    getStats,
    refresh: loadProjetos
  };
};
