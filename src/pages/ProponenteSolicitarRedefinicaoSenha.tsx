import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, ArrowLeft } from "lucide-react";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";

export const ProponenteSolicitarRedefinicaoSenha = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const { solicitarRedefinicaoSenha, loading } = useProponenteAuth();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Por favor, informe seu email");
      return;
    }

    setError("");
    const result = await solicitarRedefinicaoSenha(email);
    
    if (result) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Key className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
            <CardDescription>
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                Enviamos um link para redefinir sua senha no email informado. 
                Verifique sua caixa de entrada e siga as instruções.
              </AlertDescription>
            </Alert>
            
            <Link to={`/${nomePrefeitura}/proponente/login`}>
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Key className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription>
            Informe seu email para receber o link de redefinição
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Link de Redefinição"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <Link
              to={`/${nomePrefeitura}/proponente/login`}
              className="text-green-600 hover:text-green-700 hover:underline inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

