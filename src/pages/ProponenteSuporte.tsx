import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  Plus,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  Search,
  Eye,
  FileText,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import { getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useRecursos } from "@/hooks/useRecursos";
import { recursosService } from "@/services/recursosService";

interface Duvida {
  id: number;
  pergunta: string;
  resposta?: string;
  prefeitura_id: string;
  proponente_id?: string;
  parecerista_id?: string;
  fechada: boolean;
  respondida_por?: string;
  modalidade?: string;
  edital_id?: string;
  created_at: string;
}

interface Edital {
  id: string;
  codigo: string;
  nome: string;
  status: string;
}

interface Projeto {
  id: string;
  nome: string;
  edital_id: string;
  proponente_id?: string;
  edital?: {
    id: string;
    codigo: string;
    nome: string;
    status: string;
  };
}

export const ProponenteSuporte = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const { toast } = useToast();
  const { proponente, prefeitura } = useProponenteAuth();
  
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [todosProjetos, setTodosProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModalNovaDuvida, setShowModalNovaDuvida] = useState(false);
  const [showModalResposta, setShowModalResposta] = useState(false);
  const [showModalRecurso, setShowModalRecurso] = useState(false);
  const [duvidaSelecionada, setDuvidaSelecionada] = useState<Duvida | null>(null);
  const [activeTab, setActiveTab] = useState<'duvidas' | 'recursos' | 'contra_razao'>('duvidas');
  
  // Form states para dúvidas
  const [novaPergunta, setNovaPergunta] = useState('');
  const [editalSelecionado, setEditalSelecionado] = useState<string>('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todas' | 'abertas' | 'fechadas'>('todas');

  // Form states para recursos
  const [editalRecursoSelecionado, setEditalRecursoSelecionado] = useState<string>('');
  const [projetoRecursoSelecionado, setProjetoRecursoSelecionado] = useState<string>('');
  const [tipoRecurso, setTipoRecurso] = useState<'recurso' | 'contra_razao'>('recurso');
  const [justificativaRecurso, setJustificativaRecurso] = useState('');
  
  // Hook para recursos
  const { recursos, loading: loadingRecursos, createRecurso, refresh: refreshRecursos } = useRecursos(proponente?.id);
  
  const modalidades = [
    'Dúvida sobre edital',
    'Dúvida sobre projeto',
    'Dúvida sobre documentação',
    'Dúvida sobre prestação de contas',
    'Outro'
  ];


  useEffect(() => {
    if (proponente?.id && prefeitura?.id) {
      carregarDuvidas();
      carregarEditais();
      carregarProjetos();
    }
  }, [proponente?.id, prefeitura?.id]);

  // Verificar se há editais que permitem recursos
  const editaisPermitemRecursos = editais.filter(e => e.status === 'recurso');
  const editaisPermitemContraRazao = editais.filter(e => e.status === 'contra_razao');

  // Verificar se deve mostrar opção de recursos ou contrarrazão
  const permiteRecursos = editaisPermitemRecursos.length > 0;
  const permiteContraRazao = editaisPermitemContraRazao.length > 0;

  const carregarEditais = async () => {
    try {
      const client = getAuthenticatedSupabaseClient('proponente');
      const { data, error } = await client
        .from('editais')
        .select('id, codigo, nome, status')
        .eq('prefeitura_id', prefeitura?.id)
        .order('nome');

      if (error) throw error;
      setEditais(data || []);
    } catch (error) {
      console.error('Erro ao carregar editais:', error);
    }
  };

  const carregarProjetos = async () => {
    try {
      if (!proponente?.id) return;

      const client = getAuthenticatedSupabaseClient('proponente');
      const { data: proponentesData } = await (client as any)
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);

      if (!proponentesData || proponentesData.length === 0) {
        setTodosProjetos([]);
        setProjetos([]);
        return;
      }

      const proponenteIds = proponentesData.map((p: any) => p.id);

      const { data, error } = await (client as any)
        .from('projetos')
        .select(`
          id,
          nome,
          edital_id,
          proponente_id,
          edital:editais (
            id,
            codigo,
            nome,
            status
          )
        `)
        .in('proponente_id', proponenteIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrar apenas projetos de editais que permitem recursos
      const projetosFiltrados: Projeto[] = ((data || []) as any[]).filter((p: any) => {
        const editalStatus = p.edital?.status;
        return editalStatus === 'recurso' || editalStatus === 'contra_razao';
      }).map((p: any) => ({
        id: p.id,
        nome: p.nome,
        edital_id: p.edital_id,
        proponente_id: p.proponente_id,
        edital: p.edital ? {
          id: p.edital.id,
          codigo: p.edital.codigo,
          nome: p.edital.nome,
          status: p.edital.status
        } : undefined
      }));

      setTodosProjetos(projetosFiltrados);
      
      // Inicializar projetos vazios - serão filtrados quando necessário
      setProjetos([]);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  // Atualizar lista de projetos quando tipo de recurso ou aba mudar
  useEffect(() => {
    if (todosProjetos.length > 0) {
      if (activeTab === 'recursos') {
        const projetosRecurso = todosProjetos.filter(p => p.edital?.status === 'recurso');
        setProjetos(projetosRecurso);
        setTipoRecurso('recurso');
      } else if (activeTab === 'contra_razao') {
        const projetosContraRazao = todosProjetos.filter(p => p.edital?.status === 'contra_razao');
        setProjetos(projetosContraRazao);
        setTipoRecurso('contra_razao');
      } else {
        setProjetos([]);
      }
    } else {
      setProjetos([]);
    }
  }, [activeTab, todosProjetos]);

  // Filtrar projetos quando edital for selecionado
  const projetosDoEdital = editalRecursoSelecionado 
    ? projetos.filter(p => p.edital_id === editalRecursoSelecionado)
    : projetos;

  const carregarDuvidas = async () => {
    try {
      setLoading(true);
      
      const client = getAuthenticatedSupabaseClient('proponente');
      const { data, error } = await (client as any)
        .from('duvidas')
        .select('*')
        .eq('proponente_id', proponente?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDuvidas(data || []);
    } catch (error) {
      console.error('Erro ao carregar dúvidas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as dúvidas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCriarDuvida = async () => {
    if (!novaPergunta.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe sua dúvida.",
        variant: "destructive",
      });
      return;
    }

    if (!proponente?.id || !prefeitura?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const duvidaData: any = {
        pergunta: novaPergunta.trim(),
        prefeitura_id: prefeitura.id,
        proponente_id: proponente.id,
        fechada: false,
      };

      if (editalSelecionado && editalSelecionado !== 'nenhum') {
        duvidaData.edital_id = editalSelecionado;
      }

      if (categoriaSelecionada) {
        duvidaData.modalidade = categoriaSelecionada;
      }

      const client = getAuthenticatedSupabaseClient('proponente');
      const { error } = await (client as any)
        .from('duvidas')
        .insert([duvidaData]);

      if (error) throw error;

      toast({
        title: "Dúvida enviada!",
        description: "Sua dúvida foi enviada com sucesso. Aguarde a resposta da prefeitura.",
      });

      // Reset form
      setNovaPergunta('');
      setEditalSelecionado('');
      setCategoriaSelecionada('');
      setShowModalNovaDuvida(false);
      
      // Reload dúvidas
      carregarDuvidas();
    } catch (error: any) {
      console.error('Erro ao criar dúvida:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar sua dúvida.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerResposta = (duvida: Duvida) => {
    setDuvidaSelecionada(duvida);
    setShowModalResposta(true);
  };

  const handleCriarRecurso = async () => {
    if (!justificativaRecurso.trim() || !projetoRecursoSelecionado || !editalRecursoSelecionado) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um edital, um projeto e informe a justificativa do recurso.",
        variant: "destructive",
      });
      return;
    }

    if (!proponente?.id || !prefeitura?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    // Buscar projeto selecionado para obter proponente_id e validar edital
    const projetoSelecionado = projetosDoEdital.find(p => p.id === projetoRecursoSelecionado);
    if (!projetoSelecionado) {
      toast({
        title: "Erro",
        description: "Projeto não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o edital selecionado corresponde ao projeto
    if (projetoSelecionado.edital_id !== editalRecursoSelecionado) {
      toast({
        title: "Erro",
        description: "O projeto selecionado não pertence ao edital escolhido.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o edital permite o tipo de recurso selecionado
    const editalStatus = projetoSelecionado.edital?.status;
    if (tipoRecurso === 'recurso' && editalStatus !== 'recurso') {
      toast({
        title: "Erro",
        description: "O edital não está na fase de recursos.",
        variant: "destructive",
      });
      return;
    }
    if (tipoRecurso === 'contra_razao' && editalStatus !== 'contra_razao') {
      toast({
        title: "Erro",
        description: "O edital não está na fase de contrarrazão.",
        variant: "destructive",
      });
      return;
    }

    // Obter o proponente_id do projeto
    if (!projetoSelecionado.proponente_id) {
      toast({
        title: "Erro",
        description: "Projeto sem proponente associado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const sucesso = await createRecurso({
        prefeitura_id: prefeitura.id,
        projeto_id: projetoRecursoSelecionado,
        proponente_id: projetoSelecionado.proponente_id,
        tipo: tipoRecurso,
        justificativa: justificativaRecurso.trim()
      });

      if (sucesso) {
        // Reset form
        setEditalRecursoSelecionado('');
        setProjetoRecursoSelecionado('');
        setJustificativaRecurso('');
        setShowModalRecurso(false);
        // Recarregar recursos
        await refreshRecursos();
      }
    } catch (error: any) {
      console.error('Erro ao criar recurso:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o recurso.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const duvidasFiltradas = duvidas.filter(duvida => {
    // Filtro por status
    if (filterStatus === 'abertas' && duvida.fechada) return false;
    if (filterStatus === 'fechadas' && !duvida.fechada) return false;
    
    // Filtro por termo de busca
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      return duvida.pergunta.toLowerCase().includes(termo) ||
             duvida.resposta?.toLowerCase().includes(termo);
    }
    
    return true;
  });

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProponenteLayout 
        title="Comunicação"
        description="Entre em contato para dúvidas, recursos e Contrarrazões"
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </ProponenteLayout>
    );
  }

  const recursosFiltrados = recursos.filter(recurso => {
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      return recurso.justificativa.toLowerCase().includes(termo) ||
             recurso.resposta?.toLowerCase().includes(termo);
    }
    return true;
  });

  return (
    <ProponenteLayout 
      title="Comunicação"
      description="Entre em contato para dúvidas, recursos e Contrarrazões"
    >
      <Card className="p-6 space-y-4">

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'duvidas' | 'recursos' | 'contra_razao')}>
          <TabsList>
            <TabsTrigger value="duvidas">
              <MessageCircle className="h-4 w-4 mr-2" />
              Dúvidas
            </TabsTrigger>
            {permiteRecursos && (
              <TabsTrigger value="recursos">
                <FileText className="h-4 w-4 mr-2" />
                Recursos
              </TabsTrigger>
            )}
            {permiteContraRazao && (
              <TabsTrigger value="contra_razao">
                <FileText className="h-4 w-4 mr-2" />
                Contrarrazão
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab de Dúvidas */}
          <TabsContent value="duvidas" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Minhas Dúvidas</h3>
                <p className="text-sm text-gray-600">Envie suas dúvidas e acompanhe as respostas</p>
              </div>
              <Button onClick={() => setShowModalNovaDuvida(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Dúvida
              </Button>
            </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por texto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="abertas">Abertas</SelectItem>
              <SelectItem value="fechadas">Respondidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Dúvidas */}
        {duvidasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-center">
                {duvidas.length === 0 
                  ? "Você ainda não possui dúvidas cadastradas."
                  : "Nenhuma dúvida encontrada com os filtros aplicados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {duvidasFiltradas.map((duvida) => (
              <Card key={duvida.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={duvida.fechada ? "default" : "secondary"}
                          className={duvida.fechada ? "bg-green-600" : ""}
                        >
                          {duvida.fechada ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Respondida</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Aguardando</>
                          )}
                        </Badge>
                        {duvida.modalidade && (
                          <Badge variant="outline" className="text-xs">
                            {duvida.modalidade}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatarData(duvida.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 font-medium mb-1">{duvida.pergunta}</p>
                      
                      {duvida.fechada && duvida.resposta && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold text-green-700">Resposta:</span>
                            <br />
                            {duvida.resposta}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Nova Dúvida */}
        <Dialog open={showModalNovaDuvida} onOpenChange={setShowModalNovaDuvida}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Dúvida</DialogTitle>
              <DialogDescription>
                Envie sua dúvida para a prefeitura. Selecione o edital relacionado, se aplicável.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="modalidade">Categoria</Label>
                <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidades.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edital">Edital</Label>
                <Select value={editalSelecionado} onValueChange={setEditalSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o edital (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum (Dúvida geral)</SelectItem>
                    {editais.map((edital) => (
                      <SelectItem key={edital.id} value={edital.id}>
                        {edital.codigo} - {edital.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pergunta">Sua Dúvida *</Label>
                <Textarea
                  id="pergunta"
                  placeholder="Descreva sua dúvida aqui..."
                  value={novaPergunta}
                  onChange={(e) => setNovaPergunta(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowModalNovaDuvida(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCriarDuvida}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Enviar Dúvida</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Ver Resposta */}
        <Dialog open={showModalResposta} onOpenChange={setShowModalResposta}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Resposta da Prefeitura</DialogTitle>
              <DialogDescription>
                Visualize a resposta para sua dúvida
              </DialogDescription>
            </DialogHeader>
            
            {duvidaSelecionada && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Sua Pergunta</Label>
                  <div className="p-3 bg-gray-50 border rounded-md">
                    <p className="text-sm text-gray-900">{duvidaSelecionada.pergunta}</p>
                  </div>
                </div>

                <div>
                  <Label>Resposta</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-gray-900">{duvidaSelecionada.resposta}</p>
                  </div>
                </div>

                <div>
                  <Label>Data de Envio</Label>
                  <p className="text-sm text-gray-600">
                    {formatarData(duvidaSelecionada.created_at)}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setShowModalResposta(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </TabsContent>

          {/* Tab de Recursos */}
          {permiteRecursos && (
            <TabsContent value="recursos" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Recursos</h3>
                  <p className="text-sm text-gray-600">
                    Envie recursos sobre projetos avaliados
                  </p>
                  {editaisPermitemRecursos.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Editais disponíveis: {editaisPermitemRecursos.map(e => e.codigo).join(', ')}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => {
                    setTipoRecurso('recurso');
                    setEditalRecursoSelecionado('');
                    setProjetoRecursoSelecionado('');
                    setJustificativaRecurso('');
                    setShowModalRecurso(true);
                  }}
                  disabled={projetos.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Recurso
                </Button>
              </div>

              {/* Aviso se não há projetos disponíveis */}
              {projetos.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-16 w-16 text-yellow-300 mb-4" />
                    <p className="text-gray-600 text-center">
                      Você não possui projetos elegíveis para recursos/contrarrazão no momento.
                      <br />
                      Recursos e Contrarrazões só podem ser criados para projetos de editais nas fases correspondentes.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Lista de Recursos */}
              {loadingRecursos ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : recursosFiltrados.filter(r => r.tipo === 'recurso').length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-600 text-center">
                      {recursos.filter(r => r.tipo === 'recurso').length === 0 
                        ? "Você ainda não possui recursos cadastrados."
                        : "Nenhum recurso encontrado com os filtros aplicados."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recursosFiltrados.filter(r => r.tipo === 'recurso').map((recurso) => (
                    <Card key={recurso.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={recurso.status === 'deferido' ? 'default' : 
                                        recurso.status === 'indeferido' ? 'destructive' : 'secondary'}
                                className={
                                  recurso.status === 'deferido' ? 'bg-green-600' :
                                  recurso.status === 'indeferido' ? 'bg-red-600' :
                                  'bg-yellow-500'
                                }
                              >
                                {recurso.status === 'pendente' && 'Pendente'}
                                {recurso.status === 'em_analise' && 'Em Análise'}
                                {recurso.status === 'deferido' && <><CheckCircle2 className="h-3 w-3 mr-1" /> Deferido</>}
                                {recurso.status === 'indeferido' && <><XCircle className="h-3 w-3 mr-1" /> Indeferido</>}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Recurso
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatarData(recurso.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-gray-900 font-medium mb-2">{recurso.justificativa}</p>
                            
                            {recurso.resposta && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-blue-700">Resposta:</span>
                                  <br />
                                  {recurso.resposta}
                                </p>
                                {recurso.data_resposta && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Respondido em: {formatarData(recurso.data_resposta)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Tab de Contrarrazão */}
          {permiteContraRazao && (
            <TabsContent value="contra_razao" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Contrarrazões</h3>
                  <p className="text-sm text-gray-600">
                    Envie Contrarrazões sobre projetos avaliados
                  </p>
                  {editaisPermitemContraRazao.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Editais disponíveis: {editaisPermitemContraRazao.map(e => e.codigo).join(', ')}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => {
                    setTipoRecurso('contra_razao');
                    setEditalRecursoSelecionado('');
                    setProjetoRecursoSelecionado('');
                    setJustificativaRecurso('');
                    setShowModalRecurso(true);
                  }}
                  disabled={projetos.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Contrarrazão
                </Button>
              </div>

              {/* Aviso se não há projetos disponíveis */}
              {projetos.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-16 w-16 text-yellow-300 mb-4" />
                    <p className="text-gray-600 text-center">
                      Você não possui projetos elegíveis para contrarrazão no momento.
                      <br />
                      Contrarrazões só podem ser criadas para projetos de editais na fase de contrarrazão.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Lista de Contrarrazões */}
              {loadingRecursos ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : recursosFiltrados.filter(r => r.tipo === 'contra_razao').length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-600 text-center">
                      {recursos.filter(r => r.tipo === 'contra_razao').length === 0 
                        ? "Você ainda não possui Contrarrazões cadastradas."
                        : "Nenhuma contrarrazão encontrada com os filtros aplicados."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recursosFiltrados.filter(r => r.tipo === 'contra_razao').map((recurso) => (
                    <Card key={recurso.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={recurso.status === 'deferido' ? 'default' : 
                                        recurso.status === 'indeferido' ? 'destructive' : 'secondary'}
                                className={
                                  recurso.status === 'deferido' ? 'bg-green-600' :
                                  recurso.status === 'indeferido' ? 'bg-red-600' :
                                  'bg-yellow-500'
                                }
                              >
                                {recurso.status === 'pendente' && 'Pendente'}
                                {recurso.status === 'em_analise' && 'Em Análise'}
                                {recurso.status === 'deferido' && <><CheckCircle2 className="h-3 w-3 mr-1" /> Deferido</>}
                                {recurso.status === 'indeferido' && <><XCircle className="h-3 w-3 mr-1" /> Indeferido</>}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Contrarrazão
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatarData(recurso.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-gray-900 font-medium mb-2">{recurso.justificativa}</p>
                            
                            {recurso.resposta && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-blue-700">Resposta:</span>
                                  <br />
                                  {recurso.resposta}
                                </p>
                                {recurso.data_resposta && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Respondido em: {formatarData(recurso.data_resposta)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Modal Novo Recurso */}
        <Dialog open={showModalRecurso} onOpenChange={setShowModalRecurso}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo {tipoRecurso === 'recurso' ? 'Recurso' : 'Contrarrazão'}</DialogTitle>
              <DialogDescription>
                {tipoRecurso === 'recurso' 
                  ? 'Envie um recurso sobre a avaliação do seu projeto ou de outro projeto.'
                  : 'Envie uma contrarrazão sobre a avaliação do seu projeto ou de outro projeto.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edital-recurso">Edital *</Label>
                <Select 
                  value={editalRecursoSelecionado} 
                  onValueChange={(value) => {
                    setEditalRecursoSelecionado(value);
                    setProjetoRecursoSelecionado(''); // Reset projeto quando edital mudar
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o edital" />
                  </SelectTrigger>
                  <SelectContent>
                    {(tipoRecurso === 'recurso' ? editaisPermitemRecursos : editaisPermitemContraRazao).map((edital) => (
                      <SelectItem key={edital.id} value={edital.id}>
                        {edital.codigo} - {edital.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione o edital que está na fase de {tipoRecurso === 'recurso' ? 'recursos' : 'contrarrazão'}
                </p>
              </div>

              <div>
                <Label htmlFor="projeto-recurso">Projeto *</Label>
                <Select 
                  value={projetoRecursoSelecionado} 
                  onValueChange={setProjetoRecursoSelecionado}
                  disabled={!editalRecursoSelecionado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={editalRecursoSelecionado ? "Selecione o projeto" : "Primeiro selecione um edital"} />
                  </SelectTrigger>
                  <SelectContent>
                    {projetosDoEdital.map((projeto) => (
                      <SelectItem key={projeto.id} value={projeto.id}>
                        {projeto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {editalRecursoSelecionado 
                    ? projetosDoEdital.length === 0 
                      ? "Você não possui projetos neste edital."
                      : `Selecione o projeto que você deseja questionar (${projetosDoEdital.length} projeto(s) disponível(is))`
                    : "Primeiro selecione um edital para ver os projetos disponíveis"}
                </p>
              </div>

              <div>
                <Label htmlFor="justificativa-recurso">Justificativa *</Label>
                <Textarea
                  id="justificativa-recurso"
                  placeholder={`Descreva a justificativa do ${tipoRecurso === 'recurso' ? 'recurso' : 'contrarrazão'}...`}
                  value={justificativaRecurso}
                  onChange={(e) => setJustificativaRecurso(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowModalRecurso(false);
                  setEditalRecursoSelecionado('');
                  setProjetoRecursoSelecionado('');
                  setJustificativaRecurso('');
                  // Reset tipo baseado na aba ativa
                  if (activeTab === 'recursos') {
                    setTipoRecurso('recurso');
                  } else if (activeTab === 'contra_razao') {
                    setTipoRecurso('contra_razao');
                  }
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCriarRecurso}
                disabled={isSubmitting || !editalRecursoSelecionado || !projetoRecursoSelecionado || !justificativaRecurso.trim()}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Enviar {tipoRecurso === 'recurso' ? 'Recurso' : 'Contrarrazão'}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </ProponenteLayout>
  );
};