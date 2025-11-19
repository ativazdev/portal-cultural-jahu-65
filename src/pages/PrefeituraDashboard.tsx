import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle, 
  HelpCircle,
  BarChart3,
  PieChart,
  Building2,
  LogOut,
  AlertCircle
} from "lucide-react";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";
import { useDashboardPrefeitura } from "@/hooks/useDashboardPrefeitura";


export const PrefeituraDashboard = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { user, prefeitura, isAuthenticated, logout } = usePrefeituraAuth();
  
  // Buscar dados do dashboard do banco de dados
  const { data: dashboardData, loading, error } = useDashboardPrefeitura(prefeitura?.id || '');

  const handleLogout = () => {
    logout();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statusCards = dashboardData ? [
    {
      title: "Projetos Submetidos",
      value: dashboardData.cards.projetosSubmetidos,
      subtitle: "total de projetos",
      color: "blue",
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Aguardando Avaliação",
      value: dashboardData.cards.projetosAguardandoAvaliacao,
      subtitle: "em análise",
      color: "yellow",
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: "Projetos Aprovados",
      value: dashboardData.cards.projetosAprovados,
      subtitle: "aprovados",
      color: "green",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: "Valor Investido",
      value: formatCurrency(dashboardData.cards.valorInvestido),
      subtitle: "total investido",
      color: "purple",
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: "Prestação Pendente",
      value: dashboardData.cards.prestacaoContasPendente,
      subtitle: "aguardando prestação",
      color: "orange",
      icon: <AlertTriangle className="h-6 w-6" />
    },
    {
      title: "Dúvidas Pendentes",
      value: dashboardData.cards.duvidasPendentes,
      subtitle: "aguardando resposta",
      color: "red",
      icon: <HelpCircle className="h-6 w-6" />
    },
    {
      title: "Recursos Pendentes",
      value: dashboardData.cards.recursosPendentes,
      subtitle: "aguardando resposta",
      color: dashboardData.cards.recursosPendentes > 0 ? "red" : "gray",
      icon: <AlertCircle className="h-6 w-6" />
    },
    {
      title: "Contra-razões Pendentes",
      value: dashboardData.cards.contraRazoesPendentes,
      subtitle: "aguardando resposta",
      color: dashboardData.cards.contraRazoesPendentes > 0 ? "orange" : "gray",
      icon: <AlertCircle className="h-6 w-6" />
    }
  ] : [];

  const getCardColor = (color: string) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200",
      yellow: "bg-yellow-50 border-yellow-200",
      green: "bg-green-50 border-green-200",
      purple: "bg-purple-50 border-purple-200",
      orange: "bg-orange-50 border-orange-200",
      red: "bg-red-50 border-red-200"
    };
    return colors[color as keyof typeof colors] || "bg-gray-50 border-gray-200";
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      yellow: "text-yellow-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
      red: "text-red-600"
    };
    return colors[color as keyof typeof colors] || "text-gray-600";
  };

  if (loading) {
    return (
      <PrefeituraLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </PrefeituraLayout>
    );
  }

  if (error) {
    return (
      <PrefeituraLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </PrefeituraLayout>
    );
  }

  return (
    <PrefeituraLayout 
      title="Dashboard" 
      description="Visão geral dos projetos e atividades culturais"
    >
      <div className="p-6">

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statusCards.map((card, index) => (
            <Card key={index} className={getCardColor(card.color)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                  <div className={getIconColor(card.color)}>
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Categorias (Pizza) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Projetos por Categoria
              </CardTitle>
              <CardDescription>
                Distribuição dos projetos por área cultural
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.graficos.categoriaProjetos.length ? (
                  dashboardData.graficos.categoriaProjetos.map((item, index) => {
                    const total = dashboardData.graficos.categoriaProjetos.reduce((sum, cat) => sum + cat.quantidade, 0);
                    const percentage = total > 0 ? ((item.quantidade / total) * 100).toFixed(1) : '0';
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                            }}
                          />
                          <span className="text-sm font-medium">{item.categoria}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{item.quantidade}</span>
                          <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum projeto encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Status (Barras) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Projetos por Status
              </CardTitle>
              <CardDescription>
                Status atual dos projetos submetidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.graficos.projetosPorStatus.length ? (
                  dashboardData.graficos.projetosPorStatus.map((item, index) => {
                    const maxValue = Math.max(...dashboardData.graficos.projetosPorStatus.map(s => s.quantidade));
                    const percentage = maxValue > 0 ? (item.quantidade / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.status}</span>
                          <span className="text-gray-500">{item.quantidade}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum projeto encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => navigate(`/${nomePrefeitura}/editais`)}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Gerenciar Editais
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => navigate(`/${nomePrefeitura}/pareceristas`)}
                >
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Pareceristas
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => navigate(`/${nomePrefeitura}/duvidas`)}
                >
                  <HelpCircle className="h-6 w-6 mb-2" />
                  Dúvidas
                </Button>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrefeituraLayout>
  );
};
