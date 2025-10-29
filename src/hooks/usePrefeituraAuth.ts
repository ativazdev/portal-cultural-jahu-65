import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService, AuthUser } from '@/services/authService';

export const usePrefeituraAuth = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  
  // Função de toast simplificada
  const toast = (options: any) => {
    console.log('🍞 Toast:', options);
  };
  
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('🔄 Carregando usuário atual...');
        const userData = await authService.getCurrentUser();
        console.log('🔄 Usuário carregado:', userData);
        
        // Verificar se o usuário tem profile válido
        if (!userData || !userData.profile) {
          console.log('⚠️ Usuário sem profile, fazendo logout...');
          await authService.signOut();
          if (nomePrefeitura) {
            navigate(`/${nomePrefeitura}/login`);
          }
          return;
        }
        
        setAuthUser(userData);
      } catch (error) {
        console.error('❌ Erro ao carregar usuário:', error);
        // Se houver erro, deslogar e redirecionar
        try {
          await authService.signOut();
        } catch (logoutError) {
          console.error('Erro no logout:', logoutError);
        }
        if (nomePrefeitura) {
          navigate(`/${nomePrefeitura}/login`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate, nomePrefeitura]);

  const login = async (email: string, password: string) => {
    try {
      console.log('🚀 Iniciando login...', { email, nomePrefeitura });
      setLoading(true);
      
      const result = await authService.signIn({ email, password });
      console.log('🚀 Resultado do login:', result);
      
      if (result) {
        setAuthUser(result);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${result.profile.nome}`,
        });
        navigate(`/${nomePrefeitura}/dashboard`);
        return true;
      } else {
        toast({
          title: "Erro no login",
          description: "Credenciais inválidas",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setAuthUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate(`/${nomePrefeitura}/login`);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateProfile = async (updates: any) => {
    console.log('📝 Atualizando perfil:', updates);
    return true;
  };

  const isAuthenticated = !!authUser;

  return {
    user: authUser?.user || null,
    profile: authUser?.profile || null,
    prefeitura: authUser?.prefeitura || null,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile
  };
};
