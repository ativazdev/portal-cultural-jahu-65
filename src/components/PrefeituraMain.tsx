import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle, 
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  Plus,
  BarChart3,
  Download,
  Settings,
  MessageSquare,
  Send
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DetalhesProjetoModal } from "@/components/projetos-admin/DetalhesProjetoModal";
import { AtribuirPareceristaModal } from "@/components/projetos-admin/AtribuirPareceristaModal";
import { useToast } from "@/hooks/use-toast";

// Dados para os gráficos
const categoriaData = [
  { name: 'Música', value: 35, color: '#3B82F6' },
  { name: 'Teatro', value: 25, color: '#10B981' },
  { name: 'Artes Visuais', value: 20, color: '#F59E0B' },
  { name: 'Dança', value: 12, color: '#EF4444' },
  { name: 'Literatura', value: 8, color: '#8B5CF6' },
];

const statusData = [
  { name: 'Submetidos', value: 156 },
  { name: 'Em Avaliação', value: 45 },
  { name: 'Aprovados', value: 89 },
  { name: 'Rejeitados', value: 22 },
  { name: 'Em Execução', value: 67 },
  { name: 'Finalizados', value: 34 },
];

// Dados para as tabelas
const projetosRecentes = [
  { 
    id: "1", 
    nome: "Festival de Música Popular", 
    proponente: "João Silva", 
    data: "15/11/2024", 
    status: "avaliacao",
    categoria: "Música",
    tipoProponente: "PF" as const,
    valorSolicitado: 15000,
    dataSubmissao: "2024-11-15",
    descricao: "Festival de música popular com artistas locais"
  },
  { 
    id: "2", 
    nome: "Teatro na Praça", 
    proponente: "Maria Santos", 
    data: "14/11/2024", 
    status: "aguardando",
    categoria: "Teatro",
    tipoProponente: "PF" as const,
    valorSolicitado: 8500,
    dataSubmissao: "2024-11-14",
    descricao: "Apresentações teatrais em praças públicas"
  },
  { 
    id: "3", 
    nome: "Oficina de Dança", 
    proponente: "Pedro Costa", 
    data: "13/11/2024", 
    status: "aprovado",
    categoria: "Dança",
    tipoProponente: "PF" as const,
    valorSolicitado: 12000,
    dataSubmissao: "2024-11-13",
    descricao: "Oficinas de dança para jovens da comunidade"
  },
  { 
    id: "4", 
    nome: "Arte Urbana", 
    proponente: "Ana Oliveira", 
    data: "12/11/2024", 
    status: "execucao",
    categoria: "Artes Visuais",
    tipoProponente: "PJ" as const,
    valorSolicitado: 20000,
    dataSubmissao: "2024-11-12",
    descricao: "Projeto de arte urbana em muros da cidade"
  },
  { 
    id: "5", 
    nome: "Literatura na Escola", 
    proponente: "Carlos Mendes", 
    data: "11/11/2024", 
    status: "rejeitado",
    categoria: "Literatura",
    tipoProponente: "PF" as const,
    valorSolicitado: 5000,
    dataSubmissao: "2024-11-11",
    descricao: "Programa de incentivo à leitura nas escolas"
  },
];

// Dados dos pareceristas
const pareceristas = [
  { id: "1", nome: "Dr. Ana Costa", especialidade: "Música", projetosEmAnalise: 3 },
  { id: "2", nome: "Prof. João Santos", especialidade: "Teatro", projetosEmAnalise: 2 },
  { id: "3", nome: "Dra. Maria Silva", especialidade: "Artes Visuais", projetosEmAnalise: 4 },
  { id: "4", nome: "Prof. Pedro Lima", especialidade: "Dança", projetosEmAnalise: 1 },
];

const alertas = [
  { id: 1, tipo: "prestacao", mensagem: "Prestação de contas do projeto 'Arte Urbana' venceu há 5 dias", prioridade: "alta" },
  { id: 2, tipo: "avaliacao", mensagem: "15 projetos aguardando atribuição de parecerista", prioridade: "media" },
  { id: 3, tipo: "banking", mensagem: "Conta do proponente João Silva com movimentação suspeita", prioridade: "alta" },
  { id: 4, tipo: "prazo", mensagem: "3 avaliações atrasadas há mais de 10 dias", prioridade: "media" },
];

const getStatusBadge = (status: string) => {
  const statusMap = {
    avaliacao: { label: "Em Avaliação", variant: "secondary" as const },
    aguardando: { label: "Aguardando", variant: "outline" as const },
    aprovado: { label: "Aprovado", variant: "default" as const },
    execucao: { label: "Em Execução", variant: "secondary" as const },
    rejeitado: { label: "Rejeitado", variant: "destructive" as const },
  };
  
  const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPrioridadeColor = (prioridade: string) => {
  return prioridade === "alta" ? "text-red-600" : "text-orange-600";
};

export const PrefeituraMain = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados para modais
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalPareceristaAberto, setModalPareceristaAberto] = useState(false);
  const [modalComunicacaoAberto, setModalComunicacaoAberto] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<any>(null);
  const [alertaSelecionado, setAlertaSelecionado] = useState<any>(null);
  const [mensagemComunicacao, setMensagemComunicacao] = useState("");

  // Funções para ações dos projetos
  const handleVerDetalhes = (projeto: any) => {
    setProjetoSelecionado(projeto);
    setModalDetalhesAberto(true);
  };

  const handleAtribuirParecerista = (projeto: any) => {
    setProjetoSelecionado(projeto);
    setModalPareceristaAberto(true);
  };

  const handleConfirmarAtribuicao = (projetoId: string, pareceristaId: string) => {
    toast({
      title: "Parecerista atribuído!",
      description: "O projeto foi atribuído ao parecerista com sucesso.",
    });
    setModalPareceristaAberto(false);
  };

  // Funções para alertas e comunicações
  const handleResolverAlerta = (alerta: any) => {
    if (alerta.tipo === "avaliacao") {
      navigate("/projetos-admin");
    } else if (alerta.tipo === "prestacao") {
      navigate("/prestacoes-admin");
    } else if (alerta.tipo === "banking") {
      navigate("/openbanking-admin");
    } else {
      setAlertaSelecionado(alerta);
      setModalComunicacaoAberto(true);
    }
  };

  const handleEnviarComunicacao = () => {
    toast({
      title: "Comunicação enviada!",
      description: "A mensagem foi enviada com sucesso.",
    });
    setModalComunicacaoAberto(false);
    setMensagemComunicacao("");
  };

  // Funções para ações rápidas
  const handleNovoEdital = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A criação de novos editais estará disponível em breve.",
    });
  };

  const handleRelatorioExecutivo = () => {
    navigate("/relatorios-admin");
  };

  const handleExportarDados = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para download.",
    });
  };

  const handleAtribuirPareceristas = () => {
    navigate("/projetos-admin");
  };

  const handleConfiguracoes = () => {
    toast({
      title: "Configurações",
      description: "Painel de configurações em desenvolvimento.",
    });
  };
  return (
    <main className="flex-1 p-6 space-y-8">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Submetidos</CardTitle>
            <FileText className="h-4 w-4 text-prefeitura-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-prefeitura-primary">156</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12 este mês
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Avaliação</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">23</div>
            <p className="text-xs text-orange-600">Ação necessária</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89</div>
            <p className="text-xs text-green-600">59% taxa de aprovação</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
            <DollarSign className="h-4 w-4 text-prefeitura-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-prefeitura-primary">R$ 2.450.000</div>
            <p className="text-xs text-prefeitura-primary">78% do orçamento</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prestações Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">15</div>
            <p className="text-xs text-red-600">3 com prazo vencido</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiários</CardTitle>
            <Users className="h-4 w-4 text-prefeitura-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-prefeitura-primary">15.230</div>
            <p className="text-xs text-prefeitura-primary">Meta: 20.000</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Categoria Cultural</CardTitle>
            <CardDescription>Distribuição dos projetos por área cultural</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projetos por Status</CardTitle>
            <CardDescription>Situação atual dos projetos na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--prefeitura-primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>Últimos 10 projetos submetidos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Proponente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projetosRecentes.map((projeto) => (
                  <TableRow key={projeto.id}>
                    <TableCell className="font-medium">{projeto.nome}</TableCell>
                    <TableCell>{projeto.proponente}</TableCell>
                    <TableCell>{projeto.data}</TableCell>
                    <TableCell>{getStatusBadge(projeto.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleVerDetalhes(projeto)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleAtribuirParecerista(projeto)}
                          title="Atribuir parecerista"
                          disabled={projeto.status === "aprovado" || projeto.status === "rejeitado"}
                        >
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas e Notificações</CardTitle>
            <CardDescription>Itens que requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div key={alerta.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${getPrioridadeColor(alerta.prioridade)}`}>
                      {alerta.mensagem}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {alerta.tipo}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleResolverAlerta(alerta)}
                  >
                    Resolver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas 
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Principais funções administrativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-prefeitura-primary hover:bg-prefeitura-primary/90"
              onClick={handleNovoEdital}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Edital
            </Button>
            <Button 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={handleRelatorioExecutivo}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatório Executivo
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportarDados}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
            <Button 
              variant="outline" 
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
              onClick={handleAtribuirPareceristas}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Atribuir Pareceristas
            </Button>
            <Button 
              variant="outline"
              onClick={handleConfiguracoes}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <DetalhesProjetoModal
        aberto={modalDetalhesAberto}
        projeto={projetoSelecionado}
        onFechar={() => setModalDetalhesAberto(false)}
      />

      <AtribuirPareceristaModal
        aberto={modalPareceristaAberto}
        projeto={projetoSelecionado}
        pareceristas={pareceristas}
        onFechar={() => setModalPareceristaAberto(false)}
        onConfirmar={handleConfirmarAtribuicao}
      />

      {/* Modal de Comunicação */}
      <Dialog open={modalComunicacaoAberto} onOpenChange={setModalComunicacaoAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Comunicação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Sobre: {alertaSelecionado?.mensagem}
              </p>
            </div>
            <Textarea
              placeholder="Digite sua mensagem..."
              value={mensagemComunicacao}
              onChange={(e) => setMensagemComunicacao(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setModalComunicacaoAberto(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleEnviarComunicacao}
                disabled={!mensagemComunicacao.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};