import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, User, Building, Users } from "lucide-react";

const proponentes = [
  {
    id: 1,
    nome: "Noemi Maria Rodrigues Bof",
    endereco: "Av 16 de Junho 609 - Bariri - SP - 17250-000",
    tipo: "Pessoa Física",
    email: "noemi.bof@email.com",
    telefone: "(14) 99999-1234",
    cpf: "123.456.789-01",
    rg: "12.345.678-9",
    dataNascimento: "15/03/1980",
    profissao: "Artista Plástica"
  },
  {
    id: 2,
    nome: "Ativar Produções LTDA",
    endereco: "Avenida 16 de Junho 609 - Bariri - SP - 17250-424",
    tipo: "Pessoa Jurídica",
    email: "contato@ativarproducoes.com.br",
    telefone: "(14) 3274-5678",
    cnpj: "12.345.678/0001-90",
    inscricaoEstadual: "123.456.789.012",
    razaoSocial: "Ativar Produções Culturais LTDA",
    representante: "João Silva"
  },
  {
    id: 3,
    nome: "INGRIDE SALVIOLI",
    endereco: "Rua João Batista Crivelari 1189L - Brotas - SP - 17380-000",
    tipo: "Pessoa Física",
    email: "ingride.salvioli@email.com",
    telefone: "(14) 99999-5678",
    cpf: "234.567.890-12",
    rg: "23.456.789-0",
    dataNascimento: "22/07/1985",
    profissao: "Musicista"
  },
  {
    id: 4,
    nome: "Associação Educarte de Bariri",
    endereco: "Rua das Flores 123 - Bariri - SP - 17250-100",
    tipo: "Pessoa Jurídica",
    email: "educarte@bariri.org.br",
    telefone: "(14) 3274-9012",
    cnpj: "23.456.789/0001-01",
    inscricaoEstadual: "234.567.890.123",
    razaoSocial: "Associação Educarte de Bariri",
    representante: "Ana Costa"
  },
  {
    id: 5,
    nome: "Maria Silva Santos",
    endereco: "Rua Principal 456 - Jahu - SP - 17201-000",
    tipo: "Pessoa Física",
    email: "maria.santos@email.com",
    telefone: "(14) 99999-9012",
    cpf: "345.678.901-23",
    rg: "34.567.890-1",
    dataNascimento: "10/12/1975",
    profissao: "Professora de Teatro"
  }
];

const MeusProponentes = () => {
  const { toast } = useToast();
  
  // Estados
  const [isModalRegistroAberto, setIsModalRegistroAberto] = useState(false);
  const [isModalEdicaoAberto, setIsModalEdicaoAberto] = useState(false);
  const [tipoRegistro, setTipoRegistro] = useState<"PF" | "PJ" | "COOP" | "">("");
  const [proponenteEditando, setProponenteEditando] = useState<any>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    // Campos PF
    cpf: "",
    rg: "",
    dataNascimento: "",
    profissao: "",
    // Campos PJ
    cnpj: "",
    razaoSocial: "",
    inscricaoEstadual: "",
    representante: ""
  });

  // Funções para registro de novos proponentes
  const handleRegistrarPF = () => {
    setTipoRegistro("PF");
    setProponenteEditando(null);
    setFormData({
      nome: "", email: "", telefone: "", endereco: "",
      cpf: "", rg: "", dataNascimento: "", profissao: "",
      cnpj: "", razaoSocial: "", inscricaoEstadual: "", representante: ""
    });
    setIsModalRegistroAberto(true);
    toast({
      title: "Cadastro de Pessoa Física",
      description: "Preencha os dados para registrar uma nova pessoa física.",
    });
  };

  const handleRegistrarPJ = () => {
    setTipoRegistro("PJ");
    setProponenteEditando(null);
    setFormData({
      nome: "", email: "", telefone: "", endereco: "",
      cpf: "", rg: "", dataNascimento: "", profissao: "",
      cnpj: "", razaoSocial: "", inscricaoEstadual: "", representante: ""
    });
    setIsModalRegistroAberto(true);
    toast({
      title: "Cadastro de Pessoa Jurídica",
      description: "Preencha os dados para registrar uma nova pessoa jurídica.",
    });
  };

  const handleRegistrarCoop = () => {
    setTipoRegistro("COOP");
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O cadastro de cooperativas estará disponível em breve.",
    });
  };

  // Função para editar proponente
  const handleEditarProponente = (proponente: any) => {
    setProponenteEditando(proponente);
    setTipoRegistro(proponente.tipo === "Pessoa Física" ? "PF" : "PJ");
    setFormData({
      nome: proponente.nome,
      email: proponente.email || "",
      telefone: proponente.telefone || "",
      endereco: proponente.endereco,
      cpf: proponente.cpf || "",
      rg: proponente.rg || "",
      dataNascimento: proponente.dataNascimento || "",
      profissao: proponente.profissao || "",
      cnpj: proponente.cnpj || "",
      razaoSocial: proponente.razaoSocial || "",
      inscricaoEstadual: proponente.inscricaoEstadual || "",
      representante: proponente.representante || ""
    });
    setIsModalEdicaoAberto(true);
    toast({
      title: "Editando proponente",
      description: `Carregando dados de ${proponente.nome} para edição.`,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvarRegistro = () => {
    if (!formData.nome || !formData.email || !formData.endereco) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, email e endereço.",
        variant: "destructive",
      });
      return;
    }

    const tipoTexto = tipoRegistro === "PF" ? "Pessoa Física" : "Pessoa Jurídica";
    toast({
      title: "Proponente cadastrado!",
      description: `${formData.nome} foi cadastrado como ${tipoTexto} com sucesso.`,
    });
    setIsModalRegistroAberto(false);
  };

  const handleSalvarEdicao = () => {
    if (!formData.nome || !formData.email || !formData.endereco) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, email e endereço.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Proponente atualizado!",
      description: `Os dados de ${formData.nome} foram atualizados com sucesso.`,
    });
    setIsModalEdicaoAberto(false);
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Lista de proponentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seção de registro de novos proponentes */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <div className="flex flex-col items-center space-y-6">
                    <Plus className="h-12 w-12 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-700">Registrar Novo Proponente</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        onClick={handleRegistrarPF}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Pessoa Física
                      </Button>
                      <Button 
                        onClick={handleRegistrarPJ}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Building className="h-4 w-4 mr-2" />
                        Pessoa Jurídica
                      </Button>
                      
                    </div>
                  </div>
                </div>

                {/* Lista de proponentes */}
                <div className="space-y-4">
                  {proponentes.map((proponente) => (
                    <Card key={proponente.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Proponente</span>
                              <Badge 
                                variant={proponente.tipo === "Pessoa Física" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {proponente.tipo}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900">{proponente.nome}</h3>
                            <div className="space-y-1">
                              <span className="text-sm text-gray-500">Endereço</span>
                              <p className="text-sm text-gray-700">{proponente.endereco}</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditarProponente(proponente)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Modal de Registro */}
            <Dialog open={isModalRegistroAberto} onOpenChange={setIsModalRegistroAberto}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Registrar {tipoRegistro === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Campos Básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-nome">
                        {tipoRegistro === "PF" ? "Nome Completo" : "Razão Social"} *
                      </Label>
                      <Input
                        id="reg-nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        placeholder={tipoRegistro === "PF" ? "Nome completo" : "Razão social da empresa"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email *</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-telefone">Telefone</Label>
                      <Input
                        id="reg-telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                        placeholder="(14) 99999-9999"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-documento">
                        {tipoRegistro === "PF" ? "CPF" : "CNPJ"} *
                      </Label>
                      <Input
                        id="reg-documento"
                        value={tipoRegistro === "PF" ? formData.cpf : formData.cnpj}
                        onChange={(e) => handleInputChange(tipoRegistro === "PF" ? "cpf" : "cnpj", e.target.value)}
                        placeholder={tipoRegistro === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-endereco">Endereço *</Label>
                    <Textarea
                      id="reg-endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      placeholder="Endereço completo com CEP"
                      rows={2}
                    />
                  </div>

                  {/* Campos específicos para PF */}
                  {tipoRegistro === "PF" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reg-rg">RG</Label>
                        <Input
                          id="reg-rg"
                          value={formData.rg}
                          onChange={(e) => handleInputChange("rg", e.target.value)}
                          placeholder="00.000.000-0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-nascimento">Data de Nascimento</Label>
                        <Input
                          id="reg-nascimento"
                          value={formData.dataNascimento}
                          onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                          placeholder="DD/MM/AAAA"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="reg-profissao">Profissão</Label>
                        <Input
                          id="reg-profissao"
                          value={formData.profissao}
                          onChange={(e) => handleInputChange("profissao", e.target.value)}
                          placeholder="Profissão ou área de atuação"
                        />
                      </div>
                    </div>
                  )}

                  {/* Campos específicos para PJ */}
                  {tipoRegistro === "PJ" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reg-inscricao">Inscrição Estadual</Label>
                        <Input
                          id="reg-inscricao"
                          value={formData.inscricaoEstadual}
                          onChange={(e) => handleInputChange("inscricaoEstadual", e.target.value)}
                          placeholder="000.000.000.000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-representante">Representante Legal</Label>
                        <Input
                          id="reg-representante"
                          value={formData.representante}
                          onChange={(e) => handleInputChange("representante", e.target.value)}
                          placeholder="Nome do representante"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalRegistroAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSalvarRegistro}
                    className="bg-cultural-primary hover:bg-cultural-primary/90"
                  >
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
                    Editar {proponenteEditando?.tipo} - {proponenteEditando?.nome}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Campos Básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-nome">
                        {tipoRegistro === "PF" ? "Nome Completo" : "Razão Social"} *
                      </Label>
                      <Input
                        id="edit-nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        placeholder={tipoRegistro === "PF" ? "Nome completo" : "Razão social da empresa"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email *</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-telefone">Telefone</Label>
                      <Input
                        id="edit-telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                        placeholder="(14) 99999-9999"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-documento">
                        {tipoRegistro === "PF" ? "CPF" : "CNPJ"}
                      </Label>
                      <Input
                        id="edit-documento"
                        value={tipoRegistro === "PF" ? formData.cpf : formData.cnpj}
                        onChange={(e) => handleInputChange(tipoRegistro === "PF" ? "cpf" : "cnpj", e.target.value)}
                        placeholder={tipoRegistro === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-endereco">Endereço *</Label>
                    <Textarea
                      id="edit-endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      placeholder="Endereço completo com CEP"
                      rows={2}
                    />
                  </div>

                  {/* Campos específicos para PF */}
                  {tipoRegistro === "PF" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-rg">RG</Label>
                        <Input
                          id="edit-rg"
                          value={formData.rg}
                          onChange={(e) => handleInputChange("rg", e.target.value)}
                          placeholder="00.000.000-0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-nascimento">Data de Nascimento</Label>
                        <Input
                          id="edit-nascimento"
                          value={formData.dataNascimento}
                          onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                          placeholder="DD/MM/AAAA"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-profissao">Profissão</Label>
                        <Input
                          id="edit-profissao"
                          value={formData.profissao}
                          onChange={(e) => handleInputChange("profissao", e.target.value)}
                          placeholder="Profissão ou área de atuação"
                        />
                      </div>
                    </div>
                  )}

                  {/* Campos específicos para PJ */}
                  {tipoRegistro === "PJ" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-inscricao">Inscrição Estadual</Label>
                        <Input
                          id="edit-inscricao"
                          value={formData.inscricaoEstadual}
                          onChange={(e) => handleInputChange("inscricaoEstadual", e.target.value)}
                          placeholder="000.000.000.000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-representante">Representante Legal</Label>
                        <Input
                          id="edit-representante"
                          value={formData.representante}
                          onChange={(e) => handleInputChange("representante", e.target.value)}
                          placeholder="Nome do representante"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalEdicaoAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSalvarEdicao}
                    className="bg-cultural-primary hover:bg-cultural-primary/90"
                  >
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MeusProponentes;