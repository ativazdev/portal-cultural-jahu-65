import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, CreditCard, AlertTriangle, ExternalLink, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useDashboardProponente } from "@/hooks/useDashboardProponente";
// import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";
import { getStatusPrazoEdital } from "@/lib/editalUtils";

export const DashboardMain = () => {
  const navigate = useNavigate();
  // const { getUrl } = usePrefeituraUrl();
  const getUrl = (path: string) => path; // Mock function
  const { projetos, editaisDisponiveis, metricas, loading, error } = useDashboardProponente();

  // Verificar se há erro de autenticação ou dados
  if (error && error.includes('usuário') || error && error.includes('prefeitura')) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-12 w-12 text-blue-500 mx-auto mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Sistema em desenvolvimento</h3>
            <p className="text-muted-foreground mb-4">
              Esta funcionalidade está sendo desenvolvida. Em breve você poderá acessar seu dashboard completo.
            </p>
            <Button onClick={() => navigate(getUrl('nova-proposta'))}>
              Criar Nova Proposta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCardClick = (link: string | null) => {
    if (link) {
      navigate(link);
    }
  };

  // Cards dinâmicos baseados nas métricas
  const dashboardCards = useMemo(() => [
    {
      title: "Total de Projetos",
      description: "Cadastrados no sistema",
      icon: FileText,
      color: "bg-blue-500",
      value: metricas.totalProjetos,
      link: getUrl('meus-projetos'),
    },
    {
      title: "Em Avaliação",
      description: "Com pareceristas",
      icon: AlertTriangle,
      color: "bg-orange-500",
      value: metricas.projetosEmAvaliacao,
      link: getUrl('meus-projetos'),
    },
    {
      title: "Aprovados",
      description: "Em execução",
      icon: CreditCard,
      color: "bg-green-500",
      value: metricas.projetosAprovados,
      link: getUrl('meus-projetos'),
    },
  ], [metricas, getUrl]);

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {dashboardCards.map((card) => (
          <Card 
            key={card.title} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCardClick(card.link)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}/10`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Programas Disponíveis Section */}
      <Card className="border-2 border-cultural-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-cultural-primary">
              Editais Disponíveis
            </CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          {/* Lista de Editais */}
          <div className="grid gap-6">
            {editaisDisponiveis.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum edital disponível no momento</p>
              </div>
            ) : (
              editaisDisponiveis.map((edital) => (
                <Card key={edital.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-cultural-primary" />
                          {edital.nome}
                        </CardTitle>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Código:</span> {edital.codigo}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Data de abertura:</span> {new Date(edital.data_abertura).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Data final para envio:</span> {new Date(edital.data_final_envio_projeto).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Horário final para envio:</span> {edital.horario_final_envio_projeto}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {edital.status === 'ativo' ? 'Ativo' : edital.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {edital.descricao && (
                        <p className="text-sm text-gray-600">{edital.descricao}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Categorias</label>
                          <p className="text-sm text-gray-900">{edital.modalidades.join(', ')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Valor Máximo</label>
                          <p className="text-lg font-bold text-gray-900">
                            R$ {edital.valor_maximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Prazo Final</label>
                          {(() => {
                            const status = getStatusPrazoEdital(edital);
                            return (
                              <p className={`text-lg font-bold ${status.cor}`}>
                                {status.texto}
                              </p>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="pt-2">
                        {(() => {
                          const status = getStatusPrazoEdital(edital);
                          
                          if (status.finalizado) {
                            return (
                              <Button
                                disabled
                                className={`w-full ${status.corBotao}`}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Prazo Finalizado
                              </Button>
                            );
                          }
                          
                          return (
                            <Button
                              onClick={() => navigate(getUrl(`selecionar-proponente?edital=${edital.id}`))}
                              className={`w-full ${status.corBotao}`}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Inscrever Projeto
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};