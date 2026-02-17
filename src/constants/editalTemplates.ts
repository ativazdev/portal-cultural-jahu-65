/**
 * Mapeamento de chaves técnicas de templates de documentos para rótulos amigáveis.
 * Utilizado para manter consistência no banco de dados (keys) e legibilidade na UI (labels).
 */
export const EDITAL_TEMPLATES = {
  template_etnico_racial: "Declaração Étnico Racial",
  template_pcd: "Declaração de Pessoa com Deficiência",
  template_representacao_grupo: "Declaração de representação de grupo ou coletivo",
  template_recurso: "Formulário de Apresentação de Recurso",
  template_execucao_cultural: "Termo de Execução Cultural",
  template_relatorio_objeto: "Relatório de Objeto da Execução Cultural",
} as const;

export type EditalTemplateKey = keyof typeof EDITAL_TEMPLATES;

/**
 * Retorna o label amigável para uma chave de template, ou a própria chave se não encontrada.
 */
export const getTemplateLabel = (key: string): string => {
  return EDITAL_TEMPLATES[key as EditalTemplateKey] || key;
};

/**
 * Verifica se um título de documento corresponde a uma chave de template conhecida.
 */
export const isTemplateKey = (key: string): boolean => {
  return Object.keys(EDITAL_TEMPLATES).includes(key);
};
