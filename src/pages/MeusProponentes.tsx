import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const proponentes = [
  {
    id: 1,
    nome: "Noemi Maria Rodrigues Bof",
    endereco: "Av 16 de Junho 609 - Bariri - SP - 17250-000",
    tipo: "Pessoa Física"
  },
  {
    id: 2,
    nome: "Ativar Produções LTDA",
    endereco: "Avenida 16 de Junho 609 - Bariri - SP - 17250-424",
    tipo: "Pessoa Jurídica"
  },
  {
    id: 3,
    nome: "INGRIDE SALVIOLI 09190878680",
    endereco: "Rua João Batista Crivelari 1189L - Brotas - SP - 17380-000",
    tipo: "Pessoa Jurídica"
  },
  {
    id: 4,
    nome: "Associação Educarte de Bariri",
    endereco: "Rua das Flores 123 - Bariri - SP - 17250-100",
    tipo: "Pessoa Jurídica"
  },
  {
    id: 5,
    nome: "Maria Silva Santos",
    endereco: "Rua Principal 456 - Jahu - SP - 17201-000",
    tipo: "Pessoa Física"
  }
];

const MeusProponentes = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Lista de proponentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seção de registro de novos proponentes */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <div className="flex flex-col items-center space-y-4">
                    <Plus className="h-12 w-12 text-gray-400" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Registrar novo proponente pessoa física</p>
                      <p className="text-sm text-gray-600">Registrar novo proponente pessoa jurídica</p>
                      <p className="text-sm text-gray-600">Registrar nova cooperativa ou se registrar em uma cooperativa</p>
                    </div>
                  </div>
                </div>

                {/* Lista de proponentes */}
                <div className="space-y-4">
                  {proponentes.map((proponente) => (
                    <Card key={proponente.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Proponente</span>
                              <Badge 
                                variant={proponente.tipo === "Pessoa Física" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {proponente.tipo}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900">{proponente.nome}</h3>
                            <div className="space-y-1">
                              <span className="text-sm text-gray-500">Endereço</span>
                              <p className="text-sm text-gray-700">{proponente.endereco}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MeusProponentes;