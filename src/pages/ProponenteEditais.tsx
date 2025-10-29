import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Calendar,
  DollarSign,
  Search,
  Eye,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";

interface Edital {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  data_abertura: string;
  data_final_envio_projeto: string;
  valor_maximo: number;
  status: string;
  modalidades: string[];
  regulamento?: string;
}

export const ProponenteEditais = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proponente } = useProponenteAuth();
  
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEditais, setFilteredEditais] = useState<Edital[]>([]);

  useEffect(() => {
    if (proponente?.id) {
      carregarEditais();
    }
  }, [nomePrefeitura, proponente]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = editais.filter(edital => 
        edital.nome.toLowerCase().includes(term) || 
        edital.codigo.toLowerCase().includes(term) ||
        edital.descricao.toLowerCase().includes(term)
      );
      setFilteredEditais(filtered);
    } else {
      setFilteredEditais(editais);
    }
  }, [searchTerm, editais]);

  const carregarEditais = async () => {
    if (!proponente?.id) {
      return;
    }
    
    try {
      setLoading(true);

      // Buscar o ID da prefeitura do proponente
      const { data: proponenteData, error: proponenteError } = await supabase
        .from('usuarios_proponentes')
        .select('prefeitura_id')
        .eq('id', proponente.id)
        .single();
      
      if (proponenteError || !proponenteData) {
        console.error('❌ Erro ao buscar prefeitura do proponente:', proponenteError);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados da prefeitura",
          variant: "destructive",
        });
        return;
      }
      
      const prefeituraId = proponenteData.prefeitura_id;

      // Buscar editais ativos
      const { data, error } = await supabase
        .from('editais')
        .select('*')
        .eq('prefeitura_id', prefeituraId)
        .eq('status', 'ativo')
        .order('data_final_envio_projeto', { ascending: true });

      if (error) throw error;

      setEditais(data || []);
      setFilteredEditais(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar editais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar editais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', color: 'bg-green-500' },
      rascunho: { label: 'Rascunho', color: 'bg-yellow-500' },
      arquivado: { label: 'Arquivado', color: 'bg-gray-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const verificarSeInscreveu = async (editalId: string) => {
    if (!proponente) return false;
    
    try {
      // Primeiro, buscar os proponentes vinculados ao usuário
      const { data: proponentes, error: proponentesError } = await supabase
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);
      
      if (proponentesError || !proponentes || proponentes.length === 0) {
        return false;
      }
      
      const proponenteIds = proponentes.map(p => p.id);
      
      // Verificar se existe um projeto para algum dos proponentes do usuário
      const { data, error } = await supabase
        .from('projetos')
        .select('id')
        .in('proponente_id', proponenteIds)
        .eq('edital_id', editalId)
        .single();
      
      return !error && data !== null;
    } catch {
      return false;
    }
  };

  const handleInscrever = (editalId: string) => {
    navigate(`/${nomePrefeitura}/proponente/editais/${editalId}/cadastrar-projeto`);
  };

  const handleVerProjeto = async (editalId: string) => {
    if (!proponente) return;
    
    try {
      // Primeiro, buscar os proponentes vinculados ao usuário
      const { data: proponentes, error: proponentesError } = await supabase
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);
      
      if (proponentesError || !proponentes || proponentes.length === 0) {
        toast({
          title: "Aviso",
          description: "Você ainda não possui um projeto inscrito neste edital",
        });
        return;
      }
      
      const proponenteIds = proponentes.map(p => p.id);
      
      // Buscar o projeto para algum dos proponentes do usuário
      const { data, error } = await supabase
        .from('projetos')
        .select('id')
        .in('proponente_id', proponenteIds)
        .eq('edital_id', editalId)
        .single();
      
      if (error || !data) {
        toast({
          title: "Aviso",
          description: "Você ainda não possui um projeto inscrito neste edital",
        });
        return;
      }

      navigate(`/${nomePrefeitura}/proponente/projetos/${data.id}`);
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao buscar projeto",
        variant: "destructive",
      });
    }
  };

  return (
    <ProponenteLayout 
      title="Editais Abertos"
      description="Visualize editais abertos para inscrição e inscreva seus projetos"
    >
      <div className="space-y-6">
        {/* Busca */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Editais */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredEditais.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum edital encontrado' : 'Nenhum edital aberto no momento'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredEditais.map((edital) => (
              <Card key={edital.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {edital.codigo}
                        </Badge>
                        {getStatusBadge(edital.status)}
                      </div>
                      <CardTitle className="text-2xl">{edital.nome}</CardTitle>
                      <CardDescription className="text-base">
                        {edital.descricao}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Encerramento</p>
                        <p className="font-medium">{formatarData(edital.data_final_envio_projeto)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Valor Máximo</p>
                        <p className="font-medium">{formatarMoeda(edital.valor_maximo)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Modalidades</p>
                        <p className="font-medium">{edital.modalidades?.join(', ') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleVerProjeto(edital.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Meu Projeto
                    </Button>
                    <Button
                      onClick={() => handleInscrever(edital.id)}
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Inscrever Projeto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProponenteLayout>
  );
};

