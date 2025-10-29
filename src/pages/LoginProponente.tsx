import { Link } from "react-router-dom";
import ProponenteLoginForm from "@/components/ProponenteLoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
// import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";

const LoginProponente = () => {
  // const { getUrl } = usePrefeituraUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Botão Voltar 
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Trocar Prefeitura
        </Link>*/}

        {/* Card de Login */}
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Acesso de Proponente
            </CardTitle>
            <CardDescription className="text-base">
              Área para artistas e produtores culturais
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ProponenteLoginForm />

            {/* Link de Cadastro */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                Ainda não tem cadastro?
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
                asChild
              >
                <Link to={getUrl('cadastro-usuario')}>
                  Criar Minha Conta
                </Link>
              </Button>
            </div>

            {/* Links para outros tipos de login */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                Acessar com outro perfil
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link to={getUrl('login')}>
                    Login da Prefeitura
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link to={getUrl('login-parecerista')}>
                    Sou Parecerista
                  </Link>
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Sistema de Gestão de Projetos Culturais - PNAB
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginProponente;

