import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Search, ArrowLeft, Calendar, FileText, Music, Eye, Star, Trophy, Medal, Award, Palette, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PareceristaHeader } from "@/components/PareceristaHeader";
import { PareceristaSidebar } from "@/components/PareceristaSidebar";
import { useEditalSelecionado } from "@/hooks/useEditalSelecionado";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";



const ProjetosAvaliados = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalidadeFiltro, setModalidadeFiltro] = useState<string>("all");
  const [isModalAvaliacaoAberto, setIsModalAvaliacaoAberto] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<any>(null);
  const { editalSelecionado, loading, obterProjetosAvaliados } = useEditalSelecionado();

  useEffect(() => {
    if (!loading && !editalSelecionado) {
      navigate("/selecionar-edital");
    }
  }, [loading, editalSelecionado, navigate]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <PareceristaSidebar />
          <div className="flex-1 flex flex-col">
            <PareceristaHeader />
            <main className="flex-1 p-6">Carregando...</main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!editalSelecionado) {
    return null;
  }

  const projetosAvaliados = obterProjetosAvaliados();

  // Função para ver avaliação
  const handleVerAvaliacao = (projeto: any) => {
    setProjetoSelecionado(projeto);
    setIsModalAvaliacaoAberto(true);
    toast({
      title: "Avaliação carregada",
      description: `Exibindo avaliação completa do projeto "${projeto.nome}".`,
    });
  };

  // Filtrar projetos por busca e modalidade
  const projetosFiltrados = projetosAvaliados.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.proponente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.modalidade.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModalidade = modalidadeFiltro === "all" || projeto.modalidade === modalidadeFiltro;
    
    return matchesSearch && matchesModalidade;
  });

  // Agrupar e ordenar projetos por modalidade
  const projetosPorModalidade = projetosFiltrados.reduce((acc, projeto) => {
    const modalidade = projeto.modalidade;
    if (!acc[modalidade]) {
      acc[modalidade] = [];
    }
    acc[modalidade].push(projeto);
    return acc;
  }, {} as Record<string, typeof projetosAvaliados>);

  // Ordenar projetos dentro de cada modalidade por nota (maior para menor)
  Object.keys(projetosPorModalidade).forEach(modalidade => {
    projetosPorModalidade[modalidade].sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));
  });

  // Obter todas as modalidades disponíveis
  const modalidadesDisponiveis = [...new Set(projetosAvaliados.map(p => p.modalidade))].sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Avaliação Concluída":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getModalidadeIcon = (modalidade: string) => {
    switch (modalidade) {
      case "Música":
        return <Music className="h-4 w-4" />;
      case "Teatro":
        return <FileText className="h-4 w-4" />;
      case "Artes Visuais":
        return <Palette className="h-4 w-4" />;
      case "Dança":
        return <Eye className="h-4 w-4" />;
      case "Literatura":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRankingIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankingColor = (posicao: number) => {
    switch (posicao) {
      case 1:
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200";
      default:
        return "bg-gradient-to-r from-blue-50 to-blue-25 border-blue-100";
    }
  };

  const getNotaColor = (nota: string) => {
    const notaNum = parseFloat(nota);
    if (notaNum >= 60) return "text-green-600 font-semibold"; // 85%+ da nota máxima
    if (notaNum >= 50) return "text-blue-600 font-semibold";  // 70%+ da nota máxima
    if (notaNum >= 40) return "text-yellow-600 font-semibold"; // 55%+ da nota máxima
    return "text-red-600 font-semibold"; // Abaixo de 55%
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <PareceristaSidebar />
        <div className="flex-1 flex flex-col">
          <PareceristaHeader />
          <main className="flex-1 p-6 space-y-6">
            {/* Cabeçalho com Breadcrumb */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Projetos Avaliados - {editalSelecionado.nome}</h1>
                <p className="text-gray-600 mt-2">Histórico de projetos do edital {editalSelecionado.codigo} que você já concluiu a avaliação</p>
              </div>
            </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar projetos por nome, proponente ou modalidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={modalidadeFiltro} onValueChange={setModalidadeFiltro}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por modalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as modalidades</SelectItem>
            {modalidadesDisponiveis.map(modalidade => (
              <SelectItem key={modalidade} value={modalidade}>
                {modalidade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Projetos Agrupados por Modalidade */}
      <div className="space-y-8">
        {Object.keys(projetosPorModalidade).length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                <p className="text-gray-500">
                  {searchTerm || modalidadeFiltro ? "Tente ajustar os filtros de busca." : "Não há projetos avaliados no momento."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(projetosPorModalidade)
            .sort(([modalidadeA], [modalidadeB]) => modalidadeA.localeCompare(modalidadeB))
            .map(([modalidade, projetos]) => (
              <div key={modalidade} className="space-y-4">
                {/* Cabeçalho da Modalidade */}
                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                  {getModalidadeIcon(modalidade)}
                  <h2 className="text-2xl font-bold text-gray-900">{modalidade}</h2>
                  <Badge variant="secondary" className="ml-2">
                    {projetos.length} {projetos.length === 1 ? 'projeto' : 'projetos'}
                  </Badge>
                </div>

                {/* Lista de Projetos da Modalidade */}
                <div className="grid gap-4">
                  {projetos.map((projeto, index) => {
                    const posicao = index + 1;
                    return (
                      <Card key={projeto.id} className={`hover:shadow-md transition-shadow ${getRankingColor(posicao)}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <CardTitle className="text-xl text-gray-900 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {getRankingIcon(posicao)}
                                  <span className="text-lg font-bold text-gray-700">#{posicao}</span>
                                </div>
                                {projeto.nome}
                              </CardTitle>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Programa:</span> {projeto.programa}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Proponente:</span> {projeto.proponente}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getStatusColor(projeto.status)}>
                                {projeto.status}
                              </Badge>
                              <div className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className={`text-lg font-bold ${getNotaColor(projeto.notaFinal)}`}>
                                  {projeto.notaFinal}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Posição no Ranking</label>
                              <div className="flex items-center gap-2">
                                {getRankingIcon(posicao)}
                                <span className="text-sm font-bold text-gray-900">#{posicao} lugar</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Data de Avaliação</label>
                              <p className="text-sm text-gray-900 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {projeto.dataAvaliacao}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Nota Final</label>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className={`text-sm font-bold ${getNotaColor(projeto.notaFinal)}`}>
                                  {projeto.notaFinal}/70
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                variant="outline"
                                onClick={() => handleVerAvaliacao(projeto)}
                                className="hover:bg-white/80"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Avaliação
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Resumo no rodapé */}
      {projetosFiltrados.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Exibindo {projetosFiltrados.length} de {projetosAvaliados.length} projetos avaliados
            </p>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Nota média:</span> {" "}
              <span className="text-blue-600 font-semibold">
                {(projetosFiltrados.reduce((acc, p) => acc + parseFloat(p.notaFinal), 0) / projetosFiltrados.length).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização da Avaliação */}
      <Dialog open={isModalAvaliacaoAberto} onOpenChange={setIsModalAvaliacaoAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Avaliação - {projetoSelecionado?.nome}</DialogTitle>
          </DialogHeader>
          
          {projetoSelecionado && (
            <div className="space-y-6">
              {/* Informações do Projeto */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium text-gray-600">Nome do Projeto</Label>
                    <p className="font-semibold">{projetoSelecionado.nome}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-600">Proponente</Label>
                    <p>{projetoSelecionado.proponente}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-600">Modalidade</Label>
                    <Badge variant="secondary">{projetoSelecionado.modalidade}</Badge>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-600">Data da Avaliação</Label>
                    <p>{projetoSelecionado.dataAvaliacao}</p>
                  </div>
                </div>
              </div>

              {/* Resumo da Pontuação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">45/50</div>
                    <p className="text-sm text-gray-600">Critérios Obrigatórios</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">+{parseInt(projetoSelecionado.notaFinal) - 45}/20</div>
                    <p className="text-sm text-gray-600">Pontuação Bônus</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-3xl font-bold ${getNotaColor(projetoSelecionado.notaFinal)}`}>
                      {projetoSelecionado.notaFinal}/70
                    </div>
                    <p className="text-sm text-gray-600">Nota Final</p>
                  </CardContent>
                </Card>
              </div>

              {/* Avaliação por Critérios */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Avaliação por Critérios</Label>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Critério A - Qualidade do Projeto</span>
                      <span className="font-bold text-blue-600">9/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Coerência do objeto, objetivos e justificativa do projeto
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        Projeto bem estruturado com objetivos claros e justificativa sólida. 
                        Demonstra conhecimento técnico e viabilidade de execução.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Critério B - Relevância Cultural</span>
                      <span className="font-bold text-blue-600">8/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Relevância do projeto para o cenário cultural de Jaú
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        Projeto apresenta boa relevância para a comunidade local, 
                        contribuindo para o desenvolvimento cultural da região.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Critério C - Integração Comunitária</span>
                      <span className="font-bold text-blue-600">9/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Aspectos de integração comunitária e impacto social
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        Excelente proposta de integração com a comunidade, 
                        prevendo ações inclusivas e participação popular.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Critério D - Trajetória Artística</span>
                      <span className="font-bold text-blue-600">10/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Trajetória artística e cultural do agente cultural
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        Proponente com trajetória consolidada e experiência comprovada 
                        na área cultural, com projetos anteriores de sucesso.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Critério E - Promoção de Diversidade</span>
                      <span className="font-bold text-blue-600">9/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Estratégias que promovem diversidade étnico-racial, de gênero, etc.
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        Projeto contempla estratégias efetivas de promoção da diversidade 
                        e inclusão, com ações específicas para diferentes grupos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Critérios Bônus */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Critérios Bônus</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg bg-green-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Agente cultural do gênero feminino</span>
                      <span className="font-bold text-green-600">+5 pontos</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Agente cultural negro ou indígena</span>
                      <span className="font-bold text-gray-400">0 pontos</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Agente cultural com deficiência</span>
                      <span className="font-bold text-gray-400">0 pontos</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-green-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Agente cultural de região de menor IDH</span>
                      <span className="font-bold text-green-600">+{parseInt(projetoSelecionado.notaFinal) - 50} pontos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parecer Final */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">Parecer Final do Parecerista</Label>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-700">
                    O projeto apresenta excelente qualidade técnica e relevância cultural para a região. 
                    A proposta está bem fundamentada, com cronograma viável e orçamento adequado. 
                    O proponente demonstra experiência e competência para executar o projeto conforme proposto. 
                    Recomendo a aprovação do projeto, que certamente contribuirá para o desenvolvimento 
                    cultural de Jaú e região. A integração comunitária proposta é especialmente destacável, 
                    assim como as estratégias de inclusão e diversidade apresentadas.
                  </p>
                </div>
              </div>

              {/* Resultado da Avaliação */}
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-green-800">Resultado: PROJETO APROVADO</h4>
                    <p className="text-sm text-green-700">
                      Nota final: {projetoSelecionado.notaFinal}/70 pontos (Aprovação: ≥30 pontos)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{projetoSelecionado.notaFinal}/70</div>
                    <p className="text-sm text-green-600">
                      {((parseInt(projetoSelecionado.notaFinal) / 70) * 100).toFixed(1)}% da nota máxima
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalAvaliacaoAberto(false)}
            >
              Fechar
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

export default ProjetosAvaliados;