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
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react";

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
  
  // Estados do formulário
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [pareceristaEditando, setPareceristaEditando] = useState<Parecerista | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    especialidade: "",
    formacao: "",
    experiencia: ""
  });

  const statusCards: StatusCard[] = [
    {
      title: "Total de Pareceristas",
      value: "24",
      subtitle: "Cadastrados no sistema",
      color: "blue",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Pareceristas Ativos",
      value: "18",
      subtitle: "Disponíveis para avaliação",
      color: "green",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: "Aguardando Ativação",
      value: "6",
      subtitle: "Pendentes de aprovação",
      color: "orange",
      icon: <AlertCircle className="h-6 w-6" />
    }
  ];

  const pareceristas: Parecerista[] = [
    {
      id: "1",
      nome: "Dr. Ana Costa Silva",
      email: "ana.costa@email.com",
      telefone: "(14) 99999-1234",
      cpf: "123.456.789-01",
      especialidade: "Música",
      formacao: "Doutora em Musicologia - UNESP",
      experiencia: "15 anos em análise de projetos culturais",
      status: "Ativo",
      projetosAvaliados: 45,
      dataAtivacao: "15/03/2023"
    },
    {
      id: "2",
      nome: "Prof. João Santos Lima",
      email: "joao.santos@email.com",
      telefone: "(14) 99999-5678",
      cpf: "234.567.890-12",
      especialidade: "Teatro",
      formacao: "Mestre em Artes Cênicas - USP",
      experiencia: "12 anos em direção teatral",
      status: "Ativo",
      projetosAvaliados: 32,
      dataAtivacao: "20/05/2023"
    },
    {
      id: "3",
      nome: "Dra. Maria Silva Oliveira",
      email: "maria.silva@email.com",
      telefone: "(14) 99999-9012",
      cpf: "345.678.901-23",
      especialidade: "Artes Visuais",
      formacao: "Doutora em História da Arte - UNICAMP",
      experiencia: "20 anos em curadoria",
      status: "Pendente",
      projetosAvaliados: 0,
      dataAtivacao: "-"
    },
    {
      id: "4",
      nome: "Prof. Pedro Lima Costa",
      email: "pedro.lima@email.com",
      telefone: "(14) 99999-3456",
      cpf: "456.789.012-34",
      especialidade: "Dança",
      formacao: "Especialista em Dança Contemporânea",
      experiencia: "8 anos em coreografia",
      status: "Inativo",
      projetosAvaliados: 12,
      dataAtivacao: "10/01/2024"
    }
  ];

  const especialidades = [
    "Música",
    "Teatro", 
    "Dança",
    "Artes Visuais",
    "Literatura",
    "Cinema e Audiovisual",
    "Cultura Popular",
    "Patrimônio Cultural"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800";
      case "Inativo": return "bg-gray-100 text-gray-800";
      case "Pendente": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNovoParecerista = () => {
    setPareceristaEditando(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      especialidade: "",
      formacao: "",
      experiencia: ""
    });
    setIsModalAberto(true);
  };

  const handleEditarParecerista = (parecerista: Parecerista) => {
    setPareceristaEditando(parecerista);
    setFormData({
      nome: parecerista.nome,
      email: parecerista.email,
      telefone: parecerista.telefone,
      cpf: parecerista.cpf,
      especialidade: parecerista.especialidade,
      formacao: parecerista.formacao,
      experiencia: parecerista.experiencia
    });
    setIsModalAberto(true);
  };

  const handleSalvarParecerista = () => {
    if (!formData.nome || !formData.email || !formData.especialidade) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, email e especialidade.",
        variant: "destructive",
      });
      return;
    }

    if (pareceristaEditando) {
      toast({
        title: "Parecerista atualizado!",
        description: `Os dados de ${formData.nome} foram atualizados com sucesso.`,
      });
    } else {
      toast({
        title: "Parecerista cadastrado!",
        description: `${formData.nome} foi cadastrado como parecerista de ${formData.especialidade}.`,
      });
    }
    
    setIsModalAberto(false);
    setPareceristaEditando(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      especialidade: "",
      formacao: "",
      experiencia: ""
    });
  };

  const handleAtivarParecerista = (parecerista: Parecerista) => {
    toast({
      title: "Parecerista ativado!",
      description: `${parecerista.nome} foi ativado e pode avaliar projetos.`,
    });
  };

  const handleDesativarParecerista = (parecerista: Parecerista) => {
    toast({
      title: "Parecerista desativado!",
      description: `${parecerista.nome} foi desativado temporariamente.`,
      variant: "destructive",
    });
  };

  const handleExcluirParecerista = (parecerista: Parecerista) => {
    toast({
      title: "Parecerista removido!",
      description: `${parecerista.nome} foi removido do sistema.`,
      variant: "destructive",
    });
  };

  const filteredPareceristas = pareceristas.filter(parecerista => {
    const matchesSearch = parecerista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parecerista.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parecerista.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || parecerista.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard-prefeitura")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
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
                <SelectItem value="Ativo">Ativos</SelectItem>
                <SelectItem value="Inativo">Inativos</SelectItem>
                <SelectItem value="Pendente">Pendentes</SelectItem>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Projetos Avaliados</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Ativação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPareceristas.map((parecerista) => (
                  <TableRow key={parecerista.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{parecerista.nome}</div>
                        <div className="text-sm text-muted-foreground">{parecerista.telefone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{parecerista.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {parecerista.especialidade}
                      </Badge>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditarParecerista(parecerista)}
                          title="Editar parecerista"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {parecerista.status === "Pendente" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleAtivarParecerista(parecerista)}
                            title="Ativar parecerista"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {parecerista.status === "Ativo" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600"
                            onClick={() => handleDesativarParecerista(parecerista)}
                            title="Desativar parecerista"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleExcluirParecerista(parecerista)}
                          title="Excluir parecerista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={isModalAberto} onOpenChange={setIsModalAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {pareceristaEditando ? "Editar Parecerista" : "Novo Parecerista"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
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
              <Label htmlFor="especialidade">Especialidade *</Label>
              <Select 
                value={formData.especialidade} 
                onValueChange={(value) => handleInputChange("especialidade", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="experiencia">Experiência Profissional</Label>
              <Textarea
                id="experiencia"
                value={formData.experiencia}
                onChange={(e) => handleInputChange("experiencia", e.target.value)}
                placeholder="Descreva a experiência relevante para avaliação de projetos culturais..."
                rows={3}
              />
            </div>
          </div>

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
