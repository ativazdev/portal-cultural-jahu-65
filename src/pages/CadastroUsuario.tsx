import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePrefeituraUrl, usePrefeitura } from "@/contexts/PrefeituraContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CadastroUsuario = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  });

  const navigate = useNavigate();
  const { getUrl } = usePrefeituraUrl();
  const { prefeitura } = usePrefeitura();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar senhas
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: 'Erro!',
        description: 'As senhas não coincidem.',
        variant: 'destructive'
      });
      return;
    }

    // Validar tamanho mínimo da senha
    if (formData.senha.length < 6) {
      toast({
        title: 'Erro!',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive'
      });
      return;
    }

    if (!prefeitura?.id) {
      toast({
        title: 'Erro!',
        description: 'Prefeitura não identificada. Por favor, selecione novamente.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Chamar Edge Function de cadastro
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'cadastrar-usuario-proponente',
        {
          body: {
            prefeitura_id: prefeitura.id,
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha
          }
        }
      );

      if (functionError) throw functionError;
      if (functionData?.error) throw new Error(functionData.error);

      toast({
        title: 'Sucesso!',
        description: 'Conta criada com sucesso! Faça login para continuar.',
      });

      // Redirecionar para login
      setTimeout(() => {
        navigate(getUrl('login-proponente'));
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message?.includes('already exists') || error.message?.includes('já existe')) {
        errorMessage = 'Este email já está cadastrado.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro ao cadastrar',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botão Voltar */}
        <Link to={getUrl('login-proponente')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Login
        </Link>

        <Card className="w-full shadow-xl border-purple-200">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-base">
              Cadastre-se para submeter projetos culturais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.senha}
                    onChange={(e) => handleInputChange("senha", e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>

              <div className="text-center pt-4 text-sm text-gray-600">
                <p>
                  Ao criar uma conta, você concorda com nossos{" "}
                  <a href="#" className="text-purple-600 hover:underline">
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-purple-600 hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>

              <div className="text-center pt-4 border-t">
                <Link
                  to={getUrl('login-proponente')}
                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Já tenho conta - Fazer Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informação adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Após criar sua conta:</strong><br />
            Você poderá cadastrar seus proponentes (Pessoa Física, Jurídica, Grupo ou Cooperativa) dentro do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroUsuario;

