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
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { useProjetoDetalhes } from "@/hooks/useProjetoDetalhes";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";
import { usePendencias } from "@/hooks/usePendencias";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { usePrestacoesContas } from "@/hooks/usePrestacoesContas";
import { useMovimentacoesFinanceiras } from "@/hooks/useMovimentacoesFinanceiras";
import { useContasMonitoradas } from "@/hooks/useContasMonitoradas";
import { useDocumentosHabilitacao } from "@/hooks/useDocumentosHabilitacao";
import { ProjetoWithDetails } from "@/services/projetoService";

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
  
  // Estados para modal de pendências
  const [showPendenciaModal, setShowPendenciaModal] = useState(false);
  const [novaPendencia, setNovaPendencia] = useState('');
  const [arquivoUrl, setArquivoUrl] = useState('');

  // Estados para modal de avaliação
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [showAtribuirPareceristaModal, setShowAtribuirPareceristaModal] = useState(false);
  const [avaliacaoSelecionadaId, setAvaliacaoSelecionadaId] = useState<string>('');
  const [pareceristaSelecionado, setPareceristaSelecionado] = useState('');

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

  const {
    projeto,
    loading,
    error,
    updateStatus,
    refresh
  } = useProjetoDetalhes(projetoId || '');

  const {
    pendencias,
    loading: loadingPendencias,
    error: errorPendencias,
    createPendencia,
    updatePendencia,
    deletePendencia,
    refresh: refreshPendencias
  } = usePendencias(projetoId || '');

  const {
    avaliacoes,
    pareceristas,
    loading: loadingAvaliacoes,
    error: errorAvaliacoes,
    createAvaliacao,
    updateAvaliacao,
    deleteAvaliacao,
    refresh: refreshAvaliacoes
  } = useAvaliacoes(projetoId || '', prefeitura?.id || '');

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

  const handleCriarPendencia = async () => {
    if (!novaPendencia.trim() || !projetoId || !user?.id) return;

    const success = await createPendencia({
      text: novaPendencia.trim(),
      projeto_id: projetoId,
      criado_por: user.id,
      arquivo: arquivoUrl.trim() || undefined
    });

    if (success) {
      toast({
        title: "Pendência criada",
        description: "A pendência foi adicionada com sucesso.",
      });
      setNovaPendencia('');
      setArquivoUrl('');
      setShowPendenciaModal(false);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar a pendência.",
        variant: "destructive",
      });
    }
  };

  const handleMarcarRealizada = async (id: number) => {
    const success = await updatePendencia(id, { realizada: true });
    if (success) {
      toast({
        title: "Sucesso",
        description: "Pendência marcada como realizada!",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao atualizar pendência. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeletarPendencia = async (id: number) => {
    const success = await deletePendencia(id);
    if (success) {
      toast({
        title: "Pendência removida",
        description: "A pendência foi removida com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover a pendência.",
        variant: "destructive",
      });
    }
  };

  const handleCriarAvaliacao = async () => {
    if (!pareceristaSelecionado || !projetoId || !prefeitura?.id) return;

    const success = await createAvaliacao({
      prefeitura_id: prefeitura.id,
      projeto_id: projetoId,
      parecerista_id: pareceristaSelecionado,
      status: 'pendente'
    });

    if (success) {
      toast({
        title: "Avaliação criada",
        description: "A avaliação foi atribuída ao parecerista com sucesso.",
      });
      setShowAvaliacaoModal(false);
      setPareceristaSelecionado('');
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar a avaliação.",
        variant: "destructive",
      });
    }
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
      'aguardando_avaliacao': { label: 'Aguardando Avaliação', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
      'recebido': { label: 'Recebido', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4" /> },
      'em_avaliacao': { label: 'Em Avaliação', color: 'bg-orange-100 text-orange-800', icon: <Search className="h-4 w-4" /> },
      'avaliado': { label: 'Avaliado', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="h-4 w-4" /> },
      'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      'rejeitado': { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
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
            <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
            <TabsTrigger value="documentacao">Documentação</TabsTrigger>
            <TabsTrigger value="pendencias">Pendências</TabsTrigger>
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
                    <label className="text-sm font-medium text-gray-500">Modalidade</label>
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
              <Card className={projeto.proponente?.tipo === "PF" ? "border-l-4 border-l-blue-600" : "border-l-4 border-l-green-600"}>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                    {projeto.proponente?.cpf && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">CPF:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.cpf}</p>
                      </div>
                    )}
                    {projeto.proponente?.cnpj && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">CNPJ:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.cnpj}</p>
                      </div>
                    )}
                    {projeto.proponente?.rg && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">RG:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.rg}</p>
                      </div>
                    )}
                    {projeto.proponente?.data_nascimento && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Data de Nascimento:</span>
                        <p className="text-sm text-gray-700">{formatarData(projeto.proponente.data_nascimento)}</p>
                      </div>
                    )}
                  </div>

                  {/* Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                    {projeto.proponente?.telefone && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Telefone:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.telefone}</p>
                      </div>
                    )}
                    {projeto.proponente?.email && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Email:</span>
                        <p className="text-sm text-gray-700">{projeto.proponente.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Endereço */}
                  {projeto.proponente?.endereco && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Endereço</h4>
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
                  )}

                  {/* Dados Pessoais PF */}
                  {projeto.proponente?.tipo === "PF" && (
                    <>
                      {(projeto.proponente.comunidade_tradicional || projeto.proponente.genero || projeto.proponente.raca || projeto.proponente.escolaridade || projeto.proponente.renda_mensal) && (
                        <div className="pt-2 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Dados Pessoais</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {projeto.proponente.comunidade_tradicional && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Comunidade Tradicional:</span>
                                <p className="text-sm text-gray-700">{traduzirComunidade(projeto.proponente.comunidade_tradicional)}</p>
                              </div>
                            )}
                            {projeto.proponente.genero && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Gênero:</span>
                                <p className="text-sm text-gray-700">{traduzirGenero(projeto.proponente.genero)}</p>
                              </div>
                            )}
                            {projeto.proponente.raca && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Raça/Cor:</span>
                                <p className="text-sm text-gray-700">{traduzirRaca(projeto.proponente.raca)}</p>
                              </div>
                            )}
                            {projeto.proponente.escolaridade && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Escolaridade:</span>
                                <p className="text-sm text-gray-700">{traduzirEscolaridade(projeto.proponente.escolaridade)}</p>
                              </div>
                            )}
                            {projeto.proponente.renda_mensal && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Renda Mensal:</span>
                                <p className="text-sm text-gray-700">{traduzirRenda(projeto.proponente.renda_mensal)}</p>
                              </div>
                            )}
                            {projeto.proponente.pcd && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">PCD:</span>
                                <p className="text-sm text-gray-700">Sim{projeto.proponente.tipo_deficiencia && ` - ${traduzirDeficiencia(projeto.proponente.tipo_deficiencia)}`}</p>
                              </div>
                            )}
                            {projeto.proponente.programa_social && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Programa Social:</span>
                                <p className="text-sm text-gray-700">{traduzirProgramaSocial(projeto.proponente.programa_social)}</p>
                              </div>
                            )}
                            {projeto.proponente.concorre_cotas && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Concorre Cotas:</span>
                                <p className="text-sm text-gray-700">Sim{projeto.proponente.tipo_cotas && ` - ${traduzirCotas(projeto.proponente.tipo_cotas)}`}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Atividade Artística */}
                      {(projeto.proponente.funcao_artistica || projeto.proponente.representa_coletivo) && (
                        <div className="pt-2 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Atividade Artística</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {projeto.proponente.funcao_artistica && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Função:</span>
                                <p className="text-sm text-gray-700">{traduzirFuncaoArtistica(projeto.proponente.funcao_artistica)}</p>
                              </div>
                            )}
                            {projeto.proponente.representa_coletivo && projeto.proponente.nome_coletivo && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Coletivo:</span>
                                <p className="text-sm text-gray-700">{projeto.proponente.nome_coletivo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Currículo */}
                      {projeto.proponente.mini_curriculo && (
                        <div className="pt-2 border-t">
                          <span className="text-xs text-gray-500 font-medium">Mini Currículo:</span>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{projeto.proponente.mini_curriculo}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Dados PJ */}
                  {projeto.proponente?.tipo === "PJ" && (
                    <>
                      {projeto.proponente.inscricao_estadual && (
                        <div className="pt-2 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Inscrições</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs text-gray-500 font-medium">Inscrição Estadual:</span>
                              <p className="text-sm text-gray-700">{projeto.proponente.inscricao_estadual}</p>
                            </div>
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
                ) : avaliacoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma avaliação no momento.</p>
                    <p className="text-sm">Clique em "Nova Avaliação" para atribuir um parecerista.</p>
                  </div>
                ) : (
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

                              {/* Notas detalhadas */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                                {avaliacao.nota_relevancia && (
                                  <div>
                                    <span className="font-medium">Relevância:</span>
                                    <p>{avaliacao.nota_relevancia.toFixed(1)}</p>
                                  </div>
                                )}
                                {avaliacao.nota_viabilidade && (
                                  <div>
                                    <span className="font-medium">Viabilidade:</span>
                                    <p>{avaliacao.nota_viabilidade.toFixed(1)}</p>
                                  </div>
                                )}
                                {avaliacao.nota_impacto && (
                                  <div>
                                    <span className="font-medium">Impacto:</span>
                                    <p>{avaliacao.nota_impacto.toFixed(1)}</p>
                                  </div>
                                )}
                                {avaliacao.nota_orcamento && (
                                  <div>
                                    <span className="font-medium">Orçamento:</span>
                                    <p>{avaliacao.nota_orcamento.toFixed(1)}</p>
                                  </div>
                                )}
                                {avaliacao.nota_inovacao && (
                                  <div>
                                    <span className="font-medium">Inovação:</span>
                                    <p>{avaliacao.nota_inovacao.toFixed(1)}</p>
                                  </div>
                                )}
                                {avaliacao.nota_sustentabilidade && (
                                  <div>
                                    <span className="font-medium">Sustentabilidade:</span>
                                    <p>{avaliacao.nota_sustentabilidade.toFixed(1)}</p>
                                  </div>
                                )}
                              </div>

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
                      Documentos de Habilitação
                    </CardTitle>
                    <CardDescription>
                      Documentos necessários para habilitação do projeto
                    </CardDescription>
                  </div>
                  {documentos.length === 0 && projeto?.proponente?.tipo && (
                    <Button 
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
                  )}
                </div>
              </CardHeader>
              <CardContent>
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
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum documento disponível no momento.</p>
                    {projeto?.proponente?.tipo ? (
                      <>
                        <p className="text-sm">Clique em "Gerar Documentos Padrão" para criar os documentos necessários.</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Tipo de proponente: {projeto.proponente.tipo}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm">Os documentos aparecerão aqui quando necessário.</p>
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
                        <div key={doc.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{doc.nome}</h4>
                                {doc.obrigatorio && (
                                  <Badge variant="outline" className="text-xs">Obrigatório</Badge>
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
                                  <p>{doc.tipo || 'Não informado'}</p>
                                </div>
                                {doc.data_solicitacao && (
                                  <div>
                                    <span className="font-medium">Data de Solicitação:</span>
                                    <p>{new Date(doc.data_solicitacao).toLocaleDateString('pt-BR')}</p>
                                  </div>
                                )}
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
                                    onClick={() => doc.arquivo_url && window.open(doc.arquivo_url, '_blank')}
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
                                  className="flex items-center gap-2"
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pendências */}
          <TabsContent value="pendencias" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Pendências do Projeto
                    </CardTitle>
                    <CardDescription>
                      Lista de pendências e questões a serem resolvidas
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
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Carregando pendências...</p>
                  </div>
                ) : errorPendencias ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Erro ao carregar pendências: {errorPendencias}</p>
                    <Button onClick={refreshPendencias} className="mt-4">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : pendencias.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma pendência no momento.</p>
                    <p className="text-sm">Clique em "Nova Pendência" para adicionar uma questão.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendencias.map((pendencia) => (
                      <div 
                        key={pendencia.id} 
                        className={`border rounded-lg p-4 ${
                          pendencia.realizada 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-gray-900 font-medium">{pendencia.text}</p>
                              {pendencia.realizada && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Realizada
                                </Badge>
                              )}
                            </div>
                            
                            {pendencia.arquivo && (
                              <div className="mb-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(pendencia.arquivo, '_blank')}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Abrir Arquivo
                                </Button>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Criado por: {pendencia.criado_por_nome}</span>
                              <span>
                                {new Date(pendencia.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!pendencia.realizada && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarcarRealizada(pendencia.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Marcar como realizada"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {!pendencia.realizada && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletarPendencia(pendencia.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Remover pendência"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                {loadingPrestacoes ? (
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
                ) : prestacoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma prestação de contas disponível no momento.</p>
                    <p className="text-sm">As prestações de contas aparecerão aqui quando o projeto for aprovado e executado.</p>
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
                    <Button
                      onClick={() => setShowConectarContaModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Conectar Conta
                    </Button>
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

      {/* Modal para criar pendência */}
      <Dialog open={showPendenciaModal} onOpenChange={setShowPendenciaModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Pendência</DialogTitle>
            <DialogDescription>
              Descreva a pendência ou questão que precisa ser resolvida para este projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pendencia-text">Descrição da Pendência</Label>
              <Textarea
                id="pendencia-text"
                placeholder="Descreva a pendência..."
                value={novaPendencia}
                onChange={(e) => setNovaPendencia(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="arquivo-url">URL do Arquivo (Opcional)</Label>
              <Input
                id="arquivo-url"
                placeholder="https://exemplo.com/arquivo.pdf"
                value={arquivoUrl}
                onChange={(e) => setArquivoUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Cole aqui o link para um arquivo relacionado à pendência
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPendenciaModal(false);
                setNovaPendencia('');
                setArquivoUrl('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCriarPendencia}
              disabled={!novaPendencia.trim()}
            >
              Criar Pendência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para criar avaliação */}
      <Dialog open={showAvaliacaoModal} onOpenChange={setShowAvaliacaoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Avaliação</DialogTitle>
            <DialogDescription>
              Selecione um parecerista para avaliar este projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="parecerista-select">Parecerista</Label>
              <Select value={pareceristaSelecionado} onValueChange={setPareceristaSelecionado}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um parecerista" />
                </SelectTrigger>
                <SelectContent>
                  {pareceristas.map((parecerista) => (
                    <SelectItem key={parecerista.id} value={parecerista.id}>
                      {parecerista.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pareceristas.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Nenhum parecerista disponível. Cadastre pareceristas primeiro.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAvaliacaoModal(false);
                setPareceristaSelecionado('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCriarAvaliacao}
              disabled={!pareceristaSelecionado || pareceristas.length === 0}
            >
              Criar Avaliação
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
                  <span className="font-medium text-gray-700">Modalidade:</span>
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
    </PrefeituraLayout>
  );
};