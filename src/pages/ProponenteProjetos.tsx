import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Eye,
  FolderOpen,
  AlertCircle,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";

export const ProponenteProjetos = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proponente } = useProponenteAuth();
  
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjetos, setFilteredProjetos] = useState<any[]>([]);

  useEffect(() => {
    if (proponente?.id) {
      carregarProjetos();
    }
  }, [nomePrefeitura, proponente]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = projetos.filter(projeto => 
        projeto.nome.toLowerCase().includes(term) || 
        projeto.descricao?.toLowerCase().includes(term)
      );
      setFilteredProjetos(filtered);
    } else {
      setFilteredProjetos(projetos);
    }
  }, [searchTerm, projetos]);

  const carregarProjetos = async () => {
    if (!proponente?.id) {
      return;
    }
    
    try {
      setLoading(true);

      // Buscar os proponentes vinculados ao usuário
      const { data: proponentes, error: proponentesError } = await supabase
        .from('proponentes')
        .select('id')
        .eq('usuario_id', proponente.id);
      
      if (proponentesError || !proponentes || proponentes.length === 0) {
        setProjetos([]);
        setFilteredProjetos([]);
        return;
      }
      
      const proponenteIds = proponentes.map(p => p.id);
      
      // Buscar projetos dos proponentes
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .in('proponente_id', proponenteIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjetos(data || []);
      setFilteredProjetos(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      rascunho: { label: 'Rascunho', color: 'bg-yellow-500' },
      recebido: { label: 'Recebido', color: 'bg-blue-500' },
      em_avaliacao: { label: 'Em Avaliação', color: 'bg-orange-500' },
      avaliado: { label: 'Avaliado', color: 'bg-purple-500' },
      aprovado: { label: 'Aprovado', color: 'bg-green-500' },
      rejeitado: { label: 'Rejeitado', color: 'bg-red-500' },
      em_execucao: { label: 'Em Execução', color: 'bg-blue-600' },
      concluido: { label: 'Concluído', color: 'bg-gray-500' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <ProponenteLayout 
      title="Meus Projetos"
      description="Visualize e gerencie seus projetos inscritos"
    >
      <div className="space-y-6">
        {/* Busca */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Projetos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjetos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum projeto encontrado' : 'Você ainda não possui projetos inscritos'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredProjetos.map((projeto) => (
              <Card key={projeto.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(projeto.status)}
                      </div>
                      <h3 className="text-xl font-bold">{projeto.nome}</h3>
                      <p className="text-gray-600">{projeto.descricao}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Modalidade: {projeto.modalidade}</span>
                        {projeto.data_submissao && (
                          <span>Enviado em: {new Date(projeto.data_submissao).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/${nomePrefeitura}/proponente/projetos/${projeto.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
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

