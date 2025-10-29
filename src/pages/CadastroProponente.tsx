import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthProponente } from "@/hooks/useAuthCustom";
import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";

const CadastroProponente = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "PF" as 'PF' | 'PJ' | 'Grupo' | 'COOP',
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    cnpj: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "SP",
    cep: ""
  });

  const { cadastrar, loading } = useAuthProponente();
  const { getUrl } = usePrefeituraUrl();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar senhas
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    // Validar CPF para PF
    if (formData.tipo === 'PF' && !formData.cpf) {
      alert('CPF é obrigatório para Pessoa Física');
      return;
    }

    // Validar CNPJ para PJ
    if (formData.tipo === 'PJ' && !formData.cnpj) {
      alert('CNPJ é obrigatório para Pessoa Jurídica');
      return;
    }

    try {
      await cadastrar(formData);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Botão Voltar */}
        <Link to={getUrl('login-proponente')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Login
        </Link>

        <Card className="w-full shadow-xl border-cultural-secondary">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-cultural rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-cultural-primary">Cadastro de Proponente</h2>
              <p className="text-cultural-muted">Crie sua conta para submeter projetos culturais</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Proponente */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Proponente *</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => handleInputChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    <SelectItem value="Grupo">Grupo/Coletivo</SelectItem>
                    <SelectItem value="COOP">Cooperativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">
                  {formData.tipo === 'PJ' ? 'Razão Social' : 'Nome Completo'} *
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder={formData.tipo === 'PJ' ? "Nome da empresa" : "Seu nome completo"}
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  required
                />
              </div>

              {/* CPF ou CNPJ */}
              {formData.tipo === 'PF' || formData.tipo === 'Grupo' ? (
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange("cnpj", e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email-cadastro">E-mail *</Label>
                <Input
                  id="email-cadastro"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                />
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    type="text"
                    placeholder="Jaú"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    type="text"
                    placeholder="SP"
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                  />
                </div>
              </div>
              
              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha-cadastro">Senha *</Label>
                <div className="relative">
                  <Input
                    id="senha-cadastro"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.senha}
                    onChange={(e) => handleInputChange("senha", e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmar-senha"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleInputChange("confirmarSenha", e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-cultural-primary hover:bg-cultural-primary/90 text-cultural-primary-foreground"
                size="lg"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Criar Conta"}
              </Button>

              <div className="text-center pt-4">
                <Link
                  to={getUrl('login-proponente')}
                  className="inline-flex items-center text-sm text-cultural-primary hover:text-cultural-primary/80"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Já tenho conta - Fazer Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CadastroProponente;