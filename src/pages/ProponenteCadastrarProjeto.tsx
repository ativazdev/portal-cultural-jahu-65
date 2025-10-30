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
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";

// Opções predefinidas
const modalidadesOptions = [
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

  // Estados principais
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edital, setEdital] = useState<any>(null);
  const [proponentes, setProponentes] = useState<ProponenteItem[]>([]);
  const [projetoExistente, setProjetoExistente] = useState<any>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [dadosCarregados, setDadosCarregados] = useState(false);

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
    valor_solicitado: '',
    outras_fontes: false,
    tipos_outras_fontes: [],
    detalhes_outras_fontes: '',
    
    // Equipe
    equipe: [],
    
    // Atividades
    atividades: [],
    
    // Metas
    metas: [],
    
    // Orçamento
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
  const [novoOrcamento, setNovoOrcamento] = useState({
    descricao: '',
    justificativa: '',
    unidade_medida: '',
    valor_unitario: '',
    quantidade: '',
    referencia_preco: ''
  });

  const steps = [
    { id: 0, label: "Proponente", icon: User },
    { id: 1, label: "Informações Básicas", icon: FileText },
    { id: 2, label: "Público e Acessibilidade", icon: User },
    { id: 3, label: "Acessibilidade Comunicacional e Atitudinal", icon: CheckCircle },
    { id: 4, label: "Cronograma e Local", icon: Calendar },
    { id: 5, label: "Valor e Financiamento", icon: DollarSign },
    { id: 6, label: "Equipe do Projeto", icon: Users },
    { id: 7, label: "Atividades Planejadas", icon: Calendar },
    { id: 8, label: "Metas do Projeto", icon: Target },
    { id: 9, label: "Orçamento Detalhado", icon: DollarSign }
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
    if (!proponente?.id || !editalId) return;

    try {
      setLoading(true);
      setDadosCarregados(false);

      // Carregar edital
      const { data: editalData, error: editalError } = await supabase
        .from('editais')
        .select('*')
        .eq('id', editalId)
        .single();

      if (editalError) throw editalError;
      setEdital(editalData);

      // Carregar proponentes do usuário
      const { data: proponentesData, error: proponentesError } = await (supabase as any)
        .from('proponentes')
        .select('*')
        .eq('usuario_id', proponente.id)
        .eq('ativo', true);

      if (proponentesError) throw proponentesError;
      setProponentes(proponentesData || []);

      // Verificar se já existe um projeto em rascunho
      const proponenteIds = (proponentesData || []).map(p => p.id);
      if (proponenteIds.length > 0) {
        const { data: projetoRascunho, error: projetoError } = await (supabase as any)
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
      // Carregar dados relacionados
      const [equipeRes, atividadesRes, metasRes, orcamentoRes] = await Promise.all([
        (supabase as any).from('equipe_projeto').select('*').eq('projeto_id', projetoId),
        (supabase as any).from('atividades_projeto').select('*').eq('projeto_id', projetoId).order('data_inicio'),
        (supabase as any).from('metas_projeto').select('*').eq('projeto_id', projetoId),
        (supabase as any).from('itens_orcamento_projeto').select('*').eq('projeto_id', projetoId)
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

      // Validações básicas
      if (!formData.nome || !formData.modalidade || !formData.descricao || !formData.objetivos) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha pelo menos as informações básicas",
          variant: "destructive",
        });
        return;
      }

      if (!formData.proponente_id) {
        toast({
          title: "Proponente obrigatório",
          description: "Por favor, selecione um proponente",
          variant: "destructive",
        });
        return;
      }

      // Buscar prefeitura_id
      const { data: proponenteData } = await supabase
        .from('proponentes')
        .select('prefeitura_id')
        .eq('id', formData.proponente_id)
        .single();

      if (!proponenteData) throw new Error('Proponente não encontrado');

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
        valor_solicitado: parseFloat(formData.valor_solicitado) || 0,
        outras_fontes: formData.outras_fontes || false,
        tipos_outras_fontes: formData.tipos_outras_fontes || null,
        detalhes_outras_fontes: formData.detalhes_outras_fontes || null,
        status: 'rascunho'
      };

      let projetoId;
      
      if (projetoExistente) {
        // Atualizar projeto existente
        const { error } = await (supabase as any)
          .from('projetos')
          .update(projetoData)
          .eq('id', projetoExistente.id);

        if (error) throw error;
        projetoId = projetoExistente.id;
      } else {
        // Criar novo projeto
        const { data, error } = await (supabase as any)
          .from('projetos')
          .insert([projetoData])
          .select()
          .single();

        if (error) throw error;
        projetoId = data.id;
        setProjetoExistente(data);
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
    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar rascunho",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const salvarEquipe = async (projetoId: string) => {
    if (!formData.equipe || formData.equipe.length === 0) return;

    // Deletar equipe existente
    await (supabase as any).from('equipe_projeto').delete().eq('projeto_id', projetoId);

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
      await (supabase as any).from('equipe_projeto').insert(equipeData);
    }
  };

  const salvarAtividades = async (projetoId: string) => {
    if (!formData.atividades || formData.atividades.length === 0) return;

    // Deletar atividades existentes
    await (supabase as any).from('atividades_projeto').delete().eq('projeto_id', projetoId);

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
      await (supabase as any).from('atividades_projeto').insert(atividadesData);
    }
  };

  const salvarMetas = async (projetoId: string) => {
    if (!formData.metas || formData.metas.length === 0) return;

    // Deletar metas existentes
    await (supabase as any).from('metas_projeto').delete().eq('projeto_id', projetoId);

    // Inserir novas metas
    const metasData = formData.metas.map((meta: any, index: number) => ({
      projeto_id: projetoId,
      descricao: meta.descricao,
      ordem: index
    }));

    if (metasData.length > 0) {
      await (supabase as any).from('metas_projeto').insert(metasData);
    }
  };

  const salvarOrcamento = async (projetoId: string) => {
    if (!formData.orcamento || formData.orcamento.length === 0) return;

    // Deletar orçamento existente
    await (supabase as any).from('itens_orcamento_projeto').delete().eq('projeto_id', projetoId);

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
      await (supabase as any).from('itens_orcamento_projeto').insert(orcamentoData);
    }
  };

  const handleInscrever = async () => {
    // Verificar se todos os passos foram preenchidos
    const requiredFields = [
      { field: 'nome', message: 'Nome do projeto' },
      { field: 'modalidade', message: 'Modalidade' },
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

      // Buscar prefeitura_id
      const { data: proponenteData } = await supabase
        .from('proponentes')
        .select('prefeitura_id')
        .eq('id', formData.proponente_id)
        .single();

      if (!proponenteData) throw new Error('Proponente não encontrado');

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
        status: 'aguardando_avaliacao',
        data_submissao: new Date().toISOString()
      };

      let projetoId;

      if (projetoExistente) {
        // Atualizar projeto existente
        const { error } = await (supabase as any)
          .from('projetos')
          .update(projetoData)
          .eq('id', projetoExistente.id);

        if (error) throw error;
        projetoId = projetoExistente.id;
      } else {
        // Criar novo projeto
        const { data, error } = await (supabase as any)
          .from('projetos')
          .insert([projetoData])
          .select()
          .single();

        if (error) throw error;
        projetoId = data.id;
      }

      // Salvar equipe, atividades, metas e orçamento
      await Promise.all([
        salvarEquipe(projetoId),
        salvarAtividades(projetoId),
        salvarMetas(projetoId),
        salvarOrcamento(projetoId)
      ]);

      // Criar avaliação automaticamente
      const { error: avaliacaoError } = await (supabase as any)
        .from('avaliacoes')
        .insert([{
          prefeitura_id: proponenteData.prefeitura_id,
          projeto_id: projetoId,
          parecerista_id: null,
          status: 'aguardando_parecerista',
          data_atribuicao: new Date().toISOString()
        }]);

      if (avaliacaoError) {
        console.error('Erro ao criar avaliação:', avaliacaoError);
        // Não falhar a inscrição se a avaliação não for criada
      }

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

      // Deletar projeto existente
      const { error } = await (supabase as any)
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
    if (!novoOrcamento.descricao || !novoOrcamento.unidade_medida || !novoOrcamento.valor_unitario || !novoOrcamento.quantidade) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios do orçamento",
        variant: "destructive",
      });
      return;
    }
    setFormData({
      ...formData,
      orcamento: [...formData.orcamento, { ...novoOrcamento }]
    });
    setNovoOrcamento({
      descricao: '',
      justificativa: '',
      unidade_medida: '',
      valor_unitario: '',
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Proponente
        const proponenteSelecionado0 = proponentes.find(p => p.id === formData.proponente_id);
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="proponente_id">Selecione o Proponente *</Label>
              <Select value={formData.proponente_id} onValueChange={(value) => handleInputChange('proponente_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um proponente" />
                </SelectTrigger>
                <SelectContent>
                  {proponentes.map(prop => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.tipo === 'PJ' && prop.razao_social ? prop.razao_social : prop.nome} ({prop.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {proponentes.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Você não possui proponentes cadastrados. Cadastre primeiro em Proponentes.</p>
              )}
            </div>

            {/* Exibir dados do proponente selecionado */}
            {proponenteSelecionado0 && (
              <Card className="border-l-4" style={{ borderLeftColor: proponenteSelecionado0.tipo === 'PF' ? '#2563eb' : '#16a34a' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    Dados do Proponente Selecionado
                    <Badge variant={proponenteSelecionado0.tipo === 'PF' ? 'default' : 'secondary'} className={proponenteSelecionado0.tipo === 'PF' ? 'bg-blue-600' : 'bg-green-600'}>
                      {proponenteSelecionado0.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nome principal */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {proponenteSelecionado0.tipo === 'PJ' && proponenteSelecionado0.razao_social ? proponenteSelecionado0.razao_social : proponenteSelecionado0.nome}
                    </h3>
                    {proponenteSelecionado0.tipo === 'PJ' && proponenteSelecionado0.nome_fantasia && (
                      <p className="text-sm text-gray-600 italic">Nome Fantasia: {proponenteSelecionado0.nome_fantasia}</p>
                    )}
                    {proponenteSelecionado0.nome_artistico && (
                      <p className="text-sm text-gray-600 italic">Nome Artístico: {proponenteSelecionado0.nome_artistico}</p>
                    )}
                  </div>

                  {/* Dados de Identificação */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                    {proponenteSelecionado0.cpf && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">CPF:</span>
                        <p className="text-sm text-gray-700">{proponenteSelecionado0.cpf}</p>
                      </div>
                    )}
                    {proponenteSelecionado0.cnpj && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">CNPJ:</span>
                        <p className="text-sm text-gray-700">{proponenteSelecionado0.cnpj}</p>
                      </div>
                    )}
                    {proponenteSelecionado0.rg && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">RG:</span>
                        <p className="text-sm text-gray-700">{proponenteSelecionado0.rg}</p>
                      </div>
                    )}
                    {proponenteSelecionado0.data_nascimento && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Data de Nascimento:</span>
                        <p className="text-sm text-gray-700">{new Date(proponenteSelecionado0.data_nascimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>

                  {/* Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                    {proponenteSelecionado0.telefone && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Telefone:</span>
                        <p className="text-sm text-gray-700">{proponenteSelecionado0.telefone}</p>
                      </div>
                    )}
                    {proponenteSelecionado0.email && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Email:</span>
                        <p className="text-sm text-gray-700">{proponenteSelecionado0.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Endereço */}
                  {proponenteSelecionado0.endereco && (
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500 font-medium">Endereço:</span>
                      <p className="text-sm text-gray-700">{proponenteSelecionado0.endereco}</p>
                      <p className="text-sm text-gray-700">
                        {[proponenteSelecionado0.cidade, proponenteSelecionado0.estado, proponenteSelecionado0.cep].filter(Boolean).join(' - ')}
                      </p>
                    </div>
                  )}

                  {/* Dados específicos de PJ */}
                  {proponenteSelecionado0.tipo === 'PJ' && (
                    <>
                      {proponenteSelecionado0.inscricao_estadual && (
                        <div className="pt-2 border-t">
                          <span className="text-xs text-gray-500 font-medium">Inscrição Estadual:</span>
                          <p className="text-sm text-gray-700">{proponenteSelecionado0.inscricao_estadual}</p>
                        </div>
                      )}
                      {proponenteSelecionado0.nome_responsavel && (
                        <div className="pt-2 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Responsável Legal</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs text-gray-500 font-medium">Nome:</span>
                              <p className="text-sm text-gray-700">{proponenteSelecionado0.nome_responsavel}</p>
                            </div>
                            {proponenteSelecionado0.cpf_responsavel && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">CPF:</span>
                                <p className="text-sm text-gray-700">{proponenteSelecionado0.cpf_responsavel}</p>
                              </div>
                            )}
                            {proponenteSelecionado0.email_responsavel && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Email:</span>
                                <p className="text-sm text-gray-700">{proponenteSelecionado0.email_responsavel}</p>
                              </div>
                            )}
                            {proponenteSelecionado0.telefone_responsavel && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Telefone:</span>
                                <p className="text-sm text-gray-700">{proponenteSelecionado0.telefone_responsavel}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 1: // Informações Básicas
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="nome">Nome do Projeto *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Digite o nome do projeto"
              />
            </div>
            <div>
              <Label htmlFor="modalidade">Modalidade *</Label>
              <Select value={formData.modalidade} onValueChange={(value) => handleInputChange('modalidade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalidadesOptions
                    .filter(option => edital?.modalidades?.includes(option.value))
                    .map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {edital?.modalidades && edital.modalidades.length === 0 && (
                <p className="text-sm text-amber-500 mt-1">Nenhuma modalidade disponível para este edital</p>
              )}
            </div>
            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva detalhadamente seu projeto cultural..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="objetivos">Objetivos *</Label>
              <Textarea
                id="objetivos"
                value={formData.objetivos}
                onChange={(e) => handleInputChange('objetivos', e.target.value)}
                placeholder="Descreva os objetivos do projeto..."
                rows={6}
              />
            </div>
          </div>
        );

      case 2: // Público e Acessibilidade (anteriormente case 1)
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="perfil_publico">Perfil do Público</Label>
              <Textarea
                id="perfil_publico"
                value={formData.perfil_publico}
                onChange={(e) => handleInputChange('perfil_publico', e.target.value)}
                placeholder="Descreva o perfil do público-alvo..."
                rows={3}
              />
            </div>
            <div>
              <Label>Público Prioritário</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {publicoPrioritarioOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`publico-${option}`}
                      checked={formData.publico_prioritario?.includes(option)}
                      onCheckedChange={(checked) => {
                        const current = formData.publico_prioritario || [];
                        if (checked) {
                          handleInputChange('publico_prioritario', [...current, option]);
                        } else {
                          handleInputChange('publico_prioritario', current.filter((p: string) => p !== option));
                        }
                      }}
                    />
                    <label htmlFor={`publico-${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>
            {formData.publico_prioritario?.includes('Outros') && (
              <div>
                <Label htmlFor="outro_publico_prioritario">Outro Público Prioritário</Label>
                <Input
                  id="outro_publico_prioritario"
                  value={formData.outro_publico_prioritario}
                  onChange={(e) => handleInputChange('outro_publico_prioritario', e.target.value)}
                  placeholder="Especifique outro público prioritário"
                />
              </div>
            )}
            <div>
              <Label>Acessibilidade Arquitetônica</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {acessibilidadeArquitetonicaOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`arq-${option}`}
                      checked={formData.acessibilidade_arquitetonica?.includes(option)}
                      onCheckedChange={(checked) => {
                        const current = formData.acessibilidade_arquitetonica || [];
                        if (checked) {
                          handleInputChange('acessibilidade_arquitetonica', [...current, option]);
                        } else {
                          handleInputChange('acessibilidade_arquitetonica', current.filter((a: string) => a !== option));
                        }
                      }}
                    />
                    <label htmlFor={`arq-${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>
            {formData.acessibilidade_arquitetonica?.includes('Outra') && (
              <div>
                <Label htmlFor="outra_acessibilidade_arquitetonica">Outra Acessibilidade Arquitetônica</Label>
                <Input
                  id="outra_acessibilidade_arquitetonica"
                  value={formData.outra_acessibilidade_arquitetonica}
                  onChange={(e) => handleInputChange('outra_acessibilidade_arquitetonica', e.target.value)}
                  placeholder="Especifique outra acessibilidade"
                />
              </div>
            )}
          </div>
        );

      case 3: // Acessibilidade Comunicacional e Atitudinal
        return (
          <div className="space-y-6">
            <div>
              <Label>Acessibilidade Comunicacional</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {acessibilidadeComunicacionalOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`com-${option}`}
                      checked={formData.acessibilidade_comunicacional?.includes(option)}
                      onCheckedChange={(checked) => {
                        const current = formData.acessibilidade_comunicacional || [];
                        if (checked) {
                          handleInputChange('acessibilidade_comunicacional', [...current, option]);
                        } else {
                          handleInputChange('acessibilidade_comunicacional', current.filter((a: string) => a !== option));
                        }
                      }}
                    />
                    <label htmlFor={`com-${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>
            {formData.acessibilidade_comunicacional?.includes('Outra') && (
              <div>
                <Label htmlFor="outra_acessibilidade_comunicacional">Outra Acessibilidade Comunicacional</Label>
                <Input
                  id="outra_acessibilidade_comunicacional"
                  value={formData.outra_acessibilidade_comunicacional}
                  onChange={(e) => handleInputChange('outra_acessibilidade_comunicacional', e.target.value)}
                  placeholder="Especifique outra acessibilidade"
                />
              </div>
            )}
            <div>
              <Label>Acessibilidade Atitudinal</Label>
              <div className="space-y-2 mt-2">
                {acessibilidadeAtitudinalOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`at-${option}`}
                      checked={formData.acessibilidade_atitudinal?.includes(option)}
                      onCheckedChange={(checked) => {
                        const current = formData.acessibilidade_atitudinal || [];
                        if (checked) {
                          handleInputChange('acessibilidade_atitudinal', [...current, option]);
                        } else {
                          handleInputChange('acessibilidade_atitudinal', current.filter((a: string) => a !== option));
                        }
                      }}
                    />
                    <label htmlFor={`at-${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="implementacao_acessibilidade">Implementação de Acessibilidade</Label>
              <Textarea
                id="implementacao_acessibilidade"
                value={formData.implementacao_acessibilidade}
                onChange={(e) => handleInputChange('implementacao_acessibilidade', e.target.value)}
                placeholder="Descreva como as acessibilidades serão implementadas..."
                rows={4}
              />
            </div>
          </div>
        );

      case 4: // Cronograma e Local
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="local_execucao">Local de Execução</Label>
              <Input
                id="local_execucao"
                value={formData.local_execucao}
                onChange={(e) => handleInputChange('local_execucao', e.target.value)}
                placeholder="Digite o local de execução"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_final">Data Final</Label>
                <Input
                  id="data_final"
                  type="date"
                  value={formData.data_final}
                  onChange={(e) => handleInputChange('data_final', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="estrategia_divulgacao">Estratégia de Divulgação</Label>
              <Textarea
                id="estrategia_divulgacao"
                value={formData.estrategia_divulgacao}
                onChange={(e) => handleInputChange('estrategia_divulgacao', e.target.value)}
                placeholder="Descreva a estratégia de divulgação..."
                rows={4}
              />
            </div>
          </div>
        );

      case 5: // Valor e Financiamento
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="valor_solicitado">Valor Solicitado *</Label>
              <Input
                id="valor_solicitado"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_solicitado}
                onChange={(e) => handleInputChange('valor_solicitado', e.target.value)}
                placeholder="0.00"
              />
              {edital && (
                <p className="text-sm text-gray-500 mt-1">Valor máximo permitido: {edital.valor_maximo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="outras_fontes"
                checked={formData.outras_fontes}
                onCheckedChange={(checked) => handleInputChange('outras_fontes', checked)}
              />
              <label htmlFor="outras_fontes" className="text-sm">Outras Fontes de Financiamento</label>
            </div>
            {formData.outras_fontes && (
              <>
                <div>
                  <Label>Tipos de Outras Fontes</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {tiposOutrasFontesOptions.map(option => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`fonte-${option}`}
                          checked={formData.tipos_outras_fontes?.includes(option)}
                          onCheckedChange={(checked) => {
                            const current = formData.tipos_outras_fontes || [];
                            if (checked) {
                              handleInputChange('tipos_outras_fontes', [...current, option]);
                            } else {
                              handleInputChange('tipos_outras_fontes', current.filter((t: string) => t !== option));
                            }
                          }}
                        />
                        <label htmlFor={`fonte-${option}`} className="text-sm">{option}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="detalhes_outras_fontes">Detalhes das Outras Fontes</Label>
                  <Textarea
                    id="detalhes_outras_fontes"
                    value={formData.detalhes_outras_fontes}
                    onChange={(e) => handleInputChange('detalhes_outras_fontes', e.target.value)}
                    placeholder="Detalhe as outras fontes de financiamento..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        );

      case 6: // Equipe do Projeto
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="membro_nome">Nome *</Label>
                  <Input
                    id="membro_nome"
                    value={novoMembro.nome}
                    onChange={(e) => setNovoMembro({ ...novoMembro, nome: e.target.value })}
                    placeholder="Digite o nome"
                  />
                </div>
                <div>
                  <Label htmlFor="membro_funcao">Função *</Label>
                  <Input
                    id="membro_funcao"
                    value={novoMembro.funcao}
                    onChange={(e) => setNovoMembro({ ...novoMembro, funcao: e.target.value })}
                    placeholder="Digite a função"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="membro_cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="membro_cpf_cnpj"
                  value={novoMembro.cpf_cnpj}
                  onChange={(e) => setNovoMembro({ ...novoMembro, cpf_cnpj: aplicarMascaraDocumento(e.target.value) })}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membro_indigena"
                    checked={novoMembro.indigena}
                    onCheckedChange={(checked) => setNovoMembro({ ...novoMembro, indigena: checked as boolean })}
                  />
                  <label htmlFor="membro_indigena" className="text-sm">Indígena</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membro_lgbtqiapn"
                    checked={novoMembro.lgbtqiapn}
                    onCheckedChange={(checked) => setNovoMembro({ ...novoMembro, lgbtqiapn: checked as boolean })}
                  />
                  <label htmlFor="membro_lgbtqiapn" className="text-sm">LGBTQIAPN+</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membro_preto_pardo"
                    checked={novoMembro.preto_pardo}
                    onCheckedChange={(checked) => setNovoMembro({ ...novoMembro, preto_pardo: checked as boolean })}
                  />
                  <label htmlFor="membro_preto_pardo" className="text-sm">Preto/Pardo</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membro_deficiencia"
                    checked={novoMembro.deficiencia}
                    onCheckedChange={(checked) => setNovoMembro({ ...novoMembro, deficiencia: checked as boolean })}
                  />
                  <label htmlFor="membro_deficiencia" className="text-sm">PCD</label>
                </div>
              </div>
              <div>
                <Label htmlFor="membro_curriculo">Mini Currículo</Label>
                <Textarea
                  id="membro_curriculo"
                  value={novoMembro.mini_curriculo}
                  onChange={(e) => setNovoMembro({ ...novoMembro, mini_curriculo: e.target.value })}
                  placeholder="Digite um mini currículo..."
                  rows={3}
                />
              </div>
              <Button type="button" onClick={handleAdicionarMembro} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Membro
              </Button>
            </div>

            {formData.equipe && formData.equipe.length > 0 && (
              <div className="space-y-2">
                {formData.equipe.map((membro: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{membro.nome}</h4>
                          <p className="text-sm text-gray-500">{membro.funcao}</p>
                          {membro.cpf_cnpj && <p className="text-xs text-gray-400">CPF/CNPJ: {membro.cpf_cnpj}</p>}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {membro.indigena && <Badge variant="outline" className="text-xs">Indígena</Badge>}
                            {membro.lgbtqiapn && <Badge variant="outline" className="text-xs">LGBTQIAPN+</Badge>}
                            {membro.preto_pardo && <Badge variant="outline" className="text-xs">Preto/Pardo</Badge>}
                            {membro.deficiencia && <Badge variant="outline" className="text-xs">PCD</Badge>}
                          </div>
                          {membro.mini_curriculo && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{membro.mini_curriculo}</p>}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newEquipe = formData.equipe.filter((_: any, i: number) => i !== index);
                            handleInputChange('equipe', newEquipe);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 7: // Atividades Planejadas
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div>
                <Label htmlFor="atividade_nome">Nome da Atividade *</Label>
                <Input
                  id="atividade_nome"
                  value={novaAtividade.nome_atividade}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, nome_atividade: e.target.value })}
                  placeholder="Digite o nome da atividade"
                />
              </div>
              <div>
                <Label htmlFor="atividade_etapa">Etapa *</Label>
                <Select value={novaAtividade.etapa} onValueChange={(value) => setNovaAtividade({ ...novaAtividade, etapa: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {etapaOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="atividade_descricao">Descrição</Label>
                <Textarea
                  id="atividade_descricao"
                  value={novaAtividade.descricao}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, descricao: e.target.value })}
                  placeholder="Descreva a atividade..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="atividade_data_inicio">Data de Início *</Label>
                  <Input
                    id="atividade_data_inicio"
                    type="date"
                    value={novaAtividade.data_inicio}
                    onChange={(e) => setNovaAtividade({ ...novaAtividade, data_inicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="atividade_data_fim">Data Final *</Label>
                  <Input
                    id="atividade_data_fim"
                    type="date"
                    value={novaAtividade.data_fim}
                    onChange={(e) => setNovaAtividade({ ...novaAtividade, data_fim: e.target.value })}
                  />
                </div>
              </div>
              <Button type="button" onClick={handleAdicionarAtividade} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Atividade
              </Button>
            </div>

            {formData.atividades && formData.atividades.length > 0 && (
              <div className="space-y-2">
                {formData.atividades.map((atividade: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{atividade.nome_atividade}</h4>
                          <p className="text-sm text-gray-500">Etapa: {atividade.etapa}</p>
                          {atividade.descricao && <p className="text-sm text-gray-600 mt-1">{atividade.descricao}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(atividade.data_inicio).toLocaleDateString('pt-BR')} - {new Date(atividade.data_fim).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newAtividades = formData.atividades.filter((_: any, i: number) => i !== index);
                            handleInputChange('atividades', newAtividades);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 8: // Metas do Projeto
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div>
                <Label htmlFor="meta_descricao">Descrição da Meta *</Label>
                <Textarea
                  id="meta_descricao"
                  value={novaMeta.descricao}
                  onChange={(e) => setNovaMeta({ ...novaMeta, descricao: e.target.value })}
                  placeholder="Descreva a meta..."
                  rows={3}
                />
              </div>
              <Button type="button" onClick={handleAdicionarMeta} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Meta
              </Button>
            </div>

            {formData.metas && formData.metas.length > 0 && (
              <div className="space-y-2">
                {formData.metas.map((meta: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <p className="flex-1">{meta.descricao}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newMetas = formData.metas.filter((_: any, i: number) => i !== index);
                            handleInputChange('metas', newMetas);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 9: // Orçamento Detalhado
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div>
                <Label htmlFor="orcamento_descricao">Descrição *</Label>
                <Input
                  id="orcamento_descricao"
                  value={novoOrcamento.descricao}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, descricao: e.target.value })}
                  placeholder="Digite a descrição do item"
                />
              </div>
              <div>
                <Label htmlFor="orcamento_justificativa">Justificativa *</Label>
                <Textarea
                  id="orcamento_justificativa"
                  value={novoOrcamento.justificativa}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, justificativa: e.target.value })}
                  placeholder="Justifique o item..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="orcamento_unidade">Unidade de Medida *</Label>
                <Select value={novoOrcamento.unidade_medida} onValueChange={(value) => setNovoOrcamento({ ...novoOrcamento, unidade_medida: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadeMedidaOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orcamento_valor">Valor Unitário *</Label>
                  <Input
                    id="orcamento_valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoOrcamento.valor_unitario}
                    onChange={(e) => setNovoOrcamento({ ...novoOrcamento, valor_unitario: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="orcamento_quantidade">Quantidade *</Label>
                  <Input
                    id="orcamento_quantidade"
                    type="number"
                    min="1"
                    value={novoOrcamento.quantidade}
                    onChange={(e) => setNovoOrcamento({ ...novoOrcamento, quantidade: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="orcamento_referencia">Referência de Preço</Label>
                <Input
                  id="orcamento_referencia"
                  value={novoOrcamento.referencia_preco}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, referencia_preco: e.target.value })}
                  placeholder="Ex: Cotação realizada em..."
                />
              </div>
              <Button type="button" onClick={handleAdicionarOrcamento} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            {formData.orcamento && formData.orcamento.length > 0 && (
              <div className="space-y-2">
                {formData.orcamento.map((item: any, index: number) => {
                  const total = (parseFloat(item.valor_unitario) || 0) * (parseInt(item.quantidade) || 0);
                  return (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.descricao}</h4>
                            <p className="text-sm text-gray-500">{item.justificativa}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {item.quantidade} {item.unidade_medida} × R$ {item.valor_unitario.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">R$ {total.toLocaleString('pt-BR')}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newOrcamento = formData.orcamento.filter((_: any, i: number) => i !== index);
                                handleInputChange('orcamento', newOrcamento);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <Card className="bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span>Total do Orçamento</span>
                      <span>
                        R$ {formData.orcamento.reduce((sum: number, item: any) => {
                          const valor = parseFloat(item.valor_unitario) || 0;
                          const quantidade = parseInt(item.quantidade) || 0;
                          return sum + (valor * quantidade);
                        }, 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {formData.valor_solicitado && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">Valor Solicitado</span>
                        <span className={`text-sm font-medium ${Math.abs(parseFloat(formData.valor_solicitado) - formData.orcamento.reduce((sum: number, item: any) => {
                          const valor = parseFloat(item.valor_unitario) || 0;
                          const quantidade = parseInt(item.quantidade) || 0;
                          return sum + (valor * quantidade);
                        }, 0)) > 0.01 ? 'text-red-500' : 'text-green-600'}`}>
                          R$ {parseFloat(formData.valor_solicitado || '0').toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canGoNext = () => {
    // Validações básicas para cada step
    switch (currentStep) {
      case 0: // Proponente
        return formData.proponente_id;
      
      case 1: // Informações Básicas
        return formData.nome && formData.modalidade && formData.descricao && formData.objetivos;
      
      case 2: // Público e Acessibilidade
        return true; // Opcional
      
      case 3: // Acessibilidade Comunicacional e Atitudinal
        return true; // Opcional
      
      case 4: // Cronograma e Local
        return true; // Opcional
      
      case 5: // Valor e Financiamento
        const valorSolicitado = parseFloat(formData.valor_solicitado);
        // Verificar se foi preenchido
        if (!valorSolicitado || valorSolicitado <= 0) return false;
        // Verificar se não excede o máximo do edital
        if (edital && valorSolicitado > edital.valor_maximo) return false;
        return true;
      
      case 6: // Equipe do Projeto
        return formData.equipe && formData.equipe.length > 0;
      
      case 7: // Atividades Planejadas
        return formData.atividades && formData.atividades.length > 0;
      
      case 8: // Metas do Projeto
        return formData.metas && formData.metas.length > 0;
      
      case 9: // Orçamento Detalhado
        if (!formData.orcamento || formData.orcamento.length === 0) return false;
        const totalOrcamento = formData.orcamento.reduce((sum: number, item: any) => {
          const valor = parseFloat(item.valor_unitario) || 0;
          const quantidade = parseInt(item.quantidade) || 0;
          return sum + (valor * quantidade);
        }, 0);
        const valorSolicitadoOrc = parseFloat(formData.valor_solicitado) || 0;
        return Math.abs(totalOrcamento - valorSolicitadoOrc) <= 0.01;
      
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (!canGoNext()) {
      // Exibir mensagens de erro específicas
      switch (currentStep) {
        case 0: // Proponente
          toast({
            title: "Proponente obrigatório",
            description: "Por favor, selecione um proponente",
            variant: "destructive",
          });
          break;
        case 1: // Informações Básicas
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha todas as informações básicas do projeto",
            variant: "destructive",
          });
          break;
        case 5: // Valor e Financiamento
          const valorSolicitado = parseFloat(formData.valor_solicitado);
          if (!valorSolicitado || valorSolicitado <= 0) {
            toast({
              title: "Valor inválido",
              description: "Por favor, informe um valor solicitado válido",
              variant: "destructive",
            });
          } else if (edital && valorSolicitado > edital.valor_maximo) {
            toast({
              title: "Valor excedido",
              description: `O valor solicitado não pode ser maior que ${edital.valor_maximo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
              variant: "destructive",
            });
          }
          break;
        case 6: // Equipe do Projeto
          toast({
            title: "Equipe obrigatória",
            description: "Por favor, adicione pelo menos um membro à equipe do projeto",
            variant: "destructive",
          });
          break;
        case 7: // Atividades Planejadas
          toast({
            title: "Atividades obrigatórias",
            description: "Por favor, adicione pelo menos uma atividade planejada",
            variant: "destructive",
          });
          break;
        case 8: // Metas do Projeto
          toast({
            title: "Metas obrigatórias",
            description: "Por favor, adicione pelo menos uma meta do projeto",
            variant: "destructive",
          });
          break;
        case 9: // Orçamento Detalhado
          if (!formData.orcamento || formData.orcamento.length === 0) {
            toast({
              title: "Orçamento obrigatório",
              description: "Por favor, adicione pelo menos um item ao orçamento",
              variant: "destructive",
            });
          } else {
            const totalOrcamento = formData.orcamento.reduce((sum: number, item: any) => {
              const valor = parseFloat(item.valor_unitario) || 0;
              const quantidade = parseInt(item.quantidade) || 0;
              return sum + (valor * quantidade);
            }, 0);
            const valorSolicitadoOrc = parseFloat(formData.valor_solicitado) || 0;
            toast({
              title: "Orçamento incompatível",
              description: `O total do orçamento (${totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) deve ser igual ao valor solicitado (${valorSolicitadoOrc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
              variant: "destructive",
            });
          }
          break;
      }
      return;
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
                Inscrever Projeto
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
              >
                Apagar projeto em rascunho e criar novo
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
              >
                Finalizar projeto em rascunho
              </Button>
            </DialogFooter>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>
    </ProponenteLayout>
  );
};

