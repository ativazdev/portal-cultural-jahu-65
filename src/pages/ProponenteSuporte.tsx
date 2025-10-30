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
import { 
  HelpCircle, 
  Plus,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  Search,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';

interface Duvida {
  id: number;
  pergunta: string;
  resposta?: string;
  prefeitura_id: string;
  proponente_id?: string;
  parecerista_id?: string;
  fechada: boolean;
  respondida_por?: string;
  categoria?: string;
  edital_id?: string;
  created_at: string;
}

interface Edital {
  id: string;
  codigo: string;
  nome: string;
}

export const ProponenteSuporte = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const { toast } = useToast();
  const { proponente, prefeitura } = useProponenteAuth();
  
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModalNovaDuvida, setShowModalNovaDuvida] = useState(false);
  const [showModalResposta, setShowModalResposta] = useState(false);
  const [duvidaSelecionada, setDuvidaSelecionada] = useState<Duvida | null>(null);
  
  // Form states
  const [novaPergunta, setNovaPergunta] = useState('');
  const [editalSelecionado, setEditalSelecionado] = useState<string>('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todas' | 'abertas' | 'fechadas'>('todas');
  
  const categorias = [
    'Dúvida sobre edital',
    'Dúvida sobre projeto',
    'Dúvida sobre documentação',
    'Dúvida sobre prestação de contas',
    'Outro'
  ];

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

  useEffect(() => {
    if (proponente?.id && prefeitura?.id) {
      carregarDuvidas();
      carregarEditais();
    }
  }, [proponente?.id, prefeitura?.id]);

  const carregarEditais = async () => {
    try {
      const client = getAuthenticatedClient();
      const { data, error } = await client
        .from('editais')
        .select('id, codigo, nome')
        .eq('prefeitura_id', prefeitura?.id)
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setEditais(data || []);
    } catch (error) {
      console.error('Erro ao carregar editais:', error);
    }
  };

  const carregarDuvidas = async () => {
    try {
      setLoading(true);
      
      const client = getAuthenticatedClient();
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
        duvidaData.categoria = categoriaSelecionada;
      }

      const client = getAuthenticatedClient();
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
        title="Suporte"
        description="Entre em contato com o suporte para dúvidas e solicitações"
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </ProponenteLayout>
    );
  }

  return (
    <ProponenteLayout 
      title="Suporte"
      description="Entre em contato com o suporte para dúvidas e solicitações"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Meus Tickets</h2>
            <p className="text-gray-600">Envie suas dúvidas e acompanhe as respostas</p>
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
                        {duvida.categoria && (
                          <Badge variant="outline" className="text-xs">
                            {duvida.categoria}
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
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
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
      </div>
    </ProponenteLayout>
  );
};