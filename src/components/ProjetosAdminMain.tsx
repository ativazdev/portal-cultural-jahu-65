import { useState } from "react";
import { StatusCards } from "@/components/projetos-admin/StatusCards";
import { FiltrosEBusca } from "@/components/projetos-admin/FiltrosEBusca";
import { TabelaProjetos } from "@/components/projetos-admin/TabelaProjetos";
import { DetalhesProjetoModal } from "@/components/projetos-admin/DetalhesProjetoModal";
import { AtribuirPareceristaModal } from "@/components/projetos-admin/AtribuirPareceristaModal";
import { DecisaoFinalModal } from "@/components/projetos-admin/DecisaoFinalModal";

// Tipos
export interface DocumentoHabilitacao {
  id: string;
  nome: string;
  descricao: string;
  arquivo?: {
    nome: string;
    url: string;
    dataUpload: string;
  };
  obrigatorio: boolean;
  dataSolicitacao: string;
  status?: "pendente" | "enviado" | "aprovado" | "rejeitado";
  tipo?: "rg" | "cpf" | "certidao_negativa" | "certidao_trabalhista" | "comprovante_residencia" | "cnpj" | "atos_constitutivos" | "certidao_falencia" | "crf_fgts" | "declaracao_representacao" | "outros";
}

export interface Projeto {
  id: string;
  nome: string;
  categoria: string;
  proponente: string;
  tipoProponente: "PF" | "PJ" | "Grupo";
  valorSolicitado: number;
  dataSubmissao: string;
  status: "Recebido" | "Em Avaliação" | "Avaliado" | "Aprovado" | "Rejeitado" | "Em execução";
  parecerista?: string;
  edital: string;
  documentosHabilitacao?: DocumentoHabilitacao[];
  necessitaComprovanteResidencia?: boolean;
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
    status: "Recebido",
    edital: "PNAB-2025-001"
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
    parecerista: "Ana Costa",
    edital: "PNAB-2025-002"
  },
  {
    id: "3",
    nome: "Oficina de Dança",
    categoria: "Dança",
    proponente: "Pedro Costa",
    tipoProponente: "PJ",
    valorSolicitado: 12000,
    dataSubmissao: "2024-11-13",
    status: "Aprovado",
    parecerista: "Carlos Lima",
    edital: "PNAB-2025-001"
  },
  {
    id: "5",
    nome: "Manifestação Cultural Indígena",
    categoria: "Cultura Popular",
    proponente: "Grupo Raízes da Terra",
    tipoProponente: "Grupo",
    valorSolicitado: 18000,
    dataSubmissao: "2024-11-11",
    status: "Aprovado",
    parecerista: "Ana Costa",
    edital: "PNAB-2025-001"
  },
  {
    id: "6",
    nome: "Exposição de Arte Contemporânea",
    categoria: "Artes Visuais",
    proponente: "Galeria Cultural Jahu",
    tipoProponente: "PJ",
    valorSolicitado: 25000,
    dataSubmissao: "2024-10-15",
    status: "Em execução",
    parecerista: "Lucia Mendes",
    edital: "PNAB-2025-004",
    documentosHabilitacao: [
      {
        id: "1",
        nome: "CNPJ",
        descricao: "Cartão de CNPJ atualizado",
        obrigatorio: true,
        dataSolicitacao: "2024-10-20",
        status: "aprovado",
        tipo: "cnpj",
        arquivo: {
          nome: "cnpj_galeria_cultural.pdf",
          url: "/documentos/cnpj_galeria_cultural.pdf",
          dataUpload: "2024-10-22"
        }
      },
      {
        id: "2",
        nome: "Atos Constitutivos",
        descricao: "Estatuto social ou contrato social da empresa",
        obrigatorio: true,
        dataSolicitacao: "2024-10-20",
        status: "aprovado",
        tipo: "atos_constitutivos",
        arquivo: {
          nome: "contrato_social.pdf",
          url: "/documentos/contrato_social.pdf",
          dataUpload: "2024-10-23"
        }
      },
      {
        id: "3",
        nome: "Certidão Negativa de Falência",
        descricao: "Certidão negativa de falência e concordata",
        obrigatorio: true,
        dataSolicitacao: "2024-10-20",
        status: "aprovado",
        tipo: "certidao_falencia",
        arquivo: {
          nome: "certidao_negativa_falencia.pdf",
          url: "/documentos/certidao_negativa_falencia.pdf",
          dataUpload: "2024-10-25"
        }
      },
      {
        id: "4",
        nome: "Certificado de Regularidade do FGTS",
        descricao: "CRF - Certificado de Regularidade do FGTS",
        obrigatorio: true,
        dataSolicitacao: "2024-10-20",
        status: "aprovado",
        tipo: "crf_fgts",
        arquivo: {
          nome: "crf_fgts.pdf",
          url: "/documentos/crf_fgts.pdf",
          dataUpload: "2024-10-26"
        }
      },
      {
        id: "5",
        nome: "Certidão Negativa Trabalhista",
        descricao: "Certidão negativa de débitos trabalhistas",
        obrigatorio: true,
        dataSolicitacao: "2024-10-20",
        status: "aprovado",
        tipo: "certidao_trabalhista",
        arquivo: {
          nome: "certidao_trabalhista.pdf",
          url: "/documentos/certidao_trabalhista.pdf",
          dataUpload: "2024-10-27"
        }
      },
      {
        id: "6",
        nome: "Declaração de Representação",
        descricao: "Declaração de que o representante tem poderes para assinar em nome da instituição",
        obrigatorio: true,
        dataSolicitacao: "2024-10-20",
        status: "aprovado",
        tipo: "declaracao_representacao",
        arquivo: {
          nome: "declaracao_representacao.pdf",
          url: "/documentos/declaracao_representacao.pdf",
          dataUpload: "2024-10-28"
        }
      }
    ]
  }
];

const pareceristas: Parecerista[] = [
  { id: "1", nome: "Ana Costa", especialidade: "Música", projetosEmAnalise: 2 },
  { id: "2", nome: "Carlos Lima", especialidade: "Teatro", projetosEmAnalise: 1 },
  { id: "3", nome: "Lucia Mendes", especialidade: "Artes Visuais", projetosEmAnalise: 0 },
  { id: "4", nome: "Roberto Silva", especialidade: "Dança", projetosEmAnalise: 3 }
];

// Dados dos editais
const editais = [
  { codigo: "PNAB-2025-001", nome: "PNAB 2025 - Edital de Fomento Cultural" },
  { codigo: "PNAB-2025-002", nome: "Edital de Apoio às Artes Cênicas" },
  { codigo: "PNAB-2025-003", nome: "Fomento à Música Popular Brasileira" },
  { codigo: "PNAB-2025-004", nome: "Artes Visuais e Exposições" }
];

export const ProjetosAdminMain = () => {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosExemplo);
  const [filtros, setFiltros] = useState({
    busca: "",
    parecerista: "Todos",
    edital: "Todos"
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

    // Filtro por edital
    const matchEdital =
      filtros.edital === "Todos" ||
      projeto.edital === filtros.edital;

    return matchBusca && matchParecerista && matchEdital;
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

  const handleAtualizarProjeto = (projetoAtualizado: Projeto) => {
    setProjetos(prev => prev.map(p =>
      p.id === projetoAtualizado.id ? projetoAtualizado : p
    ));
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
          editais={editais}
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
          onAtualizarProjeto={handleAtualizarProjeto}
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