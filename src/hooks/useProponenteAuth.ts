import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { proponenteAuthService, ProponenteAuthUser } from '@/services/proponenteAuthService';
import { useToast } from '@/hooks/use-toast';

export const useProponenteAuth = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [authUser, setAuthUser] = useState<ProponenteAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProponente = async () => {
      try {
        console.log('🔄 Carregando proponente atual...');
        
        // Verificar se estamos em uma página de autenticação
        const path = window.location.pathname;
        const isAuthPage = path.includes('/login') || 
                          path.includes('/cadastro') || 
                          path.includes('/solicitar-redefinicao-senha') || 
                          path.includes('/redefinicao-senha');
        
        // Se estiver em uma página de autenticação, limpar dados antigos e não verificar login
        if (isAuthPage) {
          console.log('🔄 Página de autenticação detectada, limpando dados antigos');
          // Limpar dados de autenticação antigos para evitar usar IDs incorretos
          localStorage.removeItem('proponente_auth');
          localStorage.removeItem('proponente_token');
          setAuthUser(null);
          setLoading(false);
          return;
        }
        
        const userData = await proponenteAuthService.getCurrentProponente();
        console.log('🔄 Proponente carregado:', userData);
        
        // Verificar se o proponente tem dados válidos
        if (!userData || !userData.proponente) {
          console.log('⚠️ Proponente sem dados válidos, fazendo logout...');
          await proponenteAuthService.signOut();
          if (nomePrefeitura) {
            navigate(`/${nomePrefeitura}/proponente/login`);
          }
          return;
        }
        
        setAuthUser(userData);
      } catch (error) {
        console.error('❌ Erro ao carregar proponente:', error);
        // Se houver erro, deslogar e redirecionar
        try {
          await proponenteAuthService.signOut();
        } catch (logoutError) {
          console.error('Erro no logout:', logoutError);
        }
        if (nomePrefeitura) {
          navigate(`/${nomePrefeitura}/proponente/login`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProponente();
  }, [navigate, nomePrefeitura]);

  const login = async (email: string, password: string) => {
    try {
      console.log('🚀 Iniciando login do proponente...', { email, nomePrefeitura });
      setLoading(true);
      
      const result = await proponenteAuthService.signIn({ email, password });
      console.log('🚀 Resultado do login:', result);
      
      if (result) {
        setAuthUser(result);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${result.proponente.nome}`,
        });
        navigate(`/${nomePrefeitura}/proponente/editais`);
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
      await proponenteAuthService.signOut();
      setAuthUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate(`/${nomePrefeitura}/proponente/login`);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const signUp = async (data: {
    email: string;
    nome: string;
    password: string;
    prefeitura_id: string;
  }) => {
    try {
      console.log('📝 Iniciando cadastro do proponente...');
      setLoading(true);
      
      const result = await proponenteAuthService.signUp(data);
      
      // O serviço retorna null após o cadastro, então vamos redirecionar para o login
      if (result === null) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Redirecionando para o login...",
        });
        // Pequeno delay para o usuário ver a mensagem
        setTimeout(() => {
          navigate(`/${nomePrefeitura}/proponente/login`);
        }, 1000);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const solicitarRedefinicaoSenha = async (email: string) => {
    try {
      await proponenteAuthService.solicitarRedefinicaoSenha(email);
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
      await proponenteAuthService.redefinirSenha(token, newPassword);
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
    proponente: authUser?.proponente || null,
    prefeitura: authUser?.prefeitura || null,
    loading,
    isAuthenticated,
    login,
    logout,
    signUp,
    solicitarRedefinicaoSenha,
    redefinirSenha
  };
};

