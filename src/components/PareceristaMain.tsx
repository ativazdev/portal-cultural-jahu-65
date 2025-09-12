import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const dashboardCards = [
  {
    title: "Projetos Pendentes",
    value: "5",
    description: "Projetos aguardando sua avaliação",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    title: "Projetos Avaliados",
    value: "12",
    description: "Projetos já avaliados por você",
    icon: CheckSquare,
    color: "bg-green-500",
  },
  {
    title: "Prazo Próximo",
    value: "15/01/2025",
    description: "Data máxima para entrega da análise",
    icon: Clock,
    color: "bg-orange-500",
  },
];

export const PareceristaMain = () => {
  const navigate = useNavigate();

  const handleCardClick = (title: string) => {
    if (title === "Projetos Pendentes") {
      navigate("/projetos-avaliar");
    } else if (title === "Projetos Avaliados") {
      navigate("/projetos-avaliados");
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard do Parecerista</h1>
        <p className="text-gray-600">Acompanhe suas atividades de avaliação de projetos</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardCards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCardClick(card.title)}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </div>
                </div>
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

      {/* Área de conteúdo adicional pode ser adicionada aqui */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Suas últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Projeto "Festival de Música Local" atribuído para avaliação</p>
                  <p className="text-xs text-gray-500">Há 2 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Avaliação do projeto "Teatro na Praça" finalizada</p>
                  <p className="text-xs text-gray-500">Ontem</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Lembrete: Projeto "Oficinas de Arte" vence em 2 dias</p>
                  <p className="text-xs text-gray-500">Há 1 dia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};