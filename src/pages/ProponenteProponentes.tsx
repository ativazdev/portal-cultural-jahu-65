import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Edit, Loader2, ChevronLeft, ChevronRight, Check, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import { createClient } from "@supabase/supabase-js";
import {
  DadosBasicosPF, EnderecoPF, DadosPessoaisPF, PCDPF, FormacaoPF,
  ProgramasSociaisPF, CotasPF, ArtisticoPF, ColetivoPF, ExperienciaPF, BancarioPF,
  DadosEmpresaPJ, EnderecoPJ, InscricoesPJ, ResponsavelPJ, BancarioPJ
} from "@/components/proponente/StepForms";

interface Proponente {
  id: string;
  nome: string;
  tipo: 'PF' | 'PJ';
  cpf?: string;
  cnpj?: string;
  rg?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  [key: string]: any;
}

const ESTADOS_BRASILEIROS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

export const ProponenteProponentes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const { proponente: userProponente } = useProponenteAuth();
  
  // Função auxiliar para obter cliente Supabase autenticado
  const getAuthenticatedClient = () => {
    const token = localStorage.getItem('proponente_token');
    if (!token) return supabase;
    
    const SUPABASE_URL = "https://ymkytnhdslvkigzilbvy.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw";
    
    return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  };

  // Função auxiliar para formatar data
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
  
  // Estados
  const [isModalRegistroAberto, setIsModalRegistroAberto] = useState(false);
  const [isModalEdicaoAberto, setIsModalEdicaoAberto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProponentes, setIsLoadingProponentes] = useState(true);
  const [proponentes, setProponentes] = useState<Proponente[]>([]);
  const [proponentesFiltrados, setProponentesFiltrados] = useState<Proponente[]>([]);
  const [tipoRegistro, setTipoRegistro] = useState<"PF" | "PJ" | "">("");
  const [proponenteEditando, setProponenteEditando] = useState<Proponente | null>(null);
  
  // Estados de filtro
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "PF" | "PJ">("todos");
  
  // Estados de step
  const [currentStep, setCurrentStep] = useState(1);
  const totalStepsPF = 11;
  const totalStepsPJ = 5;
  
  // Estados do formulário
  const [formData, setFormData] = useState<any>({
    // Dados comuns
    nome: "",
    nomeArtistico: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    
    // Dados PF
    cpf: "",
    rg: "",
    dataNascimento: "",
    miniCurriculo: "",
    comunidadeTradicional: "",
    outraComunidade: "",
    genero: "",
    raca: "",
    pcd: false,
    tipoDeficiencia: "",
    outraDeficiencia: "",
    escolaridade: "",
    rendaMensal: "",
    programaSocial: "",
    outroProgramaSocial: "",
    concorreCotas: false,
    tipoCotas: "",
    funcaoArtistica: "",
    outraFuncaoArtistica: "",
    representaColetivo: false,
    nomeColetivo: "",
    anoColetivo: "",
    quantidadePessoas: "",
    membrosColetivo: "",
    profissao: "",
    
    // Dados PJ
    cnpj: "",
    razaoSocial: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    nomeResponsavel: "",
    cpfResponsavel: "",
    cargoResponsavel: "",
    
    // Dados bancários
    banco: "",
    agencia: "",
    conta: "",
    tipoConta: "",
    pix: "",
  });

  // Carregar proponentes
  useEffect(() => {
    if (userProponente?.id) {
      carregarProponentes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProponente?.id]);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...proponentes];

    // Filtro por tipo
    if (filtroTipo !== "todos") {
      resultado = resultado.filter(p => p.tipo === filtroTipo);
    }

    // Filtro por texto
    if (filtroTexto.trim()) {
      const texto = filtroTexto.toLowerCase().trim();
      resultado = resultado.filter(p => {
        return (
          p.nome?.toLowerCase().includes(texto) ||
          p.nome_artistico?.toLowerCase().includes(texto) ||
          p.email?.toLowerCase().includes(texto) ||
          p.razao_social?.toLowerCase().includes(texto) ||
          p.nome_responsavel?.toLowerCase().includes(texto) ||
          p.cpf_responsavel?.includes(texto)
        );
      });
    }

    setProponentesFiltrados(resultado);
  }, [proponentes, filtroTexto, filtroTipo]);

  const carregarProponentes = async () => {
    if (!userProponente?.id) return;
    
    try {
      setIsLoadingProponentes(true);
      
      // Buscar proponentes relacionados ao usuario_proponente atual
      const client = getAuthenticatedClient();
      const { data, error } = await client
        .from('proponentes')
        .select('*')
        .eq('usuario_id', userProponente.id)
        .order('nome');

      if (error) throw error;
      
      setProponentes(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar proponentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os proponentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProponentes(false);
    }
  };

  // Funções para registro de novos proponentes
  const handleRegistrarPF = () => {
    setTipoRegistro("PF");
    setProponenteEditando(null);
    setCurrentStep(1);
    setFormData({
      nome: "", nomeArtistico: "", telefone: "", cep: "", endereco: "", numero: "", complemento: "", cidade: "", estado: "",
      cpf: "", rg: "", dataNascimento: "", miniCurriculo: "",
      comunidadeTradicional: "", outraComunidade: "",
      genero: "", raca: "", pcd: false, tipoDeficiencia: "", outraDeficiencia: "",
      escolaridade: "", rendaMensal: "",
      programaSocial: "", outroProgramaSocial: "",
      concorreCotas: false, tipoCotas: "",
      funcaoArtistica: "", outraFuncaoArtistica: "",
      representaColetivo: false, nomeColetivo: "", anoColetivo: "", quantidadePessoas: "", membrosColetivo: "", profissao: "",
      cnpj: "", razaoSocial: "", inscricaoEstadual: "", inscricaoMunicipal: "",
      nomeResponsavel: "", cpfResponsavel: "", cargoResponsavel: "",
      enderecoSede: "", numeroSede: "", complementoSede: "",
      banco: "", agencia: "", conta: "", tipoConta: "", pix: "",
    });
    setIsModalRegistroAberto(true);
  };

  const handleRegistrarPJ = () => {
    setTipoRegistro("PJ");
    setProponenteEditando(null);
    setCurrentStep(1);
    setFormData({
      nome: "", nomeArtistico: "", telefone: "", cep: "", endereco: "", numero: "", complemento: "", cidade: "", estado: "",
      cpf: "", rg: "", dataNascimento: "", miniCurriculo: "",
      comunidadeTradicional: "", outraComunidade: "",
      genero: "", raca: "", pcd: false, tipoDeficiencia: "", outraDeficiencia: "",
      escolaridade: "", rendaMensal: "",
      programaSocial: "", outroProgramaSocial: "",
      concorreCotas: false, tipoCotas: "",
      funcaoArtistica: "", outraFuncaoArtistica: "",
      representaColetivo: false, nomeColetivo: "", anoColetivo: "", quantidadePessoas: "", membrosColetivo: "", profissao: "",
      cnpj: "", razaoSocial: "", inscricaoEstadual: "", inscricaoMunicipal: "",
      nomeResponsavel: "", cpfResponsavel: "", cargoResponsavel: "",
      enderecoSede: "", numeroSede: "", complementoSede: "",
      banco: "", agencia: "", conta: "", tipoConta: "", pix: "",
    });
    setIsModalRegistroAberto(true);
  };

  // Função para editar proponente
  const handleEditarProponente = (proponente: Proponente) => {
    setProponenteEditando(proponente);
    setTipoRegistro(proponente.tipo === "PF" ? "PF" : "PJ");
    setCurrentStep(1);
    setFormData({
      nome: proponente.nome || "",
      nomeArtistico: proponente.nome_artistico || "",
      email: proponente.email || "",
      telefone: proponente.telefone || "",
      endereco: proponente.endereco || "",
      numero: "",
      complemento: "",
      cep: proponente.cep || "",
      cidade: proponente.cidade || "",
      estado: proponente.estado || "",
      cpf: proponente.cpf || "",
      rg: proponente.rg || "",
      dataNascimento: proponente.data_nascimento || "",
      miniCurriculo: proponente.mini_curriculo || "",
      comunidadeTradicional: proponente.comunidade_tradicional || "",
      outraComunidade: proponente.outra_comunidade || "",
      genero: proponente.genero || "",
      raca: proponente.raca || "",
      pcd: proponente.pcd ? "sim" : "nao",
      tipoDeficiencia: proponente.tipo_deficiencia || "",
      outraDeficiencia: proponente.outra_deficiencia || "",
      escolaridade: proponente.escolaridade || "",
      rendaMensal: proponente.renda_mensal || "",
      programaSocial: proponente.programa_social || "",
      outroProgramaSocial: proponente.outro_programa_social || "",
      concorreCotas: proponente.concorre_cotas ? "sim" : "nao",
      tipoCotas: proponente.tipo_cotas || "",
      funcaoArtistica: proponente.funcao_artistica || "",
      outraFuncaoArtistica: proponente.outra_funcao_artistica || "",
      representaColetivo: proponente.representa_coletivo || false,
      nomeColetivo: proponente.nome_coletivo || "",
      anoColetivo: proponente.ano_coletivo || "",
      quantidadePessoas: "",
      membrosColetivo: "",
      profissao: "",
      cnpj: proponente.cnpj || "",
      razaoSocial: proponente.razao_social || "",
      inscricaoEstadual: proponente.inscricao_estadual || "",
      inscricaoMunicipal: proponente.inscricao_municipal || "",
      nomeResponsavel: proponente.nome_responsavel || "",
      cpfResponsavel: proponente.cpf_responsavel || "",
      cargoResponsavel: proponente.cargo_responsavel || "",
      enderecoSede: proponente.endereco || "",
      numeroSede: "",
      complementoSede: "",
      banco: proponente.banco || "",
      agencia: proponente.agencia || "",
      conta: proponente.conta || "",
      tipoConta: proponente.tipo_conta || "",
      pix: proponente.pix || "",
    });
    setIsModalEdicaoAberto(true);
  };

  // Função para aplicar máscaras
  const aplicarMascaraCPF = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value.substring(0, 14);
  };

  const aplicarMascaraCNPJ = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    return numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const aplicarMascaraRG = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    // Formato: XX.XXX.XXX-X (9 dígitos total)
    let formatted = '';
    if (numeros.length > 0) {
      formatted = numeros.substring(0, 2);
      if (numeros.length > 2) {
        formatted += '.' + numeros.substring(2, 5);
        if (numeros.length > 5) {
          formatted += '.' + numeros.substring(5, 8);
          if (numeros.length > 8) {
            formatted += '-' + numeros.substring(8, 9);
          }
        }
      }
    }
    return formatted;
  };

  const aplicarMascaraTelefone = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    } else {
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
  };

  const aplicarMascaraCEP = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    return numeros
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  // Funções de navegação de steps
  const nextStep = () => {
    const maxSteps = tipoRegistro === 'PF' ? totalStepsPF : totalStepsPJ;
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    const maxSteps = tipoRegistro === 'PF' ? totalStepsPF : totalStepsPJ;
    if (step >= 1 && step <= maxSteps) {
      setCurrentStep(step);
    }
  };

  // Reset step quando abrir modal
  const resetModal = () => {
    setCurrentStep(1);
    setIsModalRegistroAberto(false);
  };

  // Função para buscar CEP via ViaCEP
  const buscarCEP = async (cep: string, tipoEndereco: 'PF' | 'PJ' = 'PF') => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          if (tipoEndereco === 'PF') {
            setFormData((prev: any) => ({
              ...prev,
              endereco: data.logradouro || prev.endereco,
              cidade: data.localidade || prev.cidade,
              estado: data.uf || prev.estado,
              cep: cep,
            }));
          } else {
            setFormData((prev: any) => ({
              ...prev,
              enderecoSede: data.logradouro || prev.enderecoSede,
              cidade: data.localidade || prev.cidade,
              estado: data.uf || prev.estado,
              cep: cep,
            }));
          }
          
          toast({
            title: "CEP encontrado!",
            description: "Endereço preenchido automaticamente. Complete com o número.",
          });
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP e tente novamente.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast({
          title: "Erro",
          description: "Não foi possível buscar o CEP. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    // Se for boolean (checkbox), não aplicar máscaras
    if (typeof value === 'boolean') {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
      return;
    }
    
    let valorFormatado = value;
    
    // Aplicar máscaras
    if (field === 'cpf' || field === 'cpfRepresentante' || field === 'cpfResponsavel') {
      valorFormatado = aplicarMascaraCPF(value);
    } else if (field === 'cnpj') {
      valorFormatado = aplicarMascaraCNPJ(value);
    } else if (field === 'rg') {
      valorFormatado = aplicarMascaraRG(value);
    } else if (field === 'telefone' || field === 'telefoneRepresentante') {
      valorFormatado = aplicarMascaraTelefone(value);
    } else if (field === 'cep') {
      valorFormatado = aplicarMascaraCEP(value);
    }
    
    setFormData((prev: any) => ({ ...prev, [field]: valorFormatado }));
    
    // Buscar CEP automaticamente - precisamos saber se é PF ou PJ
    if (field === 'cep' && valorFormatado.length === 9) {
      buscarCEP(valorFormatado, tipoRegistro as 'PF' | 'PJ');
    }
  };

  const handleSalvarRegistro = async () => {
    const nomeValido = tipoRegistro === 'PF' ? formData.nome : formData.razaoSocial;
    const enderecoValido = tipoRegistro === 'PF' ? formData.endereco : formData.enderecoSede;
    
    if (!nomeValido || !enderecoValido) {
      toast({
        title: "Campos obrigatórios",
        description: tipoRegistro === 'PF' 
          ? "Preencha pelo menos nome e logradouro."
          : "Preencha pelo menos razão social e logradouro da sede.",
        variant: "destructive",
      });
      return;
    }

    if (!userProponente?.id || !userProponente?.prefeitura_id || !userProponente?.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const dadosProponente: any = {
        telefone: formData.telefone,
        cep: formData.cep,
        cidade: formData.cidade,
        estado: formData.estado,
        tipo: tipoRegistro,
      };

      if (tipoRegistro === "PF") {
        dadosProponente.nome = formData.nome;
        dadosProponente.nome_artistico = formData.nomeArtistico;
        dadosProponente.endereco = formData.endereco;
        dadosProponente.cpf = formData.cpf;
        dadosProponente.rg = formData.rg;
        dadosProponente.data_nascimento = formData.dataNascimento;
        dadosProponente.mini_curriculo = formData.miniCurriculo;
        dadosProponente.comunidade_tradicional = formData.comunidadeTradicional;
        dadosProponente.outra_comunidade = formData.outraComunidade;
        dadosProponente.genero = formData.genero;
        dadosProponente.raca = formData.raca;
        dadosProponente.pcd = formData.pcd === "sim" || formData.pcd === true;
        dadosProponente.tipo_deficiencia = formData.tipoDeficiencia;
        dadosProponente.outra_deficiencia = formData.outraDeficiencia;
        dadosProponente.escolaridade = formData.escolaridade;
        dadosProponente.renda_mensal = formData.rendaMensal;
        dadosProponente.programa_social = formData.programaSocial;
        dadosProponente.outro_programa_social = formData.outroProgramaSocial;
        dadosProponente.concorre_cotas = formData.concorreCotas === "sim" || formData.concorreCotas === true;
        dadosProponente.tipo_cotas = formData.tipoCotas;
        dadosProponente.funcao_artistica = formData.funcaoArtistica;
        dadosProponente.outra_funcao_artistica = formData.outraFuncaoArtistica;
        dadosProponente.representa_coletivo = formData.representaColetivo;
        dadosProponente.nome_coletivo = formData.nomeColetivo;
        dadosProponente.ano_coletivo = formData.anoColetivo;
        // dadosProponente.quantidade_pessoas = formData.quantidadePessoas ? parseInt(formData.quantidadePessoas) : null; // Coluna não existe na tabela
        // dadosProponente.membros_coletivo = formData.membrosColetivo; // Coluna não existe na tabela
        // dadosProponente.profissao = formData.profissao; // Coluna não existe na tabela
      } else if (tipoRegistro === "PJ") {
        dadosProponente.razao_social = formData.razaoSocial;
        dadosProponente.cnpj = formData.cnpj;
        dadosProponente.endereco = formData.enderecoSede;
        dadosProponente.inscricao_estadual = formData.inscricaoEstadual;
        dadosProponente.inscricao_municipal = formData.inscricaoMunicipal;
        dadosProponente.nome_responsavel = formData.nomeResponsavel;
        dadosProponente.cpf_responsavel = formData.cpfResponsavel;
        dadosProponente.cargo_responsavel = formData.cargoResponsavel;
      }
      
      // Dados bancários (comum para ambos)
      dadosProponente.banco = formData.banco;
      dadosProponente.agencia = formData.agencia;
      dadosProponente.conta = formData.conta;
      dadosProponente.tipo_conta = formData.tipoConta;
      dadosProponente.pix = formData.pix;

      // Usar prefeitura_id e email do usuario_proponente (já estão no userProponente)
      dadosProponente.prefeitura_id = userProponente.prefeitura_id;
      dadosProponente.usuario_id = userProponente.id;
      dadosProponente.email = userProponente.email;

      const { error } = await client
        .from('proponentes')
        .insert([dadosProponente]);

      if (error) throw error;

      toast({
        title: "Proponente cadastrado!",
        description: `${nomeValido} foi cadastrado como ${tipoRegistro === "PF" ? "Pessoa Física" : "Pessoa Jurídica"} com sucesso.`,
      });
      
      setIsModalRegistroAberto(false);
      carregarProponentes();
    } catch (error: any) {
      console.error('Erro ao cadastrar proponente:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar o proponente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarEdicao = async () => {
    const nomeValido = tipoRegistro === 'PF' ? formData.nome : formData.razaoSocial;
    const enderecoValido = tipoRegistro === 'PF' ? formData.endereco : formData.enderecoSede;
    if (!nomeValido || !enderecoValido || !proponenteEditando) {
      toast({
        title: "Campos obrigatórios",
        description: tipoRegistro === 'PF' 
          ? "Preencha pelo menos nome e logradouro."
          : "Preencha pelo menos razão social e logradouro da sede.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const dadosProponente: any = {
        telefone: formData.telefone,
        cep: formData.cep,
        cidade: formData.cidade,
        estado: formData.estado,
      };

      if (tipoRegistro === "PF") {
        dadosProponente.nome = formData.nome;
        dadosProponente.nome_artistico = formData.nomeArtistico;
        dadosProponente.endereco = formData.endereco;
        dadosProponente.cpf = formData.cpf;
        dadosProponente.rg = formData.rg;
        dadosProponente.data_nascimento = formData.dataNascimento;
        dadosProponente.mini_curriculo = formData.miniCurriculo;
        dadosProponente.comunidade_tradicional = formData.comunidadeTradicional;
        dadosProponente.outra_comunidade = formData.outraComunidade;
        dadosProponente.genero = formData.genero;
        dadosProponente.raca = formData.raca;
        dadosProponente.pcd = formData.pcd === "sim" || formData.pcd === true;
        dadosProponente.tipo_deficiencia = formData.tipoDeficiencia;
        dadosProponente.outra_deficiencia = formData.outraDeficiencia;
        dadosProponente.escolaridade = formData.escolaridade;
        dadosProponente.renda_mensal = formData.rendaMensal;
        dadosProponente.programa_social = formData.programaSocial;
        dadosProponente.outro_programa_social = formData.outroProgramaSocial;
        dadosProponente.concorre_cotas = formData.concorreCotas === "sim" || formData.concorreCotas === true;
        dadosProponente.tipo_cotas = formData.tipoCotas;
        dadosProponente.funcao_artistica = formData.funcaoArtistica;
        dadosProponente.outra_funcao_artistica = formData.outraFuncaoArtistica;
        dadosProponente.representa_coletivo = formData.representaColetivo;
        dadosProponente.nome_coletivo = formData.nomeColetivo;
        dadosProponente.ano_coletivo = formData.anoColetivo;
      } else if (tipoRegistro === "PJ") {
        dadosProponente.razao_social = formData.razaoSocial;
        dadosProponente.cnpj = formData.cnpj;
        dadosProponente.endereco = formData.enderecoSede;
        dadosProponente.inscricao_estadual = formData.inscricaoEstadual;
        dadosProponente.inscricao_municipal = formData.inscricaoMunicipal;
        dadosProponente.nome_responsavel = formData.nomeResponsavel;
        dadosProponente.cpf_responsavel = formData.cpfResponsavel;
        dadosProponente.cargo_responsavel = formData.cargoResponsavel;
      }
      
      // Dados bancários (comum para ambos)
      dadosProponente.banco = formData.banco;
      dadosProponente.agencia = formData.agencia;
      dadosProponente.conta = formData.conta;
      dadosProponente.tipo_conta = formData.tipoConta;
      dadosProponente.pix = formData.pix;

      const client = getAuthenticatedClient();
      const { error } = await client
        .from('proponentes')
        .update(dadosProponente)
        .eq('id', proponenteEditando.id);

      if (error) throw error;

      toast({
        title: "Proponente atualizado!",
        description: `Os dados de ${nomeValido} foram atualizados com sucesso.`,
      });
      
      setIsModalEdicaoAberto(false);
      carregarProponentes();
    } catch (error: any) {
      console.error('Erro ao atualizar proponente:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o proponente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProponenteLayout
      title="Meus Proponentes"
      description="Gerencie seus proponentes cadastrados"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Lista de proponentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, nome artístico, email, razão social, responsável..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seção de registro de novos proponentes */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <div className="flex flex-col items-center space-y-6">
              <Plus className="h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-700">Registrar Novo Proponente</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleRegistrarPF}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Pessoa Física
                </Button>
                <Button 
                  onClick={handleRegistrarPJ}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Pessoa Jurídica
                </Button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoadingProponentes && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Lista de proponentes */}
          {!isLoadingProponentes && (
            <div className="space-y-4">
              {proponentesFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {proponentes.length === 0 
                    ? "Nenhum proponente cadastrado ainda."
                    : "Nenhum proponente encontrado com os filtros aplicados."}
                </div>
              ) : (
                proponentesFiltrados.map((proponente) => (
                  <Card key={proponente.id} className={`hover:shadow-md transition-shadow border-l-4 ${proponente.tipo === "PF" ? "border-l-blue-600" : "border-l-green-600"}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4 flex-1">
                          {/* Header com tipo */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Proponente</span>
                            <Badge 
                              variant={proponente.tipo === "PF" ? "default" : "secondary"}
                              className={`text-xs ${proponente.tipo === "PF" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}
                            >
                              {proponente.tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                            </Badge>
                          </div>
                          
                          {/* Nome principal */}
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{proponente.nome}</h3>
                            {proponente.nome_artistico && (
                              <p className="text-sm text-gray-600 italic">Nome artístico: {proponente.nome_artistico}</p>
                            )}
                            {proponente.razao_social && (
                              <p className="text-sm text-gray-600 italic">Razão Social: {proponente.razao_social}</p>
                            )}
                          </div>

                          {/* Dados de Identificação */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                            {proponente.cpf && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">CPF:</span>
                                <p className="text-sm text-gray-700">{proponente.cpf}</p>
                              </div>
                            )}
                            {proponente.cnpj && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">CNPJ:</span>
                                <p className="text-sm text-gray-700">{proponente.cnpj}</p>
                              </div>
                            )}
                            {proponente.rg && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">RG:</span>
                                <p className="text-sm text-gray-700">{proponente.rg}</p>
                              </div>
                            )}
                            {proponente.data_nascimento && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Data de Nascimento:</span>
                                <p className="text-sm text-gray-700">{formatarData(proponente.data_nascimento)}</p>
                              </div>
                            )}
                          </div>

                          {/* Contato */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                            {proponente.telefone && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Telefone:</span>
                                <p className="text-sm text-gray-700">{proponente.telefone}</p>
                              </div>
                            )}
                            {proponente.email && (
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Email:</span>
                                <p className="text-sm text-gray-700">{proponente.email}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Endereço */}
                          {proponente.endereco && (
                            <div className="pt-2 border-t">
                              <span className="text-xs text-gray-500 font-medium">Endereço</span>
                              <p className="text-sm text-gray-700">{proponente.endereco}</p>
                              {(proponente.cidade || proponente.estado || proponente.cep) && (
                                <p className="text-sm text-gray-600">
                                  {proponente.cidade && proponente.cidade}
                                  {proponente.cidade && proponente.estado && ", "}
                                  {proponente.estado && proponente.estado}
                                  {proponente.cep && ` - ${proponente.cep}`}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Dados Pessoais PF */}
                          {proponente.tipo === "PF" && (
                            <>
                              {(proponente.comunidade_tradicional || proponente.genero || proponente.raca || proponente.escolaridade || proponente.renda_mensal) && (
                                <div className="pt-2 border-t">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Dados Pessoais</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {proponente.comunidade_tradicional && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Comunidade Tradicional:</span>
                                        <p className="text-sm text-gray-700">{traduzirComunidade(proponente.comunidade_tradicional)}</p>
                                      </div>
                                    )}
                                    {proponente.genero && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Gênero:</span>
                                        <p className="text-sm text-gray-700">{traduzirGenero(proponente.genero)}</p>
                                      </div>
                                    )}
                                    {proponente.raca && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Raça/Cor:</span>
                                        <p className="text-sm text-gray-700">{traduzirRaca(proponente.raca)}</p>
                                      </div>
                                    )}
                                    {proponente.escolaridade && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Escolaridade:</span>
                                        <p className="text-sm text-gray-700">{traduzirEscolaridade(proponente.escolaridade)}</p>
                                      </div>
                                    )}
                                    {proponente.renda_mensal && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Renda Mensal:</span>
                                        <p className="text-sm text-gray-700">{traduzirRenda(proponente.renda_mensal)}</p>
                                      </div>
                                    )}
                                    {proponente.pcd && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">PCD:</span>
                                        <p className="text-sm text-gray-700">Sim{proponente.tipo_deficiencia && ` - ${traduzirDeficiencia(proponente.tipo_deficiencia)}`}</p>
                                      </div>
                                    )}
                                    {proponente.programa_social && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Programa Social:</span>
                                        <p className="text-sm text-gray-700">{traduzirProgramaSocial(proponente.programa_social)}</p>
                                      </div>
                                    )}
                                    {proponente.concorre_cotas && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Concorre Cotas:</span>
                                        <p className="text-sm text-gray-700">Sim{proponente.tipo_cotas && ` - ${traduzirCotas(proponente.tipo_cotas)}`}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Atividade Artística */}
                              {(proponente.funcao_artistica || proponente.representa_coletivo) && (
                                <div className="pt-2 border-t">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Atividade Artística</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {proponente.funcao_artistica && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Função:</span>
                                        <p className="text-sm text-gray-700">{traduzirFuncaoArtistica(proponente.funcao_artistica)}</p>
                                      </div>
                                    )}
                                    {proponente.representa_coletivo && proponente.nome_coletivo && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Coletivo:</span>
                                        <p className="text-sm text-gray-700">{proponente.nome_coletivo}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Currículo */}
                              {proponente.mini_curriculo && (
                                <div className="pt-2 border-t">
                                  <span className="text-xs text-gray-500 font-medium">Mini Currículo:</span>
                                  <p className="text-sm text-gray-700 mt-1 line-clamp-3">{proponente.mini_curriculo}</p>
                                </div>
                              )}
                            </>
                          )}

                          {/* Dados PJ */}
                          {proponente.tipo === "PJ" && (
                            <>
                              {(proponente.inscricao_estadual || proponente.inscricao_municipal) && (
                                <div className="pt-2 border-t">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Inscrições</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {proponente.inscricao_estadual && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Inscrição Estadual:</span>
                                        <p className="text-sm text-gray-700">{proponente.inscricao_estadual}</p>
                                      </div>
                                    )}
                                    {proponente.inscricao_municipal && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Inscrição Municipal:</span>
                                        <p className="text-sm text-gray-700">{proponente.inscricao_municipal}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Responsável Legal */}
                              {(proponente.nome_responsavel || proponente.cpf_responsavel || proponente.cargo_responsavel) && (
                                <div className="pt-2 border-t">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Responsável Legal</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {proponente.nome_responsavel && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Nome:</span>
                                        <p className="text-sm text-gray-700">{proponente.nome_responsavel}</p>
                                      </div>
                                    )}
                                    {proponente.cpf_responsavel && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">CPF:</span>
                                        <p className="text-sm text-gray-700">{proponente.cpf_responsavel}</p>
                                      </div>
                                    )}
                                    {proponente.cargo_responsavel && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Cargo:</span>
                                        <p className="text-sm text-gray-700">{proponente.cargo_responsavel}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Dados Bancários */}
                          {(proponente.banco || proponente.agencia || proponente.conta || proponente.pix) && (
                            <div className="pt-2 border-t">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Dados Bancários</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {proponente.banco && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">Banco:</span>
                                    <p className="text-sm text-gray-700">{proponente.banco}</p>
                                  </div>
                                )}
                                {proponente.agencia && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">Agência:</span>
                                    <p className="text-sm text-gray-700">{proponente.agencia}</p>
                                  </div>
                                )}
                                {proponente.conta && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">Conta:</span>
                                    <p className="text-sm text-gray-700">{proponente.conta} {proponente.tipo_conta && `(${proponente.tipo_conta})`}</p>
                                  </div>
                                )}
                                {proponente.pix && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">PIX:</span>
                                    <p className="text-sm text-gray-700">{proponente.pix}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditarProponente(proponente)}
                          className="ml-4 flex-shrink-0"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Registro */}
      <Dialog open={isModalRegistroAberto} onOpenChange={setIsModalRegistroAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Registrar {tipoRegistro === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
            </DialogTitle>
          </DialogHeader>
          
          {/* Indicador de Progresso */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {Array.from({ length: tipoRegistro === "PF" ? totalStepsPF : totalStepsPJ }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <button
                    onClick={() => goToStep(step)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      step === currentStep
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : step < currentStep
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                    disabled={step > currentStep}
                  >
                    {step < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </button>
                  {step < (tipoRegistro === "PF" ? totalStepsPF : totalStepsPJ) && (
                    <div className={`h-1 flex-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Renderização condicional de steps para PF */}
            {tipoRegistro === "PF" && (
              <>
                {currentStep === 1 && <DadosBasicosPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 2 && <EnderecoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 3 && <DadosPessoaisPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 4 && <PCDPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 5 && <FormacaoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 6 && <ProgramasSociaisPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 7 && <CotasPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 8 && <ArtisticoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 9 && <ColetivoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 10 && <ExperienciaPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 11 && <BancarioPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
              </>
            )}

            {/* Renderização condicional de steps para PJ */}
            {tipoRegistro === "PJ" && (
              <>
                {currentStep === 1 && <DadosEmpresaPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
                {currentStep === 2 && <EnderecoPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
                {currentStep === 3 && <InscricoesPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
                {currentStep === 4 && <ResponsavelPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
                {currentStep === 5 && <BancarioPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
              </>
            )}

            {/* Código antigo comentado - remover após verificar que está funcionando */}
            {false && tipoRegistro === "PJ" && (
              <>
                {/* Dados do Agente Cultural */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">1. DADOS DO AGENTE CULTURAL</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-razao">Razão Social *</Label>
                      <Input
                        id="reg-razao"
                        value={formData.razaoSocial}
                        onChange={(e) => handleInputChange("razaoSocial", e.target.value)}
                        placeholder="Razão social da empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-nome-fantasia">Nome fantasia</Label>
                      <Input
                        id="reg-nome-fantasia"
                        value={formData.nomeFantasia}
                        onChange={(e) => handleInputChange("nomeFantasia", e.target.value)}
                        placeholder="Nome fantasia"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-cnpj">CNPJ</Label>
                    <Input
                      id="reg-cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange("cnpj", e.target.value)}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reg-cep-sede">CEP</Label>
                    <Input
                      id="reg-cep-sede"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reg-endereco-sede">Logradouro *</Label>
                    <Input
                      id="reg-endereco-sede"
                      value={formData.enderecoSede}
                      onChange={(e) => handleInputChange("enderecoSede", e.target.value)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-numero-sede">Número</Label>
                      <Input
                        id="reg-numero-sede"
                        value={formData.numeroSede}
                        onChange={(e) => handleInputChange("numeroSede", e.target.value)}
                        placeholder="Número"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-complemento-sede">Complemento</Label>
                      <Input
                        id="reg-complemento-sede"
                        value={formData.complementoSede}
                        onChange={(e) => handleInputChange("complementoSede", e.target.value)}
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-cidade">Cidade</Label>
                      <Input
                        id="reg-cidade"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange("cidade", e.target.value)}
                        placeholder="Cidade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-estado">Estado</Label>
                      <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_BRASILEIROS.map((estado) => (
                            <SelectItem key={estado.sigla} value={estado.sigla}>
                              {estado.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Dados Adicionais PJ */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">2. DADOS ADICIONAIS</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-inscricao-estadual">Inscrição Estadual</Label>
                      <Input
                        id="reg-inscricao-estadual"
                        value={formData.inscricaoEstadual}
                        onChange={(e) => handleInputChange("inscricaoEstadual", e.target.value)}
                        placeholder="Inscrição estadual"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-inscricao-municipal">Inscrição Municipal</Label>
                      <Input
                        id="reg-inscricao-municipal"
                        value={formData.inscricaoMunicipal}
                        onChange={(e) => handleInputChange("inscricaoMunicipal", e.target.value)}
                        placeholder="Inscrição municipal"
                      />
                    </div>
                  </div>
                </div>

                {/* Responsável Legal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">3. RESPONSÁVEL LEGAL</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-nome-responsavel">Nome do Responsável</Label>
                      <Input
                        id="reg-nome-responsavel"
                        value={formData.nomeResponsavel}
                        onChange={(e) => handleInputChange("nomeResponsavel", e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-cpf-responsavel">CPF do Responsável</Label>
                      <Input
                        id="reg-cpf-responsavel"
                        value={formData.cpfResponsavel}
                        onChange={(e) => handleInputChange("cpfResponsavel", e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-cargo-responsavel">Cargo</Label>
                    <Input
                      id="reg-cargo-responsavel"
                      value={formData.cargoResponsavel}
                      onChange={(e) => handleInputChange("cargoResponsavel", e.target.value)}
                      placeholder="Cargo exercido"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Dados Bancários - Agora fazem parte dos steps (PF step 11, PJ step 5) */}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalRegistroAberto(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isLoading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            )}
            
            {currentStep < (tipoRegistro === "PF" ? totalStepsPF : totalStepsPJ) ? (
              <Button
                onClick={nextStep}
                disabled={isLoading}
              >
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSalvarRegistro}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Proponente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isModalEdicaoAberto} onOpenChange={setIsModalEdicaoAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar {proponenteEditando?.tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"} - {proponenteEditando?.nome}
            </DialogTitle>
          </DialogHeader>
          
          {/* Indicador de Progresso */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {Array.from({ length: tipoRegistro === "PF" ? totalStepsPF : totalStepsPJ }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <button
                    onClick={() => goToStep(step)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      step === currentStep
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : step < currentStep
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                    disabled={step > currentStep}
                  >
                    {step < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </button>
                  {step < (tipoRegistro === "PF" ? totalStepsPF : totalStepsPJ) && (
                    <div className={`h-1 flex-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Renderização condicional de steps para PF */}
            {tipoRegistro === "PF" && (
              <>
                {currentStep === 1 && <DadosBasicosPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 2 && <EnderecoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 3 && <DadosPessoaisPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 4 && <PCDPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 5 && <FormacaoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 6 && <ProgramasSociaisPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 7 && <CotasPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 8 && <ArtisticoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 9 && <ColetivoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 10 && <ExperienciaPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
                {currentStep === 11 && <BancarioPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={currentStep} />}
              </>
            )}

            {/* Renderização condicional de steps para PJ */}
            {tipoRegistro === "PJ" && (
              <>
                {currentStep === 1 && <DadosEmpresaPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
                {currentStep === 2 && <EnderecoPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
                {currentStep === 3 && <InscricoesPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
                {currentStep === 4 && <ResponsavelPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
                {currentStep === 5 && <BancarioPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={currentStep} />}
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalEdicaoAberto(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isLoading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            )}
            
            {currentStep < (tipoRegistro === "PF" ? totalStepsPF : totalStepsPJ) ? (
              <Button
                onClick={nextStep}
                disabled={isLoading}
              >
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSalvarEdicao}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProponenteLayout>
  );
};

