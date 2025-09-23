import React, { useState } from "react";
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

const formSchema = z.object({
  itens: z.array(z.object({
    descricao: z.string().min(1, "Descrição é obrigatória"),
    justificativa: z.string().min(1, "Justificativa é obrigatória"),
    unidadeMedida: z.string().min(1, "Unidade de medida é obrigatória"),
    valorUnitario: z.number().min(0.01, "Valor unitário deve ser maior que zero"),
    quantidade: z.number().min(1, "Quantidade deve ser pelo menos 1"),
    referenciaPreco: z.string().optional()
  })).min(3, "Pelo menos 3 itens são obrigatórios"),
  recursosOutrasFontes: z.string().min(1, "Campo obrigatório"),
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Dados que viriam das etapas anteriores (simulados)
  const nomeProjeto = searchParams.get('projeto') || "Projeto Cultural - Teatro Comunitário";
  const proponenteNome = searchParams.get('nome') || "Maria Silva Santos";
  const valorMaximoModalidade = 30000; // R$ 30.000,00 para exemplo
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itens: [
        {
          descricao: "Profissional Fotógrafo",
          justificativa: "Serviço necessário para registro da oficina",
          unidadeMedida: "Serviço",
          valorUnitario: 1100,
          quantidade: 1,
          referenciaPreco: "SALICNET"
        },
        {
          descricao: "Material de divulgação",
          justificativa: "Impressão de cartazes e folders",
          unidadeMedida: "Unidade",
          valorUnitario: 250,
          quantidade: 100,
          referenciaPreco: "3 orçamentos"
        },
        {
          descricao: "Aluguel de equipamento",
          justificativa: "Som para as apresentações",
          unidadeMedida: "Diária",
          valorUnitario: 300,
          quantidade: 5,
          referenciaPreco: "Cotação local"
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

  // Calcular saldo disponível
  const calcularSaldoDisponivel = () => {
    return valorMaximoModalidade - calcularValorTotalGeral();
  };

  // Calcular progresso do orçamento
  const calcularProgressoOrcamento = () => {
    return (calcularValorTotalGeral() / valorMaximoModalidade) * 100;
  };

  // Verificar se está próximo do limite (90%)
  const isProximoLimite = () => {
    return calcularProgressoOrcamento() >= 90 && calcularProgressoOrcamento() < 100;
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
  
  // Condição simples: pelo menos 3 itens válidos E valor exato
  const podeHabilitar = itensValidos >= 3 && isOrcamentoExato();
  
  console.log("Debug botão:", {
    itensValidos: itensValidos,
    valorTotal: calcularValorTotalGeral(),
    valorOrcamento: valorMaximoModalidade,
    isOrcamentoExato: isOrcamentoExato(),
    podeHabilitar: podeHabilitar
  });

  const onSubmit = (data: FormData) => {
    if (ultrapassouLimite()) {
      toast({
        title: "Erro de validação",
        description: `O valor total (${formatarValor(calcularValorTotalGeral())}) ultrapassa o valor do orçamento.`,
        variant: "destructive"
      });
      return;
    }
    
    if (isAbaixoOrcamento()) {
      toast({
        title: "Erro de validação", 
        description: `Você deve utilizar exatamente o valor do orçamento (${formatarValor(valorMaximoModalidade)}). Valor atual: ${formatarValor(calcularValorTotalGeral())}.`,
        variant: "destructive"
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const finalizarProposta = () => {
    console.log("Finalizando proposta...");
    
    // Fechar o modal primeiro
    setShowConfirmDialog(false);
    
    // Mostrar mensagem de sucesso
    toast({
      title: "🎉 Projeto inscrito com sucesso!",
      description: "Sua proposta foi enviada para análise da prefeitura. Acompanhe o status em 'Meus Projetos'.",
    });
    
    // Redirecionar para Meus Projetos
    setTimeout(() => {
      console.log("Redirecionando para /meus-projetos");
      navigate('/meus-projetos');
    }, 1500);
  };

  const salvarRascunho = () => {
    toast({
      title: "Rascunho salvo!",
      description: "Seu progresso foi salvo automaticamente.",
    });
  };

  const voltarEtapaAnterior = () => {
    navigate('/cronograma-execucao');
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

                  {itensFields.length < 3 && (
                    <p className="text-sm text-amber-600">
                      Adicione pelo menos {3 - itensFields.length} item(s) para continuar
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
                    <span>{Math.round(calcularProgressoOrcamento())}%</span>
                  </div>
                  <Progress 
                    value={calcularProgressoOrcamento()} 
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
                  ) : isOrcamentoExato() ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">✅ Perfeito! Valor exato do orçamento</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-600">Utilize o valor exato do orçamento</span>
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

                {isAbaixoOrcamento() && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Utilize todo o orçamento disponível</span>
                    </div>
                    <p className="text-xs text-amber-600/80 mt-1">
                      Você deve usar exatamente {formatarValor(valorMaximoModalidade)}. Faltam {formatarValor(calcularSaldoDisponivel())} para completar.
                    </p>
                  </div>
                )}

                {isOrcamentoExato() && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Excelente! Orçamento utilizado corretamente</span>
                    </div>
                    <p className="text-xs text-green-600/80 mt-1">
                      Você utilizou exatamente o valor disponível do orçamento.
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
                disabled={!podeHabilitar}
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