import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pareceristaAuthService, PareceristaAuthUser } from '@/services/pareceristaAuthService';
import { useToast } from '@/hooks/use-toast';

export const usePareceristaAuth = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [authUser, setAuthUser] = useState<PareceristaAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParecerista = async () => {
      try {
        console.log('🔄 Carregando parecerista atual...');
        
        // Verificar se estamos em uma página de autenticação
        const path = window.location.pathname;
        const isAuthPage = path.includes('/parecerista/login') || 
                          path.includes('/parecerista/solicitar-redefinicao-senha') || 
                          path.includes('/parecerista/redefinicao-senha');
        
        // Se estiver em uma página de autenticação, não verificar login
        if (isAuthPage) {
          console.log('🔄 Página de autenticação detectada, pulando verificação');
          setLoading(false);
          return;
        }
        
        const userData = await pareceristaAuthService.getCurrentParecerista();
        console.log('🔄 Parecerista carregado:', userData);
        
        // Verificar se o parecerista tem dados válidos
        if (!userData || !userData.parecerista) {
          console.log('⚠️ Parecerista sem dados válidos, fazendo logout...');
          await pareceristaAuthService.signOut();
          if (nomePrefeitura) {
            navigate(`/${nomePrefeitura}/parecerista/login`);
          }
          return;
        }
        
        setAuthUser(userData);
      } catch (error) {
        console.error('❌ Erro ao carregar parecerista:', error);
        // Se houver erro, deslogar e redirecionar
        try {
          await pareceristaAuthService.signOut();
        } catch (logoutError) {
          console.error('Erro no logout:', logoutError);
        }
        if (nomePrefeitura) {
          navigate(`/${nomePrefeitura}/parecerista/login`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadParecerista();
  }, [navigate, nomePrefeitura]);

  const login = async (email: string, password: string) => {
    try {
      console.log('🚀 Iniciando login do parecerista...', { email, nomePrefeitura });
      setLoading(true);
      
      const result = await pareceristaAuthService.signIn({ email, password });
      console.log('🚀 Resultado do login:', result);
      
      if (result) {
        setAuthUser(result);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${result.parecerista.nome}`,
        });
        
        // Redirecionar para selecionar edital
        navigate(`/${nomePrefeitura}/parecerista/selecionar-edital`);
        return true;
      } else {
        toast({
          title: "Erro no login",
          description: "Credenciais inválidas",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await pareceristaAuthService.signOut();
      setAuthUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate(`/${nomePrefeitura}/parecerista/login`);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const solicitarRedefinicaoSenha = async (email: string) => {
    try {
      await pareceristaAuthService.solicitarRedefinicaoSenha(email);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao solicitar redefinição:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao solicitar redefinição de senha",
        variant: "destructive",
      });
      return false;
    }
  };

  const redefinirSenha = async (token: string, newPassword: string) => {
    try {
      await pareceristaAuthService.redefinirSenha(token, newPassword);
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi redefinida com sucesso!",
      });
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao redefinir senha:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao redefinir senha",
        variant: "destructive",
      });
      return false;
    }
  };

  const isAuthenticated = !!authUser;

  return {
    parecerista: authUser?.parecerista || null,
    prefeitura: authUser?.prefeitura || null,
    loading,
    isAuthenticated,
    login,
    logout,
    solicitarRedefinicaoSenha,
    redefinirSenha
  };
};

