import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export type UserType = "prefeitura" | "proponente" | "parecerista";

export interface UserProfile {
  id: string;
  user_type: UserType;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  // Mock user data - sistema sem autenticação
  const mockUser = {
    id: "mock-user-id",
    email: "demo@sistema.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: "authenticated",
    role: "authenticated"
  } as User;

  const mockSession = {
    user: mockUser,
    access_token: "mock-token",
    expires_at: Date.now() + 86400000, // 24 horas
    refresh_token: "mock-refresh-token",
    token_type: "bearer"
  } as Session;

  const [user, setUser] = useState<User | null>(mockUser);
  const [session, setSession] = useState<Session | null>(mockSession);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // Sem loading pois não há autenticação real
  const { toast } = useToast();

  useEffect(() => {
    // Sistema sem autenticação - sempre define um perfil padrão
    setLoading(false);
  }, []);

  // Funções simplificadas para sistema sem autenticação
  const signUp = async (email: string, password: string, userType: UserType, fullName?: string) => {
    // Simula sucesso no cadastro
    toast({
      title: "Acesso liberado!",
      description: "Redirecionando para o sistema...",
    });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Simula sucesso no login
    toast({
      title: "Acesso liberado!",
      description: "Redirecionando para o sistema...",
    });
    return { error: null };
  };

  const signOut = async () => {
    // Simula logout
    const slug = getPrefeituraSlugFromStorage();
    
    toast({
      title: "Logout realizado!",
      description: "Voltando à tela inicial...",
    });
    
    // Retornar URL de login da prefeitura
    return slug ? `/${slug}/login` : '/';
  };

  // Define um perfil padrão baseado no tipo de usuário selecionado
  const setMockProfile = (userType: UserType) => {
    const mockProfile: UserProfile = {
      id: "mock-user-id",
      user_type: userType,
      email: "demo@sistema.com",
      full_name: `Usuário Demo ${userType}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProfile(mockProfile);
  };

  const getDashboardRoute = (userType: UserType, prefeituraSlug?: string) => {
    const slug = prefeituraSlug || getPrefeituraSlugFromStorage();
    
    if (!slug) {
      return "/"; // Redirecionar para seleção de prefeitura
    }
    
    switch (userType) {
      case "prefeitura":
        return `/${slug}/prefeitura/dashboard`;
      case "proponente":
        return `/${slug}/dashboard`;
      case "parecerista":
        // Verificar se já tem um edital selecionado
        const editalSelecionado = localStorage.getItem("editalSelecionado");
        return editalSelecionado ? `/${slug}/parecerista/dashboard` : `/${slug}/selecionar-edital`;
      default:
        return `/${slug}/login`;
    }
  };
  
  const getPrefeituraSlugFromStorage = (): string | null => {
    try {
      const prefeituraData = localStorage.getItem('prefeitura_atual');
      if (prefeituraData) {
        const data = JSON.parse(prefeituraData);
        return data.slug;
      }
    } catch (err) {
      console.error('Erro ao obter slug da prefeitura:', err);
    }
    return null;
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    getDashboardRoute,
    setMockProfile,
  };
};