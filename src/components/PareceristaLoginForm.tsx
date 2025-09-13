import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Search, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const PareceristaLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, profile, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        const { error } = await signUp(email, password, "parecerista", fullName);
        if (!error) {
          setIsRegistering(false);
          setEmail("");
          setPassword("");
          setFullName("");
        }
      } else {
        await signIn(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-parecerista border-parecerista-secondary/20">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-12 h-12 bg-parecerista-primary/10 rounded-full flex items-center justify-center mb-4">
          <Search className="w-6 h-6 text-parecerista-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-parecerista-primary">
          {isRegistering ? "Cadastro Parecerista" : "Acesso Parecerista"}
        </CardTitle>
        <CardDescription className="text-parecerista-muted">
          {isRegistering ? "Crie sua conta de análise" : "Entre com suas credenciais de análise"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="fullname-parecerista" className="text-parecerista-muted">
                Nome completo
              </Label>
              <Input
                id="fullname-parecerista"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-parecerista-secondary/30 focus:border-parecerista-primary"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-parecerista-muted">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="parecerista@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-parecerista-secondary/30 focus:border-parecerista-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-parecerista-muted">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-parecerista-secondary/30 focus:border-parecerista-primary pr-10"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-parecerista-muted" />
                ) : (
                  <Eye className="h-4 w-4 text-parecerista-muted" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-parecerista-primary hover:bg-parecerista-primary/90 text-parecerista-primary-foreground"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : (isRegistering ? "Criar Conta" : "Entrar como Parecerista")}
          </Button>
        </form>

        <div className="space-y-4 text-center">
          {!isRegistering && (
            <a
              href="#"
              className="text-sm text-parecerista-primary hover:text-parecerista-accent underline"
            >
              Esqueceu sua senha?
            </a>
          )}
          
          <div className="border-t border-muted pt-4">
            <p className="text-sm text-parecerista-muted mb-3">
              {isRegistering ? "Já tem uma conta?" : "Não tem cadastro?"}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full border-parecerista-secondary text-parecerista-primary hover:bg-parecerista-primary hover:text-parecerista-primary-foreground"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Fazer Login
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Conta de Parecerista
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PareceristaLoginForm;