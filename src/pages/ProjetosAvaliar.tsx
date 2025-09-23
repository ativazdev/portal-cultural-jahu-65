import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Calendar, FileText, Music, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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


const ProjetosAvaliar = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { editalSelecionado, loading, obterProjetosParaAvaliar } = useEditalSelecionado();

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

  const projetos = obterProjetosParaAvaliar();

  const projetosFiltrados = projetos.filter(projeto =>
    projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projeto.proponente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aguardando Avaliação":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Em Avaliação":
        return "bg-blue-100 text-blue-800 border-blue-200";
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
        return <Eye className="h-4 w-4" />;
      case "Dança":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
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
                <h1 className="text-3xl font-bold text-gray-900">Projetos para Avaliar - {editalSelecionado.nome}</h1>
                <p className="text-gray-600 mt-2">Gerencie os projetos do edital {editalSelecionado.codigo} que aguardam sua avaliação</p>
              </div>
            </div>

            {/* Barra de Busca */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar projetos por nome ou proponente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lista de Projetos */}
            <div className="grid gap-6">
              {projetosFiltrados.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                      <p className="text-gray-500">
                        {searchTerm ? "Tente ajustar os filtros de busca." : "Não há projetos para avaliar no momento."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                projetosFiltrados.map((projeto) => (
                  <Card key={projeto.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                            {getModalidadeIcon(projeto.modalidade)}
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
                        <Badge className={getStatusColor(projeto.status)}>
                          {projeto.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Modalidade</label>
                          <p className="text-sm text-gray-900">{projeto.modalidade}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Data de Submissão</label>
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {projeto.dataSubmissao}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Prazo para Avaliação</label>
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {projeto.prazoAvaliacao}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={() => navigate(`/avaliar-projeto/${projeto.id}`)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {projeto.status === "Em Avaliação" ? "Continuar Avaliação" : "Iniciar Avaliação"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Resumo no rodapé */}
            {projetosFiltrados.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  Exibindo {projetosFiltrados.length} de {projetos.length} projetos
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProjetosAvaliar;