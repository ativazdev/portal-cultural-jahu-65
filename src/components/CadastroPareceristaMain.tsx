import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  User,
  Briefcase
} from "lucide-react";
import { usePareceristas, PareceristaCompleto, PareceristaFormData } from "@/hooks/usePareceristas";

interface Parecerista {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  especialidade: string;
  formacao: string;
  experiencia: string;
  status: "Ativo" | "Inativo" | "Pendente";
  projetosAvaliados: number;
  dataAtivacao: string;
  editaisPermitidos?: string[];
}

interface StatusCard {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

export const CadastroPareceristaMain = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    pareceristas: pareceristasCompletos, 
    editais,
    loading, 
    error,
    criarParecerista,
    atualizarParecerista,
    ativarParecerista,
    desativarParecerista,
    excluirParecerista,
    reenviarEmail,
    filtrarPareceristas,
    calcularMetricas
  } = usePareceristas();
  
  // Estados do formulário
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [pareceristaEditando, setPareceristaEditando] = useState<PareceristaCompleto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  
  // Estados do formulário
  const [formData, setFormData] = useState<PareceristaFormData>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    especialidade: [],
    formacao: "",
    experiencia: "",
    rg: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    dataNascimento: "",
    areaAtuacao: "",
    experienciaAnos: 0,
    miniCurriculo: "",
    editaisPermitidos: []
  });

  // Calcular métricas dinâmicas
  const metricas = calcularMetricas();
  
  const especialidades = [
    { label: "Música", value: "musica" },
    { label: "Teatro", value: "teatro" },
    { label: "Dança", value: "danca" },
    { label: "Artes Visuais", value: "artes_visuais" },
    { label: "Literatura", value: "literatura" },
    { label: "Cinema e Audiovisual", value: "cinema" },
    { label: "Cultura Popular", value: "cultura_popular" },
    { label: "Circo", value: "circo" },
    { label: "Outros", value: "outros" }
  ];

  const statusCards: StatusCard[] = [
    {
      title: "Total de Pareceristas",
      value: metricas.total.toString(),
      subtitle: "Cadastrados no sistema",
      color: "blue",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Pareceristas Ativos",
      value: metricas.ativos.toString(),
      subtitle: "Disponíveis para avaliação",
      color: "green",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: "Aguardando Ativação",
      value: metricas.pendentes.toString(),
      subtitle: "Pendentes de aprovação",
      color: "orange",
      icon: <AlertCircle className="h-6 w-6" />
    }
  ];

  // Converter pareceristas para formato da interface
  const pareceristas = pareceristasCompletos.map(parecerista => ({
    id: parecerista.id,
    nome: parecerista.nome,
    email: parecerista.email,
    telefone: parecerista.telefone || '',
    cpf: parecerista.cpf,
    especialidade: parecerista.especialidade?.map(esp => {
      const especialidadeEncontrada = especialidades.find(e => e.value === esp);
      return especialidadeEncontrada?.label || esp;
    }).join(', ') || 'N/A',
    formacao: parecerista.formacao_academica || '',
    experiencia: parecerista.mini_curriculo || '',
    status: parecerista.status === 'ativo' ? 'Ativo' : parecerista.status === 'inativo' ? 'Inativo' : 'Pendente',
    projetosAvaliados: parecerista.projetosAvaliados || 0,
    dataAtivacao: parecerista.dataAtivacao ?
      (parecerista.dataAtivacao.includes('T') ?
        new Date(parecerista.dataAtivacao).toLocaleDateString('pt-BR') :
        parecerista.dataAtivacao) : '-',
    editaisPermitidos: parecerista.editais_permitidos || []
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800 border-green-200";
      case "Inativo": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Pendente": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCardColor = (color: string) => {
    switch (color) {
      case "blue": return "border-l-4 border-l-blue-500 bg-blue-50";
      case "green": return "border-l-4 border-l-green-500 bg-green-50";
      case "orange": return "border-l-4 border-l-orange-500 bg-orange-50";
      case "red": return "border-l-4 border-l-red-500 bg-red-50";
      default: return "border-l-4 border-l-gray-500 bg-gray-50";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "orange": return "text-orange-600";
      case "red": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNovoParecerista = () => {
    setPareceristaEditando(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      especialidade: [],
      formacao: "",
      experiencia: "",
      rg: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      dataNascimento: "",
      areaAtuacao: "",
      experienciaAnos: 0,
      miniCurriculo: "",
      editaisPermitidos: []
    });
    setIsModalAberto(true);
  };

  const handleEditarParecerista = (parecerista: Parecerista) => {
    const pareceristaOriginal = pareceristasCompletos.find(p => p.id === parecerista.id);
    if (!pareceristaOriginal) return;

    setPareceristaEditando(pareceristaOriginal);
    setFormData({
      nome: pareceristaOriginal.nome,
      email: pareceristaOriginal.email,
      telefone: pareceristaOriginal.telefone || '',
      cpf: pareceristaOriginal.cpf,
      especialidade: pareceristaOriginal.especialidade || [],
      formacao: pareceristaOriginal.formacao_academica || '',
      experiencia: pareceristaOriginal.mini_curriculo || '',
      editaisPermitidos: pareceristaOriginal.editais_permitidos || [],
      rg: pareceristaOriginal.rg || '',
      endereco: pareceristaOriginal.endereco || '',
      cidade: pareceristaOriginal.cidade || '',
      estado: pareceristaOriginal.estado || '',
      cep: pareceristaOriginal.cep || '',
      dataNascimento: pareceristaOriginal.data_nascimento || '',
      areaAtuacao: pareceristaOriginal.area_atuacao || '',
      experienciaAnos: pareceristaOriginal.experiencia_anos || 0,
      miniCurriculo: pareceristaOriginal.mini_curriculo || ''
    });
    setIsModalAberto(true);
  };

  const handleSalvarParecerista = async () => {
    if (!formData.nome || !formData.email || formData.especialidade.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, email e especialidade.",
        variant: "destructive",
      });
      return;
    }

    try {
    if (pareceristaEditando) {
        await atualizarParecerista(pareceristaEditando.id, formData);
    } else {
        await criarParecerista(formData);
    }
    
    setIsModalAberto(false);
    setPareceristaEditando(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
        especialidade: [],
      formacao: "",
        experiencia: "",
        rg: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        dataNascimento: "",
        areaAtuacao: "",
        experienciaAnos: 0,
        miniCurriculo: "",
        editaisPermitidos: []
      });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleAtivarParecerista = async (parecerista: Parecerista) => {
    await ativarParecerista(parecerista.id);
  };

  const handleDesativarParecerista = async (parecerista: Parecerista) => {
    await desativarParecerista(parecerista.id);
  };

  const handleExcluirParecerista = async (parecerista: Parecerista) => {
    await excluirParecerista(parecerista.id);
  };

  const handleReenviarEmail = async (parecerista: Parecerista) => {
    const pareceristaOriginal = pareceristasCompletos.find(p => p.id === parecerista.id);
    if (!pareceristaOriginal) return;

    await reenviarEmail(pareceristaOriginal);
  };

  // Filtrar pareceristas convertidos
  const filteredPareceristas = pareceristas.filter(parecerista => {
    const matchesSearch = !searchTerm || 
      parecerista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parecerista.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parecerista.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || 
      parecerista.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estados de loading e erro
  if (loading && pareceristas.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando pareceristas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          
          <h1 className="text-3xl font-bold tracking-tight text-prefeitura-primary">
            Cadastro de Pareceristas
          </h1>
          <p className="text-prefeitura-muted">
            Gerencie os pareceristas responsáveis pela avaliação dos projetos
          </p>
        </div>
        <Button 
          onClick={handleNovoParecerista}
          className="bg-prefeitura-primary hover:bg-prefeitura-primary/90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Parecerista
        </Button>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map((card, index) => (
          <Card key={index} className={getCardColor(card.color)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>
                <div className={getIconColor(card.color)}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, especialidade ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("todos");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Pareceristas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pareceristas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Editais Permitidos</TableHead>
                  <TableHead>Projetos Avaliados</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Ativação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPareceristas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {pareceristas.length === 0 
                          ? "Nenhum parecerista cadastrado ainda."
                          : "Nenhum parecerista encontrado com os filtros aplicados."
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPareceristas.map((parecerista) => (
                  <TableRow key={parecerista.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{parecerista.nome}</div>
                        <div className="text-sm text-muted-foreground">{parecerista.telefone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{parecerista.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {parecerista.especialidade.split(', ').map((esp, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {esp}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {parecerista.editaisPermitidos && parecerista.editaisPermitidos.length > 0 ? (
                          parecerista.editaisPermitidos.map((editalId, index) => {
                            const edital = editais.find(e => e.id === editalId);
                            return (
                              <Badge key={index} variant="outline" className="text-xs">
                                {edital ? edital.codigo || edital.nome : editalId.substring(0, 8)}
                      </Badge>
                            );
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">Nenhum</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {parecerista.projetosAvaliados}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(parecerista.status)}>
                        {parecerista.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{parecerista.dataAtivacao}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditarParecerista(parecerista)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar dados do parecerista</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              onClick={() => handleReenviarEmail(parecerista)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reenviar e-mail com credenciais de acesso</p>
                          </TooltipContent>
                        </Tooltip>

                        {parecerista.status === "Pendente" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleAtivarParecerista(parecerista)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ativar parecerista para avaliar projetos</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {parecerista.status === "Ativo" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600"
                            onClick={() => handleDesativarParecerista(parecerista)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Desativar parecerista temporariamente</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {parecerista.status === "Inativo" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleAtivarParecerista(parecerista)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reativar parecerista para avaliar projetos</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleExcluirParecerista(parecerista)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remover parecerista do sistema</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={isModalAberto} onOpenChange={setIsModalAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {pareceristaEditando ? "Editar Parecerista" : "Novo Parecerista"}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="dados-pessoais" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados-pessoais" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger value="dados-profissionais" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Dados Profissionais
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados-pessoais" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Nome completo do parecerista"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="(14) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="especialidade">Especialidades *</Label>
              <div className="space-y-2">
                  {especialidades.map((esp) => (
                  <div key={esp.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={esp.value}
                      checked={formData.especialidade.includes(esp.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange("especialidade", [...formData.especialidade, esp.value]);
                        } else {
                          handleInputChange("especialidade", formData.especialidade.filter(s => s !== esp.value));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={esp.value} className="text-sm">{esp.label}</Label>
                  </div>
                ))}
              </div>
            </div>


            {/* Dados Pessoais Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleInputChange("rg", e.target.value)}
                  placeholder="00.000.000-0"
                />
              </div>
              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                placeholder="Rua, número, complemento..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
            </TabsContent>
            
            <TabsContent value="dados-profissionais" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="areaAtuacao">Área de Atuação</Label>
                <Input
                  id="areaAtuacao"
                  value={formData.areaAtuacao}
                  onChange={(e) => handleInputChange("areaAtuacao", e.target.value)}
                  placeholder="Ex: Direção Teatral, Curadoria..."
                />
              </div>
              <div>
                <Label htmlFor="experienciaAnos">Anos de Experiência</Label>
                <Input
                  id="experienciaAnos"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experienciaAnos}
                  onChange={(e) => handleInputChange("experienciaAnos", parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="formacao">Formação Acadêmica</Label>
              <Input
                id="formacao"
                value={formData.formacao}
                onChange={(e) => handleInputChange("formacao", e.target.value)}
                placeholder="Graduação, especialização, mestrado, doutorado..."
              />
            </div>

            <div>
              <Label htmlFor="editais">Editais Permitidos</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {editais.length > 0 ? (
                  editais.map((edital) => (
                    <div key={edital.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={edital.id}
                        checked={formData.editaisPermitidos?.includes(edital.id) || false}
                        onChange={(e) => {
                          const currentEditais = formData.editaisPermitidos || [];
                          if (e.target.checked) {
                            handleInputChange("editaisPermitidos", [...currentEditais, edital.id]);
                          } else {
                            handleInputChange("editaisPermitidos", currentEditais.filter(id => id !== edital.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={edital.id} className="text-sm">
                        {edital.codigo} - {edital.nome}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum edital disponível</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="miniCurriculo">Mini Currículo</Label>
              <Textarea
                id="miniCurriculo"
                value={formData.miniCurriculo}
                onChange={(e) => handleInputChange("miniCurriculo", e.target.value)}
                placeholder="Resumo da experiência profissional e formação..."
                rows={3}
              />
            </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalAberto(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvarParecerista}
              className="bg-prefeitura-primary hover:bg-prefeitura-primary/90"
            >
              {pareceristaEditando ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
