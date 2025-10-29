import jsPDF from 'jspdf';
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

  // Filtrar projetos por modalidades selecionadas
  const projetosFiltrados = data.projetos.filter(p => 
    data.modalidades.includes(p.modalidade)
  );

  // Processar cada modalidade
  for (const modalidade of data.modalidades) {
    const projetosModalidade = projetosFiltrados.filter(p => p.modalidade === modalidade);
    
    if (projetosModalidade.length === 0) continue;

    checkPageBreak(15);

    // Título da modalidade
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(200, 200, 200);
    doc.rect(margin, yPosition - 5, maxWidth, 8, 'F');
    doc.text(modalidade, margin + 5, yPosition);
    yPosition += 10;

    // Processar projetos da modalidade
    for (let i = 0; i < projetosModalidade.length; i++) {
      const projeto = projetosModalidade[i];
      
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

