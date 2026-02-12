/**
 * Utilitário para realizar o download de arquivos com fallback para abertura em nova aba.
 */
export const handleDownload = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    // Fallback para abrir em nova aba se o fetch falhar (ex: CORS)
    window.open(url, '_blank');
  }
};
