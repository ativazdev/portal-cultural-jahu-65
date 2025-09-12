import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, User, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const ProponenteLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="w-full max-w-md mx-auto shadow-cultural border-cultural-secondary">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-cultural rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-cultural-primary">Área do Proponente</h2>
          <p className="text-cultural-muted">Acesse sua área criativa</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email-proponente" className="text-foreground">
            E-mail
          </Label>
          <Input
            id="email-proponente"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-cultural-secondary focus:ring-cultural-primary"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password-proponente" className="text-foreground">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password-proponente"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <Button
          className="w-full bg-cultural-primary hover:bg-cultural-primary/90 text-cultural-primary-foreground"
          size="lg"
        >
          Entrar na Área
        </Button>

        <div className="space-y-4 text-center">
          <a
            href="#"
            className="text-sm text-cultural-primary hover:text-cultural-primary/80 block"
          >
            Esqueceu sua senha?
          </a>
          
          <div className="border-t border-muted pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Ainda não tem cadastro?
            </p>
            <Link to="/cadastro-proponente">
              <Button
                variant="outline"
                className="w-full border-cultural-secondary text-cultural-primary hover:bg-cultural-primary hover:text-cultural-primary-foreground"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Conta de Proponente
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProponenteLoginForm;