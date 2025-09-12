import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronLeft, Package, CheckCircle } from "lucide-react";

const pendenciasAtivas = [
  {
    id: 1,
    titulo: "Formulários obrigatórios - ETAPA DE HABILITAÇÃO",
    detalhes: "Criada em: 14/04/2023 - 47:2024:1716:9957:3248 - Associação Educativa",
    status: "Pendente de atendimento",
    tipo: "pendente"
  }
];

const pendenciasConcluidas = [
  {
    id: 1,
    titulo: "Formulários obrigatórios - ETAPA DE HABILITAÇÃO",
    detalhes: "Criada em: 14/04/2023 - 48:2024:1737:8342:6411 - Festival Internacional de Dança de Barra Bonita",
    status: "Atendida com sucesso",
    tipo: "concluida",
    dataAtendimento: "20/04/2023"
  },
  {
    id: 2,
    titulo: "Formulários obrigatórios - ETAPA DE HABILITAÇÃO", 
    detalhes: "Criada em: 14/04/2023 - 47:2024:1716:9957:3248 - Associação Educativa",
    status: "Atendida com sucesso",
    tipo: "concluida",
    dataAtendimento: "18/04/2023"
  }
];

const MinhasPendencias = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <ChevronLeft className="h-4 w-4" />
                      Voltar para página anterior
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Título Principal */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Minhas Pendências</h1>
            </div>

            {/* Pendências Ativas */}
            {pendenciasAtivas.length > 0 ? (
              <div className="space-y-4">
                {pendenciasAtivas.map((pendencia) => (
                  <Card key={pendencia.id} className="border-l-4 border-l-orange-400 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {pendencia.titulo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pendencia.detalhes}
                          </p>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                            {pendencia.status}
                          </Badge>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Atender
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Estado Vazio - Sem Pendências */
              <div className="text-center py-16">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Package className="h-24 w-24 text-gray-300" />
                    <div className="absolute -top-2 -right-2 bg-orange-500 rounded-full p-1">
                      <span className="text-white text-xs">!</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-lg">Você não tem pendências</p>
              </div>
            )}

            {/* Pendências Concluídas */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pendências concluídas</h2>
              
              {pendenciasConcluidas.length > 0 ? (
                <div className="space-y-4">
                  {pendenciasConcluidas.map((pendencia) => (
                    <Card key={pendencia.id} className="border-l-4 border-l-green-400 bg-green-50/30">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <h3 className="font-semibold text-gray-900">
                              {pendencia.titulo}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {pendencia.detalhes}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {pendencia.status}
                              </Badge>
                              {pendencia.dataAtendimento && (
                                <span className="text-xs text-gray-500">
                                  Atendida em: {pendencia.dataAtendimento}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Concluída
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma pendência concluída ainda.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MinhasPendencias;