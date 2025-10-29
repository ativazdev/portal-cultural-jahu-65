import { Card, CardContent } from "@/components/ui/card";
import { FileText, Search, AlertTriangle, CheckCircle } from "lucide-react";

interface StatusCardsProps {
  metricas: {
    recebidos: number;
    emAvaliacao: number;
    pendentes: number;
    aprovados: number;
  };
}

export const StatusCards = ({ metricas }: StatusCardsProps) => {
  const cards = [
    {
      titulo: "Total de Projetos",
      valor: metricas.recebidos,
      subtexto: "Cadastrados no sistema",
      cor: "text-blue-500",
      bgCor: "bg-blue-500/10",
      icone: FileText
    },
    {
      titulo: "Em Avaliação",
      valor: metricas.emAvaliacao,
      subtexto: "Com pareceristas",
      cor: "text-orange-500",
      bgCor: "bg-orange-500/10",
      icone: Search
    },
    {
      titulo: "Projetos Aprovados",
      valor: metricas.aprovados,
      subtexto: "Em execução",
      cor: "text-green-500",
      bgCor: "bg-green-500/10",
      icone: CheckCircle
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.titulo}</p>
                <p className="text-3xl font-bold mt-2">{card.valor}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtexto}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgCor}`}>
                <card.icone className={`h-6 w-6 ${card.cor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};