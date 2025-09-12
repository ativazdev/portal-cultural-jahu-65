import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    title: "Editais vigentes",
    description: "Lista de editais disponíveis para inscrição",
    icon: Calendar,
    color: "bg-cultural-secondary",
    link: null,
  },
  {
    title: "Prestação de contas",
    description: "Para projetos cadastrados até 14/04/2022",
    icon: CreditCard,
    color: "bg-cultural-accent",
    link: "/prestacao-contas",
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
            <Button variant="link" className="text-cultural-primary">
              Saiba Mais <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="bg-gradient-cultural p-6 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate('/detalhes-edital')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl font-bold mb-2">
                <span className="text-yellow-300">P</span>
                <span className="text-orange-300">N</span>
                <span className="text-blue-300">A</span>
                <span className="text-green-300">B</span>
              </div>
              <div className="text-lg font-semibold mb-4">
                JAHU <span className="bg-white text-cultural-primary px-2 py-1 rounded">SP</span>
              </div>
              <h3 className="text-xl font-bold">PNAB - Jahu</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};