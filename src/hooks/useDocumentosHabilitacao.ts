import { useState, useEffect } from 'react';
import { documentoHabilitacaoService, DocumentoHabilitacao, CreateDocumentoHabilitacaoData, UpdateDocumentoHabilitacaoData } from '@/services/documentoHabilitacaoService';

export const useDocumentosHabilitacao = (projetoId: string) => {
  const [documentos, setDocumentos] = useState<DocumentoHabilitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentoHabilitacaoService.getByProjeto(projetoId);
      setDocumentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const createDocumento = async (data: CreateDocumentoHabilitacaoData) => {
    try {
      const result = await documentoHabilitacaoService.create(data);
      if (result) {
        loadDocumentos();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar documento');
      return false;
    }
  };

  const updateDocumento = async (id: string, data: UpdateDocumentoHabilitacaoData) => {
    try {
      const result = await documentoHabilitacaoService.update(id, data);
      if (result) {
        loadDocumentos();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar documento');
      return false;
    }
  };

  const deleteDocumento = async (id: string) => {
    try {
      const result = await documentoHabilitacaoService.delete(id);
      if (result) {
        loadDocumentos();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar documento');
      return false;
    }
  };

  const gerarDocumentosPadrao = async (tipoProponente: string) => {
    try {
      const result = await documentoHabilitacaoService.gerarDocumentosPadrao(projetoId, tipoProponente);
      if (result.length > 0) {
        loadDocumentos();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar documentos padrão');
      return false;
    }
  };

  const refresh = () => {
    loadDocumentos();
  };

  useEffect(() => {
    if (projetoId) {
      loadDocumentos();
    }
  }, [projetoId]);

  return {
    documentos,
    loading,
    error,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    gerarDocumentosPadrao,
    refresh
  };
};

