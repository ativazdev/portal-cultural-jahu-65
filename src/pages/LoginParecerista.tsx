import { Link } from "react-router-dom";
import PareceristaLoginForm from "@/components/PareceristaLoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck } from "lucide-react";
// import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";

const LoginParecerista = () => {
  // const { getUrl } = usePrefeituraUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Botão Voltar 
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Trocar Prefeitura
        </Link>*/}

        {/* Card de Login */}
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Acesso de Parecerista
            </CardTitle>
            <CardDescription className="text-base">
              Área para avaliadores de projetos culturais
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <PareceristaLoginForm />

            {/* Links para outros tipos de login */}
            <div className="mt-6 pt-6 border-t border-gray-200">
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
                  <Link to={getUrl('login-proponente')}>
                    Sou Proponente
                  </Link>
                </Button>
              </div>
            </div>

            {/* Informações de cadastro */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Ainda não é parecerista?
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Entre em contato com a prefeitura para se cadastrar
              </p>
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

export default LoginParecerista;

