import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProponenteHeader } from "@/components/ProponenteHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { ChevronLeft, FileUp, MessageCircle, HelpCircle, Eye, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mensagensFicticias = [
  {
    id: 1,
    tipo: "Recurso",
    assunto: "Recurso contra indeferimento - Projeto Cultural 2024",
    dataEnvio: "15/11/2024",
    status: "Em Análise",
    resposta: null
  },
  {
    id: 2,
    tipo: "Dúvida",
    assunto: "Dúvida sobre documentação necessária",
    dataEnvio: "10/11/2024",
    status: "Respondido",
    resposta: "Prezado proponente, os documentos necessários são: RG, CPF, comprovante de residência e declaração de aptidão cultural."
  },
  {
    id: 3,
    tipo: "Dúvida",
    assunto: "Prazo para entrega de relatório final",
    dataEnvio: "08/11/2024",
    status: "Lido",
    resposta: null
  },
  {
    id: 4,
    tipo: "Recurso",
    assunto: "Contestação de pontuação na análise técnica",
    dataEnvio: "05/11/2024",
    status: "Respondido",
    resposta: "Após reanálise, a pontuação foi mantida conforme critérios estabelecidos no edital."
  }
];

const Comunicacao = () => {
  const { toast } = useToast();
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  const handleEnviarMensagem = () => {
    if (!tipoMensagem || !assunto || !mensagem) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Mensagem enviada com sucesso!",
      description: "Sua mensagem foi enviada para a prefeitura. Você receberá uma resposta em breve.",
    });

    // Limpar formulário
    setTipoMensagem("");
    setAssunto("");
    setMensagem("");
    setArquivo(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Enviado":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Enviado</Badge>;
      case "Lido":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Lido</Badge>;
      case "Em Análise":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Em Análise</Badge>;
      case "Respondido":
        return <Badge variant="default" className="bg-green-100 text-green-800">Respondido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === "Recurso" ? 
      <FileUp className="h-4 w-4 text-orange-600" /> : 
      <HelpCircle className="h-4 w-4 text-blue-600" />;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <ProponenteHeader />
          <main className="flex-1 p-6 space-y-6">
           

            {/* Título Principal */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Comunicação com a Prefeitura</h1>
              <p className="text-gray-600">Envie recursos, tire dúvidas e acompanhe suas mensagens</p>
            </div>

            {/* Abas */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="nova-mensagem" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="nova-mensagem" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Enviar Nova Mensagem
                    </TabsTrigger>
                    <TabsTrigger value="minhas-mensagens" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Minhas Mensagens
                    </TabsTrigger>
                  </TabsList>

                  {/* Aba Enviar Nova Mensagem */}
                  <TabsContent value="nova-mensagem" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Mensagem *</Label>
                        <Select value={tipoMensagem} onValueChange={setTipoMensagem}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de mensagem" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recurso">
                              <div className="flex items-center gap-2">
                                <FileUp className="h-4 w-4 text-orange-600" />
                                Recurso
                              </div>
                            </SelectItem>
                            <SelectItem value="duvida">
                              <div className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-blue-600" />
                                Dúvida
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assunto">Assunto *</Label>
                        <Input
                          id="assunto"
                          value={assunto}
                          onChange={(e) => setAssunto(e.target.value)}
                          placeholder="Digite o assunto da sua mensagem"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensagem">Mensagem *</Label>
                      <Textarea
                        id="mensagem"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        placeholder="Digite sua mensagem detalhadamente..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="arquivo">Anexar Arquivo (Opcional)</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="arquivo"
                          type="file"
                          onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                          className="flex-1"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {arquivo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Paperclip className="h-4 w-4" />
                            {arquivo.name}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleEnviarMensagem} className="bg-blue-600 hover:bg-blue-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Aba Minhas Mensagens */}
                  <TabsContent value="minhas-mensagens" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Histórico de Mensagens</h3>
                        <span className="text-sm text-gray-500">
                          {mensagensFicticias.length} mensagem(s) encontrada(s)
                        </span>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Assunto</TableHead>
                              <TableHead>Data de Envio</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mensagensFicticias.map((msg) => (
                              <TableRow key={msg.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getTipoIcon(msg.tipo)}
                                    <span className="font-medium">{msg.tipo}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="truncate" title={msg.assunto}>
                                    {msg.assunto}
                                  </div>
                                </TableCell>
                                <TableCell>{msg.dataEnvio}</TableCell>
                                <TableCell>{getStatusBadge(msg.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver Detalhes
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Comunicacao;