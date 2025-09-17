import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, User } from "lucide-react";

const AlterarMeusDados = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Alterar Meus Dados</h1>

            {/* Formulário Centralizado */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center text-lg">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Área para Foto de Perfil */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                      <div className="text-center">
                        <User className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                        <Upload className="h-4 w-4 text-gray-400 mx-auto" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Clique para adicionar foto</span>
                  </div>

                  {/* Campos do Formulário */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input 
                        id="nome" 
                        type="text" 
                        defaultValue="Nome do Proponente"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sobrenome">Sobrenome</Label>
                      <Input 
                        id="sobrenome" 
                        type="text" 
                        defaultValue="Sobrenome do Proponente"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        defaultValue="proponente@email.com"
                        className="w-full"
                      />
                    </div>

                    {/* Link Trocar Senha */}
                    <div className="text-center">
                      <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0 h-auto">
                        Trocar senha
                      </Button>
                    </div>

                    {/* Botão Salvar */}
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AlterarMeusDados;