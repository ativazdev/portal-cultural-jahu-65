import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, Upload, FileText, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import { Projeto, DocumentoHabilitacao } from "@/components/ProjetosAdminMain";

interface DetalhesProjetoModalProps {
  aberto: boolean;
  projeto?: Projeto;
  onFechar: () => void;
  onAtualizarProjeto?: (projeto: Projeto) => void;
  loading?: boolean;
}

export const DetalhesProjetoModal = ({ aberto, projeto, onFechar, onAtualizarProjeto, loading = false }: DetalhesProjetoModalProps) => {
  const [novoDocumento, setNovoDocumento] = useState({ nome: "", descricao: "", obrigatorio: false });
  const [mostrarFormNovoDoc, setMostrarFormNovoDoc] = useState(false);
  const [documentosHabilitacao, setDocumentosHabilitacao] = useState<DocumentoHabilitacao[]>([]);
  const [necessitaComprovanteResidencia, setNecessitaComprovanteResidencia] = useState<boolean | null>(null);

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

  const gerarDocumentosObrigatorios = () => {
    if (!projeto) return [];

    const documentos: DocumentoHabilitacao[] = [];
    const hoje = new Date().toISOString().split('T')[0];

    switch (projeto.tipoProponente) {
      case "PF":
        documentos.push(
          {
            id: "rg",
            nome: "RG",
            descricao: "Documento de identidade (RG) do proponente",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "rg"
          },
          {
            id: "cpf",
            nome: "CPF",
            descricao: "Cadastro de Pessoa Física (CPF) do proponente",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "cpf"
          },
          {
            id: "certidao_negativa",
            nome: "Certidão Negativa de Débitos",
            descricao: "Certidão negativa de débitos relativas ao crédito tributário estaduais e municipais",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "certidao_negativa"
          },
          {
            id: "certidao_trabalhista",
            nome: "Certidão Negativa de Débitos Trabalhista",
            descricao: "Certidão negativa de débitos trabalhista",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "certidao_trabalhista"
          }
        );

        // Comprovante de residência condicional
        if (necessitaComprovanteResidencia === true) {
          documentos.push({
            id: "comprovante_residencia",
            nome: "Comprovante de Residência",
            descricao: "Comprovante de residência do proponente",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "comprovante_residencia"
          });
        }
        break;

      case "PJ":
        documentos.push(
          {
            id: "cnpj",
            nome: "CNPJ",
            descricao: "Inscrição no cadastro nacional de pessoa jurídica - CNPJ",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "cnpj"
          },
          {
            id: "atos_constitutivos",
            nome: "Atos Constitutivos",
            descricao: "Contrato social para no caso de pessoas jurídicas com fins lucrativos ou estatuto, nos casos de organizações da sociedade civil",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "atos_constitutivos"
          },
          {
            id: "rg",
            nome: "RG",
            descricao: "Documento de identidade (RG) do representante legal",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "rg"
          },
          {
            id: "cpf",
            nome: "CPF",
            descricao: "Cadastro de Pessoa Física (CPF) do representante legal",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "cpf"
          },
          {
            id: "certidoes_pj",
            nome: "Certidões da Pessoa Jurídica",
            descricao: "Certidão negativa de falência e recuperação judicial, Certidão negativa de débitos relativos a crédito tributário, Certidão negativa de débitos estaduais e municipais, Certidão negativa de débitos trabalhistas - CNDT",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "certidao_falencia"
          },
          {
            id: "crf_fgts",
            nome: "CRF/FGTS",
            descricao: "Certificado de regularidade do fundo de garantia do tempo de serviço - CRF/FGTS",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "crf_fgts"
          }
        );
        break;

      case "Grupo":
        documentos.push(
          {
            id: "rg",
            nome: "RG",
            descricao: "Documento de identidade (RG) do representante do grupo",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "rg"
          },
          {
            id: "cpf",
            nome: "CPF",
            descricao: "Cadastro de Pessoa Física (CPF) do representante do grupo",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "cpf"
          },
          {
            id: "certidoes_grupo",
            nome: "Certidões do Representante",
            descricao: "Certidão negativa de débitos relativos créditos tributários federal e divida ativa da união em nome do representante do grupo, Certidões negativa de débito relativos ao crédito tributário estaduais e municipais, Certidão negativa de débitos trabalhistas - CNDT",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "certidao_negativa"
          },
          {
            id: "comprovante_residencia",
            nome: "Comprovante de Residência",
            descricao: "Comprovante de residência do representante do grupo",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "comprovante_residencia"
          },
          {
            id: "certidoes_positivas",
            nome: "Certidões Positivas com Efeito de Negativas",
            descricao: "Certidões positivas com efeito de negativas",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "outros"
          },
          {
            id: "declaracao_representacao",
            nome: "Declaração de Representação",
            descricao: "Declaração de representação, se for concorrer como um coletivo sem CNPJ",
            obrigatorio: true,
            dataSolicitacao: hoje,
            status: "pendente",
            tipo: "declaracao_representacao"
          }
        );
        break;
    }

    return documentos;
  };

  const handleEnviarPendencia = () => {
    const documentosGerados = gerarDocumentosObrigatorios();
    setDocumentosHabilitacao(documentosGerados);

    if (onAtualizarProjeto && projeto) {
      const projetoAtualizado = {
        ...projeto,
        documentosHabilitacao: documentosGerados,
        necessitaComprovanteResidencia: necessitaComprovanteResidencia || false
      };
      onAtualizarProjeto(projetoAtualizado);
    }

    console.log("Pendência enviada com documentos:", documentosGerados);
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="w-[90vw] h-[85vh] max-w-none flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados do projeto...</p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {projeto.nome}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span><strong>Edital:</strong> {projeto.edital?.nome || 'N/A'}</span>
                <span><strong>Status:</strong> 
                  <Badge className={`ml-2 ${
                    projeto.status === "aprovado" ? "bg-green-100 text-green-800" :
                    projeto.status === "em_avaliacao" ? "bg-orange-100 text-orange-800" :
                    projeto.status === "rejeitado" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {projeto.status}
                  </Badge>
                </span>
                <span><strong>Valor:</strong> {formatarValor(projeto.valorSolicitado)}</span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Submetido em: {formatarData(projeto.dataSubmissao)}</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="proponente" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-8 bg-gray-50 p-1 rounded-lg flex-shrink-0">
            <TabsTrigger value="proponente" className="text-xs">👤 Proponente</TabsTrigger>
            <TabsTrigger value="projeto" className="text-xs">📋 Projeto</TabsTrigger>
            <TabsTrigger value="publico" className="text-xs">👥 Público</TabsTrigger>
            <TabsTrigger value="acessibilidade" className="text-xs">♿ Acessibilidade</TabsTrigger>
            <TabsTrigger value="execucao" className="text-xs">⚡ Execução</TabsTrigger>
            <TabsTrigger value="equipe" className="text-xs">👥 Equipe</TabsTrigger>
            <TabsTrigger value="cronograma" className="text-xs">📅 Cronograma</TabsTrigger>
            <TabsTrigger value="orcamento" className="text-xs">💰 Orçamento</TabsTrigger>
          </TabsList>

          <TabsContent value="proponente" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  👤 Dados do Proponente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">📝</span>
                      <span className="text-sm font-semibold text-gray-700">Nome</span>
                    </div>
                    <p className="text-gray-900 font-medium">{projeto.proponente?.nome || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">🏢</span>
                      <span className="text-sm font-semibold text-gray-700">Tipo</span>
                    </div>
                    <p className="text-gray-900 font-medium">{projeto.proponente?.tipo || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">🆔</span>
                      <span className="text-sm font-semibold text-gray-700">CPF/CNPJ</span>
                    </div>
                    <p className="text-gray-900 font-medium">{projeto.proponente?.cpf || projeto.proponente?.cnpj || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">📍</span>
                      <span className="text-sm font-semibold text-gray-700">Cidade</span>
                    </div>
                    <p className="text-gray-900 font-medium">{projeto.proponente?.cidade || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">📞</span>
                      <span className="text-sm font-semibold text-gray-700">Telefone</span>
                    </div>
                    <p className="text-gray-900 font-medium">{projeto.proponente?.telefone || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">📊</span>
                      <span className="text-sm font-semibold text-gray-700">Status</span>
                    </div>
                    <Badge className={`${
                      projeto.status === "aprovado" ? "bg-green-100 text-green-800" :
                      projeto.status === "em_avaliacao" ? "bg-orange-100 text-orange-800" :
                      projeto.status === "rejeitado" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {projeto.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba: Dados do Projeto */}
          <TabsContent value="projeto" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dados do Projeto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Nome do Projeto</span>
                    <p className="text-sm font-medium text-gray-900">{projeto.nome}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Categoria</span>
                    <p className="text-sm text-gray-900">{projeto.categoria || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Edital</span>
                    <p className="text-sm text-gray-900">{projeto.edital?.nome || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Data de Submissão</span>
                    <p className="text-sm text-gray-900">{formatarData(projeto.dataSubmissao)}</p>
              </div>
              <div>
                    <span className="text-sm font-medium text-gray-600">Valor Solicitado</span>
                    <p className="text-sm font-bold text-green-600">
                      {formatarValor(projeto.valorSolicitado)}
                    </p>
                  </div>
                  {projeto.parecerista && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Parecerista</span>
                      <p className="text-sm text-gray-900">{projeto.parecerista?.nome || 'N/A'}</p>
                    </div>
                  )}
              </div>
            </div>

              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Descrição do Projeto</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.descricao || 'Descrição não disponível'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Objetivos</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.objetivos || 'Objetivos não disponíveis'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Metas</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.metas || 'Metas não especificadas'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba: Público Alvo */}
          <TabsContent value="publico" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Público Alvo</h3>
              
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Perfil do público a ser atingido</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.perfilPublico || 'Informação não disponível'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Ação voltada prioritariamente para</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.publicoPrioritario?.join(', ') || 'Informação não disponível'}
                  </p>
                  {projeto.outroPublicoPrioritario && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Outro:</strong> {projeto.outroPublicoPrioritario}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba: Acessibilidade */}
          <TabsContent value="acessibilidade" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Acessibilidade</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Acessibilidade Arquitetônica</h4>
                  <p className="text-sm text-gray-700">
                    {projeto.acessibilidadeArquitetonica?.join(', ') || 'Não especificado'}
                  </p>
                  {projeto.outraAcessibilidadeArquitetonica && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Outro:</strong> {projeto.outraAcessibilidadeArquitetonica}
                    </p>
                  )}
            </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Acessibilidade Comunicacional</h4>
                  <p className="text-sm text-gray-700">
                    {projeto.acessibilidadeComunicacional?.join(', ') || 'Não especificado'}
                  </p>
                  {projeto.outraAcessibilidadeComunicacional && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Outro:</strong> {projeto.outraAcessibilidadeComunicacional}
                    </p>
                  )}
            </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Acessibilidade Atitudinal</h4>
                  <p className="text-sm text-gray-700">
                    {projeto.acessibilidadeAtitudinal?.join(', ') || 'Não especificado'}
                  </p>
                </div>
            </div>

              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Implementação de Acessibilidade</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.implementacaoAcessibilidade || 'Informação não disponível'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba: Execução */}
          <TabsContent value="execucao" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Execução do Projeto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Local de Execução</span>
                    <p className="text-sm text-gray-900">{projeto.localExecucao || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Data de Início</span>
                    <p className="text-sm text-gray-900">{projeto.dataInicio ? formatarData(projeto.dataInicio) : 'N/A'}</p>
                  </div>
                </div>
            <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Data de Finalização</span>
                    <p className="text-sm text-gray-900">{projeto.dataFinal ? formatarData(projeto.dataFinal) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Duração</span>
                    <p className="text-sm text-gray-900">{projeto.duracaoMeses || 'N/A'} meses</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Estratégia de Divulgação</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.estrategiaDivulgacao || 'Informação não disponível'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Outras Fontes de Financiamento</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.outrasFontes ? 'Sim' : 'Não'}
                  </p>
                  {projeto.outrasFontes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <strong>Detalhes:</strong> {projeto.detalhesOutrasFontes}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Tipos:</strong> {projeto.tiposOutrasFontes?.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
            <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600">Venda de Produtos</span>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {projeto.vendaProdutos ? 'Sim' : 'Não'}
                  </p>
                  {projeto.vendaProdutos && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Detalhes:</strong> {projeto.detalhesVendaProdutos}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba: Equipe */}
          <TabsContent value="equipe" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  👥 Equipe do Projeto
                </h3>
                {projeto.equipe && projeto.equipe.length > 0 ? (
                  <div className="space-y-4">
                    {projeto.equipe.map((membro, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {membro.nome?.charAt(0) || 'E'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{membro.nome}</h4>
                            <p className="text-sm text-indigo-600 font-medium">{membro.funcao}</p>
                            <p className="text-sm text-gray-600 mt-1">{membro.mini_curriculo || 'Sem descrição'}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>CPF/CNPJ: {membro.cpf_cnpj || 'N/A'}</span>
                              <span>Indígena: {membro.indigena ? 'Sim' : 'Não'}</span>
                              <span>LGBTQIA+: {membro.lgbtqiapn ? 'Sim' : 'Não'}</span>
                              <span>PCD: {membro.deficiencia ? 'Sim' : 'Não'}</span>
                            </div>
                          </div>
                        </div>
                </div>
              ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum membro da equipe cadastrado</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cronograma" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📅 Cronograma de Atividades
                </h3>
                {projeto.cronograma && projeto.cronograma.length > 0 ? (
                  <div className="space-y-4">
                    {projeto.cronograma.map((atividade, index) => (
                      <div key={atividade.id || index} className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{atividade.nome_atividade}</h4>
                            <p className="text-sm text-purple-600 font-medium">{atividade.etapa}</p>
                            <p className="text-sm text-gray-600 mt-1">{atividade.descricao}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>Início: {formatarData(atividade.data_inicio)}</span>
                              <span>Fim: {formatarData(atividade.data_fim)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma atividade cadastrada</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orcamento" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💰 Planilha Orçamentária
                </h3>
                {projeto.orcamento && projeto.orcamento.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Unit.</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {projeto.orcamento.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.descricao}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.quantidade}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {formatarValor(item.valor_unitario)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {formatarValor(item.valor_unitario * item.quantidade)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                  </div>
                </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-bold">
                  <span>Total do Projeto</span>
                  <span>{formatarValor(projeto.valorSolicitado)}</span>
                </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum item de orçamento cadastrado</p>
                  </div>
                )}
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
                <div className="flex gap-2">
                  {!documentosHabilitacao.length && (
                    <Button
                      onClick={handleEnviarPendencia}
                      size="sm"
                      variant="default"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Pendência
                    </Button>
                  )}
                  <Button
                    onClick={() => setMostrarFormNovoDoc(!mostrarFormNovoDoc)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Solicitar Documento
                  </Button>
                </div>
              )}
            </div>

            {projeto.status !== "Aprovado" && projeto.status !== "Em execução" && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>A documentação de habilitação fica disponível apenas após a aprovação do projeto.</p>
              </div>
            )}

            {/* Pergunta sobre comprovante de residência para PF */}
            {projeto.status === "Aprovado" && projeto.tipoProponente === "PF" && !documentosHabilitacao.length && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Comprovante de Residência</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    O proponente se enquadra em alguma das seguintes situações?
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mb-4 space-y-1">
                    <li>Pertencente indígena, quilombola, cigano ou circense</li>
                    <li>Pertencente a população nômade ou itinerante</li>
                    <li>Que se encontre em situação de rua</li>
                  </ul>
                  <div className="flex gap-2">
                    <Button
                      variant={necessitaComprovanteResidencia === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNecessitaComprovanteResidencia(false)}
                    >
                      Sim
                    </Button>
                    <Button
                      variant={necessitaComprovanteResidencia === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNecessitaComprovanteResidencia(true)}
                    >
                      Não
                    </Button>
                  </div>
                  {necessitaComprovanteResidencia === false && (
                    <p className="text-xs text-green-600 mt-2">
                      Comprovante de residência não será solicitado.
                    </p>
                  )}
                  {necessitaComprovanteResidencia === true && (
                    <p className="text-xs text-blue-600 mt-2">
                      Comprovante de residência será incluído nos documentos obrigatórios.
                    </p>
                  )}
                </CardContent>
              </Card>
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
                            {doc.status === "enviado" || doc.arquivo ? (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Enviado
                              </Badge>
                            ) : doc.status === "aprovado" ? (
                              <Badge variant="default" className="text-xs bg-green-600 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprovado
                              </Badge>
                            ) : doc.status === "rejeitado" ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Rejeitado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};