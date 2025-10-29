import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProponenteHeader } from "@/components/ProponenteHeader";
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

// Função para expandir documentos em pendências individuais
const expandirDocumentosEmPendencias = () => {
  const pendenciasExpandidas = [];

  // Pendência original de habilitação
  

  // Apenas documentos de Pessoa Jurídica para um projeto específico
  const docsPessoaJuridica = [
    "Inscrição no Cadastro Nacional de Pessoa Jurídica - CNPJ*",
    "Atos constitutivos (contrato social para pessoas jurídicas com fins lucrativos ou estatuto para organizações da sociedade civil)",
    "RG*",
    "CPF*",
    "Certidões (Falência/Recuperação Judicial, Débitos Tributários, Débitos Estaduais/Municipais, Débitos Trabalhistas - CNDT)",
    "Certificado de regularidade do Fundo de Garantia do Tempo de Serviço - CRF/FGTS"
  ];

  docsPessoaJuridica.forEach((documento, index) => {
    pendenciasExpandidas.push({
      id: 100 + index,
      titulo: documento,
      detalhes: "Criada em: 25/09/2025 - Projeto PNAB - Teatro - Ativar Produções LTDA",
      status: "Pendente de atendimento",
      tipo: "documento",
      projeto: "Projeto PNAB - Teatro",
      edital: "EDITAL PNAB - CULTURA JAÚ",
      codigoEdital: "001/2025-PNAB",
      categoria: "Confirmação de Dados",
      prazo: "15/10/2025",
      tipoProponente: "Pessoa Jurídica",
      nomeDocumento: documento,
      isObrigatorio: documento.includes("*"),
      descricao: `É necessário enviar o documento: ${documento}`,
      opcoesSituacaoEspecial: documento.includes("Comprovante de residência") ? [
        "Pertencente indígena, quilombola, cigano ou circense",
        "Pertencente a população nômade ou itinerante",
        "Que se encontre em situação de rua"
      ] : null
    });
  });

  return pendenciasExpandidas;
};

const pendenciasAtivas = expandirDocumentosEmPendencias();

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
  const [documentosEnviados, setDocumentosEnviados] = useState<{[key: string]: File | null}>({});
  const [observacoes, setObservacoes] = useState("");
  const [precisaComprovanteResidencia, setPrecisaComprovanteResidencia] = useState<boolean | null>(null);

  // Funções
  const handleAtenderPendencia = (pendencia: any) => {
    setPendenciaSelecionada(pendencia);
    setDocumentosEnviados({});
    setObservacoes("");
    setPrecisaComprovanteResidencia(null);
    setIsModalAtendimentoAberto(true);
    toast({
      title: "Atendendo pendência",
      description: `Abrindo formulário para atender: ${pendencia.titulo}`,
    });
  };

  const handleUploadDocumento = (documento: string, file: File) => {
    setDocumentosEnviados(prev => ({
      ...prev,
      [documento]: file
    }));
    toast({
      title: "Documento enviado",
      description: `${file.name} foi anexado para "${documento}".`,
    });
  };

  const handleRemoverDocumento = (documento: string) => {
    setDocumentosEnviados(prev => {
      const newDocs = { ...prev };
      delete newDocs[documento];
      return newDocs;
    });
    toast({
      title: "Documento removido",
      description: `Arquivo de "${documento}" foi removido.`,
    });
  };

  const handleEnviarResposta = () => {
    const documentosEnviadosCount = Object.keys(documentosEnviados).length;
    if (documentosEnviadosCount === 0) {
      toast({
        title: "Documentos obrigatórios",
        description: "Envie pelo menos um documento para continuar.",
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
          <ProponenteHeader />
          <main className="flex-1 p-6 space-y-6">
            

            {/* Título Principal */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Minhas Pendências</h1>
            </div>

            {/* Pendências Ativas */}
            {pendenciasAtivas.length > 0 ? (
              <div className="space-y-4">
                {pendenciasAtivas.map((pendencia) => (
                  <Card
                    key={pendencia.id}
                    className={`border-l-4 hover:shadow-md transition-shadow ${
                      pendencia.tipo === "documento"
                        ? pendencia.isObrigatorio
                          ? "border-l-red-400"
                          : "border-l-blue-400"
                        : "border-l-orange-400"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {pendencia.titulo}
                              </h3>
                              {pendencia.tipo === "documento" && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Edital:</span>
                                    <span className="text-sm font-medium">{pendencia.edital}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Código:</span>
                                    <span className="text-sm font-medium font-mono">{pendencia.codigoEdital}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Projeto:</span>
                                    <span className="text-sm font-medium">{pendencia.projeto}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Tipo:</span>
                                    <span className="text-sm font-medium">{pendencia.tipoProponente}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Prazo:</span>
                                    <span className="text-sm font-medium text-red-600">{pendencia.prazo}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {pendencia.tipo === "documento" && (
                              <div className="flex flex-col gap-1">
                                {pendencia.isObrigatorio && (
                                  <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                                    Obrigatório
                                  </Badge>
                                )}
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                                  {pendencia.categoria}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {pendencia.tipo !== "documento" && (
                            <>
                              <p className="text-sm text-gray-600">
                                {pendencia.detalhes}
                              </p>
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                                {pendencia.status}
                              </Badge>
                            </>
                          )}
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

            {/* Modal de Atendimento Simplificado */}
            <Dialog open={isModalAtendimentoAberto} onOpenChange={setIsModalAtendimentoAberto}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Atender Pendência
                  </DialogTitle>
                </DialogHeader>
                
                {pendenciaSelecionada && (
                  <div className="space-y-4">
                    {/* Nome do Documento */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">
                        {pendenciaSelecionada.titulo}
                      </h3>
                    </div>

                    {/* Campo de Upload Simples */}
                    <div className="space-y-2">
                      <Label htmlFor="arquivo">Selecionar arquivo</Label>
                      <Input
                        type="file"
                        id="arquivo"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadDocumento(pendenciaSelecionada.titulo, file);
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                      </p>
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
                    disabled={!documentosEnviados[pendenciaSelecionada?.titulo]}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Documento
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
