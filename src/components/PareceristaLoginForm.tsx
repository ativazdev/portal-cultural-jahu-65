import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Search } from "lucide-react";

const PareceristaLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login Parecerista:", { email, password });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-parecerista border-parecerista-secondary/20">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-12 h-12 bg-parecerista-primary/10 rounded-full flex items-center justify-center mb-4">
          <Search className="w-6 h-6 text-parecerista-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-parecerista-primary">
          Acesso Parecerista
        </CardTitle>
        <CardDescription className="text-parecerista-muted">
          Entre com suas credenciais de análise
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
          >
            Entrar como Parecerista
          </Button>
        </form>

        <div className="space-y-4 text-center">
          <a
            href="#"
            className="text-sm text-parecerista-primary hover:text-parecerista-accent underline"
          >
            Esqueceu sua senha?
          </a>
          
          <p className="text-sm text-parecerista-muted">
            Não tem cadastro?{" "}
            <span className="text-parecerista-primary font-medium">
              Entre em contato com a administração
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PareceristaLoginForm;