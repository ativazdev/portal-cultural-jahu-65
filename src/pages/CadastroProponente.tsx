import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CadastroProponente = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Cadastro de Proponente
          </h1>
          <p className="text-muted-foreground">
            Crie sua conta para o Sistema PNAB
          </p>
        </div>

        <Card className="w-full shadow-cultural border-cultural-secondary">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-cultural rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-cultural-primary">Nova Conta</h2>
              <p className="text-cultural-muted">Área do Proponente Cultural</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome-completo" className="text-foreground">
                Nome Completo
              </Label>
              <Input
                id="nome-completo"
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.nomeCompleto}
                onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                className="border-cultural-secondary focus:ring-cultural-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-cadastro" className="text-foreground">
                E-mail
              </Label>
              <Input
                id="email-cadastro"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="border-cultural-secondary focus:ring-cultural-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha-cadastro" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha-cadastro"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  className="border-cultural-secondary focus:ring-cultural-primary pr-10"
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

            <div className="space-y-2">
              <Label htmlFor="confirmar-senha" className="text-foreground">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmar-senha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange("confirmarSenha", e.target.value)}
                  className="border-cultural-secondary focus:ring-cultural-primary pr-10"
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
              className="w-full bg-cultural-primary hover:bg-cultural-primary/90 text-cultural-primary-foreground"
              size="lg"
            >
              Cadastrar
            </Button>

            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-cultural-primary hover:text-cultural-primary/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CadastroProponente;