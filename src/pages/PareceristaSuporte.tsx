import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Search, Loader2, Send, CheckCircle2, XCircle } from "lucide-react";
import { PareceristaLayout } from "@/components/layout/PareceristaLayout";
import { usePareceristaAuth } from "@/hooks/usePareceristaAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Duvida {
  id: string;
  pergunta: string;
  resposta?: string;
  categoria?: string;
  edital_id?: string;
  fechada: boolean;
  created_at: string;
  updated_at: string;
}

interface Edital {
  id: string;
  nome: string;
  codigo: string;
}

export const PareceristaSuporte = () => {
  const { nomePrefeitura, editalId } = useParams<{ nomePrefeitura: string; editalId: string }>();
  const { parecerista, prefeitura } = usePareceristaAuth();
  const { toast } = useToast();
  
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'todas' | 'abertas' | 'fechadas'>('todas');
  
  const [formData, setFormData] = useState({
    pergunta: "",
    categoria: "",
    edital_selecionado: editalId || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = [
    'Dúvida sobre edital',
    'Dúvida sobre projeto',
    'Dúvida sobre documentação',
    'Dúvida sobre prestação de contas',
    'Outro'
  ];

  useEffect(() => {
    const carregarDuvidas = async () => {
      if (!parecerista || !editalId) return;

      try {
        setLoading(true);
        
        // Buscar dúvidas do parecerista para este edital
        const { data, error } = await supabase
          .from('duvidas')
          .select('*')
          .eq('parecerista_id', parecerista.id)
          .eq('edital_id', editalId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDuvidas(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar dúvidas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dúvidas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const carregarEditais = async () => {
      if (!prefeitura?.id || !editalId) return;

      try {
        // Buscar todos os editais da prefeitura
        const { data, error } = await supabase
          .from('editais')
          .select('id, codigo, nome')
          .eq('prefeitura_id', prefeitura.id)
          .eq('status', 'ativo')
          .order('nome');

        if (error) throw error;
        setEditais(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar editais:', error);
      }
    };

    carregarDuvidas();
    carregarEditais();
  }, [parecerista, prefeitura, editalId, toast]);

  const handleAbrirModal = () => {
    setFormData({
      pergunta: "",
      categoria: "",
      edital_selecionado: editalId || ""
    });
    setShowModal(true);
  };

  const handleCriarDuvida = async () => {
    if (!formData.pergunta.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe sua dúvida.",
        variant: "destructive",
      });
      return;
    }

    if (!parecerista?.id || !prefeitura?.id) {
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
        pergunta: formData.pergunta.trim(),
        prefeitura_id: prefeitura.id,
        parecerista_id: parecerista.id,
        edital_id: editalId,
        fechada: false,
      };

      if (formData.edital_selecionado && formData.edital_selecionado !== 'nenhum' && formData.edital_selecionado !== editalId) {
        duvidaData.edital_id = formData.edital_selecionado;
      }

      if (formData.categoria) {
        duvidaData.categoria = formData.categoria;
      }

      const { error } = await supabase
        .from('duvidas')
        .insert([duvidaData]);

      if (error) throw error;

      toast({
        title: "Dúvida enviada!",
        description: "Sua dúvida foi enviada com sucesso. Aguarde a resposta da prefeitura.",
      });

      // Reset form
      setFormData({
        pergunta: "",
        categoria: "",
        edital_selecionado: editalId || ""
      });
      setShowModal(false);
      
      // Reload dúvidas
      const { data, error: fetchError } = await supabase
        .from('duvidas')
        .select('*')
        .eq('parecerista_id', parecerista.id)
        .eq('edital_id', editalId)
        .order('created_at', { ascending: false });

      if (!fetchError && data) {
        setDuvidas(data);
      }
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

  const filteredDuvidas = duvidas.filter(duvida => {
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
      <PareceristaLayout
        title="Suporte"
        description="Entre em contato com o suporte para dúvidas e solicitações"
        editalId={editalId}
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </PareceristaLayout>
    );
  }

  return (
    <PareceristaLayout
      title="Suporte"
      description="Entre em contato com o suporte para dúvidas e solicitações"
      editalId={editalId}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Meus Tickets</h2>
            <p className="text-gray-600">Envie suas dúvidas e acompanhe as respostas</p>
          </div>
          <Button onClick={handleAbrirModal}>
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
        {filteredDuvidas.length === 0 ? (
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
            {filteredDuvidas.map((duvida) => (
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
        <Dialog open={showModal} onOpenChange={setShowModal}>
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
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
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
                <Select value={formData.edital_selecionado} onValueChange={(value) => setFormData({ ...formData, edital_selecionado: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o edital (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={editalId}>Edital Atual (padrão)</SelectItem>
                    {editais.filter(e => e.id !== editalId).map((edital) => (
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
                  value={formData.pergunta}
                  onChange={(e) => setFormData({ ...formData, pergunta: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
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
      </div>
    </PareceristaLayout>
  );
};

