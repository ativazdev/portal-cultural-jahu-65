import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Calendar, FileText, Music, Eye, Star, Trophy, Medal, Award, Palette, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Dados de exemplo dos projetos avaliados
const projetosAvaliados = [
  {
    id: 1,
    nome: "Projeto PNAB - Teatro na Praça",
    programa: "PNAB 2025 - Edital de Fomento",
    modalidade: "Teatro",
    dataAvaliacao: "05/08/2025",
    notaFinal: "8.5",
    status: "Avaliação Concluída",
    proponente: "Companhia Teatral Lua Nova"
  },
  {
    id: 2,
    nome: "Festival de Jazz do Interior",
    programa: "PNAB 2025 - Edital de Fomento",
    modalidade: "Música",
    dataAvaliacao: "12/07/2025",
    notaFinal: "9.2",
    status: "Avaliação Concluída",
    proponente: "Associação Musical Harmonia"
  },
  {
    id: 3,
    nome: "Exposição Fotografia Urbana",
    programa: "PNAB 2025 - Edital de Fomento",
    modalidade: "Artes Visuais",
    dataAvaliacao: "28/06/2025",
    notaFinal: "7.8",
    status: "Avaliação Concluída",
    proponente: "Coletivo Olhar Periférico"
  },
  {
    id: 4,
    nome: "Workshop de Dança Contemporânea",
    programa: "PNAB 2025 - Edital de Fomento",
    modalidade: "Dança",
    dataAvaliacao: "15/06/2025",
    notaFinal: "8.9",
    status: "Avaliação Concluída",
    proponente: "Estúdio de Movimento Livre"
  },
  {
    id: 5,
    nome: "Sarau Literário Comunitário",
    programa: "PNAB 2025 - Edital de Fomento",
    modalidade: "Literatura",
    dataAvaliacao: "03/06/2025",
    notaFinal: "7.5",
    status: "Avaliação Concluída",
    proponente: "Biblioteca Popular do Bairro"
  },
  {
    id: 6,
    nome: "Concerto de Música Clássica",
    programa: "PNAB 2025 - Edital de Fomento",
    modalidade: "Música",
    dataAvaliacao: "20/07/2025",
    notaFinal: "8.1",
    status: "Avaliação Concluída",
    proponente: "Orquestra Sinfônica Municipal"
  },
  {
    id: 7,
    nome: "Mostra de Cinema Independente",
    programa: "PNAB 2025 - Edital de Fomento",
    modalidade: "Artes Visuais",
    dataAvaliacao: "10/08/2025",
    notaFinal: "9.0",
    status: "Avaliação Concluída",
    proponente: "Coletivo Audiovisual Cidade"
  },
  {
    id: 8,
    nome: "Espetáculo Infantil Musical",
    programa: "PNAB 2025 - Edital de Fomento",
    modalidade: "Teatro",
    dataAvaliacao: "25/07/2025",
    notaFinal: "7.2",
    status: "Avaliação Concluída",
    proponente: "Cia Palhaços e Sonhos"
  }
];

const ProjetosAvaliados = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalidadeFiltro, setModalidadeFiltro] = useState<string>("all");

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
    if (notaNum >= 9) return "text-green-600 font-semibold";
    if (notaNum >= 8) return "text-blue-600 font-semibold";
    if (notaNum >= 7) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho com Breadcrumb */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigate("/dashboard-parecerista")}
                className="cursor-pointer flex items-center gap-2 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Projetos Avaliados</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos Avaliados</h1>
          <p className="text-gray-600 mt-2">Histórico de projetos que você já concluiu a avaliação</p>
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
                                  {projeto.notaFinal}/10
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                variant="outline"
                                onClick={() => navigate(`/ver-avaliacao/${projeto.id}`)}
                                className="hover:bg-white/80"
                              >
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
    </div>
  );
};

export default ProjetosAvaliados;