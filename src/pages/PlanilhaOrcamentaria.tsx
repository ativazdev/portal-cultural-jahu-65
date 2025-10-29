import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Save, ArrowLeft, CheckCircle, Trash2, DollarSign, AlertTriangle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePrefeituraUrl } from "@/contexts/PrefeituraContext";
import { usePlanilhaOrcamentaria, ItemOrcamento } from "@/hooks/usePlanilhaOrcamentaria";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  itens: z.array(z.object({
    descricao: z.string().min(1, "Descrição é obrigatória"),
    justificativa: z.string().min(1, "Justificativa é obrigatória"),
    unidadeMedida: z.string().min(1, "Unidade de medida é obrigatória"),
    valorUnitario: z.number().min(0.01, "Valor unitário deve ser maior que zero"),
    quantidade: z.number().min(1, "Quantidade deve ser pelo menos 1"),
    referenciaPreco: z.string().optional()
  })).min(1, "Pelo menos 1 item é obrigatório"),
  recursosOutrasFontes: z.string().optional(),
  detalhamentoRecursos: z.string().optional()
}).refine((data) => {
  // Se outras fontes foram selecionadas (exceto "nao"), detalhamento é obrigatório
  if (data.recursosOutrasFontes && data.recursosOutrasFontes !== "nao") {
    return data.detalhamentoRecursos && data.detalhamentoRecursos.trim().length > 0;
  }
  return true;
}, {
  message: "Detalhamento é obrigatório quando outras fontes de recursos são informadas",
  path: ["detalhamentoRecursos"]
});

type FormData = z.infer<typeof formSchema>;
type Item = FormData['itens'][0];

const unidadesMedida = [
  "Serviço",
  "Hora", 
  "Diária",
  "Unidade",
  "Metro",
  "Quilograma",
  "Outro"
];

export default function PlanilhaOrcamentaria() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { getUrl } = usePrefeituraUrl();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Dados do projeto
  const projetoId = searchParams.get('projeto_id');
  const nomeProjeto = searchParams.get('projeto') || "Nome do Projeto";
  const proponenteNome = searchParams.get('nome') || "Responsável";
  
  // Hook para gerenciar dados da planilha
  const {
    itens: itensBanco,
    projetoData,
    loading: loadingDados,
    salvarItens,
    calcularValorTotal,
    calcularValorMaximo,
    calcularSaldoDisponivel
  } = usePlanilhaOrcamentaria(projetoId || undefined);
  
  // Converter itens do banco para formato do formulário
  const itensFormato = itensBanco.map(item => ({
    descricao: item.descricao,
    justificativa: item.justificativa,
    unidadeMedida: item.unidade_medida,
    valorUnitario: item.valor_unitario,
    quantidade: item.quantidade,
    referenciaPreco: item.referencia_preco || ""
  }));

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itens: itensFormato.length > 0 ? itensFormato : [
        {
          descricao: "",
          justificativa: "",
          unidadeMedida: "",
          valorUnitario: 0,
          quantidade: 1,
          referenciaPreco: ""
        }
      ],
      recursosOutrasFontes: "",
      detalhamentoRecursos: ""
    }
  });

  const { fields: itensFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "itens"
  });

  // Atualizar formulário quando dados do banco mudarem
  useEffect(() => {
    if (!loadingDados && itensFormato.length > 0) {
      form.reset({
        itens: itensFormato,
        recursosOutrasFontes: "",
        detalhamentoRecursos: ""
      });
    }
  }, [itensBanco, loadingDados, form]);

  // Carregar dados de recursos financeiros do projeto APENAS na primeira carga
  useEffect(() => {
    if (projetoData && !loadingDados) {
      console.log('Carregando dados de recursos financeiros:', {
        outras_fontes: projetoData.outras_fontes,
        detalhes_outras_fontes: projetoData.detalhes_outras_fontes,
        tipos_outras_fontes: projetoData.tipos_outras_fontes
      });
      
      // Carregar dados de recursos financeiros
      if (projetoData.outras_fontes !== null) {
        if (projetoData.outras_fontes === false) {
          form.setValue('recursosOutrasFontes', 'nao');
          console.log('Definindo recursosOutrasFontes como "nao"');
        } else if (projetoData.tipos_outras_fontes && projetoData.tipos_outras_fontes.length > 0) {
          form.setValue('recursosOutrasFontes', projetoData.tipos_outras_fontes[0]);
          console.log('Definindo recursosOutrasFontes como:', projetoData.tipos_outras_fontes[0]);
        }
      }
      
      if (projetoData.detalhes_outras_fontes) {
        form.setValue('detalhamentoRecursos', projetoData.detalhes_outras_fontes);
        console.log('Definindo detalhamentoRecursos como:', projetoData.detalhes_outras_fontes);
      }
    }
  }, [projetoData, loadingDados, form]);

  const watchItens = form.watch("itens");

  // Calcular valor total de um item
  const calcularValorTotalItem = (valorUnitario: number, quantidade: number) => {
    return (valorUnitario || 0) * (quantidade || 0);
  };

  // Calcular valor total geral
  const calcularValorTotalGeral = () => {
    return watchItens.reduce((total, item) => {
      return total + calcularValorTotalItem(item.valorUnitario || 0, item.quantidade || 0);
    }, 0);
  };

  // Usar valores do banco de dados
  const valorMaximoModalidade = calcularValorMaximo();
  const saldoDisponivel = calcularSaldoDisponivel();
  const percentualUtilizado = valorMaximoModalidade > 0 ? (calcularValorTotalGeral() / valorMaximoModalidade) * 100 : 0;

  // Verificar se está próximo do limite (90%)
  const isProximoLimite = () => {
    return percentualUtilizado >= 90 && percentualUtilizado < 100;
  };

  // Verificar se o orçamento está exato
  const isOrcamentoExato = () => {
    return Math.abs(calcularValorTotalGeral() - valorMaximoModalidade) < 0.01; // Tolerância para problemas de ponto flutuante
  };

  // Verificar se está abaixo do orçamento
  const isAbaixoOrcamento = () => {
    return calcularValorTotalGeral() < valorMaximoModalidade;
  };

  // Verificar se ultrapassou o limite
  const ultrapassouLimite = () => {
    return calcularValorTotalGeral() > valorMaximoModalidade;
  };

  // Verificar se item é válido
  const isItemValido = (item: Item) => {
    const isValid = item.descricao && 
           item.descricao.trim() !== "" &&
           item.justificativa && 
           item.justificativa.trim() !== "" &&
           item.unidadeMedida && 
           item.unidadeMedida.trim() !== "" &&
           (item.valorUnitario || 0) > 0 && 
           (item.quantidade || 0) > 0;
    
    console.log("Item válido:", item.descricao, isValid);
    return isValid;
  };

  // Formatar valor para exibição
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Filtrar apenas itens válidos (completos)
  const itensValidos = watchItens.filter(item => isItemValido(item)).length;
  
  // Condição: pelo menos 1 item válido E não ultrapassar o limite
  const podeHabilitar = itensValidos >= 1 && !ultrapassouLimite();
  
  console.log("Debug botão:", {
    itensValidos: itensValidos,
    valorTotal: calcularValorTotalGeral(),
    valorOrcamento: valorMaximoModalidade,
    ultrapassouLimite: ultrapassouLimite(),
    podeHabilitar: podeHabilitar
  });

  const onSubmit = async (data: FormData) => {
    if (ultrapassouLimite()) {
      toast({
        title: "Erro de validação",
        description: `O valor total (${formatarValor(calcularValorTotalGeral())}) ultrapassa o valor do orçamento.`,
        variant: "destructive"
      });
      return;
    }
    
    // Removido: validação que forçava valor exato
    // Agora permite valores menores que o limite máximo
    
    // Salvar itens no banco de dados
    const itensParaSalvar: ItemOrcamento[] = data.itens
      .filter(item => isItemValido(item))
      .map((item, index) => ({
        descricao: item.descricao,
        justificativa: item.justificativa,
        unidade_medida: item.unidadeMedida,
        valor_unitario: item.valorUnitario,
        quantidade: item.quantidade,
        referencia_preco: item.referenciaPreco || undefined,
        ordem: index
      }));

    // Salvar dados de recursos financeiros no projeto PRIMEIRO
    if (projetoId) {
      try {
        // Forçar valores padrão se estiverem vazios
        const recursosOutrasFontes = data.recursosOutrasFontes || "nao";
        const detalhamentoRecursos = data.detalhamentoRecursos || null;
        
        console.log('Salvando recursos financeiros (onSubmit):', {
          projetoId,
          recursosOutrasFontes,
          detalhamentoRecursos
        });

        const { error } = await supabase
          .from('projetos')
          .update({
            outras_fontes: recursosOutrasFontes !== "nao",
            detalhes_outras_fontes: detalhamentoRecursos,
            tipos_outras_fontes: recursosOutrasFontes !== "nao" ? [recursosOutrasFontes] : null
          })
          .eq('id', projetoId);

        if (error) {
          console.error('Erro ao salvar recursos financeiros:', error);
          toast({
            title: "Erro",
            description: "Erro ao salvar dados de recursos financeiros.",
            variant: "destructive",
          });
          return; // Não continuar se houve erro
        } else {
          console.log('Recursos financeiros salvos com sucesso (onSubmit)!');
        }
      } catch (err) {
        console.error('Erro ao salvar recursos financeiros:', err);
        toast({
          title: "Erro",
          description: "Erro ao salvar dados de recursos financeiros.",
          variant: "destructive",
        });
        return; // Não continuar se houve erro
      }
    }
    
    // Salvar itens de orçamento DEPOIS
    const salvou = await salvarItens(itensParaSalvar);
    
    if (salvou) {
      setShowConfirmDialog(true);
    }
  };



  const voltarEtapaAnterior = () => {
    const projetoId = searchParams.get('projeto_id');
    const proponenteId = searchParams.get('proponente');
    const editalId = searchParams.get('edital');
    const cronogramaUrl = getUrl(`cronograma-execucao?projeto_id=${projetoId}&projeto=${encodeURIComponent(nomeProjeto)}&nome=${encodeURIComponent(proponenteNome)}&proponente=${proponenteId}&edital=${editalId}`);
    navigate(cronogramaUrl);
  };

  const salvarRascunho = async () => {
    const data = form.getValues();
    
    console.log('Dados do formulário:', {
      recursosOutrasFontes: data.recursosOutrasFontes,
      detalhamentoRecursos: data.detalhamentoRecursos
    });
    
    // Salvar itens no banco de dados
    const itensParaSalvar: ItemOrcamento[] = data.itens
      .filter(item => item.descricao && item.descricao.trim() !== "")
      .map((item, index) => ({
        descricao: item.descricao,
        justificativa: item.justificativa,
        unidade_medida: item.unidadeMedida,
        valor_unitario: item.valorUnitario || 0,
        quantidade: item.quantidade || 1,
        referencia_preco: item.referenciaPreco || undefined,
        ordem: index
      }));

    // Salvar dados de recursos financeiros no projeto PRIMEIRO
    if (projetoId) {
      try {
        // Forçar valores padrão se estiverem vazios
        const recursosOutrasFontes = data.recursosOutrasFontes || "nao";
        const detalhamentoRecursos = data.detalhamentoRecursos || null;
        
        console.log('Salvando recursos financeiros:', {
          projetoId,
          recursosOutrasFontes,
          detalhamentoRecursos,
          outras_fontes: recursosOutrasFontes !== "nao",
          detalhes_outras_fontes: detalhamentoRecursos,
          tipos_outras_fontes: recursosOutrasFontes !== "nao" ? [recursosOutrasFontes] : null
        });

        const { error } = await supabase
          .from('projetos')
          .update({
            outras_fontes: recursosOutrasFontes !== "nao",
            detalhes_outras_fontes: detalhamentoRecursos,
            tipos_outras_fontes: recursosOutrasFontes !== "nao" ? [recursosOutrasFontes] : null
          })
          .eq('id', projetoId);

        if (error) {
          console.error('Erro ao salvar recursos financeiros:', error);
          toast({
            title: "Aviso",
            description: "Itens salvos, mas houve erro ao salvar dados de recursos financeiros.",
            variant: "destructive",
          });
          return; // Não continuar se houve erro
        } else {
          console.log('Recursos financeiros salvos com sucesso!');
        }
      } catch (err) {
        console.error('Erro ao salvar recursos financeiros:', err);
        toast({
          title: "Aviso",
          description: "Itens salvos, mas houve erro ao salvar dados de recursos financeiros.",
          variant: "destructive",
        });
        return; // Não continuar se houve erro
      }
    }

    // Salvar itens de orçamento DEPOIS
    await salvarItens(itensParaSalvar);

    // Mostrar toast de sucesso apenas se tudo foi salvo
    toast({
      title: "Sucesso",
      description: "Dados salvos com sucesso!",
    });
  };


  const finalizarProposta = async () => {
    console.log('Iniciando finalização da proposta...', { projetoId });
    setShowConfirmDialog(false);
    
    if (!projetoId) {
      toast({
        title: "Erro",
        description: "ID do projeto não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Atualizando projeto no banco...', {
        projetoId,
        status: 'em_avaliacao',
        valor_solicitado: calcularValorTotalGeral()
      });

      const { data, error } = await supabase
        .from('projetos')
        .update({ 
          status: 'em_avaliacao',
          valor_solicitado: calcularValorTotalGeral(),
          data_submissao: new Date().toISOString()
        })
        .eq('id', projetoId)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Projeto atualizado com sucesso:', data);

      toast({
        title: "Proposta finalizada!",
        description: "Sua proposta foi enviada com sucesso. Aguarde a análise.",
      });
      
      // Navegar para dashboard do proponente
      setTimeout(() => {
        navigate(getUrl('dashboard'));
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao finalizar proposta:', err);
      toast({
        title: "Erro ao finalizar",
        description: err.message || "Não foi possível finalizar a proposta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const adicionarItem = () => {
    appendItem({
      descricao: "",
      justificativa: "",
      unidadeMedida: "",
      valorUnitario: 0,
      quantidade: 1,
      referenciaPreco: ""
    });
  };

  // Estado de loading
  if (loadingDados) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados da planilha...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Planilha Orçamentária</h1>
              <p className="text-muted-foreground mt-1">
                Defina os custos e investimentos em formato de planilha
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Etapa 3 de 3
            </div>
          </div>
          
          <Progress value={100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Última etapa - Finalize sua proposta</p>
        </div>

        {/* Dados do Projeto */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dados do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome do Projeto</label>
                <p className="text-lg font-medium">{projetoData?.nome || nomeProjeto}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Responsável</label>
                <p className="text-lg font-medium">{projetoData?.proponente_nome || proponenteNome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Recursos de Outras Fontes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Recursos Financeiros de Outras Fontes
                </CardTitle>
                <CardDescription>
                  Informe se o projeto prevê apoio financeiro de outras fontes além do recurso solicitado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">
                    Projeto possui recursos financeiros de outras fontes? Se sim, quais? *
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Informe se o projeto prevê apoio financeiro, tais como cobrança de ingressos, patrocínio e/ou outras fontes de financiamento.
                    Caso positivo, informe a previsão de valores e onde serão empregados no projeto.
                  </p>

                  <FormField
                    control={form.control}
                    name="recursosOutrasFontes"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nao" id="recursos-nao" />
                          <Label htmlFor="recursos-nao">Não, o projeto não possui outras fontes de recursos financeiros</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apoio-municipal" id="recursos-municipal" />
                          <Label htmlFor="recursos-municipal">Apoio financeiro municipal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apoio-estadual" id="recursos-estadual" />
                          <Label htmlFor="recursos-estadual">Apoio financeiro estadual</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lei-incentivo-municipal" id="recursos-lei-municipal" />
                          <Label htmlFor="recursos-lei-municipal">Recursos de Lei de Incentivo Municipal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lei-incentivo-estadual" id="recursos-lei-estadual" />
                          <Label htmlFor="recursos-lei-estadual">Recursos de Lei de Incentivo Estadual</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lei-incentivo-federal" id="recursos-lei-federal" />
                          <Label htmlFor="recursos-lei-federal">Recursos de Lei de Incentivo Federal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="patrocinio-privado" id="recursos-patrocinio" />
                          <Label htmlFor="recursos-patrocinio">Patrocínio privado direto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="patrocinio-internacional" id="recursos-internacional" />
                          <Label htmlFor="recursos-internacional">Patrocínio de instituição internacional</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="doacoes-pf" id="recursos-doacoes-pf" />
                          <Label htmlFor="recursos-doacoes-pf">Doações de Pessoas Físicas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="doacoes-empresas" id="recursos-doacoes-empresas" />
                          <Label htmlFor="recursos-doacoes-empresas">Doações de Empresas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cobranca-ingressos" id="recursos-ingressos" />
                          <Label htmlFor="recursos-ingressos">Cobrança de ingressos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="outros" id="recursos-outros" />
                          <Label htmlFor="recursos-outros">Outros</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>

                {/* Campo de detalhamento que aparece quando não é "não" */}
                {form.watch("recursosOutrasFontes") && form.watch("recursosOutrasFontes") !== "nao" && (
                  <div>
                    <Label htmlFor="detalhamento-recursos" className="text-base font-medium">
                      Detalhamento dos recursos *
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Se o projeto tem outras fontes de financiamento, detalhe quais são, o valor do financiamento e onde os recursos serão empregados no projeto.
                    </p>
                    <FormField
                      control={form.control}
                      name="detalhamentoRecursos"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="detalhamento-recursos"
                          placeholder="Descreva detalhadamente as outras fontes de financiamento, valores previstos e onde serão aplicados no projeto..."
                          rows={4}
                          className="mt-2"
                        />
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabela de Orçamento */}
            <Card>
              <CardHeader>
                <CardTitle>Itens de Despesa</CardTitle>
                <CardDescription>
                  Adicione os itens de despesa em formato de planilha para melhor controle orçamentário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-medium w-12">#</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[200px]">Descrição do Item</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[250px]">Justificativa</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[120px]">Unidade</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[130px]">Valor Unit.</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[80px]">Qtd</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[130px]">Valor Total</th>
                        <th className="border border-border p-3 text-left font-medium min-w-[150px]">Referência</th>
                        <th className="border border-border p-3 text-left font-medium w-20">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensFields.map((field, index) => {
                        const item = watchItens[index] || {};
                        const valorTotal = calcularValorTotalItem(item.valorUnitario || 0, item.quantidade || 0);
                        const isValido = isItemValido(item);
                        const hasError = !isValido && (item.descricao || item.justificativa || item.valorUnitario || item.quantidade);
                        
                        return (
                          <tr 
                            key={field.id}
                            className={`${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'} 
                                       ${hasError ? 'bg-destructive/10' : ''} 
                                       ${isValido ? 'bg-green-50/50' : ''}`}
                          >
                            <td className="border border-border p-3 text-center font-medium">
                              {index + 1}
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`itens.${index}.descricao`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="border-0 focus-visible:ring-1"
                                        placeholder="Ex: Profissional Fotógrafo"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`itens.${index}.justificativa`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="border-0 focus-visible:ring-1"
                                        placeholder="Ex: Serviço necessário para..."
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`itens.${index}.unidadeMedida`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="border-0 focus-visible:ring-1">
                                          <SelectValue placeholder="Unidade" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {unidadesMedida.map((unidade) => (
                                          <SelectItem key={unidade} value={unidade}>
                                            {unidade}
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
                                name={`itens.${index}.valorUnitario`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        {...field}
                                        className="border-0 focus-visible:ring-1"
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`itens.${index}.quantidade`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        {...field}
                                        className="border-0 focus-visible:ring-1"
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-3 text-center">
                              <span className="text-sm font-bold text-primary">
                                {formatarValor(valorTotal)}
                              </span>
                            </td>
                            
                            <td className="border border-border p-1">
                              <FormField
                                control={form.control}
                                name={`itens.${index}.referenciaPreco`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="border-0 focus-visible:ring-1"
                                        placeholder="Ex: SALICNET"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            
                            <td className="border border-border p-3 text-center">
                              {itensFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {/* Linha de Total */}
                      <tr className="bg-primary/10 font-bold">
                        <td colSpan={6} className="border border-border p-3 text-right">
                          <span className="text-lg">TOTAL GERAL:</span>
                        </td>
                        <td className="border border-border p-3 text-center">
                          <span className="text-lg font-bold text-primary">
                            {formatarValor(calcularValorTotalGeral())}
                          </span>
                        </td>
                        <td colSpan={2} className="border border-border p-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={adicionarItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>

                  {itensValidos === 0 && (
                    <p className="text-sm text-amber-600">
                      Adicione pelo menos 1 item com valor maior que R$ 0,00 para continuar
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total de itens</label>
                    <p className="text-2xl font-bold text-primary">{watchItens.length}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Valor total solicitado</label>
                    <p className="text-lg font-bold text-primary">{formatarValor(calcularValorTotalGeral())}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Valor do orçamento</label>
                    <p className="text-lg font-medium">{formatarValor(valorMaximoModalidade)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Saldo disponível</label>
                    <p className={`text-lg font-bold ${
                      calcularSaldoDisponivel() < 0 ? 'text-destructive' : 'text-green-600'
                    }`}>
                      {formatarValor(calcularSaldoDisponivel())}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Orçamento utilizado</span>
                    <span>{Math.round(percentualUtilizado)}%</span>
                  </div>
                  <Progress 
                    value={percentualUtilizado} 
                    className={`h-3 ${ultrapassouLimite() ? 'bg-destructive' : isProximoLimite() ? 'bg-amber-500' : ''}`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Status:</label>
                  {ultrapassouLimite() ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Limite ultrapassado</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">✅ Orçamento dentro do limite</span>
                    </>
                  )}
                </div>

                {ultrapassouLimite() && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Limite ultrapassado!</span>
                    </div>
                    <p className="text-xs text-destructive/80 mt-1">
                      Reduza o valor dos itens para continuar.
                    </p>
                  </div>
                )}

                {isAbaixoOrcamento() && !ultrapassouLimite() && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Orçamento dentro do limite</span>
                    </div>
                    <p className="text-xs text-blue-600/80 mt-1">
                      Você pode usar até {formatarValor(valorMaximoModalidade)}. Valor atual: {formatarValor(calcularValorTotalGeral())}.
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
                type="button" 
                className="md:w-auto"
                disabled={!podeHabilitar}
                onClick={async () => {
                  // Primeiro salvar os itens
                  const data = form.getValues();
                  const itensParaSalvar: ItemOrcamento[] = data.itens
                    .filter(item => isItemValido(item))
                    .map((item, index) => ({
                      descricao: item.descricao,
                      justificativa: item.justificativa,
                      unidade_medida: item.unidadeMedida,
                      valor_unitario: item.valorUnitario,
                      quantidade: item.quantidade,
                      referencia_preco: item.referenciaPreco || undefined,
                      ordem: index
                    }));

                  const salvou = await salvarItens(itensParaSalvar);
                  if (salvou) {
                    setShowConfirmDialog(true);
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Proposta
              </Button>
            </div>
          </form>
        </Form>

        {/* Modal de Confirmação */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>🎯 Finalizar Proposta</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja enviar a proposta? Após o envio, não será possível fazer alterações.
                <br /><br />
                ✅ <strong>Orçamento utilizado corretamente:</strong> {formatarValor(calcularValorTotalGeral())}
                <br />
                📋 <strong>Projeto será enviado para análise da prefeitura</strong>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2 py-4">
              <div className="flex justify-between">
                <span>Projeto:</span>
                <span className="font-medium">{nomeProjeto}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Total:</span>
                <span className="font-medium text-primary">{formatarValor(calcularValorTotalGeral())}</span>
              </div>
              <div className="flex justify-between">
                <span>Itens de despesa:</span>
                <span className="font-medium">{itensFields.length} itens</span>
              </div>
              <div className="flex justify-between">
                <span>Status do orçamento:</span>
                <span className="font-medium text-green-600">✅ Valor exato utilizado</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={finalizarProposta} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                ✅ Confirmar e Finalizar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}