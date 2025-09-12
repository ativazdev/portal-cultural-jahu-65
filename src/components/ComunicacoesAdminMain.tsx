import { useState } from "react";
import { 
  AlertTriangle, 
  Scale, 
  HelpCircle, 
  CheckCircle,
  Search,
  Eye,
  MessageSquare,
  X,
  Clock,
  User,
  FileText,
  Send,
  Save,
  Filter
} from "lucide-react";
import { PrefeituraSidebar } from "./PrefeituraSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarProvider } from "./ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";

export const ComunicacoesAdminMain = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [responseText, setResponseText] = useState("");
  const [responseStatus, setResponseStatus] = useState("respondida");
  const [cardAtivo, setCardAtivo] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  // Cards de estatísticas clicáveis
  const statusCards = [
    {
      id: "pendentes",
      title: "Mensagens Pendentes",
      value: "15",
      subtitle: "Aguardando resposta",
      color: "red",
      icon: <AlertTriangle className="h-6 w-6" />,
      clicavel: true
    },
    {
      id: "recursos",
      title: "Recursos de Proponentes",
      value: "8",
      subtitle: "Contestações de resultado",
      color: "orange",
      icon: <Scale className="h-6 w-6" />,
      clicavel: true
    },
    {
      id: "duvidas-proponentes",
      title: "Dúvidas de Proponentes",
      value: "12",
      subtitle: "Perguntas sobre editais",
      color: "blue",
      icon: <HelpCircle className="h-6 w-6" />,
      clicavel: true
    },
    {
      id: "duvidas-pareceristas",
      title: "Dúvidas de Pareceristas",
      value: "5",
      subtitle: "Perguntas sobre avaliação",
      color: "purple",
      icon: <HelpCircle className="h-6 w-6" />,
      clicavel: true
    },
    {
      id: "respondidas-hoje",
      title: "Respondidas Hoje",
      value: "18",
      subtitle: "Mensagens atendidas",
      color: "green",
      icon: <CheckCircle className="h-6 w-6" />,
      clicavel: true
    },
    {
      id: "total-mes",
      title: "Total do Mês",
      value: "89",
      subtitle: "Todas as mensagens",
      color: "gray",
      icon: <FileText className="h-6 w-6" />,
      clicavel: false
    }
  ];

  // Dados de exemplo das mensagens
  const mensagensData = [
    {
      id: 1,
      tipo: "Recurso",
      remetente: "João Silva",
      tipoRemetente: "Proponente",
      assunto: "Contestação da nota final",
      data: "15/11/2024 10:30",
      status: "Pendente",
      conteudo: "Solicito revisão da nota final (7.2) pois considero que os critérios de inovação não foram adequadamente avaliados. Anexo documentação complementar que comprova o caráter inovador do projeto.",
      projeto: "Festival de Música Popular",
      cpfCnpj: "123.456.789-00",
      categoria: null,
      anexos: [
        { nome: "documento_complementar.pdf", tamanho: "2.4 MB" },
        { nome: "planilha_inovacao.xlsx", tamanho: "850 KB" }
      ]
    },
    {
      id: 2,
      tipo: "Dúvida - Proponente",
      remetente: "Maria Santos",
      tipoRemetente: "Proponente",
      assunto: "Prazo para prestação de contas",
      data: "15/11/2024 09:15",
      status: "Respondida",
      conteudo: "Gostaria de confirmar qual é o prazo final para entrega da prestação de contas do meu projeto aprovado. O projeto foi finalizado em outubro.",
      projeto: "Teatro na Comunidade",
      cpfCnpj: "98.765.432-00",
      categoria: "Prazos e Documentação",
      anexos: []
    },
    {
      id: 3,
      tipo: "Dúvida - Parecerista",
      remetente: "Ana Costa",
      tipoRemetente: "Parecerista",
      assunto: "Critério de pontuação para inovação",
      data: "14/11/2024 16:45",
      status: "Pendente",
      conteudo: "Tenho dúvida sobre como pontuar o critério 'inovação' em um projeto de teatro tradicional.",
      projeto: null,
      especialidade: "Teatro e Artes Cênicas",
      projetosEmAnalise: 8,
      categoria: "Critérios de Avaliação",
      anexos: []
    },
    {
      id: 4,
      tipo: "Recurso",
      remetente: "Pedro Costa",
      tipoRemetente: "Proponente",
      assunto: "Erro na avaliação do projeto",
      data: "14/11/2024 14:20",
      status: "Em Análise",
      conteudo: "Identifico erro na pontuação do critério técnico do meu projeto. Solicito revisão urgente pois acredito ter sido prejudicado.",
      projeto: "Dança Contemporânea",
      cpfCnpj: "111.222.333-44",
      categoria: null,
      anexos: [
        { nome: "planilha_pontuacao.pdf", tamanho: "1.1 MB" }
      ]
    }
  ];

  // Templates de respostas rápidas
  const templateRespostas = [
    "Recurso em análise - aguarde retorno em até 15 dias úteis",
    "Documentação recebida - análise em andamento",
    "Recurso indeferido - decisão mantida conforme edital",
    "Dúvida esclarecida - consulte o edital para mais informações",
    "Solicitação atendida - processo finalizado com sucesso"
  ];

  const getCardBgColor = (color: string, isActive: boolean = false) => {
    const activeClass = isActive ? "ring-2 ring-offset-2" : "";
    switch (color) {
      case "blue": return `border-blue-200 bg-blue-50 hover:bg-blue-100 ${activeClass} ring-blue-500`;
      case "green": return `border-green-200 bg-green-50 hover:bg-green-100 ${activeClass} ring-green-500`;
      case "red": return `border-red-200 bg-red-50 hover:bg-red-100 ${activeClass} ring-red-500`;
      case "orange": return `border-orange-200 bg-orange-50 hover:bg-orange-100 ${activeClass} ring-orange-500`;
      case "purple": return `border-purple-200 bg-purple-50 hover:bg-purple-100 ${activeClass} ring-purple-500`;
      case "gray": return `border-gray-200 bg-gray-50 hover:bg-gray-100 ${activeClass} ring-gray-500`;
      default: return `border-gray-200 bg-gray-50 hover:bg-gray-100 ${activeClass} ring-gray-500`;
    }
  };

  const getCardTextColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      case "orange": return "text-orange-600";
      case "purple": return "text-purple-600";
      case "gray": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    if (tipo === "Recurso") return "destructive";
    if (tipo === "Dúvida - Proponente") return "default";
    if (tipo === "Dúvida - Parecerista") return "secondary";
    return "outline";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Pendente": return "destructive";
      case "Em Análise": return "secondary";
      case "Respondida": return "default";
      case "Fechada": return "outline";
      default: return "outline";
    }
  };

  const handleCardClick = (cardId: string) => {
    if (cardId === "total-mes") return; // Card não clicável
    
    if (cardAtivo === cardId) {
      // Se já está ativo, desativa
      setCardAtivo("");
      setTipoFilter("todos");
      setStatusFilter("todos");
    } else {
      setCardAtivo(cardId);
      
      switch (cardId) {
        case "pendentes":
          setStatusFilter("pendente");
          setTipoFilter("todos");
          break;
        case "recursos":
          setTipoFilter("recurso");
          setStatusFilter("todos");
          break;
        case "duvidas-proponentes":
          setTipoFilter("duvida-proponente");
          setStatusFilter("todos");
          break;
        case "duvidas-pareceristas":
          setTipoFilter("duvida-parecerista");
          setStatusFilter("todos");
          break;
        case "respondidas-hoje":
          setStatusFilter("respondida");
          setTipoFilter("todos");
          break;
      }
    }
  };

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setIsViewModalOpen(true);
  };

  const handleOpenResponse = (message: any) => {
    setSelectedMessage(message);
    setIsResponseModalOpen(true);
  };

  const handleResponder = () => {
    toast({
      title: "Resposta enviada",
      description: "A resposta foi enviada com sucesso.",
    });
    setResponseText("");
    setIsResponseModalOpen(false);
    setSelectedMessage(null);
  };

  const handleMarcarResolvida = (id: number) => {
    toast({
      title: "Mensagem resolvida",
      description: "A mensagem foi marcada como resolvida.",
    });
  };

  const handleLimparFiltros = () => {
    setSearchTerm("");
    setTipoFilter("todos");
    setStatusFilter("todos");
    setCardAtivo("");
  };

  const filteredMessages = mensagensData.filter(mensagem => {
    const matchesSearch = mensagem.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mensagem.assunto.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTipo = true;
    if (tipoFilter !== "todos") {
      if (tipoFilter === "recurso") {
        matchesTipo = mensagem.tipo === "Recurso";
      } else if (tipoFilter === "duvida-proponente") {
        matchesTipo = mensagem.tipo === "Dúvida - Proponente";
      } else if (tipoFilter === "duvida-parecerista") {
        matchesTipo = mensagem.tipo === "Dúvida - Parecerista";
      }
    }
    
    const matchesStatus = statusFilter === "todos" || mensagem.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const getTabFilteredMessages = (tabType: string) => {
    if (tabType === "proponentes") {
      return mensagensData.filter(m => m.tipoRemetente === "Proponente");
    }
    if (tabType === "pareceristas") {
      return mensagensData.filter(m => m.tipoRemetente === "Parecerista");
    }
    return mensagensData;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PrefeituraSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-background">
            <div className="space-y-6">
              {/* Breadcrumb */}
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Comunicações</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold">Comunicações</h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie recursos, dúvidas e mensagens dos proponentes
                </p>
              </div>

              {/* Cards de Status Clicáveis - Grid 2x3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statusCards.map((card) => (
                  <Card 
                    key={card.id} 
                    className={`${getCardBgColor(card.color, cardAtivo === card.id)} ${card.clicavel ? 'cursor-pointer transition-all' : 'cursor-default'}`}
                    onClick={() => card.clicavel && handleCardClick(card.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {card.title}
                          </p>
                          <p className={`text-3xl font-bold ${getCardTextColor(card.color)}`}>
                            {card.value}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {card.subtitle}
                          </p>
                        </div>
                        <div className={getCardTextColor(card.color)}>
                          {card.icon}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contador de mensagens filtradas */}
              {(cardAtivo || tipoFilter !== "todos" || statusFilter !== "todos" || searchTerm) && (
                <div className="text-sm text-muted-foreground">
                  {filteredMessages.length} mensagem(ns) encontrada(s)
                </div>
              )}

              <Tabs defaultValue="todas" className="w-full">
                <TabsList>
                  <TabsTrigger value="todas">Todas as Mensagens</TabsTrigger>
                  <TabsTrigger value="proponentes">Proponentes</TabsTrigger>
                  <TabsTrigger value="pareceristas">Pareceristas</TabsTrigger>
                </TabsList>

                <TabsContent value="todas" className="space-y-6">
                  {/* Filtros */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros de Busca
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por proponente, parecerista ou assunto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={tipoFilter} onValueChange={setTipoFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="recurso">Recursos</SelectItem>
                            <SelectItem value="duvida-proponente">Dúvidas de Proponentes</SelectItem>
                            <SelectItem value="duvida-parecerista">Dúvidas de Pareceristas</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pendente">Pendentes</SelectItem>
                            <SelectItem value="respondida">Respondidas</SelectItem>
                            <SelectItem value="em análise">Em Análise</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleLimparFiltros}>
                          Limpar Filtros
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabela de Mensagens */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Todas as Mensagens</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Remetente</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMessages.map((mensagem) => (
                            <TableRow key={mensagem.id}>
                              <TableCell>
                                <Badge variant={getTipoBadgeColor(mensagem.tipo)}>
                                  {mensagem.tipo}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{mensagem.remetente}</div>
                                  <div className="text-sm text-muted-foreground">{mensagem.tipoRemetente}</div>
                                </div>
                              </TableCell>
                              <TableCell>{mensagem.assunto}</TableCell>
                              <TableCell>{mensagem.data}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeColor(mensagem.status)}>
                                  {mensagem.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleViewMessage(mensagem)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {mensagem.status === "Pendente" && (
                                    <Button size="sm" onClick={() => handleOpenResponse(mensagem)}>
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {mensagem.status === "Respondida" && (
                                    <Button variant="outline" size="sm" onClick={() => handleMarcarResolvida(mensagem.id)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="proponentes" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mensagens de Proponentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Proponente</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getTabFilteredMessages("proponentes").map((mensagem) => (
                            <TableRow key={mensagem.id}>
                              <TableCell>
                                <Badge variant={getTipoBadgeColor(mensagem.tipo)}>
                                  {mensagem.tipo}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{mensagem.remetente}</div>
                              </TableCell>
                              <TableCell>{mensagem.assunto}</TableCell>
                              <TableCell>{mensagem.data}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeColor(mensagem.status)}>
                                  {mensagem.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleViewMessage(mensagem)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {mensagem.status === "Pendente" && (
                                    <Button size="sm" onClick={() => handleOpenResponse(mensagem)}>
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pareceristas" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mensagens de Pareceristas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Parecerista</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getTabFilteredMessages("pareceristas").map((mensagem) => (
                            <TableRow key={mensagem.id}>
                              <TableCell>
                                <Badge variant={getTipoBadgeColor(mensagem.tipo)}>
                                  {mensagem.tipo}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{mensagem.remetente}</div>
                              </TableCell>
                              <TableCell>{mensagem.assunto}</TableCell>
                              <TableCell>{mensagem.data}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeColor(mensagem.status)}>
                                  {mensagem.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleViewMessage(mensagem)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {mensagem.status === "Pendente" && (
                                    <Button size="sm" onClick={() => handleOpenResponse(mensagem)}>
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              {/* Modal de Visualizar Mensagem */}
              <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  {selectedMessage && (
                    <div className="space-y-6">
                      {/* Cabeçalho do Modal */}
                      <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Visualizar Mensagem
                        </DialogTitle>
                      </DialogHeader>

                      {/* Informações principais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Tipo:</span>
                            <Badge variant={getTipoBadgeColor(selectedMessage.tipo)}>
                              {selectedMessage.tipo}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Remetente:</span>
                            <span className="text-sm">{selectedMessage.remetente}</span>
                            <Badge variant="outline" className="text-xs">
                              {selectedMessage.tipoRemetente}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Data de envio:</span>
                            <span className="text-sm">{selectedMessage.data}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            <Badge variant={getStatusBadgeColor(selectedMessage.status)}>
                              {selectedMessage.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {/* Informações específicas para proponentes */}
                          {selectedMessage.tipoRemetente === "Proponente" && (
                            <>
                              {selectedMessage.projeto && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Projeto:</span>
                                  <span className="text-sm">{selectedMessage.projeto}</span>
                                </div>
                              )}
                              
                              {selectedMessage.cpfCnpj && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">CPF/CNPJ:</span>
                                  <span className="text-sm font-mono">{selectedMessage.cpfCnpj}</span>
                                </div>
                              )}
                            </>
                          )}

                          {/* Informações específicas para pareceristas */}
                          {selectedMessage.tipoRemetente === "Parecerista" && (
                            <>
                              {selectedMessage.especialidade && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Especialidade:</span>
                                  <span className="text-sm">{selectedMessage.especialidade}</span>
                                </div>
                              )}
                              
                              {selectedMessage.projetosEmAnalise && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Projetos em análise:</span>
                                  <span className="text-sm">{selectedMessage.projetosEmAnalise}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Mensagem Original */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Mensagem Original</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-base mb-2">Assunto:</h4>
                            <p className="text-sm bg-muted p-3 rounded-md">{selectedMessage.assunto}</p>
                          </div>

                          {selectedMessage.categoria && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Categoria:</h4>
                              <Badge variant="outline">{selectedMessage.categoria}</Badge>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold text-sm mb-2">Descrição:</h4>
                            <div className="text-sm bg-background border rounded-md p-4 min-h-[100px]">
                              {selectedMessage.conteudo}
                            </div>
                          </div>

                          {selectedMessage.anexos && selectedMessage.anexos.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Anexos:</h4>
                              <div className="space-y-2">
                                {selectedMessage.anexos.map((anexo: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">{anexo.nome}</span>
                                      <span className="text-xs text-muted-foreground">({anexo.tamanho})</span>
                                    </div>
                                    <Button variant="outline" size="sm">
                                      Baixar
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Botões de Ação */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        {selectedMessage.status === "Pendente" && (
                          <Button onClick={() => {
                            setIsViewModalOpen(false);
                            setSelectedMessage(selectedMessage);
                          }}>
                            <Send className="h-4 w-4 mr-2" />
                            Responder
                          </Button>
                        )}
                        
                        {selectedMessage.status === "Respondida" && (
                          <Button 
                            variant="outline"
                            onClick={() => handleMarcarResolvida(selectedMessage.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Resolvida
                          </Button>
                        )}
                        
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                          Fechar
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Modal de Responder Mensagem */}
              <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Responder Mensagem
                    </DialogTitle>
                  </DialogHeader>
                  
                  {selectedMessage && (
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm font-medium">Mensagem original:</p>
                        <p className="text-sm">{selectedMessage.assunto} - {selectedMessage.remetente}</p>
                      </div>

                      <div>
                        <Label>Sua resposta</Label>
                        <Textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Digite sua resposta..."
                          className="min-h-32"
                        />
                      </div>

                      <div>
                        <Label>Respostas Rápidas</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {templateRespostas.map((template, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => setResponseText(template)}
                              className="text-left justify-start"
                            >
                              {template}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Marcar como</Label>
                        <RadioGroup 
                          value={responseStatus} 
                          onValueChange={setResponseStatus}
                          className="mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="em-analise" id="em-analise" />
                            <Label htmlFor="em-analise">Em análise</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="respondida" id="respondida" />
                            <Label htmlFor="respondida">Respondida</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="encerrada" id="encerrada" />
                            <Label htmlFor="encerrada">Encerrada</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleResponder}>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Resposta
                        </Button>
                        <Button variant="outline">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Rascunho
                        </Button>
                        <Button variant="outline" onClick={() => setIsResponseModalOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};