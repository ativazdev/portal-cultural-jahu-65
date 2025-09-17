import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronLeft, Package, CheckCircle, FileText, Upload, AlertCircle, Send } from "lucide-react";

const pendenciasAtivas = [
  {
    id: 1,
    titulo: "Formulários obrigatórios - ETAPA DE HABILITAÇÃO",
    detalhes: "Criada em: 14/04/2023 - 47:2024:1716:9957:3248 - Associação Educativa",
    status: "Pendente de atendimento",
    tipo: "pendente",
    projeto: "Festival de Música Popular",
    categoria: "Documentação",
    prazo: "30/12/2024",
    descricao: "É necessário enviar os formulários de habilitação devidamente preenchidos e assinados, conforme especificado no edital.",
    documentosNecessarios: [
      "Formulário de Inscrição",
      "Declaração de Idoneidade",
      "Comprovante de Endereço",
      "Cópia do RG/CPF"
    ]
  }
];

const pendenciasConcluidas = [
  {
    id: 1,
    titulo: "Formulários obrigatórios - ETAPA DE HABILITAÇÃO",
    detalhes: "Criada em: 14/04/2023 - 48:2024:1737:8342:6411 - Festival Internacional de Dança de Barra Bonita",
    status: "Atendida com sucesso",
    tipo: "concluida",
    dataAtendimento: "20/04/2023"
  },
  {
    id: 2,
    titulo: "Formulários obrigatórios - ETAPA DE HABILITAÇÃO", 
    detalhes: "Criada em: 14/04/2023 - 47:2024:1716:9957:3248 - Associação Educativa",
    status: "Atendida com sucesso",
    tipo: "concluida",
    dataAtendimento: "18/04/2023"
  }
];

const MinhasPendencias = () => {
  const { toast } = useToast();
  
  // Estados
  const [isModalAtendimentoAberto, setIsModalAtendimentoAberto] = useState(false);
  const [pendenciaSelecionada, setPendenciaSelecionada] = useState<any>(null);
  const [documentosEnviados, setDocumentosEnviados] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [arquivosAnexados, setArquivosAnexados] = useState<File[]>([]);

  // Funções
  const handleAtenderPendencia = (pendencia: any) => {
    setPendenciaSelecionada(pendencia);
    setDocumentosEnviados([]);
    setObservacoes("");
    setArquivosAnexados([]);
    setIsModalAtendimentoAberto(true);
    toast({
      title: "Atendendo pendência",
      description: `Abrindo formulário para atender: ${pendencia.titulo}`,
    });
  };

  const handleDocumentoCheck = (documento: string, checked: boolean) => {
    if (checked) {
      setDocumentosEnviados([...documentosEnviados, documento]);
    } else {
      setDocumentosEnviados(documentosEnviados.filter(doc => doc !== documento));
    }
  };

  const handleEnviarResposta = () => {
    if (documentosEnviados.length === 0) {
      toast({
        title: "Documentos obrigatórios",
        description: "Selecione pelo menos um documento para enviar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Pendência atendida!",
      description: `Sua resposta foi enviada com sucesso. A pendência será analisada em até 5 dias úteis.`,
    });
    setIsModalAtendimentoAberto(false);
  };

  const handleSimularUpload = () => {
    toast({
      title: "Upload simulado",
      description: "Em um sistema real, aqui você faria upload dos arquivos.",
    });
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 space-y-6">
            

            {/* Título Principal */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Minhas Pendências</h1>
            </div>

            {/* Pendências Ativas */}
            {pendenciasAtivas.length > 0 ? (
              <div className="space-y-4">
                {pendenciasAtivas.map((pendencia) => (
                  <Card key={pendencia.id} className="border-l-4 border-l-orange-400 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {pendencia.titulo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pendencia.detalhes}
                          </p>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                            {pendencia.status}
                          </Badge>
                        </div>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleAtenderPendencia(pendencia)}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Atender
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Estado Vazio - Sem Pendências */
              <div className="text-center py-16">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Package className="h-24 w-24 text-gray-300" />
                    <div className="absolute -top-2 -right-2 bg-orange-500 rounded-full p-1">
                      <span className="text-white text-xs">!</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-lg">Você não tem pendências</p>
              </div>
            )}

            {/* Pendências Concluídas */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pendências concluídas</h2>
              
              {pendenciasConcluidas.length > 0 ? (
                <div className="space-y-4">
                  {pendenciasConcluidas.map((pendencia) => (
                    <Card key={pendencia.id} className="border-l-4 border-l-green-400 bg-green-50/30">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <h3 className="font-semibold text-gray-900">
                              {pendencia.titulo}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {pendencia.detalhes}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {pendencia.status}
                              </Badge>
                              {pendencia.dataAtendimento && (
                                <span className="text-xs text-gray-500">
                                  Atendida em: {pendencia.dataAtendimento}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Concluída
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma pendência concluída ainda.</p>
                </div>
              )}
            </div>

            {/* Modal de Atendimento de Pendência */}
            <Dialog open={isModalAtendimentoAberto} onOpenChange={setIsModalAtendimentoAberto}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Atender Pendência
                  </DialogTitle>
                </DialogHeader>
                
                {pendenciaSelecionada && (
                  <div className="space-y-6">
                    {/* Informações da Pendência */}
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                      <h3 className="font-semibold text-orange-800 mb-2">
                        {pendenciaSelecionada.titulo}
                      </h3>
                      <p className="text-sm text-orange-700 mb-2">
                        {pendenciaSelecionada.detalhes}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span><strong>Projeto:</strong> {pendenciaSelecionada.projeto}</span>
                        <span><strong>Prazo:</strong> {pendenciaSelecionada.prazo}</span>
                      </div>
                    </div>

                    {/* Descrição da Pendência */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Descrição da Pendência</Label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {pendenciaSelecionada.descricao}
                        </p>
                      </div>
                    </div>

                    {/* Documentos Necessários */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Documentos Necessários</Label>
                      <div className="space-y-2">
                        {pendenciaSelecionada.documentosNecessarios?.map((documento: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              checked={documentosEnviados.includes(documento)}
                              onCheckedChange={(checked) => handleDocumentoCheck(documento, checked as boolean)}
                            />
                            <Label className="flex-1 cursor-pointer">{documento}</Label>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleSimularUpload}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Upload
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-3">
                      <Label htmlFor="observacoes">Observações (Opcional)</Label>
                      <Textarea
                        id="observacoes"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Adicione observações sobre o envio dos documentos..."
                        rows={4}
                      />
                    </div>

                    {/* Resumo do Envio */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Resumo do Atendimento</h4>
                      <div className="space-y-1 text-sm text-blue-700">
                        <p><strong>Documentos selecionados:</strong> {documentosEnviados.length} de {pendenciaSelecionada.documentosNecessarios?.length || 0}</p>
                        <p><strong>Status:</strong> {documentosEnviados.length > 0 ? "Pronto para envio" : "Aguardando seleção de documentos"}</p>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalAtendimentoAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleEnviarResposta}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={documentosEnviados.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Resposta
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MinhasPendencias;