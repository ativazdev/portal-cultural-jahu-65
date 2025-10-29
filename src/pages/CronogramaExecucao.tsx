import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Save, ArrowLeft, ArrowRight, Trash2, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCronograma, AtividadeCronograma } from "@/hooks/useCronograma";
import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";

const formSchema = z.object({
  atividades: z.array(z.object({
    atividade: z.string().min(1, "Nome da atividade é obrigatório"),
    etapa: z.string().min(1, "Etapa é obrigatória"),
    descricao: z.string().min(1, "Descrição é obrigatória"),
    dataInicio: z.string().min(1, "Data de início é obrigatória"),
    dataFim: z.string().min(1, "Data de fim é obrigatória")
  })).min(3, "Pelo menos 3 atividades são obrigatórias")
});

type FormData = z.infer<typeof formSchema>;
type Atividade = FormData['atividades'][0];

const etapasOptions = [
  "Pré-produção",
  "Produção", 
  "Pós-produção",
  "Divulgação"
];

export default function CronogramaExecucao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { getUrl } = usePrefeituraUrl();
  
  console.log('CronogramaExecucao carregado com parâmetros:', Object.fromEntries(searchParams.entries()));
  
  // Obter ID do projeto dos parâmetros
  const projetoId = searchParams.get('projeto_id');
  
  console.log('Projeto ID recebido:', projetoId);
  
  // Usar hook para gerenciar cronograma
  const { 
    atividades, 
    projetoData, 
    loading, 
    error, 
    salvarAtividades 
  } = useCronograma(projetoId || undefined);
  
  // Dados do projeto (do banco ou fallback)
  const nomeProjeto = projetoData?.nome || searchParams.get('projeto') || "Nome do Projeto";
  const proponenteNome = projetoData?.proponente_nome || searchParams.get('nome') || "Responsável";
  
  // Converter atividades do banco para formato do formulário
  const atividadesFormato = atividades.map(atividade => ({
    atividade: atividade.nome_atividade,
    etapa: atividade.etapa,
    descricao: atividade.descricao,
    dataInicio: atividade.data_inicio,
    dataFim: atividade.data_fim
  }));

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      atividades: atividades.length > 0 ? atividadesFormato : [
        {
          atividade: "",
          etapa: "",
          descricao: "",
          dataInicio: "",
          dataFim: ""
        }
      ]
    }
  });

  // Atualizar formulário quando atividades mudarem
  useEffect(() => {
    if (atividades.length > 0) {
      form.reset({
        atividades: atividadesFormato
      });
    }
  }, [atividades]);
  
  console.log('Formulário inicializado:', form.formState);

  const { fields: atividadesFields, append: appendAtividade, remove: removeAtividade } = useFieldArray({
    control: form.control,
    name: "atividades"
  });

  const watchAtividades = form.watch("atividades");

  // Calcular duração em dias
  const calcularDuracao = (dataInicio: string, dataFim: string) => {
    if (!dataInicio || !dataFim) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = fim.getTime() - inicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia inicial
    return diffDays > 0 ? diffDays : 0;
  };

  // Verificar se data fim é anterior à data início
  const isDataInvalida = (dataInicio: string, dataFim: string) => {
    if (!dataInicio || !dataFim) return false;
    return new Date(dataFim) < new Date(dataInicio);
  };

  // Calcular período total do projeto
  const calcularPeriodoTotal = () => {
    const atividades = watchAtividades.filter(a => a.dataInicio && a.dataFim);
    if (atividades.length === 0) return { inicio: null, fim: null, duracao: 0 };
    
    const datas = atividades.flatMap(a => [new Date(a.dataInicio), new Date(a.dataFim)]);
    const dataInicio = new Date(Math.min(...datas.map(d => d.getTime())));
    const dataFim = new Date(Math.max(...datas.map(d => d.getTime())));
    
    return {
      inicio: dataInicio,
      fim: dataFim,
      duracao: calcularDuracao(dataInicio.toISOString().split('T')[0], dataFim.toISOString().split('T')[0])
    };
  };

  // Verificar gaps entre atividades
  const verificarGaps = (atividades: Atividade[]) => {
    const atividadesOrdenadas = [...atividades]
      .filter(a => a.dataInicio && a.dataFim)
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
    
    const gaps = [];
    for (let i = 0; i < atividadesOrdenadas.length - 1; i++) {
      const fimAtual = new Date(atividadesOrdenadas[i].dataFim);
      const inicioProxima = new Date(atividadesOrdenadas[i + 1].dataInicio);
      const diffDays = (inicioProxima.getTime() - fimAtual.getTime()) / (1000 * 60 * 60 * 24) - 1;
      
      if (diffDays > 7) { // Gap maior que 7 dias
        gaps.push({ indice: i, dias: Math.round(diffDays) });
      }
    }
    return gaps;
  };

  // Ordenar atividades por data de início
  const atividadesOrdenadas = [...watchAtividades]
    .map((atividade, indice) => ({ ...atividade, indiceOriginal: indice }))
    .sort((a, b) => {
      if (!a.dataInicio || !b.dataInicio) return 0;
      return new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime();
    });

  const periodoTotal = calcularPeriodoTotal();
  const gaps = verificarGaps(watchAtividades);
  const atividadesValidas = watchAtividades.filter(a => 
    a.atividade && a.etapa && a.descricao && a.dataInicio && a.dataFim && !isDataInvalida(a.dataInicio, a.dataFim)
  ).length;

  const calculateProgress = () => {
    if (watchAtividades.length >= 3) {
      return (atividadesValidas / watchAtividades.length) * 100;
    }
    return (watchAtividades.length / 3) * 100;
  };

  const onSubmit = async (data: FormData) => {
    // Validar se todas as datas são válidas
    const datasInvalidas = data.atividades.some(a => isDataInvalida(a.dataInicio, a.dataFim));
    if (datasInvalidas) {
      toast({
        title: "Erro de validação",
        description: "Verifique as datas: a data de fim deve ser posterior à data de início.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Cronograma:", data);
    
    // Converter dados do formulário para formato do banco
    const atividadesParaSalvar: AtividadeCronograma[] = data.atividades.map(atividade => ({
      nome_atividade: atividade.atividade,
      etapa: atividade.etapa,
      descricao: atividade.descricao,
      data_inicio: atividade.dataInicio,
      data_fim: atividade.dataFim,
      ordem: 0 // Será definido pela ordem do array
    }));
    
    // Salvar no banco de dados
    const sucesso = await salvarAtividades(atividadesParaSalvar);
    
    if (sucesso) {
      // Navegar para próxima etapa
      const proponenteId = searchParams.get('proponente');
      const editalId = searchParams.get('edital');
      const planilhaUrl = getUrl(`planilha-orcamentaria?projeto_id=${projetoId}&projeto=${encodeURIComponent(nomeProjeto)}&nome=${encodeURIComponent(proponenteNome)}&proponente=${proponenteId}&edital=${editalId}`);
      
      setTimeout(() => {
        navigate(planilhaUrl);
      }, 1000);
    }
  };

  const salvarRascunho = async () => {
    const data = form.getValues();
    
    // Converter dados do formulário para formato do banco
    const atividadesParaSalvar: AtividadeCronograma[] = data.atividades.map(atividade => ({
      nome_atividade: atividade.atividade,
      etapa: atividade.etapa,
      descricao: atividade.descricao,
      data_inicio: atividade.dataInicio,
      data_fim: atividade.dataFim,
      ordem: 0
    }));
    
    // Salvar como rascunho (mesmo processo, mas sem validação rigorosa)
    const sucesso = await salvarAtividades(atividadesParaSalvar);
    
    if (sucesso) {
      toast({
        title: "Rascunho salvo!",
        description: "Seu progresso foi salvo automaticamente.",
      });
    }
  };

  const voltarEtapaAnterior = () => {
    const proponenteId = searchParams.get('proponente');
    const editalId = searchParams.get('edital');
    const novaPropostaUrl = getUrl(`nova-proposta?edital=${editalId}&proponente=${proponenteId}`);
    navigate(novaPropostaUrl);
  };

  const adicionarAtividade = () => {
    appendAtividade({
      atividade: "",
      etapa: "",
      descricao: "",
      dataInicio: "",
      dataFim: ""
    });
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cronograma de Execução</h1>
              <p className="text-muted-foreground mt-1">
                Defina as atividades e prazos em formato de planilha
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Etapa 2 de 3
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso do cronograma</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>

        {/* Dados do Projeto */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dados do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome do Projeto</label>
                <p className="text-lg font-medium">{nomeProjeto}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Responsável</label>
                <p className="text-lg font-medium">{proponenteNome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Tabela de Cronograma */}
            <Card>
              <CardHeader>
                <CardTitle>Cronograma de Atividades</CardTitle>
                <CardDescription>
                  Planeje suas atividades em formato de planilha para melhor visualização temporal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-medium w-12">#</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[200px]">Atividade</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[140px]">Etapa</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[250px]">Descrição</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[130px]">Data Início</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[130px]">Data Fim</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[100px]">Duração</th>
                        <th className="border border-border p-3 text-left font-medium w-20">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atividadesOrdenadas.map((atividade, indiceVisual) => {
                        const indiceReal = atividade.indiceOriginal;
                        const duracao = calcularDuracao(atividade.dataInicio, atividade.dataFim);
                        const dataInvalida = isDataInvalida(atividade.dataInicio, atividade.dataFim);
                        const isComplete = atividade.atividade && atividade.etapa && atividade.descricao && 
                                         atividade.dataInicio && atividade.dataFim && !dataInvalida;
                        
                        return (
                          <tr 
                            key={indiceReal}
                            className={`${indiceVisual % 2 === 0 ? 'bg-background' : 'bg-muted/20'} 
                                       ${dataInvalida ? 'bg-destructive/10' : ''} 
                                       ${isComplete ? 'bg-green-50/50' : ''}`}
                          >
                            <td className="border border-border p-3 text-center font-medium">
                              {indiceVisual + 1}
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`atividades.${indiceReal}.atividade`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="border-0 focus-visible:ring-1"
                                        placeholder="Nome da atividade"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`atividades.${indiceReal}.etapa`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="border-0 focus-visible:ring-1">
                                          <SelectValue placeholder="Etapa" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {etapasOptions.map((etapa) => (
                                          <SelectItem key={etapa} value={etapa}>
                                            {etapa}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`atividades.${indiceReal}.descricao`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="border-0 focus-visible:ring-1"
                                        placeholder="Descrição da atividade"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`atividades.${indiceReal}.dataInicio`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="date" 
                                        {...field} 
                                        className="border-0 focus-visible:ring-1"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`atividades.${indiceReal}.dataFim`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="date" 
                                        {...field} 
                                        className="border-0 focus-visible:ring-1"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-3 text-center">
                              <span className={`text-sm font-medium ${
                                dataInvalida ? 'text-destructive' : 'text-muted-foreground'
                              }`}>
                                {dataInvalida ? 'Inválida' : duracao > 0 ? `${duracao} dias` : '-'}
                              </span>
                            </td>
                            
                            <td className="border border-border p-3 text-center">
                              {atividadesFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAtividade(indiceReal)}
                                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={adicionarAtividade}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Linha
                  </Button>

                  {atividadesFields.length < 3 && (
                    <p className="text-sm text-amber-600">
                      Adicione pelo menos {3 - atividadesFields.length} atividade(s) para continuar
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo do Cronograma */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Resumo do Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total de atividades</label>
                    <p className="text-2xl font-bold text-primary">{watchAtividades.length}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Período total</label>
                    <p className="text-sm font-medium">
                      {periodoTotal.inicio && periodoTotal.fim 
                        ? `${formatarData(periodoTotal.inicio)} a ${formatarData(periodoTotal.fim)}`
                        : 'Não definido'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duração total</label>
                    <p className="text-2xl font-bold text-primary">{periodoTotal.duracao} dias</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2">
                      {atividadesValidas === watchAtividades.length && watchAtividades.length >= 3 ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Cronograma válido</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-600">Pendente</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {gaps.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Gaps identificados</span>
                    </div>
                    <p className="text-xs text-amber-600/80 mt-1">
                      Há intervalos maiores que 7 dias entre algumas atividades. Considere ajustar as datas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex flex-col md:flex-row gap-4 justify-between pt-6 border-t">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={voltarEtapaAnterior}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Etapa Anterior
                </Button>
                <Button type="button" variant="outline" onClick={salvarRascunho}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="md:w-auto"
                disabled={atividadesFields.length < 3 || atividadesValidas < atividadesFields.length}
              >
                Próxima Etapa
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}