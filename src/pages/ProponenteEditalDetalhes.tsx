import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Info, 
  ArrowLeft, 
  Calendar,
  DollarSign,
  Tag,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { editalService, Edital, Anexo } from "@/services/editalService";
import { useToast } from "@/hooks/use-toast";
import { handleDownload } from "@/utils/downloadUtils";

export const ProponenteEditalDetalhes = () => {
  const { nomePrefeitura, editalId } = useParams<{ nomePrefeitura: string; editalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [edital, setEdital] = useState<Edital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (editalId) {
      carregarEdital();
    }
  }, [editalId]);

  const carregarEdital = async () => {
    try {
      setLoading(true);
      const data = await editalService.getById(editalId!);
      setEdital(data);
    } catch (error) {
      console.error("Erro ao carregar edital:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do edital.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProponenteLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProponenteLayout>
    );
  }

  if (!edital) {
    return (
      <ProponenteLayout>
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Edital não encontrado</h2>
          <Button onClick={() => navigate(`/${nomePrefeitura}/proponente/editais`)}>
            Voltar para Editais
          </Button>
        </div>
      </ProponenteLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      rascunho: { label: "Rascunho", color: "bg-gray-100 text-gray-800" },
      publicado: { label: "Publicado", color: "bg-blue-100 text-blue-800" },
      recebendo_projetos: { label: "Recebendo Projetos", color: "bg-green-100 text-green-800" },
      em_avaliacao: { label: "Em Avaliação", color: "bg-amber-100 text-amber-800" },
      recurso: { label: "Fase de Recurso", color: "bg-purple-100 text-purple-800" },
      contra_razao: { label: "Fase de Contrarrazão", color: "bg-indigo-100 text-indigo-800" },
      finalizado: { label: "Finalizado", color: "bg-gray-100 text-gray-800" },
      arquivado: { label: "Arquivado", color: "bg-red-100 text-red-800" },
    };

    const config = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <ProponenteLayout 
      title={`Edital: ${edital.codigo}`}
      description={edital.nome}
    >
      <div className="p-6 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/${nomePrefeitura}/proponente/editais`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Editais
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">{edital.nome}</CardTitle>
                  {getStatusBadge(edital.status)}
                </div>
                <CardDescription className="text-lg mt-2">
                  {edital.descricao || "Sem descrição disponível."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Prazo de Inscrição</p>
                      <p className="font-medium">
                        {edital.data_final_envio_projeto 
                          ? new Date(edital.data_final_envio_projeto).toLocaleDateString('pt-BR') 
                          : "Não informado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Valor Máximo</p>
                      <p className="font-medium">
                        {edital.valor_maximo 
                          ? `R$ ${edital.valor_maximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                          : "Não informado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Tag className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Modalidades</p>
                      <p className="font-medium">{edital.modalidades?.join(', ') || "Geral"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Info className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Prazo Avaliação</p>
                      <p className="font-medium">{edital.prazo_avaliacao ? `${edital.prazo_avaliacao} dias` : "Não informado"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Regualmento e Documentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {edital.regulamento && (
                   <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Arquivo do Edital / Regulamento</p>
                        <p className="text-xs text-gray-500">Documento principal com todas as regras</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleDownload(edital.regulamento![0], `Edital_${edital.codigo}.pdf`)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                )}

                {edital.anexos && edital.anexos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-600 uppercase">Anexos e Modelos</h4>
                    {edital.anexos.map((anexo: Anexo, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{anexo.titulo}</span>
                        </div>
                        <Button 
                          onClick={() => handleDownload(anexo.url, anexo.titulo)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {!edital.regulamento && (!edital.anexos || edital.anexos.length === 0) && (
                  <p className="text-center py-4 text-gray-500 italic">
                    Nenhum documento disponível para este edital.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const hoje = new Date();
                  const dataFinal = edital.data_prorrogacao ? new Date(edital.data_prorrogacao) : new Date(edital.data_final_envio_projeto);
                  const isAberto = (edital.status === 'recebendo_projetos' && hoje <= dataFinal) || 
                                   (edital.has_accountability_phase && (['ativo', 'em_execucao', 'recebendo_projetos'].includes(edital.status)));
                  
                  if (isAberto) {
                    return (
                      <Button 
                        className={`w-full text-lg py-6 ${
                          edital.has_accountability_phase ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                        onClick={() => {
                          if (edital.has_accountability_phase) {
                            navigate(`/${nomePrefeitura}/proponente/edital/${editalId}/prestar-contas`);
                          } else {
                            navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`);
                          }
                        }}
                      >
                        {edital.has_accountability_phase ? "Prestar Contas" : "Inscrever Projeto"}
                      </Button>
                    );
                  }
                  
                  return (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800 text-center font-medium">
                        Inscrições indisponíveis no momento. Status: {edital.status}
                      </p>
                    </div>
                  );
                })()}
                
                <p className="text-xs text-gray-500 text-center">
                  Certifique-se de ler todo o regulamento antes de realizar sua inscrição.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-gray-500">Cronograma Sugerido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold">Publicação</p>
                    <p className="text-xs text-gray-500">Início do processo</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold">Inscrições</p>
                    <p className="text-xs text-gray-500">Período de recebimento de projetos</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-600" />
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold">Avaliação</p>
                    <p className="text-xs text-gray-500">Análise técnica dos projetos</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Resultado Final</p>
                    <p className="text-xs text-gray-500">Homologação dos resultados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProponenteLayout>
  );
};
