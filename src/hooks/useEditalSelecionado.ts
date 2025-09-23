import { useState, useEffect } from "react";

// Dados de exemplo dos editais (seria vindo de uma API)
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
    status: "Ativo",
    descricao: "Edital destinado ao fomento de projetos culturais diversos na cidade de Jaú",
    modalidades: ["Música", "Teatro", "Dança", "Artes Visuais", "Literatura"],
    valorMaximo: 50000,
    prazoAvaliacao: 30
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
    status: "Ativo",
    descricao: "Apoio específico para projetos de teatro e performance em Jaú",
    modalidades: ["Teatro", "Performance", "Circo"],
    valorMaximo: 30000,
    prazoAvaliacao: 21
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
    status: "Ativo",
    descricao: "Edital específico para projetos musicais da cultura popular brasileira",
    modalidades: ["Música"],
    valorMaximo: 25000,
    prazoAvaliacao: 15
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
    status: "Ativo",
    descricao: "Suporte para exposições e projetos de artes visuais",
    modalidades: ["Artes Visuais", "Fotografia", "Escultura"],
    valorMaximo: 40000,
    prazoAvaliacao: 25
  }
];

export interface Edital {
  id: number;
  codigo: string;
  nome: string;
  linkEdital: string;
  totalProjetos: number;
  projetosAguardando: number;
  projetosEmAndamento: number;
  dataInicio: string;
  dataFim: string;
  status: string;
  descricao: string;
  modalidades: string[];
  valorMaximo: number;
  prazoAvaliacao: number;
}

// Função para gerar projetos baseados no edital selecionado
const gerarProjetosParaEdital = (editalId: number, nomeEdital: string, modalidades: string[]) => {
  const projetosBase = [
    {
      prefixo: "Festival de Inverno",
      modalidade: "Música",
      proponente: "Maria Silva Santos",
      status: "Aguardando Avaliação"
    },
    {
      prefixo: "Oficinas de Teatro",
      modalidade: "Teatro",
      proponente: "João Carlos Oliveira",
      status: "Aguardando Avaliação"
    },
    {
      prefixo: "Exposição de Arte Contemporânea",
      modalidade: "Artes Visuais",
      proponente: "Ana Paula Costa",
      status: "Em Avaliação"
    },
    {
      prefixo: "Festival de Dança Popular",
      modalidade: "Dança",
      proponente: "Carlos Eduardo Santos",
      status: "Aguardando Avaliação"
    },
    {
      prefixo: "Sarau Literário",
      modalidade: "Literatura",
      proponente: "Beatriz Fernandes",
      status: "Aguardando Avaliação"
    },
    {
      prefixo: "Mostra de Cinema",
      modalidade: "Artes Visuais",
      proponente: "Roberto Lima",
      status: "Aguardando Avaliação"
    },
    {
      prefixo: "Concerto Sinfônico",
      modalidade: "Música",
      proponente: "Orquestra Municipal",
      status: "Aguardando Avaliação"
    },
    {
      prefixo: "Performance Urbana",
      modalidade: "Teatro",
      proponente: "Coletivo Artístico",
      status: "Aguardando Avaliação"
    }
  ];

  return projetosBase
    .filter(projeto => modalidades.includes(projeto.modalidade))
    .map((projeto, index) => ({
      id: index + 1,
      nome: `${projeto.prefixo} - ${nomeEdital.split(' - ')[0]}`,
      programa: nomeEdital,
      modalidade: projeto.modalidade,
      dataSubmissao: `${10 + index}/08/2025`,
      prazoAvaliacao: `${15 + index * 5}/09/2025`,
      status: projeto.status,
      proponente: projeto.proponente
    }));
};

// Função para gerar projetos avaliados baseados no edital selecionado
const gerarProjetosAvaliadosParaEdital = (editalId: number, nomeEdital: string, modalidades: string[]) => {
  const projetosBase = [
    { prefixo: "Teatro na Praça", modalidade: "Teatro", nota: "59", proponente: "Companhia Teatral Lua Nova" },
    { prefixo: "Festival de Jazz", modalidade: "Música", nota: "64", proponente: "Associação Musical Harmonia" },
    { prefixo: "Fotografia Urbana", modalidade: "Artes Visuais", nota: "55", proponente: "Coletivo Olhar Periférico" },
    { prefixo: "Dança Contemporânea", modalidade: "Dança", nota: "62", proponente: "Estúdio de Movimento Livre" },
    { prefixo: "Sarau Literário", modalidade: "Literatura", nota: "52", proponente: "Biblioteca Popular do Bairro" },
    { prefixo: "Música Clássica", modalidade: "Música", nota: "57", proponente: "Orquestra Sinfônica Municipal" },
    { prefixo: "Cinema Independente", modalidade: "Artes Visuais", nota: "63", proponente: "Coletivo Audiovisual Cidade" },
    { prefixo: "Espetáculo Infantil", modalidade: "Teatro", nota: "51", proponente: "Cia Palhaços e Sonhos" }
  ];

  return projetosBase
    .filter(projeto => modalidades.includes(projeto.modalidade))
    .slice(0, Math.min(modalidades.length + 2, 6))
    .map((projeto, index) => ({
      id: index + 1,
      nome: `${projeto.prefixo} - ${nomeEdital.split(' - ')[0]}`,
      programa: nomeEdital,
      modalidade: projeto.modalidade,
      dataAvaliacao: `${5 + index * 5}/0${Math.min(8 + Math.floor(index / 2), 9)}/2025`,
      notaFinal: projeto.nota,
      status: "Avaliação Concluída",
      proponente: projeto.proponente
    }));
};

export const useEditalSelecionado = () => {
  const [editalSelecionado, setEditalSelecionado] = useState<Edital | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarEdital = () => {
    const editalId = localStorage.getItem("editalSelecionado");
    if (editalId) {
      const edital = editais.find(e => e.id === parseInt(editalId));
      setEditalSelecionado(edital || null);
    } else {
      setEditalSelecionado(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarEdital();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "editalSelecionado") {
        carregarEdital();
      }
    };

    // Listener customizado para mudanças feitas na mesma aba
    const handleCustomStorageChange = () => {
      carregarEdital();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("editalSelecionadoChanged", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("editalSelecionadoChanged", handleCustomStorageChange);
    };
  }, []);

  const atualizarEditalSelecionado = (novoEditalId: number) => {
    const edital = editais.find(e => e.id === novoEditalId);
    if (edital) {
      setEditalSelecionado(edital);
      localStorage.setItem("editalSelecionado", novoEditalId.toString());

      // Dispara evento customizado para outras abas/componentes
      window.dispatchEvent(new CustomEvent("editalSelecionadoChanged"));
    }
  };

  // Métodos para obter dados dos projetos
  const obterProjetosParaAvaliar = () => {
    if (!editalSelecionado) return [];
    return gerarProjetosParaEdital(
      editalSelecionado.id,
      editalSelecionado.nome,
      editalSelecionado.modalidades
    );
  };

  const obterProjetosAvaliados = () => {
    if (!editalSelecionado) return [];
    return gerarProjetosAvaliadosParaEdital(
      editalSelecionado.id,
      editalSelecionado.nome,
      editalSelecionado.modalidades
    );
  };

  const obterEstatisticasProjetos = () => {
    if (!editalSelecionado) return { pendentes: 0, avaliados: 0, emAndamento: 0 };

    const projetosParaAvaliar = obterProjetosParaAvaliar();
    const projetosAvaliados = obterProjetosAvaliados();

    const pendentes = projetosParaAvaliar.filter(p => p.status === "Aguardando Avaliação").length;
    const emAndamento = projetosParaAvaliar.filter(p => p.status === "Em Avaliação").length;
    const avaliados = projetosAvaliados.length;

    return { pendentes, avaliados, emAndamento };
  };

  return {
    editalSelecionado,
    loading,
    atualizarEditalSelecionado,
    todosEditais: editais,
    obterProjetosParaAvaliar,
    obterProjetosAvaliados,
    obterEstatisticasProjetos,
    // Exporta as funções para uso direto se necessário
    gerarProjetosParaEdital,
    gerarProjetosAvaliadosParaEdital
  };
};