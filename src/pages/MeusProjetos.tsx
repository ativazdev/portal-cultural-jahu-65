import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft, ChevronDown } from "lucide-react";

const projetos = [
  {
    id: 1,
    numeroInscricao: "08/2025-1756.7345.5351",
    nome: "Projeto PNAB - Teatro",
    edital: "EDITAL PNAB - CULTURA JAÚ",
    modalidade: "Artes Cênicas",
    proponente: "Ativar Produções LTDA",
    status: "Projetos em Edição",
    ano: "2025",
    programa: "PNAB 1",
    statusColor: "gray",
    buttonText: "Editar"
  },
  {
    id: 2,
    numeroInscricao: "07/2025-1756.8912.3348",
    nome: "Projeto PNAB - Dança", 
    edital: "EDITAL PNAB - CULTURA JAÚ",
    modalidade: "Dança",
    proponente: "Ativar Produções LTDA",
    status: "Aprovado",
    ano: "2025",
    programa: "PNAB 2",
    statusColor: "green",
    buttonText: "Visualizar"
  }
];

const statusOptions = [
  "Projetos em Edição",
  "Inscritos", 
  "Aprovado",
  "Reprovado",
  "Indeferido"
];

const MeusProjetos = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            {/* Breadcrumb */}
            <div className="mb-4">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-800 p-0 h-auto">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para a página anterior
              </Button>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus projetos</h1>

            {/* Filtros */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center mb-4">
                {/* Dropdowns */}
                <div className="flex gap-4">
                  <div className="w-48">
                    <Select defaultValue="todos-programas">
                      <SelectTrigger>
                        <SelectValue placeholder="Programa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos-programas">Todos os Programas</SelectItem>
                        <SelectItem value="pnab-1">PNAB 1</SelectItem>
                        <SelectItem value="pnab-2">PNAB 2</SelectItem>
                        <SelectItem value="pnab-3">PNAB 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-48">
                    <Select defaultValue="todos-anos">
                      <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos-anos">Todos os Anos</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Campo de busca */}
                <div className="flex gap-2 ml-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Pesquisar projetos" 
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-600">Limpar</Button>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button 
                    key={status}
                    variant="outline" 
                    size="sm"
                    className="text-xs border-gray-300 hover:bg-gray-50"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Lista de Projetos */}
            <div className="space-y-4">
              {projetos.map((projeto) => (
                <Card 
                  key={projeto.id} 
                  className={`border-l-4 ${
                    projeto.statusColor === "green" 
                      ? "border-l-green-500 bg-green-50" 
                      : projeto.statusColor === "gray"
                      ? "border-l-gray-400 bg-gray-50"
                      : "border-l-purple-500 bg-purple-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs text-gray-500 block">Nº da inscrição</span>
                            <span className="font-mono text-sm font-medium">{projeto.numeroInscricao}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Ano</span>
                            <span className="text-sm">{projeto.ano}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Proponente</span>
                            <span className="text-sm">{projeto.proponente}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs text-gray-500 block">Nome do projeto</span>
                            <span className="font-medium text-sm">{projeto.nome}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Título do edital</span>
                            <span className="text-sm">{projeto.edital}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Modalidade</span>
                            <span className="text-sm">{projeto.modalidade}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 ml-4">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-3 py-1 ${
                            projeto.statusColor === "green"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : projeto.statusColor === "gray"
                              ? "bg-gray-100 text-gray-800 border-gray-300"
                              : "bg-purple-100 text-purple-800 border-purple-300"
                          }`}
                        >
                          {projeto.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                          {projeto.buttonText}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MeusProjetos;