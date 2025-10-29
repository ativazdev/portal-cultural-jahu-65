import { supabase } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testando conexão com Supabase...');
    
    // Testar conexão básica
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .limit(1);
    
    console.log('🧪 Resultado do teste:', { data, error });
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
};

export const testAuth = async (email: string, password: string) => {
  try {
    console.log('🧪 Testando autenticação...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('🧪 Resultado da autenticação:', { data, error });
    
    if (error) {
      console.error('❌ Erro na autenticação:', error);
      return false;
    }
    
    console.log('✅ Autenticação funcionando!');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de auth:', error);
    return false;
  }
};
