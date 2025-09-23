import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, Upload, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Projeto, DocumentoHabilitacao } from "@/components/ProjetosAdminMain";

interface DetalhesProjetoModalProps {
  aberto: boolean;
  projeto?: Projeto;
  onFechar: () => void;
  onAtualizarProjeto?: (projeto: Projeto) => void;
}

export const DetalhesProjetoModal = ({ aberto, projeto, onFechar, onAtualizarProjeto }: DetalhesProjetoModalProps) => {
  const [novoDocumento, setNovoDocumento] = useState({ nome: "", descricao: "", obrigatorio: false });
  const [mostrarFormNovoDoc, setMostrarFormNovoDoc] = useState(false);
  const [documentosHabilitacao, setDocumentosHabilitacao] = useState<DocumentoHabilitacao[]>([]);

  // Inicializar documentos de habilitação quando o projeto mudar
  useEffect(() => {
    if (projeto?.documentosHabilitacao) {
      setDocumentosHabilitacao(projeto.documentosHabilitacao);
    } else {
      setDocumentosHabilitacao([]);
    }
  }, [projeto]);

  if (!projeto) return null;

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleAdicionarDocumento = () => {
    if (!novoDocumento.nome || !novoDocumento.descricao) return;

    const novoDoc: DocumentoHabilitacao = {
      id: Date.now().toString(), // Temporary ID, in real app use proper UUID
      nome: novoDocumento.nome,
      descricao: novoDocumento.descricao,
      obrigatorio: novoDocumento.obrigatorio,
      dataSolicitacao: new Date().toISOString().split('T')[0]
    };

    // Atualizar o estado local
    const novosDocumentos = [...documentosHabilitacao, novoDoc];
    setDocumentosHabilitacao(novosDocumentos);

    // Atualizar o projeto se callback fornecido
    if (onAtualizarProjeto) {
      const projetoAtualizado = {
        ...projeto,
        documentosHabilitacao: novosDocumentos
      };
      onAtualizarProjeto(projetoAtualizado);
    }

    // Limpar formulário
    setNovoDocumento({ nome: "", descricao: "", obrigatorio: false });
    setMostrarFormNovoDoc(false);

    console.log("Documento adicionado:", novoDoc);
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{projeto.nome}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="proposta" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="proposta">Proposta</TabsTrigger>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
            <TabsTrigger value="documentos">Documentação Inicial</TabsTrigger>
            <TabsTrigger value="habilitacao">Documentação de Habilitação</TabsTrigger>
          </TabsList>

          <TabsContent value="proposta" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Informações Gerais</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Categoria:</strong> <Badge>{projeto.categoria}</Badge></div>
                  <div><strong>Proponente:</strong> {projeto.proponente}</div>
                  <div><strong>Tipo:</strong> {projeto.tipoProponente}</div>
                  <div><strong>Valor:</strong> {formatarValor(projeto.valorSolicitado)}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Status do Projeto</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Status Atual:</strong> <Badge>{projeto.status}</Badge></div>
                  <div><strong>Data Submissão:</strong> {new Date(projeto.dataSubmissao).toLocaleDateString('pt-BR')}</div>
                  {projeto.parecerista && (
                    <div><strong>Parecerista:</strong> {projeto.parecerista}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Descrição do Projeto</h3>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Objetivos</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Promover a cultura local na região</li>
                <li>Capacitar artistas da comunidade</li>
                <li>Aumentar o acesso à arte e cultura</li>
                <li>Fortalecer a economia criativa local</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Metas</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Atender 500 pessoas diretamente</li>
                <li>Capacitar 50 artistas locais</li>
                <li>Realizar 10 apresentações públicas</li>
                <li>Produzir material educativo</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="cronograma" className="space-y-4">
            <h3 className="font-semibold">Cronograma de Execução</h3>
            <div className="space-y-3">
              {[
                { mes: "Mês 1", atividade: "Pré-produção e planejamento", status: "Pendente" },
                { mes: "Mês 2", atividade: "Seleção de participantes", status: "Pendente" },
                { mes: "Mês 3", atividade: "Início das oficinas", status: "Pendente" },
                { mes: "Mês 4", atividade: "Desenvolvimento das atividades", status: "Pendente" },
                { mes: "Mês 5", atividade: "Apresentações públicas", status: "Pendente" },
                { mes: "Mês 6", atividade: "Encerramento e avaliação", status: "Pendente" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{item.mes}</div>
                    <div className="text-sm text-muted-foreground">{item.atividade}</div>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orcamento" className="space-y-4">
            <h3 className="font-semibold">Planilha Orçamentária</h3>
            <div className="space-y-3">
              {[
                { categoria: "Recursos Humanos", valor: 8000, percentual: 53.3 },
                { categoria: "Material de Consumo", valor: 3000, percentual: 20.0 },
                { categoria: "Equipamentos", valor: 2500, percentual: 16.7 },
                { categoria: "Divulgação", valor: 1000, percentual: 6.7 },
                { categoria: "Outros Custos", valor: 500, percentual: 3.3 }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{item.categoria}</div>
                    <div className="text-sm text-muted-foreground">{item.percentual}% do total</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatarValor(item.valor)}</div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-bold">
                  <span>Total do Projeto</span>
                  <span>{formatarValor(projeto.valorSolicitado)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4">
            <h3 className="font-semibold">Documentos Iniciais Anexados</h3>
            <div className="space-y-3">
              {[
                "Proposta Completa.pdf",
                "Cronograma Detalhado.xlsx",
                "Planilha Orçamentária.xlsx",
                "Documentos Pessoais.pdf",
                "Portfólio do Proponente.pdf"
              ].map((doc, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <span className="text-sm">{doc}</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="habilitacao" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Documentação de Habilitação</h3>
              {projeto.status === "Aprovado" && (
                <Button
                  onClick={() => setMostrarFormNovoDoc(!mostrarFormNovoDoc)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Solicitar Documento
                </Button>
              )}
            </div>

            {projeto.status !== "Aprovado" && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>A documentação de habilitação fica disponível apenas após a aprovação do projeto.</p>
              </div>
            )}

            {/* Formulário para adicionar novo documento */}
            {mostrarFormNovoDoc && projeto.status === "Aprovado" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Solicitar Novo Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nomeDoc">Nome do Documento</Label>
                    <Input
                      id="nomeDoc"
                      value={novoDocumento.nome}
                      onChange={(e) => setNovoDocumento({ ...novoDocumento, nome: e.target.value })}
                      placeholder="Ex: Certidão Negativa de Débitos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricaoDoc">Descrição/Instruções</Label>
                    <Textarea
                      id="descricaoDoc"
                      value={novoDocumento.descricao}
                      onChange={(e) => setNovoDocumento({ ...novoDocumento, descricao: e.target.value })}
                      placeholder="Descreva o documento solicitado e instruções para o proponente..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="obrigatorio"
                      checked={novoDocumento.obrigatorio}
                      onChange={(e) => setNovoDocumento({ ...novoDocumento, obrigatorio: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="obrigatorio">Documento obrigatório</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAdicionarDocumento}>
                      Solicitar Documento
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMostrarFormNovoDoc(false);
                        setNovoDocumento({ nome: "", descricao: "", obrigatorio: false });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de documentos de habilitação */}
            {documentosHabilitacao && documentosHabilitacao.length > 0 && (
              <div className="space-y-3">
                {documentosHabilitacao.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{doc.nome}</h4>
                            {doc.obrigatorio && (
                              <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                            )}
                            {doc.arquivo ? (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Enviado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Aguardando
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{doc.descricao}</p>
                          <div className="text-xs text-muted-foreground">
                            Solicitado em: {formatarData(doc.dataSolicitacao)}
                            {doc.arquivo && (
                              <span> • Enviado em: {formatarData(doc.arquivo.dataUpload)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {doc.arquivo ? (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              {doc.arquivo.nome}
                            </Button>
                          ) : (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <FileText className="h-4 w-4 mr-2" />
                              Pendente
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {projeto.status === "Aprovado" && (!documentosHabilitacao || documentosHabilitacao.length === 0) && !mostrarFormNovoDoc && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2">Nenhum documento de habilitação foi solicitado ainda.</p>
                <p className="text-sm">Clique em "Solicitar Documento" para adicionar uma solicitação.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};