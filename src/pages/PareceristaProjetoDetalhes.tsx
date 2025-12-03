import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, FileText, User, Calendar, DollarSign, Building2, Save, Loader2, BarChart3 } from "lucide-react";
import { PareceristaLayout } from "@/components/layout/PareceristaLayout";
import { usePareceristaAuth } from "@/hooks/usePareceristaAuth";
import { useToast } from "@/hooks/use-toast";
import { useProjetoDetalhes } from "@/hooks/useProjetoDetalhes";
import { getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";

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

interface Avaliacao {
  id: string;
  nota_criterio_a?: number;
  obs_criterio_a?: string;
  nota_criterio_b?: number;
  obs_criterio_b?: string;
  nota_criterio_c?: number;
  obs_criterio_c?: string;
  nota_criterio_d?: number;
  obs_criterio_d?: string;
  nota_criterio_e?: number;
  obs_criterio_e?: string;
  bonus_criterio_f?: number;
  bonus_criterio_g?: number;
  bonus_criterio_h?: number;
  bonus_criterio_i?: number;
  nota_final?: number;
  parecer_tecnico?: string;
  recomendacao?: string;
  status: string;
  data_atribuicao?: string;
  data_inicio_avaliacao?: string;
  data_conclusao?: string;
  created_at: string;
  motivo_rejeicao?: string;
}

export const PareceristaProjetoDetalhes = () => {
  const { nomePrefeitura, editalId, projetoId } = useParams<{ nomePrefeitura: string; editalId: string; projetoId: string }>();
  const navigate = useNavigate();
  const { parecerista } = usePareceristaAuth();
  const { toast } = useToast();
  
  const { projeto, loading: projetoLoading } = useProjetoDetalhes(projetoId || '');
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [loadingAvaliacao, setLoadingAvaliacao] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [showRejeicaoModal, setShowRejeicaoModal] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  
  const [formData, setFormData] = useState({
    nota_criterio_a: [0],
    obs_criterio_a: '',
    nota_criterio_b: [0],
    obs_criterio_b: '',
    nota_criterio_c: [0],
    obs_criterio_c: '',
    nota_criterio_d: [0],
    obs_criterio_d: '',
    nota_criterio_e: [0],
    obs_criterio_e: '',
    bonus_criterio_f: [0],
    bonus_criterio_g: [0],
    bonus_criterio_h: [0],
    bonus_criterio_i: [0],
    parecer_tecnico: ''
  });

  useEffect(() => {
    const carregarAvaliacao = async () => {
      if (!parecerista || !projetoId) return;

      try {
        setLoadingAvaliacao(true);
        
        const authClient = getAuthenticatedSupabaseClient();
        const { data, error } = await authClient
          .from('avaliacoes')
          .select('*')
          .eq('projeto_id', projetoId)
          .eq('parecerista_id', parecerista.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          const avaliacaoData = data as any;
          setAvaliacao(avaliacaoData as Avaliacao);
          setFormData({
            nota_criterio_a: [avaliacaoData.nota_criterio_a || 0],
            obs_criterio_a: avaliacaoData.obs_criterio_a || '',
            nota_criterio_b: [avaliacaoData.nota_criterio_b || 0],
            obs_criterio_b: avaliacaoData.obs_criterio_b || '',
            nota_criterio_c: [avaliacaoData.nota_criterio_c || 0],
            obs_criterio_c: avaliacaoData.obs_criterio_c || '',
            nota_criterio_d: [avaliacaoData.nota_criterio_d || 0],
            obs_criterio_d: avaliacaoData.obs_criterio_d || '',
            nota_criterio_e: [avaliacaoData.nota_criterio_e || 0],
            obs_criterio_e: avaliacaoData.obs_criterio_e || '',
            bonus_criterio_f: [avaliacaoData.bonus_criterio_f || 0],
            bonus_criterio_g: [avaliacaoData.bonus_criterio_g || 0],
            bonus_criterio_h: [avaliacaoData.bonus_criterio_h || 0],
            bonus_criterio_i: [avaliacaoData.bonus_criterio_i || 0],
            parecer_tecnico: avaliacaoData.parecer_tecnico || ''
          });
          
          // Se o status for 'em_avaliacao', já está em modo de edição
          if (avaliacaoData.status === 'em_avaliacao') {
            setEditando(true);
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar avaliação:', error);
      } finally {
        setLoadingAvaliacao(false);
      }
    };

    carregarAvaliacao();
  }, [parecerista, projetoId]);

  const handleIniciarAvaliacao = async () => {
    if (!avaliacao) return;

    try {
      // Registrar o início da avaliação
      const authClient = getAuthenticatedSupabaseClient();
      const { data, error } = await (authClient as any)
        .from('avaliacoes')
        .update({
          status: 'em_avaliacao',
          data_inicio_avaliacao: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', avaliacao.id)
        .select()
        .single();

      if (error) throw error;

      setAvaliacao(data);
      setEditando(true);

      toast({
        title: "Avaliação iniciada",
        description: "Você pode começar a preencher a avaliação",
      });
    } catch (error: any) {
      console.error('Erro ao iniciar avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar avaliação",
        variant: "destructive",
      });
    }
  };

  const handleSalvarAvaliacao = async (motivoRejeicao?: string) => {
    if (!avaliacao) return;

    try {
      setSalvando(true);

      const notasNumericas = {
        nota_criterio_a: formData.nota_criterio_a[0] || null,
        obs_criterio_a: formData.obs_criterio_a || null,
        nota_criterio_b: formData.nota_criterio_b[0] || null,
        obs_criterio_b: formData.obs_criterio_b || null,
        nota_criterio_c: formData.nota_criterio_c[0] || null,
        obs_criterio_c: formData.obs_criterio_c || null,
        nota_criterio_d: formData.nota_criterio_d[0] || null,
        obs_criterio_d: formData.obs_criterio_d || null,
        nota_criterio_e: formData.nota_criterio_e[0] || null,
        obs_criterio_e: formData.obs_criterio_e || null,
        bonus_criterio_f: formData.bonus_criterio_f[0] || null,
        bonus_criterio_g: formData.bonus_criterio_g[0] || null,
        bonus_criterio_h: formData.bonus_criterio_h[0] || null,
        bonus_criterio_i: formData.bonus_criterio_i[0] || null,
      };

      // Calcular nota final: (A+B+C+D+E) + (F+G+H+I)
      const somaObrigatorios = [
        notasNumericas.nota_criterio_a,
        notasNumericas.nota_criterio_b,
        notasNumericas.nota_criterio_c,
        notasNumericas.nota_criterio_d,
        notasNumericas.nota_criterio_e
      ].filter(n => n !== null).reduce((a, b) => (a || 0) + (b || 0), 0);
      
      const somaBonus = [
        notasNumericas.bonus_criterio_f,
        notasNumericas.bonus_criterio_g,
        notasNumericas.bonus_criterio_h,
        notasNumericas.bonus_criterio_i
      ].filter(n => n !== null).reduce((a, b) => (a || 0) + (b || 0), 0);
      
      const notaFinal = somaObrigatorios + somaBonus;

      // Sempre marcar como avaliado ao enviar
      const authClient = getAuthenticatedSupabaseClient();
      const { data, error } = await (authClient as any)
        .from('avaliacoes')
        .update({
          ...notasNumericas,
          nota_final: notaFinal || null,
          parecer_tecnico: formData.parecer_tecnico,
          status: 'avaliado',
          data_conclusao: new Date().toISOString(),
          motivo_rejeicao: motivoRejeicao || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', avaliacao.id)
        .select()
        .single();

      if (error) throw error;

      // Verificar se todas as avaliações do projeto foram concluídas
      const { data: todasAvaliacoes } = await (authClient as any)
        .from('avaliacoes')
        .select('id, status')
        .eq('projeto_id', projetoId);

      const totalAvaliacoes = todasAvaliacoes?.length || 0;
      const avaliacoesConcluidas = todasAvaliacoes?.filter(a => a.status === 'avaliado').length || 0;

      // Se todas as avaliações foram concluídas, o trigger do banco já atualizará nota_media e status do projeto
      // Não atualizamos o status do projeto aqui porque pode haver múltiplos pareceristas
      // O status será "avaliado" quando todas as avaliações forem concluídas (via trigger)
      // A decisão final (aprovado/rejeitado) será feita pela prefeitura após análise

      setAvaliacao(data);
      setEditando(false);
      setShowRejeicaoModal(false);
      
      toast({
        title: "Avaliação salva",
        description: "A avaliação foi salva com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar avaliação",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleConfirmarSalvarAvaliacao = async () => {
    // Calcular nota final
    const somaObrigatorios = [
      formData.nota_criterio_a[0],
      formData.nota_criterio_b[0],
      formData.nota_criterio_c[0],
      formData.nota_criterio_d[0],
      formData.nota_criterio_e[0]
    ].reduce((a, b) => a + b, 0);
    
    const somaBonus = [
      formData.bonus_criterio_f[0],
      formData.bonus_criterio_g[0],
      formData.bonus_criterio_h[0],
      formData.bonus_criterio_i[0]
    ].reduce((a, b) => a + b, 0);
    
    const notaFinal = somaObrigatorios + somaBonus;

   handleSalvarAvaliacao();

  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      rascunho: { label: 'Rascunho', color: 'bg-yellow-100 text-yellow-800' },
      aguardando_parecerista: { label: 'Aguardando Parecerista', color: 'bg-orange-100 text-orange-800' },
      aguardando_avaliacao: { label: 'Aguardando', color: 'bg-orange-100 text-orange-800' },
      recebido: { label: 'Recebido', color: 'bg-blue-100 text-blue-800' },
      em_avaliacao: { label: 'Em Avaliação', color: 'bg-blue-100 text-blue-800' },
      avaliado: { label: 'Avaliado', color: 'bg-green-100 text-green-800' },
      aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
      em_execucao: { label: 'Em Execução', color: 'bg-blue-100 text-blue-800' },
      concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
    };
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getAvaliacaoStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      aguardando_parecerista: { label: 'Aguardando Parecerista', color: 'bg-orange-100 text-orange-800' },
      pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      em_avaliacao: { label: 'Em Avaliação', color: 'bg-blue-100 text-blue-800' },
      avaliado: { label: 'Avaliado', color: 'bg-green-100 text-green-800' },
    };
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (projetoLoading) {
    return (
      <PareceristaLayout title="Carregando..." editalId={editalId}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </PareceristaLayout>
    );
  }

  if (!projeto) {
    return (
      <PareceristaLayout title="Projeto não encontrado" editalId={editalId}>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Projeto não encontrado</p>
          </CardContent>
        </Card>
      </PareceristaLayout>
    );
  }

  return (
    <PareceristaLayout
      title={projeto.nome}
      description="Detalhes do projeto para avaliação"
      editalId={editalId}
    >
      <div className="space-y-6">
        {/* Status e Ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getStatusConfig(projeto.status).color}>
              {getStatusConfig(projeto.status).label}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/${nomePrefeitura}/parecerista/${editalId}/projetos`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="informacoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="informacoes">Informações Gerais</TabsTrigger>
            <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
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
                        {getStatusConfig(projeto.status).label}
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
                            {(projeto.proponente as any).inscricao_municipal && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 font-medium block">Inscrição Municipal:</span>
                                <p className="text-sm text-gray-700">{(projeto.proponente as any).inscricao_municipal}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Representante Legal */}
                      {((projeto.proponente as any).nome_responsavel || (projeto.proponente as any).cpf_responsavel || (projeto.proponente as any).cargo_responsavel) && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Representante Legal</h4>
                          <div className="space-y-4">
                            {/* Dados Básicos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {(projeto.proponente as any).nome_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">Nome:</span>
                                  <p className="text-sm text-gray-700">{(projeto.proponente as any).nome_responsavel}</p>
                                </div>
                              )}
                              {(projeto.proponente as any).cpf_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">CPF:</span>
                                  <p className="text-sm text-gray-700">{(projeto.proponente as any).cpf_responsavel}</p>
                                </div>
                              )}
                              {(projeto.proponente as any).rg_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">RG:</span>
                                  <p className="text-sm text-gray-700">{(projeto.proponente as any).rg_responsavel}</p>
                                </div>
                              )}
                              {(projeto.proponente as any).data_nascimento_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">Data de Nascimento:</span>
                                  <p className="text-sm text-gray-700">{formatarData((projeto.proponente as any).data_nascimento_responsavel)}</p>
                                </div>
                              )}
                              {(projeto.proponente as any).cargo_responsavel && (
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500 font-medium block">Cargo:</span>
                                  <p className="text-sm text-gray-700">{(projeto.proponente as any).cargo_responsavel}</p>
                                </div>
                              )}
                            </div>

                            {/* Contato */}
                            {((projeto.proponente as any).email_responsavel || (projeto.proponente as any).telefone_responsavel) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                {(projeto.proponente as any).email_responsavel && (
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500 font-medium block">Email:</span>
                                    <p className="text-sm text-gray-700">{(projeto.proponente as any).email_responsavel}</p>
                                  </div>
                                )}
                                {(projeto.proponente as any).telefone_responsavel && (
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500 font-medium block">Telefone:</span>
                                    <p className="text-sm text-gray-700">{(projeto.proponente as any).telefone_responsavel}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Endereço */}
                            {(projeto.proponente as any).endereco_responsavel && (
                              <div className="pt-4 border-t">
                                <h5 className="text-xs font-semibold text-gray-600 mb-2">Endereço</h5>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-700">
                                    {[
                                      (projeto.proponente as any).endereco_responsavel,
                                      (projeto.proponente as any).numero_responsavel,
                                      (projeto.proponente as any).complemento_responsavel
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {[
                                      (projeto.proponente as any).cidade_responsavel,
                                      (projeto.proponente as any).estado_responsavel,
                                      (projeto.proponente as any).cep_responsavel
                                    ].filter(Boolean).join(' - ')}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Dados Pessoais */}
                            {((projeto.proponente as any).comunidade_tradicional_responsavel || (projeto.proponente as any).genero_responsavel || (projeto.proponente as any).raca_responsavel || (projeto.proponente as any).escolaridade_responsavel || (projeto.proponente as any).renda_mensal_responsavel) && (
                              <div className="pt-4 border-t">
                                <h5 className="text-xs font-semibold text-gray-600 mb-3">Dados Pessoais</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {(projeto.proponente as any).comunidade_tradicional_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Comunidade Tradicional:</span>
                                      <p className="text-sm text-gray-700">{traduzirComunidade((projeto.proponente as any).comunidade_tradicional_responsavel)}</p>
                                    </div>
                                  )}
                                  {(projeto.proponente as any).genero_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Gênero:</span>
                                      <p className="text-sm text-gray-700">{traduzirGenero((projeto.proponente as any).genero_responsavel)}</p>
                                    </div>
                                  )}
                                  {(projeto.proponente as any).raca_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Raça/Cor:</span>
                                      <p className="text-sm text-gray-700">{traduzirRaca((projeto.proponente as any).raca_responsavel)}</p>
                                    </div>
                                  )}
                                  {(projeto.proponente as any).escolaridade_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Escolaridade:</span>
                                      <p className="text-sm text-gray-700">{traduzirEscolaridade((projeto.proponente as any).escolaridade_responsavel)}</p>
                                    </div>
                                  )}
                                  {(projeto.proponente as any).renda_mensal_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Renda Mensal:</span>
                                      <p className="text-sm text-gray-700">{traduzirRenda((projeto.proponente as any).renda_mensal_responsavel)}</p>
                                    </div>
                                  )}
                                  {(projeto.proponente as any).pcd_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">PCD:</span>
                                      <p className="text-sm text-gray-700">Sim{(projeto.proponente as any).tipo_deficiencia_responsavel && ` - ${traduzirDeficiencia((projeto.proponente as any).tipo_deficiencia_responsavel)}`}</p>
                                    </div>
                                  )}
                                  {(projeto.proponente as any).programa_social_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Programa Social:</span>
                                      <p className="text-sm text-gray-700">{traduzirProgramaSocial((projeto.proponente as any).programa_social_responsavel)}</p>
                                    </div>
                                  )}
                                  {(projeto.proponente as any).concorre_cotas_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Concorre Cotas:</span>
                                      <p className="text-sm text-gray-700">Sim{(projeto.proponente as any).tipo_cotas_responsavel && ` - ${traduzirCotas((projeto.proponente as any).tipo_cotas_responsavel)}`}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Atividade Artística */}
                            {((projeto.proponente as any).funcao_artistica_responsavel || (projeto.proponente as any).profissao_responsavel) && (
                              <div className="pt-4 border-t">
                                <h5 className="text-xs font-semibold text-gray-600 mb-3">Atividade Profissional</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {(projeto.proponente as any).funcao_artistica_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Função Artística:</span>
                                      <p className="text-sm text-gray-700">{traduzirFuncaoArtistica((projeto.proponente as any).funcao_artistica_responsavel)}</p>
                                    </div>
                                  )}
                                  {(projeto.proponente as any).profissao_responsavel && (
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Profissão:</span>
                                      <p className="text-sm text-gray-700">{(projeto.proponente as any).profissao_responsavel}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Currículo */}
                            {(projeto.proponente as any).mini_curriculo_responsavel && (
                              <div className="pt-4 border-t">
                                <span className="text-xs text-gray-500 font-medium block mb-2">Mini Currículo:</span>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{(projeto.proponente as any).mini_curriculo_responsavel}</p>
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
                          <span>{formatarData(inicioMin.toISOString())}</span>
                          <span>{formatarData(fimMax.toISOString())}</span>
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
                      Avaliação do Projeto
                    </CardTitle>
                    <CardDescription>
                      {editando ? 'Preencha os campos da avaliação' : (avaliacao?.status === 'aguardando_parecerista' || avaliacao?.status === 'pendente') ? 'Inicie a avaliação para começar' : 'Visualização da avaliação concluída'}
                    </CardDescription>
                  </div>
                  {avaliacao && !editando && (avaliacao.status === 'aguardando_parecerista' || avaliacao.status === 'pendente') && (
                    <Button onClick={handleIniciarAvaliacao}>
                      Iniciar Avaliação
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingAvaliacao ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">Carregando avaliação...</p>
                  </div>
                ) : !avaliacao ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma avaliação encontrada
                  </div>
                ) : !editando && (avaliacao.status === 'aguardando_parecerista' || avaliacao.status === 'pendente') ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Clique em "Iniciar Avaliação" para começar a avaliar este projeto</p>
                  </div>
                ) : editando ? (
                  <div className="space-y-6">
                    {/* Critérios Obrigatórios */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Critérios Obrigatórios</h3>
                      
                      {/* Critério A */}
                      <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                        <Label>Critério A - Qualidade do Projeto (Máx: 10 pontos) ⚠️ Nota 0 resulta em desclassificação</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={formData.nota_criterio_a}
                            onValueChange={(value) => setFormData({ ...formData, nota_criterio_a: value })}
                            min={0}
                            max={10}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-lg font-semibold min-w-[60px] text-center">{formData.nota_criterio_a[0].toFixed(1)}</span>
                        </div>
                        <Textarea
                          placeholder="Observações (opcional)"
                          value={formData.obs_criterio_a}
                          onChange={(e) => setFormData({ ...formData, obs_criterio_a: e.target.value })}
                          rows={2}
                        />
                      </div>

                      {/* Critério B */}
                      <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                        <Label>Critério B - Relevância Cultural (Máx: 10 pontos) ⚠️ Nota 0 resulta em desclassificação</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={formData.nota_criterio_b}
                            onValueChange={(value) => setFormData({ ...formData, nota_criterio_b: value })}
                            min={0}
                            max={10}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-lg font-semibold min-w-[60px] text-center">{formData.nota_criterio_b[0].toFixed(1)}</span>
                        </div>
                        <Textarea
                          placeholder="Observações (opcional)"
                          value={formData.obs_criterio_b}
                          onChange={(e) => setFormData({ ...formData, obs_criterio_b: e.target.value })}
                          rows={2}
                        />
                      </div>

                      {/* Critério C */}
                      <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                        <Label>Critério C - Integração Comunitária (Máx: 10 pontos) ⚠️ Nota 0 resulta em desclassificação</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={formData.nota_criterio_c}
                            onValueChange={(value) => setFormData({ ...formData, nota_criterio_c: value })}
                            min={0}
                            max={10}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-lg font-semibold min-w-[60px] text-center">{formData.nota_criterio_c[0].toFixed(1)}</span>
                        </div>
                        <Textarea
                          placeholder="Observações (opcional)"
                          value={formData.obs_criterio_c}
                          onChange={(e) => setFormData({ ...formData, obs_criterio_c: e.target.value })}
                          rows={2}
                        />
                      </div>

                      {/* Critério D */}
                      <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                        <Label>Critério D - Trajetória Artística (Máx: 10 pontos) ⚠️ Nota 0 resulta em desclassificação</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={formData.nota_criterio_d}
                            onValueChange={(value) => setFormData({ ...formData, nota_criterio_d: value })}
                            min={0}
                            max={10}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-lg font-semibold min-w-[60px] text-center">{formData.nota_criterio_d[0].toFixed(1)}</span>
                        </div>
                        <Textarea
                          placeholder="Observações (opcional)"
                          value={formData.obs_criterio_d}
                          onChange={(e) => setFormData({ ...formData, obs_criterio_d: e.target.value })}
                          rows={2}
                        />
                      </div>

                      {/* Critério E */}
                      <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                        <Label>Critério E - Promoção de Diversidade (Máx: 10 pontos) ⚠️ Nota 0 resulta em desclassificação</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={formData.nota_criterio_e}
                            onValueChange={(value) => setFormData({ ...formData, nota_criterio_e: value })}
                            min={0}
                            max={10}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-lg font-semibold min-w-[60px] text-center">{formData.nota_criterio_e[0].toFixed(1)}</span>
                        </div>
                        <Textarea
                          placeholder="Observações (opcional)"
                          value={formData.obs_criterio_e}
                          onChange={(e) => setFormData({ ...formData, obs_criterio_e: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Critérios Bônus */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Critérios Bônus (Opcionais)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 border rounded-lg p-4 bg-blue-50">
                          <Label>Critério F - Agente cultural do gênero feminino (Máx: 5 pontos)</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={formData.bonus_criterio_f}
                              onValueChange={(value) => setFormData({ ...formData, bonus_criterio_f: value })}
                              min={0}
                              max={5}
                              step={0.1}
                              className="flex-1"
                            />
                            <span className="text-lg font-semibold min-w-[60px] text-center">{formData.bonus_criterio_f[0].toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="space-y-2 border rounded-lg p-4 bg-blue-50">
                          <Label>Critério G - Agente cultural negro ou indígena (Máx: 5 pontos)</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={formData.bonus_criterio_g}
                              onValueChange={(value) => setFormData({ ...formData, bonus_criterio_g: value })}
                              min={0}
                              max={5}
                              step={0.1}
                              className="flex-1"
                            />
                            <span className="text-lg font-semibold min-w-[60px] text-center">{formData.bonus_criterio_g[0].toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="space-y-2 border rounded-lg p-4 bg-blue-50">
                          <Label>Critério H - Agente cultural com deficiência (Máx: 5 pontos)</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={formData.bonus_criterio_h}
                              onValueChange={(value) => setFormData({ ...formData, bonus_criterio_h: value })}
                              min={0}
                              max={5}
                              step={0.1}
                              className="flex-1"
                            />
                            <span className="text-lg font-semibold min-w-[60px] text-center">{formData.bonus_criterio_h[0].toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="space-y-2 border rounded-lg p-4 bg-blue-50">
                          <Label>Critério I - Agente cultural de região de menor IDH (Máx: 5 pontos)</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={formData.bonus_criterio_i}
                              onValueChange={(value) => setFormData({ ...formData, bonus_criterio_i: value })}
                              min={0}
                              max={5}
                              step={0.1}
                              className="flex-1"
                            />
                            <span className="text-lg font-semibold min-w-[60px] text-center">{formData.bonus_criterio_i[0].toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Parecer Técnico */}
                    <div>
                      <Label htmlFor="parecer_tecnico">Parecer Técnico</Label>
                      <Textarea
                        id="parecer_tecnico"
                        rows={6}
                        value={formData.parecer_tecnico}
                        onChange={(e) => setFormData({ ...formData, parecer_tecnico: e.target.value })}
                        placeholder="Digite o parecer técnico"
                      />
                    </div>

                    {/* Pontuação Total */}
                    <div className="pt-4 border-t">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-semibold text-blue-900">Pontuação Total</Label>
                          <span className="text-3xl font-bold text-blue-600">
                            {(() => {
                              const somaObrigatorios = formData.nota_criterio_a[0] + formData.nota_criterio_b[0] + formData.nota_criterio_c[0] + formData.nota_criterio_d[0] + formData.nota_criterio_e[0];
                              const somaBonus = formData.bonus_criterio_f[0] + formData.bonus_criterio_g[0] + formData.bonus_criterio_h[0] + formData.bonus_criterio_i[0];
                              return (somaObrigatorios + somaBonus).toFixed(1);
                            })()} pts
                          </span>
                        </div>
                        
                      </div>
                    </div>

                    {/* Botão de Enviar */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button onClick={handleConfirmarSalvarAvaliacao} disabled={salvando}>
                        {salvando ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Enviar Avaliação
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Status da Avaliação</Label>
                        <div className="mt-2">
                          <Badge className={getAvaliacaoStatusConfig(avaliacao.status).color}>
                            {getAvaliacaoStatusConfig(avaliacao.status).label}
                          </Badge>
                        </div>
                      </div>
                      {avaliacao.nota_final !== null && avaliacao.nota_final !== undefined && (
                        <div className="text-right">
                          <Label className="text-base font-semibold">Nota Final</Label>
                          <div className="mt-2 text-3xl font-bold text-green-600">
                            {avaliacao.nota_final.toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Critérios Obrigatórios - Visualização */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Critérios Obrigatórios</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {avaliacao.nota_criterio_a !== null && avaliacao.nota_criterio_a !== undefined && (
                          <div className="border rounded-lg p-4">
                            <Label className="text-sm text-gray-500">Critério A - Qualidade do Projeto (Máx: 10 pontos)</Label>
                            <p className="text-2xl font-semibold">{avaliacao.nota_criterio_a.toFixed(1)}</p>
                            {avaliacao.obs_criterio_a && (
                              <p className="text-sm text-gray-600 mt-2">{avaliacao.obs_criterio_a}</p>
                            )}
                          </div>
                        )}
                        {avaliacao.nota_criterio_b !== null && avaliacao.nota_criterio_b !== undefined && (
                          <div className="border rounded-lg p-4">
                            <Label className="text-sm text-gray-500">Critério B - Relevância Cultural (Máx: 10 pontos)</Label>
                            <p className="text-2xl font-semibold">{avaliacao.nota_criterio_b.toFixed(1)}</p>
                            {avaliacao.obs_criterio_b && (
                              <p className="text-sm text-gray-600 mt-2">{avaliacao.obs_criterio_b}</p>
                            )}
                          </div>
                        )}
                        {avaliacao.nota_criterio_c !== null && avaliacao.nota_criterio_c !== undefined && (
                          <div className="border rounded-lg p-4">
                            <Label className="text-sm text-gray-500">Critério C - Integração Comunitária (Máx: 10 pontos)</Label>
                            <p className="text-2xl font-semibold">{avaliacao.nota_criterio_c.toFixed(1)}</p>
                            {avaliacao.obs_criterio_c && (
                              <p className="text-sm text-gray-600 mt-2">{avaliacao.obs_criterio_c}</p>
                            )}
                          </div>
                        )}
                        {avaliacao.nota_criterio_d !== null && avaliacao.nota_criterio_d !== undefined && (
                          <div className="border rounded-lg p-4">
                            <Label className="text-sm text-gray-500">Critério D - Trajetória Artística (Máx: 10 pontos)</Label>
                            <p className="text-2xl font-semibold">{avaliacao.nota_criterio_d.toFixed(1)}</p>
                            {avaliacao.obs_criterio_d && (
                              <p className="text-sm text-gray-600 mt-2">{avaliacao.obs_criterio_d}</p>
                            )}
                          </div>
                        )}
                        {avaliacao.nota_criterio_e !== null && avaliacao.nota_criterio_e !== undefined && (
                          <div className="border rounded-lg p-4">
                            <Label className="text-sm text-gray-500">Critério E - Promoção de Diversidade (Máx: 10 pontos)</Label>
                            <p className="text-2xl font-semibold">{avaliacao.nota_criterio_e.toFixed(1)}</p>
                            {avaliacao.obs_criterio_e && (
                              <p className="text-sm text-gray-600 mt-2">{avaliacao.obs_criterio_e}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Critérios Bônus - Visualização */}
                      {(avaliacao.bonus_criterio_f || avaliacao.bonus_criterio_g || avaliacao.bonus_criterio_h || avaliacao.bonus_criterio_i) && (
                        <div className="space-y-2 mt-6">
                          <h3 className="font-semibold text-gray-900">Critérios Bônus (Opcionais)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {avaliacao.bonus_criterio_f !== null && avaliacao.bonus_criterio_f !== undefined && avaliacao.bonus_criterio_f > 0 && (
                              <div className="border rounded-lg p-4 bg-blue-50">
                                <Label className="text-sm text-gray-500">Critério F - Agente cultural do gênero feminino (Máx: 5 pontos)</Label>
                                <p className="text-2xl font-semibold">{avaliacao.bonus_criterio_f.toFixed(1)}</p>
                              </div>
                            )}
                            {avaliacao.bonus_criterio_g !== null && avaliacao.bonus_criterio_g !== undefined && avaliacao.bonus_criterio_g > 0 && (
                              <div className="border rounded-lg p-4 bg-blue-50">
                                <Label className="text-sm text-gray-500">Critério G - Agente cultural negro ou indígena (Máx: 5 pontos)</Label>
                                <p className="text-2xl font-semibold">{avaliacao.bonus_criterio_g.toFixed(1)}</p>
                              </div>
                            )}
                            {avaliacao.bonus_criterio_h !== null && avaliacao.bonus_criterio_h !== undefined && avaliacao.bonus_criterio_h > 0 && (
                              <div className="border rounded-lg p-4 bg-blue-50">
                                <Label className="text-sm text-gray-500">Critério H - Agente cultural com deficiência (Máx: 5 pontos)</Label>
                                <p className="text-2xl font-semibold">{avaliacao.bonus_criterio_h.toFixed(1)}</p>
                              </div>
                            )}
                            {avaliacao.bonus_criterio_i !== null && avaliacao.bonus_criterio_i !== undefined && avaliacao.bonus_criterio_i > 0 && (
                              <div className="border rounded-lg p-4 bg-blue-50">
                                <Label className="text-sm text-gray-500">Critério I - Agente cultural de região de menor IDH (Máx: 5 pontos)</Label>
                                <p className="text-2xl font-semibold">{avaliacao.bonus_criterio_i.toFixed(1)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {avaliacao.parecer_tecnico && (
                      <div>
                        <Label className="text-base font-semibold">Parecer Técnico</Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{avaliacao.parecer_tecnico}</p>
                        </div>
                      </div>
                    )}

                    {avaliacao.motivo_rejeicao && (
                      <div>
                        <Label className="text-base font-semibold">Motivo de Rejeição</Label>
                        <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{avaliacao.motivo_rejeicao}</p>
                        </div>
                      </div>
                    )}

                    {avaliacao.data_atribuicao && (
                      <div className="text-sm text-gray-500">
                        <strong>Atribuído em:</strong> {formatarData(avaliacao.data_atribuicao)}
                      </div>
                    )}
                    {avaliacao.data_inicio_avaliacao && (
                      <div className="text-sm text-gray-500">
                        <strong>Início da avaliação:</strong> {formatarData(avaliacao.data_inicio_avaliacao)}
                      </div>
                    )}
                    {avaliacao.data_conclusao && (
                      <div className="text-sm text-gray-500">
                        <strong>Concluído em:</strong> {formatarData(avaliacao.data_conclusao)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Rejeição */}
        <Dialog open={showRejeicaoModal} onOpenChange={setShowRejeicaoModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Motivo de Rejeição</DialogTitle>
              <DialogDescription>
                Por favor, informe o motivo da rejeição deste projeto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="motivo_rejeicao">Motivo da Rejeição *</Label>
                <Textarea
                  id="motivo_rejeicao"
                  placeholder="Descreva o motivo da rejeição..."
                  rows={4}
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRejeicaoModal(false);
                  setMotivoRejeicao('');
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (motivoRejeicao.trim()) {
                    await handleSalvarAvaliacao(motivoRejeicao);
                    setMotivoRejeicao('');
                  }
                }}
                disabled={!motivoRejeicao.trim() || salvando}
              >
                {salvando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Confirmar Rejeição
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PareceristaLayout>
  );
};

