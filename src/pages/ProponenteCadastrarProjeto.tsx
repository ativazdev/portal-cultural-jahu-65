import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  Users, 
  Target,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Plus,
  Save,
  Send,
  Loader2,
  LayoutGrid,
  ClipboardList,
  ShieldCheck,
  MapPin,
  Activity,
  ListTodo,
  Banknote,
  FileDown,
  Paperclip
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { supabase, getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import { ProjectAttachments } from "../components/proponente/ProjectAttachments";

// Opções predefinidas
const CategoriasOptions = [
  { value: "musica", label: "Música" },
  { value: "teatro", label: "Teatro" },
  { value: "danca", label: "Dança" },
  { value: "artes_visuais", label: "Artes Visuais" },
  { value: "literatura", label: "Literatura" },
  { value: "cinema", label: "Cinema" },
  { value: "cultura_popular", label: "Cultura Popular" },
  { value: "circo", label: "Circo" },
  { value: "outros", label: "Outros" }
];

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

const etapaOptions = [
  "Pré-produção",
  "Produção",
  "Pós-produção",
  "Divulgação"
];

const formatoOptions = [
  { value: "presencial", label: "Presencial" },
  { value: "itinerante", label: "Itinerante" },
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
  { value: "outros", label: "Outros" },
  { value: "nao_aplicavel", label: "Não aplicável" }
];

const cotaOptions = [
  { value: "negro", label: "Sim - Pessoa Negra" },
  { value: "indigena", label: "Sim - Pessoa Indígena" },
  { value: "pcd", label: "Sim - Pessoa com Deficiência" },
  { value: "nao", label: "Não" }
];

const unidadeMedidaOptions = [
  "Serviço",
  "Hora",
  "Diária",
  "Unidade",
  "Metro",
  "Quilograma",
  "Outro"
];

interface ProponenteItem {
  id: string;
  nome: string;
  tipo: string;
  cpf?: string;
  cnpj?: string;
  razao_social?: string;
  [key: string]: any; // Para permitir acesso a todos os campos
}

// Função para aplicar máscara de CPF/CNPJ
const aplicarMascaraDocumento = (value: string) => {
  const numeros = value.replace(/\D/g, '');
  
  if (numeros.length <= 11) {
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    return numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  }
};

export const ProponenteCadastrarProjeto = () => {
  const { nomePrefeitura, editalId } = useParams<{ nomePrefeitura: string; editalId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { proponente } = useProponenteAuth();

  const parseCurrency = (value: string | number) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const stringValue = String(value);
    
    // Se a string já estiver no formato de número decimal (ex: "0.2"), 
    // retorna ela convertida diretamente para evitar o bug de tratar como centavos novamente.
    if (!stringValue.includes(',') && !isNaN(Number(stringValue)) && stringValue.includes('.')) {
      return parseFloat(stringValue);
    }

    const cleanValue = stringValue.replace(/\D/g, '');
    return cleanValue ? parseInt(cleanValue) / 100 : 0;
  };

  const formatCurrency = (value: string | number) => {
    if (value === undefined || value === null || value === '') return '';
    const amount = typeof value === 'string' ? parseCurrency(value) : (typeof value === 'number' ? value : 0);
    if (isNaN(amount)) return '';
    if (amount === 0) return '0,00';
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getOrcamentoTotal = (orcamento: any[]) => {
    return (orcamento || []).reduce((sum, item) => {
      const valor = parseCurrency(item.valor_unitario);
      const qtd = parseFloat(String(item.quantidade)) || 0;
      return sum + (valor * qtd);
    }, 0);
  };

  // Estados principais
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edital, setEdital] = useState<any>(null);
  const [proponentes, setProponentes] = useState<ProponenteItem[]>([]);
  const [projetoExistente, setProjetoExistente] = useState<any>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [dadosCarregados, setDadosCarregados] = useState(false);
  const [editalFiles, setEditalFiles] = useState<any[]>([]);

  // Formulário principal
  const [formData, setFormData] = useState<any>({
    // Informações Básicas
    nome: '',
    modalidade: '',
    descricao: '',
    objetivos: '',
    
    // Público e Acessibilidade
    perfil_publico: '',
    publico_prioritario: [],
    outro_publico_prioritario: '',
    acessibilidade_arquitetonica: [],
    outra_acessibilidade_arquitetonica: '',
    
    // Acessibilidade Comunicacional e Atitudinal
    acessibilidade_comunicacional: [],
    outra_acessibilidade_comunicacional: '',
    acessibilidade_atitudinal: [],
    implementacao_acessibilidade: '',
    
    // Cronograma e Local
    local_execucao: '',
    data_inicio: '',
    data_final: '',
    estrategia_divulgacao: '',
    
    // Proponente
    proponente_id: '',
    
    // Valor e Financiamento
    valor_solicitado: 0,
    outras_fontes: false,
    tipos_outras_fontes: [],
    detalhes_outras_fontes: '',
    
    // Novos Campos das Imagens
    concorre_cotas: false,
    cotas_tipo: '',
    formato: '',
    cep_realizacao: '',
    num_remunerados: '',
    segmento_contemplado: '',
    etapa_principal: '',
    tematicas: '',
    territorio_prioritario: false,
    entregas_previstas: '',
    mini_curriculo_proponente: '',
    objetivos_especificos: '',
    venda_produtos: false,
    documentos_complementares: [],
    aceite_lgpd: false,

    // Coleções
    equipe: [],
    atividades: [],
    metas: [],
    orcamento: []
  });

  // Estados de itens adicionais
  const [novaMeta, setNovaMeta] = useState({ descricao: '' });
  const [novaAtividade, setNovaAtividade] = useState({
    nome_atividade: '',
    etapa: '',
    descricao: '',
    data_inicio: '',
    data_fim: ''
  });
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
  const [novoOrcamento, setNovoOrcamento] = useState<any>({
    descricao: '',
    justificativa: '',
    unidade_medida: '',
    valor_unitario: 0,
    quantidade: '',
    referencia_preco: ''
  });

  const steps = [
    { id: 0, label: "Dados do Projeto", icon: LayoutGrid },
    { id: 1, label: "Plano de Trabalho", icon: ClipboardList },
    { id: 2, label: "Termo de Ciência", icon: ShieldCheck },
    { id: 3, label: "Anexos", icon: Paperclip }
  ];

  useEffect(() => {
    if (proponente?.id && editalId) {
      carregarDadosIniciais();
    }
  }, [proponente, editalId]);

  // Abrir modal automaticamente se existe um rascunho quando vindo da tela de Editais
  useEffect(() => {
    if (projetoExistente && !loading && dadosCarregados && location.state?.fromEditais) {
      setShowWarningModal(true);
    }
  }, [projetoExistente, loading, dadosCarregados, location.state]);

  const carregarDadosIniciais = async () => {
    console.log('DEBUG: carregarDadosIniciais iniciada', { proponenteId: proponente?.id, editalId });
    if (!proponente?.id || !editalId) {
      console.log('DEBUG: carregarDadosIniciais retornou precocemente (proponente ou editalId ausentes)');
      return;
    }

    try {
      console.log('DEBUG: Iniciando busca de dados...');
      setLoading(true);
      setDadosCarregados(false);

      // Carregar edital usando cliente autenticado
      const authClient = getAuthenticatedSupabaseClient('proponente');
      const { data: editalData, error: editalError } = await authClient
        .from('editais')
        .select('*')
        .eq('id', editalId)
        .single();

      if (editalError) throw editalError;
      if (!editalData) throw new Error('Edital não encontrado');
      
      console.log('Edital carregado:', editalData);
      setEdital(editalData as any);

      // Carregar arquivos do edital separadamente para evitar erro de relacionamento
      const { data: filesData, error: filesError } = await authClient
        .from('arquivos_edital')
        .select('*')
        .eq('edital_id', editalId);
      
      const editalAny = editalData as any;
      
      if (filesError) {
        console.error('Erro ao carregar arquivos do edital:', filesError);
      } else {
        console.log('Arquivos do edital carregados (arquivos_edital):', filesData);
      }
      
      // Combinar arquivos da tabela arquivos_edital com os que podem estar no campo 'anexos' ou 'regulamento' do edital
      let consolidatedFiles = [...(filesData || [])];
      
      // Adicionar arquivos do campo 'anexos' (JSON) se existirem
      if (editalAny.anexos && Array.isArray(editalAny.anexos)) {
        console.log('DEBUG: Arquivos encontrados no campo anexos:', editalAny.anexos);
        editalAny.anexos.forEach((anexo: any, idx: number) => {
          if (!consolidatedFiles.some(f => f.url === anexo.url)) {
            consolidatedFiles.push({
              id: `anexo-${idx}-${Date.now()}`,
              edital_id: editalId,
              nome: anexo.titulo || 'Documento',
              titulo: anexo.titulo,
              url: anexo.url,
              tipo_mime: 'application/pdf'
            });
          }
        });
      }

      // Fallback para 'regulamento' se estiver vazio
      if (consolidatedFiles.length === 0 && editalAny.regulamento && Array.isArray(editalAny.regulamento)) {
        console.log('DEBUG: Usando regulamento como fallback');
        editalAny.regulamento.forEach((url: string, index: number) => {
          consolidatedFiles.push({
            id: `reg-${index}-${Date.now()}`,
            edital_id: editalId,
            nome: `Regulamento ${index + 1}`,
            titulo: `Regulamento ${index + 1}`,
            url: url,
            tipo_mime: 'application/pdf'
          });
        });
      }

      console.log('DEBUG: Arquivos consolidados final:', consolidatedFiles);
      setEditalFiles(consolidatedFiles);

      // Carregar proponentes do usuário usando cliente autenticado
      const { data: proponentesData, error: proponentesError } = await (authClient as any)
        .from('proponentes')
        .select('*')
        .eq('usuario_id', proponente.id)
        .eq('ativo', true);

      if (proponentesError) throw proponentesError;
      setProponentes(proponentesData || []);

      // Verificar se já existe um projeto em rascunho usando cliente autenticado
      const proponenteIds = (proponentesData || []).map(p => p.id);
      if (proponenteIds.length > 0) {
        const { data: projetoRascunho, error: projetoError } = await (authClient as any)
          .from('projetos')
          .select('*')
          .in('proponente_id', proponenteIds)
          .eq('edital_id', editalId)
          .eq('status', 'rascunho')
          .single();

        if (projetoError && projetoError.code !== 'PGRST116') {
          // PGRST116 significa que não encontrou nenhum registro
          throw projetoError;
        }

        if (projetoRascunho) {
          setProjetoExistente(projetoRascunho);
          await carregarDadosProjeto(projetoRascunho.id, projetoRascunho);
        } else {
          // Se não tem rascunho, marcar como carregado mesmo assim
          setDadosCarregados(true);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosProjeto = async (projetoId: string, projetoData?: any) => {
    try {
      // Carregar dados relacionados usando cliente autenticado
      const authClient = getAuthenticatedSupabaseClient('proponente');
      const [equipeRes, atividadesRes, metasRes, orcamentoRes] = await Promise.all([
        (authClient as any).from('equipe_projeto').select('*').eq('projeto_id', projetoId),
        (authClient as any).from('atividades_projeto').select('*').eq('projeto_id', projetoId).order('data_inicio'),
        (authClient as any).from('metas_projeto').select('*').eq('projeto_id', projetoId),
        (authClient as any).from('itens_orcamento_projeto').select('*').eq('projeto_id', projetoId)
      ]);

      const dadosProjeto = projetoData || projetoExistente;
      if (dadosProjeto) {
        setFormData({
          ...dadosProjeto,
          equipe: equipeRes.data || [],
          atividades: atividadesRes.data || [],
          metas: metasRes.data || [],
          orcamento: orcamentoRes.data || []
        });
        setDadosCarregados(true);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados do projeto:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSalvarRascunho = async () => {
    try {
      setSaving(true);

      const valorNum = parseCurrency(formData.valor_solicitado);

    // Validações básicas para rascunho
    if (
      !formData.nome || 
      !formData.formato || 
      !formData.segmento_contemplado || 
      valorNum <= 0
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Nome, Valor, Formato e Segmento para salvar o rascunho.",
        variant: "destructive",
      });
      return false;
    }

      if (!formData.proponente_id) {
        toast({
          title: "Proponente obrigatório",
          description: "Por favor, selecione um proponente",
          variant: "destructive",
        });
        return false;
      }

      // Buscar prefeitura_id usando cliente autenticado
      const authClient = getAuthenticatedSupabaseClient('proponente');
      
      // Debug: Verificar qual token está sendo usado
      const proponenteToken = localStorage.getItem('proponente_token');
      const pareceristaToken = localStorage.getItem('parecerista_token');
      console.log('🔑 Token proponente presente:', !!proponenteToken);
      console.log('🔑 Token parecerista presente:', !!pareceristaToken);
      if (proponenteToken) {
        console.log('🔑 Token proponente (primeiros 50 chars):', proponenteToken.substring(0, 50) + '...');
        // Decodificar JWT para ver o payload (sem verificar assinatura)
        try {
          const payload = JSON.parse(atob(proponenteToken.split('.')[1]));
          console.log('🔑 Payload do token proponente:', {
            sub: payload.sub,
            user_type: payload.user_type,
            prefeitura_id: payload.prefeitura_id,
            email: payload.email
          });
        } catch (e) {
          console.warn('⚠️ Erro ao decodificar token:', e);
        }
      }
      
      // Debug: Verificar valores do JWT e políticas
      try {
        const { data: debugData, error: debugError } = await (authClient as any).rpc('debug_rls_projetos');
        console.log('🔍 Debug RLS:', debugData);
        if (debugError) console.error('❌ Erro no debug:', debugError);

        // Debug adicional: verificar is_proponente()
        const { data: debugIsProponente, error: debugIsProponenteError } = await (authClient as any).rpc('debug_is_proponente');
        console.log('🔍 Debug is_proponente:', debugIsProponente);
        if (debugIsProponenteError) console.error('❌ Erro no debug is_proponente:', debugIsProponenteError);

        // Debug: Verificar se Supabase reconhece como authenticated
        const { data: testAuth, error: testAuthError } = await (authClient as any).rpc('testar_autenticacao');
        console.log('🔍 Teste de autenticação:', testAuth);
        if (testAuthError) console.error('❌ Erro no teste de autenticação:', testAuthError);

        const { data: proponenteValido, error: proponenteError } = await (authClient as any).rpc('verificar_proponente_usuario', {
          p_proponente_id: formData.proponente_id
        });
        console.log('✅ Proponente válido:', proponenteValido);
        console.log('📋 Proponente ID:', formData.proponente_id);
        if (proponenteError) console.error('❌ Erro ao verificar proponente:', proponenteError);
        if (!proponenteValido) {
          console.error('❌ Proponente não pertence ao usuário!');
        }
      } catch (debugErr) {
        console.warn('⚠️ Erro ao executar debug:', debugErr);
      }

      const { data: proponenteData } = await (authClient as any)
        .from('proponentes')
        .select('prefeitura_id')
        .eq('id', formData.proponente_id)
        .single();

      if (!proponenteData) throw new Error('Proponente não encontrado');
      
      console.log('📊 Dados do proponente:', proponenteData);

      const projetoData = {
        prefeitura_id: proponenteData.prefeitura_id,
        edital_id: editalId,
        proponente_id: formData.proponente_id,
        nome: formData.nome,
        modalidade: formData.segmento_contemplado, // Mapeando segmento para modalidade (ENUM)
        formato: formData.formato,
        segmento_contemplado: formData.segmento_contemplado,
        descricao: formData.descricao || null,
        objetivos: formData.objetivos || null,
        valor_solicitado: valorNum,
        outras_fontes: formData.outras_fontes || false,
        tipos_outras_fontes: formData.tipos_outras_fontes || null,
        detalhes_outras_fontes: formData.detalhes_outras_fontes || null,
        
        // Outros campos
        perfil_publico: formData.perfil_publico || null,
        publico_prioritario: formData.publico_prioritario || null,
        outro_publico_prioritario: formData.outro_publico_prioritario || null,
        acessibilidade_arquitetonica: formData.acessibilidade_arquitetonica || null,
        outra_acessibilidade_arquitetonica: formData.outra_acessibilidade_arquitetonica || null,
        acessibilidade_comunicacional: formData.acessibilidade_comunicacional || null,
        outra_acessibilidade_comunicacional: formData.outra_acessibilidade_comunicacional || null,
        acessibilidade_atitudinal: formData.acessibilidade_atitudinal || null,
        implementacao_acessibilidade: formData.implementacao_acessibilidade || null,
        local_execucao: formData.local_execucao || null,
        data_inicio: formData.data_inicio || null,
        data_final: formData.data_final || null,
        estrategia_divulgacao: formData.estrategia_divulgacao || null,
        cep_realizacao: formData.cep_realizacao || null,
        num_remunerados: formData.num_remunerados || null,
        etapa_principal: formData.etapa_principal || null,
        tematicas: formData.tematicas || null,
        territorio_prioritario: formData.territorio_prioritario || false,
        entregas_previstas: formData.entregas_previstas || null,
        mini_curriculo_proponente: formData.mini_curriculo_proponente || null,
        objetivos_especificos: formData.objetivos_especificos || null,
        venda_produtos: formData.venda_produtos || false,
        aceite_lgpd: formData.aceite_lgpd || false,
        concorre_cotas: formData.concorre_cotas || false,
        cotas_tipo: formData.cotas_tipo || null,

        status: 'rascunho'
      };

      let projetoId;
      
      // Usar Edge Function para criar/atualizar projeto
      const token = localStorage.getItem('proponente_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('📝 Tentando salvar projeto via Edge Function:', {
        projeto_id: projetoExistente?.id,
        ...projetoData
      });

      const { data: response, error: functionError } = await supabase.functions.invoke('salvar-projeto', {
        body: {
          projeto_id: projetoExistente?.id,
          ...projetoData
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (functionError) {
        console.error('❌ Erro na Edge Function:', functionError);
        throw new Error(functionError.message || 'Erro ao salvar projeto');
      }

      if (!response || !response.success) {
        throw new Error(response?.error || 'Erro ao salvar projeto');
      }

      console.log('✅ Projeto salvo com sucesso:', response.projeto);
      projetoId = response.projeto.id;
      
      if (!projetoExistente) {
        setProjetoExistente(response.projeto);
      }

      // Salvar equipe, atividades, metas e orçamento
      await Promise.all([
        salvarEquipe(projetoId),
        salvarAtividades(projetoId),
        salvarMetas(projetoId),
        salvarOrcamento(projetoId)
      ]);

      toast({
        title: "Rascunho salvo",
        description: "Seu rascunho foi salvo com sucesso",
      });
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar rascunho",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const salvarEquipe = async (projetoId: string) => {
    if (!formData.equipe || formData.equipe.length === 0) return;

    const authClient = getAuthenticatedSupabaseClient('proponente');
    // Deletar equipe existente
    await (authClient as any).from('equipe_projeto').delete().eq('projeto_id', projetoId);

    // Inserir nova equipe
    const equipeData = formData.equipe.map((membro: any) => ({
      projeto_id: projetoId,
      nome: membro.nome,
      funcao: membro.funcao,
      cpf_cnpj: membro.cpf_cnpj,
      indigena: membro.indigena,
      lgbtqiapn: membro.lgbtqiapn,
      preto_pardo: membro.preto_pardo,
      deficiencia: membro.deficiencia,
      mini_curriculo: membro.mini_curriculo
    }));

    if (equipeData.length > 0) {
      await (authClient as any).from('equipe_projeto').insert(equipeData);
    }
  };

  const salvarAtividades = async (projetoId: string) => {
    if (!formData.atividades || formData.atividades.length === 0) return;

    const authClient = getAuthenticatedSupabaseClient('proponente');
    // Deletar atividades existentes
    await (authClient as any).from('atividades_projeto').delete().eq('projeto_id', projetoId);

    // Ordenar atividades por data
    const atividadesOrdenadas = [...formData.atividades].sort((a, b) => 
      new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
    );

    // Inserir novas atividades
    const atividadesData = atividadesOrdenadas.map((atividade, index) => ({
      projeto_id: projetoId,
      nome_atividade: atividade.nome_atividade,
      etapa: atividade.etapa,
      descricao: atividade.descricao,
      data_inicio: atividade.data_inicio,
      data_fim: atividade.data_fim,
      ordem: index
    }));

    if (atividadesData.length > 0) {
      await (authClient as any).from('atividades_projeto').insert(atividadesData);
    }
  };

  const salvarMetas = async (projetoId: string) => {
    if (!formData.metas || formData.metas.length === 0) return;

    const authClient = getAuthenticatedSupabaseClient('proponente');
    // Deletar metas existentes
    await (authClient as any).from('metas_projeto').delete().eq('projeto_id', projetoId);

    // Inserir novas metas
    const metasData = formData.metas.map((meta: any, index: number) => ({
      projeto_id: projetoId,
      descricao: meta.descricao,
      ordem: index
    }));

    if (metasData.length > 0) {
      await (authClient as any).from('metas_projeto').insert(metasData);
    }
  };

  const salvarOrcamento = async (projetoId: string) => {
    if (!formData.orcamento || formData.orcamento.length === 0) return;

    const authClient = getAuthenticatedSupabaseClient('proponente');
    // Deletar orçamento existente
    await (authClient as any).from('itens_orcamento_projeto').delete().eq('projeto_id', projetoId);

    // Inserir novo orçamento
    const orcamentoData = formData.orcamento.map((item: any, index: number) => ({
      projeto_id: projetoId,
      descricao: item.descricao,
      justificativa: item.justificativa,
      unidade_medida: item.unidade_medida,
      valor_unitario: parseFloat(item.valor_unitario) || 0,
      quantidade: parseInt(item.quantidade) || 0,
      referencia_preco: item.referencia_preco,
      ordem: index
    }));

    if (orcamentoData.length > 0) {
      await (authClient as any).from('itens_orcamento_projeto').insert(orcamentoData);
    }
  };

  const handleInscrever = async () => {
    // Verificar se todos os passos foram preenchidos
    const requiredFields = [
      { field: 'nome', message: 'Nome do projeto' },
      { field: 'modalidade', message: 'categoria' },
      { field: 'descricao', message: 'Descrição' },
      { field: 'objetivos', message: 'Objetivos' },
      { field: 'proponente_id', message: 'Proponente' }
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        toast({
          title: "Campos obrigatórios",
          description: `Por favor, preencha: ${message}`,
          variant: "destructive",
        });
        return;
      }
    }

    // Verificar valor solicitado
    const valorSolicitado = parseFloat(formData.valor_solicitado);
    if (!valorSolicitado || valorSolicitado <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, informe um valor solicitado válido",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o valor é maior que o máximo do edital
    if (edital && valorSolicitado > edital.valor_maximo) {
      toast({
        title: "Valor excedido",
        description: `O valor solicitado não pode ser maior que ${edital.valor_maximo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        variant: "destructive",
      });
      return;
    }

    // Verificar orçamento
    if (!formData.orcamento || formData.orcamento.length === 0) {
      toast({
        title: "Orçamento obrigatório",
        description: "Por favor, adicione pelo menos um item ao orçamento",
        variant: "destructive",
      });
      return;
    }

    const totalOrcamento = formData.orcamento.reduce((sum: number, item: any) => {
      const valor = parseFloat(item.valor_unitario) || 0;
      const quantidade = parseInt(item.quantidade) || 0;
      return sum + (valor * quantidade);
    }, 0);

    if (Math.abs(totalOrcamento - valorSolicitado) > 0.01) {
      toast({
        title: "Orçamento incompatível",
        description: `O total do orçamento (${totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) deve ser igual ao valor solicitado (${valorSolicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
        variant: "destructive",
      });
      return;
    }

    // Inscrever o projeto diretamente (não perguntar sobre rascunho aqui)
    await inscricaoProjeto();
  };

  const inscricaoProjeto = async () => {
    try {
      setSaving(true);

      // Buscar prefeitura_id usando cliente autenticado
      const authClient = getAuthenticatedSupabaseClient('proponente');
      const { data: proponenteData } = await (authClient as any)
        .from('proponentes')
        .select('prefeitura_id')
        .eq('id', formData.proponente_id)
        .single();

      if (!proponenteData) throw new Error('Proponente não encontrado');

      // Gerar número de inscrição se não existir
      let numeroInscricao = projetoExistente?.numero_inscricao || null;
      
      // Se não tiver número de inscrição, gerar um novo
      if (!numeroInscricao) {
        // Buscar código do edital usando cliente autenticado
        const { data: editalData } = await (authClient as any)
          .from('editais')
          .select('codigo')
          .eq('id', editalId)
          .single();

        const codigoEdital = editalData?.codigo || 'EDT';

        // Contar projetos existentes no edital com número de inscrição usando cliente autenticado
        const { count } = await (authClient as any)
          .from('projetos')
          .select('*', { count: 'exact', head: true })
          .eq('edital_id', editalId)
          .not('numero_inscricao', 'is', null);

        // Gerar número sequencial (001, 002, 003...)
        const proximoNumero = (count || 0) + 1;
        const numeroFormatado = String(proximoNumero).padStart(3, '0');
        
        // Formato: CÓDIGO-001 (ex: EDT-001)
        numeroInscricao = `${codigoEdital}-${numeroFormatado}`;
      }

      const projetoData = {
        prefeitura_id: proponenteData.prefeitura_id,
        edital_id: editalId,
        proponente_id: formData.proponente_id,
        nome: formData.nome,
        modalidade: formData.modalidade,
        descricao: formData.descricao,
        objetivos: formData.objetivos,
        perfil_publico: formData.perfil_publico || null,
        publico_prioritario: formData.publico_prioritario || null,
        outro_publico_prioritario: formData.outro_publico_prioritario || null,
        acessibilidade_arquitetonica: formData.acessibilidade_arquitetonica || null,
        outra_acessibilidade_arquitetonica: formData.outra_acessibilidade_arquitetonica || null,
        acessibilidade_comunicacional: formData.acessibilidade_comunicacional || null,
        outra_acessibilidade_comunicacional: formData.outra_acessibilidade_comunicacional || null,
        acessibilidade_atitudinal: formData.acessibilidade_atitudinal || null,
        implementacao_acessibilidade: formData.implementacao_acessibilidade || null,
        local_execucao: formData.local_execucao || null,
        data_inicio: formData.data_inicio || null,
        data_final: formData.data_final || null,
        estrategia_divulgacao: formData.estrategia_divulgacao || null,
        valor_solicitado: parseFloat(formData.valor_solicitado),
        outras_fontes: formData.outras_fontes || false,
        tipos_outras_fontes: formData.tipos_outras_fontes || null,
        detalhes_outras_fontes: formData.detalhes_outras_fontes || null,
        
        // Novos Campos
        concorre_cotas: formData.concorre_cotas || false,
        cotas_tipo: formData.cotas_tipo || null,
        formato: formData.formato || null,
        cep_realizacao: formData.cep_realizacao || null,
        num_remunerados: formData.num_remunerados || null,
        segmento_contemplado: formData.segmento_contemplado || null,
        etapa_principal: formData.etapa_principal || null,
        tematicas: formData.tematicas || null,
        territorio_prioritario: formData.territorio_prioritario || false,
        entregas_previstas: formData.entregas_previstas || null,
        mini_curriculo_proponente: formData.mini_curriculo_proponente || null,
        objetivos_especificos: formData.objetivos_especificos || null,
        venda_produtos: formData.venda_produtos || false,
        aceite_lgpd: formData.aceite_lgpd || false,

        status: 'aguardando_parecerista', // Projeto aguarda atribuição de pareceristas pela prefeitura
        data_submissao: new Date().toISOString(),
        numero_inscricao: numeroInscricao
      };

      let projetoId;

      // Usar Edge Function para criar/atualizar projeto
      const token = localStorage.getItem('proponente_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('📝 Tentando inscrever projeto via Edge Function:', {
        projeto_id: projetoExistente?.id,
        ...projetoData
      });

      const { data: response, error: functionError } = await supabase.functions.invoke('salvar-projeto', {
        body: {
          projeto_id: projetoExistente?.id,
          ...projetoData
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (functionError) {
        console.error('❌ Erro na Edge Function:', functionError);
        throw new Error(functionError.message || 'Erro ao inscrever projeto');
      }

      if (!response || !response.success) {
        throw new Error(response?.error || 'Erro ao inscrever projeto');
      }

      console.log('✅ Projeto inscrito com sucesso:', response.projeto);
      projetoId = response.projeto.id;

      // Salvar equipe, atividades, metas e orçamento
      await Promise.all([
        salvarEquipe(projetoId),
        salvarAtividades(projetoId),
        salvarMetas(projetoId),
        salvarOrcamento(projetoId)
      ]);

      // Não criar avaliação automaticamente - a prefeitura definirá os pareceristas

      toast({
        title: "Projeto inscrito",
        description: "Seu projeto foi inscrito com sucesso",
      });

      navigate(`/${nomePrefeitura}/proponente/projetos/${projetoId}`);
    } catch (error: any) {
      console.error('Erro ao inscrever projeto:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao inscrever projeto",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApagarRascunho = async () => {
    try {
      setSaving(true);

      // Deletar projeto existente usando cliente autenticado
      const authClient = getAuthenticatedSupabaseClient('proponente');
      const { error } = await (authClient as any)
        .from('projetos')
        .delete()
        .eq('id', projetoExistente.id);

      if (error) throw error;

      // Limpar formulário
      setProjetoExistente(null);
      setFormData({
        nome: '',
        modalidade: '',
        descricao: '',
        objetivos: '',
        perfil_publico: '',
        publico_prioritario: [],
        outro_publico_prioritario: '',
        acessibilidade_arquitetonica: [],
        outra_acessibilidade_arquitetonica: '',
        acessibilidade_comunicacional: [],
        outra_acessibilidade_comunicacional: '',
        acessibilidade_atitudinal: [],
        implementacao_acessibilidade: '',
        local_execucao: '',
        data_inicio: '',
        data_final: '',
        estrategia_divulgacao: '',
        proponente_id: '',
        valor_solicitado: '',
        outras_fontes: false,
        tipos_outras_fontes: [],
        detalhes_outras_fontes: '',
        equipe: [],
        atividades: [],
        metas: [],
        orcamento: []
      });

      toast({
        title: "Rascunho apagado",
        description: "Você pode começar um novo projeto",
      });
    } catch (error: any) {
      console.error('Erro ao apagar rascunho:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao apagar rascunho",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Funções auxiliares para adicionar itens
  const handleAdicionarMeta = () => {
    if (!novaMeta.descricao.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha a descrição da meta",
        variant: "destructive",
      });
      return;
    }
    setFormData({
      ...formData,
      metas: [...formData.metas, { ...novaMeta }]
    });
    setNovaMeta({ descricao: '' });
  };

  const handleAdicionarAtividade = () => {
    if (!novaAtividade.nome_atividade || !novaAtividade.etapa || !novaAtividade.data_inicio || !novaAtividade.data_fim) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios da atividade",
        variant: "destructive",
      });
      return;
    }
    setFormData({
      ...formData,
      atividades: [...formData.atividades, { ...novaAtividade }]
    });
    setNovaAtividade({
      nome_atividade: '',
      etapa: '',
      descricao: '',
      data_inicio: '',
      data_fim: ''
    });
  };

  const handleAdicionarMembro = () => {
    if (!novoMembro.nome || !novoMembro.funcao) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e função do membro",
        variant: "destructive",
      });
      return;
    }
    setFormData({
      ...formData,
      equipe: [...formData.equipe, { ...novoMembro }]
    });
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
  };

  const handleAdicionarOrcamento = () => {
  if (!novoOrcamento.descricao || !novoOrcamento.valor_unitario || !novoOrcamento.quantidade) {
    toast({
      title: "Campos obrigatórios",
      description: "Por favor, preencha descrição, valor e quantidade",
      variant: "destructive",
    });
    return;
  }
  
  const valorNum = typeof novoOrcamento.valor_unitario === 'number' 
    ? novoOrcamento.valor_unitario 
    : parseCurrency(novoOrcamento.valor_unitario);

  setFormData({
    ...formData,
    orcamento: [...formData.orcamento, { 
      ...novoOrcamento, 
      unidade_medida: novoOrcamento.unidade_medida || 'Unidade',
      valor_unitario: valorNum
    }]
  });
  
  setNovoOrcamento({
    descricao: '',
    justificativa: '',
    unidade_medida: '',
    valor_unitario: 0,
    quantidade: '',
    referencia_preco: ''
  });
};

  if (loading) {
    return (
      <ProponenteLayout title="Cadastro de Projeto" description="Preencha as informações do seu projeto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ProponenteLayout>
    );
  }

  if (!edital) {
    return (
      <ProponenteLayout title="Edital não encontrado" description="">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-500">Edital não encontrado</p>
          </CardContent>
        </Card>
      </ProponenteLayout>
    );
  }

  const renderStep0 = () => {
    const proponenteSelecionado = proponentes.find(p => p.id === formData.proponente_id);
    return (
      <div className="space-y-8">
        {/* Proponente Selection */}
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">Identificação do Proponente</h3>
          </div>
          <Select 
            value={formData.proponente_id} 
            onValueChange={(value) => handleInputChange('proponente_id', value)}
          >
            <SelectTrigger className="bg-white border-blue-200">
              <SelectValue placeholder="Selecione quem está inscrevendo o projeto" />
            </SelectTrigger>
            <SelectContent>
              {proponentes.map(prop => (
                <SelectItem key={prop.id} value={prop.id}>
                  {prop.tipo === 'PJ' && prop.razao_social ? prop.razao_social : prop.nome} ({prop.tipo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {proponenteSelecionado && (
             <div className="bg-white p-4 rounded-lg border border-blue-100 text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 block mb-1">Documento:</span>
                  <span className="font-semibold text-gray-800">{proponenteSelecionado.cpf || proponenteSelecionado.cnpj}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Email:</span>
                  <span className="font-semibold text-gray-800">{proponenteSelecionado.email}</span>
                </div>
             </div>
          )}
        </div>

        {/* Cotas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
            <Label className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" /> Concorrer a Cotas? *
            </Label>
            <div className="flex items-center space-x-2 bg-white p-3 rounded-md border">
              <Checkbox 
                id="concorre_cotas" 
                checked={formData.concorre_cotas}
                onCheckedChange={(checked) => handleInputChange('concorre_cotas', checked)}
              />
              <label htmlFor="concorre_cotas" className="text-sm font-medium leading-none cursor-pointer">
                Sim, desejo concorrer a cotas
              </label>
            </div>
            {formData.concorre_cotas && (
              <Select value={formData.cotas_tipo} onValueChange={(v) => handleInputChange('cotas_tipo', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o tipo de cota" />
                </SelectTrigger>
                <SelectContent>
                  {cotaOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
            <Label className="text-base font-bold flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-orange-600" /> Formato do Projeto *
            </Label>
            <Select value={formData.formato} onValueChange={(v) => handleInputChange('formato', v)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                {formatoOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Core Info */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label className="font-bold">Nome do Projeto *</Label>
              <Input 
                value={formData.nome} 
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Festival de Cinema de Jahu"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Valor Solicitado *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">R$</span>
                <Input 
                  value={formatCurrency(formData.valor_solicitado)} 
                  onChange={(e) => handleInputChange('valor_solicitado', parseCurrency(e.target.value))}
                  className="pl-9 h-11"
                  placeholder="0,00"
                />
              </div>
              {edital && (
                <p className="text-[10px] text-gray-500 italic">Máximo: {edital.valor_maximo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
                <Label className="font-bold">CEP de Realização *</Label>
                <Input 
                  value={formData.cep_realizacao} 
                  onChange={(e) => handleInputChange('cep_realizacao', e.target.value)}
                  placeholder="00000-000"
                />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">Nº de Remunerados *</Label>
                <Input 
                  type="number"
                  value={formData.num_remunerados} 
                  onChange={(e) => handleInputChange('num_remunerados', e.target.value)}
                  placeholder="0"
                />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">Segmento Contemplado *</Label>
                <Select value={formData.segmento_contemplado} onValueChange={(v) => handleInputChange('segmento_contemplado', v)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione o segmento" />
                   </SelectTrigger>
                   <SelectContent>
                      {CategoriasOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="font-bold text-gray-700">Etapa Principal *</Label>
                <Select value={formData.etapa_principal} onValueChange={(v) => handleInputChange('etapa_principal', v)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione a etapa" />
                   </SelectTrigger>
                   <SelectContent>
                      {etapaOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="font-bold text-gray-700">Temáticas do Projeto *</Label>
                <Input 
                  value={formData.tematicas} 
                  onChange={(e) => handleInputChange('tematicas', e.target.value)}
                  placeholder="Ex: Educação, Inclusão, Patrimônio"
                />
             </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex items-center justify-between">
             <div className="space-y-1">
                <Label className="font-bold text-orange-900 flex items-center gap-2">
                   <MapPin className="h-4 w-4" /> Território Prioritário?
                </Label>
                <p className="text-xs text-orange-700">Marque se o projeto ocorre em região periférica ou vulnerável</p>
             </div>
             <Checkbox 
                checked={formData.territorio_prioritario}
                onCheckedChange={(checked) => handleInputChange('territorio_prioritario', checked)}
                className="h-6 w-6 border-orange-300 data-[state=checked]:bg-orange-600"
             />
          </div>

          <div className="space-y-2">
             <Label className="font-bold">Resumo das Entregas Previstas *</Label>
             <Textarea 
               value={formData.entregas_previstas} 
               onChange={(e) => handleInputChange('entregas_previstas', e.target.value)}
               placeholder="Descreva brevemente o que será entregue (ex: 2 oficinas, 1 show, 1 álbum)"
               className="min-h-[100px]"
             />
          </div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    return (
      <div className="space-y-8">
        {/* Descritivos */}
        <div className="space-y-6">
           <div className="space-y-2">
              <Label className="font-bold">Mini Currículo do Proponente *</Label>
              <Textarea 
                value={formData.mini_curriculo_proponente} 
                onChange={(e) => handleInputChange('mini_curriculo_proponente', e.target.value)}
                placeholder="Breve histórico de atuação na área cultural"
                className="min-h-[120px]"
              />
           </div>
           <div className="space-y-2">
              <Label className="font-bold">Resumo do Projeto / Apresentação *</Label>
              <Textarea 
                value={formData.descricao} 
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva o projeto para o público/avaliadores"
                className="min-h-[150px]"
              />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="font-bold">Objetivo Geral *</Label>
                 <Textarea 
                   value={formData.objetivos} 
                   onChange={(e) => handleInputChange('objetivos', e.target.value)}
                   placeholder="O que o projeto pretende alcançar de forma ampla"
                   className="min-h-[100px]"
                 />
              </div>
              <div className="space-y-2">
                 <Label className="font-bold">Objetivos Específicos *</Label>
                 <Textarea 
                   value={formData.objetivos_especificos} 
                   onChange={(e) => handleInputChange('objetivos_especificos', e.target.value)}
                   placeholder="Ações diretas e mensuráveis"
                   className="min-h-[100px]"
                 />
              </div>
           </div>
        </div>

        {/* Metas Section */}
        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4">
           <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              <h3 className="font-bold">Metas do Projeto *</h3>
           </div>
           <div className="flex gap-2">
              <Input 
                value={novaMeta.descricao}
                onChange={(e) => setNovaMeta({ descricao: e.target.value })}
                placeholder="Descreva uma meta (ex: Alcançar 500 pessoas)"
              />
              <Button type="button" onClick={handleAdicionarMeta} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4" />
              </Button>
           </div>
           <div className="space-y-2">
              {formData.metas.map((meta: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-md border flex items-center justify-between group">
                  <span className="text-sm">{meta.descricao}</span>
                  <Button 
                    variant="ghost" size="sm" 
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50"
                    onClick={() => handleInputChange('metas', formData.metas.filter((_: any, i: number) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
           </div>
        </div>

        {/* Público e Acessibilidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <Label className="font-bold flex items-center gap-2">
                 <Users className="h-4 w-4 text-blue-600" /> Público Alvo e Ação *
              </Label>
              <Textarea 
                value={formData.perfil_publico} 
                onChange={(e) => handleInputChange('perfil_publico', e.target.value)}
                placeholder="Perfil do público contemplado e como será a ação com eles"
                className="min-h-[100px]"
              />
           </div>
           <div className="space-y-4 text-sm">
              <Label className="font-bold block">Medidas de Acessibilidade *</Label>
              <p className="text-gray-500 text-xs mb-2">Descreva como garantirá o acesso a pessoas com deficiência</p>
              <Textarea 
                value={formData.implementacao_acessibilidade} 
                onChange={(e) => handleInputChange('implementacao_acessibilidade', e.target.value)}
                placeholder="Libras, audiodescrição, rampas, etc."
                className="min-h-[100px]"
              />
           </div>
        </div>

        {/* Divulgação, Cronograma, Equipe, Atividades, Orçamento, Venda */}
        <div className="space-y-8 pt-4 border-t border-gray-100">
           {/* Equipe Simp. */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-bold flex items-center gap-2">
                   <Users className="h-5 w-5 text-teal-600" /> Ficha Técnica / Equipe *
                 </h3>
                 <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">{formData.equipe.length} membros</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                 <Input 
                   value={novoMembro.nome} 
                   onChange={(e) => setNovoMembro({...novoMembro, nome: e.target.value})} 
                   placeholder="Nome" className="md:col-span-2"
                 />
                 <Input 
                   value={novoMembro.funcao} 
                   onChange={(e) => setNovoMembro({...novoMembro, funcao: e.target.value})} 
                   placeholder="Função"
                 />
                  <Button type="button" onClick={handleAdicionarMembro} className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4" />
                  </Button>
               </div>
               
               {/* Listagem de Membros Adicionados */}
               <div className="space-y-2 mt-2">
                 {formData.equipe.map((membro: any, idx: number) => (
                   <div key={idx} className="bg-white p-3 rounded-lg border border-teal-100 flex items-center justify-between group shadow-sm">
                     <div className="flex items-center gap-3">
                       <div className="bg-teal-50 p-2 rounded-full">
                         <User className="h-4 w-4 text-teal-600" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-800">{membro.nome}</p>
                         <p className="text-xs text-teal-600 font-medium">{membro.funcao}</p>
                       </div>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="text-red-500 hover:bg-red-50 hover:text-red-600"
                       onClick={() => handleInputChange('equipe', formData.equipe.filter((_: any, i: number) => i !== idx))}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
               </div>
            </div>

           {/* Orçamento Simp. */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-bold flex items-center gap-2">
                   <DollarSign className="h-5 w-5 text-green-600" /> Orçamento *
                 </h3>
                  <div className="text-right">
                     <span className="text-sm font-bold block">Total: R$ {formatCurrency(getOrcamentoTotal(formData.orcamento))}</span>
                     {Math.abs(getOrcamentoTotal(formData.orcamento) - parseCurrency(formData.valor_solicitado)) > 0.05 && (
                       <span className="text-[10px] text-red-500 font-medium animate-pulse">Divergente do valor solicitado!</span>
                     )}
                  </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <Input 
                    value={novoOrcamento.descricao} 
                    onChange={(e) => setNovoOrcamento({...novoOrcamento, descricao: e.target.value})} 
                    placeholder="Item/Serviço" className="md:col-span-4"
                  />
                  <Select 
                    value={novoOrcamento.unidade_medida} 
                    onValueChange={(v) => setNovoOrcamento({...novoOrcamento, unidade_medida: v})}
                  >
                    <SelectTrigger className="md:col-span-2">
                       <SelectValue placeholder="Unid." />
                    </SelectTrigger>
                    <SelectContent>
                       {unidadeMedidaOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                   <div className="relative md:col-span-2">
                     <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">R$</span>
                     <Input 
                       value={formatCurrency(novoOrcamento.valor_unitario)} 
                       onChange={(e) => setNovoOrcamento({...novoOrcamento, valor_unitario: parseCurrency(e.target.value)})} 
                       placeholder="0,00" className="pl-7 text-sm"
                     />
                   </div>
                   <Input 
                     type="number"
                     value={novoOrcamento.quantidade} 
                     onChange={(e) => setNovoOrcamento({...novoOrcamento, quantidade: e.target.value})} 
                     placeholder="Qtd" className="md:col-span-2"
                   />
                   <Button type="button" onClick={handleAdicionarOrcamento} className="bg-green-600 hover:bg-green-700 md:col-span-2">
                      <Plus className="h-4 w-4" />
                   </Button>
                </div>

               {/* Listagem de Itens do Orçamento */}
               <div className="space-y-2 mt-2">
                  {formData.orcamento.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-green-100 flex items-center justify-between group shadow-sm">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{item.descricao}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>Qtd: {item.quantidade}</span>
                          <span className="text-green-600 font-medium">Unit: R$ {formatCurrency(item.valor_unitario)}</span>
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">Subtotal: R$ {formatCurrency(parseCurrency(item.valor_unitario) * (parseFloat(String(item.quantidade)) || 0))}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleInputChange('orcamento', formData.orcamento.filter((_: any, i: number) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
               </div>
            </div>

           {/* Venda de Produtos */}
           <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <Checkbox 
                id="venda_produtos" 
                checked={formData.venda_produtos}
                onCheckedChange={(c) => handleInputChange('venda_produtos', c)}
              />
              <div>
                <Label htmlFor="venda_produtos" className="font-bold text-yellow-900 leading-none">Venda de produtos ou cobrança de ingressos?</Label>
                <p className="text-xs text-yellow-700 mt-1">Marque se o projeto prevê qualquer tipo de receita direta.</p>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="space-y-8 max-w-2xl mx-auto py-4">
        <div className="bg-blue-50 p-8 rounded-2xl border-2 border-blue-100 space-y-6">
           <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
           </div>
           <h2 className="text-2xl font-bold text-center text-blue-900">Termo de Ciência</h2>
           <div className="prose prose-blue text-blue-800 text-sm bg-white p-6 rounded-xl border border-blue-50 shadow-inner">
              <p className="font-medium">Ao prosseguir com a inscrição, declaro estar ciente de que:</p>
              <ul className="list-disc pl-5 space-y-2">
                 <li>As informações prestadas são de minha inteira responsabilidade.</li>
                 <li>Concordo com o tratamento dos meus dados pessoais conforme a <strong>LGPD (Lei Geral de Proteção de Dados)</strong> para fins exclusivos deste edital.</li>
                 <li>A omissão de informações ou dados falsos poderá acarretar na desclassificação imediata do projeto.</li>
                 <li>Verifiquei todos os anexos e o orçamento está condizente com o valor solicitado.</li>
              </ul>
           </div>
           
           <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-blue-200">
              <Checkbox 
                id="aceite_lgpd" 
                checked={formData.aceite_lgpd}
                onCheckedChange={(c) => handleInputChange('aceite_lgpd', c)}
                className="mt-1 h-5 w-5"
              />
              <Label htmlFor="aceite_lgpd" className="text-sm font-semibold text-blue-900 cursor-pointer">
                Li e concordo com os termos descritos acima e com a política de privacidade da plataforma.
              </Label>
           </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 flex items-start gap-4">
           <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
           <div className="space-y-1">
              <h4 className="font-bold text-amber-900">Atenção!</h4>
              <p className="text-sm text-amber-800">
                Uma vez enviado, o projeto não poderá mais ser editado. Revise todas as etapas nos botões "Anterior" antes de clicar em "Inscrever-se".
              </p>
           </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="space-y-8">
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Paperclip className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">Anexos do Projeto</h3>
          </div>
          <p className="text-sm text-gray-600">
            Baixe os modelos abaixo para preencher e enviar nos campos específicos. Você também pode anexar outros documentos complementares no final da lista.
          </p>

          <div className="mt-6">
            {projetoExistente?.id ? (
              <ProjectAttachments projetoId={projetoExistente.id} editalFiles={editalFiles} />
            ) : (
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-200 text-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-600">Salve seu rascunho clicando no botão "Salvar Rascunho" abaixo para habilitar o envio de arquivos.</p>
                <Button 
                  onClick={handleSalvarRascunho} 
                  disabled={saving}
                  className="mt-4"
                  variant="outline"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Rascunho Agora
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">Atenção Final!</h4>
            <p className="text-sm text-amber-800">
              Esta é a última etapa. Após clicar em "Inscrever-se", você não poderá mais alterar os dados ou anexos do projeto.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Dados do Projeto
        return (
          formData.proponente_id &&
          formData.nome &&
          parseCurrency(formData.valor_solicitado) > 0 &&
          (!edital || parseCurrency(formData.valor_solicitado) <= edital.valor_maximo) &&
          formData.formato !== '' &&
          formData.cep_realizacao &&
          formData.num_remunerados &&
          formData.segmento_contemplado &&
          formData.etapa_principal &&
          formData.tematicas &&
          formData.entregas_previstas
        );
      
      case 1: // Plano de Trabalho
        const totalOrcamento = getOrcamentoTotal(formData.orcamento);
        const valorSolicitado = parseCurrency(formData.valor_solicitado);

        return (
          formData.mini_curriculo_proponente &&
          formData.descricao &&
          formData.objetivos &&
          formData.objetivos_especificos &&
          formData.metas.length > 0 &&
          formData.perfil_publico &&
          formData.implementacao_acessibilidade &&
          formData.equipe.length > 0 &&
          formData.orcamento.length > 0 &&
          Math.abs(totalOrcamento - valorSolicitado) <= 0.05
        );
      
      case 2: // Termo de Ciência
        return formData.aceite_lgpd;

      case 3: // Anexos
        return true; // Opcional
      
      default:
        return true;
    }
  };

  const handleNextStep = async () => {
    if (!canGoNext()) {
      if (currentStep === 0) {
        toast({
          title: "Dados incompletos",
          description: "Por favor, preencha todos os campos obrigatórios (marcados com *) para continuar.",
          variant: "destructive",
        });
      } else if (currentStep === 1) {
        toast({
          title: "Plano de trabalho incompleto",
          description: "Certifique-se de preencher currículo, descritivos, metas, equipe e o orçamento (que deve bater com o total solicitado).",
          variant: "destructive",
        });
      } else if (currentStep === 2) {
        toast({
          title: "Aceite obrigatório",
          description: "Você deve aceitar os termos da LGPD para continuar.",
          variant: "destructive",
        });
      }
      return;
    }

    // Se estiver saindo do passo 2 (Termo de Ciência) para o 3 (Anexos), salvar rascunho para garantir que temos um projetoId
    if (currentStep === 2 && !projetoExistente?.id) {
      const success = await handleSalvarRascunho();
      if (!success) return; // Se falhar em salvar, não avança
    }

    setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
  };

  return (
    <ProponenteLayout 
      title="Cadastro de Projeto" 
      description={`Edital: ${edital?.nome || ''}`}
    >
      <div className="space-y-6">
        {/* Indicador de Steps */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center overflow-x-auto space-x-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (isCompleted) setCurrentStep(index);
                    }}
                    className={`flex items-center ${isActive ? 'space-x-2 px-3' : 'px-2'} py-2 rounded-lg whitespace-nowrap transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 
                      isCompleted ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 
                      'bg-white text-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {isActive && <span className="text-sm font-medium">{step.label}</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card com conteúdo do step */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const IconComponent = steps[currentStep].icon;
                return IconComponent && <IconComponent className="h-5 w-5" />;
              })()}
              {steps[currentStep].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Botões de navegação */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSalvarRascunho}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar rascunho
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleInscrever}
                disabled={saving}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Inscrever-se no Projeto
              </Button>
            ) : (
              <Button
                onClick={handleNextStep}
              >
                Próximo
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de aviso para rascunho existente */}
      <Dialog open={showWarningModal} onOpenChange={() => {}}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Você já possui um projeto em rascunho</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Você já possui um projeto em rascunho para este edital. O que deseja fazer?
              </p>
            </div>
            <DialogFooter className="flex-col gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  await handleApagarRascunho();
                  setShowWarningModal(false);
                }}
                className="w-full whitespace-normal"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Apagando...
                  </>
                ) : (
                  'Apagar projeto em rascunho e criar novo'
                )}
              </Button>
              <Button
                onClick={async () => {
                  await handleSalvarRascunho();
                  setShowWarningModal(false);
                  toast({
                    title: "Rascunho atualizado",
                    description: "Você pode continuar editando o projeto",
                  });
                }}
                className="w-full whitespace-normal"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Finalizar projeto em rascunho'
                )}
              </Button>
            </DialogFooter>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>
    </ProponenteLayout>
  );
};

