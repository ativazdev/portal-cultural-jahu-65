import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { Projeto } from '@/services/projetoService';

interface PDFData {
  tipo: 'ranking' | 'aprovados' | 'proponentes';
  modalidades: string[];
  projetos: Projeto[];
  editalNome?: string;
  editalCodigo?: string;
}

export const gerarPDF = async (data: PDFData) => {
  const doc = new jsPDF();
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  // Função para adicionar nova página se necessário
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Portal Cultural - Prefeitura de Jau', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  
  if (data.editalNome) {
    doc.text(data.editalNome, margin, yPosition);
    yPosition += 7;
  }
  
  if (data.editalCodigo) {
    doc.setFontSize(10);
    doc.text(`Código: ${data.editalCodigo}`, margin, yPosition);
    yPosition += 7;
  }

  // Tipo de relatório
  yPosition += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const tipoTitulo = {
    'ranking': 'Ranking de Classificação',
    'aprovados': 'Projetos Aprovados',
    'proponentes': 'Proponentes Contemplados'
  }[data.tipo];
  
  doc.text(tipoTitulo, margin, yPosition);
  yPosition += 10;

  // Filtrar projetos por categorias selecionadas
  const projetosFiltrados = data.projetos.filter(p => 
    data.modalidades.includes(p.modalidade)
  );

  // Processar cada categoria
  for (const modalidade of data.modalidades) {
    const projetosCategoria = projetosFiltrados.filter(p => p.modalidade === modalidade);
    
    if (projetosCategoria.length === 0) continue;

    checkPageBreak(15);

    // Título da categoria
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(200, 200, 200);
    doc.rect(margin, yPosition - 5, maxWidth, 8, 'F');
    doc.text(modalidade, margin + 5, yPosition);
    yPosition += 10;

    // Processar projetos da categoria
    for (let i = 0; i < projetosCategoria.length; i++) {
      const projeto = projetosCategoria[i];
      
      checkPageBreak(40);

      // Número de classificação (se for ranking)
      if (data.tipo === 'ranking') {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}º`, margin, yPosition);
      }

      // Nome do projeto
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const nomeLines = doc.splitTextToSize(projeto.nome, maxWidth - 40);
      doc.text(nomeLines, margin + 10, yPosition);
      yPosition += nomeLines.length * 5;

      // Número de inscrição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Inscrição: ${projeto.numero_inscricao}`, margin + 10, yPosition);
      yPosition += 6;

      // Valor solicitado
      doc.text(
        `Valor Solicitado: R$ ${projeto.valor_solicitado.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2 
        })}`, 
        margin + 10, 
        yPosition
      );
      yPosition += 6;

      // Status do projeto
      const statusLabels: Record<string, string> = {
        'rascunho': 'Rascunho',
        'aguardando_avaliacao': 'Aguardando Avaliação',
        'recebido': 'Recebido',
        'em_avaliacao': 'Em Avaliação',
        'avaliado': 'Avaliado',
        'aprovado': 'Aprovado',
        'rejeitado': 'Rejeitado',
        'em_execucao': 'Em Execução',
        'concluido': 'Concluído'
      };
      
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Status: ${statusLabels[projeto.status] || projeto.status}`, 
        margin + 10, 
        yPosition
      );
      yPosition += 6;

      // Informações do proponente (se for tipo proponentes)
      if (data.tipo === 'proponentes') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Dados do Proponente:', margin + 10, yPosition);
        yPosition += 6;
        // Aqui você pode adicionar mais dados do proponente se disponíveis
      }

      // Descrição do projeto
      if (data.tipo !== 'ranking') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const descLines = doc.splitTextToSize(
          projeto.descricao?.substring(0, 200) + '...' || 'Sem descrição', 
          maxWidth - 20
        );
        doc.text(descLines, margin + 10, yPosition);
        yPosition += descLines.length * 4;
      }

      yPosition += 5;
    }

    yPosition += 5;
  }

  // Rodapé
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Salvar PDF
  const fileName = `${tipoTitulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

interface ProjetoRanking {
  id: string;
  nome: string;
  modalidade: string;
  tipo_concorrencia: string;
  nota_final: number | null;
  ranking: number;
  status: string;
  proponente?: { nome: string };
}

interface PDFRankingData {
  projetos: ProjetoRanking[];
  tipo: 'ampla_concorrencia' | 'cotistas';
  editalNome?: string;
  editalCodigo?: string;
}

const getCategoriaLabel = (m: string) => {
  const labels: Record<string, string> = {
    'musica': 'Música',
    'teatro': 'Teatro',
    'danca': 'Dança',
    'artes_visuais': 'Artes Visuais',
    'literatura': 'Literatura',
    'cinema': 'Cinema',
    'cultura_popular': 'Cultura Popular',
    'circo': 'Circo',
    'outros': 'Outros'
  };
  return labels[m] || m;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'rascunho': 'Rascunho',
    'aguardando_avaliacao': 'Aguardando Avaliação',
    'recebido': 'Recebido',
    'em_avaliacao': 'Em Avaliação',
    'avaliado': 'Avaliado',
    'habilitado': 'Habilitado',
    'nao_habilitado': 'Não Habilitado',
    'aprovado': 'Aprovado',
    'rejeitado': 'Rejeitado',
    'em_execucao': 'Em Execução',
    'concluido': 'Concluído'
  };
  return labels[status] || status;
};

// Função auxiliar para gerar um PDF de ranking (retorna o PDF como blob)
const gerarPDFRankingBlob = async (data: PDFRankingData): Promise<Blob> => {
  const doc = new jsPDF();
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  const tableStartX = margin;
  const tableWidth = maxWidth;
  
  // Larguras das colunas ajustadas para caber na página A4 (210mm - 30mm margens = 180mm)
  // Total: 15 + 80 + 35 + 20 + 30 = 180mm
  const colWidths = {
    ranking: 15,
    nome: 80,
    modalidade: 35,
    pontos: 20,
    status: 30
  };
  
  const rowHeight = 8;
  const headerHeight = 10;

  // Função para adicionar nova página se necessário
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin - 15) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const headerText = 'Portal Cultural - Prefeitura de Jau';
  const headerWidth = doc.getTextWidth(headerText);
  doc.text(headerText, (pageWidth - headerWidth) / 2, yPosition);
  
  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  if (data.editalNome) {
    const editalNomeWidth = doc.getTextWidth(data.editalNome);
    doc.text(data.editalNome, (pageWidth - editalNomeWidth) / 2, yPosition);
    yPosition += 6;
  }
  
  if (data.editalCodigo) {
    doc.setFontSize(10);
    const codigoText = `Código: ${data.editalCodigo}`;
    const codigoWidth = doc.getTextWidth(codigoText);
    doc.text(codigoText, (pageWidth - codigoWidth) / 2, yPosition);
    yPosition += 6;
  }

  // Título do tipo de concorrência
  yPosition += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const tipoTitulo = data.tipo === 'ampla_concorrencia' 
    ? 'Ranking - Ampla Concorrência' 
    : 'Ranking - Cotistas';
  const tipoTituloWidth = doc.getTextWidth(tipoTitulo);
  doc.text(tipoTitulo, (pageWidth - tipoTituloWidth) / 2, yPosition);
  yPosition += 10;

  // Ordenar projetos por categoria e depois por ranking
  const projetosOrdenados = [...data.projetos].sort((a, b) => {
    if (a.modalidade !== b.modalidade) {
      return a.modalidade.localeCompare(b.modalidade);
    }
    return a.ranking - b.ranking;
  });

  // Agrupar por categoria
  const projetosPorCategoria = projetosOrdenados.reduce((acc, projeto) => {
    if (!acc[projeto.modalidade]) {
      acc[projeto.modalidade] = [];
    }
    acc[projeto.modalidade].push(projeto);
    return acc;
  }, {} as Record<string, ProjetoRanking[]>);

  // Processar cada categoria
  for (const [modalidade, projetosCategoria] of Object.entries(projetosPorCategoria)) {
    checkPageBreak(35);

    // Título da categoria
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(230, 230, 230);
    doc.rect(tableStartX, yPosition - 6, tableWidth, headerHeight, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.rect(tableStartX, yPosition - 6, tableWidth, headerHeight, 'S');
    doc.setTextColor(0, 0, 0);
    doc.text(getCategoriaLabel(modalidade), tableStartX + 5, yPosition);
    yPosition += headerHeight + 2;

    // Cabeçalho da tabela
    checkPageBreak(rowHeight + 5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 245, 245);
    doc.rect(tableStartX, yPosition - 6, tableWidth, rowHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(tableStartX, yPosition - 6, tableWidth, rowHeight, 'S');
    
    // Desenhar linhas verticais do cabeçalho
    let xPos = tableStartX;
    doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + rowHeight);
    xPos += colWidths.ranking;
    doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + rowHeight);
    xPos += colWidths.nome;
    doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + rowHeight);
    xPos += colWidths.modalidade;
    doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + rowHeight);
    xPos += colWidths.pontos;
    doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + rowHeight);
    
    // Textos do cabeçalho
    xPos = tableStartX + 3;
    doc.text('Ranking', xPos, yPosition);
    xPos += colWidths.ranking;
    doc.text('Nome', xPos, yPosition);
    xPos += colWidths.nome;
    doc.text('Categoria', xPos, yPosition);
    xPos += colWidths.modalidade;
    doc.text('Pontos', xPos, yPosition);
    xPos += colWidths.pontos;
    doc.text('Status', xPos, yPosition);
    
    yPosition += rowHeight;

    // Linhas da tabela
    for (let i = 0; i < projetosCategoria.length; i++) {
      const projeto = projetosCategoria[i];
      const isLast = i === projetosCategoria.length - 1;
      
      checkPageBreak(rowHeight + 5);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      // Calcular altura necessária para todas as células (pode quebrar linha)
      const nomeLines = doc.splitTextToSize(projeto.nome, colWidths.nome - 4);
      const CategoriaLabel = getCategoriaLabel(projeto.modalidade);
      const CategoriaLines = doc.splitTextToSize(CategoriaLabel, colWidths.modalidade - 4);
      const statusLabel = getStatusLabel(projeto.status);
      const statusLines = doc.splitTextToSize(statusLabel, colWidths.status - 4);
      
      const maxLines = Math.max(nomeLines.length, CategoriaLines.length, statusLines.length, 1);
      const cellHeight = Math.max(rowHeight, maxLines * 4 + 2);
      
      // Desenhar célula da linha
      doc.setDrawColor(220, 220, 220);
      doc.rect(tableStartX, yPosition - 6, tableWidth, cellHeight, 'S');
      
      // Desenhar linhas verticais
      xPos = tableStartX;
      doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + cellHeight);
      xPos += colWidths.ranking;
      doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + cellHeight);
      xPos += colWidths.nome;
      doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + cellHeight);
      xPos += colWidths.modalidade;
      doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + cellHeight);
      xPos += colWidths.pontos;
      doc.line(xPos, yPosition - 6, xPos, yPosition - 6 + cellHeight);
      
      // Posição Y inicial para o texto (topo da célula com pequeno padding)
      const textY = yPosition - 2;
      
      xPos = tableStartX + 2;
      
      // Ranking
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${projeto.ranking}º`, xPos, textY);
      xPos += colWidths.ranking;
      
      // Nome (pode quebrar linha)
      doc.setFont('helvetica', 'normal');
      if (Array.isArray(nomeLines)) {
        let nomeY = textY;
        nomeLines.forEach((line: string) => {
          doc.text(line, xPos, nomeY);
          nomeY += 4;
        });
      } else {
        doc.text(nomeLines, xPos, textY);
      }
      xPos += colWidths.nome;
      
      // modalidade
      if (Array.isArray(CategoriaLines)) {
        let CategoriaY = textY;
        CategoriaLines.forEach((line: string) => {
          doc.text(line, xPos, CategoriaY);
          CategoriaY += 4;
        });
      } else {
        doc.text(CategoriaLabel, xPos, textY);
      }
      xPos += colWidths.modalidade;
      
      // Pontos
      doc.setFont('helvetica', 'bold');
      const pontos = projeto.nota_final !== null ? projeto.nota_final.toFixed(1) : '-';
      doc.text(pontos, xPos, textY);
      xPos += colWidths.pontos;
      
      // Status
      doc.setFont('helvetica', 'normal');
      if (Array.isArray(statusLines)) {
        let statusY = textY;
        statusLines.forEach((line: string) => {
          doc.text(line, xPos, statusY);
          statusY += 4;
        });
      } else {
        doc.text(statusLabel, xPos, textY);
      }
      
      yPosition += cellHeight;
    }

    yPosition += 8;
  }

  // Rodapé
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  // Retornar PDF como blob
  return doc.output('blob');
};

// Função pública que gera e salva um PDF de ranking
export const gerarPDFRanking = async (data: PDFRankingData) => {
  const blob = await gerarPDFRankingBlob(data);
  const tipoLabel = data.tipo === 'ampla_concorrencia' ? 'Ampla_Concorrencia' : 'Cotistas';
  const fileName = `Ranking_${tipoLabel}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Criar link de download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Interface para gerar múltiplos PDFs e baixar como ZIP
interface GerarPDFsRankingData {
  amplaConcorrencia?: ProjetoRanking[];
  cotistas?: ProjetoRanking[];
  editalNome?: string;
  editalCodigo?: string;
}

// Função para gerar ZIP com os PDFs
export const gerarPDFsRankingZIP = async (data: GerarPDFsRankingData) => {
  const zip = new JSZip();
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Gerar PDF de Ampla Concorrência se houver projetos
  if (data.amplaConcorrencia && data.amplaConcorrencia.length > 0) {
    const pdfBlob = await gerarPDFRankingBlob({
      projetos: data.amplaConcorrencia,
      tipo: 'ampla_concorrencia',
      editalNome: data.editalNome,
      editalCodigo: data.editalCodigo
    });
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
    zip.file(`Ranking_Ampla_Concorrencia_${dateStr}.pdf`, pdfArrayBuffer);
  }
  
  // Gerar PDF de Cotistas se houver projetos
  if (data.cotistas && data.cotistas.length > 0) {
    const pdfBlob = await gerarPDFRankingBlob({
      projetos: data.cotistas,
      tipo: 'cotistas',
      editalNome: data.editalNome,
      editalCodigo: data.editalCodigo
    });
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
    zip.file(`Ranking_Cotistas_${dateStr}.pdf`, pdfArrayBuffer);
  }
  
  // Verificar se há pelo menos um PDF para gerar o ZIP
  const fileCount = Object.keys(zip.files).length;
  if (fileCount === 0) {
    throw new Error('Nenhum projeto para gerar PDF');
  }
  
  // Gerar e baixar ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFileName = `Rankings_${data.editalCodigo || 'Edital'}_${dateStr}.zip`;
  
  // Criar link de download
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

