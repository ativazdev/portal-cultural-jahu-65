import { supabase } from '@/integrations/supabase/client';

export interface EmailPareceristaData {
  parecerista: {
    nome: string;
    email: string;
    especialidade: string[];
    prefeitura_nome: string;
  };
  credenciais: {
    email: string;
    senha: string;
  };
}

export const emailService = {
  async enviarEmailParecerista(data: EmailPareceristaData) {
    try {
      const { data: result, error } = await supabase.functions.invoke('enviar-email-parecerista', {
        body: data
      });

      if (error) {
        throw new Error(error.message || 'Erro ao enviar e-mail');
      }

      return result;
    } catch (error) {
      console.error('Erro no serviço de e-mail:', error);
      throw error;
    }
  }
};
