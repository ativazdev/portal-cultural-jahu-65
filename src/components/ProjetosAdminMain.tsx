import { useState } from "react";
import { StatusCards } from "@/components/projetos-admin/StatusCards";
import { FiltrosEBusca } from "@/components/projetos-admin/FiltrosEBusca";
import { TabelaProjetos } from "@/components/projetos-admin/TabelaProjetos";
import { DetalhesProjetoModal } from "@/components/projetos-admin/DetalhesProjetoModal";
import { AtribuirPareceristaModal } from "@/components/projetos-admin/AtribuirPareceristaModal";
import { DecisaoFinalModal } from "@/components/projetos-admin/DecisaoFinalModal";

// Tipos
export interface Projeto {
  id: string;
  nome: string;
  categoria: string;
  proponente: string;
  tipoProponente: "PF" | "PJ";
  valorSolicitado: number;
  dataSubmissao: string;
  status: "Recebido" | "Em Avaliação" | "Avaliado" | "Aprovado" | "Rejeitado";
  parecerista?: string;
}

export interface Parecerista {
  id: string;
  nome: string;
  especialidade: string;
  projetosEmAnalise: number;
}

// Dados de exemplo
const projetosExemplo: Projeto[] = [
  {
    id: "1",
    nome: "Festival de Música Popular",
    categoria: "Música",
    proponente: "João Silva",
    tipoProponente: "PF",
    valorSolicitado: 15000,
    dataSubmissao: "2024-11-15",
    status: "Recebido"
  },
  {
    id: "2",
    nome: "Teatro na Praça",
    categoria: "Teatro",
    proponente: "Maria Santos",
    tipoProponente: "PF",
    valorSolicitado: 8500,
    dataSubmissao: "2024-11-14",
    status: "Em Avaliação",
    parecerista: "Ana Costa"
  },
  {
    id: "3",
    nome: "Oficina de Dança",
    categoria: "Dança",
    proponente: "Pedro Costa",
    tipoProponente: "PJ",
    valorSolicitado: 12000,
    dataSubmissao: "2024-11-13",
    status: "Avaliado",
    parecerista: "Carlos Lima"
  },
  {
    id: "4",
    nome: "Arte Urbana",
    categoria: "Artes Visuais",
    proponente: "Coletivo Arte",
    tipoProponente: "PJ",
    valorSolicitado: 20000,
    dataSubmissao: "2024-11-12",
    status: "Aprovado",
    parecerista: "Lucia Mendes"
  }
];

const pareceristas: Parecerista[] = [
  { id: "1", nome: "Ana Costa", especialidade: "Música", projetosEmAnalise: 2 },
  { id: "2", nome: "Carlos Lima", especialidade: "Teatro", projetosEmAnalise: 1 },
  { id: "3", nome: "Lucia Mendes", especialidade: "Artes Visuais", projetosEmAnalise: 0 },
  { id: "4", nome: "Roberto Silva", especialidade: "Dança", projetosEmAnalise: 3 }
];

export const ProjetosAdminMain = () => {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosExemplo);
  const [filtros, setFiltros] = useState({
    busca: "",
    parecerista: "Todos"
  });
  
  // Estados dos modais
  const [modalDetalhes, setModalDetalhes] = useState<{ aberto: boolean; projeto?: Projeto }>({ aberto: false });
  const [modalParecerista, setModalParecerista] = useState<{ aberto: boolean; projeto?: Projeto }>({ aberto: false });
  const [modalDecisao, setModalDecisao] = useState<{ aberto: boolean; projeto?: Projeto }>({ aberto: false });

  // Filtrar projetos
  const projetosFiltrados = projetos.filter(projeto => {
    // Busca em nome do projeto, proponente e categoria
    const matchBusca = projeto.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                      projeto.proponente.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                      projeto.categoria.toLowerCase().includes(filtros.busca.toLowerCase());
    
    // Filtro por parecerista
    const matchParecerista = 
      filtros.parecerista === "Todos" || 
      (filtros.parecerista === "Não atribuído" && !projeto.parecerista) ||
      projeto.parecerista === filtros.parecerista;
    
    return matchBusca && matchParecerista;
  });

  // Calcular métricas
  const metricas = {
    recebidos: projetos.filter(p => p.status === "Recebido").length,
    emAvaliacao: projetos.filter(p => p.status === "Em Avaliação").length,
    pendentes: projetos.filter(p => p.status === "Avaliado").length,
    aprovados: projetos.filter(p => p.status === "Aprovado").length
  };

  // Handlers
  const handleVerDetalhes = (projeto: Projeto) => {
    setModalDetalhes({ aberto: true, projeto });
  };

  const handleAtribuirParecerista = (projeto: Projeto) => {
    setModalParecerista({ aberto: true, projeto });
  };

  const handleVerAvaliacao = (projeto: Projeto) => {
    setModalDecisao({ aberto: true, projeto });
  };

  const handleAprovarRejeitar = (projeto: Projeto) => {
    setModalDecisao({ aberto: true, projeto });
  };

  const confirmarAtribuicao = (projetoId: string, pareceristaId: string) => {
    const parecerista = pareceristas.find(p => p.id === pareceristaId);
    setProjetos(prev => prev.map(p => 
      p.id === projetoId 
        ? { ...p, status: "Em Avaliação" as const, parecerista: parecerista?.nome }
        : p
    ));
    setModalParecerista({ aberto: false });
  };

  const confirmarDecisao = (projetoId: string, decisao: "Aprovado" | "Rejeitado", justificativa: string) => {
    setProjetos(prev => prev.map(p => 
      p.id === projetoId 
        ? { ...p, status: decisao }
        : p
    ));
    setModalDecisao({ aberto: false });
  };

  return (
    <main className="flex-1 p-6 bg-prefeitura-accent">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-prefeitura-primary">Gestão de Projetos</h1>
          <p className="text-prefeitura-muted mt-2">Gerencie todos os projetos da PNAB</p>
        </div>

        {/* Cards de Status */}
        <StatusCards metricas={metricas} />

        {/* Filtros e Busca */}
        <FiltrosEBusca 
          filtros={filtros} 
          setFiltros={setFiltros} 
          pareceristas={pareceristas.map(p => ({ id: p.id, nome: p.nome }))} 
        />

        {/* Tabela de Projetos */}
        <TabelaProjetos 
          projetos={projetosFiltrados}
          onVerDetalhes={handleVerDetalhes}
          onAtribuirParecerista={handleAtribuirParecerista}
          onVerAvaliacao={handleVerAvaliacao}
          onAprovarRejeitar={handleAprovarRejeitar}
        />

        {/* Modais */}
        <DetalhesProjetoModal 
          aberto={modalDetalhes.aberto}
          projeto={modalDetalhes.projeto}
          onFechar={() => setModalDetalhes({ aberto: false })}
        />

        <AtribuirPareceristaModal 
          aberto={modalParecerista.aberto}
          projeto={modalParecerista.projeto}
          pareceristas={pareceristas}
          onFechar={() => setModalParecerista({ aberto: false })}
          onConfirmar={confirmarAtribuicao}
        />

        <DecisaoFinalModal 
          aberto={modalDecisao.aberto}
          projeto={modalDecisao.projeto}
          onFechar={() => setModalDecisao({ aberto: false })}
          onConfirmar={confirmarDecisao}
        />
      </div>
    </main>
  );
};