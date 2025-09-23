import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, ExternalLink, FolderOpen, FileText, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Dados de exemplo dos editais
const editais = [
  {
    id: 1,
    codigo: "PNAB-2025-001",
    nome: "PNAB 2025 - Edital de Fomento Cultural",
    linkEdital: "https://exemplo.com/edital-pnab-2025-001.pdf",
    totalProjetos: 15,
    projetosAguardando: 12,
    projetosEmAndamento: 3,
    dataInicio: "01/07/2025",
    dataFim: "31/12/2025",
    status: "Ativo"
  },
  {
    id: 2,
    codigo: "PNAB-2025-002",
    nome: "Edital de Apoio às Artes Cênicas",
    linkEdital: "https://exemplo.com/edital-pnab-2025-002.pdf",
    totalProjetos: 8,
    projetosAguardando: 6,
    projetosEmAndamento: 2,
    dataInicio: "15/08/2025",
    dataFim: "15/11/2025",
    status: "Ativo"
  },
  {
    id: 3,
    codigo: "PNAB-2025-003",
    nome: "Fomento à Música Popular Brasileira",
    linkEdital: "https://exemplo.com/edital-pnab-2025-003.pdf",
    totalProjetos: 12,
    projetosAguardando: 10,
    projetosEmAndamento: 2,
    dataInicio: "01/09/2025",
    dataFim: "28/02/2026",
    status: "Ativo"
  },
  {
    id: 4,
    codigo: "PNAB-2025-004",
    nome: "Artes Visuais e Exposições",
    linkEdital: "https://exemplo.com/edital-pnab-2025-004.pdf",
    totalProjetos: 6,
    projetosAguardando: 4,
    projetosEmAndamento: 2,
    dataInicio: "10/10/2025",
    dataFim: "10/03/2026",
    status: "Ativo"
  }
];

const SelecionarEdital = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const editaisFiltrados = editais.filter(edital =>
    edital.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edital.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 border-green-200";
      case "Encerrado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const handleSelecionarEdital = (editalId: number) => {
    // Salvar edital selecionado no localStorage ou contexto
    localStorage.setItem("editalSelecionado", editalId.toString());
    navigate("/dashboard-parecerista");
  };

  const handleVisualizarEdital = (linkEdital: string) => {
    window.open(linkEdital, "_blank");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho com Breadcrumb */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigate("/")}
                className="cursor-pointer flex items-center gap-2 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Logout
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Seleção de Edital</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Selecionar Edital para Avaliação</h1>
          <p className="text-gray-600 mt-2">Escolha o edital que você deseja acessar para avaliar os projetos submetidos</p>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar editais por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Editais */}
      <div className="grid gap-6">
        {editaisFiltrados.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum edital encontrado</h3>
                <p className="text-gray-500">
                  {searchTerm ? "Tente ajustar os filtros de busca." : "Não há editais disponíveis no momento."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          editaisFiltrados.map((edital) => (
            <Card key={edital.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      {edital.nome}
                    </CardTitle>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Código:</span> {edital.codigo}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Período:</span> {edital.dataInicio} a {edital.dataFim}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(edital.status)}>
                    {edital.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total de Projetos</label>
                      <p className="text-lg font-bold text-gray-900">{edital.totalProjetos}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Aguardando Avaliação</label>
                      <p className="text-lg font-bold text-yellow-600">{edital.projetosAguardando}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Em Andamento</label>
                      <p className="text-lg font-bold text-green-600">{edital.projetosEmAndamento}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleSelecionarEdital(edital.id)}
                    className="bg-primary hover:bg-primary/90 flex-1"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Acessar Edital
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleVisualizarEdital(edital.linkEdital)}
                    className="flex-1 sm:flex-none"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visualizar Documento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumo no rodapé */}
      {editaisFiltrados.length > 0 && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            Exibindo {editaisFiltrados.length} de {editais.length} editais disponíveis
          </p>
        </div>
      )}
    </div>
  );
};

export default SelecionarEdital;