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
import { Plus, Edit, Loader2, Search, User, UserCircle, Users } from "lucide-react";
import { getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import {
  DadosBasicosPF, EnderecoPF, DadosPessoaisPF, PCDPF, FormacaoPF,
  ProgramasSociaisPF, CotasPF, ArtisticoPF, ColetivoPF, ExperienciaPF, BancarioPF,
  DadosEmpresaPJ, EnderecoPJ, InscricoesPJ, ResponsavelPJ, BancarioPJ,
  DadosBasicosColetivo, RepresentanteColetivo, EnderecoColetivo, MembrosColetivo, BancarioColetivo
} from "@/components/proponente/StepForms";

interface Proponente {
  id: string;
  nome: string;
  tipo: 'PF' | 'PJ' | 'COLETIVO';
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
  const [tipoRegistro, setTipoRegistro] = useState<"PF" | "PJ" | "COLETIVO" | "">("");
  const [proponenteEditando, setProponenteEditando] = useState<Proponente | null>(null);
  
  // Estados de filtro
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "PF" | "PJ" | "COLETIVO">("todos");
  
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

    // Dados Coletivo
    nomeGrupo: "",
    anoCriacao: "",
    nomeRepresentanteColetivo: "",
    cpfRepresentanteColetivo: "",
    telefoneRepresentanteColetivo: "",
    emailRepresentanteColetivo: "",
    
    // Dados PJ
    cnpj: "",
    razaoSocial: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    nomeResponsavel: "",
    cpfResponsavel: "",
    rgResponsavel: "",
    dataNascimentoResponsavel: "",
    telefoneResponsavel: "",
    emailResponsavel: "",
    cargoResponsavel: "",
    cepResponsavel: "",
    enderecoResponsavel: "",
    numeroResponsavel: "",
    complementoResponsavel: "",
    cidadeResponsavel: "",
    estadoResponsavel: "",
    comunidadeTradicionalResponsavel: "",
    outraComunidadeResponsavel: "",
    generoResponsavel: "",
    racaResponsavel: "",
    pcdResponsavel: "",
    tipoDeficienciaResponsavel: "",
    outraDeficienciaResponsavel: "",
    escolaridadeResponsavel: "",
    rendaMensalResponsavel: "",
    programaSocialResponsavel: "",
    outroProgramaSocialResponsavel: "",
    concorreCotasResponsavel: "",
    tipoCotasResponsavel: "",
    funcaoArtisticaResponsavel: "",
    outraFuncaoArtisticaResponsavel: "",
    profissaoResponsavel: "",
    miniCurriculoResponsavel: "",
    enderecoSede: "",
    numeroSede: "",
    complementoSede: "",
    
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
      const client = getAuthenticatedSupabaseClient('proponente');
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
      cnpj: "", razaoSocial: "", nomeFantasia: "", inscricaoEstadual: "", inscricaoMunicipal: "",
      nomeResponsavel: "", cpfResponsavel: "", rgResponsavel: "", dataNascimentoResponsavel: "",
      telefoneResponsavel: "", emailResponsavel: "", cargoResponsavel: "",
      cepResponsavel: "", enderecoResponsavel: "", numeroResponsavel: "", complementoResponsavel: "",
      cidadeResponsavel: "", estadoResponsavel: "",
      comunidadeTradicionalResponsavel: "", outraComunidadeResponsavel: "",
      generoResponsavel: "", racaResponsavel: "",
      pcdResponsavel: "", tipoDeficienciaResponsavel: "", outraDeficienciaResponsavel: "",
      escolaridadeResponsavel: "", rendaMensalResponsavel: "",
      programaSocialResponsavel: "", outroProgramaSocialResponsavel: "",
      concorreCotasResponsavel: "", tipoCotasResponsavel: "",
      funcaoArtisticaResponsavel: "", outraFuncaoArtisticaResponsavel: "",
      profissaoResponsavel: "", miniCurriculoResponsavel: "",
      enderecoSede: "", numeroSede: "", complementoSede: "",
      banco: "", agencia: "", conta: "", tipoConta: "", pix: "",
    });
    setIsModalRegistroAberto(true);
  };

  const handleRegistrarPJ = () => {
    setTipoRegistro("PJ");
    setProponenteEditando(null);
    const initialData = {
      nome: "", nomeArtistico: "", telefone: "", cep: "", endereco: "", numero: "", complemento: "", cidade: "", estado: "",
      cpf: "", rg: "", dataNascimento: "", miniCurriculo: "",
      comunidadeTradicional: "", outraComunidade: "",
      genero: "", raca: "", pcd: "nao", tipoDeficiencia: "", outraDeficiencia: "",
      escolaridade: "", rendaMensal: "",
      programaSocial: "", outroProgramaSocial: "",
      concorreCotas: "nao", tipoCotas: "",
      funcaoArtistica: "", outraFuncaoArtistica: "",
      representaColetivo: false, nomeColetivo: "", anoColetivo: "", quantidadePessoas: "", membrosColetivo: "", profissao: "",
      cnpj: "", razaoSocial: "", nomeFantasia: "", inscricaoEstadual: "", inscricaoMunicipal: "",
      nomeResponsavel: "", cpfResponsavel: "", rgResponsavel: "", dataNascimentoResponsavel: "",
      telefoneResponsavel: "", emailResponsavel: "", cargoResponsavel: "",
      cepResponsavel: "", enderecoResponsavel: "", numeroResponsavel: "", complementoResponsavel: "",
      cidadeResponsavel: "", estadoResponsavel: "",
      comunidadeTradicionalResponsavel: "", outraComunidadeResponsavel: "",
      generoResponsavel: "", racaResponsavel: "",
      pcdResponsavel: "nao", tipoDeficienciaResponsavel: "", outraDeficienciaResponsavel: "",
      escolaridadeResponsavel: "", rendaMensalResponsavel: "",
      programaSocialResponsavel: "", outroProgramaSocialResponsavel: "",
      concorreCotasResponsavel: "nao", tipoCotasResponsavel: "",
      funcaoArtisticaResponsavel: "", outraFuncaoArtisticaResponsavel: "",
      profissaoResponsavel: "", miniCurriculoResponsavel: "",
      enderecoSede: "", numeroSede: "", complementoSede: "",
      banco: "", agencia: "", conta: "", tipoConta: "", pix: "",
      nomeGrupo: "", anoCriacao: "",
    };
    setFormData(initialData);
    setIsModalRegistroAberto(true);
  };

  const handleRegistrarColetivo = () => {
    setTipoRegistro("COLETIVO");
    setProponenteEditando(null);
    setFormData({
      nome: "", nomeArtistico: "", telefone: "", cep: "", endereco: "", numero: "", complemento: "", cidade: "", estado: "",
      cpf: "", rg: "", dataNascimento: "", miniCurriculo: "",
      comunidadeTradicional: "", outraComunidade: "",
      genero: "", raca: "", pcd: "nao", tipoDeficiencia: "", outraDeficiencia: "",
      escolaridade: "", rendaMensal: "",
      programaSocial: "", outroProgramaSocial: "",
      concorreCotas: "nao", tipoCotas: "",
      funcaoArtistica: "", outraFuncaoArtistica: "",
      representaColetivo: false, nomeColetivo: "", anoColetivo: "", quantidadePessoas: "", membrosColetivo: "", profissao: "",
      cnpj: "", razaoSocial: "", nomeFantasia: "", inscricaoEstadual: "", inscricaoMunicipal: "",
      nomeResponsavel: "", cpfResponsavel: "", rgResponsavel: "", dataNascimentoResponsavel: "",
      telefoneResponsavel: "", emailResponsavel: "", cargoResponsavel: "",
      cepResponsavel: "", enderecoResponsavel: "", numeroResponsavel: "", complementoResponsavel: "",
      cidadeResponsavel: "", estadoResponsavel: "",
      comunidadeTradicionalResponsavel: "", outraComunidadeResponsavel: "",
      generoResponsavel: "", racaResponsavel: "",
      pcdResponsavel: "nao", tipoDeficienciaResponsavel: "", outraDeficienciaResponsavel: "",
      escolaridadeResponsavel: "", rendaMensalResponsavel: "",
      programaSocialResponsavel: "", outroProgramaSocialResponsavel: "",
      concorreCotasResponsavel: "nao", tipoCotasResponsavel: "",
      funcaoArtisticaResponsavel: "", outraFuncaoArtisticaResponsavel: "",
      profissaoResponsavel: "", miniCurriculoResponsavel: "",
      enderecoSede: "", numeroSede: "", complementoSede: "",
      banco: "", agencia: "", conta: "", tipoConta: "", pix: "",
      nomeGrupo: "", anoCriacao: "",
    });
    setIsModalRegistroAberto(true);
  };

  // Função para editar proponente
  const handleEditarProponente = (proponente: Proponente) => {
    setProponenteEditando(proponente);
    setTipoRegistro(proponente.tipo === "PF" ? "PF" : proponente.tipo === "PJ" ? "PJ" : "COLETIVO");
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
      profissao: proponente.profissao || "",
      cnpj: proponente.cnpj || "",
      razaoSocial: proponente.razao_social || "",
      nomeFantasia: proponente.tipo === "PJ" ? (proponente.nome || "") : "", // Para PJ, nome contém o nome fantasia
      inscricaoEstadual: proponente.inscricao_estadual || "",
      inscricaoMunicipal: proponente.inscricao_municipal || "",
      nomeResponsavel: proponente.nome_responsavel || "",
      cpfResponsavel: proponente.cpf_responsavel || "",
      rgResponsavel: (proponente as any).rg_responsavel || "",
      dataNascimentoResponsavel: (proponente as any).data_nascimento_responsavel || "",
      telefoneResponsavel: (proponente as any).telefone_responsavel || "",
      emailResponsavel: (proponente as any).email_responsavel || "",
      cargoResponsavel: proponente.cargo_responsavel || "",
      cepResponsavel: (proponente as any).cep_responsavel || "",
      enderecoResponsavel: (proponente as any).endereco_responsavel || "",
      numeroResponsavel: (proponente as any).numero_responsavel || "",
      complementoResponsavel: (proponente as any).complemento_responsavel || "",
      cidadeResponsavel: (proponente as any).cidade_responsavel || "",
      estadoResponsavel: (proponente as any).estado_responsavel || "",
      comunidadeTradicionalResponsavel: (proponente as any).comunidade_tradicional_responsavel || "",
      outraComunidadeResponsavel: (proponente as any).outra_comunidade_responsavel || "",
      generoResponsavel: (proponente as any).genero_responsavel || "",
      racaResponsavel: (proponente as any).raca_responsavel || "",
      pcdResponsavel: (proponente as any).pcd_responsavel ? "sim" : "nao",
      tipoDeficienciaResponsavel: (proponente as any).tipo_deficiencia_responsavel || "",
      outraDeficienciaResponsavel: (proponente as any).outra_deficiencia_responsavel || "",
      escolaridadeResponsavel: (proponente as any).escolaridade_responsavel || "",
      rendaMensalResponsavel: (proponente as any).renda_mensal_responsavel || "",
      programaSocialResponsavel: (proponente as any).programa_social_responsavel || "",
      outroProgramaSocialResponsavel: (proponente as any).outro_programa_social_responsavel || "",
      concorreCotasResponsavel: (proponente as any).concorre_cotas_responsavel ? "sim" : "nao",
      tipoCotasResponsavel: (proponente as any).tipo_cotas_responsavel || "",
      funcaoArtisticaResponsavel: (proponente as any).funcao_artistica_responsavel || "",
      outraFuncaoArtisticaResponsavel: (proponente as any).outra_funcao_artistica_responsavel || "",
      profissaoResponsavel: (proponente as any).profissao_responsavel || "",
      miniCurriculoResponsavel: (proponente as any).mini_curriculo_responsavel || "",
      enderecoSede: proponente.endereco || "",
      numeroSede: (proponente as any).numero || "",
      complementoSede: (proponente as any).complemento || "",
      banco: proponente.banco || "",
      agencia: proponente.agencia || "",
      conta: proponente.conta || "",
      tipoConta: proponente.tipo_conta || "",
      pix: proponente.pix || "",
      nomeGrupo: proponente.nome_grupo || "",
      anoCriacao: proponente.ano_criacao?.toString() || "",
      quantidadePessoas: proponente.quantidade_pessoas?.toString() || "",
      membrosColetivo: proponente.membros_coletivo || "",
      nomeRepresentanteColetivo: proponente.nome_responsavel || "",
      cpfRepresentanteColetivo: proponente.cpf_responsavel || "",
      telefoneRepresentanteColetivo: (proponente as any).telefone_responsavel || "",
      emailRepresentanteColetivo: (proponente as any).email_responsavel || "",
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

  // Função de validação do step atual
  // Reset modal
  const resetModal = () => {
    setIsModalRegistroAberto(false);
  };

  // Função para buscar CEP via ViaCEP
  const buscarCEP = async (cep: string, tipoEndereco: 'PF' | 'PJ' | 'RESPONSAVEL' = 'PF') => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          if (tipoEndereco === 'PF' || tipoEndereco === ('COLETIVO' as any)) {
            setFormData((prev: any) => ({
              ...prev,
              endereco: data.logradouro || prev.endereco,
              cidade: data.localidade || prev.cidade,
              estado: data.uf || prev.estado,
              cep: cep,
            }));
          } else if (tipoEndereco === 'PJ') {
            setFormData((prev: any) => ({
              ...prev,
              enderecoSede: data.logradouro || prev.enderecoSede,
              cidade: data.localidade || prev.cidade,
              estado: data.uf || prev.estado,
              cep: cep,
            }));
          } else if (tipoEndereco === 'RESPONSAVEL') {
            setFormData((prev: any) => ({
              ...prev,
              enderecoResponsavel: data.logradouro || prev.enderecoResponsavel,
              cidadeResponsavel: data.localidade || prev.cidadeResponsavel,
              estadoResponsavel: data.uf || prev.estadoResponsavel,
              cepResponsavel: cep,
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
    } else if (field === 'rg' || field === 'rgResponsavel') {
      valorFormatado = aplicarMascaraRG(value);
    } else if (field === 'telefone' || field === 'telefoneRepresentante' || field === 'telefoneResponsavel') {
      valorFormatado = aplicarMascaraTelefone(value);
    } else if (field === 'cep' || field === 'cepResponsavel') {
      valorFormatado = aplicarMascaraCEP(value);
    }
    
    setFormData((prev: any) => ({ ...prev, [field]: valorFormatado }));
    
    // Buscar CEP automaticamente - precisamos saber se é PF, PJ ou Responsável
    if (field === 'cep' && valorFormatado.length === 9) {
      buscarCEP(valorFormatado, tipoRegistro as any);
    } else if (field === 'cepResponsavel' && valorFormatado.length === 9) {
      buscarCEP(valorFormatado, 'RESPONSAVEL');
    }
  };

  // Função de validação de campos obrigatórios
  const validarCamposObrigatorios = (): { valido: boolean; mensagem?: string } => {
    if (tipoRegistro === 'PF') {
      // Validação PF
      if (!formData.nome?.trim()) return { valido: false, mensagem: "Nome completo é obrigatório" };
      if (!formData.cpf?.trim()) return { valido: false, mensagem: "CPF é obrigatório" };
      if (!formData.rg?.trim()) return { valido: false, mensagem: "RG é obrigatório" };
      if (!formData.dataNascimento) return { valido: false, mensagem: "Data de nascimento é obrigatória" };
      if (!formData.telefone?.trim()) return { valido: false, mensagem: "Telefone é obrigatório" };
      if (!formData.cep?.trim()) return { valido: false, mensagem: "CEP é obrigatório" };
      if (!formData.endereco?.trim()) return { valido: false, mensagem: "Logradouro é obrigatório" };
      if (!formData.numero?.trim()) return { valido: false, mensagem: "Número é obrigatório" };
      if (!formData.cidade?.trim()) return { valido: false, mensagem: "Cidade é obrigatória" };
      if (!formData.estado) return { valido: false, mensagem: "Estado é obrigatório" };
      if (!formData.comunidadeTradicional) return { valido: false, mensagem: "Comunidade tradicional é obrigatória" };
      if (formData.comunidadeTradicional === "outra" && !formData.outraComunidade?.trim()) {
        return { valido: false, mensagem: "Especifique qual comunidade tradicional" };
      }
      if (!formData.genero) return { valido: false, mensagem: "Identidade de gênero é obrigatória" };
      if (!formData.raca) return { valido: false, mensagem: "Raça, cor ou etnia é obrigatória" };
      if (formData.pcd === undefined || formData.pcd === null || formData.pcd === "") {
        return { valido: false, mensagem: "Informação sobre PCD é obrigatória" };
      }
      if (formData.pcd === "sim" && !formData.tipoDeficiencia) {
        return { valido: false, mensagem: "Tipo de deficiência é obrigatório quando PCD é sim" };
      }
      if (formData.pcd === "sim" && formData.tipoDeficiencia === "outro" && !formData.outraDeficiencia?.trim()) {
        return { valido: false, mensagem: "Especifique qual tipo de deficiência" };
      }
      if (!formData.escolaridade) return { valido: false, mensagem: "Escolaridade é obrigatória" };
      if (!formData.rendaMensal) return { valido: false, mensagem: "Renda mensal é obrigatória" };
      if (!formData.programaSocial) return { valido: false, mensagem: "Programa social é obrigatório" };
      if (formData.programaSocial === "outro" && !formData.outroProgramaSocial?.trim()) {
        return { valido: false, mensagem: "Especifique qual programa social" };
      }
      if (formData.concorreCotas === undefined || formData.concorreCotas === null || formData.concorreCotas === "") {
        return { valido: false, mensagem: "Informação sobre cotas é obrigatória" };
      }
      if (formData.concorreCotas === "sim" && !formData.tipoCotas) {
        return { valido: false, mensagem: "Tipo de cotas é obrigatório quando concorre a cotas" };
      }
      if (!formData.funcaoArtistica) return { valido: false, mensagem: "Função artística é obrigatória" };
      if (formData.funcaoArtistica === "outro" && !formData.outraFuncaoArtistica?.trim()) {
        return { valido: false, mensagem: "Especifique qual função artística" };
      }
      if (!formData.profissao?.trim()) return { valido: false, mensagem: "Profissão é obrigatória" };
      if (!formData.miniCurriculo?.trim()) return { valido: false, mensagem: "Mini currículo é obrigatório" };
      if (!formData.banco?.trim()) return { valido: false, mensagem: "Banco é obrigatório" };
      if (!formData.agencia?.trim()) return { valido: false, mensagem: "Agência é obrigatória" };
      if (!formData.conta?.trim()) return { valido: false, mensagem: "Conta é obrigatória" };
      if (!formData.tipoConta) return { valido: false, mensagem: "Tipo de conta é obrigatório" };
      if (!formData.pix?.trim()) return { valido: false, mensagem: "Chave PIX é obrigatória" };
    } else if (tipoRegistro === 'PJ') {
      // Validação PJ
      if (!formData.razaoSocial?.trim()) return { valido: false, mensagem: "Razão social é obrigatória" };
      if (!formData.nomeFantasia?.trim()) return { valido: false, mensagem: "Nome fantasia é obrigatório" };
      if (!formData.cnpj?.trim()) return { valido: false, mensagem: "CNPJ é obrigatório" };
      if (!formData.cep?.trim()) return { valido: false, mensagem: "CEP é obrigatório" };
      if (!formData.enderecoSede?.trim()) return { valido: false, mensagem: "Logradouro da sede é obrigatório" };
      if (!formData.numeroSede?.trim()) return { valido: false, mensagem: "Número da sede é obrigatório" };
      if (!formData.cidade?.trim()) return { valido: false, mensagem: "Cidade é obrigatória" };
      if (!formData.estado) return { valido: false, mensagem: "Estado é obrigatório" };
      
      // Validação do representante legal (todos os campos de PF)
      if (!formData.nomeResponsavel?.trim()) return { valido: false, mensagem: "Nome completo do responsável é obrigatório" };
      if (!formData.cpfResponsavel?.trim()) return { valido: false, mensagem: "CPF do responsável é obrigatório" };
      if (!formData.rgResponsavel?.trim()) return { valido: false, mensagem: "RG do responsável é obrigatório" };
      if (!formData.dataNascimentoResponsavel) return { valido: false, mensagem: "Data de nascimento do responsável é obrigatória" };
      if (!formData.telefoneResponsavel?.trim()) return { valido: false, mensagem: "Telefone do responsável é obrigatório" };
      if (!formData.emailResponsavel?.trim()) return { valido: false, mensagem: "Email do responsável é obrigatório" };
      if (!formData.cargoResponsavel?.trim()) return { valido: false, mensagem: "Cargo do responsável é obrigatório" };
      if (!formData.cepResponsavel?.trim()) return { valido: false, mensagem: "CEP do responsável é obrigatório" };
      if (!formData.enderecoResponsavel?.trim()) return { valido: false, mensagem: "Logradouro do responsável é obrigatório" };
      if (!formData.numeroResponsavel?.trim()) return { valido: false, mensagem: "Número do endereço do responsável é obrigatório" };
      if (!formData.cidadeResponsavel?.trim()) return { valido: false, mensagem: "Cidade do responsável é obrigatória" };
      if (!formData.estadoResponsavel) return { valido: false, mensagem: "Estado do responsável é obrigatório" };
      if (!formData.comunidadeTradicionalResponsavel) return { valido: false, mensagem: "Comunidade tradicional do responsável é obrigatória" };
      if (formData.comunidadeTradicionalResponsavel === "outra" && !formData.outraComunidadeResponsavel?.trim()) {
        return { valido: false, mensagem: "Especifique qual comunidade tradicional do responsável" };
      }
      if (!formData.generoResponsavel) return { valido: false, mensagem: "Identidade de gênero do responsável é obrigatória" };
      if (!formData.racaResponsavel) return { valido: false, mensagem: "Raça, cor ou etnia do responsável é obrigatória" };
      if (formData.pcdResponsavel === undefined || formData.pcdResponsavel === null || formData.pcdResponsavel === "") {
        return { valido: false, mensagem: "Informação sobre PCD do responsável é obrigatória" };
      }
      if (formData.pcdResponsavel === "sim" && !formData.tipoDeficienciaResponsavel) {
        return { valido: false, mensagem: "Tipo de deficiência do responsável é obrigatório quando PCD é sim" };
      }
      if (formData.pcdResponsavel === "sim" && formData.tipoDeficienciaResponsavel === "outro" && !formData.outraDeficienciaResponsavel?.trim()) {
        return { valido: false, mensagem: "Especifique qual tipo de deficiência do responsável" };
      }
      if (!formData.escolaridadeResponsavel) return { valido: false, mensagem: "Escolaridade do responsável é obrigatória" };
      if (!formData.rendaMensalResponsavel) return { valido: false, mensagem: "Renda mensal do responsável é obrigatória" };
      if (!formData.programaSocialResponsavel) return { valido: false, mensagem: "Programa social do responsável é obrigatório" };
      if (formData.programaSocialResponsavel === "outro" && !formData.outroProgramaSocialResponsavel?.trim()) {
        return { valido: false, mensagem: "Especifique qual programa social do responsável" };
      }
      if (formData.concorreCotasResponsavel === undefined || formData.concorreCotasResponsavel === null || formData.concorreCotasResponsavel === "") {
        return { valido: false, mensagem: "Informação sobre cotas do responsável é obrigatória" };
      }
      if (formData.concorreCotasResponsavel === "sim" && !formData.tipoCotasResponsavel) {
        return { valido: false, mensagem: "Tipo de cotas do responsável é obrigatório quando concorre a cotas" };
      }
      if (!formData.funcaoArtisticaResponsavel) return { valido: false, mensagem: "Função artística do responsável é obrigatória" };
      if (formData.funcaoArtisticaResponsavel === "outro" && !formData.outraFuncaoArtisticaResponsavel?.trim()) {
        return { valido: false, mensagem: "Especifique qual função artística do responsável" };
      }
      if (!formData.profissaoResponsavel?.trim()) return { valido: false, mensagem: "Profissão do responsável é obrigatória" };
      if (!formData.miniCurriculoResponsavel?.trim()) return { valido: false, mensagem: "Mini currículo do responsável é obrigatório" };
      if (!formData.banco?.trim()) return { valido: false, mensagem: "Banco é obrigatório" };
      if (!formData.agencia?.trim()) return { valido: false, mensagem: "Agência é obrigatória" };
      if (!formData.conta?.trim()) return { valido: false, mensagem: "Conta é obrigatória" };
      if (!formData.tipoConta) return { valido: false, mensagem: "Tipo de conta é obrigatório" };
      if (!formData.pix?.trim()) return { valido: false, mensagem: "Chave PIX é obrigatória" };
    } else if (tipoRegistro === 'COLETIVO') {
      // Validação Coletivo
      if (!formData.nomeGrupo?.trim()) return { valido: false, mensagem: "Nome do grupo é obrigatório" };
      if (!formData.anoCriacao?.trim()) return { valido: false, mensagem: "Ano de criação/fundação é obrigatório" };
      if (!formData.quantidadePessoas?.trim() && !formData.quantidadePessoas) return { valido: false, mensagem: "Quantidade de pessoas é obrigatória" };
      if (!formData.nomeRepresentanteColetivo?.trim()) return { valido: false, mensagem: "Nome do representante é obrigatório" };
      if (!formData.cpfRepresentanteColetivo?.trim()) return { valido: false, mensagem: "CPF do representante é obrigatório" };
      if (!formData.telefoneRepresentanteColetivo?.trim()) return { valido: false, mensagem: "Telefone do representante é obrigatório" };
      if (!formData.emailRepresentanteColetivo?.trim()) return { valido: false, mensagem: "Email do representante é obrigatório" };
      if (!formData.cep?.trim()) return { valido: false, mensagem: "CEP é obrigatório" };
      if (!formData.endereco?.trim()) return { valido: false, mensagem: "Endereço é obrigatório" };
      if (!formData.numero?.trim()) return { valido: false, mensagem: "Número é obrigatório" };
      if (!formData.cidade?.trim()) return { valido: false, mensagem: "Cidade é obrigatória" };
      if (!formData.estado) return { valido: false, mensagem: "Estado é obrigatório" };
      if (!formData.membrosColetivo?.trim()) return { valido: false, mensagem: "Lista de membros é obrigatória" };
      if (!formData.banco?.trim()) return { valido: false, mensagem: "Banco é obrigatório" };
      if (!formData.agencia?.trim()) return { valido: false, mensagem: "Agência é obrigatória" };
      if (!formData.conta?.trim()) return { valido: false, mensagem: "Conta é obrigatória" };
      if (!formData.tipoConta) return { valido: false, mensagem: "Tipo de conta é obrigatório" };
      if (!formData.pix?.trim()) return { valido: false, mensagem: "Chave PIX é obrigatória" };
    }
    
    return { valido: true };
  };

  const handleSalvarRegistro = async () => {
    const validacao = validarCamposObrigatorios();
    if (!validacao.valido) {
      toast({
        title: "Campos obrigatórios",
        description: validacao.mensagem,
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
        dadosProponente.quantidade_pessoas = formData.quantidadePessoas ? parseInt(formData.quantidadePessoas) : null;
        dadosProponente.membros_coletivo = formData.membrosColetivo;
        dadosProponente.profissao = formData.profissao;
      } else if (tipoRegistro === "COLETIVO") {
        dadosProponente.nome = formData.nomeGrupo;
        dadosProponente.nome_grupo = formData.nomeGrupo;
        dadosProponente.ano_criacao = formData.anoCriacao ? parseInt(formData.anoCriacao) : null;
        dadosProponente.quantidade_pessoas = formData.quantidadePessoas ? parseInt(formData.quantidadePessoas) : null;
        dadosProponente.membros_coletivo = formData.membrosColetivo;
        dadosProponente.nome_responsavel = formData.nomeRepresentanteColetivo;
        dadosProponente.cpf_responsavel = formData.cpfRepresentanteColetivo;
        // Reutilizar campos de endereço e bancários comuns
        dadosProponente.endereco = formData.endereco;
        dadosProponente.banco = formData.banco;
        dadosProponente.agencia = formData.agencia;
        dadosProponente.conta = formData.conta;
        dadosProponente.tipo_conta = formData.tipoConta;
        dadosProponente.pix = formData.pix;
      } else if (tipoRegistro === "PJ") {
        dadosProponente.nome = formData.nomeFantasia; // Nome fantasia vai para a coluna nome
        dadosProponente.razao_social = formData.razaoSocial;
        dadosProponente.cnpj = formData.cnpj;
        dadosProponente.endereco = formData.enderecoSede;
        dadosProponente.numero = formData.numeroSede;
        dadosProponente.complemento = formData.complementoSede;
        dadosProponente.inscricao_estadual = formData.inscricaoEstadual;
        dadosProponente.inscricao_municipal = formData.inscricaoMunicipal;
        dadosProponente.nome_responsavel = formData.nomeResponsavel;
        dadosProponente.cpf_responsavel = formData.cpfResponsavel;
        dadosProponente.rg_responsavel = formData.rgResponsavel;
        dadosProponente.data_nascimento_responsavel = formData.dataNascimentoResponsavel;
        dadosProponente.telefone_responsavel = formData.telefoneResponsavel;
        dadosProponente.email_responsavel = formData.emailResponsavel;
        dadosProponente.cargo_responsavel = formData.cargoResponsavel;
        dadosProponente.cep_responsavel = formData.cepResponsavel;
        dadosProponente.endereco_responsavel = formData.enderecoResponsavel;
        dadosProponente.numero_responsavel = formData.numeroResponsavel;
        dadosProponente.complemento_responsavel = formData.complementoResponsavel;
        dadosProponente.cidade_responsavel = formData.cidadeResponsavel;
        dadosProponente.estado_responsavel = formData.estadoResponsavel;
        dadosProponente.comunidade_tradicional_responsavel = formData.comunidadeTradicionalResponsavel;
        dadosProponente.outra_comunidade_responsavel = formData.outraComunidadeResponsavel;
        dadosProponente.genero_responsavel = formData.generoResponsavel;
        dadosProponente.raca_responsavel = formData.racaResponsavel;
        dadosProponente.pcd_responsavel = formData.pcdResponsavel === "sim" || formData.pcdResponsavel === true;
        dadosProponente.tipo_deficiencia_responsavel = formData.tipoDeficienciaResponsavel;
        dadosProponente.outra_deficiencia_responsavel = formData.outraDeficienciaResponsavel;
        dadosProponente.escolaridade_responsavel = formData.escolaridadeResponsavel;
        dadosProponente.renda_mensal_responsavel = formData.rendaMensalResponsavel;
        dadosProponente.programa_social_responsavel = formData.programaSocialResponsavel;
        dadosProponente.outro_programa_social_responsavel = formData.outroProgramaSocialResponsavel;
        dadosProponente.concorre_cotas_responsavel = formData.concorreCotasResponsavel === "sim" || formData.concorreCotasResponsavel === true;
        dadosProponente.tipo_cotas_responsavel = formData.tipoCotasResponsavel;
        dadosProponente.funcao_artistica_responsavel = formData.funcaoArtisticaResponsavel;
        dadosProponente.outra_funcao_artistica_responsavel = formData.outraFuncaoArtisticaResponsavel;
        dadosProponente.profissao_responsavel = formData.profissaoResponsavel;
        dadosProponente.mini_curriculo_responsavel = formData.miniCurriculoResponsavel;
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

      const client = getAuthenticatedSupabaseClient('proponente');
      const { error } = await client
        .from('proponentes')
        .insert([dadosProponente]);

      if (error) throw error;

      const nomeValido = tipoRegistro === 'PF' ? formData.nome : formData.razaoSocial;
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
    if (!proponenteEditando) {
      toast({
        title: "Erro",
        description: "Proponente não encontrado.",
        variant: "destructive",
      });
      return;
    }
    
    const validacao = validarCamposObrigatorios();
    if (!validacao.valido) {
      toast({
        title: "Campos obrigatórios",
        description: validacao.mensagem,
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
      } else if (tipoRegistro === "COLETIVO") {
        dadosProponente.nome = formData.nomeGrupo;
        dadosProponente.nome_grupo = formData.nomeGrupo;
        dadosProponente.ano_criacao = formData.anoCriacao ? parseInt(formData.anoCriacao) : null;
        dadosProponente.quantidade_pessoas = formData.quantidadePessoas ? parseInt(formData.quantidadePessoas) : null;
        dadosProponente.membros_coletivo = formData.membrosColetivo;
        dadosProponente.nome_responsavel = formData.nomeRepresentanteColetivo;
        dadosProponente.cpf_responsavel = formData.cpfRepresentanteColetivo;
        // Campos comuns (telefone, endereço, bancários) são tratados acima ou abaixo
        dadosProponente.telefone_responsavel = formData.telefoneRepresentanteColetivo;
        dadosProponente.email_responsavel = formData.emailRepresentanteColetivo;
      } else if (tipoRegistro === "PJ") {
        dadosProponente.nome = formData.nomeFantasia; // Nome fantasia vai para a coluna nome
        dadosProponente.razao_social = formData.razaoSocial;
        dadosProponente.cnpj = formData.cnpj;
        dadosProponente.endereco = formData.enderecoSede;
        dadosProponente.numero = formData.numeroSede;
        dadosProponente.complemento = formData.complementoSede;
        dadosProponente.inscricao_estadual = formData.inscricaoEstadual;
        dadosProponente.inscricao_municipal = formData.inscricaoMunicipal;
        dadosProponente.nome_responsavel = formData.nomeResponsavel;
        dadosProponente.cpf_responsavel = formData.cpfResponsavel;
        dadosProponente.rg_responsavel = formData.rgResponsavel;
        dadosProponente.data_nascimento_responsavel = formData.dataNascimentoResponsavel;
        dadosProponente.telefone_responsavel = formData.telefoneResponsavel;
        dadosProponente.email_responsavel = formData.emailResponsavel;
        dadosProponente.cargo_responsavel = formData.cargoResponsavel;
        dadosProponente.cep_responsavel = formData.cepResponsavel;
        dadosProponente.endereco_responsavel = formData.enderecoResponsavel;
        dadosProponente.numero_responsavel = formData.numeroResponsavel;
        dadosProponente.complemento_responsavel = formData.complementoResponsavel;
        dadosProponente.cidade_responsavel = formData.cidadeResponsavel;
        dadosProponente.estado_responsavel = formData.estadoResponsavel;
        dadosProponente.comunidade_tradicional_responsavel = formData.comunidadeTradicionalResponsavel;
        dadosProponente.outra_comunidade_responsavel = formData.outraComunidadeResponsavel;
        dadosProponente.genero_responsavel = formData.generoResponsavel;
        dadosProponente.raca_responsavel = formData.racaResponsavel;
        dadosProponente.pcd_responsavel = formData.pcdResponsavel === "sim" || formData.pcdResponsavel === true;
        dadosProponente.tipo_deficiencia_responsavel = formData.tipoDeficienciaResponsavel;
        dadosProponente.outra_deficiencia_responsavel = formData.outraDeficienciaResponsavel;
        dadosProponente.escolaridade_responsavel = formData.escolaridadeResponsavel;
        dadosProponente.renda_mensal_responsavel = formData.rendaMensalResponsavel;
        dadosProponente.programa_social_responsavel = formData.programaSocialResponsavel;
        dadosProponente.outro_programa_social_responsavel = formData.outroProgramaSocialResponsavel;
        dadosProponente.concorre_cotas_responsavel = formData.concorreCotasResponsavel === "sim" || formData.concorreCotasResponsavel === true;
        dadosProponente.tipo_cotas_responsavel = formData.tipoCotasResponsavel;
        dadosProponente.funcao_artistica_responsavel = formData.funcaoArtisticaResponsavel;
        dadosProponente.outra_funcao_artistica_responsavel = formData.outraFuncaoArtisticaResponsavel;
        dadosProponente.profissao_responsavel = formData.profissaoResponsavel;
        dadosProponente.mini_curriculo_responsavel = formData.miniCurriculoResponsavel;
      }
      
      // Dados bancários (comum para ambos)
      dadosProponente.banco = formData.banco;
      dadosProponente.agencia = formData.agencia;
      dadosProponente.conta = formData.conta;
      dadosProponente.tipo_conta = formData.tipoConta;
      dadosProponente.pix = formData.pix;

      const client = getAuthenticatedSupabaseClient('proponente');
      const { error } = await client
        .from('proponentes')
        .update(dadosProponente)
        .eq('id', proponenteEditando.id);

      if (error) throw error;

      const nomeValido = tipoRegistro === 'PF' ? formData.nome : formData.razaoSocial;
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
                <SelectItem value="COLETIVO">Coletivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seção de registro de novos proponentes - Novo Design */}
          <div className="space-y-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Tipos de cadastro de proponentes:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* PF Card */}
              <Card 
                className="cursor-pointer hover:shadow-2xl transition-all group border-gray-100 shadow-md rounded-3xl overflow-hidden"
                onClick={handleRegistrarPF}
              >
                <CardContent className="flex flex-col items-center p-10 space-y-8">
                  <div className="w-40 h-40 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-32 h-32 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden shadow-inner">
                      <User className="w-20 h-20 text-white" />
                    </div>
                  </div>
                  <p className="font-bold text-center text-base md:text-lg text-gray-900 leading-tight flex items-center justify-center h-16 uppercase">
                    PESSOA FÍSICA OU MICROEMPREENDEDOR INDIVIDUAL – MEI
                  </p>
                </CardContent>
              </Card>

              {/* PJ Card */}
              <Card 
                className="cursor-pointer hover:shadow-2xl transition-all group border-gray-100 shadow-md rounded-3xl overflow-hidden"
                onClick={handleRegistrarPJ}
              >
                <CardContent className="flex flex-col items-center p-10 space-y-8">
                  <div className="w-40 h-40 rounded-full bg-yellow-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-32 h-32 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden shadow-inner">
                      <UserCircle className="w-20 h-20 text-white" />
                    </div>
                  </div>
                  <p className="font-bold text-center text-base md:text-lg text-gray-900 leading-tight flex items-center justify-center h-16 uppercase">
                    PESSOA JURÍDICA
                  </p>
                </CardContent>
              </Card>

              {/* Coletivo Card */}
              <Card 
                className="cursor-pointer hover:shadow-2xl transition-all group border-gray-100 shadow-md rounded-3xl overflow-hidden"
                onClick={handleRegistrarColetivo}
              >
                <CardContent className="flex flex-col items-center p-10 space-y-8">
                  <div className="w-40 h-40 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-32 h-32 rounded-full bg-purple-400 flex items-center justify-center overflow-hidden shadow-inner">
                      <Users className="w-20 h-20 text-white" />
                    </div>
                  </div>
                  <p className="font-bold text-center text-base md:text-lg text-gray-900 leading-tight flex items-center justify-center h-16 uppercase">
                    COLETIVO SEM CONSTITUIÇÃO JURÍDICA
                  </p>
                </CardContent>
              </Card>
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
                              variant={proponente.tipo === "PF" ? "default" : proponente.tipo === "PJ" ? "secondary" : "outline"}
                              className={`text-xs ${
                                proponente.tipo === "PF" ? "bg-blue-600 text-white" : 
                                proponente.tipo === "PJ" ? "bg-green-600 text-white" : 
                                "bg-purple-600 text-white border-none"
                              }`}
                            >
                              {proponente.tipo === "PF" ? "Pessoa Física" : proponente.tipo === "PJ" ? "Pessoa Jurídica" : "Coletivo"}
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
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Representante Legal</h4>
                                  <div className="space-y-4">
                                    {/* Dados Básicos */}
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
                                      {proponente.rg_responsavel && (
                                        <div>
                                          <span className="text-xs text-gray-500 font-medium">RG:</span>
                                          <p className="text-sm text-gray-700">{proponente.rg_responsavel}</p>
                                        </div>
                                      )}
                                      {proponente.data_nascimento_responsavel && (
                                        <div>
                                          <span className="text-xs text-gray-500 font-medium">Data de Nascimento:</span>
                                          <p className="text-sm text-gray-700">{formatarData(proponente.data_nascimento_responsavel)}</p>
                                        </div>
                                      )}
                                      {proponente.cargo_responsavel && (
                                        <div>
                                          <span className="text-xs text-gray-500 font-medium">Cargo:</span>
                                          <p className="text-sm text-gray-700">{proponente.cargo_responsavel}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Contato */}
                                    {(proponente.email_responsavel || proponente.telefone_responsavel) && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                                        {proponente.email_responsavel && (
                                          <div>
                                            <span className="text-xs text-gray-500 font-medium">Email:</span>
                                            <p className="text-sm text-gray-700">{proponente.email_responsavel}</p>
                                          </div>
                                        )}
                                        {proponente.telefone_responsavel && (
                                          <div>
                                            <span className="text-xs text-gray-500 font-medium">Telefone:</span>
                                            <p className="text-sm text-gray-700">{proponente.telefone_responsavel}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Endereço */}
                                    {proponente.endereco_responsavel && (
                                      <div className="pt-2 border-t">
                                        <h5 className="text-xs font-semibold text-gray-600 mb-1">Endereço</h5>
                                        <p className="text-sm text-gray-700">
                                          {[
                                            proponente.endereco_responsavel,
                                            proponente.numero_responsavel,
                                            proponente.complemento_responsavel
                                          ].filter(Boolean).join(', ')}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                          {[
                                            proponente.cidade_responsavel,
                                            proponente.estado_responsavel,
                                            proponente.cep_responsavel
                                          ].filter(Boolean).join(' - ')}
                                        </p>
                                      </div>
                                    )}

                                    {/* Dados Pessoais */}
                                    {(proponente.comunidade_tradicional_responsavel || proponente.genero_responsavel || proponente.raca_responsavel || proponente.escolaridade_responsavel || proponente.renda_mensal_responsavel) && (
                                      <div className="pt-2 border-t">
                                        <h5 className="text-xs font-semibold text-gray-600 mb-2">Dados Pessoais</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {proponente.comunidade_tradicional_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Comunidade Tradicional:</span>
                                              <p className="text-sm text-gray-700">{traduzirComunidade(proponente.comunidade_tradicional_responsavel)}</p>
                                            </div>
                                          )}
                                          {proponente.genero_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Gênero:</span>
                                              <p className="text-sm text-gray-700">{traduzirGenero(proponente.genero_responsavel)}</p>
                                            </div>
                                          )}
                                          {proponente.raca_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Raça/Cor:</span>
                                              <p className="text-sm text-gray-700">{traduzirRaca(proponente.raca_responsavel)}</p>
                                            </div>
                                          )}
                                          {proponente.escolaridade_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Escolaridade:</span>
                                              <p className="text-sm text-gray-700">{traduzirEscolaridade(proponente.escolaridade_responsavel)}</p>
                                            </div>
                                          )}
                                          {proponente.renda_mensal_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Renda Mensal:</span>
                                              <p className="text-sm text-gray-700">{traduzirRenda(proponente.renda_mensal_responsavel)}</p>
                                            </div>
                                          )}
                                          {proponente.pcd_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">PCD:</span>
                                              <p className="text-sm text-gray-700">Sim{proponente.tipo_deficiencia_responsavel && ` - ${traduzirDeficiencia(proponente.tipo_deficiencia_responsavel)}`}</p>
                                            </div>
                                          )}
                                          {proponente.programa_social_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Programa Social:</span>
                                              <p className="text-sm text-gray-700">{traduzirProgramaSocial(proponente.programa_social_responsavel)}</p>
                                            </div>
                                          )}
                                          {proponente.concorre_cotas_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Concorre Cotas:</span>
                                              <p className="text-sm text-gray-700">Sim{proponente.tipo_cotas_responsavel && ` - ${traduzirCotas(proponente.tipo_cotas_responsavel)}`}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Atividade Artística */}
                                    {(proponente.funcao_artistica_responsavel || proponente.profissao_responsavel) && (
                                      <div className="pt-2 border-t">
                                        <h5 className="text-xs font-semibold text-gray-600 mb-2">Atividade Profissional</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {proponente.funcao_artistica_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Função Artística:</span>
                                              <p className="text-sm text-gray-700">{traduzirFuncaoArtistica(proponente.funcao_artistica_responsavel)}</p>
                                            </div>
                                          )}
                                          {proponente.profissao_responsavel && (
                                            <div>
                                              <span className="text-xs text-gray-500 font-medium">Profissão:</span>
                                              <p className="text-sm text-gray-700">{proponente.profissao_responsavel}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Currículo */}
                                    {proponente.mini_curriculo_responsavel && (
                                      <div className="pt-2 border-t">
                                        <span className="text-xs text-gray-500 font-medium">Mini Currículo:</span>
                                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{proponente.mini_curriculo_responsavel}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Dados Coletivo */}
                          {proponente.tipo === "COLETIVO" && (
                            <div className="pt-2 border-t">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Dados do Coletivo</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {proponente.nome_grupo && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">Nome do Grupo:</span>
                                    <p className="text-sm text-gray-700">{proponente.nome_grupo}</p>
                                  </div>
                                )}
                                {proponente.ano_criacao && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">Ano de Criação:</span>
                                    <p className="text-sm text-gray-700">{proponente.ano_criacao}</p>
                                  </div>
                                )}
                                {proponente.quantidade_pessoas && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">Quantidade de Pessoas:</span>
                                    <p className="text-sm text-gray-700">{proponente.quantidade_pessoas}</p>
                                  </div>
                                )}
                                {proponente.nome_responsavel && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">Representante:</span>
                                    <p className="text-sm text-gray-700">{proponente.nome_responsavel}</p>
                                  </div>
                                )}
                              </div>
                              {proponente.membros_coletivo && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500 font-medium">Membros:</span>
                                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{proponente.membros_coletivo}</p>
                                </div>
                              )}
                            </div>
                          )}
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
              Registrar {tipoRegistro === "PF" ? "Pessoa Física" : tipoRegistro === "PJ" ? "Pessoa Jurídica" : "Coletivo"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-8 px-4 py-2">
            {/* Renderização unificada para PF */}
            {tipoRegistro === "PF" && (
              <>
                <DadosBasicosPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <EnderecoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <DadosPessoaisPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <PCDPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <FormacaoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <ProgramasSociaisPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <CotasPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <ArtisticoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <ColetivoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <ExperienciaPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <BancarioPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
              </>
            )}

            {/* Renderização unificada para PJ */}
            {tipoRegistro === "PJ" && (
              <>
                <DadosEmpresaPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
                <EnderecoPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
                <InscricoesPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
                <ResponsavelPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
                <BancarioPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
              </>
            )}

            {/* Renderização unificada para COLETIVO */}
            {tipoRegistro === "COLETIVO" && (
              <>
                <DadosBasicosColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
                <RepresentanteColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
                <EnderecoColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
                <MembrosColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
                <BancarioColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalRegistroAberto(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button 
              onClick={handleSalvarRegistro}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Proponente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isModalEdicaoAberto} onOpenChange={setIsModalEdicaoAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar {proponenteEditando?.tipo === "PF" ? "Pessoa Física" : proponenteEditando?.tipo === "PJ" ? "Pessoa Jurídica" : "Coletivo"} - {proponenteEditando?.nome}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-8 px-4 py-2">
            {/* Renderização unificada para PF */}
            {tipoRegistro === "PF" && (
              <>
                <DadosBasicosPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <EnderecoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <DadosPessoaisPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <PCDPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <FormacaoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <ProgramasSociaisPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <CotasPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <ArtisticoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <ColetivoPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <ExperienciaPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
                <BancarioPF formData={formData} handleInputChange={handleInputChange} tipoRegistro="PF" currentStep={1} />
              </>
            )}

            {/* Renderização unificada para PJ */}
            {tipoRegistro === "PJ" && (
              <>
                <DadosEmpresaPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
                <EnderecoPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
                <InscricoesPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
                <ResponsavelPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
                <BancarioPJ formData={formData} handleInputChange={handleInputChange} tipoRegistro="PJ" currentStep={1} />
              </>
            )}

            {/* Renderização unificada para COLETIVO */}
            {tipoRegistro === "COLETIVO" && (
              <>
                <DadosBasicosColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
                <RepresentanteColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
                <EnderecoColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
                <MembrosColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
                <BancarioColetivo formData={formData} handleInputChange={handleInputChange} tipoRegistro="COLETIVO" currentStep={1} />
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
            
            <Button 
              onClick={handleSalvarEdicao}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProponenteLayout>
  );
};

