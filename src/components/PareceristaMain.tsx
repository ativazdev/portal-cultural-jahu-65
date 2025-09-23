import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckSquare, Clock, FolderOpen, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEditalSelecionado } from "@/hooks/useEditalSelecionado";
import { Badge } from "@/components/ui/badge";

export const PareceristaMain = () => {
  const navigate = useNavigate();
  const { editalSelecionado, loading, obterEstatisticasProjetos } = useEditalSelecionado();

  if (loading) {
    return <main className="flex-1 p-6">Carregando...</main>;
  }

  if (!editalSelecionado) {
    return <main className="flex-1 p-6">Nenhum edital selecionado</main>;
  }

  const estatisticas = obterEstatisticasProjetos();

  const dashboardCards = [
    {
      title: "Projetos Pendentes",
      value: estatisticas.pendentes.toString(),
      description: "Projetos aguardando sua avaliação",
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      title: "Projetos Avaliados",
      value: estatisticas.avaliados.toString(),
      description: "Projetos já avaliados por você",
      icon: CheckSquare,
      color: "bg-green-500",
    },
    {
      title: "Prazo para Avaliação",
      value: `${editalSelecionado.prazoAvaliacao} dias`,
      description: "Tempo limite para avaliar cada projeto",
      icon: Clock,
      color: "bg-orange-500",
    },
  ];

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
        <div className="flex items-center gap-3 mb-4">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{editalSelecionado.nome}</h1>
            <p className="text-gray-600">{editalSelecionado.codigo}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Período</p>
                  <p className="font-medium">{editalSelecionado.dataInicio} a {editalSelecionado.dataFim}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Valor Máximo</p>
                  <p className="font-medium">R$ {editalSelecionado.valorMaximo.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Total de Projetos</p>
                  <p className="font-medium">{editalSelecionado.totalProjetos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {editalSelecionado.status}
                </Badge>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editalSelecionado.modalidades.slice(0, 2).map((modalidade) => (
                      <Badge key={modalidade} variant="outline" className="text-xs">
                        {modalidade}
                      </Badge>
                    ))}
                    {editalSelecionado.modalidades.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{editalSelecionado.modalidades.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-gray-600">{editalSelecionado.descricao}</p>
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