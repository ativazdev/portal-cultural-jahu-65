export const formatCPF = (value: string) => {
  const numeros = value.replace(/\D/g, '');
  if (numeros.length <= 11) {
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value.substring(0, 14);
};

export const formatCNPJ = (value: string) => {
  const numeros = value.replace(/\D/g, '');
  return numeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

export const formatRG = (value: string) => {
  const numeros = value.replace(/\D/g, '');
  let formatted = '';
  if (numeros.length > 0) {
    formatted = numeros.substring(0, 2);
    if (numeros.length > 2) {
      formatted += '.' + numeros.substring(2, 5);
      if (numeros.length > 5) {
        formatted += '.' + numeros.substring(5, 8);
        if (numeros.length > 8) {
          formatted += '-' + numeros.substring(8, 9);
        }
      }
    }
  }
  return formatted;
};

export const formatTelefone = (value: string) => {
  const numeros = value.replace(/\D/g, '');
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  } else {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  }
};

export const formatCEP = (value: string) => {
  const numeros = value.replace(/\D/g, '');
  return numeros
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

export const isValidCPF = (cpf: string) => {
  if (!cpf) return false;
  const cpfClean = cpf.replace(/\D/g, '');
  if (cpfClean.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpfClean)) return false;
  // Simplificado para este contexto
  return true;
};

export const isValidCNPJ = (cnpj: string) => {
  if (!cnpj) return false;
  const cnpjClean = cnpj.replace(/\D/g, '');
  if (cnpjClean.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpjClean)) return false;
  return true;
};
