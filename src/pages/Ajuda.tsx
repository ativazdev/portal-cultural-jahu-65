import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PareceristaHeader } from "@/components/PareceristaHeader";
import { PareceristaSidebar } from "@/components/PareceristaSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Send, HelpCircle, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

// Mock data para dúvidas enviadas
const duvidasEnviadas = [
  {
    id: 1,
    assunto: "Sistema de Avaliação",
    categoria: "Técnico",
    mensagem: "Como faço para salvar um rascunho da avaliação?",
    dataEnvio: "2024-01-15",
    status: "Respondida",
    resposta: "Para salvar um rascunho, clique no botão 'Salvar Rascunho' no final da página de avaliação. Seus dados serão preservados automaticamente."
  },
  {
    id: 2,
    assunto: "Critérios de Avaliação",
    categoria: "Processo",
    mensagem: "Qual o peso de cada critério na nota final?",
    dataEnvio: "2024-01-18",
    status: "Pendente",
    resposta: null
  },
  {
    id: 3,
    assunto: "Prazo de Avaliação",
    categoria: "Prazo",
    mensagem: "Posso solicitar extensão do prazo para avaliação de um projeto específico?",
    dataEnvio: "2024-01-20",
    status: "Em Análise",
    resposta: null
  }
];

const Ajuda = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    assunto: "",
    categoria: "",
    mensagem: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assunto || !formData.categoria || !formData.mensagem) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    // Aqui seria feita a integração com o backend
    toast({
      title: "Dúvida enviada com sucesso!",
      description: "Sua mensagem foi enviada para a equipe da Secretaria de Cultura. Você receberá uma resposta em até 2 dias úteis.",
    });

    // Limpar formulário
    setFormData({
      assunto: "",
      categoria: "",
      mensagem: ""
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Respondida":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Respondida</Badge>;
      case "Em Análise":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Em Análise</Badge>;
      case "Pendente":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><AlertCircle className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <PareceristaSidebar />
        <div className="flex-1 flex flex-col">
          <PareceristaHeader />
          
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header da página */}
              <div className="flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Central de Ajuda</h1>
                  <p className="text-gray-600">Tire suas dúvidas sobre o sistema e processo de avaliação</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário para nova dúvida */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Enviar Nova Dúvida
                    </CardTitle>
                    <CardDescription>
                      Descreva sua dúvida de forma clara. Nossa equipe responderá em até 2 dias úteis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="assunto">Assunto *</Label>
                        <Input
                          id="assunto"
                          value={formData.assunto}
                          onChange={(e) => handleInputChange('assunto', e.target.value)}
                          placeholder="Ex: Dificuldade para salvar avaliação"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="categoria">Categoria *</Label>
                        <Select 
                          value={formData.categoria} 
                          onValueChange={(value) => handleInputChange('categoria', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Técnico">Problemas Técnicos</SelectItem>
                            <SelectItem value="Processo">Processo de Avaliação</SelectItem>
                            <SelectItem value="Critérios">Critérios de Avaliação</SelectItem>
                            <SelectItem value="Prazo">Prazos e Cronograma</SelectItem>
                            <SelectItem value="Sistema">Sistema PNAB</SelectItem>
                            <SelectItem value="Documentos">Documentação</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="mensagem">Descrição da Dúvida *</Label>
                        <Textarea
                          id="mensagem"
                          value={formData.mensagem}
                          onChange={(e) => handleInputChange('mensagem', e.target.value)}
                          placeholder="Descreva sua dúvida detalhadamente..."
                          rows={6}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Dúvida
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* FAQ - Dúvidas Frequentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Dúvidas Frequentes
                    </CardTitle>
                    <CardDescription>
                      Confira as respostas para as perguntas mais comuns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-sm">Como salvar um rascunho?</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Clique em "Salvar Rascunho" na página de avaliação. Seus dados serão preservados automaticamente.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-sm">Qual o prazo para avaliar?</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        O prazo padrão é de 15 dias corridos a partir da data de recebimento do projeto.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-sm">Posso alterar uma avaliação finalizada?</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Não é possível alterar avaliações finalizadas. Entre em contato caso seja necessário.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-sm">Como funciona a pontuação?</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Cada critério tem peso específico. A nota final é calculada automaticamente pelo sistema.
                      </p>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-gray-500">
                        Não encontrou sua dúvida? Use o formulário ao lado para enviar sua pergunta.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de dúvidas enviadas */}
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Dúvidas Enviadas</CardTitle>
                  <CardDescription>
                    Acompanhe o status das suas solicitações de ajuda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {duvidasEnviadas.map((duvida) => (
                      <div key={duvida.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{duvida.assunto}</h4>
                              <Badge variant="outline" className="text-xs">
                                {duvida.categoria}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{duvida.mensagem}</p>
                            <p className="text-xs text-gray-500">
                              Enviado em: {new Date(duvida.dataEnvio).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(duvida.status)}
                          </div>
                        </div>
                        
                        {duvida.resposta && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
                            <h5 className="font-semibold text-sm text-blue-900 mb-1">Resposta da Equipe:</h5>
                            <p className="text-sm text-blue-800">{duvida.resposta}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Informações de contato */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>
                    Outros canais de comunicação disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Secretaria de Cultura de Jaú</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📧 cultura@jau.sp.gov.br</p>
                        <p>📞 (14) 3602-1234</p>
                        <p>🕒 Segunda a Sexta: 8h às 17h</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Suporte Técnico</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📧 suporte.pnab@jau.sp.gov.br</p>
                        <p>📞 (14) 3602-5678</p>
                        <p>🕒 Segunda a Sexta: 9h às 18h</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Ajuda;