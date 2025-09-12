import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  DollarSign, 
  CheckCircle, 
  RefreshCw,
  Download
} from "lucide-react";

export function RelatoriosAdminMain() {
  const [editalSelecionado, setEditalSelecionado] = useState("todos");

  const statusCards = [
    {
      title: "Projetos Submetidos",
      value: "156",
      color: "blue",
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Projetos Aprovados",
      value: "89",
      color: "green",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: "Projetos Reprovados",
      value: "67",
      color: "red",
      icon: <RefreshCw className="h-6 w-6" />
    },
    {
      title: "Valor Total Aprovado",
      value: "R$ 2.45M",
      color: "purple",
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: "Prestações Aprovadas",
      value: "45",
      color: "orange",
      icon: <CheckCircle className="h-6 w-6" />
    }
  ];

  const relatoriosEssenciais = [
    {
      title: "Ranking de Classificação",
      description: "Lista dos projetos aprovados por nota",
      botao: "Gerar Ranking",
      formato: "PDF"
    },
    {
      title: "Projetos Aprovados",
      description: "Lista simples dos projetos aprovados",
      botao: "Exportar Lista",
      formato: "Excel"
    },
    {
      title: "Proponentes Contemplados",
      description: "Lista dos proponentes com projetos aprovados",
      botao: "Exportar Dados",
      formato: "Excel"
    },
    {
      title: "Resumo por Categoria",
      description: "Quantos projetos por categoria cultural",
      botao: "Gerar Resumo",
      formato: "PDF"
    }
  ];

  const getCardColor = (color: string) => {
    switch (color) {
      case "blue": return "border-blue-200 bg-blue-50";
      case "green": return "border-green-200 bg-green-50";
      case "red": return "border-red-200 bg-red-50";
      case "purple": return "border-purple-200 bg-purple-50";
      case "orange": return "border-orange-200 bg-orange-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      case "purple": return "text-purple-600";
      case "orange": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-white">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-prefeitura-primary">Relatórios</h1>
        <p className="text-muted-foreground mt-2">
          Gere relatórios essenciais da PNAB
        </p>
      </div>

      {/* Cards Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card, index) => (
          <Card key={index} className={getCardColor(card.color)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <div className={getIconColor(card.color)}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtro Simples */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="edital">Edital</Label>
              <Select value={editalSelecionado} onValueChange={setEditalSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o edital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="2024-01">Edital 2024/01</SelectItem>
                  <SelectItem value="2024-02">Edital 2024/02</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-prefeitura-primary hover:bg-prefeitura-primary/90">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Essenciais */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Relatórios Essenciais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatoriosEssenciais.map((relatorio, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{relatorio.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{relatorio.description}</p>
              </CardHeader>
              <CardContent>
                <Button className="w-full justify-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <Download className="h-4 w-4" />
                  {relatorio.botao} ({relatorio.formato})
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}