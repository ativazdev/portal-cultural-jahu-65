import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  prefeitura_id: string;
  nome: string;
  cargo: string;
  telefone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Prefeitura {
  id: string;
  nome: string;
  municipio: string;
  estado: string;
  cnpj: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cep?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  user: User;
  profile: UserProfile;
  prefeitura: Prefeitura;
}

export const authService = {
  async signIn(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      console.log('🔐 Tentando fazer login com:', credentials.email);
      
      // Fazer login via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      console.log('🔐 Resultado do auth:', { authData, authError });

      if (authError || !authData.user) {
        console.error('❌ Erro no auth:', authError);
        throw new Error('Credenciais inválidas');
      }

      // Buscar profile do usuário
      console.log('👤 Buscando profile para user_id:', authData.user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          prefeitura:prefeitura_id (*)
        `)
        .eq('user_id', authData.user.id)
        .single();

      console.log('👤 Resultado do profile:', { profile, profileError });

      if (profileError || !profile) {
        console.error('❌ Erro no profile:', profileError);
        throw new Error('Perfil de usuário não encontrado');
      }

      // Verificar se o usuário tem permissão para acessar a prefeitura
      if (!profile.prefeitura.ativo) {
        throw new Error('Prefeitura inativa');
      }

      return {
        user: authData.user,
        profile: {
          id: profile.id,
          user_id: profile.user_id,
          prefeitura_id: profile.prefeitura_id,
          nome: profile.nome,
          cargo: profile.cargo,
          telefone: profile.telefone,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        },
        prefeitura: profile.prefeitura
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return null;
    }
  },

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log('👤 getCurrentUser: Verificando sessão...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('👤 getCurrentUser: Sessão:', { session, error });
      
      if (error || !session?.user) {
        console.log('👤 getCurrentUser: Sem sessão ativa');
        return null;
      }

      console.log('👤 getCurrentUser: Buscando profile...');
      // Buscar profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          prefeitura:prefeitura_id (*)
        `)
        .eq('user_id', session.user.id)
        .single();

      console.log('👤 getCurrentUser: Profile result:', { profile, profileError });

      if (profileError || !profile) {
        console.log('👤 getCurrentUser: Profile não encontrado');
        return null;
      }

      console.log('👤 getCurrentUser: Profile encontrado:', profile);
      return {
        user: session.user,
        profile: {
          id: profile.id,
          user_id: profile.user_id,
          prefeitura_id: profile.prefeitura_id,
          nome: profile.nome,
          cargo: profile.cargo,
          telefone: profile.telefone,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        },
        prefeitura: profile.prefeitura
      };
    } catch (error) {
      console.error('❌ Erro ao obter usuário atual:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser();
        callback(authUser);
      } else {
        callback(null);
      }
    });
  },

  async updateProfile(updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'prefeitura_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  }
};
