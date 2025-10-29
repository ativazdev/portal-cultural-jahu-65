import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ListTemplate, 
  ModalTemplate,
  type ListColumn,
  type ListFilter,
  type ListAction,
  type StatusCard
} from "@/components/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  MessageSquare, 
  Reply,
  Building2,
  LogOut,
  User,
  Clock,
  CheckCircle,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrefeituraLayout } from "@/components/layout/PrefeituraLayout";
import { useDuvidas } from "@/hooks/useDuvidas";
import { usePrefeituraAuth } from "@/hooks/usePrefeituraAuth";

export const PrefeituraDuvidas = () => {
  const { nomePrefeitura } = useParams<{ nomePrefeitura: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { prefeitura } = usePrefeituraAuth();

  const {
    duvidas,
    loading,
    error,
    responderDuvida,
    refresh
  } = useDuvidas(prefeitura?.id || '');

  const [modalResposta, setModalResposta] = useState<{
    aberto: boolean;
    duvida: any | null;
  }>({ aberto: false, duvida: null });
  const [resposta, setResposta] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...duvidas];

    // Filtro por texto (pergunta e usuário)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.pergunta.toLowerCase().includes(term) || 
        (item.proponente?.nome && item.proponente.nome.toLowerCase().includes(term)) ||
        (item.parecerista?.nome && item.parecerista.nome.toLowerCase().includes(term))
      );
    }

    // Filtro por status
    if (activeFilters.status && activeFilters.status !== 'all') {
      filtered = filtered.filter(item => {
        if (activeFilters.status === 'aberta') return !item.fechada;
        if (activeFilters.status === 'fechada') return item.fechada;
        return true;
      });
    }

    // Filtro por tipo de usuário
    if (activeFilters.tipo_usuario && activeFilters.tipo_usuario !== 'all') {
      filtered = filtered.filter(item => {
        if (activeFilters.tipo_usuario === 'proponente') return item.proponente_id;
        if (activeFilters.tipo_usuario === 'parecerista') return item.parecerista_id;
        return true;
      });
    }

    setFilteredData(filtered);
  }, [duvidas, searchTerm, activeFilters]);

  // Funções de busca e filtro
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setActiveFilters(newFilters);
  };

  // Configuração das colunas
  const columns: ListColumn[] = [
    {
      key: 'pergunta',
      label: 'Pergunta',
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-900 truncate">{item.pergunta}</p>
          <p className="text-sm text-gray-500 mt-1">
            {item.proponente?.nome || item.parecerista?.nome || 'Usuário não identificado'}
          </p>
        </div>
      )
    },
    {
      key: 'categoria',
      label: 'Categoria',
      render: (item) => (
        <Badge variant="outline" className="text-xs">
          {item.categoria || 'Não especificada'}
        </Badge>
      )
    },
    {
      key: 'tipo_usuario',
      label: 'Tipo',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.proponente_id ? (
            <>
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600">Proponente</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Parecerista</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge className={item.fechada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
          {item.fechada ? 'Fechada' : 'Aberta'}
        </Badge>
      )
    },
    {
      key: 'data_criacao',
      label: 'Data',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </div>
      )
    }
  ];

  // Configuração dos filtros
  const filters: ListFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'aberta', label: 'Aberta' },
        { value: 'fechada', label: 'Fechada' }
      ]
    },
    {
      key: 'tipo_usuario',
      label: 'Tipo de Usuário',
      type: 'select',
      options: [
        { value: 'proponente', label: 'Proponente' },
        { value: 'parecerista', label: 'Parecerista' }
      ]
    }
  ];

  // Configuração das ações
  const actions: ListAction[] = [
    {
      key: 'responder',
      label: 'Responder',
      icon: <Reply className="h-4 w-4" />,
      variant: 'default',
      onClick: (item) => {
        if (!item.fechada) {
          setModalResposta({ aberto: true, duvida: item });
        }
      },
      show: (item) => !item.fechada
    },
    {
      key: 'ver_resposta',
      label: 'Ver Resposta',
      icon: <Eye className="h-4 w-4" />,
      variant: 'outline',
      onClick: (item) => {
        if (item.fechada) {
          setModalResposta({ aberto: true, duvida: item });
        }
      },
      show: (item) => item.fechada
    }
  ];

  // Cards de status
  const statusCards: StatusCard[] = [
    {
      title: 'Total de Dúvidas',
      value: duvidas.length.toString(),
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'blue'
    },
    {
      title: 'Dúvidas Abertas',
      value: duvidas.filter(d => !d.fechada).length.toString(),
      icon: <Clock className="h-4 w-4" />,
      color: 'yellow'
    },
    {
      title: 'Dúvidas Fechadas',
      value: duvidas.filter(d => d.fechada).length.toString(),
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'green'
    }
  ];

  const handleResponder = async () => {
    if (!resposta.trim() || !modalResposta.duvida) return;

    setIsSubmitting(true);
    try {
      const success = await responderDuvida(
        modalResposta.duvida.id,
        resposta,
        prefeitura?.id || ''
      );

      if (success) {
        toast({
          title: "Sucesso",
          description: "Dúvida respondida com sucesso!",
        });
        setModalResposta({ aberto: false, duvida: null });
        setResposta("");
      } else {
        toast({
          title: "Erro",
          description: "Erro ao responder dúvida. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao responder dúvida. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFecharModal = () => {
    setModalResposta({ aberto: false, duvida: null });
    setResposta("");
  };

  if (error) {
    return (
      <PrefeituraLayout 
        title="Dúvidas" 
        description="Gerencie as dúvidas dos usuários"
      >
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dúvidas: {error}</p>
            <Button onClick={refresh} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </PrefeituraLayout>
    );
  }

  return (
    <PrefeituraLayout 
      title="Dúvidas" 
      description="Gerencie as dúvidas dos usuários"
    >
      <div className="p-6">
        <ListTemplate
          data={filteredData}
          title="Gerenciar Dúvidas"
          subtitle="Responda às dúvidas de proponentes e pareceristas"
          columns={columns}
          filters={filters}
          actions={actions}
          statusCards={statusCards}
          searchable={true}
          selectable={false}
          sortable={true}
          loading={loading}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onSort={(column, direction) => console.log('Ordenação:', column, direction)}
          onRefresh={refresh}
        />

        {/* Modal de Resposta */}
        <ModalTemplate
          open={modalResposta.aberto}
          onClose={handleFecharModal}
          title={modalResposta.duvida?.fechada ? "Ver Resposta" : "Responder Dúvida"}
          description={
            modalResposta.duvida?.fechada 
              ? "Visualize a pergunta e a resposta da dúvida."
              : "Digite sua resposta para a dúvida do usuário."
          }
          size="lg"
          showDefaultActions={false}
        >
          {modalResposta.duvida && (
            <div className="space-y-6">
              {/* Pergunta */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Pergunta:</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{modalResposta.duvida.pergunta}</p>
                </div>
              </div>

              {/* Informações do usuário */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Usuário:</Label>
                  <p className="mt-1 text-sm text-gray-900">
                    {modalResposta.duvida.proponente?.nome || modalResposta.duvida.parecerista?.nome || 'Não identificado'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tipo:</Label>
                  <p className="mt-1 text-sm text-gray-900">
                    {modalResposta.duvida.proponente_id ? 'Proponente' : 'Parecerista'}
                  </p>
                </div>
              </div>

              {/* Resposta existente (se fechada) */}
              {modalResposta.duvida.fechada && modalResposta.duvida.resposta && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Resposta:</Label>
                  <div className="mt-2 p-4 bg-green-50 rounded-lg">
                    <p className="text-gray-900">{modalResposta.duvida.resposta}</p>
                  </div>
                </div>
              )}

              {/* Campo de resposta (se aberta) */}
              {!modalResposta.duvida.fechada && (
                <div>
                  <Label htmlFor="resposta" className="text-sm font-medium text-gray-700">
                    Sua Resposta:
                  </Label>
                  <Textarea
                    id="resposta"
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    rows={6}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleFecharModal}>
                  {modalResposta.duvida?.fechada ? 'Fechar' : 'Cancelar'}
                </Button>
                {!modalResposta.duvida?.fechada && (
                  <Button 
                    onClick={handleResponder}
                    disabled={!resposta.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Responder'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </ModalTemplate>
      </div>
    </PrefeituraLayout>
  );
};