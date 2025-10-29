import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Building, ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";
import { supabase } from "@/integrations/supabase/client";
// import { useAuthState } from "@/hooks/useAuthCustom";
import { useToast } from "@/hooks/use-toast";

interface Proponente {
  id: string;
  nome: string;
  tipo: 'PF' | 'PJ';
  cpf: string | null;
  cnpj: string | null;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  status: string;
  created_at: string;
}

export const SelecionarProponente = () => {
  const [proponentes, setProponentes] = useState<Proponente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  
  const navigate = useNavigate();
  // const { getUrl } = usePrefeituraUrl();
  // const { user } = useAuthState();
  const getUrl = (path: string) => path; // Mock function
  const user = { id: "test-user" }; // Mock user
  const { toast } = useToast();

  // Buscar proponentes do usuário
  const buscarProponentes = async () => {
    if (!user) {
      setError("Usuário não encontrado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Buscando proponentes para usuário:', user);

      // Buscar usuário proponente
      const { data: usuarioProponente, error: usuarioError } = await supabase
        .from('usuarios_proponentes')
        .select('id')
        .eq('id', user.id)
        .single();

      if (usuarioError) {
        console.error('Erro ao buscar usuário proponente:', usuarioError);
        throw new Error('Usuário proponente não encontrado');
      }

      console.log('Usuário proponente encontrado:', usuarioProponente);

      // Buscar proponentes vinculados ao usuário
      const { data: proponentesData, error: proponentesError } = await supabase
        .from('proponentes')
        .select(`
          id,
          nome,
          tipo,
          cpf,
          cnpj,
          email,
          telefone,
          endereco,
          cidade,
          estado,
          status,
          created_at
        `)
        .eq('usuario_id', usuarioProponente.id)
        .order('created_at', { ascending: false });

      if (proponentesError) {
        console.error('Erro ao buscar proponentes:', proponentesError);
        throw proponentesError;
      }

      console.log('Proponentes encontrados:', proponentesData);
      
      if (!proponentesData || proponentesData.length === 0) {
        console.log('Nenhum proponente encontrado para o usuário');
        setProponentes([]);
      } else {
        setProponentes(proponentesData);
      }
    } catch (err: any) {
      console.error('Erro ao buscar proponentes:', err);
      setError(err.message || 'Erro ao carregar proponentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      buscarProponentes();
    } else {
      setLoading(false);
      setError("Usuário não autenticado. Faça login para continuar.");
    }
  }, [user]);

  const handleSelecionarProponente = (proponente: Proponente) => {
    // Navegar para nova proposta com o proponente selecionado
    const urlParams = new URLSearchParams(window.location.search);
    const editalId = urlParams.get('edital');
    
    const novaPropostaUrl = getUrl(`nova-proposta?edital=${editalId}&proponente=${proponente.id}`);
    navigate(novaPropostaUrl);
  };

  const handleCriarProponente = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const editalId = urlParams.get('edital');
    
    navigate(getUrl(`cadastro-proponente?edital=${editalId}&redirect=nova-proposta`));
  };

  // Filtrar proponentes
  const proponentesFiltrados = proponentes.filter(proponente => {
    const cpfCnpj = proponente.tipo === 'PF' ? proponente.cpf : proponente.cnpj;
    const matchesSearch = proponente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cpfCnpj && cpfCnpj.includes(searchTerm)) ||
                         proponente.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === "todos" || proponente.tipo === tipoFilter;
    
    return matchesSearch && matchesTipo;
  });

  const getTipoLabel = (tipo: string) => {
    return tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-prefeitura-primary"></div>
            <span>Carregando proponentes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-prefeitura-primary">
            Selecionar Proponente
          </h1>
          <p className="text-prefeitura-muted">
            Escolha o proponente para o qual deseja criar o projeto
          </p>
        </div>
        <Button onClick={handleCriarProponente} className="bg-prefeitura-primary hover:bg-prefeitura-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Proponente
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, CPF/CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-48">
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Proponentes */}
      {proponentesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {proponentes.length === 0 ? "Nenhum proponente encontrado" : "Nenhum proponente corresponde aos filtros"}
            </h3>
            <p className="text-gray-500 mb-4 text-center">
              {proponentes.length === 0 
                ? "Você ainda não possui proponentes cadastrados. Crie um novo proponente para começar."
                : "Tente ajustar os filtros para encontrar seus proponentes."
              }
            </p>
            <Button onClick={handleCriarProponente}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Proponente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {proponentesFiltrados.map((proponente) => (
            <Card 
              key={proponente.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSelecionarProponente(proponente)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-prefeitura-primary/10">
                      {proponente.tipo === 'PF' ? (
                        <User className="h-6 w-6 text-prefeitura-primary" />
                      ) : (
                        <Building className="h-6 w-6 text-prefeitura-primary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{proponente.nome}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{getTipoLabel(proponente.tipo)}</span>
                        <span>•</span>
                        <span>{proponente.tipo === 'PF' ? proponente.cpf : proponente.cnpj}</span>
                        <span>•</span>
                        <span>{proponente.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{proponente.cidade}, {proponente.estado}</span>
                        <span>•</span>
                        <span>{proponente.telefone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(proponente.status)}>
                      {proponente.status === 'ativo' ? 'Ativo' : 
                       proponente.status === 'inativo' ? 'Inativo' : 
                       proponente.status === 'pendente' ? 'Pendente' : proponente.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Selecionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Informações adicionais */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">Sobre os Proponentes</h4>
              <p className="text-sm text-blue-700">
                Cada usuário pode ter múltiplos proponentes (pessoas físicas ou jurídicas) vinculados. 
                Selecione o proponente correto para o projeto que deseja criar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
