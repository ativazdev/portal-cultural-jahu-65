import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PareceristaHeader } from "@/components/PareceristaHeader";
import { PareceristaSidebar } from "@/components/PareceristaSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Save, Camera, User } from "lucide-react";

const MeuPerfilParecerista = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: "Dr. Carlos Eduardo Silva",
    email: "carlos.silva@email.com",
    telefone: "(14) 99999-9999",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    dataNascimento: "1975-03-15",
    endereco: "Rua das Flores, 123",
    cidade: "Jaú",
    estado: "SP",
    cep: "17201-000",
    
    // Dados Profissionais
    titulacao: "Doutor",
    areaFormacao: "Artes Cênicas",
    instituicao: "UNESP - Universidade Estadual Paulista",
    anoFormacao: "2005",
    experienciaProfissional: "15 anos de experiência em avaliação de projetos culturais, professor universitário na área de teatro e artes cênicas.",
    especializacoes: "Teatro, Performance, Gestão Cultural",
    curriculo: "Link para Currículo Lattes: http://lattes.cnpq.br/1234567890",
    
    // Dados do Sistema
    dataIngresso: "2020-01-15",
    projetosAvaliados: 127,
    modalidadesAtendidas: "Teatro, Dança, Música"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Aqui seria feita a integração com o backend
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso!",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reverter mudanças não salvas
    setIsEditing(false);
    toast({
      title: "Edição cancelada",
      description: "As alterações foram descartadas.",
      variant: "destructive",
    });
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
                  <p className="text-gray-600">Visualize e edite suas informações pessoais e profissionais</p>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </div>

              {/* Avatar e Informações Básicas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback className="text-lg">
                          <User className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                          variant="secondary"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{formData.nome}</h2>
                      <p className="text-gray-600">{formData.titulacao} em {formData.areaFormacao}</p>
                      <p className="text-sm text-gray-500">{formData.instituicao}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Pessoais</CardTitle>
                  <CardDescription>Informações básicas e contato</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        disabled={true}
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={formData.rg}
                        onChange={(e) => handleInputChange('rg', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => handleInputChange('endereco', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select 
                        value={formData.estado} 
                        onValueChange={(value) => handleInputChange('estado', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          {/* Adicionar outros estados conforme necessário */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleInputChange('cep', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados Profissionais */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Profissionais</CardTitle>
                  <CardDescription>Formação acadêmica e experiência profissional</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="titulacao">Titulação</Label>
                      <Select 
                        value={formData.titulacao} 
                        onValueChange={(value) => handleInputChange('titulacao', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Graduação">Graduação</SelectItem>
                          <SelectItem value="Especialização">Especialização</SelectItem>
                          <SelectItem value="Mestrado">Mestrado</SelectItem>
                          <SelectItem value="Doutor">Doutor</SelectItem>
                          <SelectItem value="Pós-Doutor">Pós-Doutor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="areaFormacao">Área de Formação</Label>
                      <Input
                        id="areaFormacao"
                        value={formData.areaFormacao}
                        onChange={(e) => handleInputChange('areaFormacao', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="instituicao">Instituição de Ensino</Label>
                      <Input
                        id="instituicao"
                        value={formData.instituicao}
                        onChange={(e) => handleInputChange('instituicao', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="anoFormacao">Ano de Formação</Label>
                      <Input
                        id="anoFormacao"
                        value={formData.anoFormacao}
                        onChange={(e) => handleInputChange('anoFormacao', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="especializacoes">Especializações</Label>
                      <Input
                        id="especializacoes"
                        value={formData.especializacoes}
                        onChange={(e) => handleInputChange('especializacoes', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Ex: Teatro, Dança, Música"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experienciaProfissional">Experiência Profissional</Label>
                    <Textarea
                      id="experienciaProfissional"
                      value={formData.experienciaProfissional}
                      onChange={(e) => handleInputChange('experienciaProfissional', e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Descreva sua experiência profissional relevante..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="curriculo">Currículo Lattes / Link do Currículo</Label>
                    <Input
                      id="curriculo"
                      value={formData.curriculo}
                      onChange={(e) => handleInputChange('curriculo', e.target.value)}
                      disabled={!isEditing}
                      placeholder="http://lattes.cnpq.br/..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dados do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                  <CardDescription>Dados sobre sua atuação como parecerista</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Data de Ingresso</Label>
                      <Input
                        value={new Date(formData.dataIngresso).toLocaleDateString('pt-BR')}
                        disabled={true}
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label>Projetos Avaliados</Label>
                      <Input
                        value={formData.projetosAvaliados}
                        disabled={true}
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label>Modalidades Atendidas</Label>
                      <Input
                        value={formData.modalidadesAtendidas}
                        disabled={true}
                        className="bg-gray-100"
                      />
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

export default MeuPerfilParecerista;