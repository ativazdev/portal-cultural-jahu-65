import { supabase } from "@/integrations/supabase/client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PareceristaAuthUser {
  parecerista: {
    id: string;
    prefeitura_id: string;
    email: string;
    nome: string;
    cpf: string;
    especialidades: string[];
    status: string;
  };
  prefeitura: {
    id: string;
    nome: string;
    municipio: string;
    estado: string;
  };
}

export const pareceristaAuthService = {
  async signIn(credentials: LoginCredentials): Promise<PareceristaAuthUser | null> {
    try {
      console.log('🔐 Tentando fazer login do parecerista com:', credentials.email);
      
      // Chamar a edge function para autenticação
      const { data, error } = await supabase.functions.invoke('auth-parecerista', {
        body: {
          email: credentials.email,
          senha: credentials.password
        }
      });

      console.log('🔐 Resultado da edge function:', { data, error });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(error.message || 'Erro ao fazer login');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || data?.message || 'Credenciais inválidas');
      }

      const userData = {
        parecerista: data.parecerista,
        prefeitura: data.prefeitura
      };

      // Salvar token e dados no localStorage
      if (data.token) {
        localStorage.setItem('parecerista_token', data.token);
      }
      localStorage.setItem('parecerista_auth', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('❌ Erro no login do parecerista:', error);
      throw error;
    }
  },

  async getCurrentParecerista(): Promise<PareceristaAuthUser | null> {
    try {
      // Buscar o parecerista do localStorage
      const storedUser = localStorage.getItem('parecerista_auth');
      const token = localStorage.getItem('parecerista_token');
      
      if (!storedUser || !token) {
        return null;
      }

      // Configurar o token JWT nas requisições do Supabase
      supabase.rest.headers = {
        ...supabase.rest.headers,
        Authorization: `Bearer ${token}`,
      };

      const userData = JSON.parse(storedUser);
      return userData;
    } catch (error) {
      console.error('❌ Erro ao buscar parecerista atual:', error);
      return null;
    }
  },

  async signOut(): Promise<void> {
    try {
      // Remover do localStorage
      localStorage.removeItem('parecerista_auth');
      localStorage.removeItem('parecerista_token');
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout do parecerista:', error);
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('parecerista_token');
    return !!token;
  }
};

