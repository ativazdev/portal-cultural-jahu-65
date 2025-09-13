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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("useAuth: Setting up auth listener");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("useAuth: Auth state changed", event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("useAuth: User found, fetching profile");
          // Fetch user profile
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          console.log("useAuth: No user, clearing profile");
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("useAuth: Initial session check", !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log("useAuth: Initial user found, fetching profile");
        fetchProfile(session.user.id);
      } else {
        console.log("useAuth: No initial session");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("useAuth: Fetching profile for user", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("useAuth: Profile fetch error", error);
        throw error;
      }
      console.log("useAuth: Profile fetched successfully", data);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signUp = async (email: string, password: string, userType: UserType, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            user_type: userType,
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até mais!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDashboardRoute = (userType: UserType) => {
    switch (userType) {
      case "prefeitura":
        return "/dashboard-prefeitura";
      case "proponente":
        return "/dashboard";
      case "parecerista":
        return "/dashboard-parecerista";
      default:
        return "/";
    }
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
  };
};