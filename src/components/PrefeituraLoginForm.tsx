import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, Building2, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const PrefeituraLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, setMockProfile, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Define o perfil mock para prefeitura
      setMockProfile("prefeitura");
      
      if (isRegistering) {
        await signUp(email, password, "prefeitura", fullName);
      } else {
        await signIn(email, password);
      }
      
      // Redireciona diretamente para o dashboard da prefeitura
      setTimeout(() => {
        navigate(getDashboardRoute("prefeitura"));
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-prefeitura border-prefeitura-secondary">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-prefeitura-primary rounded-full flex items-center justify-center">
          <Building2 className="w-8 h-8 text-prefeitura-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-prefeitura-primary">
            {isRegistering ? "Cadastro Prefeitura" : "Acesso Prefeitura"}
          </h2>
          <p className="text-prefeitura-muted">
            {isRegistering ? "Crie sua conta institucional" : "Entre com suas credenciais institucionais"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="fullname-prefeitura" className="text-foreground">
                Nome completo
              </Label>
              <Input
                id="fullname-prefeitura"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-prefeitura-secondary focus:ring-prefeitura-primary"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email-prefeitura" className="text-foreground">
              E-mail institucional
            </Label>
            <Input
              id="email-prefeitura"
              type="email"
              placeholder="prefeitura@jahu.sp.gov.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-prefeitura-secondary focus:ring-prefeitura-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password-prefeitura" className="text-foreground">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password-prefeitura"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-prefeitura-secondary focus:ring-prefeitura-primary pr-10"
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

          <Button
            type="submit"
            className="w-full bg-prefeitura-primary hover:bg-prefeitura-primary/90 text-prefeitura-primary-foreground"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : (isRegistering ? "Criar Conta" : "Entrar no Sistema")}
          </Button>
        </form>

        <div className="space-y-4 text-center">
          {!isRegistering && (
            <a
              href="#"
              className="text-sm text-prefeitura-primary hover:text-prefeitura-primary/80 block"
            >
              Esqueceu sua senha?
            </a>
          )}
          
          
        </div>
      </CardContent>
    </Card>
  );
};

export default PrefeituraLoginForm;