import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { supabase, getAuthenticatedSupabaseClient } from "@/integrations/supabase/client";
import { useProponenteAuth } from "@/hooks/useProponenteAuth";
import { Loader2, FileText, Upload, AlertCircle, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ProponentePrestarContas = () => {
  const { nomePrefeitura, editalId } = useParams<{ nomePrefeitura: string; editalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proponente } = useProponenteAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edital, setEdital] = useState<any>(null);
  const [proponentes, setProponentes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    proponente_id: '',
    nome_projeto: '',
    relatorio_execucao: null as File | null,
    planilha_orcamentaria: null as File | null
  });

  useEffect(() => {
    if (proponente?.id && editalId) {
      carregarDados();
    }
  }, [proponente, editalId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
        const authClient = getAuthenticatedSupabaseClient('proponente');
        
        // Carregar Edital
        const { data: editalData, error: editalError } = await authClient
            .from('editais')
            .select('*')
            .eq('id', editalId)
            .single();
        if (editalError) throw editalError;
        setEdital(editalData);

        // Carregar Proponentes do Usuário
        const { data: proponentesData, error: propError } = await authClient
            .from('proponentes')
            .select('id, nome, razao_social, tipo')
            .eq('usuario_id', proponente.id)
            .eq('ativo', true);
        if (propError) throw propError;
        setProponentes(proponentesData || []);

    } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        toast({ title: "Erro", description: "Falha ao carregar dados iniciais.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = (field: 'relatorio_execucao' | 'planilha_orcamentaria', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({ title: "Erro", description: "Apenas arquivos PDF são permitidos.", variant: "destructive" });
        return;
      }
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proponente_id || !formData.nome_projeto || !formData.relatorio_execucao || !formData.planilha_orcamentaria) {
        toast({ title: "Atenção", description: "Preencha todos os campos e anexe os arquivos obrigatórios.", variant: "destructive" });
        return;
    }

    setSaving(true);
    try {
        // 1. Upload Arquivos
        const uploadFile = async (file: File, prefix: string) => {
            const fileName = `${prefix}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
            const { error } = await supabase.storage.from('prestacao_contas').upload(fileName, file);
            if (error) throw error;
            const { data } = supabase.storage.from('prestacao_contas').getPublicUrl(fileName);
            return data.publicUrl;
        };

        const relatorioUrl = await uploadFile(formData.relatorio_execucao, 'relatorio');
        const planilhaUrl = await uploadFile(formData.planilha_orcamentaria, 'planilha');

        const anexosPrestacao = [
            { titulo: "Relatório de Execução", url: relatorioUrl, tipo: 'pdf' },
            { titulo: "Planilha Orçamentária", url: planilhaUrl, tipo: 'pdf' }
        ];

        // 2. Criar registro na tabela Projetos (Simplificado para Prestação de Contas)
        const proponenteSelecionado = proponentes.find(p => p.id === formData.proponente_id);
        if (!proponenteSelecionado) throw new Error("Proponente inválido");

        // Buscar prefeitura_id do proponente (ou do edital)
        // Assume-se que o proponente já tem prefeitura_id associado ou pegamos do edital
        
        const projetoData = {
            edital_id: editalId,
            proponente_id: formData.proponente_id,
            prefeitura_id: edital.prefeitura_id,
            nome: formData.nome_projeto,
            descricao: 'Prestação de Contas Simplificada', // Valor padrão
            modalidade: edital.modalidades?.[0] || 'outros', // Usar modalidade do edital ou 'outros'
            objetivos: 'Prestação de Contas',
            status: 'aguardando_parecerista', // Status inicial padrão para projetos submetidos
            data_submissao: new Date().toISOString(),
            anexos_prestacao: anexosPrestacao, // Novo campo JSONB
            // Campos obrigatórios do banco preenchidos com defaults
            valor_solicitado: 0, 
            outras_fontes: false
        };

        const token = localStorage.getItem('proponente_token');
        if (!token) throw new Error('Token de autenticação não encontrado');

        const { data: response, error: functionError } = await supabase.functions.invoke('salvar-projeto', {
            body: {
                ...projetoData
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (functionError) throw functionError;
        if (!response || !response.success) {
            throw new Error(response?.error || 'Erro ao salvar projeto');
        }

        const novoProjeto = response.projeto;

        toast({ title: "Sucesso", description: "Prestação de Contas enviada com sucesso!" });
        navigate(`/${nomePrefeitura}/proponente/projetos/${novoProjeto.id}`);

    } catch (error: any) {
        console.error('Erro ao enviar prestação de contas:', error);
        toast({ title: "Erro", description: error.message || "Falha ao enviar prestação de contas.", variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
     return (
        <ProponenteLayout>
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        </ProponenteLayout>
     );
  }

  return (
    <ProponenteLayout title="Prestação de Contas" description={edital?.nome}>
        <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" className="pl-0 gap-2 mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Dados da Prestação de Contas</CardTitle>
                    <CardDescription>
                        Preencha as informações abaixo e anexe os comprovantes solicitados no edital.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                             {/* Seleção de Proponente */}
                             <div className="space-y-2">
                                <Label>Proponente Responsável <span className="text-red-500">*</span></Label>
                                <Select 
                                    value={formData.proponente_id} 
                                    onValueChange={(val) => setFormData(prev => ({...prev, proponente_id: val}))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o proponente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {proponentes.map(prop => (
                                            <SelectItem key={prop.id} value={prop.id}>
                                                {prop.nome || prop.razao_social}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             </div>

                             <div className="space-y-2">
                                <Label>Nome do Projeto/Objeto <span className="text-red-500">*</span></Label>
                                <Input 
                                    placeholder="Informe o nome do projeto realizado"
                                    value={formData.nome_projeto}
                                    onChange={e => setFormData(prev => ({...prev, nome_projeto: e.target.value}))}
                                />
                             </div>

                             <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <h4 className="flex items-center gap-2 font-medium text-yellow-800 mb-2">
                                    <AlertCircle className="w-4 h-4" /> Documentação Obrigatória
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Relatório de Execução do Objeto (PDF) <span className="text-red-500">*</span></Label>
                                        <Input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={(e) => handleFileUpload('relatorio_execucao', e)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Planilha Orçamentária Executada (PDF) <span className="text-red-500">*</span></Label>
                                        <Input 
                                            type="file" 
                                            accept=".pdf"
                                            onChange={(e) => handleFileUpload('planilha_orcamentaria', e)}
                                        />
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div className="flex justify-end pt-4">
                             <Button type="submit" size="lg" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                                Enviar Prestação de Contas
                             </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </ProponenteLayout>
  );
};
