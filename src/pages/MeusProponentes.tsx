import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
    // Campos básicos
    nome: "",
    nomeArtistico: "",
    email: "",
    telefone: "",
    endereco: "",
    cep: "",
    cidade: "",
    estado: "",

    // Campos PF específicos
    cpf: "",
    rg: "",
    dataNascimento: "",
    miniCurriculo: "",
    comunidadeTradicional: "",
    outraComunidade: "",
    genero: "",
    raca: "",
    pcd: "",
    tipoDeficiencia: "",
    outraDeficiencia: "",
    escolaridade: "",
    rendaMensal: "",
    programaSocial: "",
    outroProgramaSocial: "",
    concorreCotas: "",
    tipoCotas: "",
    funcaoArtistica: "",
    outraFuncaoArtistica: "",
    representaColetivo: "",
    nomeColetivo: "",
    anoColetivo: "",
    quantidadePessoas: "",
    membrosColetivo: "",

    // Campos PJ
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    enderecoSede: "",
    numeroRepresentantes: "",
    nomeRepresentante: "",
    cpfRepresentante: "",
    emailRepresentante: "",
    telefoneRepresentante: "",
    generoRepresentante: "",
    racaRepresentante: "",
    pcdRepresentante: "",
    tipoDeficienciaRepresentante: "",
    outraDeficienciaRepresentante: "",
    escolaridadeRepresentante: ""
  });

  // Funções para registro de novos proponentes
  const handleRegistrarPF = () => {
    setTipoRegistro("PF");
    setProponenteEditando(null);
    setFormData({
      nome: "", nomeArtistico: "", email: "", telefone: "", endereco: "", cep: "", cidade: "", estado: "",
      cpf: "", rg: "", dataNascimento: "", miniCurriculo: "", comunidadeTradicional: "", outraComunidade: "",
      genero: "", raca: "", pcd: "", tipoDeficiencia: "", outraDeficiencia: "", escolaridade: "", rendaMensal: "",
      programaSocial: "", outroProgramaSocial: "", concorreCotas: "", tipoCotas: "", funcaoArtistica: "", outraFuncaoArtistica: "",
      representaColetivo: "", nomeColetivo: "", anoColetivo: "", quantidadePessoas: "", membrosColetivo: "",
      cnpj: "", razaoSocial: "", nomeFantasia: "", enderecoSede: "", numeroRepresentantes: "", nomeRepresentante: "",
      cpfRepresentante: "", emailRepresentante: "", telefoneRepresentante: "", generoRepresentante: "", racaRepresentante: "",
      pcdRepresentante: "", tipoDeficienciaRepresentante: "", outraDeficienciaRepresentante: "", escolaridadeRepresentante: ""
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
      nome: "", nomeArtistico: "", email: "", telefone: "", endereco: "", cep: "", cidade: "", estado: "",
      cpf: "", rg: "", dataNascimento: "", miniCurriculo: "", comunidadeTradicional: "", outraComunidade: "",
      genero: "", raca: "", pcd: "", tipoDeficiencia: "", outraDeficiencia: "", escolaridade: "", rendaMensal: "",
      programaSocial: "", outroProgramaSocial: "", concorreCotas: "", tipoCotas: "", funcaoArtistica: "", outraFuncaoArtistica: "",
      representaColetivo: "", nomeColetivo: "", anoColetivo: "", quantidadePessoas: "", membrosColetivo: "",
      cnpj: "", razaoSocial: "", nomeFantasia: "", enderecoSede: "", numeroRepresentantes: "", nomeRepresentante: "",
      cpfRepresentante: "", emailRepresentante: "", telefoneRepresentante: "", generoRepresentante: "", racaRepresentante: "",
      pcdRepresentante: "", tipoDeficienciaRepresentante: "", outraDeficienciaRepresentante: "", escolaridadeRepresentante: ""
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
      nomeArtistico: proponente.nomeArtistico || "",
      email: proponente.email || "",
      telefone: proponente.telefone || "",
      endereco: proponente.endereco,
      cep: proponente.cep || "",
      cidade: proponente.cidade || "",
      estado: proponente.estado || "",
      cpf: proponente.cpf || "",
      rg: proponente.rg || "",
      dataNascimento: proponente.dataNascimento || "",
      miniCurriculo: proponente.miniCurriculo || "",
      comunidadeTradicional: proponente.comunidadeTradicional || "",
      outraComunidade: proponente.outraComunidade || "",
      genero: proponente.genero || "",
      raca: proponente.raca || "",
      pcd: proponente.pcd || "",
      tipoDeficiencia: proponente.tipoDeficiencia || "",
      outraDeficiencia: proponente.outraDeficiencia || "",
      escolaridade: proponente.escolaridade || "",
      rendaMensal: proponente.rendaMensal || "",
      programaSocial: proponente.programaSocial || "",
      outroProgramaSocial: proponente.outroProgramaSocial || "",
      concorreCotas: proponente.concorreCotas || "",
      tipoCotas: proponente.tipoCotas || "",
      funcaoArtistica: proponente.funcaoArtistica || "",
      outraFuncaoArtistica: proponente.outraFuncaoArtistica || "",
      representaColetivo: proponente.representaColetivo || "",
      nomeColetivo: proponente.nomeColetivo || "",
      anoColetivo: proponente.anoColetivo || "",
      quantidadePessoas: proponente.quantidadePessoas || "",
      membrosColetivo: proponente.membrosColetivo || "",
      cnpj: proponente.cnpj || "",
      razaoSocial: proponente.razaoSocial || "",
      nomeFantasia: proponente.nomeFantasia || "",
      enderecoSede: proponente.enderecoSede || "",
      numeroRepresentantes: proponente.numeroRepresentantes || "",
      nomeRepresentante: proponente.nomeRepresentante || "",
      cpfRepresentante: proponente.cpfRepresentante || "",
      emailRepresentante: proponente.emailRepresentante || "",
      telefoneRepresentante: proponente.telefoneRepresentante || "",
      generoRepresentante: proponente.generoRepresentante || "",
      racaRepresentante: proponente.racaRepresentante || "",
      pcdRepresentante: proponente.pcdRepresentante || "",
      tipoDeficienciaRepresentante: proponente.tipoDeficienciaRepresentante || "",
      outraDeficienciaRepresentante: proponente.outraDeficienciaRepresentante || "",
      escolaridadeRepresentante: proponente.escolaridadeRepresentante || ""
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
          <ProponenteHeader />
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
                
                <div className="space-y-6">
                  {/* Campos específicos para PF */}
                  {tipoRegistro === "PF" && (
                    <>
                      {/* Dados Básicos */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Dados Básicos</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reg-nome">Nome Completo *</Label>
                            <Input
                              id="reg-nome"
                              value={formData.nome}
                              onChange={(e) => handleInputChange("nome", e.target.value)}
                              placeholder="Nome completo"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-nome-artistico">Nome artístico ou nome social (se houver)</Label>
                            <Input
                              id="reg-nome-artistico"
                              value={formData.nomeArtistico}
                              onChange={(e) => handleInputChange("nomeArtistico", e.target.value)}
                              placeholder="Nome artístico ou social"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reg-cpf">CPF *</Label>
                            <Input
                              id="reg-cpf"
                              value={formData.cpf}
                              onChange={(e) => handleInputChange("cpf", e.target.value)}
                              placeholder="000.000.000-00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-rg">RG *</Label>
                            <Input
                              id="reg-rg"
                              value={formData.rg}
                              onChange={(e) => handleInputChange("rg", e.target.value)}
                              placeholder="00.000.000-0"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reg-nascimento">Data de nascimento *</Label>
                            <Input
                              id="reg-nascimento"
                              type="date"
                              value={formData.dataNascimento}
                              onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-email">E-mail *</Label>
                            <Input
                              id="reg-email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              placeholder="email@exemplo.com"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="reg-telefone">Telefone *</Label>
                          <Input
                            id="reg-telefone"
                            value={formData.telefone}
                            onChange={(e) => handleInputChange("telefone", e.target.value)}
                            placeholder="(14) 99999-9999"
                          />
                        </div>
                      </div>

                      {/* Endereço */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>

                        <div>
                          <Label htmlFor="reg-endereco">Endereço completo *</Label>
                          <Textarea
                            id="reg-endereco"
                            value={formData.endereco}
                            onChange={(e) => handleInputChange("endereco", e.target.value)}
                            placeholder="Rua, número, bairro"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="reg-cep">CEP *</Label>
                            <Input
                              id="reg-cep"
                              value={formData.cep}
                              onChange={(e) => handleInputChange("cep", e.target.value)}
                              placeholder="00000-000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-cidade">Cidade *</Label>
                            <Input
                              id="reg-cidade"
                              value={formData.cidade}
                              onChange={(e) => handleInputChange("cidade", e.target.value)}
                              placeholder="Cidade"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-estado">Estado *</Label>
                            <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SP">São Paulo</SelectItem>
                                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                <SelectItem value="MG">Minas Gerais</SelectItem>
                                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                <SelectItem value="PR">Paraná</SelectItem>
                                <SelectItem value="SC">Santa Catarina</SelectItem>
                                <SelectItem value="GO">Goiás</SelectItem>
                                <SelectItem value="MT">Mato Grosso</SelectItem>
                                <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                <SelectItem value="DF">Distrito Federal</SelectItem>
                                <SelectItem value="BA">Bahia</SelectItem>
                                <SelectItem value="PE">Pernambuco</SelectItem>
                                <SelectItem value="CE">Ceará</SelectItem>
                                <SelectItem value="PA">Pará</SelectItem>
                                <SelectItem value="MA">Maranhão</SelectItem>
                                <SelectItem value="PB">Paraíba</SelectItem>
                                <SelectItem value="ES">Espírito Santo</SelectItem>
                                <SelectItem value="PI">Piauí</SelectItem>
                                <SelectItem value="AL">Alagoas</SelectItem>
                                <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                <SelectItem value="RO">Rondônia</SelectItem>
                                <SelectItem value="AC">Acre</SelectItem>
                                <SelectItem value="AM">Amazonas</SelectItem>
                                <SelectItem value="RR">Roraima</SelectItem>
                                <SelectItem value="AP">Amapá</SelectItem>
                                <SelectItem value="TO">Tocantins</SelectItem>
                                <SelectItem value="SE">Sergipe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Mini Currículo */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Experiência Cultural</h3>

                        <div>
                          <Label htmlFor="reg-curriculo">Mini Currículo ou Mini portfólio</Label>
                          <Textarea
                            id="reg-curriculo"
                            value={formData.miniCurriculo}
                            onChange={(e) => handleInputChange("miniCurriculo", e.target.value)}
                            placeholder="Escreva aqui um resumo do seu currículo destacando as principais atuações culturais realizadas. Você pode encaminhar o currículo em anexo, se quiser."
                            rows={4}
                          />
                        </div>
                      </div>

                      {/* Comunidade Tradicional */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Comunidade Tradicional</h3>

                        <div>
                          <Label>Pertence a alguma comunidade tradicional? *</Label>
                          <RadioGroup
                            value={formData.comunidadeTradicional}
                            onValueChange={(value) => handleInputChange("comunidadeTradicional", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao" id="com-nao" />
                              <Label htmlFor="com-nao">Não pertenço a comunidade tradicional</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="extrativistas" id="com-ext" />
                              <Label htmlFor="com-ext">Comunidades Extrativistas</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ribeirinhas" id="com-rib" />
                              <Label htmlFor="com-rib">Comunidades Ribeirinhas</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rurais" id="com-rur" />
                              <Label htmlFor="com-rur">Comunidades Rurais</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="indigenas" id="com-ind" />
                              <Label htmlFor="com-ind">Indígenas</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ciganos" id="com-cig" />
                              <Label htmlFor="com-cig">Povos Ciganos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pescadores" id="com-pesc" />
                              <Label htmlFor="com-pesc">Pescadores(as) Artesanais</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="terreiro" id="com-terr" />
                              <Label htmlFor="com-terr">Povos de Terreiro</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="quilombolas" id="com-quil" />
                              <Label htmlFor="com-quil">Quilombolas</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="outra" id="com-outra" />
                              <Label htmlFor="com-outra">Outra comunidade tradicional</Label>
                            </div>
                          </RadioGroup>

                          {formData.comunidadeTradicional === "outra" && (
                            <Input
                              value={formData.outraComunidade}
                              onChange={(e) => handleInputChange("outraComunidade", e.target.value)}
                              placeholder="Indique qual comunidade tradicional"
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>

                      {/* Gênero */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Identidade de Gênero</h3>

                        <div>
                          <Label>Gênero *</Label>
                          <RadioGroup
                            value={formData.genero}
                            onValueChange={(value) => handleInputChange("genero", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mulher-cis" id="gen-mcis" />
                              <Label htmlFor="gen-mcis">Mulher cisgênero</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="homem-cis" id="gen-hcis" />
                              <Label htmlFor="gen-hcis">Homem cisgênero</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mulher-trans" id="gen-mtrans" />
                              <Label htmlFor="gen-mtrans">Mulher Transgênero</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="homem-trans" id="gen-htrans" />
                              <Label htmlFor="gen-htrans">Homem Transgênero</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-binaria" id="gen-nb" />
                              <Label htmlFor="gen-nb">Pessoa Não Binária</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-informar" id="gen-ni" />
                              <Label htmlFor="gen-ni">Não informar</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* Raça */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Raça, Cor ou Etnia</h3>

                        <div>
                          <Label>Raça, cor ou etnia *</Label>
                          <RadioGroup
                            value={formData.raca}
                            onValueChange={(value) => handleInputChange("raca", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="branca" id="raca-branca" />
                              <Label htmlFor="raca-branca">Branca</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="preta" id="raca-preta" />
                              <Label htmlFor="raca-preta">Preta</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="parda" id="raca-parda" />
                              <Label htmlFor="raca-parda">Parda</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="indigena" id="raca-indigena" />
                              <Label htmlFor="raca-indigena">Indígena</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="amarela" id="raca-amarela" />
                              <Label htmlFor="raca-amarela">Amarela</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* PCD */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Pessoa com Deficiência</h3>

                        <div>
                          <Label>Você é uma Pessoa com Deficiência - PCD? *</Label>
                          <RadioGroup
                            value={formData.pcd}
                            onValueChange={(value) => handleInputChange("pcd", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sim" id="pcd-sim" />
                              <Label htmlFor="pcd-sim">Sim</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao" id="pcd-nao" />
                              <Label htmlFor="pcd-nao">Não</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {formData.pcd === "sim" && (
                          <div>
                            <Label>Qual tipo de deficiência?</Label>
                            <RadioGroup
                              value={formData.tipoDeficiencia}
                              onValueChange={(value) => handleInputChange("tipoDeficiencia", value)}
                              className="mt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="auditiva" id="def-aud" />
                                <Label htmlFor="def-aud">Auditiva</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fisica" id="def-fis" />
                                <Label htmlFor="def-fis">Física</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="intelectual" id="def-int" />
                                <Label htmlFor="def-int">Intelectual</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="multipla" id="def-mult" />
                                <Label htmlFor="def-mult">Múltipla</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="visual" id="def-vis" />
                                <Label htmlFor="def-vis">Visual</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="outro" id="def-outro" />
                                <Label htmlFor="def-outro">Outro tipo</Label>
                              </div>
                            </RadioGroup>

                            {formData.tipoDeficiencia === "outro" && (
                              <Input
                                value={formData.outraDeficiencia}
                                onChange={(e) => handleInputChange("outraDeficiencia", e.target.value)}
                                placeholder="Indique qual tipo de deficiência"
                                className="mt-2"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Escolaridade */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Escolaridade</h3>

                        <div>
                          <Label>Qual o seu grau de escolaridade? *</Label>
                          <RadioGroup
                            value={formData.escolaridade}
                            onValueChange={(value) => handleInputChange("escolaridade", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sem-educacao" id="esc-sem" />
                              <Label htmlFor="esc-sem">Não tenho Educação Formal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fundamental-inc" id="esc-fund-inc" />
                              <Label htmlFor="esc-fund-inc">Ensino Fundamental Incompleto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fundamental-comp" id="esc-fund-comp" />
                              <Label htmlFor="esc-fund-comp">Ensino Fundamental Completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medio-inc" id="esc-med-inc" />
                              <Label htmlFor="esc-med-inc">Ensino Médio Incompleto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medio-comp" id="esc-med-comp" />
                              <Label htmlFor="esc-med-comp">Ensino Médio Completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="tecnico" id="esc-tec" />
                              <Label htmlFor="esc-tec">Curso Técnico Completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="superior-inc" id="esc-sup-inc" />
                              <Label htmlFor="esc-sup-inc">Ensino Superior Incompleto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="superior-comp" id="esc-sup-comp" />
                              <Label htmlFor="esc-sup-comp">Ensino Superior Completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pos-comp" id="esc-pos-comp" />
                              <Label htmlFor="esc-pos-comp">Pós Graduação Completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pos-inc" id="esc-pos-inc" />
                              <Label htmlFor="esc-pos-inc">Pós-Graduação Incompleto</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* Renda */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Renda</h3>

                        <div>
                          <Label>Qual a sua renda mensal fixa individual (média mensal bruta aproximada) nos últimos 3 meses? *</Label>
                          <p className="text-sm text-gray-500 mb-2">Calcule fazendo uma média das suas remunerações nos últimos 3 meses. Em 2023, o salário mínimo foi fixado em R$ 1.320,00.</p>
                          <RadioGroup
                            value={formData.rendaMensal}
                            onValueChange={(value) => handleInputChange("rendaMensal", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nenhuma" id="renda-nenhuma" />
                              <Label htmlFor="renda-nenhuma">Nenhuma renda</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ate-1" id="renda-1" />
                              <Label htmlFor="renda-1">Até 1 salário mínimo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1-3" id="renda-1-3" />
                              <Label htmlFor="renda-1-3">De 1 a 3 salários mínimos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="3-5" id="renda-3-5" />
                              <Label htmlFor="renda-3-5">De 3 a 5 salários mínimos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="5-8" id="renda-5-8" />
                              <Label htmlFor="renda-5-8">De 5 a 8 salários mínimos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="8-10" id="renda-8-10" />
                              <Label htmlFor="renda-8-10">De 8 a 10 salários mínimos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="acima-10" id="renda-acima-10" />
                              <Label htmlFor="renda-acima-10">Acima de 10 salários mínimos</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* Programa Social */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Programa Social</h3>

                        <div>
                          <Label>Você é beneficiário de algum programa social? *</Label>
                          <RadioGroup
                            value={formData.programaSocial}
                            onValueChange={(value) => handleInputChange("programaSocial", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao" id="prog-nao" />
                              <Label htmlFor="prog-nao">Não</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bolsa-familia" id="prog-bf" />
                              <Label htmlFor="prog-bf">Bolsa família</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bpc" id="prog-bpc" />
                              <Label htmlFor="prog-bpc">Benefício de Prestação Continuada</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="outro" id="prog-outro" />
                              <Label htmlFor="prog-outro">Outro</Label>
                            </div>
                          </RadioGroup>

                          {formData.programaSocial === "outro" && (
                            <Input
                              value={formData.outroProgramaSocial}
                              onChange={(e) => handleInputChange("outroProgramaSocial", e.target.value)}
                              placeholder="Indique qual programa social"
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>

                      {/* Cotas */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Cotas</h3>

                        <div>
                          <Label>Vai concorrer às cotas? *</Label>
                          <RadioGroup
                            value={formData.concorreCotas}
                            onValueChange={(value) => handleInputChange("concorreCotas", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sim" id="cotas-sim" />
                              <Label htmlFor="cotas-sim">Sim</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao" id="cotas-nao" />
                              <Label htmlFor="cotas-nao">Não</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {formData.concorreCotas === "sim" && (
                          <div>
                            <Label>Qual? *</Label>
                            <RadioGroup
                              value={formData.tipoCotas}
                              onValueChange={(value) => handleInputChange("tipoCotas", value)}
                              className="mt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pessoa-negra" id="cota-negra" />
                                <Label htmlFor="cota-negra">Pessoa negra</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pessoa-indigena" id="cota-indigena" />
                                <Label htmlFor="cota-indigena">Pessoa indígena</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pessoa-deficiencia" id="cota-pcd" />
                                <Label htmlFor="cota-pcd">Pessoa com deficiência</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </div>

                      {/* Função Artística */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Função no Campo Artístico</h3>

                        <div>
                          <Label>Qual a sua principal função/profissão no campo artístico e cultural? *</Label>
                          <RadioGroup
                            value={formData.funcaoArtistica}
                            onValueChange={(value) => handleInputChange("funcaoArtistica", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="artista" id="func-artista" />
                              <Label htmlFor="func-artista">Artista, Artesão(a), Brincante, Criador(a) e afins</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="instrutor" id="func-instrutor" />
                              <Label htmlFor="func-instrutor">Instrutor(a), oficineiro(a), educador(a) artístico(a)-cultural e afins</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="curador" id="func-curador" />
                              <Label htmlFor="func-curador">Curador(a), Programador(a) e afins</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="produtor" id="func-produtor" />
                              <Label htmlFor="func-produtor">Produtor(a)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="gestor" id="func-gestor" />
                              <Label htmlFor="func-gestor">Gestor(a)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="tecnico" id="func-tecnico" />
                              <Label htmlFor="func-tecnico">Técnico(a)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="consultor" id="func-consultor" />
                              <Label htmlFor="func-consultor">Consultor(a), Pesquisador(a) e afins</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="outro" id="func-outro" />
                              <Label htmlFor="func-outro">Outro(a)s</Label>
                            </div>
                          </RadioGroup>

                          {formData.funcaoArtistica === "outro" && (
                            <Input
                              value={formData.outraFuncaoArtistica}
                              onChange={(e) => handleInputChange("outraFuncaoArtistica", e.target.value)}
                              placeholder="Especifique sua função"
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>

                      {/* Coletivo */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Representação de Coletivo</h3>

                        <div>
                          <Label>Você está representando um coletivo (sem CNPJ)? *</Label>
                          <RadioGroup
                            value={formData.representaColetivo}
                            onValueChange={(value) => handleInputChange("representaColetivo", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao" id="coletivo-nao" />
                              <Label htmlFor="coletivo-nao">Não</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sim" id="coletivo-sim" />
                              <Label htmlFor="coletivo-sim">Sim</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {formData.representaColetivo === "sim" && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="nome-coletivo">Nome do coletivo *</Label>
                              <Input
                                id="nome-coletivo"
                                value={formData.nomeColetivo}
                                onChange={(e) => handleInputChange("nomeColetivo", e.target.value)}
                                placeholder="Nome do coletivo"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="ano-coletivo">Ano de Criação *</Label>
                                <Input
                                  id="ano-coletivo"
                                  type="number"
                                  value={formData.anoColetivo}
                                  onChange={(e) => handleInputChange("anoColetivo", e.target.value)}
                                  placeholder="Ano de criação"
                                />
                              </div>
                              <div>
                                <Label htmlFor="quantidade-pessoas">Quantas pessoas fazem parte do coletivo? *</Label>
                                <Input
                                  id="quantidade-pessoas"
                                  type="number"
                                  value={formData.quantidadePessoas}
                                  onChange={(e) => handleInputChange("quantidadePessoas", e.target.value)}
                                  placeholder="Número de pessoas"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="membros-coletivo">Nome completo e CPF das pessoas que compõem o coletivo *</Label>
                              <Textarea
                                id="membros-coletivo"
                                value={formData.membrosColetivo}
                                onChange={(e) => handleInputChange("membrosColetivo", e.target.value)}
                                placeholder="Nome completo - CPF&#10;Nome completo - CPF&#10;..."
                                rows={4}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Campos específicos para PJ */}
                  {tipoRegistro === "PJ" && (
                    <>
                      {/* Dados do Agente Cultural */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">1. DADOS DO AGENTE CULTURAL</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reg-razao">Razão Social *</Label>
                            <Input
                              id="reg-razao"
                              value={formData.razaoSocial}
                              onChange={(e) => handleInputChange("razaoSocial", e.target.value)}
                              placeholder="Razão social da empresa"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-nome-fantasia">Nome fantasia</Label>
                            <Input
                              id="reg-nome-fantasia"
                              value={formData.nomeFantasia}
                              onChange={(e) => handleInputChange("nomeFantasia", e.target.value)}
                              placeholder="Nome fantasia"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reg-cnpj">CNPJ *</Label>
                            <Input
                              id="reg-cnpj"
                              value={formData.cnpj}
                              onChange={(e) => handleInputChange("cnpj", e.target.value)}
                              placeholder="00.000.000/0001-00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-estado">Estado *</Label>
                            <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SP">São Paulo</SelectItem>
                                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                <SelectItem value="MG">Minas Gerais</SelectItem>
                                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                <SelectItem value="PR">Paraná</SelectItem>
                                <SelectItem value="SC">Santa Catarina</SelectItem>
                                <SelectItem value="GO">Goiás</SelectItem>
                                <SelectItem value="MT">Mato Grosso</SelectItem>
                                <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                <SelectItem value="DF">Distrito Federal</SelectItem>
                                <SelectItem value="BA">Bahia</SelectItem>
                                <SelectItem value="PE">Pernambuco</SelectItem>
                                <SelectItem value="CE">Ceará</SelectItem>
                                <SelectItem value="PA">Pará</SelectItem>
                                <SelectItem value="MA">Maranhão</SelectItem>
                                <SelectItem value="PB">Paraíba</SelectItem>
                                <SelectItem value="ES">Espírito Santo</SelectItem>
                                <SelectItem value="PI">Piauí</SelectItem>
                                <SelectItem value="AL">Alagoas</SelectItem>
                                <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                <SelectItem value="RO">Rondônia</SelectItem>
                                <SelectItem value="AC">Acre</SelectItem>
                                <SelectItem value="AM">Amazonas</SelectItem>
                                <SelectItem value="RR">Roraima</SelectItem>
                                <SelectItem value="AP">Amapá</SelectItem>
                                <SelectItem value="TO">Tocantins</SelectItem>
                                <SelectItem value="SE">Sergipe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reg-endereco-sede">Endereço da sede *</Label>
                            <Textarea
                              id="reg-endereco-sede"
                              value={formData.enderecoSede}
                              onChange={(e) => handleInputChange("enderecoSede", e.target.value)}
                              placeholder="Endereço completo da sede"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-cidade">Cidade *</Label>
                            <Input
                              id="reg-cidade"
                              value={formData.cidade}
                              onChange={(e) => handleInputChange("cidade", e.target.value)}
                              placeholder="Cidade"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dados do Representante Legal */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Dados do Representante Legal</h3>

                        <div>
                          <Label htmlFor="reg-numero-representantes">Número de representantes legais *</Label>
                          <Input
                            id="reg-numero-representantes"
                            type="number"
                            value={formData.numeroRepresentantes}
                            onChange={(e) => handleInputChange("numeroRepresentantes", e.target.value)}
                            placeholder="Número de representantes"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reg-nome-representante">Nome do representante legal *</Label>
                            <Input
                              id="reg-nome-representante"
                              value={formData.nomeRepresentante}
                              onChange={(e) => handleInputChange("nomeRepresentante", e.target.value)}
                              placeholder="Nome completo do representante"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-cpf-representante">CPF do representante legal *</Label>
                            <Input
                              id="reg-cpf-representante"
                              value={formData.cpfRepresentante}
                              onChange={(e) => handleInputChange("cpfRepresentante", e.target.value)}
                              placeholder="000.000.000-00"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reg-email-representante">E-mail do representante legal *</Label>
                            <Input
                              id="reg-email-representante"
                              type="email"
                              value={formData.emailRepresentante}
                              onChange={(e) => handleInputChange("emailRepresentante", e.target.value)}
                              placeholder="email@exemplo.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-telefone-representante">Telefone do representante legal *</Label>
                            <Input
                              id="reg-telefone-representante"
                              value={formData.telefoneRepresentante}
                              onChange={(e) => handleInputChange("telefoneRepresentante", e.target.value)}
                              placeholder="(14) 99999-9999"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gênero do Representante */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Dados do Representante Legal</h3>

                        <div>
                          <Label>Gênero do representante legal *</Label>
                          <RadioGroup
                            value={formData.generoRepresentante}
                            onValueChange={(value) => handleInputChange("generoRepresentante", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mulher-cis" id="gen-rep-mcis" />
                              <Label htmlFor="gen-rep-mcis">Mulher cisgênero</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="homem-cis" id="gen-rep-hcis" />
                              <Label htmlFor="gen-rep-hcis">Homem cisgênero</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mulher-trans" id="gen-rep-mtrans" />
                              <Label htmlFor="gen-rep-mtrans">Mulher Transgênero</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="homem-trans" id="gen-rep-htrans" />
                              <Label htmlFor="gen-rep-htrans">Homem Transgênero</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-binaria" id="gen-rep-nb" />
                              <Label htmlFor="gen-rep-nb">Não Binária</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-informar" id="gen-rep-ni" />
                              <Label htmlFor="gen-rep-ni">Não informar</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* Raça/Cor/Etnia do Representante */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Raça/Cor/Etnia do Representante Legal</h3>

                        <div>
                          <Label>Raça/cor/etnia do representante legal *</Label>
                          <RadioGroup
                            value={formData.racaRepresentante}
                            onValueChange={(value) => handleInputChange("racaRepresentante", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="branca" id="raca-rep-branca" />
                              <Label htmlFor="raca-rep-branca">Branca</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="preta" id="raca-rep-preta" />
                              <Label htmlFor="raca-rep-preta">Preta</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="parda" id="raca-rep-parda" />
                              <Label htmlFor="raca-rep-parda">Parda</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="amarela" id="raca-rep-amarela" />
                              <Label htmlFor="raca-rep-amarela">Amarela</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="indigena" id="raca-rep-indigena" />
                              <Label htmlFor="raca-rep-indigena">Indígena</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* PCD do Representante */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Pessoa com Deficiência - Representante</h3>

                        <div>
                          <Label>Representante legal é pessoa com deficiência - PCD? *</Label>
                          <RadioGroup
                            value={formData.pcdRepresentante}
                            onValueChange={(value) => handleInputChange("pcdRepresentante", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sim" id="pcd-rep-sim" />
                              <Label htmlFor="pcd-rep-sim">Sim</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao" id="pcd-rep-nao" />
                              <Label htmlFor="pcd-rep-nao">Não</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {formData.pcdRepresentante === "sim" && (
                          <div>
                            <Label>Qual o tipo de deficiência?</Label>
                            <RadioGroup
                              value={formData.tipoDeficienciaRepresentante}
                              onValueChange={(value) => handleInputChange("tipoDeficienciaRepresentante", value)}
                              className="mt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="auditiva" id="def-rep-aud" />
                                <Label htmlFor="def-rep-aud">Auditiva</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fisica" id="def-rep-fis" />
                                <Label htmlFor="def-rep-fis">Física</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="intelectual" id="def-rep-int" />
                                <Label htmlFor="def-rep-int">Intelectual</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="multipla" id="def-rep-mult" />
                                <Label htmlFor="def-rep-mult">Múltipla</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="visual" id="def-rep-vis" />
                                <Label htmlFor="def-rep-vis">Visual</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="outra" id="def-rep-outra" />
                                <Label htmlFor="def-rep-outra">Outra</Label>
                              </div>
                            </RadioGroup>

                            {formData.tipoDeficienciaRepresentante === "outra" && (
                              <Input
                                value={formData.outraDeficienciaRepresentante}
                                onChange={(e) => handleInputChange("outraDeficienciaRepresentante", e.target.value)}
                                placeholder="Indique qual tipo de deficiência"
                                className="mt-2"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Escolaridade do Representante */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Escolaridade do Representante Legal</h3>

                        <div>
                          <Label>Escolaridade do representante legal *</Label>
                          <RadioGroup
                            value={formData.escolaridadeRepresentante}
                            onValueChange={(value) => handleInputChange("escolaridadeRepresentante", value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sem-educacao" id="esc-rep-sem" />
                              <Label htmlFor="esc-rep-sem">Não tenho Educação Formal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fundamental-inc" id="esc-rep-fund-inc" />
                              <Label htmlFor="esc-rep-fund-inc">Ensino Fundamental Incompleto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fundamental-comp" id="esc-rep-fund-comp" />
                              <Label htmlFor="esc-rep-fund-comp">Ensino Fundamental Completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medio-inc" id="esc-rep-med-inc" />
                              <Label htmlFor="esc-rep-med-inc">Ensino Médio Incompleto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medio-comp" id="esc-rep-med-comp" />
                              <Label htmlFor="esc-rep-med-comp">Ensino Médio Completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="tecnico" id="esc-rep-tec" />
                              <Label htmlFor="esc-rep-tec">Curso Técnico completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="superior-inc" id="esc-rep-sup-inc" />
                              <Label htmlFor="esc-rep-sup-inc">Ensino Superior Incompleto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="superior-comp" id="esc-rep-sup-comp" />
                              <Label htmlFor="esc-rep-sup-comp">Ensino Superior Completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pos-comp" id="esc-rep-pos-comp" />
                              <Label htmlFor="esc-rep-pos-comp">Pós Graduação completo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pos-inc" id="esc-rep-pos-inc" />
                              <Label htmlFor="esc-rep-pos-inc">Pós-Graduação Incompleto</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </>
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