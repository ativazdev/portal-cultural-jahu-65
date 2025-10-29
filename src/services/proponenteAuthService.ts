import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UsuarioProponente {
  id: string;
  prefeitura_id: string;
  email: string;
  nome: string;
  ativo: boolean;
  email_verificado: boolean;
  ultimo_acesso?: string;
  created_at: string;
  updated_at: string;
}

export interface ProponenteAuthUser {
  proponente: UsuarioProponente;
  prefeitura: {
    id: string;
    nome: string;
    municipio: string;
    estado: string;
  };
}

export const proponenteAuthService = {
  async signIn(credentials: LoginCredentials): Promise<ProponenteAuthUser | null> {
    try {
      console.log('🔐 Tentando fazer login do proponente com:', credentials.email);
      
      // Chamar a edge function para autenticação
      const { data, error } = await supabase.functions.invoke('auth-usuario-proponente', {
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

      // A edge function retorna 'usuario' não 'proponente'
      const usuario = data.usuario;
      const prefeitura = data.usuario?.prefeitura;

      // Mapear usuario para proponente
      const proponente = {
        id: usuario.id,
        prefeitura_id: usuario.prefeitura_id,
        email: usuario.email,
        nome: usuario.nome,
        ativo: true,
        email_verificado: true,
        ultimo_acesso: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const userData = {
        proponente,
        prefeitura: prefeitura ? {
          id: usuario.prefeitura_id,
          ...prefeitura
        } : null
      };

      // Salvar token e dados no localStorage
      if (data.token) {
        localStorage.setItem('proponente_token', data.token);
      }
      localStorage.setItem('proponente_auth', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('❌ Erro no login do proponente:', error);
      throw error;
    }
  },

  async getCurrentProponente(): Promise<ProponenteAuthUser | null> {
    try {
      // Buscar o proponente do localStorage
      const storedUser = localStorage.getItem('proponente_auth');
      const token = localStorage.getItem('proponente_token');
      
      if (!storedUser || !token) {
        return null;
      }

      // Configurar o token JWT nas requisições do Supabase
      // Isso será usado pelas políticas RLS
      supabase.rest.headers = {
        ...supabase.rest.headers,
        Authorization: `Bearer ${token}`,
      };

      const userData = JSON.parse(storedUser);
      return userData;
    } catch (error) {
      console.error('❌ Erro ao buscar proponente atual:', error);
      return null;
    }
  },

  async signOut(): Promise<void> {
    try {
      // Remover do localStorage
      localStorage.removeItem('proponente_auth');
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout do proponente:', error);
    }
  },

  async signUp(data: {
    prefeitura_id: string;
    email: string;
    nome: string;
    password: string;
  }): Promise<ProponenteAuthUser | null> {
    try {
      console.log('📝 Criando novo proponente:', data.email);
      
      // Chamar a edge function para cadastro
      const { data: response, error } = await supabase.functions.invoke('cadastrar-usuario-proponente', {
        body: {
          prefeitura_id: data.prefeitura_id,
          email: data.email,
          nome: data.nome,
          senha: data.password
        }
      });

      console.log('📝 Resultado da edge function:', { response, error });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(error.message || 'Erro ao criar conta');
      }

      if (!response || !response.success) {
        throw new Error(response?.error || response?.message || 'Erro ao criar conta');
      }

      console.log('✅ Usuário criado com sucesso');
      
      // Retornar null para que o usuário seja redirecionado para login
      return null;
    } catch (error) {
      console.error('❌ Erro no cadastro do proponente:', error);
      throw error;
    }
  },

  async solicitarRedefinicaoSenha(email: string): Promise<void> {
    try {
      console.log('📧 Solicitando redefinição de senha para:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        console.error('❌ Erro ao solicitar redefinição:', error);
        throw error;
      }

      console.log('✅ Email de redefinição enviado');
    } catch (error) {
      console.error('❌ Erro ao solicitar redefinição de senha:', error);
      throw error;
    }
  },

  async redefinirSenha(newPassword: string): Promise<void> {
    try {
      console.log('🔑 Redefinindo senha...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Erro ao redefinir senha:', error);
        throw error;
      }

      console.log('✅ Senha redefinida com sucesso');
    } catch (error) {
      console.error('❌ Erro ao redefinir senha:', error);
      throw error;
    }
  }
};

