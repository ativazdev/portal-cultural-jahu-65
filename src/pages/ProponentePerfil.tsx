import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";

export const ProponentePerfil = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proponente, refresh } = useProponenteAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (proponente) {
      setFormData({
        nome: proponente.nome || "",
        email: proponente.email || ""
      });
    }
  }, [proponente]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      setError("O nome completo é obrigatório");
      return false;
    }

    if (!formData.email.trim()) {
      setError("O email é obrigatório");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!proponente?.id) {
      setError("Erro ao identificar o usuário");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authClient = getAuthenticatedSupabaseClient('proponente');
      
      // Verificar se o email foi alterado e se já existe outro usuário com esse email
      if (formData.email.toLowerCase() !== proponente.email.toLowerCase()) {
        const { data: existingUser, error: checkError } = await authClient
          .from('usuarios_proponentes')
          .select('id')
          .eq('email', formData.email.toLowerCase())
          .neq('id', proponente.id)
          .maybeSingle();

        if (checkError) {
          throw new Error("Erro ao verificar email");
        }

        if (existingUser) {
          setError("Este email já está em uso por outro usuário");
          setLoading(false);
          return;
        }
      }

      // Atualizar o perfil
      const { error: updateError } = await authClient
        .from('usuarios_proponentes')
        .update({
          nome: formData.nome.trim(),
          email: formData.email.toLowerCase().trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', proponente.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram atualizados com sucesso",
      });

      // Atualizar o contexto de autenticação
      await refresh();

      // Navegar de volta ou para a página anterior
      navigate(`/${nomePrefeitura}/proponente/editais`);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setError(error.message || "Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProponenteLayout 
      title="Editar Perfil"
      description="Atualize suas informações pessoais"
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Informações Pessoais</CardTitle>
            </div>
            <CardDescription>
              Atualize seu nome completo e email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-500">
                  Se você alterar o email, precisará usar o novo email para fazer login
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/${nomePrefeitura}/proponente/editais`)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProponenteLayout>
  );
};

