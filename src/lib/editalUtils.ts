/**
 * Utilitários para validação de editais
 */

export interface EditalData {
  data_final_envio_projeto: string;
  horario_final_envio_projeto: string;
}

/**
 * Verifica se o prazo do edital já finalizou
 * @param edital - Dados do edital
 * @returns true se o prazo finalizou, false caso contrário
 */
export function isEditalPrazoFinalizado(edital: EditalData): boolean {
  const agora = new Date();
  const dataFinal = new Date(edital.data_final_envio_projeto);
  const horarioFinal = edital.horario_final_envio_projeto;
  
  // Criar data/hora final completa
  const [hora, minuto, segundo] = horarioFinal.split(':').map(Number);
  dataFinal.setHours(hora, minuto, segundo || 0);
  
  return agora > dataFinal;
}

/**
 * Calcula os dias restantes para o prazo final do edital
 * @param edital - Dados do edital
 * @returns número de dias restantes (pode ser negativo se já passou)
 */
export function getDiasRestantesEdital(edital: EditalData): number {
  const agora = new Date();
  const dataFinal = new Date(edital.data_final_envio_projeto);
  const horarioFinal = edital.horario_final_envio_projeto;
  
  // Criar data/hora final completa
  const [hora, minuto, segundo] = horarioFinal.split(':').map(Number);
  dataFinal.setHours(hora, minuto, segundo || 0);
  
  return Math.ceil((dataFinal.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Formata o status do prazo do edital para exibição
 * @param edital - Dados do edital
 * @returns objeto com status e texto formatado
 */
export function getStatusPrazoEdital(edital: EditalData) {
  const prazoFinalizado = isEditalPrazoFinalizado(edital);
  const diasRestantes = getDiasRestantesEdital(edital);
  
  if (prazoFinalizado) {
    return {
      finalizado: true,
      texto: "Prazo Finalizado",
      cor: "text-red-600",
      corBotao: "bg-gray-400 cursor-not-allowed"
    };
  }
  
  return {
    finalizado: false,
    texto: `${diasRestantes} dias`,
    cor: "text-gray-900",
    corBotao: "bg-cultural-primary hover:bg-cultural-primary/90"
  };
}
