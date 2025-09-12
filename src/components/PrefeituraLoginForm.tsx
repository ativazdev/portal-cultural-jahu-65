import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, Building2 } from "lucide-react";

const PrefeituraLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="w-full max-w-md mx-auto shadow-prefeitura border-prefeitura-secondary">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-prefeitura-primary rounded-full flex items-center justify-center">
          <Building2 className="w-8 h-8 text-prefeitura-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-prefeitura-primary">Acesso Prefeitura</h2>
          <p className="text-prefeitura-muted">Entre com suas credenciais institucionais</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
          className="w-full bg-prefeitura-primary hover:bg-prefeitura-primary/90 text-prefeitura-primary-foreground"
          size="lg"
        >
          Entrar no Sistema
        </Button>

        <div className="space-y-3 text-center">
          <a
            href="#"
            className="text-sm text-prefeitura-primary hover:text-prefeitura-primary/80 block"
          >
            Esqueceu sua senha?
          </a>
          <p className="text-xs text-muted-foreground">
            Não tem acesso? Entre em contato com o suporte técnico
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrefeituraLoginForm;