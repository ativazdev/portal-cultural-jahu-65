import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Eye, EyeOff } from "lucide-react";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import { supabase } from "@/integrations/supabase/client";

export const ProponenteCadastro = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const { signUp, loading } = useProponenteAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [prefeituraId, setPrefeituraId] = useState<string | null>(null);

  // Buscar o ID da prefeitura pelo nome
  useEffect(() => {
    const buscarPrefeitura = async () => {
      if (!nomePrefeitura) return;
      
      try {
        const { data, error } = await supabase
          .from('prefeituras')
          .select('id')
          .eq('nome', nomePrefeitura)
          .single();
        
        if (!error && data) {
          setPrefeituraId(data.id);
        }
      } catch (error) {
        console.error('Erro ao buscar prefeitura:', error);
      }
    };

    buscarPrefeitura();
  }, [nomePrefeitura]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (!prefeituraId) {
      setError("Prefeitura não encontrada");
      return;
    }

    setError("");
    try {
      const success = await signUp({
        email: formData.email,
        nome: formData.nome,
        password: formData.password,
        prefeitura_id: prefeituraId
      });

      // O signUp já faz o redirect internamente, não precisamos fazer aqui
    } catch (error: any) {
      // Erro já foi tratado no hook
      console.error('Erro no cadastro:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <User className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Cadastro - Proponente</CardTitle>
          <CardDescription>
            Crie sua conta para começar a inscrever projetos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !prefeituraId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Já tem uma conta?{" "}
              <Link
                to={`/${nomePrefeitura}/proponente/login`}
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

