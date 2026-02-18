import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Building2,
  FileText,
  BarChart3,
  FolderOpen,
  AlertTriangle,
  CreditCard,
  Banknote,
  User,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Plus,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  Archive,
  Trash2,
  ExternalLink,
  Check,
  Search,
  Loader2,
  Paperclip
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { SidebarInset } from "@/components/ui/sidebar";
import { useProjetoDetalhes } from "@/hooks/useProjetoDetalhes";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { usePrestacoesContas } from "@/hooks/usePrestacoesContas";
import { useMovimentacoesFinanceiras } from "@/hooks/useMovimentacoesFinanceiras";
import { useContasMonitoradas } from "@/hooks/useContasMonitoradas";
import { useDocumentosHabilitacao } from "@/hooks/useDocumentosHabilitacao";
import { ProjetoWithDetails } from "@/services/projetoService";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { editalService, Anexo } from "@/services/editalService";
import { useDiligencias } from "@/hooks/useDiligencias";

// Helpers (datas e Gantt)
const formatarData = (data: string | Date) => {
  if (!data) return '';
  const s = typeof data === 'string' ? data : data.toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  }
  return new Date(s).toLocaleDateString('pt-BR');
};

// Funções de tradução
const traduzirGenero = (genero: string) => {
  const generos: { [key: string]: string } = {
    'mulher-cis': 'Mulher cisgênero',
    'homem-cis': 'Homem cisgênero',
    'mulher-trans': 'Mulher transgênero',
    'homem-trans': 'Homem transgênero',
    'nao-binaria': 'Pessoa não binária',
    'nao-informar': 'Não informar',
  };
  return generos[genero] || genero;
};

const traduzirRaca = (raca: string) => {
  const racas: { [key: string]: string } = {
    'branca': 'Branca',
    'preta': 'Preta',
    'parda': 'Parda',
    'indigena': 'Indígena',
    'amarela': 'Amarela',
  };
  return racas[raca] || raca;
};

const traduzirComunidade = (comunidade: string) => {
  const comunidades: { [key: string]: string } = {
    'nao': 'Não pertenço a comunidade tradicional',
    'extrativistas': 'Comunidades extrativistas',
    'ribeirinhas': 'Comunidades ribeirinhas',
    'rurais': 'Comunidades rurais',
    'indigenas': 'Indígenas',
    'ciganos': 'Povos ciganos',
    'pescadores': 'Pescadores(as) artesanais',
    'terreiro': 'Povos de terreiro',
    'quilombolas': 'Quilombolas',
    'outra': 'Outra comunidade tradicional',
  };
  return comunidades[comunidade] || comunidade;
};

const traduzirEscolaridade = (escolaridade: string) => {
  const escolaridades: { [key: string]: string } = {
    'sem-educacao': 'Sem educação formal',
    'fundamental-inc': 'Ensino fundamental incompleto',
    'fundamental-comp': 'Ensino fundamental completo',
    'medio-inc': 'Ensino médio incompleto',
    'medio-comp': 'Ensino médio completo',
    'tecnico': 'Curso técnico completo',
    'superior-inc': 'Ensino superior incompleto',
    'superior-comp': 'Ensino superior completo',
    'pos-comp': 'Pós-graduação completa',
    'pos-inc': 'Pós-graduação incompleta',
  };
  return escolaridades[escolaridade] || escolaridade;
};

const traduzirRenda = (renda: string) => {
  const rendas: { [key: string]: string } = {
    'nenhuma': 'Nenhuma renda',
    'ate-1': 'Até 1 salário mínimo',
    '1-3': 'De 1 a 3 salários mínimos',
    '3-5': 'De 3 a 5 salários mínimos',
    '5-7': 'De 5 a 7 salários mínimos',
    '7-10': 'De 7 a 10 salários mínimos',
    'mais-10': 'Mais de 10 salários mínimos',
  };
  return rendas[renda] || renda;
};

const traduzirProgramaSocial = (programa: string) => {
  const programas: { [key: string]: string } = {
    'bolsa-familia': 'Bolsa Família',
    'bpc': 'Benefício de Prestação Continuada (BPC)',
    'cadunico': 'Cadastro Único (CadÚnico)',
    'bolsa-verde': 'Programa Bolsa Verde',
    'outro': 'Outro',
    'nenhum': 'Nenhum',
  };
  return programas[programa] || programa;
};

const traduzirCotas = (cotas: string) => {
  const cotasMap: { [key: string]: string } = {
    'racial': 'Racial',
    'pcd': 'PCD',
    'social': 'Social',
  };
  return cotasMap[cotas] || cotas;
};

const traduzirFuncaoArtistica = (funcao: string) => {
  const funcoes: { [key: string]: string } = {
    'artista': 'Artista, artesão(a), brincante, criador(a)',
    'instrutor': 'Instrutor(a), oficineiro(a), educador(a)',
    'curador': 'Curador(a), programador(a)',
    'produtor': 'Produtor(a)',
    'gestor': 'Gestor(a)',
    'tecnico': 'Técnico(a)',
    'critico': 'Crítico(a), pesquisador(a)',
    'outro': 'Outro',
  };
  return funcoes[funcao] || funcao;
};

const traduzirDeficiencia = (deficiencia: string) => {
  const deficiencias: { [key: string]: string } = {
    'auditiva': 'Auditiva',
    'fisica': 'Física',
    'intelectual': 'Intelectual',
    'multipla': 'Múltipla',
    'visual': 'Visual',
    'outro': 'Outro',
  };
  return deficiencias[deficiencia] || deficiencia;
};

const toDateOnly = (d: string) => new Date(d + 'T00:00:00');
const diffDays = (a: Date, b: Date) => Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
const etapaColor = (etapa?: string) => {
  switch (etapa) {
    case 'Pré-produção':
      return 'bg-blue-500';
    case 'Produção':
      return 'bg-green-500';
    case 'Pós-produção':
      return 'bg-purple-500';
    case 'Divulgação':
      return 'bg-amber-500';
    default:
      return 'bg-gray-400';
  }
};

export const PrefeituraProjetoDetalhes = () => {
  const { nomePrefeitura, editalId, projetoId } = useParams<{ 
    nomePrefeitura: string; 
    editalId: string; 
    projetoId: string; 
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { prefeitura, user, profile } = usePrefeituraAuth();
  

  // Estados para modal de avaliação
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [showAtribuirPareceristaModal, setShowAtribuirPareceristaModal] = useState(false);
  const [avaliacaoSelecionadaId, setAvaliacaoSelecionadaId] = useState<string>('');
  const [pareceristaSelecionado, setPareceristaSelecionado] = useState('');
  const [pareceristasSelecionados, setPareceristasSelecionados] = useState<string[]>([]);
  const [criandoAvaliacao, setCriandoAvaliacao] = useState(false);

  // Estados para modais de prestação de contas
  const [showVinculacaoModal, setShowVinculacaoModal] = useState(false);
  const [showAprovacaoModal, setShowAprovacaoModal] = useState(false);
  const [showReprovacaoModal, setShowReprovacaoModal] = useState(false);
  const [showExigenciaModal, setShowExigenciaModal] = useState(false);
  const [prestacaoSelecionada, setPrestacaoSelecionada] = useState<string | null>(null);
  const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState('');
  const [parecerAnalise, setParecerAnalise] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [exigencia, setExigencia] = useState('');

  // Estados para OpenBanking
  const [contaSelecionada, setContaSelecionada] = useState<string | null>(null);
  const [showConectarContaModal, setShowConectarContaModal] = useState(false);

  // Estados para modais de documentos de habilitação
  const [showRejeicaoDocModal, setShowRejeicaoDocModal] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<string | null>(null);
  const [motivoRejeicaoDoc, setMotivoRejeicaoDoc] = useState('');

  // Estados para habilitação/aprovação de projeto
  const [showInabilitarProjetoModal, setShowInabilitarProjetoModal] = useState(false);
  const [motivoInabilitacao, setMotivoInabilitacao] = useState('');
  const [showDesclassificarProjetoModal, setShowDesclassificarProjetoModal] = useState(false);
  const [motivoDesclassificacao, setMotivoDesclassificacao] = useState('');
  const [showSuplenteProjetoModal, setShowSuplenteProjetoModal] = useState(false);
  const [processandoAcao, setProcessandoAcao] = useState(false);

  // Estados para Pendências (Solicitação de Documentos)
  const [showPendenciaModal, setShowPendenciaModal] = useState(false);
  const [novaPendenciaTitulo, setNovaPendenciaTitulo] = useState('');
  const [novaPendenciaDescricao, setNovaPendenciaDescricao] = useState('');
  const [novaPendenciaModelo, setNovaPendenciaModelo] = useState<File | null>(null);
  const [enviandoModelo, setEnviandoModelo] = useState(false);

  const {
    projeto,
    loading,
    error,
    updateStatus,
    refresh
  } = useProjetoDetalhes(projetoId || '');

  const [editalAnexos, setEditalAnexos] = useState<Anexo[]>([]);
  const [loadingAnexosEdital, setLoadingAnexosEdital] = useState(false);

  useEffect(() => {
    const fetchEditalAnexos = async () => {
      // Priorizar os dados que já vieram com o projeto (carregados pelo hook useProjetoDetalhes)
      if (projeto?.edital) {
        const editalData = projeto.edital as any;
        let combinedAnexos: Anexo[] = [...(editalData.anexos || [])];
        
        // Se não houver anexos no array, tentar buscar no regulamento (legado)
        if (combinedAnexos.length === 0 && editalData.regulamento && Array.isArray(editalData.regulamento)) {
          editalData.regulamento.forEach((url: string, i: number) => {
            if (url) {
              combinedAnexos.push({
                titulo: `Regulamento ${i + 1}`,
                url,
                tipo: 'pdf'
              });
            }
          });
        }
        
        if (combinedAnexos.length > 0) {
          setEditalAnexos(combinedAnexos);
          return;
        }
      }

      // Se ainda não temos anexos (ou se veio incompleto), tentar o fetch tradicional
      if (projeto?.edital_id) {
        try {
          setLoadingAnexosEdital(true);
          const edital = await editalService.getById(projeto.edital_id);
          let combinedAnexos: Anexo[] = [...(edital?.anexos || [])];
          
          if (combinedAnexos.length === 0 && edital?.regulamento && Array.isArray(edital.regulamento)) {
            edital.regulamento.forEach((url: string, i: number) => {
              if (url) {
                combinedAnexos.push({
                  titulo: `Regulamento ${i + 1}`,
                  url,
                  tipo: 'pdf'
                });
              }
            });
          }
          setEditalAnexos(combinedAnexos);
        } catch (error) {
          console.error('Erro ao buscar anexos do edital:', error);
        } finally {
          setLoadingAnexosEdital(false);
        }
      }
    };

    fetchEditalAnexos();
  }, [projeto?.edital_id, projeto?.edital]);

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      // Fallback para abrir em nova aba se o fetch falhar (ex: CORS)
      window.open(url, '_blank');
    }
  };

  // Funções de Habilitação e Aprovação de Projeto
  const handleHabilitar = async () => {
    try {
      setProcessandoAcao(true);
      const success = await updateStatus('habilitado');
      if (success) {
        toast({
          title: "Projeto Habilitado",
          description: "O projeto foi habilitado com sucesso.",
        });
      }
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleInabilitarProjeto = async () => {
    if (!motivoInabilitacao.trim()) return;
    try {
      setProcessandoAcao(true);
      const success = await updateStatus('nao_habilitado', motivoInabilitacao.trim());
      if (success) {
        toast({
          title: "Projeto Inabilitado",
          description: "O projeto foi inabilitado com sucesso.",
        });
        setShowInabilitarProjetoModal(false);
        setMotivoInabilitacao('');
      }
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleAprovarProjeto = async () => {
    try {
      setProcessandoAcao(true);
      const success = await updateStatus('aprovado');
      if (success) {
        toast({
          title: "Projeto Aprovado",
          description: "O projeto foi aprovado com sucesso.",
        });
      }
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleSuplenteProjeto = async () => {
    try {
      setProcessandoAcao(true);
      const success = await updateStatus('suplente');
      if (success) {
        toast({
          title: "Projeto em Suplência",
          description: "O projeto foi marcado como suplente.",
        });
        setShowSuplenteProjetoModal(false);
      }
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleDesclassificarProjeto = async () => {
    if (!motivoDesclassificacao.trim()) return;
    try {
      setProcessandoAcao(true);
      const success = await updateStatus('desclassificado', motivoDesclassificacao.trim());
      if (success) {
        toast({
          title: "Projeto Desclassificado",
          description: "O projeto foi desclassificado com sucesso.",
        });
        setShowDesclassificarProjetoModal(false);
        setMotivoDesclassificacao('');
      }
    } finally {
      setProcessandoAcao(false);
    }
  };


  const {
    avaliacoes,
    avaliacaoFinal,
    pareceristas,
    loading: loadingAvaliacoes,
    error: errorAvaliacoes,
    createAvaliacao,
    updateAvaliacao,
    deleteAvaliacao,
    refresh: refreshAvaliacoes
  } = useAvaliacoes(projetoId || '', prefeitura?.id || '');

  // Criar uma função wrapper para atribuir pareceristas usando o hook useProjetos
  // Como useProjetos precisa do contexto, vamos usar diretamente o supabase
  const atribuirPareceristaWrapper = async (projetoId: string, pareceristaIds: string | string[]) => {
    if (!prefeitura?.id || !projetoId) {
      throw new Error('Prefeitura ou projeto não identificado');
    }

    const ids = Array.isArray(pareceristaIds) ? pareceristaIds : [pareceristaIds];

    // Buscar projeto para obter prefeitura_id e status
    const { data: projeto, error: projetoFetchError } = await supabase
      .from('projetos')
      .select('prefeitura_id, status')
      .eq('id', projetoId)
      .single();

    if (projetoFetchError) throw projetoFetchError;

    // Verificar se já existe uma avaliação final para este projeto
    let avaliacaoFinalId: string | null = null;
    const { data: avaliacaoFinalExistente } = await supabase
      .from('avaliacoes_final')
      .select('id, status')
      .eq('projeto_id', projetoId)
      .maybeSingle();

    if (avaliacaoFinalExistente) {
      avaliacaoFinalId = (avaliacaoFinalExistente as any).id;
    } else {
      // Criar avaliação final primeiro
      const { data: novaAvaliacaoFinal, error: avaliacaoFinalError } = await (supabase
        .from('avaliacoes_final') as any)
        .insert({
          prefeitura_id: projeto?.prefeitura_id || prefeitura?.id,
          projeto_id: projetoId,
          quantidade_pareceristas: ids.length,
          status: 'pendente'
        })
        .select('id')
        .single();

      if (avaliacaoFinalError) throw avaliacaoFinalError;
      avaliacaoFinalId = novaAvaliacaoFinal.id;
    }

    // Verificar quais pareceristas já têm avaliações
    const { data: avaliacoesExistentes } = await supabase
      .from('avaliacoes')
      .select('parecerista_id, status')
      .eq('projeto_id', projetoId);

    const pareceristasJaAtribuidos = (avaliacoesExistentes as any[])?.map(a => a.parecerista_id) || [];
    const novosPareceristas = ids.filter(id => !pareceristasJaAtribuidos.includes(id));

    // Criar avaliações para os novos pareceristas vinculadas à avaliação final
    if (novosPareceristas.length > 0 && avaliacaoFinalId) {
      const avaliacoesParaCriar = novosPareceristas.map(pareceristaId => ({
        prefeitura_id: projeto?.prefeitura_id || prefeitura?.id,
        projeto_id: projetoId,
        parecerista_id: pareceristaId,
        avaliacao_final_id: avaliacaoFinalId,
        status: 'pendente',
        data_atribuicao: new Date().toISOString()
      }));

      const { error: avaliacoesError } = await (supabase
        .from('avaliacoes') as any)
        .insert(avaliacoesParaCriar);

      if (avaliacoesError) throw avaliacoesError;

      // Atualizar quantidade de pareceristas na avaliação final
      const totalPareceristas = (avaliacoesExistentes?.length || 0) + novosPareceristas.length;
      await (supabase
        .from('avaliacoes_final') as any)
        .update({ 
          quantidade_pareceristas: totalPareceristas,
          updated_at: new Date().toISOString()
        })
        .eq('id', avaliacaoFinalId);

      // Atualizar contador de projetos dos pareceristas
      for (const id of novosPareceristas) {
        // Buscar valor atual
        const { data: pareceristaAtual } = await (supabase
          .from('pareceristas') as any)
          .select('projetos_em_analise')
          .eq('id', id)
          .single();
        
        const novoValor = (pareceristaAtual?.projetos_em_analise || 0) + 1;
        
        await (supabase
          .from('pareceristas') as any)
          .update({ projetos_em_analise: novoValor })
          .eq('id', id);
      }
    }

    // Atualizar status do projeto conforme as avaliações
    const totalAvaliacoes = (avaliacoesExistentes?.length || 0) + novosPareceristas.length;
    if (totalAvaliacoes > 0) {
      const temAvaliacaoIniciada = [...((avaliacoesExistentes as any[]) || []), ...novosPareceristas.map(() => ({ status: 'pendente' }))].some(a => a.status === 'em_avaliacao' || a.status === 'avaliado');
      
      const novoStatusProjeto = temAvaliacaoIniciada ? 'em_avaliacao' : 'aguardando_avaliacao';
      
      if (projeto && (projeto as any).status !== novoStatusProjeto && (projeto as any).status !== 'avaliado' && (projeto as any).status !== 'aprovado' && (projeto as any).status !== 'rejeitado') {
        const { error: projetoError } = await (supabase
          .from('projetos') as any)
          .update({
            status: novoStatusProjeto,
            updated_at: new Date().toISOString()
          })
          .eq('id', projetoId);

        if (projetoError) throw projetoError;
      }
    }
  };

  const {
    prestacoes,
    loading: loadingPrestacoes,
    error: errorPrestacoes,
    createPrestacao,
    updatePrestacao,
    deletePrestacao
  } = usePrestacoesContas(projetoId || '');

  const {
    documentos,
    loading: loadingDocumentos,
    error: errorDocumentos,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    gerarDocumentosPadrao,
    refresh: refreshDocumentos
  } = useDocumentosHabilitacao(projetoId || '');

  const {
    contas,
    loading: loadingContas,
    error: errorContas,
    refresh: refreshContas
  } = useContasMonitoradas(projetoId || '');

  const {
    movimentacoes,
    loading: loadingMovimentacoes,
    error: errorMovimentacoes,
    createMovimentacao,
    updateMovimentacao,
    deleteMovimentacao
  } = useMovimentacoesFinanceiras(projetoId || '', contaSelecionada || undefined);

  const {
    diligencias: pendenciasSolicitadas,
    loading: loadingPendencias,
    createDiligencia,
    deleteDiligencia,
    updateStatusDiligencia,
    refresh: refreshPendencias
  } = useDiligencias(projetoId || '');

  const handleCriarPendencia = async () => {
    if (!novaPendenciaTitulo.trim() || !novaPendenciaDescricao.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a descrição da pendência.",
        variant: "destructive",
      });
      return;
    }

    setEnviandoModelo(true);
    try {
      let modeloUrl = undefined;
      let modeloNome = undefined;

      if (novaPendenciaModelo) {
        const fileExt = novaPendenciaModelo.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `modelos_pendencias/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documentos_habilitacao')
          .upload(filePath, novaPendenciaModelo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documentos_habilitacao')
          .getPublicUrl(filePath);

        modeloUrl = publicUrl;
        modeloNome = novaPendenciaModelo.name;
      }

      const success = await createDiligencia(
        novaPendenciaTitulo.trim(), 
        novaPendenciaDescricao.trim(),
        modeloUrl,
        modeloNome
      );
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Pendência (solicitação de documento) criada com sucesso!",
        });
        setShowPendenciaModal(false);
        setNovaPendenciaTitulo('');
        setNovaPendenciaDescricao('');
        setNovaPendenciaModelo(null);
        refreshPendencias();
      }
    } catch (error: any) {
      console.error('Erro ao criar pendência:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pendência",
        variant: "destructive",
      });
    } finally {
      setEnviandoModelo(false);
    }
  };

  const handleDeletarPendencia = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pendência?')) return;
    
    try {
      const success = await deleteDiligencia(id);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Pendência excluída com sucesso!",
        });
        refreshPendencias();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir pendência",
        variant: "destructive",
      });
    }
  };

  const handleCriarAvaliacao = async () => {
    if (pareceristasSelecionados.length === 0 || !projetoId || !prefeitura?.id) {
      console.warn('Tentativa de criar avaliação com dados incompletos:', { 
        pareceristas: pareceristasSelecionados.length, 
        projetoId, 
        prefeituraId: prefeitura?.id 
      });
      return;
    }

    console.log('Iniciando criação de avaliação:', {
      projetoId,
      pareceristasSelecionados
    });

    try {
      setCriandoAvaliacao(true);
      await atribuirPareceristaWrapper(projetoId, pareceristasSelecionados);
      
      console.log('Avaliações criadas com sucesso');
      toast({
        title: "Avaliações criadas",
        description: `${pareceristasSelecionados.length} parecerista(s) atribuído(s) com sucesso.`,
      });
      setShowAvaliacaoModal(false);
      setPareceristasSelecionados([]);
      refreshAvaliacoes();
    } catch (error: any) {
      console.error('Erro detalhado ao criar avaliação:', error);
      toast({
        title: "Erro ao atribuir parecerista",
        description: error.message || "Não foi possível criar as avaliações. Verifique se o parecerista já está atribuído.",
        variant: "destructive",
      });
    } finally {
      setCriandoAvaliacao(false);
    }
  };

  const handleToggleParecerista = (pareceristaId: string) => {
    setPareceristasSelecionados(prev => {
      if (prev.includes(pareceristaId)) {
        return prev.filter(id => id !== pareceristaId);
      } else {
        return [...prev, pareceristaId];
      }
    });
  };

  const getCategoriaLabel = (modalidade: string) => {
    const labels: Record<string, string> = {
      'musica': 'Música',
      'teatro': 'Teatro',
      'danca': 'Dança',
      'artes_visuais': 'Artes Visuais',
      'literatura': 'Literatura',
      'cinema': 'Cinema',
      'cultura_popular': 'Cultura Popular',
      'circo': 'Circo',
      'outros': 'Outros'
    };
    return labels[modalidade] || modalidade;
  };

  const handleDeletarAvaliacao = async (id: string) => {
    const success = await deleteAvaliacao(id);
    if (success) {
      toast({
        title: "Avaliação removida",
        description: "A avaliação foi removida com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover a avaliação.",
        variant: "destructive",
      });
    }
  };


  const handleAtribuirParecerista = async () => {
    if (!pareceristaSelecionado || !avaliacaoSelecionadaId) return;

    const success = await updateAvaliacao(avaliacaoSelecionadaId, {
      parecerista_id: pareceristaSelecionado,
      status: 'pendente'
    });

    if (success) {
      toast({
        title: "Parecerista atribuído",
        description: "O parecerista foi atribuído à avaliação com sucesso.",
      });
      setShowAtribuirPareceristaModal(false);
      setPareceristaSelecionado('');
      setAvaliacaoSelecionadaId('');
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o parecerista.",
        variant: "destructive",
      });
    }
  };

  const getAvaliacaoStatusConfig = (status: string) => {
    const configs = {
      'aguardando_parecerista': { label: 'Aguardando Parecerista', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
      'pendente': { label: 'Pendente', color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle className="h-4 w-4" /> },
      'em_avaliacao': { label: 'Em Avaliação', color: 'bg-blue-100 text-blue-800', icon: <Edit className="h-4 w-4" /> },
      'avaliado': { label: 'Avaliado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> }
    };
    return configs[status as keyof typeof configs] || { label: status, color: 'bg-gray-100 text-gray-800', icon: <FileText className="h-4 w-4" /> };
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'rascunho': { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: <FileText className="h-4 w-4" /> },
      'aguardando_parecerista': { label: 'Aguardando Parecerista', color: 'bg-orange-100 text-orange-800', icon: <Clock className="h-4 w-4" /> },
      'aguardando_avaliacao': { label: 'Aguardando Avaliação', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
      'recebido': { label: 'Recebido', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4" /> },
      'em_avaliacao': { label: 'Em Avaliação', color: 'bg-orange-100 text-orange-800', icon: <Search className="h-4 w-4" /> },
      'avaliado': { label: 'Avaliado', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="h-4 w-4" /> },
      'habilitado': { label: 'Habilitado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      'nao_habilitado': { label: 'Não Habilitado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
      'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      'rejeitado': { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
      'suplente': { label: 'Suplente', color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-4 w-4" /> },
      'desclassificado': { label: 'Desclassificado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
      'em_execucao': { label: 'Em Execução', color: 'bg-purple-100 text-purple-800', icon: <PlayCircle className="h-4 w-4" /> },
      'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> }
    };
    return configs[status as keyof typeof configs] || configs['rascunho'];
  };

  // Funções para prestação de contas
  const handleVincularMovimentacao = async () => {
    if (!prestacaoSelecionada || !movimentacaoSelecionada) return;

    const success = await updatePrestacao(prestacaoSelecionada, {
      movimentacao_financeira_id: movimentacaoSelecionada,
      status_open_banking: 'conforme' as const
    });

    if (success) {
      toast({
        title: "Sucesso",
        description: "Prestação de contas vinculada à movimentação financeira!",
      });
      setShowVinculacaoModal(false);
      setPrestacaoSelecionada(null);
      setMovimentacaoSelecionada('');
    } else {
      toast({
        title: "Erro",
        description: "Erro ao vincular prestação de contas.",
        variant: "destructive",
      });
    }
  };

  const handleAprovarPrestacao = async () => {
    if (!prestacaoSelecionada || !parecerAnalise.trim()) return;

    const success = await updatePrestacao(prestacaoSelecionada, {
      status: 'aprovado',
      parecer_analise: parecerAnalise.trim(),
      analisado_por: profile?.id,
      data_analise: new Date().toISOString(),
      exigencia: null,  // Limpa exigência ao aprovar
      motivo_rejeicao: null  // Limpa motivo de rejeição ao aprovar
    });

    if (success) {
      toast({
        title: "Sucesso",
        description: "Prestação de contas aprovada!",
      });
      setShowAprovacaoModal(false);
      setPrestacaoSelecionada(null);
      setParecerAnalise('');
    } else {
      toast({
        title: "Erro",
        description: "Erro ao aprovar prestação de contas.",
        variant: "destructive",
      });
    }
  };

  const handleReprovarPrestacao = async () => {
    if (!prestacaoSelecionada || !motivoRejeicao.trim()) return;

    const success = await updatePrestacao(prestacaoSelecionada, {
      status: 'rejeitado',
      motivo_rejeicao: motivoRejeicao.trim(),
      analisado_por: profile?.id,
      data_analise: new Date().toISOString()
    });

    if (success) {
      toast({
        title: "Sucesso",
        description: "Prestação de contas reprovada!",
      });
      setShowReprovacaoModal(false);
      setPrestacaoSelecionada(null);
      setMotivoRejeicao('');
    } else {
      toast({
        title: "Erro",
        description: "Erro ao reprovar prestação de contas.",
        variant: "destructive",
      });
    }
  };

  const handleExigirPrestacao = async () => {
    if (!prestacaoSelecionada || !exigencia.trim()) return;

    const success = await updatePrestacao(prestacaoSelecionada, {
      status: 'exigencia',
      exigencia: exigencia.trim(),
      analisado_por: profile?.id,
      data_analise: new Date().toISOString()
    });

    if (success) {
      toast({
        title: "Sucesso",
        description: "Exigência enviada para a prestação de contas!",
      });
      setShowExigenciaModal(false);
      setPrestacaoSelecionada(null);
      setExigencia('');
    } else {
      toast({
        title: "Erro",
        description: "Erro ao enviar exigência.",
        variant: "destructive",
      });
    }
  };

  const getOpenBankingStatusConfig = (status: string) => {
    const configs = {
      'nao_monitorado': { label: 'Não Monitorado', color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="h-4 w-4" /> },
      'monitorado': { label: 'Monitorado', color: 'bg-blue-100 text-blue-800', icon: <Eye className="h-4 w-4" /> },
      'conforme': { label: 'Conforme', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      'inconsistente': { label: 'Inconsistente', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> }
    };
    return configs[status as keyof typeof configs] || configs['nao_monitorado'];
  };

  // Funções para documentos de habilitação
  const handleAprovarDocumento = async (docId: string) => {
    const success = await updateDocumento(docId, {
      status: 'aprovado'
    });

    if (success) {
      toast({
        title: "Sucesso",
        description: "Documento aprovado!",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao aprovar documento.",
        variant: "destructive",
      });
    }
  };

  const handleRejeitarDocumento = async () => {
    if (!documentoSelecionado || !motivoRejeicaoDoc.trim()) return;

    const success = await updateDocumento(documentoSelecionado, {
      status: 'rejeitado',
      descricao: motivoRejeicaoDoc.trim()
    });

    if (success) {
      toast({
        title: "Sucesso",
        description: "Documento rejeitado!",
      });
      setShowRejeicaoDocModal(false);
      setDocumentoSelecionado(null);
      setMotivoRejeicaoDoc('');
    } else {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar documento.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <PrefeituraLayout 
        title="Detalhes do Projeto" 
        description="Visualize os detalhes completos do projeto"
      >
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar projeto: {error}</p>
            <Button onClick={refresh} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </PrefeituraLayout>
    );
  }

  if (loading) {
    return (
      <PrefeituraLayout 
        title="Detalhes do Projeto" 
        description="Visualize os detalhes completos do projeto"
      >
        <div className="p-6">
          <div className="text-center">
            <p>Carregando detalhes do projeto...</p>
          </div>
        </div>
      </PrefeituraLayout>
    );
  }

  if (!projeto) {
    return (
      <PrefeituraLayout 
        title="Detalhes do Projeto" 
        description="Visualize os detalhes completos do projeto"
      >
        <div className="p-6">
          <div className="text-center">
            <p>Projeto não encontrado.</p>
            <Button 
              onClick={() => navigate(`/${nomePrefeitura}/editais/${editalId}/projetos`)}
              className="mt-4"
            >
              Voltar para Projetos
            </Button>
          </div>
        </div>
      </PrefeituraLayout>
    );
  }

  const statusConfig = getStatusConfig(projeto.status);

  return (
    <PrefeituraLayout 
      title="Detalhes do Projeto" 
      description="Visualize os detalhes completos do projeto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/${nomePrefeitura}/editais/${editalId}/projetos`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Projetos
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{projeto.nome}</h1>
              <p className="text-gray-600 mt-1">{projeto.edital?.nome} - {projeto.edital?.codigo}</p>
            </div>
            <Badge className={`${statusConfig.color} flex items-center gap-2`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="informacoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="informacoes">Informações Gerais</TabsTrigger>
            <TabsTrigger value="avaliacao" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Avaliação
            </TabsTrigger>
            <TabsTrigger value="pendencias" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Pendências
              {pendenciasSolicitadas.filter(d => d.status === 'respondido').length > 0 && (
                <Badge className="bg-blue-500 ml-1 px-1 min-w-[1.2rem] h-5">
                  {pendenciasSolicitadas.filter(d => d.status === 'respondido').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documentacao" className="gap-2">
              Documentação
            </TabsTrigger>
            <TabsTrigger value="prestacao">Prestação de Contas</TabsTrigger>
            <TabsTrigger value="openbanking">OpenBanking</TabsTrigger>
          </TabsList>

          {/* Informações Gerais */}
          <TabsContent value="informacoes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome do Projeto</label>
                    <p className="text-sm font-medium">{projeto.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Inscrição Municipal</label>
                    <p className="text-sm">{(projeto.proponente as any).inscricao_municipal || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Inscrição Estadual</label>
                    <p className="text-sm">{projeto.proponente.inscricao_estadual || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">E-mail</label>
                    <p className="text-sm">{(projeto.proponente as any).email_responsavel || (projeto.proponente as any).telefone_responsavel ? '' : 'Não informado'}</p>
                    <p className="text-sm">{(projeto.proponente as any).email_responsavel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Categoria</label>
                    <p className="text-sm">{projeto.modalidade}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Descrição</label>
                    <p className="text-sm">{projeto.descricao}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Objetivos</label>
                    <p className="text-sm">{projeto.objetivos}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusConfig(projeto.status).color}>
                        {getStatusConfig(projeto.status).icon}
                        <span className="ml-1">{getStatusConfig(projeto.status).label}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Inscrição</label>
                    <p className="text-sm">{projeto.numero_inscricao || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome</label>
                    <p className="text-sm font-medium">{(projeto.proponente as any).nome_responsavel || 'Não informado'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Público e Acessibilidade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Público e Acessibilidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Perfil do Público</label>
                    <p className="text-sm">{projeto.perfil_publico || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CPF</label>
                    <p className="text-sm">{(projeto.proponente as any).cpf_responsavel || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Público Prioritário</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {projeto.publico_prioritario && projeto.publico_prioritario.length > 0 ? (
                        projeto.publico_prioritario.map((publico, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {publico}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Não informado</span>
                      )}
                    </div>
                  </div>
                  {projeto.outro_publico_prioritario && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Outro Público Prioritário</label>
                      <p className="text-sm">{projeto.outro_publico_prioritario}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Acessibilidade Arquitetônica</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {projeto.acessibilidade_arquitetonica && projeto.acessibilidade_arquitetonica.length > 0 ? (
                        projeto.acessibilidade_arquitetonica.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Não informado</span>
                      )}
                    </div>
                  </div>
                  {projeto.outra_acessibilidade_arquitetonica && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Outra Acessibilidade Arquitetônica</label>
                      <p className="text-sm">{projeto.outra_acessibilidade_arquitetonica}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Acessibilidade Comunicacional e Atitudinal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Acessibilidade Comunicacional e Atitudinal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Acessibilidade Comunicacional</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {projeto.acessibilidade_comunicacional && projeto.acessibilidade_comunicacional.length > 0 ? (
                        projeto.acessibilidade_comunicacional.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Não informado</span>
                      )}
                    </div>
                  </div>
                  {projeto.outra_acessibilidade_comunicacional && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Outra Acessibilidade Comunicacional</label>
                      <p className="text-sm">{projeto.outra_acessibilidade_comunicacional}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Acessibilidade Atitudinal</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {projeto.acessibilidade_atitudinal && projeto.acessibilidade_atitudinal.length > 0 ? (
                        projeto.acessibilidade_atitudinal.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Não informado</span>
                      )}
                    </div>
                  </div>
                  {projeto.implementacao_acessibilidade && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Implementação de Acessibilidade</label>
                      <p className="text-sm">{projeto.implementacao_acessibilidade}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cronograma e Local */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Cronograma e Local
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Local de Execução</label>
                    <p className="text-sm">{projeto.local_execucao || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Início</label>
                    <p className="text-sm">
                      {projeto.data_inicio ? new Date(projeto.data_inicio).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                    <p className="text-sm">{(projeto.proponente as any).data_nascimento_responsavel ? formatarData((projeto.proponente as any).data_nascimento_responsavel) : 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Final</label>
                    <p className="text-sm">
                      {projeto.data_final ? new Date(projeto.data_final).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Submissão</label>
                    <p className="text-sm">
                      {projeto.data_submissao ? new Date(projeto.data_submissao).toLocaleDateString('pt-BR') : 'Não submetido'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estratégia de Divulgação</label>
                    <p className="text-sm">{projeto.estrategia_divulgacao || 'Não informado'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Proponente - detalhado */}
              <Card className={`col-span-1 lg:col-span-2 ${projeto.proponente?.tipo === "PF" ? "border-l-4 border-l-blue-600" : "border-l-4 border-l-green-600"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Proponente
                    {projeto.proponente?.tipo && (
                      <Badge 
                        variant={projeto.proponente.tipo === "PF" ? "default" : "secondary"}
                        className={`text-xs ${projeto.proponente.tipo === "PF" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}
                      >
                        {projeto.proponente.tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nome principal */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{projeto.proponente?.nome || 'Não informado'}</h3>
                    {projeto.proponente?.nome_artistico && (
                      <p className="text-sm text-gray-600 italic">Nome artístico: {projeto.proponente.nome_artistico}</p>
                    )}
                    {projeto.proponente?.razao_social && (
                      <p className="text-sm text-gray-600 italic">Razão Social: {projeto.proponente.razao_social}</p>
                    )}
                  </div>

                  {/* Dados de Identificação */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                    {projeto.proponente?.cpf && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium block">CPF:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.cpf}</p>
                      </div>
                    )}
                    {projeto.proponente?.cnpj && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium block">CNPJ:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.cnpj}</p>
                      </div>
                    )}
                    {projeto.proponente?.rg && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium block">RG:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.rg}</p>
                      </div>
                    )}
                    {projeto.proponente?.data_nascimento && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium block">Data de Nascimento:</span>
                        <p className="text-sm text-gray-700">{formatarData(projeto.proponente.data_nascimento)}</p>
                      </div>
                    )}
                  </div>

                  {/* Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {projeto.proponente?.telefone && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium block">Telefone:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.telefone}</p>
                      </div>
                    )}
                    {projeto.proponente?.email && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium block">Email:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Endereço */}
                  {projeto.proponente?.endereco && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Endereço</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                          {projeto.proponente.endereco}
                        </p>
                        <p className="text-sm text-gray-700">
                          {[
                            projeto.proponente.cidade,
                            projeto.proponente.estado,
                            projeto.proponente.cep
                          ].filter(Boolean).join(' - ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dados Pessoais PF */}
                  {projeto.proponente?.tipo === "PF" && (
                    <>
                      {(projeto.proponente.comunidade_tradicional || projeto.proponente.genero || projeto.proponente.raca || projeto.proponente.escolaridade || projeto.proponente.renda_mensal) && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Dados Pessoais</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projeto.proponente.comunidade_tradicional && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Comunidade Tradicional:</span>
                                <p className="text-sm text-gray-700">{traduzirComunidade(projeto.proponente.comunidade_tradicional)}</p>
                              </div>
                            )}
                            {projeto.proponente.genero && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Gênero:</span>
                                <p className="text-sm text-gray-700">{traduzirGenero(projeto.proponente.genero)}</p>
                              </div>
                            )}
                            {projeto.proponente.raca && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Raça/Cor:</span>
                                <p className="text-sm text-gray-700">{traduzirRaca(projeto.proponente.raca)}</p>
                              </div>
                            )}
                            {projeto.proponente.escolaridade && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Escolaridade:</span>
                                <p className="text-sm text-gray-700">{traduzirEscolaridade(projeto.proponente.escolaridade)}</p>
                              </div>
                            )}
                            {projeto.proponente.renda_mensal && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Renda Mensal:</span>
                                <p className="text-sm text-gray-700">{traduzirRenda(projeto.proponente.renda_mensal)}</p>
                              </div>
                            )}
                            {projeto.proponente.pcd && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">PCD:</span>
                                <p className="text-sm text-gray-700">Sim{projeto.proponente.tipo_deficiencia && ` - ${traduzirDeficiencia(projeto.proponente.tipo_deficiencia)}`}</p>
                              </div>
                            )}
                            {projeto.proponente.programa_social && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Programa Social:</span>
                                <p className="text-sm text-gray-700">{traduzirProgramaSocial(projeto.proponente.programa_social)}</p>
                              </div>
                            )}
                            {projeto.proponente.concorre_cotas && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Concorre Cotas:</span>
                                <p className="text-sm text-gray-700">Sim{projeto.proponente.tipo_cotas && ` - ${traduzirCotas(projeto.proponente.tipo_cotas)}`}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Atividade Artística */}
                      {(projeto.proponente.funcao_artistica || projeto.proponente.representa_coletivo) && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Atividade Artística</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projeto.proponente.funcao_artistica && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Função:</span>
                                <p className="text-sm text-gray-700">{traduzirFuncaoArtistica(projeto.proponente.funcao_artistica)}</p>
                              </div>
                            )}
                            {projeto.proponente.representa_coletivo && projeto.proponente.nome_coletivo && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Coletivo:</span>
                                <p className="text-sm text-gray-700">{projeto.proponente.nome_coletivo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Currículo */}
                      {projeto.proponente.mini_curriculo && (
                        <div className="pt-4 border-t">
                          <span className="text-xs text-gray-500 font-medium block mb-2">Mini Currículo:</span>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{projeto.proponente.mini_curriculo}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Dados PJ */}
                  {projeto.proponente?.tipo === "PJ" && (
                    <>
                      {projeto.proponente.inscricao_estadual && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Inscrições</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs text-gray-500 font-medium block">Inscrição Estadual:</span>
                              <p className="text-sm text-gray-700">{projeto.proponente.inscricao_estadual}</p>
                            </div>
                            {projeto.proponente.inscricao_municipal && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Inscrição Municipal:</span>
                                <p className="text-sm text-gray-700">{projeto.proponente.inscricao_municipal}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Representante Legal */}
                      {(projeto.proponente.nome_responsavel || projeto.proponente.cpf_responsavel || projeto.proponente.cargo_responsavel) && (
                        <div className="pt-4 border-t">
                          <CardDescription>
                  Dados do representante legal {(projeto.proponente as any).nome_responsavel && `(${(projeto.proponente as any).cpf_responsavel})`} - {(projeto.proponente as any).cargo_responsavel}
                </CardDescription>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Representante Legal</h4>
                          <div className="space-y-4">
                            {/* Dados Básicos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {projeto.proponente.nome_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">Nome:</span>
                                  <p className="text-sm text-gray-700">{projeto.proponente.nome_responsavel}</p>
                                </div>
                              )}
                              {projeto.proponente.cpf_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">CPF:</span>
                                  <p className="text-sm text-gray-700">{projeto.proponente.cpf_responsavel}</p>
                                </div>
                              )}
                              {projeto.proponente.rg_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">RG:</span>
                                  <p className="text-sm text-gray-700">{projeto.proponente.rg_responsavel}</p>
                                </div>
                              )}
                              {projeto.proponente.data_nascimento_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">Data de Nascimento:</span>
                                  <p className="text-sm text-gray-700">{formatarData(projeto.proponente.data_nascimento_responsavel)}</p>
                                </div>
                              )}
                              {projeto.proponente.cargo_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">Cargo:</span>
                                  <p className="text-sm text-gray-700">{projeto.proponente.cargo_responsavel}</p>
                                </div>
                              )}
                            </div>

                            {/* Contato */}
                            {(projeto.proponente.email_responsavel || projeto.proponente.telefone_responsavel) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                {projeto.proponente.email_responsavel && (
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500 font-medium block">Email:</span>
                                    <p className="text-sm text-gray-700">{projeto.proponente.email_responsavel}</p>
                                  </div>
                                )}
                                {projeto.proponente.telefone_responsavel && (
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500 font-medium block">Telefone:</span>
                                    <p className="text-sm text-gray-700">{projeto.proponente.telefone_responsavel}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Endereço */}
                            {projeto.proponente.endereco_responsavel && (
                              <div className="pt-4 border-t">
                                <h5 className="text-xs font-semibold text-gray-600 mb-2">Endereço</h5>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-700">
                                  <div className="flex gap-2">
                      <p className="text-sm">{(projeto.proponente as any).endereco_responsavel},</p>
                      <p className="text-sm">{(projeto.proponente as any).numero_responsavel}</p>
                      <p className="text-sm">{(projeto.proponente as any).complemento_responsavel}</p>
                    </div>
                                  </p>
                                  <p className="text-sm text-gray-700">
                                  <div className="flex gap-2">
                      <p className="text-sm">{(projeto.proponente as any).cidade_responsavel} -</p>
                      <p className="text-sm">{(projeto.proponente as any).estado_responsavel}</p>
                      <p className="text-sm">{(projeto.proponente as any).cep_responsavel}</p>
                    </div>
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Dados Pessoais */}
                            {(projeto.proponente.comunidade_tradicional_responsavel || projeto.proponente.genero_responsavel || projeto.proponente.raca_responsavel || projeto.proponente.escolaridade_responsavel || projeto.proponente.renda_mensal_responsavel) && (
                              <div className="pt-4 border-t">
                                <CardDescription>
                  Dados sociais do representante legal {(projeto.proponente as any).comunidade_tradicional_responsavel}, {(projeto.proponente as any).genero_responsavel}, {(projeto.proponente as any).raca_responsavel}, {(projeto.proponente as any).escolaridade_responsavel}, {(projeto.proponente as any).renda_mensal_responsavel}
                </CardDescription>
                                <h5 className="text-xs font-semibold text-gray-600 mb-3">Dados Pessoais</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {projeto.proponente.comunidade_tradicional_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Comunidade Tradicional:</span>
                                      <p className="text-sm text-gray-700">{traduzirComunidade(projeto.proponente.comunidade_tradicional_responsavel)}</p>
                                    </div>
                                  )}
                                  {projeto.proponente.genero_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Gênero:</span>
                                      <p className="text-sm text-gray-700">{traduzirGenero(projeto.proponente.genero_responsavel)}</p>
                                    </div>
                                  )}
                                  {projeto.proponente.raca_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Raça/Cor:</span>
                                      <p className="text-sm text-gray-700">{traduzirRaca(projeto.proponente.raca_responsavel)}</p>
                                    </div>
                                  )}
                                  {projeto.proponente.escolaridade_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Escolaridade:</span>
                                      <p className="text-sm text-gray-700">{traduzirEscolaridade(projeto.proponente.escolaridade_responsavel)}</p>
                                    </div>
                                  )}
                                  {projeto.proponente.renda_mensal_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Renda Mensal:</span>
                                      <p className="text-sm text-gray-700">{traduzirRenda(projeto.proponente.renda_mensal_responsavel)}</p>
                                    </div>
                                  )}
                                  {projeto.proponente.pcd_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">PCD:</span>
                                      <p className="text-sm text-gray-700">Sim{projeto.proponente.tipo_deficiencia_responsavel && ` - ${traduzirDeficiencia(projeto.proponente.tipo_deficiencia_responsavel)}`}</p>
                                    </div>
                                  )}
                                  {projeto.proponente.programa_social_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Programa Social:</span>
                                      <p className="text-sm text-gray-700">{traduzirProgramaSocial(projeto.proponente.programa_social_responsavel)}</p>
                                    </div>
                                  )}
                                  {projeto.proponente.concorre_cotas_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Concorre Cotas:</span>
                                      <p className="text-sm text-gray-700">Sim{projeto.proponente.tipo_cotas_responsavel && ` - ${traduzirCotas(projeto.proponente.tipo_cotas_responsavel)}`}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Atividade Artística */}
                            {(projeto.proponente.funcao_artistica_responsavel || projeto.proponente.profissao_responsavel) && (
                              <div className="pt-4 border-t">
                                <CardDescription>
                  Dados profissionais do representante legal {(projeto.proponente as any).funcao_artistica_responsavel} - {(projeto.proponente as any).profissao_responsavel}
                </CardDescription>
                                <h5 className="text-xs font-semibold text-gray-600 mb-3">Atividade Profissional</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {projeto.proponente.funcao_artistica_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Função Artística:</span>
                                      <p className="text-sm text-gray-700">{traduzirFuncaoArtistica(projeto.proponente.funcao_artistica_responsavel)}</p>
                                    </div>
                                  )}
                                  {projeto.proponente.profissao_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Profissão:</span>
                                      <p className="text-sm text-gray-700">{projeto.proponente.profissao_responsavel}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Currículo */}
                            {projeto.proponente.mini_curriculo_responsavel && (
                              <div className="pt-4 border-t">
                                <span className="text-xs text-gray-500 font-medium block mb-2">Mini Currículo:</span>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{projeto.proponente.mini_curriculo_responsavel}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Grid Valor e Financiamento + Orçamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Valor e Financiamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Solicitado</label>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {projeto.valor_solicitado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Outras Fontes de Financiamento</label>
                    <p className="text-sm">{projeto.outras_fontes ? 'Sim' : 'Não'}</p>
                  </div>
                  {projeto.outras_fontes && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tipos de Outras Fontes</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {projeto.tipos_outras_fontes && projeto.tipos_outras_fontes.length > 0 ? (
                            projeto.tipos_outras_fontes.map((tipo, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tipo}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Não especificado</span>
                          )}
                        </div>
                      </div>
                      {projeto.detalhes_outras_fontes && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Detalhes das Outras Fontes</label>
                          <p className="text-sm">{projeto.detalhes_outras_fontes}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Venda de Produtos</label>
                    <p className="text-sm">{projeto.venda_produtos ? 'Sim' : 'Não'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Comunidade Tradicional</label>
                    <p className="text-sm">{traduzirComunidade((projeto.proponente as any).comunidade_tradicional_responsavel || '')}</p>
                  </div>
                  {projeto.venda_produtos && projeto.detalhes_venda_produtos && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Detalhes da Venda de Produtos</label>
                      <p className="text-sm">{projeto.detalhes_venda_produtos}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Necessita Comprovante de Residência</label>
                    <p className="text-sm">{projeto.necessita_comprovante_residencia ? 'Sim' : 'Não'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Orçamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Orçamento Detalhado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projeto.orcamento && projeto.orcamento.length > 0 ? (
                    <div className="space-y-3">
                      {projeto.orcamento.map((item, index) => (
                        <div key={item.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.descricao}</p>
                            <p className="text-sm text-gray-500">{item.justificativa}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {item.quantidade} {item.unidade_medida} × R$ {item.valor_unitario.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <p className="font-medium">R$ {(item.valor_unitario * item.quantidade).toLocaleString('pt-BR')}</p>
                        </div>
                      ))}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>R$ {projeto.orcamento.reduce((sum, item) => sum + (item.valor_unitario * item.quantidade), 0).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nenhum item de orçamento cadastrado.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Equipe - detalhada */}
            {projeto.equipe && projeto.equipe.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Equipe do Projeto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projeto.equipe.map((membro: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{membro.nome}</p>
                            <p className="text-sm text-gray-500">{membro.funcao}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          <p><span className="font-medium">CPF/CNPJ:</span> {membro.cpf_cnpj || '—'}</p>
                          <div className="flex flex-wrap gap-2">
                            {membro.indigena && <Badge variant="outline">Indígena</Badge>}
                            {membro.lgbtqiapn && <Badge variant="outline">LGBTQIAPN+</Badge>}
                            {membro.preto_pardo && <Badge variant="outline">Preto/Pardo</Badge>}
                            {membro.deficiencia && <Badge variant="outline">PCD</Badge>}
                          </div>
                        </div>
                        {membro.mini_curriculo && (
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{membro.mini_curriculo}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Atividades com Gantt + lista */}
            {projeto.atividades && projeto.atividades.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Atividades Planejadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const atividades: any[] = projeto.atividades as any[];
                    const inicioMin = atividades.reduce((min, a) => {
                      const d = toDateOnly(a.data_inicio);
                      return !min || d < min ? d : min;
                    }, null as Date | null) as Date;
                    const fimMax = atividades.reduce((max, a) => {
                      const d = toDateOnly(a.data_fim);
                      return !max || d > max ? d : max;
                    }, null as Date | null) as Date;
                    const totalDias = Math.max(1, diffDays(inicioMin, fimMax) + 1);

                    return (
                      <div className="space-y-4">
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <span>{formatarData(inicioMin)}</span>
                          <span>{formatarData(fimMax)}</span>
                        </div>
                        <div className="relative w-full border rounded-md p-3">
                          <div className="relative" style={{ height: `${atividades.length * 56}px` }}>
                            {atividades.map((a, i) => {
                              const ini = toDateOnly(a.data_inicio);
                              const fim = toDateOnly(a.data_fim);
                              const leftPct = (diffDays(inicioMin, ini) / totalDias) * 100;
                              const widthPct = (Math.max(1, diffDays(ini, fim) + 1) / totalDias) * 100;
                              return (
                                <div key={i} className="absolute left-0 right-0" style={{ top: `${i * 56}px` }}>
                                  <div className="flex items-center justify-between mb-1 pr-2">
                                    <div className="font-medium text-sm truncate max-w-[60%]">
                                      {(a as any).nome_atividade || (a as any).nome}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatarData(a.data_inicio)} - {formatarData(a.data_fim)}
                                    </div>
                                  </div>
                                  <div className="relative h-3 w-full bg-gray-100 rounded">
                                    <div
                                      className={`absolute h-3 rounded ${etapaColor((a as any).etapa)}`}
                                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                    />
                                  </div>
                                  {a.descricao && (
                                    <div className="text-xs text-gray-600 mt-1 truncate">{a.descricao}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          {['Pré-produção','Produção','Pós-produção','Divulgação'].map((e) => (
                            <div key={e} className="flex items-center gap-2">
                              <span className={`inline-block w-3 h-3 rounded ${etapaColor(e)}`}></span>
                              <span>{e}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {atividades.map((a, i) => (
                            <div key={`list-${i}`} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium">{(a as any).nome_atividade || (a as any).nome}</h4>
                                <div className="text-sm text-gray-500">
                                  {formatarData(a.data_inicio)} - {formatarData(a.data_fim)}
                                </div>
                              </div>
                              {(a as any).etapa && (
                                <p className="text-xs text-gray-500 mb-1">Etapa: {(a as any).etapa}</p>
                              )}
                              {a.descricao && (
                                <p className="text-sm text-gray-600">{a.descricao}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Metas */}
            {projeto.metas && projeto.metas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Metas do Projeto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projeto.metas.map((meta, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{meta.nome}</h4>
                          <span className="text-sm font-medium">{meta.valor_meta} {meta.indicador}</span>
                        </div>
                        <p className="text-sm text-gray-600">{meta.descricao}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Avaliação */}
          <TabsContent value="avaliacao" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Avaliações do Projeto
                    </CardTitle>
                    <CardDescription>
                      Histórico de avaliações e pareceres técnicos
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAvaliacaoModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Avaliação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAvaliacoes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Carregando avaliações...</p>
                  </div>
                ) : errorAvaliacoes ? (
                  <div className="text-center py-8 text-red-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Erro ao carregar avaliações: {errorAvaliacoes}</p>
                    <Button onClick={refreshAvaliacoes} className="mt-4">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : avaliacoes.length === 0 && !avaliacaoFinal ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma avaliação no momento.</p>
                    <p className="text-sm">Clique em "Nova Avaliação" para atribuir um parecerista.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Avaliações Individuais dos Pareceristas */}
                    {avaliacoes.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Avaliações Individuais</h3>
                        <div className="space-y-4">
                          {avaliacoes.map((avaliacao) => {
                      const statusConfig = getAvaliacaoStatusConfig(avaliacao.status);
                      return (
                        <div key={avaliacao.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  Parecerista: {avaliacao.parecerista_nome}
                                </h4>
                                <Badge className={statusConfig.color}>
                                  {statusConfig.icon}
                                  <span className="ml-1">{statusConfig.label}</span>
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                                <div>
                                  <span className="font-medium">Atribuído em:</span>
                                  <p>{new Date(avaliacao.data_atribuicao).toLocaleDateString('pt-BR')}</p>
                                </div>
                                {avaliacao.data_inicio_avaliacao && avaliacao.data_conclusao && (
                                  <div>
                                    <span className="font-medium">Tempo de avaliação:</span>
                                    <p>{(() => {
                                      const inicio = new Date(avaliacao.data_inicio_avaliacao);
                                      const fim = new Date(avaliacao.data_conclusao);
                                      const diffMs = fim.getTime() - inicio.getTime();
                                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                      
                                      if (diffDays > 0) {
                                        return `${diffDays} dia${diffDays > 1 ? 's' : ''} ${diffHours}h ${diffMinutes}min`;
                                      } else if (diffHours > 0) {
                                        return `${diffHours}h ${diffMinutes}min`;
                                      } else {
                                        return `${diffMinutes}min`;
                                      }
                                    })()}</p>
                                  </div>
                                )}
                                {avaliacao.nota_final && (
                                  <div>
                                    <span className="font-medium">Nota Final:</span>
                                    <p className="font-bold text-lg">{avaliacao.nota_final.toFixed(1)}</p>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Status:</span>
                                  <p className="font-medium">{statusConfig.label}</p>
                                </div>
                              </div>
                              

                              {/* Notas detalhadas - Critérios Obrigatórios */}
                              {(() => {
                                const temCriteriosPreenchidos = [
                                  (avaliacao as any).nota_criterio_a,
                                  (avaliacao as any).nota_criterio_b,
                                  (avaliacao as any).nota_criterio_c,
                                  (avaliacao as any).nota_criterio_d,
                                  (avaliacao as any).nota_criterio_e
                                ].some(nota => nota !== null && nota !== undefined);
                                
                                if (!temCriteriosPreenchidos) return null;
                                
                                return (
                                  <div className="space-y-4 mb-4">
                                    <h4 className="font-semibold text-gray-900">Critérios Obrigatórios</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                      {(avaliacao as any).nota_criterio_a !== null && (avaliacao as any).nota_criterio_a !== undefined && (
                                    <div className="border rounded p-3">
                                      <span className="font-medium text-sm">Critério A - Qualidade do Projeto:</span>
                                      <p className="text-lg font-bold">{(avaliacao as any).nota_criterio_a?.toFixed(1)}</p>
                                      {(avaliacao as any).obs_criterio_a && (
                                        <p className="text-sm text-gray-600 mt-1">{(avaliacao as any).obs_criterio_a}</p>
                                      )}
                                    </div>
                                  )}
                                  {(avaliacao as any).nota_criterio_b !== null && (avaliacao as any).nota_criterio_b !== undefined && (
                                    <div className="border rounded p-3">
                                      <span className="font-medium text-sm">Critério B - Relevância Cultural:</span>
                                      <p className="text-lg font-bold">{(avaliacao as any).nota_criterio_b?.toFixed(1)}</p>
                                      {(avaliacao as any).obs_criterio_b && (
                                        <p className="text-sm text-gray-600 mt-1">{(avaliacao as any).obs_criterio_b}</p>
                                      )}
                                    </div>
                                  )}
                                  {(avaliacao as any).nota_criterio_c !== null && (avaliacao as any).nota_criterio_c !== undefined && (
                                    <div className="border rounded p-3">
                                      <span className="font-medium text-sm">Critério C - Integração Comunitária:</span>
                                      <p className="text-lg font-bold">{(avaliacao as any).nota_criterio_c?.toFixed(1)}</p>
                                      {(avaliacao as any).obs_criterio_c && (
                                        <p className="text-sm text-gray-600 mt-1">{(avaliacao as any).obs_criterio_c}</p>
                                      )}
                                    </div>
                                  )}
                                  {(avaliacao as any).nota_criterio_d !== null && (avaliacao as any).nota_criterio_d !== undefined && (
                                    <div className="border rounded p-3">
                                      <span className="font-medium text-sm">Critério D - Trajetória Artística:</span>
                                      <p className="text-lg font-bold">{(avaliacao as any).nota_criterio_d?.toFixed(1)}</p>
                                      {(avaliacao as any).obs_criterio_d && (
                                        <p className="text-sm text-gray-600 mt-1">{(avaliacao as any).obs_criterio_d}</p>
                                      )}
                                    </div>
                                  )}
                                  {(avaliacao as any).nota_criterio_e !== null && (avaliacao as any).nota_criterio_e !== undefined && (
                                    <div className="border rounded p-3">
                                      <span className="font-medium text-sm">Critério E - Promoção de Diversidade:</span>
                                      <p className="text-lg font-bold">{(avaliacao as any).nota_criterio_e?.toFixed(1)}</p>
                                      {(avaliacao as any).obs_criterio_e && (
                                        <p className="text-sm text-gray-600 mt-1">{(avaliacao as any).obs_criterio_e}</p>
                                      )}
                                    </div>
                                  )}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Critérios Bônus */}
                              {(() => {
                                const bonusF = (avaliacao as any).bonus_criterio_f;
                                const bonusG = (avaliacao as any).bonus_criterio_g;
                                const bonusH = (avaliacao as any).bonus_criterio_h;
                                const bonusI = (avaliacao as any).bonus_criterio_i;
                                
                                const temBonus = (bonusF && bonusF > 0) || 
                                                 (bonusG && bonusG > 0) || 
                                                 (bonusH && bonusH > 0) || 
                                                 (bonusI && bonusI > 0);
                                
                                if (!temBonus) return null;
                                
                                return (
                                  <div className="space-y-2 mt-4 mb-4">
                                    <h4 className="font-semibold text-gray-900">Critérios Bônus</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {bonusF && bonusF > 0 && (
                                        <div className="border rounded p-3 bg-blue-50">
                                          <span className="font-medium text-sm">Critério F - Agente cultural do gênero feminino:</span>
                                          <p className="text-lg font-bold text-blue-600">{bonusF.toFixed(1)}</p>
                                        </div>
                                      )}
                                      {bonusG && bonusG > 0 && (
                                        <div className="border rounded p-3 bg-blue-50">
                                          <span className="font-medium text-sm">Critério G - Agente cultural negro ou indígena:</span>
                                          <p className="text-lg font-bold text-blue-600">{bonusG.toFixed(1)}</p>
                                        </div>
                                      )}
                                      {bonusH && bonusH > 0 && (
                                        <div className="border rounded p-3 bg-blue-50">
                                          <span className="font-medium text-sm">Critério H - Agente cultural com deficiência:</span>
                                          <p className="text-lg font-bold text-blue-600">{bonusH.toFixed(1)}</p>
                                        </div>
                                      )}
                                      {bonusI && bonusI > 0 && (
                                        <div className="border rounded p-3 bg-blue-50">
                                          <span className="font-medium text-sm">Critério I - Agente cultural de região de menor IDH:</span>
                                          <p className="text-lg font-bold text-blue-600">{bonusI.toFixed(1)}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}

                              {avaliacao.parecer_tecnico && (
                                <div className="mt-2">
                                  <span className="font-medium text-sm text-gray-700">Parecer Técnico:</span>
                                  <p className="text-sm text-gray-600 mt-1">{avaliacao.parecer_tecnico}</p>
                                </div>
                              )}

                              {avaliacao.recomendacao && (
                                <div className="mt-2">
                                  <span className="font-medium text-sm text-gray-700">Recomendação:</span>
                                  <p className="text-sm text-gray-600 mt-1">{avaliacao.recomendacao}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {avaliacao.status === 'aguardando_parecerista' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setAvaliacaoSelecionadaId(avaliacao.id);
                                    setShowAtribuirPareceristaModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Atribuir parecerista"
                                >
                                  <User className="h-4 w-4 mr-1" />
                                  Atribuir Parecerista
                                </Button>
                              )}
                              {avaliacao.status !== 'avaliado' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletarAvaliacao(avaliacao.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Remover avaliação"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Avaliação Final Consolidada */}
                    {/*avaliacaoFinal && (
                      <div className="mt-6 pt-6 border-t-2 border-blue-300">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Avaliação Final Consolidada</h3>
                        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg text-gray-900">
                                  Média das Avaliações
                                </h4>
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {avaliacaoFinal.status === 'avaliado' ? 'Avaliado' : 'Em Avaliação'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                <div>
                                  <span className="font-medium">Pareceristas:</span>
                                  <p>{avaliacaoFinal.quantidade_pareceristas || 0}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Avaliações Concluídas:</span>
                                  <p>{avaliacaoFinal.quantidade_avaliacoes_concluidas || 0} / {avaliacaoFinal.quantidade_pareceristas || 0}</p>
                                </div>
                                {avaliacaoFinal.nota_final !== null && avaliacaoFinal.nota_final !== undefined && (
                                  <div>
                                    <span className="font-medium">Nota Final:</span>
                                    <p className="font-bold text-lg text-blue-600">{Number(avaliacaoFinal.nota_final).toFixed(1)}</p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-4 mb-4">
                                <h4 className="font-semibold text-gray-900">Critérios Obrigatórios (Média)</h4>
                                <div className="grid grid-cols-1 gap-3">
                                  {avaliacaoFinal.nota_criterio_a !== null && avaliacaoFinal.nota_criterio_a !== undefined && (
                                    <div className="border rounded p-3 bg-white">
                                      <span className="font-medium text-sm">Critério A - Qualidade do Projeto:</span>
                                      <p className="text-lg font-bold">{Number(avaliacaoFinal.nota_criterio_a).toFixed(1)}</p>
                                      {avaliacaoFinal.obs_criterio_a && (
                                        <p className="text-sm text-gray-600 mt-1">{avaliacaoFinal.obs_criterio_a}</p>
                                      )}
                                    </div>
                                  )}
                                  {avaliacaoFinal.nota_criterio_b !== null && avaliacaoFinal.nota_criterio_b !== undefined && (
                                    <div className="border rounded p-3 bg-white">
                                      <span className="font-medium text-sm">Critério B - Relevância Cultural:</span>
                                      <p className="text-lg font-bold">{Number(avaliacaoFinal.nota_criterio_b).toFixed(1)}</p>
                                      {avaliacaoFinal.obs_criterio_b && (
                                        <p className="text-sm text-gray-600 mt-1">{avaliacaoFinal.obs_criterio_b}</p>
                                      )}
                                    </div>
                                  )}
                                  {avaliacaoFinal.nota_criterio_c !== null && avaliacaoFinal.nota_criterio_c !== undefined && (
                                    <div className="border rounded p-3 bg-white">
                                      <span className="font-medium text-sm">Critério C - Integração Comunitária:</span>
                                      <p className="text-lg font-bold">{Number(avaliacaoFinal.nota_criterio_c).toFixed(1)}</p>
                                      {avaliacaoFinal.obs_criterio_c && (
                                        <p className="text-sm text-gray-600 mt-1">{avaliacaoFinal.obs_criterio_c}</p>
                                      )}
                                    </div>
                                  )}
                                  {avaliacaoFinal.nota_criterio_d !== null && avaliacaoFinal.nota_criterio_d !== undefined && (
                                    <div className="border rounded p-3 bg-white">
                                      <span className="font-medium text-sm">Critério D - Trajetória Artística:</span>
                                      <p className="text-lg font-bold">{Number(avaliacaoFinal.nota_criterio_d).toFixed(1)}</p>
                                      {avaliacaoFinal.obs_criterio_d && (
                                        <p className="text-sm text-gray-600 mt-1">{avaliacaoFinal.obs_criterio_d}</p>
                                      )}
                                    </div>
                                  )}
                                  {avaliacaoFinal.nota_criterio_e !== null && avaliacaoFinal.nota_criterio_e !== undefined && (
                                    <div className="border rounded p-3 bg-white">
                                      <span className="font-medium text-sm">Critério E - Promoção de Diversidade:</span>
                                      <p className="text-lg font-bold">{Number(avaliacaoFinal.nota_criterio_e).toFixed(1)}</p>
                                      {avaliacaoFinal.obs_criterio_e && (
                                        <p className="text-sm text-gray-600 mt-1">{avaliacaoFinal.obs_criterio_e}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2 mt-4 mb-4">
                                <h4 className="font-semibold text-gray-900">Critérios Bônus (Média)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {avaliacaoFinal.bonus_criterio_f !== null && avaliacaoFinal.bonus_criterio_f !== undefined && (
                                    <div className="border rounded p-3 bg-blue-50">
                                      <span className="font-medium text-sm">Critério F - Agente cultural do gênero feminino:</span>
                                      <p className="text-lg font-bold text-blue-600">{Number(avaliacaoFinal.bonus_criterio_f).toFixed(1)}</p>
                                    </div>
                                  )}
                                  {avaliacaoFinal.bonus_criterio_g !== null && avaliacaoFinal.bonus_criterio_g !== undefined && (
                                    <div className="border rounded p-3 bg-blue-50">
                                      <span className="font-medium text-sm">Critério G - Agente cultural negro ou indígena:</span>
                                      <p className="text-lg font-bold text-blue-600">{Number(avaliacaoFinal.bonus_criterio_g).toFixed(1)}</p>
                                    </div>
                                  )}
                                  {avaliacaoFinal.bonus_criterio_h !== null && avaliacaoFinal.bonus_criterio_h !== undefined && (
                                    <div className="border rounded p-3 bg-blue-50">
                                      <span className="font-medium text-sm">Critério H - Agente cultural com deficiência:</span>
                                      <p className="text-lg font-bold text-blue-600">{Number(avaliacaoFinal.bonus_criterio_h).toFixed(1)}</p>
                                    </div>
                                  )}
                                  {avaliacaoFinal.bonus_criterio_i !== null && avaliacaoFinal.bonus_criterio_i !== undefined && (
                                    <div className="border rounded p-3 bg-blue-50">
                                      <span className="font-medium text-sm">Critério I - Agente cultural de região de menor IDH:</span>
                                      <p className="text-lg font-bold text-blue-600">{Number(avaliacaoFinal.bonus_criterio_i).toFixed(1)}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {avaliacaoFinal.parecer_tecnico && (
                                <div className="mt-4">
                                  <span className="font-medium text-sm text-gray-700">Parecer Técnico:</span>
                                  <p className="text-sm text-gray-600 mt-1">{avaliacaoFinal.parecer_tecnico}</p>
                                </div>
                              )}

                              {avaliacaoFinal.motivo_rejeicao && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                                  <span className="font-medium text-sm text-red-700">Motivo da Rejeição:</span>
                                  <p className="text-sm text-red-600 mt-1">{avaliacaoFinal.motivo_rejeicao}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )*/}
                        {projeto?.status === 'habilitado' && (
                      <div className="mt-6 pt-6 border-t flex flex-wrap gap-4 justify-center">
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleAprovarProjeto}
                          disabled={processandoAcao}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar Projeto
                        </Button>
                        <Button
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => setShowSuplenteProjetoModal(true)}
                          disabled={processandoAcao}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Colocar em Suplência
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setShowDesclassificarProjetoModal(true)}
                          disabled={processandoAcao}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Desclassificar Projeto
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentação */}
          <TabsContent value="documentacao" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      Anexos do Edital
                    </CardTitle>
                    <CardDescription>
                      Documentos e modelos do edital e arquivos de habilitação/complementares do proponente
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const temAvaliacaoConcluida = avaliacoes.some(a => a.status === 'avaliado');
                      const podeHabilitar = projeto?.status === 'avaliado' || 
                        (['aguardando_avaliacao', 'em_avaliacao', 'recebido', 'aguardando_parecerista'].includes(projeto?.status || '') && temAvaliacaoConcluida);
                      
                      if (podeHabilitar) {
                        return (
                          <>
                            <Button
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={handleHabilitar}
                              disabled={processandoAcao}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Habilitar Projeto
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => setShowInabilitarProjetoModal(true)}
                              disabled={processandoAcao}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Inabilitar Projeto
                            </Button>
                          </>
                        );
                      }
                      return null;
                    })()}
                    {/*projeto?.proponente?.tipo && documentos.length === 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (projeto?.proponente?.tipo) {
                            gerarDocumentosPadrao(projeto.proponente.tipo)
                              .then((success) => {
                                if (success) {
                                  toast({
                                    title: "Sucesso",
                                    description: "Documentos de habilitação criados com sucesso!",
                                  });
                                } else {
                                  toast({
                                    title: "Erro",
                                    description: "Erro ao criar documentos de habilitação.",
                                    variant: "destructive",
                                  });
                                }
                              });
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Gerar Documentos Padrão
                      </Button>
                    )*/}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Seção 1: Modelos e Referências do Edital */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <FileText className="h-4 w-4" />
                    Modelos e Referências do Edital
                  </h3>
                  
                  {loadingAnexosEdital ? (
                    <div className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                      <p className="mt-1 text-xs text-gray-500">Carregando anexos...</p>
                    </div>
                  ) : editalAnexos.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                      <p className="text-sm text-gray-500">Nenhum anexo disponível para este edital.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editalAnexos.map((anexo, index) => {
                        const jaEnviado = documentos.some(d => d.nome === anexo.titulo && d.status === 'enviado');
                        return (
                          <div key={index} className={`flex items-center justify-between p-3 rounded-lg border shadow-sm ${jaEnviado ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                            <div className="flex items-center gap-3 truncate pr-4">
                              <div className={`${jaEnviado ? 'bg-green-100' : 'bg-blue-50'} p-2 rounded`}>
                                {jaEnviado ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <FileText className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <div className="truncate">
                                <p className="font-medium text-sm truncate">{anexo.titulo}</p>
                                <p className="text-xs text-gray-500">Modelo/Referência</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {jaEnviado && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px] h-5">
                                  Enviado
                                </Badge>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  const extension = anexo.url.split('.').pop()?.split('?')[0] || 'pdf';
                                  const cmp = (projeto?.numero_inscricao || 'MODELO').replace(/\//g, '-');
                                  handleDownload(anexo.url, `${cmp} - ${anexo.titulo}.${extension}`);
                                }}
                                className="shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Baixar
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <Upload className="h-4 w-4" />
                    Documentos Enviados pelo Proponente
                  </h3>

                  {loadingDocumentos ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Carregando documentos...</p>
                    </div>
                  ) : errorDocumentos ? (
                    <div className="text-center py-8 text-red-500">
                      <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Erro ao carregar documentos: {errorDocumentos}</p>
                      <Button onClick={refreshDocumentos} className="mt-4">
                        Tentar Novamente
                      </Button>
                    </div>
                  ) : documentos.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                      <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum documento disponível no momento.</p>
                      {projeto?.proponente?.tipo && (
                        <p className="text-sm mt-1">O proponente ainda não enviou os documentos de habilitação.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {documentos.map((doc) => {
                        const statusMap = {
                          'pendente': { label: 'Pendente', color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" /> },
                          'enviado': { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: <Upload className="h-4 w-4" /> },
                          'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
                          'rejeitado': { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> }
                        };
                        const statusConfig = statusMap[doc.status as keyof typeof statusMap] || statusMap.pendente;

                        return (
                          <div key={doc.id} className={`border rounded-lg p-4 bg-white shadow-sm ${doc.tipo === 'complementar' ? 'border-l-4 border-l-blue-400' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-gray-900">{doc.nome}</h4>
                                  {doc.obrigatorio && doc.tipo !== 'complementar' && (
                                    <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                                  )}
                                  {doc.tipo === 'complementar' && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">Documento Complementar</Badge>
                                  )}
                                  {doc.tipo === 'anexo_projeto' && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">Anexo de Inscrição</Badge>
                                  )}
                                  <Badge className={statusConfig.color}>
                                    {statusConfig.icon}
                                    <span className="ml-1">{statusConfig.label}</span>
                                  </Badge>
                                </div>
                                
                                {doc.descricao && (
                                  <p className="text-sm text-gray-600 mb-2">{doc.descricao}</p>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Tipo:</span>
                                    <p>{doc.tipo === 'complementar' ? 'Complementar' : doc.tipo === 'anexo_projeto' ? 'Anexo de Inscrição' : (doc.tipo || 'Habilitação')}</p>
                                  </div>
                                  {doc.data_upload && (
                                    <div>
                                      <span className="font-medium">Data de Upload:</span>
                                      <p>{new Date(doc.data_upload).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                  )}
                                </div>

                                {doc.arquivo_nome && (
                                  <div className="mt-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (!doc.arquivo_url) return;
                                        const extension = doc.arquivo_url.split('.').pop()?.split('?')[0] || 'pdf';
                                        const cmp = (projeto?.numero_inscricao || 'PROJETO').replace(/\//g, '-');
                                        // Usar o nome que aparece na UI para o arquivo baixado
                                        handleDownload(doc.arquivo_url, `${cmp} - ${doc.nome}.${extension}`);
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <Download className="h-4 w-4" />
                                      {doc.arquivo_nome}
                                      {doc.arquivo_tamanho && (
                                        <span className="text-xs text-gray-500">
                                          ({(doc.arquivo_tamanho / 1024).toFixed(2)} KB)
                                        </span>
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                              {/* Botões de Ação */}
                              {doc.status === 'enviado' && (
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleAprovarDocumento(doc.id)}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setDocumentoSelecionado(doc.id);
                                      setShowRejeicaoDocModal(true);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Rejeitar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pendências (ex-Diligências) */}
          <TabsContent value="pendencias" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Pendências e Solicitações
                    </CardTitle>
                    <CardDescription>
                      Solicite documentos complementares ou correções ao proponente
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowPendenciaModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Pendência
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPendencias ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pendenciasSolicitadas.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma pendência criada para este projeto.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendenciasSolicitadas.map((pendencia) => (
                      <div key={pendencia.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{pendencia.titulo}</h4>
                              <Badge className={
                                pendencia.status === 'pendente' ? 'bg-orange-100 text-orange-800' :
                                pendencia.status === 'respondido' ? 'bg-blue-100 text-blue-800' :
                                pendencia.status === 'aceito' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {pendencia.status === 'pendente' ? 'Pendente' :
                                 pendencia.status === 'respondido' ? 'Respondido' :
                                 pendencia.status === 'aceito' ? 'Aceito' : 'Recusado'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{pendencia.descricao}</p>
                            
                            {pendencia.modelo_url && (
                              <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 border border-dashed rounded-md w-fit">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium text-gray-700">Modelo: {pendencia.modelo_nome}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-primary hover:text-primary-dark"
                                  onClick={() => window.open(pendencia.modelo_url, '_blank')}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Baixar
                                </Button>
                              </div>
                            )}

                            {pendencia.status === 'respondido' && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                <h5 className="text-xs font-bold text-blue-800 uppercase mb-2">Resposta do Proponente</h5>
                                <p className="text-sm text-blue-900 mb-3">{pendencia.observacoes_resposta || 'Sem observações.'}</p>
                                {pendencia.arquivo_url && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
                                    onClick={() => {
                                      if (!pendencia.arquivo_url) return;
                                      const extension = pendencia.arquivo_url.split('.').pop()?.split('?')[0] || 'pdf';
                                      const cmp = (projeto?.numero_inscricao || 'PROJETO').replace(/\//g, '-');
                                      handleDownload(pendencia.arquivo_url, `${cmp} - ${pendencia.titulo}.${extension}`);
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Visualizar Documento
                                  </Button>
                                )}
                                
                                <div className="flex gap-2 mt-4">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => updateStatusDiligencia(pendencia.id, 'aceito')}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Aceitar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => updateStatusDiligencia(pendencia.id, 'recusado')}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Recusar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-[10px] text-gray-400 block">
                              Criada em: {new Date(pendencia.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            {pendencia.data_resposta && (
                              <span className="text-[10px] text-gray-400 block mt-1">
                                Respondida em: {new Date(pendencia.data_resposta).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* Prestação de Contas */}
          <TabsContent value="prestacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Prestação de Contas
                </CardTitle>
                <CardDescription>
                  Relatórios de execução financeira e prestação de contas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(loadingPrestacoes) ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Carregando prestações de contas...</p>
                  </div>
                ) : errorPrestacoes ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                    <p>Erro ao carregar prestações de contas</p>
                    <p className="text-sm">{errorPrestacoes}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Arquivos da Fase de Prestação de Contas (Matching Proponente View) */}
                    {projeto?.anexos_prestacao && projeto.anexos_prestacao.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <h4 className="flex items-center gap-2 font-medium text-green-800 mb-2">
                          <CheckCircle className="h-5 w-5" /> 
                          Prestação de Contas Enviada (Fase de Prestação)
                        </h4>
                        <p className="text-sm text-green-700 mb-4">
                          Os documentos da fase de prestação de contas foram submetidos pelo proponente.
                        </p>
                        <div className="grid gap-2">
                          {projeto.anexos_prestacao.map((anexo: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-sm text-gray-700">{anexo.titulo}</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDownload(anexo.url, anexo.titulo)} 
                                className="h-8 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Download className="h-3.5 w-3.5 mr-2" />
                                Baixar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {projeto.anexos_prestacao.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma prestação de contas detalhada no momento.</p>
                        <p className="text-sm">Prestações recorrentes aparecerão aqui quando geradas pelo sistema.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                    {prestacoes.map((prestacao) => {
                      const openBankingConfig = getOpenBankingStatusConfig(prestacao.status_open_banking || 'nao_monitorado');
                      return (
                        <div key={prestacao.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{prestacao.tipo || 'Prestação de Contas'}</h4>
                                <Badge 
                                  variant={
                                    prestacao.status === 'aprovado' ? 'default' :
                                    prestacao.status === 'rejeitado' ? 'destructive' :
                                    prestacao.status === 'em_analise' ? 'secondary' :
                                    prestacao.status === 'exigencia' ? 'destructive' :
                                    'outline'
                                  }
                                >
                                  {prestacao.status || 'Pendente'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Valor Executado:</span>
                                  <p className="font-medium">
                                    R$ {prestacao.valor_executado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Data de Entrega:</span>
                                  <p className="font-medium">
                                    {prestacao.data_entrega ? new Date(prestacao.data_entrega).toLocaleDateString('pt-BR') : 'Não informado'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Prazo de Entrega:</span>
                                  <p className="font-medium">
                                    {prestacao.prazo_entrega ? new Date(prestacao.prazo_entrega).toLocaleDateString('pt-BR') : 'Não informado'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Data de Análise:</span>
                                  <p className="font-medium">
                                    {prestacao.data_analise ? new Date(prestacao.data_analise).toLocaleDateString('pt-BR') : 'Não analisado'}
                                  </p>
                                </div>
                              </div>

                              {prestacao.analisado_por && (
                                <div className="mt-3">
                                  <span className="text-gray-500 text-sm">Analisado por:</span>
                                  <p className="text-sm font-medium mt-1">
                                    {prestacao.analisado_por_nome || 'Usuário não identificado'}
                                  </p>
                                </div>
                              )}

                              {prestacao.relatorio_atividades && (
                                <div className="mt-3">
                                  <span className="text-gray-500 text-sm">Relatório de Atividades:</span>
                                  <div className="mt-1">
                                    {prestacao.relatorio_atividades.startsWith('http') ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(prestacao.relatorio_atividades, '_blank')}
                                        className="flex items-center gap-2"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Ver Relatório de Atividades
                                      </Button>
                                    ) : (
                                      <p className="text-sm">{prestacao.relatorio_atividades}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {prestacao.relatorio_financeiro && (
                                <div className="mt-3">
                                  <span className="text-gray-500 text-sm">Relatório Financeiro:</span>
                                  <div className="mt-1">
                                    {prestacao.relatorio_financeiro.startsWith('http') ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(prestacao.relatorio_financeiro, '_blank')}
                                        className="flex items-center gap-2"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Ver Relatório Financeiro
                                      </Button>
                                    ) : (
                                      <p className="text-sm">{prestacao.relatorio_financeiro}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                            {prestacao.parecer_analise && (
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">Parecer de Análise:</span>
                                <p className="text-sm mt-1">{prestacao.parecer_analise}</p>
                              </div>
                            )}

                            {prestacao.exigencia && (
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">Exigência:</span>
                                <p className="text-sm mt-1">{prestacao.exigencia}</p>
                              </div>
                            )}

                            {prestacao.motivo_rejeicao && (
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">Motivo da Rejeição:</span>
                                <p className="text-sm mt-1">{prestacao.motivo_rejeicao}</p>
                              </div>
                            )}

                              {prestacao.comprovantes_url && (
                                <div className="mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(prestacao.comprovantes_url, '_blank')}
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Ver Comprovantes
                                  </Button>
                                </div>
                              )}

                              {/* Status OpenBanking */}
                              <div className="mt-4 pt-3 border-t">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">OpenBanking</span>
                                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${openBankingConfig.color}`}>
                                    {openBankingConfig.icon}
                                    <span>{openBankingConfig.label}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPrestacaoSelecionada(prestacao.id);
                                  setShowVinculacaoModal(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Vincular
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPrestacaoSelecionada(prestacao.id);
                                  setShowAprovacaoModal(true);
                                }}
                                className="flex items-center gap-2 text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Aprovar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPrestacaoSelecionada(prestacao.id);
                                  setShowReprovacaoModal(true);
                                }}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                                Reprovar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPrestacaoSelecionada(prestacao.id);
                                  setShowExigenciaModal(true);
                                }}
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                Exigência
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                  </div>
                )} 
              </CardContent>
            </Card>
          </TabsContent>

          {/* OpenBanking */}
          <TabsContent value="openbanking" className="space-y-6">
            {/* Card de Conta Vinculada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Conta Bancária
                </CardTitle>
                <CardDescription>
                  Conta bancária vinculada ao projeto para monitoramento financeiro
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingContas ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Carregando contas...</p>
                  </div>
                ) : errorContas ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                    <p>Erro ao carregar contas</p>
                    <p className="text-sm">{errorContas}</p>
                  </div>
                ) : contas.length === 0 ? (
                  <div className="text-center py-8">
                    <Banknote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">Nenhuma conta bancária vinculada ao projeto</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contas.map((conta) => (
                      <div key={conta.id} className={`border rounded-lg p-4 ${contaSelecionada === conta.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{conta.banco}</h4>
                              <Badge 
                                variant={
                                  conta.status === 'ativa' ? 'default' :
                                  conta.status === 'inativa' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {conta.status || 'Ativa'}
                              </Badge>
                              {conta.consentimento_ativo && (
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Consentimento Ativo
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Agência:</span>
                                <p className="font-medium">{conta.agencia || 'Não informado'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Conta:</span>
                                <p className="font-medium">{conta.conta || 'Não informado'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Tipo:</span>
                                <p className="font-medium">{conta.tipo_conta || 'Não informado'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Saldo Atual:</span>
                                <p className="font-medium text-green-600">
                                  R$ {conta.saldo_atual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Total Recebido:</span>
                                <p className="font-medium text-green-600">
                                  R$ {conta.valor_total_recebido?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Total Gasto:</span>
                                <p className="font-medium text-red-600">
                                  R$ {conta.valor_total_gasto?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                </p>
                              </div>
                            </div>

                            {conta.ultima_atualizacao && (
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">Última Atualização:</span>
                                <p className="text-sm">
                                  {new Date(conta.ultima_atualizacao).toLocaleString('pt-BR')}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              variant={contaSelecionada === conta.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContaSelecionada(contaSelecionada === conta.id ? null : conta.id)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              {contaSelecionada === conta.id ? 'Selecionada' : 'Selecionar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Movimentações Financeiras */}
            {contaSelecionada && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Movimentações Financeiras
                  </CardTitle>
                  <CardDescription>
                    Histórico de transações da conta selecionada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingMovimentacoes ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Carregando movimentações...</p>
                    </div>
                  ) : errorMovimentacoes ? (
                    <div className="text-center py-8 text-red-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                      <p>Erro ao carregar movimentações</p>
                      <p className="text-sm">{errorMovimentacoes}</p>
                    </div>
                  ) : movimentacoes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma movimentação encontrada para esta conta.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {movimentacoes.map((movimentacao) => (
                        <div key={movimentacao.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{movimentacao.descricao}</h4>
                                <Badge 
                                  variant={
                                    movimentacao.status_validacao === 'validado' ? 'default' :
                                    movimentacao.status_validacao === 'rejeitado' ? 'destructive' :
                                    'outline'
                                  }
                                >
                                  {movimentacao.status_validacao || 'Pendente'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{movimentacao.origem_destino || 'Origem não informada'}</span>
                                <span>•</span>
                                <span>{new Date(movimentacao.data_movimentacao).toLocaleDateString('pt-BR')}</span>
                                {movimentacao.categoria_despesa && (
                                  <>
                                    <span>•</span>
                                    <span>{movimentacao.categoria_despesa}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className={`font-medium text-lg ${
                                movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {movimentacao.tipo === 'entrada' ? '+' : '-'}R$ {movimentacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-gray-500">{movimentacao.metodo_pagamento || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>


      {/* Modal para criar avaliação */}
      <Dialog open={showAvaliacaoModal} onOpenChange={(open) => {
        setShowAvaliacaoModal(open);
        if (!open) {
          setPareceristasSelecionados([]);
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Avaliação</DialogTitle>
            <DialogDescription>
              Selecione um ou mais pareceristas para avaliar este projeto.
            </DialogDescription>
          </DialogHeader>
          
          {/* Informações do Projeto */}
          {projeto && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Projeto para Avaliação</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <p className="text-gray-900">{projeto.nome}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Categoria:</span>
                  <p className="text-gray-900">
                    <Badge className="bg-blue-100 text-blue-800">
                      {getCategoriaLabel(projeto.modalidade)}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(() => {
              const pareceristasJaAtribuidos = avaliacoes
                .map(a => a.parecerista_id)
                .filter(id => id !== null) as string[];
              
              const pareceristasDisponiveis = pareceristas
                .filter(p => !pareceristasJaAtribuidos.includes(p.id))
                .sort((a, b) => {
                  // Ordenar: compatíveis primeiro, depois por nome
                  const aCompativel = a.especialidades && a.especialidades.length > 0 
                    ? a.especialidades.includes(projeto?.modalidade || '')
                    : false;
                  const bCompativel = b.especialidades && b.especialidades.length > 0 
                    ? b.especialidades.includes(projeto?.modalidade || '')
                    : false;
                  
                  if (aCompativel && !bCompativel) return -1;
                  if (!aCompativel && bCompativel) return 1;
                  return a.nome.localeCompare(b.nome);
                });

              if (pareceristas.length === 0) {
                return (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum parecerista disponível. Cadastre pareceristas primeiro.
                  </p>
                );
              }

              if (pareceristasDisponiveis.length === 0) {
                return (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Todos os pareceristas disponíveis já foram atribuídos a este projeto.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Selecione os Pareceristas:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const compIds = pareceristasDisponiveis
                          .filter(p => p.especialidades && p.especialidades.includes(projeto?.modalidade || ''))
                          .map(p => p.id);
                        
                        // Combinar com os já selecionados e remover duplicatas
                        setPareceristasSelecionados(prev => Array.from(new Set([...prev, ...compIds])));
                        
                        toast({
                          title: "Selecionados",
                          description: `${compIds.length} parecerista(s) compatível(is) selecionado(s).`,
                        });
                      }}
                      className="text-xs h-7 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                    >
                      Selecionar Todos Compatíveis
                    </Button>
                  </div>
                  {pareceristasDisponiveis.map((parecerista) => {
                  const temEspecialidadeCombinada = parecerista.especialidades && parecerista.especialidades.length > 0 
                    ? parecerista.especialidades.includes(projeto?.modalidade || '')
                    : false;
                  
                  const estaSelecionado = pareceristasSelecionados.includes(parecerista.id);
                  
                  return (
                    <div
                      key={parecerista.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        estaSelecionado
                          ? 'border-blue-500 bg-blue-50'
                          : temEspecialidadeCombinada
                          ? 'border-green-300 bg-green-50/50 hover:bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={estaSelecionado}
                          onCheckedChange={() => handleToggleParecerista(parecerista.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{parecerista.nome}</span>
                            {temEspecialidadeCombinada && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ✓ Compatível
                              </Badge>
                            )}
                          </div>
                          
                          {parecerista.especialidades && parecerista.especialidades.length > 0 && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-600">Especialidades: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parecerista.especialidades.map((esp, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className={`text-xs ${
                                      esp === projeto?.modalidade
                                        ? 'bg-green-100 text-green-700 border-green-300 font-medium'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {getCategoriaLabel(esp)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {parecerista.area_atuacao && (
                            <p className="text-xs text-gray-500 mt-1">
                              Área: {parecerista.area_atuacao}
                            </p>
                          )}
                          
                          {parecerista.experiencia_anos && (
                            <p className="text-xs text-gray-500">
                              Experiência: {parecerista.experiencia_anos} anos
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              );
            })()}
            
            {pareceristasSelecionados.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">
                  {pareceristasSelecionados.length} parecerista(s) selecionado(s)
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAvaliacaoModal(false);
                setPareceristasSelecionados([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCriarAvaliacao}
              disabled={pareceristasSelecionados.length === 0 || criandoAvaliacao}
            >
              {criandoAvaliacao ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                `Criar ${pareceristasSelecionados.length > 0 ? `${pareceristasSelecionados.length} ` : ''}Avaliação(ões)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para atribuir parecerista */}
      <Dialog open={showAtribuirPareceristaModal} onOpenChange={setShowAtribuirPareceristaModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Atribuir Parecerista</DialogTitle>
            <DialogDescription>
              Selecione um parecerista para avaliar este projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Informações do Projeto */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Projeto para Avaliação</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <p className="text-gray-900">{projeto.nome}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Categoria:</span>
                  <p className="text-gray-900">{projeto.modalidade}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Proponente:</span>
                  <p className="text-gray-900">{projeto.proponente?.nome || 'Não informado'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Valor Solicitado:</span>
                  <p className="text-gray-900 font-bold">
                    R$ {projeto.valor_solicitado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="parecerista-select-atribuir">Parecerista</Label>
              <Select value={pareceristaSelecionado} onValueChange={setPareceristaSelecionado}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um parecerista" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {pareceristas.map((parecerista) => {
                    const temEspecialidadeCombinada = parecerista.especialidades && parecerista.especialidades.length > 0 
                      ? parecerista.especialidades.includes(projeto.modalidade)
                      : false;
                    
                    return (
                      <SelectItem key={parecerista.id} value={parecerista.id}>
                        <div className="flex flex-col gap-1 py-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{parecerista.nome}</span>
                            {temEspecialidadeCombinada && (
                              <span className="text-xs text-green-600">✓</span>
                            )}
                          </div>
                          {parecerista.especialidades && parecerista.especialidades.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {parecerista.especialidades.slice(0, 3).map((esp, idx) => (
                                <span 
                                  key={idx} 
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    esp === projeto.modalidade 
                                      ? 'bg-green-100 text-green-700 font-medium' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {esp}
                                </span>
                              ))}
                              {parecerista.especialidades.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{parecerista.especialidades.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {pareceristas.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Nenhum parecerista disponível. Cadastre pareceristas primeiro.
                </p>
              )}
            </div>

            {/* Detalhes do Parecerista Selecionado */}
            {pareceristaSelecionado && (
              <div className="border rounded-lg p-4 bg-gray-50">
                {(() => {
                  const parecerista = pareceristas.find(p => p.id === pareceristaSelecionado);
                  if (!parecerista) return null;

                  // Verificar se o parecerista tem especialidade que combina com o projeto
                  const temEspecialidadeCombinada = parecerista.especialidades && parecerista.especialidades.length > 0 
                    ? parecerista.especialidades.includes(projeto.modalidade)
                    : false;

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{parecerista.nome}</h4>
                        {temEspecialidadeCombinada && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            ✓ Especialidade combinada
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {parecerista.experiencia_anos > 0 && (
                          <div>
                            <span className="font-medium text-gray-700">Experiência:</span>
                            <p className="text-gray-900">{parecerista.experiencia_anos} {parecerista.experiencia_anos === 1 ? 'ano' : 'anos'}</p>
                          </div>
                        )}
                        
                        {parecerista.area_atuacao && (
                          <div>
                            <span className="font-medium text-gray-700">Área de Atuação:</span>
                            <p className="text-gray-900">{parecerista.area_atuacao}</p>
                          </div>
                        )}

                        {parecerista.especialidades && parecerista.especialidades.length > 0 && (
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Especialidades:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {parecerista.especialidades.map((esp, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className={esp === projeto.modalidade ? "border-green-500 text-green-700" : ""}
                                >
                                  {esp}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {parecerista.formacao_academica && (
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Formação:</span>
                            <p className="text-gray-900">{parecerista.formacao_academica}</p>
                          </div>
                        )}

                        {parecerista.mini_curriculo && (
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Mini Currículo:</span>
                            <p className="text-gray-900 text-xs mt-1 line-clamp-3">{parecerista.mini_curriculo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAtribuirPareceristaModal(false);
                setPareceristaSelecionado('');
                setAvaliacaoSelecionadaId('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAtribuirParecerista}
              disabled={!pareceristaSelecionado || pareceristas.length === 0}
            >
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para vincular movimentação financeira */}
      <Dialog open={showVinculacaoModal} onOpenChange={setShowVinculacaoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Movimentação Financeira</DialogTitle>
            <DialogDescription>
              Selecione uma movimentação financeira para vincular à prestação de contas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="movimentacao-select">Movimentação Financeira</Label>
              <Select value={movimentacaoSelecionada} onValueChange={setMovimentacaoSelecionada}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma movimentação" />
                </SelectTrigger>
                <SelectContent>
                  {movimentacoes
                    .filter(mov => mov.tipo !== 'entrada')
                    .map((movimentacao) => (
                      <SelectItem key={movimentacao.id} value={movimentacao.id}>
                        {movimentacao.descricao} - R$ {movimentacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  {movimentacoes.filter(mov => mov.tipo !== 'entrada').length === 0 && (
                    <SelectItem value="none" disabled>
                      Nenhuma movimentação de saída disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowVinculacaoModal(false);
                setPrestacaoSelecionada(null);
                setMovimentacaoSelecionada('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVincularMovimentacao}
              disabled={!movimentacaoSelecionada}
            >
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para aprovar prestação de contas */}
      <Dialog open={showAprovacaoModal} onOpenChange={setShowAprovacaoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aprovar Prestação de Contas</DialogTitle>
            <DialogDescription>
              Insira o parecer de análise para aprovar a prestação de contas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="parecer-analise">Parecer de Análise</Label>
              <Textarea
                id="parecer-analise"
                placeholder="Descreva o parecer de análise..."
                value={parecerAnalise}
                onChange={(e) => setParecerAnalise(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAprovacaoModal(false);
                setPrestacaoSelecionada(null);
                setParecerAnalise('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAprovarPrestacao}
              disabled={!parecerAnalise.trim()}
            >
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para reprovar prestação de contas */}
      <Dialog open={showReprovacaoModal} onOpenChange={setShowReprovacaoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reprovar Prestação de Contas</DialogTitle>
            <DialogDescription>
              Insira o motivo da rejeição para reprovar a prestação de contas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivo-rejeicao">Motivo da Rejeição</Label>
              <Textarea
                id="motivo-rejeicao"
                placeholder="Descreva o motivo da rejeição..."
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReprovacaoModal(false);
                setPrestacaoSelecionada(null);
                setMotivoRejeicao('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReprovarPrestacao}
              disabled={!motivoRejeicao.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Reprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para exigir prestação de contas */}
      <Dialog open={showExigenciaModal} onOpenChange={setShowExigenciaModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Exigência</DialogTitle>
            <DialogDescription>
              Descreva a exigência que deve ser atendida na prestação de contas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exigencia">Exigência</Label>
              <Textarea
                id="exigencia"
                placeholder="Descreva a exigência..."
                value={exigencia}
                onChange={(e) => setExigencia(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowExigenciaModal(false);
                setPrestacaoSelecionada(null);
                setExigencia('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExigirPrestacao}
              disabled={!exigencia.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Enviar Exigência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para conectar conta (placeholder) */}
      <Dialog open={showConectarContaModal} onOpenChange={setShowConectarContaModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Conta Bancária</DialogTitle>
            <DialogDescription>
              Funcionalidade em desenvolvimento. Em breve você poderá conectar contas bancárias para monitoramento financeiro.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Banknote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Esta funcionalidade será implementada em breve.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConectarContaModal(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição de Documento */}
      <Dialog open={showRejeicaoDocModal} onOpenChange={setShowRejeicaoDocModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeitar Documento</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do documento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivoRejeicaoDoc">Motivo da Rejeição</Label>
              <Textarea
                id="motivoRejeicaoDoc"
                placeholder="Descreva o motivo da rejeição..."
                value={motivoRejeicaoDoc}
                onChange={(e) => setMotivoRejeicaoDoc(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejeicaoDocModal(false);
                setDocumentoSelecionado(null);
                setMotivoRejeicaoDoc('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejeitarDocumento}
              disabled={!motivoRejeicaoDoc.trim()}
            >
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Inabilitação de Projeto */}
      <Dialog open={showInabilitarProjetoModal} onOpenChange={setShowInabilitarProjetoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inabilitar Projeto</DialogTitle>
            <DialogDescription>
              Informe o motivo da inabilitação do projeto. Esta ação não poderá ser desfeita facilmente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivoInabilitacao">Motivo da Inabilitação</Label>
              <Textarea
                id="motivoInabilitacao"
                placeholder="Descreva detalhadamente o motivo..."
                value={motivoInabilitacao}
                onChange={(e) => setMotivoInabilitacao(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowInabilitarProjetoModal(false);
                setMotivoInabilitacao('');
              }}
              disabled={processandoAcao}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleInabilitarProjeto}
              disabled={!motivoInabilitacao.trim() || processandoAcao}
            >
              {processandoAcao ? "Processando..." : "Inabilitar Projeto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Suplência de Projeto */}
      <Dialog open={showSuplenteProjetoModal} onOpenChange={setShowSuplenteProjetoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como Suplente</DialogTitle>
            <DialogDescription>
              Deseja marcar este projeto como suplente?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuplenteProjetoModal(false)}
              disabled={processandoAcao}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSuplenteProjeto}
              disabled={processandoAcao}
            >
              {processandoAcao ? "Processando..." : "Confirmar Suplência"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Desclassificação de Projeto */}
      <Dialog open={showDesclassificarProjetoModal} onOpenChange={setShowDesclassificarProjetoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desclassificar Projeto</DialogTitle>
            <DialogDescription>
              Informe o motivo da desclassificação do projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivoDesclassificacao">Motivo da Desclassificação</Label>
              <Textarea
                id="motivoDesclassificacao"
                placeholder="Descreva detalhadamente o motivo..."
                value={motivoDesclassificacao}
                onChange={(e) => setMotivoDesclassificacao(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDesclassificarProjetoModal(false);
                setMotivoDesclassificacao('');
              }}
              disabled={processandoAcao}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDesclassificarProjeto}
              disabled={!motivoDesclassificacao.trim() || processandoAcao}
            >
              {processandoAcao ? "Processando..." : "Desclassificar Projeto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPendenciaModal} onOpenChange={setShowPendenciaModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Pendência</DialogTitle>
            <DialogDescription>
              Solicite documentos complementares ou correções ao proponente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pendencia-titulo">Título da Pendência</Label>
              <Input
                id="pendencia-titulo"
                placeholder="Ex: Documento de Identidade Legível"
                value={novaPendenciaTitulo}
                onChange={(e) => setNovaPendenciaTitulo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pendencia-descricao">Descrição detalhada</Label>
              <Textarea
                id="pendencia-descricao"
                placeholder="Descreva exatamente o que o proponente precisa enviar ou corrigir..."
                value={novaPendenciaDescricao}
                onChange={(e) => setNovaPendenciaDescricao(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="pendencia-modelo" className="text-sm font-medium flex items-center gap-1.5 mb-2 mt-4">
                <Paperclip className="w-4 h-4 text-slate-500" />
                Anexar Modelo/Template (Opcional)
              </Label>
              <Input
                id="pendencia-modelo"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setNovaPendenciaModelo(file);
                }}
                className="bg-white"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Se for algo que a pessoa deve preencher, anexe o arquivo aqui para ela baixar.
              </p>
              {novaPendenciaModelo && (
                <p className="text-[11px] text-green-600 font-medium flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" /> Selecionado: {novaPendenciaModelo.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPendenciaModal(false);
                setNovaPendenciaTitulo('');
                setNovaPendenciaDescricao('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCriarPendencia}
              disabled={!novaPendenciaTitulo.trim() || !novaPendenciaDescricao.trim() || enviandoModelo}
            >
              {enviandoModelo ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Pendência'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SidebarInset />
    </PrefeituraLayout>
  );
};

export default PrefeituraProjetoDetalhes;
