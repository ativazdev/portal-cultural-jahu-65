import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Pencil
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { useProjetoDetalhes } from "@/hooks/useProjetoDetalhes";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import { usePendencias } from "@/hooks/usePendencias";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { usePrestacoesContas } from "@/hooks/usePrestacoesContas";
import { useMovimentacoesFinanceiras } from "@/hooks/useMovimentacoesFinanceiras";
import { useContasMonitoradas } from "@/hooks/useContasMonitoradas";
import { useDocumentosHabilitacao } from "@/hooks/useDocumentosHabilitacao";
import { ProjetoWithDetails } from "@/services/projetoService";
import { getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";

// Opções para múltipla escolha
const publicoPrioritarioOptions = [
  "Pessoas vítimas de violência",
  "Pessoas em situação de pobreza",
  "Pessoas em situação de rua",
  "População carcerária",
  "Pessoas com deficiência",
  "Pessoas em sofrimento físico/psíquico",
  "Mulheres",
  "LGBTQIAPN+",
  "Povos e comunidades tradicionais",
  "Negros e/ou negras",
  "Ciganos",
  "Indígenas",
  "Não é específica, aberta para todos",
  "Outros"
];

const acessibilidadeArquitetonicaOptions = [
  "Rotas acessíveis para cadeira de rodas",
  "Piso tátil",
  "Rampas",
  "Elevadores adequados",
  "Corrimãos e guarda-corpos",
  "Banheiros adaptados",
  "Vagas para PCD",
  "Assentos para pessoas obesas",
  "Iluminação adequada",
  "Outra"
];

const acessibilidadeComunicacionalOptions = [
  "Língua Brasileira de Sinais (Libras)",
  "Sistema Braille",
  "Comunicação tátil",
  "Audiodescrição",
  "Legendas",
  "Linguagem simples",
  "Textos para leitores de tela",
  "Outra"
];

const acessibilidadeAtitudinalOptions = [
  "Capacitação de equipes atuantes nos projetos culturais",
  "Contratação de profissionais com deficiência e profissionais especializados em acessibilidade cultural",
  "Formação e sensibilização de agentes culturais, público e todos os envolvidos na cadeia produtiva cultural",
  "Outras medidas que visem a eliminação de atitudes capacitistas"
];

const tiposOutrasFontesOptions = [
  "Apoio municipal/estadual",
  "Lei de Incentivo (Municipal/Estadual/Federal)",
  "Patrocínio privado/internacional",
  "Doações (PF/PJ)",
  "Cobrança de ingressos",
  "Outros"
];

interface ProponenteItem {
  id: string;
  nome: string;
  tipo: string;
  cpf?: string;
  cnpj?: string;
}

// Função para aplicar máscara de CPF/CNPJ
const aplicarMascaraDocumento = (value: string) => {
  // Remove tudo que não é dígito
  const numeros = value.replace(/\D/g, '');
  
  // CPF (11 dígitos)
  if (numeros.length <= 11) {
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  // CNPJ (14 dígitos)
  else {
    return numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18); // Limita ao tamanho máximo do CNPJ formatado
  }
};

// Função para formatar datas sem problemas de timezone
const formatarData = (dataString: string | Date): string => {
  if (!dataString) return '';
  
  const data = typeof dataString === 'string' ? new Date(dataString) : dataString;
  
  // Se a string é apenas uma data (YYYY-MM-DD), não aplicar timezone
  if (typeof dataString === 'string' && dataString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  
  // Caso contrário, usar toLocaleDateString
  return data.toLocaleDateString('pt-BR');
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

// Utilitários para orçamento
const parseValorMonetario = (valor: string | number): number => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  return parseFloat(valor.toString().replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
};

const calcularTotalOrcamento = (itens: Array<any>): number => {
  return (itens || []).reduce((sum, item) => {
    const v = parseValorMonetario(item.valor_unitario);
    const q = typeof item.quantidade === 'number' ? item.quantidade : parseInt(item.quantidade || '0');
    return sum + (v * (q > 0 ? q : 0));
  }, 0);
};

// Utilitários para Gantt
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

export const ProponenteProjetoDetalhes = () => {
  const { nomePrefeitura, projetoId } = useParams<{ nomePrefeitura: string; projetoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proponente, prefeitura} = useProponenteAuth();
  
  // Estados para edição de informações gerais
  const [editandoProjeto, setEditandoProjeto] = useState(false);
  const [projetoEditado, setProjetoEditado] = useState<any>(null);
  
  // Estados para modais individuais
  const [showEditBasico, setShowEditBasico] = useState(false);
  const [showEditPublico, setShowEditPublico] = useState(false);
  const [showEditAcessibilidade, setShowEditAcessibilidade] = useState(false);
  const [showEditCronograma, setShowEditCronograma] = useState(false);
  const [showEditProponente, setShowEditProponente] = useState(false);
  const [showEditValor, setShowEditValor] = useState(false);
  const [showEditEquipe, setShowEditEquipe] = useState(false);
  const [showEditAtividades, setShowEditAtividades] = useState(false);
  const [showEditMetas, setShowEditMetas] = useState(false);
  
  // Estados para lista de proponentes
  const [proponentesDisponiveis, setProponentesDisponiveis] = useState<ProponenteItem[]>([]);
  const [loadingProponentes, setLoadingProponentes] = useState(false);

  // Estados para modal de equipe
  const [equipeTemp, setEquipeTemp] = useState<any[]>([]);
  const [showModalNovoMembro, setShowModalNovoMembro] = useState(false);
  const [novoMembro, setNovoMembro] = useState({
    nome: '',
    funcao: '',
    cpf_cnpj: '',
    indigena: false,
    lgbtqiapn: false,
    preto_pardo: false,
    
    deficiencia: false,
    mini_curriculo: ''
  });

  // Estados para modal de atividades
  const [atividadesTemp, setAtividadesTemp] = useState<any[]>([]);
  const [showModalNovaAtividade, setShowModalNovaAtividade] = useState(false);
  const [showModalEditarAtividade, setShowModalEditarAtividade] = useState(false);
  const [atividadeEditando, setAtividadeEditando] = useState<any>(null);
  const [novaAtividade, setNovaAtividade] = useState({
    nome_atividade: '',
    etapa: '',
    descricao: '',
    data_inicio: '',
    data_fim: ''
  });

  // Estados para modal de metas
  const [metasTemp, setMetasTemp] = useState<any[]>([]);
  const [showModalNovaMeta, setShowModalNovaMeta] = useState(false);
  const [showModalEditarMeta, setShowModalEditarMeta] = useState(false);
  const [metaEditando, setMetaEditando] = useState<any>(null);
  const [novaMeta, setNovaMeta] = useState({
    descricao: ''
  });

  // Estados para modal de orçamento
  const [showEditOrcamento, setShowEditOrcamento] = useState(false);
  const [itensOrcamentoTemp, setItensOrcamentoTemp] = useState<any[]>([]);
  const [showModalNovoItem, setShowModalNovoItem] = useState(false);
  const [showModalEditarItem, setShowModalEditarItem] = useState(false);
  const [itemEditando, setItemEditando] = useState<any>(null);
  const [novoItem, setNovoItem] = useState({
    descricao: '',
    justificativa: '',
    unidade_medida: '',
    valor_unitario: '',
    quantidade: '',
    referencia_preco: '',
    ordem: ''
  });

  // Estados para modal de pendências
  const [showPendenciaModal, setShowPendenciaModal] = useState(false);
  const [novaPendencia, setNovaPendencia] = useState('');
  const [arquivoUrl, setArquivoUrl] = useState('');

  // Estados para modal de solicitação de nova avaliação
  const [showNovaAvaliacaoModal, setShowNovaAvaliacaoModal] = useState(false);

  // Estados para modais de prestação de contas
  const [showNovaPrestacaoModal, setShowNovaPrestacaoModal] = useState(false);
  const [showVinculacaoModal, setShowVinculacaoModal] = useState(false);
  const [prestacaoSelecionada, setPrestacaoSelecionada] = useState<string | null>(null);
  const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState('');
  const [novaPrestacaoNome, setNovaPrestacaoNome] = useState('');
  const [novaPrestacaoDescricao, setNovaPrestacaoDescricao] = useState('');
  const [novaPrestacaoValor, setNovaPrestacaoValor] = useState('');
  const [novaPrestacaoRelatorio, setNovaPrestacaoRelatorio] = useState<File | null>(null);
  const [novaPrestacaoFinanceiro, setNovaPrestacaoFinanceiro] = useState<File | null>(null);
  const [novaPrestacaoComprovantes, setNovaPrestacaoComprovantes] = useState<File | null>(null);
  const [carregandoPrestacao, setCarregandoPrestacao] = useState(false);

  // Estados para documentos
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [documentoParaUpload, setDocumentoParaUpload] = useState<string | null>(null);
  const [arquivoDoc, setArquivoDoc] = useState<File | null>(null);
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);

  // Estados para OpenBanking
  const [contaSelecionada, setContaSelecionada] = useState<string | null>(null);

  const {
    projeto,
    loading,
    error,
    updateStatus,
    refresh
  } = useProjetoDetalhes(projetoId || '', 'proponente');

  const {
    pendencias,
    loading: loadingPendencias,
    createPendencia,
    refresh: refreshPendencias
  } = usePendencias(projetoId || '');

  const {
    avaliacoes,
    avaliacaoFinal,
    loading: loadingAvaliacoes,
    refresh: refreshAvaliacoes
  } = useAvaliacoes(projetoId || '', prefeitura?.id || '');

  const {
    prestacoes,
    loading: loadingPrestacoes,
    createPrestacao,
    updatePrestacao,
    deletePrestacao,
    refresh: refreshPrestacoes
  } = usePrestacoesContas(projetoId || '');

  const {
    documentos,
    loading: loadingDocumentos,
    updateDocumento,
    refresh: refreshDocumentos
  } = useDocumentosHabilitacao(projetoId || '');

  const {
    contas,
    loading: loadingContas
  } = useContasMonitoradas(projetoId || '');

  const {
    movimentacoes,
    loading: loadingMovimentacoes
  } = useMovimentacoesFinanceiras(projetoId || '', contaSelecionada || undefined);

  // Carregar projeto editado quando projeto mudar
  useEffect(() => {
    if (projeto) {
      setProjetoEditado(projeto);
    }
  }, [projeto]);

  // Carregar proponentes quando modal abrir
  useEffect(() => {
    const carregarProponentes = async () => {
      if (!showEditProponente || !proponente?.id || !prefeitura?.id) return;
      
      try {
        setLoadingProponentes(true);
        const authClient = getAuthenticatedSupabaseClient('proponente');
        // @ts-ignore - Supabase type issue
        const { data, error } = await authClient
          .from('proponentes')
          .select('id, nome, tipo, cpf, cnpj')
          .eq('usuario_id', proponente.id)
          .eq('prefeitura_id', prefeitura.id);

        if (error) throw error;
        
        setProponentesDisponiveis((data || []) as ProponenteItem[]);
      } catch (error: any) {
        console.error('Erro ao carregar proponentes:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de proponentes",
          variant: "destructive",
        });
      } finally {
        setLoadingProponentes(false);
      }
    };

    carregarProponentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditProponente, proponente?.id, prefeitura?.id]);

  // Carregar equipe quando modal abrir
  useEffect(() => {
    if (showEditEquipe && projeto?.equipe) {
      setEquipeTemp(projeto.equipe);
    }
  }, [showEditEquipe, projeto?.equipe]);

  // Carregar atividades quando modal abrir e ordenar por data
  useEffect(() => {
    if (showEditAtividades && projeto?.atividades) {
      const atividadesOrdenadas = [...projeto.atividades].sort((a: any, b: any) => 
        new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
      );
      setAtividadesTemp(atividadesOrdenadas);
    }
  }, [showEditAtividades, projeto?.atividades]);

  // Carregar metas quando modal abrir
  useEffect(() => {
    if (showEditMetas && projeto?.metas) {
      setMetasTemp(projeto.metas);
    }
  }, [showEditMetas, projeto?.metas]);

  // Carregar itens de orçamento quando modal abrir
  useEffect(() => {
    if (showEditOrcamento && projeto?.orcamento) {
      setItensOrcamentoTemp(projeto.orcamento);
    }
  }, [showEditOrcamento, projeto?.orcamento]);

  const podeEditarProjeto = () => {
    return projeto?.status === 'rascunho' || projeto?.status === 'rejeitado';
  };

  const validarValorSolicitado = (valor: number): boolean => {
    const valorMaximoEdital = (projeto?.edital as any)?.valor_maximo;
    if (!valorMaximoEdital) return true; // Se não houver valor máximo, permite qualquer valor
    
    if (valor > valorMaximoEdital) {
      toast({
        title: "Erro",
        description: `O valor solicitado não pode ser maior que R$ ${valorMaximoEdital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (valor máximo do edital)`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSalvarEdicaoProjeto = async (tipo: string = '') => {
    if (!projeto || !projetoEditado) return;

    // Validar valor solicitado se estiver editando esse campo
    if (tipo === 'valor' && projetoEditado.valor_solicitado) {
      if (!validarValorSolicitado(projetoEditado.valor_solicitado)) {
        return; // Impede o salvamento se o valor for inválido
      }
    }

    try {
      // Preparar dados para atualização com base no tipo
      let dadosUpdate: any = {};

      switch (tipo) {
        case 'basico':
          dadosUpdate = {
            nome: projetoEditado.nome,
            descricao: projetoEditado.descricao,
            objetivos: projetoEditado.objetivos
          };
          break;
        case 'publico':
          dadosUpdate = {
            perfil_publico: projetoEditado.perfil_publico,
            publico_prioritario: projetoEditado.publico_prioritario,
            outro_publico_prioritario: projetoEditado.outro_publico_prioritario,
            acessibilidade_arquitetonica: projetoEditado.acessibilidade_arquitetonica,
            outra_acessibilidade_arquitetonica: projetoEditado.outra_acessibilidade_arquitetonica
          };
          break;
        case 'acessibilidade':
          dadosUpdate = {
            acessibilidade_comunicacional: projetoEditado.acessibilidade_comunicacional,
            outra_acessibilidade_comunicacional: projetoEditado.outra_acessibilidade_comunicacional,
            acessibilidade_atitudinal: projetoEditado.acessibilidade_atitudinal,
            implementacao_acessibilidade: projetoEditado.implementacao_acessibilidade
          };
          break;
        case 'cronograma':
          dadosUpdate = {
            local_execucao: projetoEditado.local_execucao,
            data_inicio: projetoEditado.data_inicio,
            data_final: projetoEditado.data_final,
            estrategia_divulgacao: projetoEditado.estrategia_divulgacao
          };
          break;
        case 'valor':
          dadosUpdate = {
            valor_solicitado: projetoEditado.valor_solicitado,
            outras_fontes: projetoEditado.outras_fontes,
            tipos_outras_fontes: projetoEditado.tipos_outras_fontes,
            detalhes_outras_fontes: projetoEditado.detalhes_outras_fontes,
            venda_produtos: projetoEditado.venda_produtos,
            detalhes_venda_produtos: projetoEditado.detalhes_venda_produtos,
            necessita_comprovante_residencia: projetoEditado.necessita_comprovante_residencia
          };
          break;
        case 'proponente':
          dadosUpdate = {
            proponente_id: projetoEditado.proponente_id
          };
          break;
        default:
          // Fallback: atualizar todos os campos
          dadosUpdate = {
            nome: projetoEditado.nome,
            descricao: projetoEditado.descricao,
            objetivos: projetoEditado.objetivos,
            perfil_publico: projetoEditado.perfil_publico,
            local_execucao: projetoEditado.local_execucao,
            data_inicio: projetoEditado.data_inicio,
            data_final: projetoEditado.data_final,
            valor_solicitado: projetoEditado.valor_solicitado
          };
      }

      const authClient = getAuthenticatedSupabaseClient('proponente');
      const { data, error } = await authClient
        .from('projetos')
        .update(dadosUpdate)
        .eq('id', projeto.id)
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Projeto atualizado com sucesso!",
      });
      
      // Fechar o modal apropriado
      setEditandoProjeto(false);
      setShowEditBasico(false);
      setShowEditPublico(false);
      setShowEditAcessibilidade(false);
      setShowEditCronograma(false);
      setShowEditProponente(false);
      setShowEditValor(false);
      setShowEditEquipe(false);
      setShowEditAtividades(false);
      setShowEditMetas(false);
      
      refresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar projeto",
        variant: "destructive",
      });
    }
  };

  const handleSalvarEquipe = async () => {
    if (!projetoId) return;

    try {
      const authClient = getAuthenticatedSupabaseClient('proponente');
      // Deletar todos os membros atuais
      const { error: deleteError } = await authClient
        .from('equipe_projeto')
        .delete()
        .eq('projeto_id', projetoId);

      if (deleteError) throw deleteError;

      // Inserir novos membros
      if (equipeTemp.length > 0) {
        const { error: insertError } = await authClient
          .from('equipe_projeto')
          .insert(
            equipeTemp.map(membro => ({
              projeto_id: projetoId,
              nome: membro.nome,
              funcao: membro.funcao,
              cpf_cnpj: membro.cpf_cnpj,
              indigena: membro.indigena,
              lgbtqiapn: membro.lgbtqiapn,
              preto_pardo: membro.preto_pardo,
              deficiencia: membro.deficiencia,
              mini_curriculo: membro.mini_curriculo
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Equipe atualizada com sucesso!",
      });

      setShowEditEquipe(false);
      refresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar equipe",
        variant: "destructive",
      });
    }
  };

  const handleAdicionarMembro = () => {
    if (!novoMembro.nome.trim() || !novoMembro.funcao.trim() || !novoMembro.cpf_cnpj.trim() || !novoMembro.mini_curriculo.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setEquipeTemp([...equipeTemp, { ...novoMembro, id: `temp-${Date.now()}` }]);
    setNovoMembro({
      nome: '',
      funcao: '',
      cpf_cnpj: '',
      indigena: false,
      lgbtqiapn: false,
      preto_pardo: false,
      deficiencia: false,
      mini_curriculo: ''
    });
    setShowModalNovoMembro(false);
  };

  const handleRemoverMembro = (index: number) => {
    setEquipeTemp(equipeTemp.filter((_, i) => i !== index));
  };

  const handleSalvarAtividades = async () => {
    if (!projetoId) return;

    try {
      // Deletar todas as atividades atuais
      const { error: deleteError } = await (supabase as any)
        .from('atividades_projeto')
        .delete()
        .eq('projeto_id', projetoId);

      if (deleteError) throw deleteError;

      // Inserir novas atividades com ordem baseada no índice
      if (atividadesTemp.length > 0) {
        const { error: insertError } = await (supabase as any)
          .from('atividades_projeto')
          .insert(
            atividadesTemp.map((atividade: any, index: number) => ({
              projeto_id: projetoId,
              nome_atividade: atividade.nome_atividade || atividade.nome,
              etapa: atividade.etapa,
              descricao: atividade.descricao,
              data_inicio: atividade.data_inicio,
              data_fim: atividade.data_fim,
              ordem: index + 1
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Atividades atualizadas com sucesso!",
      });

      setShowEditAtividades(false);
      refresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar atividades",
        variant: "destructive",
      });
    }
  };

  const handleAdicionarAtividade = () => {
    if (!novaAtividade.nome_atividade.trim() || !novaAtividade.etapa || !novaAtividade.descricao.trim() || !novaAtividade.data_inicio || !novaAtividade.data_fim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar se data_fim é posterior a data_inicio
    if (new Date(novaAtividade.data_fim) < new Date(novaAtividade.data_inicio)) {
      toast({
        title: "Erro",
        description: "A data final deve ser posterior à data de início",
        variant: "destructive",
      });
      return;
    }

    // Adicionar nova atividade e ordenar por data_inicio
    const novasAtividades = [...atividadesTemp, { 
      ...novaAtividade, 
      id: `temp-${Date.now()}`
    }].sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
    
    setAtividadesTemp(novasAtividades);
    setNovaAtividade({
      nome_atividade: '',
      etapa: '',
      descricao: '',
      data_inicio: '',
      data_fim: ''
    });
    setShowModalNovaAtividade(false);
  };

  const handleEditarAtividade = () => {
    if (!atividadeEditando) return;
    
    if (!atividadeEditando.nome_atividade?.trim() || !atividadeEditando.etapa || !atividadeEditando.descricao?.trim() || !atividadeEditando.data_inicio || !atividadeEditando.data_fim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar se data_fim é posterior a data_inicio
    if (new Date(atividadeEditando.data_fim) < new Date(atividadeEditando.data_inicio)) {
      toast({
        title: "Erro",
        description: "A data final deve ser posterior à data de início",
        variant: "destructive",
      });
      return;
    }

    // Atualizar atividade e reordenar por data_inicio
    const atividadesAtualizadas = atividadesTemp.map((a) => 
      a.id === atividadeEditando.id ? { ...atividadeEditando } : a
    ).sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());

    setAtividadesTemp(atividadesAtualizadas);
    setShowModalEditarAtividade(false);
    setAtividadeEditando(null);
  };

  const handleRemoverAtividade = (index: number) => {
    setAtividadesTemp(atividadesTemp.filter((_, i) => i !== index));
  };

  const handleAbrirEditarAtividade = (index: number) => {
    const atividade = atividadesTemp[index];
    setAtividadeEditando({ ...atividade });
    setShowModalEditarAtividade(true);
  };

  const handleSalvarMetas = async () => {
    if (!projetoId) return;

    try {
      // Deletar todas as metas atuais
      const { error: deleteError } = await (supabase as any)
        .from('metas_projeto')
        .delete()
        .eq('projeto_id', projetoId);

      if (deleteError) throw deleteError;

      // Inserir novas metas com ordem baseada no índice
      if (metasTemp.length > 0) {
        const { error: insertError } = await (supabase as any)
          .from('metas_projeto')
          .insert(
            metasTemp.map((meta: any, index: number) => ({
              projeto_id: projetoId,
              descricao: meta.descricao,
              ordem: index + 1
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Metas atualizadas com sucesso!",
      });

      setShowEditMetas(false);
      refresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar metas",
        variant: "destructive",
      });
    }
  };

  const handleAdicionarMeta = () => {
    if (!novaMeta.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Preencha a descrição da meta",
        variant: "destructive",
      });
      return;
    }

    setMetasTemp([...metasTemp, { 
      ...novaMeta, 
      id: `temp-${Date.now()}`
    }]);
    setNovaMeta({
      descricao: ''
    });
    setShowModalNovaMeta(false);
  };

  const handleEditarMeta = () => {
    if (!metaEditando) return;
    
    if (!metaEditando.descricao?.trim()) {
      toast({
        title: "Erro",
        description: "Preencha a descrição da meta",
        variant: "destructive",
      });
      return;
    }

    setMetasTemp(metasTemp.map((m) => 
      m.id === metaEditando.id ? { ...metaEditando } : m
    ));
    setShowModalEditarMeta(false);
    setMetaEditando(null);
  };

  const handleRemoverMeta = (index: number) => {
    setMetasTemp(metasTemp.filter((_, i) => i !== index));
  };

  const handleAbrirEditarMeta = (index: number) => {
    const meta = metasTemp[index];
    setMetaEditando({ ...meta });
    setShowModalEditarMeta(true);
  };

  const handleSalvarItensOrcamento = async () => {
    if (!projetoId) return;

    try {
      // Validar total: deve ser exatamente igual ao valor solicitado
      const total = calcularTotalOrcamento(itensOrcamentoTemp);
      const teto = projeto?.valor_solicitado || 0;
      if (teto > 0 && total !== teto) {
        toast({
          title: "Total diferente do Valor Solicitado",
          description: `O total do orçamento precisa ser exatamente R$ ${teto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Total atual: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
          variant: "destructive",
        });
        return;
      }

      // Deletar todos os itens atuais
      const { error: deleteError } = await (supabase as any)
        .from('itens_orcamento_projeto')
        .delete()
        .eq('projeto_id', projetoId);

      if (deleteError) throw deleteError;

      // Inserir novos itens com ordem baseada no índice
      if (itensOrcamentoTemp.length > 0) {
        const { error: insertError } = await (supabase as any)
          .from('itens_orcamento_projeto')
          .insert(
            itensOrcamentoTemp.map((item: any, index: number) => ({
              projeto_id: projetoId,
              descricao: item.descricao,
              justificativa: item.justificativa,
              unidade_medida: item.unidade_medida,
              valor_unitario: parseFloat(item.valor_unitario?.toString().replace(/[^\d,-]/g, '').replace(',', '.') || '0'),
              quantidade: parseInt(item.quantidade || '0'),
              referencia_preco: item.referencia_preco || '',
              ordem: index + 1
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Itens de orçamento atualizados com sucesso!",
      });

      setShowEditOrcamento(false);
      refresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar itens de orçamento",
        variant: "destructive",
      });
    }
  };

  const handleAdicionarItem = () => {
    if (!novoItem.descricao.trim() || !novoItem.justificativa.trim() || !novoItem.unidade_medida || !novoItem.valor_unitario || !novoItem.quantidade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar valor unitário
    const valor = parseFloat(novoItem.valor_unitario.replace(/[^\d,-]/g, '').replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      toast({
        title: "Erro",
        description: "Valor unitário inválido",
        variant: "destructive",
      });
      return;
    }

    // Validar quantidade
    const quantidade = parseInt(novoItem.quantidade);
    if (isNaN(quantidade) || quantidade <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade inválida",
        variant: "destructive",
      });
      return;
    }

    // Validar teto de valor solicitado
    const totalAtual = calcularTotalOrcamento(itensOrcamentoTemp);
    const novoTotal = totalAtual + (valor * quantidade);
    const teto = projeto?.valor_solicitado || 0;
    if (teto > 0 && novoTotal > teto) {
      toast({
        title: "Limite excedido",
        description: `Adicionar este item excede o valor solicitado (R$ ${teto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).` ,
        variant: "destructive",
      });
      return;
    }

    setItensOrcamentoTemp([...itensOrcamentoTemp, { 
      ...novoItem, 
      id: `temp-${Date.now()}`
    }]);
    setNovoItem({
      descricao: '',
      justificativa: '',
      unidade_medida: '',
      valor_unitario: '',
      quantidade: '',
      referencia_preco: '',
      ordem: ''
    });
    setShowModalNovoItem(false);
  };

  const handleEditarItem = () => {
    if (!itemEditando) return;
    
    if (!itemEditando.descricao?.trim() || !itemEditando.justificativa?.trim() || !itemEditando.unidade_medida || !itemEditando.valor_unitario || !itemEditando.quantidade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar valor unitário
    const valor = parseFloat(itemEditando.valor_unitario.toString().replace(/[^\d,-]/g, '').replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      toast({
        title: "Erro",
        description: "Valor unitário inválido",
        variant: "destructive",
      });
      return;
    }

    // Validar quantidade
    const quantidade = parseInt(itemEditando.quantidade.toString());
    if (isNaN(quantidade) || quantidade <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade inválida",
        variant: "destructive",
      });
      return;
    }

    // Validar teto considerando a substituição do item
    const original = itensOrcamentoTemp.find((i: any) => i.id === itemEditando.id);
    const totalAtual = calcularTotalOrcamento(itensOrcamentoTemp);
    const totalSemOriginal = totalAtual - (original ? parseValorMonetario(original.valor_unitario) * (typeof original.quantidade === 'number' ? original.quantidade : parseInt(original.quantidade || '0')) : 0);
    const novoTotal = totalSemOriginal + (valor * quantidade);
    const teto = projeto?.valor_solicitado || 0;
    if (teto > 0 && novoTotal > teto) {
      toast({
        title: "Limite excedido",
        description: `Esta edição excede o valor solicitado (R$ ${teto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
        variant: "destructive",
      });
      return;
    }

    setItensOrcamentoTemp(itensOrcamentoTemp.map((i) => 
      i.id === itemEditando.id ? { ...itemEditando } : i
    ));
    setShowModalEditarItem(false);
    setItemEditando(null);
  };

  const handleRemoverItem = (index: number) => {
    setItensOrcamentoTemp(itensOrcamentoTemp.filter((_, i) => i !== index));
  };

  const handleAbrirEditarItem = (index: number) => {
    const item = itensOrcamentoTemp[index];
    setItemEditando({ ...item });
    setShowModalEditarItem(true);
  };

  const handleSalvarPendencia = async () => {
    if (!novaPendencia.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma descrição para a pendência",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPendencia({
        projeto_id: projetoId!,
        text: novaPendencia,
        arquivo: arquivoUrl || null
      });

      toast({
        title: "Sucesso",
        description: "Pendência adicionada com sucesso!",
      });

      setShowPendenciaModal(false);
      setNovaPendencia('');
      setArquivoUrl('');
      refreshPendencias();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pendência",
        variant: "destructive",
      });
    }
  };

  const handleSolicitarNovaAvaliacao = async () => {
    // Verificar se só há uma avaliação
    if (avaliacoes.length !== 1) {
      toast({
        title: "Erro",
        description: "Você só pode solicitar uma nova avaliação se houver exatamente uma avaliação.",
        variant: "destructive",
      });
      setShowNovaAvaliacaoModal(false);
      return;
    }

    try {
      const authClient = getAuthenticatedSupabaseClient('proponente');
      // Criar a nova avaliação sem parecerista_id (null)
      const { error } = await authClient
        .from('avaliacoes')
        .insert({
          prefeitura_id: prefeitura?.id || '',
          projeto_id: projetoId!,
          parecerista_id: null,
          status: 'aguardando_parecerista'
        } as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Solicitação de nova avaliação enviada com sucesso!",
      });

      setShowNovaAvaliacaoModal(false);
      refreshAvaliacoes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao solicitar nova avaliação",
        variant: "destructive",
      });
    }
  };

  const handleUploadDocumento = async () => {
    if (!documentoParaUpload || !arquivoDoc) return;

    try {
      setEnviandoDocumento(true);
      // Buscar o documento atual para verificar se há arquivo antigo
      const documentoAtual = documentos.find(doc => doc.id === documentoParaUpload);
      
      // Deletar arquivo antigo se existir
      if (documentoAtual?.arquivo_url) {
        try {
          // Extrair o nome do arquivo da URL
          const urlParts = documentoAtual.arquivo_url.split('/');
          const oldFileName = urlParts[urlParts.length - 1];
          
          if (oldFileName) {
            const authClient = getAuthenticatedSupabaseClient('proponente');
            const { error: deleteError } = await authClient.storage
              .from('documentos_habilitacao')
              .remove([oldFileName]);

            // Não lança erro se o arquivo já não existir
            if (deleteError && !deleteError.message.includes('not found')) {
              console.error('Erro ao deletar arquivo antigo:', deleteError);
            }
          }
        } catch (deleteErr) {
          console.error('Erro ao tentar deletar arquivo antigo:', deleteErr);
          // Continua com o upload mesmo se não conseguir deletar
        }
      }

      // Upload do novo arquivo para o Supabase Storage
      const authClient = getAuthenticatedSupabaseClient('proponente');
      const fileExt = arquivoDoc.name.split('.').pop();
      const fileName = `${documentoParaUpload}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await authClient.storage
        .from('documentos_habilitacao')
        .upload(fileName, arquivoDoc);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = authClient.storage
        .from('documentos_habilitacao')
        .getPublicUrl(fileName);

      // Atualizar o documento
      await updateDocumento(documentoParaUpload, {
        arquivo_url: publicUrl,
        arquivo_nome: arquivoDoc.name,
        arquivo_tamanho: arquivoDoc.size,
        status: 'enviado',
        data_upload: new Date().toISOString(),
        motivo_rejeicao: null // Limpa o motivo de rejeição ao enviar novo arquivo
      });

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });

      setShowUploadDocModal(false);
      setDocumentoParaUpload(null);
      setArquivoDoc(null);
      refreshDocumentos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar documento",
        variant: "destructive",
      });
    } finally {
      setEnviandoDocumento(false);
    }
  };

  const handleSalvarNovaPrestacao = async () => {
    if (!novaPrestacaoNome.trim() || !novaPrestacaoValor) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setCarregandoPrestacao(true);

    try {
      // Upload dos arquivos para o Storage
      const authClient = getAuthenticatedSupabaseClient('proponente');
      let relatorioAtividadesUrl: string | null = null;
      let relatorioFinanceiroUrl: string | null = null;
      let comprovantesUrl: string | null = null;

      if (novaPrestacaoRelatorio) {
        const fileExt = novaPrestacaoRelatorio.name.split('.').pop();
        const fileName = `relatorio-atividades-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await authClient.storage
          .from('prestacoes_contas')
          .upload(fileName, novaPrestacaoRelatorio);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = authClient.storage
          .from('prestacoes_contas')
          .getPublicUrl(fileName);

        relatorioAtividadesUrl = publicUrl;
      }

      if (novaPrestacaoFinanceiro) {
        const fileExt = novaPrestacaoFinanceiro.name.split('.').pop();
        const fileName = `relatorio-financeiro-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await authClient.storage
          .from('prestacoes_contas')
          .upload(fileName, novaPrestacaoFinanceiro);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = authClient.storage
          .from('prestacoes_contas')
          .getPublicUrl(fileName);

        relatorioFinanceiroUrl = publicUrl;
      }

      if (novaPrestacaoComprovantes) {
        const fileExt = novaPrestacaoComprovantes.name.split('.').pop();
        const fileName = `comprovantes-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await authClient.storage
          .from('prestacoes_contas')
          .upload(fileName, novaPrestacaoComprovantes);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = authClient.storage
          .from('prestacoes_contas')
          .getPublicUrl(fileName);

        comprovantesUrl = publicUrl;
      }

      await createPrestacao({
        prefeitura_id: prefeitura?.id || '',
        projeto_id: projetoId!,
        proponente_id: proponente?.id || '',
        tipo: novaPrestacaoNome,
        valor_executado: parseFloat(novaPrestacaoValor),
        relatorio_atividades: relatorioAtividadesUrl,
        relatorio_financeiro: relatorioFinanceiroUrl,
        comprovantes_url: comprovantesUrl
      });

      toast({
        title: "Sucesso",
        description: "Prestação de contas criada com sucesso!",
      });

      setShowNovaPrestacaoModal(false);
      setNovaPrestacaoNome('');
      setNovaPrestacaoDescricao('');
      setNovaPrestacaoValor('');
      setNovaPrestacaoRelatorio(null);
      setNovaPrestacaoFinanceiro(null);
      setNovaPrestacaoComprovantes(null);
      refreshPrestacoes();
      setCarregandoPrestacao(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar prestação de contas",
        variant: "destructive",
      });
      setCarregandoPrestacao(false);
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
      'em_execucao': { label: 'Em Execução', color: 'bg-purple-100 text-purple-800', icon: <PlayCircle className="h-4 w-4" /> },
      'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> }
    };
    return configs[status as keyof typeof configs] || configs['rascunho'];
  };

  const getAbasPermitidas = (status: string) => {
    const abasPorStatus: { [key: string]: string[] } = {
      'aprovado': ['informacoes', 'avaliacao', 'documentacao', 'pendencias','prestacao','openbanking'],
      'aguardando_avaliacao': ['informacoes', 'avaliacao'],
      'recebido': ['informacoes', 'avaliacao'],
      'em_avaliacao': ['informacoes', 'avaliacao'],
      'avaliado': ['informacoes', 'avaliacao'],
      'rejeitado': ['informacoes', 'avaliacao', 'pendencias'],
      'em_execucao': ['informacoes', 'avaliacao', 'documentacao', 'pendencias', 'prestacao', 'openbanking'],
      'concluido': ['informacoes', 'avaliacao', 'documentacao', 'pendencias', 'prestacao', 'openbanking'],
      'rascunho': ['informacoes', 'avaliacao', 'documentacao', 'pendencias', 'prestacao', 'openbanking']
    };
    return abasPorStatus[status] || abasPorStatus['rascunho'];
  };

  const handleVincularMovimentacao = async () => {
    if (!prestacaoSelecionada || !movimentacaoSelecionada) {
      toast({
        title: "Erro",
        description: "Selecione uma movimentação",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePrestacao(prestacaoSelecionada, {
        movimentacao_financeira_id: movimentacaoSelecionada
      });

      toast({
        title: "Sucesso",
        description: "Movimentação vinculada com sucesso!",
      });

      setShowVinculacaoModal(false);
      setPrestacaoSelecionada(null);
      setMovimentacaoSelecionada('');
      refreshPrestacoes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao vincular movimentação",
        variant: "destructive",
      });
    }
  };

  const handleExcluirPrestacao = async (id: string) => {
    const prestacao = prestacoes.find(p => p.id === id);
    
    if (prestacao?.status !== 'pendente' && prestacao?.status !== 'em_analise') {
      toast({
        title: "Erro",
        description: "Só é possível excluir prestações não avaliadas",
        variant: "destructive",
      });
      return;
    }

    try {
      await deletePrestacao(id);
      toast({
        title: "Sucesso",
        description: "Prestação de contas excluída!",
      });
      refreshPrestacoes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir prestação",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <ProponenteLayout 
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
      </ProponenteLayout>
    );
  }

  if (loading) {
    return (
      <ProponenteLayout 
        title="Detalhes do Projeto" 
        description="Visualize os detalhes completos do projeto"
      >
        <div className="p-6">
          <div className="text-center">
            <p>Carregando detalhes do projeto...</p>
          </div>
        </div>
      </ProponenteLayout>
    );
  }

  if (!projeto) {
    return (
      <ProponenteLayout 
        title="Detalhes do Projeto" 
        description="Visualize os detalhes completos do projeto"
      >
        <div className="p-6">
          <div className="text-center">
            <p>Projeto não encontrado.</p>
            <Button 
              onClick={() => navigate(`/${nomePrefeitura}/proponente/projetos`)}
              className="mt-4"
            >
              Voltar para Projetos
            </Button>
          </div>
        </div>
      </ProponenteLayout>
    );
  }

  const statusConfig = getStatusConfig(projeto.status);
  const abasPermitidas = getAbasPermitidas(projeto.status);

  // Definir todas as abas disponíveis
  const todasAbas = [
    { value: 'informacoes', label: 'Informações Gerais' },
    { value: 'avaliacao', label: 'Avaliação' },
    { value: 'documentacao', label: 'Documentação' },
    { value: 'pendencias', label: 'Pendências' },
    { value: 'prestacao', label: 'Prestação de Contas' },
    { value: 'openbanking', label: 'OpenBanking' }
  ];

  // Filtrar apenas as abas permitidas
  const abasParaMostrar = todasAbas.filter(aba => abasPermitidas.includes(aba.value));
  
  // Determinar classe CSS para o grid baseado no número de colunas
  const getGridColsClass = (numCols: number) => {
    const colClasses: { [key: number]: string } = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6'
    };
    return colClasses[numCols] || 'grid-cols-6';
  };

  const gridColsClass = getGridColsClass(abasParaMostrar.length);

  return (
    <ProponenteLayout 
      title="Detalhes do Projeto" 
      description="Visualize os detalhes completos do projeto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/${nomePrefeitura}/proponente/projetos`)}
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
          <TabsList className={`grid w-full ${gridColsClass}`}>
            {abasParaMostrar.map(aba => (
              <TabsTrigger key={aba.value} value={aba.value}>{aba.label}</TabsTrigger>
            ))}
          </TabsList>

          {/* Informações Gerais */}
          {abasPermitidas.includes('informacoes') && (
          <TabsContent value="informacoes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informações Básicas
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditBasico(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Público e Acessibilidade
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditPublico(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Acessibilidade Comunicacional e Atitudinal
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditAcessibilidade(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Cronograma e Local
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditCronograma(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Local de Execução</label>
                    <p className="text-sm">{projeto.local_execucao || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Início</label>
                    <p className="text-sm">
                      {projeto.data_inicio ? formatarData(projeto.data_inicio) : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Final</label>
                    <p className="text-sm">
                      {projeto.data_final ? formatarData(projeto.data_final) : 'Não informado'}
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

              {/* Proponente */}
              <Card className={`col-span-1 lg:col-span-2 ${projeto.proponente?.tipo === "PF" ? "border-l-4 border-l-blue-600" : "border-l-4 border-l-green-600"}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
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
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditProponente(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                                    {[
                                      projeto.proponente.endereco_responsavel,
                                      projeto.proponente.numero_responsavel,
                                      projeto.proponente.complemento_responsavel
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {[
                                      projeto.proponente.cidade_responsavel,
                                      projeto.proponente.estado_responsavel,
                                      projeto.proponente.cep_responsavel
                                    ].filter(Boolean).join(' - ')}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Dados Pessoais */}
                            {(projeto.proponente.comunidade_tradicional_responsavel || projeto.proponente.genero_responsavel || projeto.proponente.raca_responsavel || projeto.proponente.escolaridade_responsavel || projeto.proponente.renda_mensal_responsavel) && (
                              <div className="pt-4 border-t">
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

            {/* Grid com Valor e Financiamento e Orçamento lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valor e Financiamento */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Valor e Financiamento
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditValor(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Orçamento Detalhado
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditOrcamento(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                    <p className="text-center text-gray-500 py-8">
                      Nenhum item de orçamento cadastrado.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Equipe */}
            {projeto.equipe && projeto.equipe.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Equipe do Projeto
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditEquipe(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projeto.equipe.map((membro, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{membro.nome}</p>
                            <p className="text-sm text-gray-500">{membro.funcao}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          <p><span className="font-medium">CPF/CNPJ:</span> {(membro as any).cpf_cnpj || '—'}</p>
                          <div className="flex flex-wrap gap-2">
                            {(membro as any).indigena && <Badge variant="outline">Indígena</Badge>}
                            {(membro as any).lgbtqiapn && <Badge variant="outline">LGBTQIAPN+</Badge>}
                            {(membro as any).preto_pardo && <Badge variant="outline">Preto/Pardo</Badge>}
                            {(membro as any).deficiencia && <Badge variant="outline">PCD</Badge>}
                          </div>
                        </div>
                        {(membro as any).mini_curriculo && (
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{(membro as any).mini_curriculo}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Atividades */}
            {projeto.atividades && projeto.atividades.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Atividades Planejadas
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditAtividades(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                                      title={`${(a as any).etapa || ''}`}
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

                        {/* Lista detalhada abaixo do Gantt */}
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Metas do Projeto
                    </CardTitle>
                    {podeEditarProjeto() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditMetas(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
          )}

          {/* Avaliação */}
          {abasPermitidas.includes('avaliacao') && (
          <TabsContent value="avaliacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Avaliações do Projeto
                </CardTitle>
                <CardDescription>
                  Visualize as avaliações do seu projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAvaliacoes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Carregando avaliações...</p>
                  </div>
                ) : avaliacaoFinal && avaliacaoFinal.status === 'avaliado' ? (
                  // Mostrar avaliação final quando o projeto estiver avaliado
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg text-gray-900">
                              Avaliação Final Consolidada
                            </h4>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Avaliado
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">Pareceristas:</span>
                              <p>{avaliacaoFinal.quantidade_pareceristas || 0}</p>
                            </div>
                            {avaliacaoFinal.nota_final !== null && avaliacaoFinal.nota_final !== undefined && (
                              <div>
                                <span className="font-medium">Nota Final:</span>
                                <p className="font-bold text-lg text-blue-600">{Number(avaliacaoFinal.nota_final).toFixed(1)}</p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Status:</span>
                              <p className="font-medium">Avaliado</p>
                            </div>
                          </div>

                          {/* Notas detalhadas - Critérios Obrigatórios */}
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

                          {/* Critérios Bônus */}
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
                ) : avaliacoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma avaliação no momento.</p>
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
                                  <p>{formatarData(avaliacao.data_atribuicao)}</p>
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              {projeto.status === 'rejeitado' && avaliacoes.length === 1 && (
                <CardFooter>
                  <Button onClick={() => setShowNovaAvaliacaoModal(true)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Solicitar Nova Avaliação
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          )}

          {/* Documentação */}
          {abasPermitidas.includes('documentacao') && (
          <TabsContent value="documentacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Documentos de Habilitação
                </CardTitle>
                <CardDescription>
                  Envie os documentos necessários para habilitação do projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDocumentos ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Carregando documentos...</p>
                  </div>
                ) : documentos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum documento disponível no momento.</p>
                    <p className="text-sm">Os documentos aparecerão aqui quando necessário.</p>
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
                                    <p>{formatarData(doc.data_solicitacao)}</p>
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

                              {/* Motivo de Rejeição */}
                              {doc.status === 'rejeitado' && doc.motivo_rejeicao && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                  <Label className="text-sm font-semibold text-red-800">Motivo de Rejeição</Label>
                                  <p className="text-sm text-red-700 mt-1">{doc.motivo_rejeicao}</p>
                                </div>
                              )}

                              {/* Botão de Upload para Proponente */}
                              {(doc.status === 'pendente' || doc.status === 'rejeitado') && (
                                <div className="mt-3">
                                  <Button
                                    onClick={() => {
                                      setDocumentoParaUpload(doc.id);
                                      setShowUploadDocModal(true);
                                    }}
                                    variant="outline"
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {doc.status === 'rejeitado' ? 'Enviar Novo Arquivo' : 'Enviar Documento'}
                                  </Button>
                                </div>
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
          )}

          {/* Pendências */}
          {abasPermitidas.includes('pendencias') && (
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
                
                </div>
              </CardHeader>
              <CardContent>
                {loadingPendencias ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Carregando pendências...</p>
                  </div>
                ) : pendencias.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma pendência no momento.</p>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Prestação de Contas */}
          {abasPermitidas.includes('prestacao') && (
          <TabsContent value="prestacao" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Prestação de Contas
                    </CardTitle>
                    <CardDescription>
                      Relatórios de execução financeira e prestação de contas
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowNovaPrestacaoModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Prestação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPrestacoes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Carregando prestações de contas...</p>
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

                            

                              {prestacao.comprovantes_url && (
                                <div className="mt-3">
                                  <span className="text-gray-500 text-sm">Comprovantes:</span>
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

                            </div>

                            {/* Botões de Ação - Apenas para Proponente */}
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
                                Vincular Movimentação
                              </Button>
                              
                              {(prestacao.status === 'pendente' || prestacao.status === 'em_analise') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExcluirPrestacao(prestacao.id)}
                                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
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
          )}

          {/* OpenBanking */}
          {abasPermitidas.includes('openbanking') && (
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
                ) : contas.length === 0 ? (
                  <div className="text-center py-8">
                    <Banknote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Nenhuma conta bancária vinculada ao projeto</p>
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
          )}
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
              onClick={handleSalvarPendencia}
              disabled={!novaPendencia.trim()}
            >
              Criar Pendência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para solicitar nova avaliação */}
      <Dialog open={showNovaAvaliacaoModal} onOpenChange={setShowNovaAvaliacaoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Nova Avaliação</DialogTitle>
            <DialogDescription>
              Sua solicitação de nova avaliação será enviada para análise.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNovaAvaliacaoModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSolicitarNovaAvaliacao}>
              Confirmar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar informações gerais */}
      <Dialog open={editandoProjeto} onOpenChange={setEditandoProjeto}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Informações do Projeto</DialogTitle>
            <DialogDescription>
              Edite as informações do projeto. As alterações serão salvas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Projeto *</Label>
              <Input
                id="nome"
                value={projetoEditado?.nome || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, nome: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={projetoEditado?.descricao || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, descricao: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="objetivos">Objetivos *</Label>
              <Textarea
                id="objetivos"
                value={projetoEditado?.objetivos || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, objetivos: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="perfil_publico">Perfil do Público</Label>
              <Input
                id="perfil_publico"
                value={projetoEditado?.perfil_publico || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, perfil_publico: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="local_execucao">Local de Execução</Label>
              <Input
                id="local_execucao"
                value={projetoEditado?.local_execucao || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, local_execucao: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={projetoEditado?.data_inicio ? new Date(projetoEditado.data_inicio).toISOString().split('T')[0] : ''}
                  onChange={(e) => setProjetoEditado({ ...projetoEditado, data_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="data_final">Data Final</Label>
                <Input
                  id="data_final"
                  type="date"
                  value={projetoEditado?.data_final ? new Date(projetoEditado.data_final).toISOString().split('T')[0] : ''}
                  onChange={(e) => setProjetoEditado({ ...projetoEditado, data_final: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="valor_solicitado">Valor Solicitado</Label>
              <Input
                id="valor_solicitado"
                type="number"
                step="0.01"
                value={projetoEditado?.valor_solicitado || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, valor_solicitado: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditandoProjeto(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleSalvarEdicaoProjeto()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Informações Básicas */}
      <Dialog open={showEditBasico} onOpenChange={setShowEditBasico}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Informações Básicas</DialogTitle>
            <DialogDescription>
              Edite as informações básicas do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Projeto *</Label>
              <Input
                id="nome"
                value={projetoEditado?.nome || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, nome: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={projetoEditado?.descricao || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, descricao: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="objetivos">Objetivos *</Label>
              <Textarea
                id="objetivos"
                value={projetoEditado?.objetivos || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, objetivos: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditBasico(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleSalvarEdicaoProjeto('basico')}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Público e Acessibilidade */}
      <Dialog open={showEditPublico} onOpenChange={setShowEditPublico}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Público e Acessibilidade</DialogTitle>
            <DialogDescription>
              Edite as informações sobre público e acessibilidade do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="perfil_publico">Perfil do Público</Label>
              <Textarea
                id="perfil_publico"
                value={projetoEditado?.perfil_publico || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, perfil_publico: e.target.value })}
                rows={3}
              />
            </div>
            
            <div>
              <Label>Público Prioritário (múltipla escolha)</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {publicoPrioritarioOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`publico-${option}`}
                      checked={projetoEditado?.publico_prioritario?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const atual = projetoEditado?.publico_prioritario || [];
                        if (checked) {
                          setProjetoEditado({ 
                            ...projetoEditado, 
                            publico_prioritario: [...atual, option] 
                          });
                        } else {
                          setProjetoEditado({ 
                            ...projetoEditado, 
                            publico_prioritario: atual.filter((item: string) => item !== option)
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`publico-${option}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {projetoEditado?.publico_prioritario?.includes("Outros") && (
              <div>
                <Label htmlFor="outro_publico_prioritario">Outro Público Prioritário</Label>
                <Input
                  id="outro_publico_prioritario"
                  value={projetoEditado?.outro_publico_prioritario || ''}
                  onChange={(e) => setProjetoEditado({ ...projetoEditado, outro_publico_prioritario: e.target.value })}
                />
              </div>
            )}
            
            <div>
              <Label>Acessibilidade Arquitetônica (múltipla escolha)</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {acessibilidadeArquitetonicaOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`acessibilidade-${option}`}
                      checked={projetoEditado?.acessibilidade_arquitetonica?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const atual = projetoEditado?.acessibilidade_arquitetonica || [];
                        if (checked) {
                          setProjetoEditado({ 
                            ...projetoEditado, 
                            acessibilidade_arquitetonica: [...atual, option] 
                          });
                        } else {
                          setProjetoEditado({ 
                            ...projetoEditado, 
                            acessibilidade_arquitetonica: atual.filter((item: string) => item !== option)
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`acessibilidade-${option}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {projetoEditado?.acessibilidade_arquitetonica?.includes("Outra") && (
              <div>
                <Label htmlFor="outra_acessibilidade_arquitetonica">Outra Acessibilidade Arquitetônica</Label>
                <Input
                  id="outra_acessibilidade_arquitetonica"
                  value={projetoEditado?.outra_acessibilidade_arquitetonica || ''}
                  onChange={(e) => setProjetoEditado({ ...projetoEditado, outra_acessibilidade_arquitetonica: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditPublico(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleSalvarEdicaoProjeto('publico')}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Acessibilidade Comunicacional e Atitudinal */}
      <Dialog open={showEditAcessibilidade} onOpenChange={setShowEditAcessibilidade}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Acessibilidade Comunicacional e Atitudinal</DialogTitle>
            <DialogDescription>
              Edite as informações sobre acessibilidade comunicacional e atitudinal do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Acessibilidade Comunicacional (múltipla escolha)</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {acessibilidadeComunicacionalOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`comunicacional-${option}`}
                      checked={projetoEditado?.acessibilidade_comunicacional?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const atual = projetoEditado?.acessibilidade_comunicacional || [];
                        if (checked) {
                          setProjetoEditado({ 
                            ...projetoEditado, 
                            acessibilidade_comunicacional: [...atual, option] 
                          });
                        } else {
                          setProjetoEditado({ 
                            ...projetoEditado, 
                            acessibilidade_comunicacional: atual.filter((item: string) => item !== option)
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`comunicacional-${option}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {projetoEditado?.acessibilidade_comunicacional?.includes("Outra") && (
              <div>
                <Label htmlFor="outra_acessibilidade_comunicacional">Outra Acessibilidade Comunicacional</Label>
                <Input
                  id="outra_acessibilidade_comunicacional"
                  value={projetoEditado?.outra_acessibilidade_comunicacional || ''}
                  onChange={(e) => setProjetoEditado({ ...projetoEditado, outra_acessibilidade_comunicacional: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label>Acessibilidade Atitudinal (múltipla escolha)</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {acessibilidadeAtitudinalOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`atitudinal-${option}`}
                      checked={projetoEditado?.acessibilidade_atitudinal?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const atual = projetoEditado?.acessibilidade_atitudinal || [];
                        if (checked) {
                          setProjetoEditado({ 
                            ...projetoEditado, 
                            acessibilidade_atitudinal: [...atual, option] 
                          });
                        } else {
                          setProjetoEditado({ 
                            ...projetoEditado, 
                            acessibilidade_atitudinal: atual.filter((item: string) => item !== option)
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`atitudinal-${option}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="implementacao_acessibilidade">Implementação de Acessibilidade</Label>
              <Textarea
                id="implementacao_acessibilidade"
                value={projetoEditado?.implementacao_acessibilidade || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, implementacao_acessibilidade: e.target.value })}
                rows={4}
                placeholder="Descreva como a acessibilidade será implementada no projeto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditAcessibilidade(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleSalvarEdicaoProjeto('acessibilidade')}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Cronograma e Local */}
      <Dialog open={showEditCronograma} onOpenChange={setShowEditCronograma}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cronograma e Local</DialogTitle>
            <DialogDescription>
              Edite as informações sobre cronograma e local de execução do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="local_execucao">Local de Execução</Label>
              <Input
                id="local_execucao"
                value={projetoEditado?.local_execucao || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, local_execucao: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={projetoEditado?.data_inicio ? new Date(projetoEditado.data_inicio).toISOString().split('T')[0] : ''}
                  onChange={(e) => setProjetoEditado({ ...projetoEditado, data_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="data_final">Data Final</Label>
                <Input
                  id="data_final"
                  type="date"
                  value={projetoEditado?.data_final ? new Date(projetoEditado.data_final).toISOString().split('T')[0] : ''}
                  onChange={(e) => setProjetoEditado({ ...projetoEditado, data_final: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="estrategia_divulgacao">Estratégia de Divulgação</Label>
              <Textarea
                id="estrategia_divulgacao"
                value={projetoEditado?.estrategia_divulgacao || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, estrategia_divulgacao: e.target.value })}
                rows={4}
                placeholder="Descreva a estratégia de divulgação do projeto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditCronograma(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleSalvarEdicaoProjeto('cronograma')}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Proponente */}
      <Dialog open={showEditProponente} onOpenChange={setShowEditProponente}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Proponente</DialogTitle>
            <DialogDescription>
              Selecione um novo proponente para associar a este projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="proponente-select">Selecione o Proponente</Label>
              {loadingProponentes ? (
                <p className="text-sm text-gray-500 mt-2">Carregando proponentes...</p>
              ) : (
                <Select 
                  value={projetoEditado?.proponente_id || ''} 
                  onValueChange={(value) => setProjetoEditado({ ...projetoEditado, proponente_id: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione um proponente" />
                  </SelectTrigger>
                  <SelectContent>
                    {proponentesDisponiveis.map((p) => {
                      const displayText = `${p.nome} (${p.tipo})${p.cpf ? ` - CPF: ${p.cpf}` : ''}${p.cnpj ? ` - CNPJ: ${p.cnpj}` : ''}`;
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          {displayText}
                        </SelectItem>
                      );
                    })}
                    {proponentesDisponiveis.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhum proponente disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Para cadastrar um novo proponente, acesse a tela "Proponentes" no menu lateral.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditProponente(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleSalvarEdicaoProjeto('proponente')}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Valor e Financiamento */}
      <Dialog open={showEditValor} onOpenChange={setShowEditValor}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Valor e Financiamento</DialogTitle>
            <DialogDescription>
              Edite as informações sobre valor e financiamento do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="valor_solicitado">Valor Solicitado</Label>
              <Input
                id="valor_solicitado"
                type="number"
                step="0.01"
                value={projetoEditado?.valor_solicitado || ''}
                onChange={(e) => setProjetoEditado({ ...projetoEditado, valor_solicitado: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              {((projeto?.edital as any)?.valor_maximo) && (
                <p className="text-sm text-gray-500 mt-1">
                  Valor máximo do edital: R$ {(projeto.edital as any).valor_maximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="outras_fontes"
                checked={projetoEditado?.outras_fontes || false}
                onCheckedChange={(checked) => setProjetoEditado({ ...projetoEditado, outras_fontes: checked as boolean })}
              />
              <label
                htmlFor="outras_fontes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Outras Fontes de Financiamento
              </label>
            </div>

            {projetoEditado?.outras_fontes && (
              <>
                <div>
                  <Label>Tipos de Outras Fontes (múltipla escolha)</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {tiposOutrasFontesOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`outras_fontes-${option}`}
                          checked={projetoEditado?.tipos_outras_fontes?.includes(option) || false}
                          onCheckedChange={(checked) => {
                            const atual = projetoEditado?.tipos_outras_fontes || [];
                            if (checked) {
                              setProjetoEditado({ 
                                ...projetoEditado, 
                                tipos_outras_fontes: [...atual, option] 
                              });
                            } else {
                              setProjetoEditado({ 
                                ...projetoEditado, 
                                tipos_outras_fontes: atual.filter((item: string) => item !== option)
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`outras_fontes-${option}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="detalhes_outras_fontes">Detalhes das Outras Fontes</Label>
                  <Textarea
                    id="detalhes_outras_fontes"
                    value={projetoEditado?.detalhes_outras_fontes || ''}
                    onChange={(e) => setProjetoEditado({ ...projetoEditado, detalhes_outras_fontes: e.target.value })}
                    rows={3}
                    placeholder="Descreva os detalhes das outras fontes de financiamento..."
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="venda_produtos"
                checked={projetoEditado?.venda_produtos || false}
                onCheckedChange={(checked) => setProjetoEditado({ ...projetoEditado, venda_produtos: checked as boolean })}
              />
              <label
                htmlFor="venda_produtos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Venda de Produtos
              </label>
            </div>

            {projetoEditado?.venda_produtos && (
              <div>
                <Label htmlFor="detalhes_venda_produtos">Detalhes da Venda de Produtos</Label>
                <Textarea
                  id="detalhes_venda_produtos"
                  value={projetoEditado?.detalhes_venda_produtos || ''}
                  onChange={(e) => setProjetoEditado({ ...projetoEditado, detalhes_venda_produtos: e.target.value })}
                  rows={3}
                  placeholder="Descreva os detalhes da venda de produtos..."
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="necessita_comprovante_residencia"
                checked={projetoEditado?.necessita_comprovante_residencia || false}
                onCheckedChange={(checked) => setProjetoEditado({ ...projetoEditado, necessita_comprovante_residencia: checked as boolean })}
              />
              <label
                htmlFor="necessita_comprovante_residencia"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Necessita Comprovante de Residência
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditValor(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleSalvarEdicaoProjeto('valor')}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Equipe do Projeto */}
      <Dialog open={showEditEquipe} onOpenChange={setShowEditEquipe}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Equipe do Projeto</DialogTitle>
            <DialogDescription>
              Gerencie os membros da equipe do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowModalNovoMembro(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
            
            {equipeTemp.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum membro da equipe cadastrado. Clique em "Adicionar Membro" para começar.
              </p>
            ) : (
              <div className="space-y-3">
                {equipeTemp.map((membro, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{membro.nome}</h4>
                        <p className="text-sm text-gray-600">{membro.funcao}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverMembro(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p><span className="font-medium">CPF/CNPJ:</span> {membro.cpf_cnpj}</p>
                      <div className="flex flex-wrap gap-2">
                        {membro.indigena && <Badge variant="outline">Indígena</Badge>}
                        {membro.lgbtqiapn && <Badge variant="outline">LGBTQIAPN+</Badge>}
                        {membro.preto_pardo && <Badge variant="outline">Preto/Pardo</Badge>}
                        {membro.deficiencia && <Badge variant="outline">PCD</Badge>}
                      </div>
                    </div>
                    {membro.mini_curriculo && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{membro.mini_curriculo}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditEquipe(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarEquipe}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar novo membro da equipe */}
      <Dialog open={showModalNovoMembro} onOpenChange={setShowModalNovoMembro}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Membro da Equipe</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo membro da equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="membro-nome">Nome Completo *</Label>
                <Input
                  id="membro-nome"
                  value={novoMembro.nome}
                  onChange={(e) => setNovoMembro({ ...novoMembro, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="membro-funcao">Função no Projeto *</Label>
                <Input
                  id="membro-funcao"
                  value={novoMembro.funcao}
                  onChange={(e) => setNovoMembro({ ...novoMembro, funcao: e.target.value })}
                  placeholder="Ex: Diretor artístico"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="membro-cpf_cnpj">CPF/CNPJ *</Label>
              <Input
                id="membro-cpf_cnpj"
                value={aplicarMascaraDocumento(novoMembro.cpf_cnpj)}
                onChange={(e) => setNovoMembro({ ...novoMembro, cpf_cnpj: e.target.value })}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18}
              />
            </div>

            <div>
              <Label>Características</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membro-indigena"
                    checked={novoMembro.indigena}
                    onCheckedChange={(checked) => setNovoMembro({ ...novoMembro, indigena: checked as boolean })}
                  />
                  <label htmlFor="membro-indigena" className="text-sm font-medium cursor-pointer">
                    Pessoa Indígena
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membro-lgbtqiapn"
                    checked={novoMembro.lgbtqiapn}
                    onCheckedChange={(checked) => setNovoMembro({ ...novoMembro, lgbtqiapn: checked as boolean })}
                  />
                  <label htmlFor="membro-lgbtqiapn" className="text-sm font-medium cursor-pointer">
                    LGBTQIAPN+
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membro-preto_pardo"
                    checked={novoMembro.preto_pardo}
                    onCheckedChange={(checked) => setNovoMembro({ ...novoMembro, preto_pardo: checked as boolean })}
                  />
                  <label htmlFor="membro-preto_pardo" className="text-sm font-medium cursor-pointer">
                    Pessoa Preta ou Parda
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membro-deficiencia"
                    checked={novoMembro.deficiencia}
                    onCheckedChange={(checked) => setNovoMembro({ ...novoMembro, deficiencia: checked as boolean })}
                  />
                  <label htmlFor="membro-deficiencia" className="text-sm font-medium cursor-pointer">
                    Pessoa com deficiência
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="membro-mini_curriculo">Mini Currículo *</Label>
              <Textarea
                id="membro-mini_curriculo"
                value={novoMembro.mini_curriculo}
                onChange={(e) => setNovoMembro({ ...novoMembro, mini_curriculo: e.target.value })}
                rows={4}
                placeholder="Descreva brevemente a experiência profissional do membro da equipe..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModalNovoMembro(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdicionarMembro}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Atividades Planejadas */}
      <Dialog open={showEditAtividades} onOpenChange={setShowEditAtividades}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Atividades Planejadas</DialogTitle>
            <DialogDescription>
              Gerencie as atividades planejadas do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowModalNovaAtividade(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atividade
              </Button>
            </div>
            
            {atividadesTemp.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma atividade cadastrada. Clique em "Adicionar Atividade" para começar.
              </p>
            ) : (
              <div className="space-y-3">
                {atividadesTemp.map((atividade, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{atividade.nome_atividade || atividade.nome}</h4>
                        <p className="text-sm text-gray-600">Etapa: {atividade.etapa}</p>
                        <p className="text-sm text-gray-700 mt-2">{atividade.descricao}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirEditarAtividade(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverAtividade(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p><span className="font-medium">Data de Início:</span> {formatarData(atividade.data_inicio)}</p>
                      <p><span className="font-medium">Data de Fim:</span> {formatarData(atividade.data_fim)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditAtividades(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarAtividades}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar nova atividade */}
      <Dialog open={showModalNovaAtividade} onOpenChange={setShowModalNovaAtividade}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Atividade</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova atividade
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="atividade-nome">Nome da Atividade *</Label>
              <Input
                id="atividade-nome"
                value={novaAtividade.nome_atividade}
                onChange={(e) => setNovaAtividade({ ...novaAtividade, nome_atividade: e.target.value })}
                placeholder="Ex: Produção do espetáculo"
              />
            </div>

            <div>
              <Label htmlFor="atividade-etapa">Etapa *</Label>
              <Select 
                value={novaAtividade.etapa} 
                onValueChange={(value) => setNovaAtividade({ ...novaAtividade, etapa: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pré-produção">Pré-produção</SelectItem>
                  <SelectItem value="Produção">Produção</SelectItem>
                  <SelectItem value="Pós-produção">Pós-produção</SelectItem>
                  <SelectItem value="Divulgação">Divulgação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="atividade-descricao">Descrição *</Label>
              <Textarea
                id="atividade-descricao"
                value={novaAtividade.descricao}
                onChange={(e) => setNovaAtividade({ ...novaAtividade, descricao: e.target.value })}
                rows={4}
                placeholder="Descreva detalhadamente a atividade..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="atividade-data-inicio">Data de Início *</Label>
                <Input
                  id="atividade-data-inicio"
                  type="date"
                  value={novaAtividade.data_inicio}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, data_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="atividade-data-fim">Data de Fim *</Label>
                <Input
                  id="atividade-data-fim"
                  type="date"
                  value={novaAtividade.data_fim}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, data_fim: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModalNovaAtividade(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdicionarAtividade}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar atividade */}
      <Dialog open={showModalEditarAtividade} onOpenChange={setShowModalEditarAtividade}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
            <DialogDescription>
              Edite os dados da atividade
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-atividade-nome">Nome da Atividade *</Label>
              <Input
                id="edit-atividade-nome"
                value={atividadeEditando?.nome_atividade || atividadeEditando?.nome || ''}
                onChange={(e) => setAtividadeEditando({ ...atividadeEditando, nome_atividade: e.target.value })}
                placeholder="Ex: Produção do espetáculo"
              />
            </div>

            <div>
              <Label htmlFor="edit-atividade-etapa">Etapa *</Label>
              <Select 
                value={atividadeEditando?.etapa || ''} 
                onValueChange={(value) => setAtividadeEditando({ ...atividadeEditando, etapa: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pré-produção">Pré-produção</SelectItem>
                  <SelectItem value="Produção">Produção</SelectItem>
                  <SelectItem value="Pós-produção">Pós-produção</SelectItem>
                  <SelectItem value="Divulgação">Divulgação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-atividade-descricao">Descrição *</Label>
              <Textarea
                id="edit-atividade-descricao"
                value={atividadeEditando?.descricao || ''}
                onChange={(e) => setAtividadeEditando({ ...atividadeEditando, descricao: e.target.value })}
                rows={4}
                placeholder="Descreva detalhadamente a atividade..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-atividade-data-inicio">Data de Início *</Label>
                <Input
                  id="edit-atividade-data-inicio"
                  type="date"
                  value={atividadeEditando?.data_inicio || ''}
                  onChange={(e) => setAtividadeEditando({ ...atividadeEditando, data_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-atividade-data-fim">Data de Fim *</Label>
                <Input
                  id="edit-atividade-data-fim"
                  type="date"
                  value={atividadeEditando?.data_fim || ''}
                  onChange={(e) => setAtividadeEditando({ ...atividadeEditando, data_fim: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModalEditarAtividade(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditarAtividade}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Metas do Projeto */}
      <Dialog open={showEditMetas} onOpenChange={setShowEditMetas}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Metas do Projeto</DialogTitle>
            <DialogDescription>
              Gerencie as metas do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowModalNovaMeta(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Meta
              </Button>
            </div>
            
            {metasTemp.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma meta cadastrada. Clique em "Adicionar Meta" para começar.
              </p>
            ) : (
              <div className="space-y-3">
                {metasTemp.map((meta, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-500 mt-1">{index + 1}.</span>
                          <p className="text-sm text-gray-700">{meta.descricao}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirEditarMeta(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverMeta(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditMetas(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarMetas}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar nova meta */}
      <Dialog open={showModalNovaMeta} onOpenChange={setShowModalNovaMeta}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Meta</DialogTitle>
            <DialogDescription>
              Preencha a descrição da nova meta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meta-descricao">Descrição da Meta *</Label>
              <Textarea
                id="meta-descricao"
                value={novaMeta.descricao}
                onChange={(e) => setNovaMeta({ ...novaMeta, descricao: e.target.value })}
                rows={4}
                placeholder="Descreva a meta do projeto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModalNovaMeta(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdicionarMeta}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar meta */}
      <Dialog open={showModalEditarMeta} onOpenChange={setShowModalEditarMeta}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Edite a descrição da meta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-meta-descricao">Descrição da Meta *</Label>
              <Textarea
                id="edit-meta-descricao"
                value={metaEditando?.descricao || ''}
                onChange={(e) => setMetaEditando({ ...metaEditando, descricao: e.target.value })}
                rows={4}
                placeholder="Descreva a meta do projeto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModalEditarMeta(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditarMeta}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar Orçamento */}
      <Dialog open={showEditOrcamento} onOpenChange={setShowEditOrcamento}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Orçamento Detalhado</DialogTitle>
            <DialogDescription>
              Gerencie os itens do orçamento do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowModalNovoItem(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
            
            {itensOrcamentoTemp.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum item de orçamento cadastrado. Clique em "Adicionar Item" para começar.
              </p>
            ) : (
              <div className="space-y-3">
                {itensOrcamentoTemp.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.descricao}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.justificativa}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <p><span className="font-medium">Unidade:</span> {item.unidade_medida}</p>
                          <p><span className="font-medium">Valor Unitário:</span> R$ {typeof item.valor_unitario === 'number' ? item.valor_unitario.toLocaleString('pt-BR') : item.valor_unitario}</p>
                          <p><span className="font-medium">Quantidade:</span> {item.quantidade}</p>
                          <p><span className="font-medium">Total:</span> R$ {(typeof item.valor_unitario === 'number' ? item.valor_unitario : parseFloat(item.valor_unitario?.toString().replace(/[^\d,-]/g, '').replace(',', '.') || '0')) * (typeof item.quantidade === 'number' ? item.quantidade : parseInt(item.quantidade || '0'))}</p>
                        </div>
                        {item.referencia_preco && (
                          <p className="text-sm text-gray-500 mt-1"><span className="font-medium">Referência:</span> {item.referencia_preco}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirEditarItem(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {itensOrcamentoTemp.reduce((sum, item) => {
                      const valor = typeof item.valor_unitario === 'number' ? item.valor_unitario : parseFloat(item.valor_unitario?.toString().replace(/[^\d,-]/g, '').replace(',', '.') || '0');
                      const qtd = typeof item.quantidade === 'number' ? item.quantidade : parseInt(item.quantidade || '0');
                      return sum + (valor * qtd);
                    }, 0).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditOrcamento(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarItensOrcamento}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar novo item */}
      <Dialog open={showModalNovoItem} onOpenChange={setShowModalNovoItem}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Item de Orçamento</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-descricao">Descrição *</Label>
              <Input
                id="item-descricao"
                value={novoItem.descricao}
                onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                placeholder="Ex: Hospedagem para equipe"
              />
            </div>

            <div>
              <Label htmlFor="item-justificativa">Justificativa *</Label>
              <Textarea
                id="item-justificativa"
                value={novoItem.justificativa}
                onChange={(e) => setNovoItem({ ...novoItem, justificativa: e.target.value })}
                rows={3}
                placeholder="Justifique a necessidade deste item..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-unidade">Unidade de Medida *</Label>
                <Select 
                  value={novoItem.unidade_medida} 
                  onValueChange={(value) => setNovoItem({ ...novoItem, unidade_medida: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Serviço">Serviço</SelectItem>
                    <SelectItem value="Hora">Hora</SelectItem>
                    <SelectItem value="Diária">Diária</SelectItem>
                    <SelectItem value="Unidade">Unidade</SelectItem>
                    <SelectItem value="Metro">Metro</SelectItem>
                    <SelectItem value="Quilograma">Quilograma</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-valor">Valor Unitário *</Label>
                <Input
                  id="item-valor"
                  type="text"
                  value={novoItem.valor_unitario}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d,-]/g, '');
                    setNovoItem({ ...novoItem, valor_unitario: valor });
                  }}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-quantidade">Quantidade *</Label>
                <Input
                  id="item-quantidade"
                  type="number"
                  value={novoItem.quantidade}
                  onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
                  placeholder="0"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="item-referencia">Referência de Preço</Label>
                <Input
                  id="item-referencia"
                  value={novoItem.referencia_preco}
                  onChange={(e) => setNovoItem({ ...novoItem, referencia_preco: e.target.value })}
                  placeholder="Origem do preço"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModalNovoItem(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdicionarItem}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar item */}
      <Dialog open={showModalEditarItem} onOpenChange={setShowModalEditarItem}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Item de Orçamento</DialogTitle>
            <DialogDescription>
              Edite os dados do item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-item-descricao">Descrição *</Label>
              <Input
                id="edit-item-descricao"
                value={itemEditando?.descricao || ''}
                onChange={(e) => setItemEditando({ ...itemEditando, descricao: e.target.value })}
                placeholder="Ex: Hospedagem para equipe"
              />
            </div>

            <div>
              <Label htmlFor="edit-item-justificativa">Justificativa *</Label>
              <Textarea
                id="edit-item-justificativa"
                value={itemEditando?.justificativa || ''}
                onChange={(e) => setItemEditando({ ...itemEditando, justificativa: e.target.value })}
                rows={3}
                placeholder="Justifique a necessidade deste item..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-item-unidade">Unidade de Medida *</Label>
                <Select 
                  value={itemEditando?.unidade_medida || ''} 
                  onValueChange={(value) => setItemEditando({ ...itemEditando, unidade_medida: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Serviço">Serviço</SelectItem>
                    <SelectItem value="Hora">Hora</SelectItem>
                    <SelectItem value="Diária">Diária</SelectItem>
                    <SelectItem value="Unidade">Unidade</SelectItem>
                    <SelectItem value="Metro">Metro</SelectItem>
                    <SelectItem value="Quilograma">Quilograma</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-item-valor">Valor Unitário *</Label>
                <Input
                  id="edit-item-valor"
                  type="text"
                  value={typeof itemEditando?.valor_unitario === 'number' ? itemEditando.valor_unitario.toLocaleString('pt-BR') : itemEditando?.valor_unitario || ''}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d,-]/g, '');
                    setItemEditando({ ...itemEditando, valor_unitario: valor });
                  }}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-item-quantidade">Quantidade *</Label>
                <Input
                  id="edit-item-quantidade"
                  type="number"
                  value={typeof itemEditando?.quantidade === 'number' ? itemEditando.quantidade : itemEditando?.quantidade || ''}
                  onChange={(e) => setItemEditando({ ...itemEditando, quantidade: e.target.value })}
                  placeholder="0"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="edit-item-referencia">Referência de Preço</Label>
                <Input
                  id="edit-item-referencia"
                  value={itemEditando?.referencia_preco || ''}
                  onChange={(e) => setItemEditando({ ...itemEditando, referencia_preco: e.target.value })}
                  placeholder="Origem do preço"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModalEditarItem(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditarItem}>
              Salvar
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

      {/* Modal para Nova Prestação de Contas */}
      <Dialog open={showNovaPrestacaoModal} onOpenChange={setShowNovaPrestacaoModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Prestação de Contas</DialogTitle>
            <DialogDescription>
              Preencha as informações da prestação de contas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novaPrestacaoNome}
                onChange={(e) => setNovaPrestacaoNome(e.target.value)}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={novaPrestacaoDescricao}
                onChange={(e) => setNovaPrestacaoDescricao(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>Valor Total *</Label>
              <Input
                type="number"
                value={novaPrestacaoValor}
                onChange={(e) => setNovaPrestacaoValor(e.target.value)}
              />
            </div>
            <div>
              <Label>Relatório de Atividades</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setNovaPrestacaoRelatorio(e.target.files?.[0] || null)}
              />
              {novaPrestacaoRelatorio && (
                <p className="text-sm text-gray-500 mt-1">{novaPrestacaoRelatorio.name}</p>
              )}
            </div>
            <div>
              <Label>Relatório Financeiro</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setNovaPrestacaoFinanceiro(e.target.files?.[0] || null)}
              />
              {novaPrestacaoFinanceiro && (
                <p className="text-sm text-gray-500 mt-1">{novaPrestacaoFinanceiro.name}</p>
              )}
            </div>
            <div>
              <Label>Comprovantes</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setNovaPrestacaoComprovantes(e.target.files?.[0] || null)}
              />
              {novaPrestacaoComprovantes && (
                <p className="text-sm text-gray-500 mt-1">{novaPrestacaoComprovantes.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNovaPrestacaoModal(false)}
              disabled={carregandoPrestacao}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvarNovaPrestacao}
              disabled={carregandoPrestacao}
            >
              {carregandoPrestacao ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Upload de Documento */}
      <Dialog open={showUploadDocModal} onOpenChange={setShowUploadDocModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Selecione o arquivo para enviar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Arquivo</Label>
              <Input
                type="file"
                onChange={(e) => setArquivoDoc(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDocModal(false)}
              disabled={enviandoDocumento}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUploadDocumento}
              disabled={enviandoDocumento || !arquivoDoc}
            >
              {enviandoDocumento ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </ProponenteLayout>
  );
};