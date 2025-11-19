import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePrefeitura } from '@/contexts/PrefeituraContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Edital = Tables<'editais'>;
type ArquivoEdital = Tables<'arquivos_edital'>;

export interface EditalCompleto extends Edital {
  arquivos: ArquivoEdital[];
  total_projetos_inscritos: number;
}

export interface NovoEditalData {
  codigo: string;
  nome: string;
  descricao?: string;
  data_abertura: string;
  data_final_envio_projeto: string;
  horario_final_envio_projeto: string;
  valor_maximo?: number;
  prazo_avaliacao?: number;
  modalidades?: string[];
}

export function useEditais() {
  const [editais, setEditais] = useState<EditalCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { prefeitura } = usePrefeitura();
  const { toast } = useToast();

  // Função para upload com retry
  const uploadComRetry = async (fileName: string, arquivo: File, maxTentativas = 3) => {
    let tentativas = 0;
    
    while (tentativas < maxTentativas) {
      try {
        const { error } = await supabase.storage
          .from('editais')
          .upload(fileName, arquivo);

        return { error };
      } catch (err) {
        tentativas++;
        console.warn(`Tentativa ${tentativas} de upload falhou:`, err);
        
        if (tentativas >= maxTentativas) {
          return { error: err };
        }
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * tentativas));
      }
    }
    
    return { error: new Error('Máximo de tentativas de upload atingido') };
  };

  // Função para fazer rollback em caso de erro
  const fazerRollback = async (editalId: string, arquivosUploadados: string[]) => {
    try {
      console.log('Fazendo rollback para edital:', editalId);
      
      // 1. Remover arquivos do storage
      if (arquivosUploadados.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('editais')
          .remove(arquivosUploadados);
        
        if (storageError) {
          console.error('Erro ao remover arquivos do storage:', storageError);
        }
      }

      // 2. Remover referências dos arquivos do banco
      const { error: arquivosError } = await supabase
        .from('arquivos_edital')
        .delete()
        .eq('edital_id', editalId);

      if (arquivosError) {
        console.error('Erro ao remover referências dos arquivos:', arquivosError);
      }

      // 3. Remover o edital
      const { error: editalError } = await supabase
        .from('editais')
        .delete()
        .eq('id', editalId);

      if (editalError) {
        console.error('Erro ao remover edital:', editalError);
      }

      console.log('Rollback concluído com sucesso');
    } catch (err) {
      console.error('Erro durante rollback:', err);
    }
  };

  // Buscar todos os editais da prefeitura
  const buscarEditais = async () => {
    if (!prefeitura?.id) {
      setError('Prefeitura não identificada');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar editais com contagem de projetos
      const { data: editaisData, error: editaisError } = await supabase
        .from('editais')
        .select(`
          *,
          arquivos_edital(*),
          projetos(count)
        `)
        .eq('prefeitura_id', prefeitura.id)
        .order('created_at', { ascending: false });

      if (editaisError) throw editaisError;

      // Processar dados
      const editaisProcessados = editaisData?.map(edital => ({
        ...edital,
        status: String(edital.status || 'rascunho'), // Garantir que status seja string
        arquivos: edital.arquivos_edital || [],
        total_projetos_inscritos: edital.projetos?.[0]?.count || 0
      })) || [];

      setEditais(editaisProcessados);
    } catch (err) {
      console.error('Erro ao buscar editais:', err);
      setError('Erro ao carregar editais');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os editais',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar novo edital
  const criarEdital = async (dados: NovoEditalData, arquivos: File[] = []) => {
    if (!prefeitura?.id) {
      throw new Error('Prefeitura não identificada');
    }

    let novoEdital: any = null;
    let arquivosUploadados: string[] = [];

    try {
      setLoading(true);

      // 1. Validar se código já existe
      const { data: editalExistente } = await supabase
        .from('editais')
        .select('id')
        .eq('prefeitura_id', prefeitura.id)
        .eq('codigo', dados.codigo)
        .single();

      if (editalExistente) {
        throw new Error('Já existe um edital com este código. Por favor, escolha outro código.');
      }

      // 2. Criar o edital
      const { data: editalData, error: editalError } = await supabase
        .from('editais')
        .insert({
          prefeitura_id: prefeitura.id,
          codigo: dados.codigo,
          nome: dados.nome,
          descricao: dados.descricao,
          data_abertura: dados.data_abertura,
          data_final_envio_projeto: dados.data_final_envio_projeto,
          horario_final_envio_projeto: dados.horario_final_envio_projeto,
          valor_maximo: dados.valor_maximo,
          prazo_avaliacao: dados.prazo_avaliacao,
          modalidades: dados.modalidades,
          status: 'ativo'
        })
        .select()
        .single();

      if (editalError) {
        if (editalError.code === '23505') {
          throw new Error('Já existe um edital com este código. Por favor, escolha outro código.');
        }
        throw editalError;
      }

      novoEdital = editalData;

      // 3. Upload dos arquivos (se houver)
      if (arquivos.length > 0) {
        for (const arquivo of arquivos) {
          try {
            const fileName = `${novoEdital.id}/${arquivo.name}`;
            
            // Upload para Supabase Storage com retry
            const { error: uploadError } = await uploadComRetry(fileName, arquivo);
            
            if (uploadError) {
              throw new Error(`Erro ao fazer upload do arquivo ${arquivo.name}: ${uploadError.message}`);
            }

            arquivosUploadados.push(fileName);

            // Salvar referência no banco
            const { error: arquivoError } = await supabase
              .from('arquivos_edital')
              .insert({
                edital_id: novoEdital.id,
                nome: arquivo.name,
                url: fileName,
                tamanho: arquivo.size,
                tipo_mime: arquivo.type
              });

            if (arquivoError) {
              throw new Error(`Erro ao salvar referência do arquivo ${arquivo.name}: ${arquivoError.message}`);
            }
          } catch (err) {
            // Se falhou no upload, fazer rollback
            await fazerRollback(novoEdital.id, arquivosUploadados);
            throw err;
          }
        }
      }

      // 4. Recarregar lista
      await buscarEditais();

      toast({
        title: 'Edital criado!',
        description: `O edital "${dados.nome}" foi criado com sucesso.`,
      });

      return novoEdital;
    } catch (err) {
      console.error('Erro ao criar edital:', err);
      
      // Se criou o edital mas falhou em algum ponto, fazer rollback
      if (novoEdital) {
        await fazerRollback(novoEdital.id, arquivosUploadados);
      }

      // Toast de erro mais específico
      const errorMessage = err instanceof Error ? err.message : 'Erro interno do servidor';
      toast({
        title: 'Erro ao criar edital',
        description: errorMessage,
        variant: 'destructive'
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar edital
  const atualizarEdital = async (id: string, dados: Partial<NovoEditalData>, arquivos: File[] = []) => {
    try {
      setLoading(true);

      // 1. Atualizar dados do edital
      const { error: editalError } = await supabase
        .from('editais')
        .update({
          nome: dados.nome,
          descricao: dados.descricao,
          data_abertura: dados.data_abertura,
          data_final_envio_projeto: dados.data_final_envio_projeto,
          horario_final_envio_projeto: dados.horario_final_envio_projeto,
          valor_maximo: dados.valor_maximo,
          prazo_avaliacao: dados.prazo_avaliacao,
          modalidades: dados.modalidades,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (editalError) throw editalError;

      // 2. Upload de novos arquivos (se houver)
      if (arquivos.length > 0) {
        const uploadPromises = arquivos.map(async (arquivo) => {
          const fileName = `${id}/${arquivo.name}`;
          const { error: uploadError } = await supabase.storage
            .from('editais')
            .upload(fileName, arquivo);

          if (uploadError) throw uploadError;

          const { error: arquivoError } = await supabase
            .from('arquivos_edital')
            .insert({
              edital_id: id,
              nome: arquivo.name,
              url: fileName,
              tamanho: arquivo.size,
              tipo_mime: arquivo.type
            });

          if (arquivoError) throw arquivoError;
        });

        await Promise.all(uploadPromises);
      }

      // 3. Recarregar lista
      await buscarEditais();

      toast({
        title: 'Edital atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao atualizar edital:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status do edital
  const atualizarStatusEdital = async (id: string, novoStatus: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('editais')
        .update({
          status: novoStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await buscarEditais();

      toast({
        title: 'Status atualizado!',
        description: `O status do edital foi atualizado para "${novoStatus}".`,
      });
    } catch (err) {
      console.error('Erro ao atualizar status do edital:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do edital.',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Arquivar edital
  const arquivarEdital = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('editais')
        .update({
          status: 'arquivado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await buscarEditais();

      toast({
        title: 'Edital arquivado!',
        description: 'O edital foi arquivado com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao arquivar edital:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deletar arquivo do edital
  const deletarArquivo = async (editalId: string, arquivoId: string, url: string) => {
    try {
      // 1. Remover do storage
      const { error: storageError } = await supabase.storage
        .from('editais')
        .remove([url]);

      if (storageError) console.warn('Erro ao remover arquivo do storage:', storageError);

      // 2. Remover referência do banco
      const { error: dbError } = await supabase
        .from('arquivos_edital')
        .delete()
        .eq('id', arquivoId);

      if (dbError) throw dbError;

      await buscarEditais();

      toast({
        title: 'Arquivo removido!',
        description: 'O arquivo foi removido com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao deletar arquivo:', err);
      throw err;
    }
  };

  // Buscar URL pública do arquivo
  const getArquivoUrl = (url: string) => {
    const { data } = supabase.storage
      .from('editais')
      .getPublicUrl(url);
    return data.publicUrl;
  };

  // Função para remover edital órfão (sem arquivos ou com erro)
  const removerEditalOrfao = async (editalId: string) => {
    try {
      // Remover arquivos do storage
      const { data: arquivos } = await supabase
        .from('arquivos_edital')
        .select('url')
        .eq('edital_id', editalId);

      if (arquivos && arquivos.length > 0) {
        const urls = arquivos.map(a => a.url);
        await supabase.storage
          .from('editais')
          .remove(urls);
      }

      // Remover referências dos arquivos
      await supabase
        .from('arquivos_edital')
        .delete()
        .eq('edital_id', editalId);

      // Remover o edital
      await supabase
        .from('editais')
        .delete()
        .eq('id', editalId);

      console.log('Edital órfão removido com sucesso');
    } catch (err) {
      console.error('Erro ao remover edital órfão:', err);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    buscarEditais();
  }, [prefeitura?.id]);

  // Função para validar se edital permite cadastro de projetos
  const podeCadastrarProjetos = (edital: EditalCompleto): boolean => {
    return edital.status === 'recebendo_projetos';
  };

  // Função para validar se edital permite avaliação
  const permiteAvaliacao = (edital: EditalCompleto): boolean => {
    return edital.status === 'avaliacao';
  };

  // Função para validar se edital permite recursos
  const permiteRecursos = (edital: EditalCompleto): boolean => {
    return edital.status === 'recurso' || edital.status === 'contra_razao';
  };

  return {
    editais,
    loading,
    error,
    buscarEditais,
    criarEdital,
    atualizarEdital,
    atualizarStatusEdital,
    arquivarEdital,
    deletarArquivo,
    removerEditalOrfao,
    getArquivoUrl,
    podeCadastrarProjetos,
    permiteAvaliacao,
    permiteRecursos
  };
}
