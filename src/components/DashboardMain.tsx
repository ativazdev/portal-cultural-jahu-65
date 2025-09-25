import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, CreditCard, AlertTriangle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const dashboardCards = [
  {
    title: "Meus projetos",
    description: "Lista de projetos inscritos",
    icon: FileText,
    color: "bg-cultural-primary",
    link: "/meus-projetos",
  },
  {
    title: "Pendências",
    description: "Suas pendências serão exibidas aqui",
    icon: AlertTriangle,
    color: "bg-orange-500",
    link: "/pendencias",
  },
];

export const DashboardMain = () => {
  const navigate = useNavigate();

  const handleCardClick = (link: string | null) => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <main className="flex-1 p-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardCards.map((card) => (
          <Card 
            key={card.title} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCardClick(card.link)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.color} text-white`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Programas Disponíveis Section */}
      <Card className="border-2 border-cultural-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-cultural-primary">
              Programas disponíveis
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Lista de Editais */}
          <div className="grid gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-cultural-primary" />
                      PNAB 2025 - Edital de Fomento Cultural
                    </CardTitle>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Código:</span> PNAB-2025-001
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Data de abertura:</span> 01/07/2025
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Data final para envio:</span> 31/12/2025
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Horário final para envio:</span> 23:59
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Ativo
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vagas Disponíveis</label>
                      <p className="text-lg font-bold text-gray-900">50</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor Máximo</label>
                      <p className="text-lg font-bold text-gray-900">R$ 25.000</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Prazo Final</label>
                      <p className="text-lg font-bold text-gray-900">30 dias</p>
                    </div>
                  </div>

                  {/* Arquivos do Edital */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Documentos</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">edital-pnab-2025-001.pdf</p>
                            <p className="text-xs text-gray-500">2.5 MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.open('#', '_blank')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">anexo-formularios.pdf</p>
                            <p className="text-xs text-gray-500">1.2 MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.open('#', '_blank')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => navigate('/detalhes-edital')}
                      className="w-full bg-cultural-primary hover:bg-cultural-primary/90"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Inscrever Projeto
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};