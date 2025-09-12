import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Save, ArrowLeft, ArrowRight, Trash2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nomeProjeto: z.string().min(1, "Nome do projeto é obrigatório"),
  modalidade: z.string().min(1, "Modalidade é obrigatória"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  objetivos: z.string().min(1, "Objetivos são obrigatórios"),
  metas: z.array(z.object({
    descricao: z.string().min(1, "Descrição da meta é obrigatória")
  })).min(1, "Pelo menos uma meta é obrigatória"),
  perfilPublico: z.string().min(1, "Perfil do público é obrigatório"),
  publicoPrioritario: z.array(z.string()),
  outroPublicoPrioritario: z.string().optional(),
  acessibilidadeArquitetonica: z.array(z.string()),
  outraAcessibilidadeArquitetonica: z.string().optional(),
  acessibilidadeComunicacional: z.array(z.string()),
  outraAcessibilidadeComunicacional: z.string().optional(),
  acessibilidadeAtitudinal: z.array(z.string()),
  implementacaoAcessibilidade: z.string().optional(),
  localExecucao: z.string().min(1, "Local de execução é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFinal: z.string().min(1, "Data final é obrigatória"),
  estrategiaDivulgacao: z.string().min(1, "Estratégia de divulgação é obrigatória"),
  outrasFontes: z.enum(["sim", "nao"]),
  tiposOutrasFontes: z.array(z.string()).optional(),
  detalhesOutrasFontes: z.string().optional(),
  vendaProdutos: z.enum(["sim", "nao"]),
  detalhesVendaProdutos: z.string().optional(),
  equipe: z.array(z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    funcao: z.string().min(1, "Função é obrigatória"),
    cpfCnpj: z.string().min(1, "CPF/CNPJ é obrigatório"),
    indigena: z.boolean().default(false),
    lgbtqiapn: z.boolean().default(false),
    pretoPardo: z.boolean().default(false),
    deficiencia: z.boolean().default(false),
    miniCurriculo: z.string().min(1, "Mini currículo é obrigatório")
  })).min(1, "Pelo menos um profissional é obrigatório")
});

type FormData = z.infer<typeof formSchema>;

const modalidades = [
  "Artes visuais",
  "Música",
  "Teatro",
  "Dança",
  "Literatura",
  "Cinema e audiovisual",
  "Cultura popular",
  "Patrimônio cultural",
  "Cultura digital",
  "Outros"
];

const publicoPrioritarioOptions = [
  "Pessoas vítimas de violência",
  "Pessoas em situação de pobreza",
  "Pessoas em situação de rua",
  "População carcerária",
  "Pessoas com deficiência",
  "Pessoas em sofrimento físico/psíquico",
  "Mulheres",
  "LGBTQIAPN+",
  "Povos e comunidades tradicionais",
  "Negros e/ou negras",
  "Ciganos",
  "Indígenas",
  "Não é específica, aberta para todos",
  "Outros"
];

const acessibilidadeArquitetonicaOptions = [
  "Rotas acessíveis para cadeira de rodas",
  "Piso tátil",
  "Rampas",
  "Elevadores adequados",
  "Corrimãos e guarda-corpos",
  "Banheiros adaptados",
  "Vagas para PCD",
  "Assentos para pessoas obesas",
  "Iluminação adequada",
  "Outra"
];

const acessibilidadeComunicacionalOptions = [
  "Língua Brasileira de Sinais (Libras)",
  "Sistema Braille",
  "Comunicação tátil",
  "Audiodescrição",
  "Legendas",
  "Linguagem simples",
  "Textos para leitores de tela",
  "Outra"
];

const acessibilidadeAtitudinalOptions = [
  "Capacitação de equipes",
  "Contratação de profissionais com deficiência",
  "Formação e sensibilização",
  "Eliminação de atitudes capacitistas"
];

const tiposOutrasFontesOptions = [
  "Apoio municipal/estadual",
  "Lei de Incentivo (Municipal/Estadual/Federal)",
  "Patrocínio privado/internacional",
  "Doações (PF/PJ)",
  "Cobrança de ingressos",
  "Outros"
];

export default function NovaPropostaProjeto() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeProjeto: "",
      modalidade: "",
      descricao: "",
      objetivos: "",
      metas: [{ descricao: "" }],
      perfilPublico: "",
      publicoPrioritario: [],
      outroPublicoPrioritario: "",
      acessibilidadeArquitetonica: [],
      outraAcessibilidadeArquitetonica: "",
      acessibilidadeComunicacional: [],
      outraAcessibilidadeComunicacional: "",
      acessibilidadeAtitudinal: [],
      implementacaoAcessibilidade: "",
      localExecucao: "",
      dataInicio: "",
      dataFinal: "",
      estrategiaDivulgacao: "",
      outrasFontes: "nao",
      tiposOutrasFontes: [],
      detalhesOutrasFontes: "",
      vendaProdutos: "nao",
      detalhesVendaProdutos: "",
      equipe: [{ nome: "", funcao: "", cpfCnpj: "", indigena: false, lgbtqiapn: false, pretoPardo: false, deficiencia: false, miniCurriculo: "" }]
    }
  });

  // Pré-preencher dados do proponente se vier da URL
  useEffect(() => {
    const proponenteId = searchParams.get('proponente');
    const proponenteNome = searchParams.get('nome');
    const proponenteTipo = searchParams.get('tipo');
    
    if (proponenteId && proponenteNome && proponenteTipo) {
      // Aqui você pode pré-preencher campos baseados no proponente selecionado
      form.setValue('modalidade', proponenteTipo === 'Pessoa Física' ? 'Artes visuais' : 'Outros');
      // Outras lógicas baseadas no proponente podem ser adicionadas aqui
    }
  }, [searchParams, form]);

  const { fields: metasFields, append: appendMeta, remove: removeMeta } = useFieldArray({
    control: form.control,
    name: "metas"
  });

  const { fields: equipeFields, append: appendEquipe, remove: removeEquipe } = useFieldArray({
    control: form.control,
    name: "equipe"
  });

  const watchOutrasFontes = form.watch("outrasFontes");
  const watchVendaProdutos = form.watch("vendaProdutos");
  const watchPublicoPrioritario = form.watch("publicoPrioritario");
  const watchAcessibilidadeArquitetonica = form.watch("acessibilidadeArquitetonica");
  const watchAcessibilidadeComunicacional = form.watch("acessibilidadeComunicacional");

  const calculateProgress = () => {
    const values = form.getValues();
    let completed = 0;
    const totalFields = 8; // número de seções principais

    if (values.nomeProjeto && values.modalidade && values.descricao && values.objetivos) completed++;
    if (values.perfilPublico) completed++;
    if (values.implementacaoAcessibilidade) completed++;
    if (values.localExecucao && values.dataInicio && values.dataFinal) completed++;
    if (values.estrategiaDivulgacao) completed++;
    if (values.outrasFontes) completed++;
    if (values.equipe.length > 0) completed++;
    completed++; // documentos (opcional)

    return (completed / totalFields) * 100;
  };

  const onSubmit = (data: FormData) => {
    console.log("Dados do formulário:", data);
    toast({
      title: "Proposta salva!",
      description: "Sua proposta foi salva com sucesso. Prossiga para a próxima etapa.",
    });
    
    // Navegar para cronograma
    const nomeProjeto = data.nomeProjeto || "Projeto Cultural";
    const proponenteNome = searchParams.get('nome') || "Proponente";
    navigate(`/cronograma-execucao?projeto=${encodeURIComponent(nomeProjeto)}&nome=${encodeURIComponent(proponenteNome)}`);
  };

  const salvarRascunho = () => {
    toast({
      title: "Rascunho salvo!",
      description: "Seu progresso foi salvo automaticamente.",
    });
  };

  const voltarDetalhesEdital = () => {
    navigate('/detalhes-edital');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nova Proposta de Projeto</h1>
              {searchParams.get('nome') && (
                <p className="text-muted-foreground mt-1">
                  Proponente: <span className="font-medium">{searchParams.get('nome')}</span> 
                  {searchParams.get('tipo') && (
                    <span className="ml-2 text-sm">({searchParams.get('tipo')})</span>
                  )}
                </p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Etapa 1 de 3
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso do preenchimento</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="multiple" defaultValue={["dados-projeto"]} className="space-y-4">
              
              {/* 1. Dados do Projeto */}
              <AccordionItem value="dados-projeto">
                <AccordionTrigger className="text-lg font-semibold">
                  1. Dados do Projeto
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nomeProjeto"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Projeto *</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o nome do projeto" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="modalidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Modalidade do Projeto *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a modalidade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {modalidades.map((modalidade) => (
                                    <SelectItem key={modalidade} value={modalidade}>
                                      {modalidade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição do Projeto *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Apresente informações gerais: O que realizará? Por que é importante? Como surgiu a ideia? Contexto de realização."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Apresente informações gerais: O que realizará? Por que é importante? Como surgiu a ideia? Contexto de realização.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="objetivos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objetivos do Projeto *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Proponha entre 3 e 5 objetivos claros do que pretende alcançar"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Proponha entre 3 e 5 objetivos claros do que pretende alcançar
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <Label className="text-sm font-medium">Metas do Projeto *</Label>
                        <div className="space-y-4 mt-2">
                          {metasFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                              <FormField
                                control={form.control}
                                name={`metas.${index}.descricao`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input 
                                        placeholder={`Meta ${index + 1}: ex: Realização de 02 oficinas de artes circenses`}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {metasFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeMeta(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendMeta({ descricao: "" })}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Meta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Público-Alvo */}
              <AccordionItem value="publico-alvo">
                <AccordionTrigger className="text-lg font-semibold">
                  2. Público-Alvo
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="perfilPublico"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Perfil do Público a ser Atingido *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Quem será beneficiado? Faixa etária? Comunidade? Escolaridade? Localização?"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Quem será beneficiado? Faixa etária? Comunidade? Escolaridade? Localização?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="publicoPrioritario"
                        render={() => (
                          <FormItem>
                            <FormLabel>Ação voltada prioritariamente para: (múltipla escolha)</FormLabel>
                            <div className="grid md:grid-cols-2 gap-2 mt-2">
                              {publicoPrioritarioOptions.map((option) => (
                                <FormField
                                  key={option}
                                  control={form.control}
                                  name="publicoPrioritario"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== option)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {option}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchPublicoPrioritario?.includes("Outros") && (
                        <FormField
                          control={form.control}
                          name="outroPublicoPrioritario"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especifique outros públicos prioritários</FormLabel>
                              <FormControl>
                                <Input placeholder="Detalhe outros públicos..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* 3. Acessibilidade */}
              <AccordionItem value="acessibilidade">
                <AccordionTrigger className="text-lg font-semibold">
                  3. Acessibilidade
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="acessibilidadeArquitetonica"
                        render={() => (
                          <FormItem>
                            <FormLabel>Acessibilidade Arquitetônica</FormLabel>
                            <div className="grid md:grid-cols-2 gap-2 mt-2">
                              {acessibilidadeArquitetonicaOptions.map((option) => (
                                <FormField
                                  key={option}
                                  control={form.control}
                                  name="acessibilidadeArquitetonica"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== option)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {option}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchAcessibilidadeArquitetonica?.includes("Outra") && (
                        <FormField
                          control={form.control}
                          name="outraAcessibilidadeArquitetonica"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especifique outra acessibilidade arquitetônica</FormLabel>
                              <FormControl>
                                <Input placeholder="Detalhe..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="acessibilidadeComunicacional"
                        render={() => (
                          <FormItem>
                            <FormLabel>Acessibilidade Comunicacional</FormLabel>
                            <div className="grid md:grid-cols-2 gap-2 mt-2">
                              {acessibilidadeComunicacionalOptions.map((option) => (
                                <FormField
                                  key={option}
                                  control={form.control}
                                  name="acessibilidadeComunicacional"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== option)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {option}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchAcessibilidadeComunicacional?.includes("Outra") && (
                        <FormField
                          control={form.control}
                          name="outraAcessibilidadeComunicacional"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especifique outra acessibilidade comunicacional</FormLabel>
                              <FormControl>
                                <Input placeholder="Detalhe..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="acessibilidadeAtitudinal"
                        render={() => (
                          <FormItem>
                            <FormLabel>Acessibilidade Atitudinal</FormLabel>
                            <div className="grid md:grid-cols-2 gap-2 mt-2">
                              {acessibilidadeAtitudinalOptions.map((option) => (
                                <FormField
                                  key={option}
                                  control={form.control}
                                  name="acessibilidadeAtitudinal"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== option)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {option}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="implementacaoAcessibilidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Como essas medidas serão implementadas?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detalhe como as medidas de acessibilidade serão implementadas..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* 4. Execução do Projeto */}
              <AccordionItem value="execucao">
                <AccordionTrigger className="text-lg font-semibold">
                  4. Execução do Projeto
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="localExecucao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local de Execução *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Onde o projeto será executado (espaços, municípios, estados)"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dataInicio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Início *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dataFinal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data Final *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="estrategiaDivulgacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estratégia de Divulgação *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Meios de divulgação (ex: redes sociais, imprensa)"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* 5. Recursos Adicionais */}
              <AccordionItem value="recursos">
                <AccordionTrigger className="text-lg font-semibold">
                  5. Recursos Adicionais
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="outrasFontes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>O projeto possui outras fontes de financiamento?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="sim" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Sim</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="nao" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Não</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchOutrasFontes === "sim" && (
                        <>
                          <FormField
                            control={form.control}
                            name="tiposOutrasFontes"
                            render={() => (
                              <FormItem>
                                <FormLabel>Quais outras fontes?</FormLabel>
                                <div className="grid md:grid-cols-2 gap-2 mt-2">
                                  {tiposOutrasFontesOptions.map((option) => (
                                    <FormField
                                      key={option}
                                      control={form.control}
                                      name="tiposOutrasFontes"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(option)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...(field.value || []), option])
                                                  : field.onChange(
                                                      field.value?.filter((value) => value !== option)
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {option}
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="detalhesOutrasFontes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Detalhe as fontes e valores</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Detalhe as outras fontes de financiamento e valores..."
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="vendaProdutos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>O projeto prevê venda de produtos/ingressos?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="sim" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Sim</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="nao" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Não</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchVendaProdutos === "sim" && (
                        <FormField
                          control={form.control}
                          name="detalhesVendaProdutos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Detalhe produtos, quantidades, valores e aplicação dos recursos</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Detalhe produtos, quantidades, valores e como os recursos serão aplicados..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* 6. Equipe do Projeto */}
              <AccordionItem value="equipe">
                <AccordionTrigger className="text-lg font-semibold">
                  6. Equipe do Projeto
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <Label className="text-sm font-medium">Profissionais da Equipe *</Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          O proponente já está automaticamente incluído na equipe
                        </p>
                        
                        <div className="space-y-6">
                          {equipeFields.map((field, index) => (
                            <Card key={field.id} className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">Profissional {index + 1}</h4>
                                {equipeFields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeEquipe(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <FormField
                                  control={form.control}
                                  name={`equipe.${index}.nome`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nome Completo *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Nome completo" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`equipe.${index}.funcao`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Função no Projeto *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: Diretor artístico" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`equipe.${index}.cpfCnpj`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>CPF/CNPJ *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="000.000.000-00" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label className="text-sm font-medium mb-2 block">Características</Label>
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`equipe.${index}.indigena`}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            Pessoa Indígena
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`equipe.${index}.lgbtqiapn`}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            LGBTQIAPN+
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`equipe.${index}.pretoPardo`}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            Pessoa Preta ou Parda
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`equipe.${index}.deficiencia`}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            Pessoa com deficiência
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>

                              <FormField
                                control={form.control}
                                name={`equipe.${index}.miniCurriculo`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Mini Currículo *</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Breve descrição da experiência profissional..."
                                        className="min-h-[80px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </Card>
                          ))}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => appendEquipe({ 
                            nome: "", 
                            funcao: "", 
                            cpfCnpj: "", 
                            indigena: false, 
                            lgbtqiapn: false, 
                            pretoPardo: false, 
                            deficiencia: false, 
                            miniCurriculo: "" 
                          })}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Profissional
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* 7. Documentos Complementares */}
              <AccordionItem value="documentos">
                <AccordionTrigger className="text-lg font-semibold">
                  7. Documentos Complementares
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Anexar Documentos
                        </Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Anexe currículos, portfólios e outros documentos que auxiliem na análise
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Formatos aceitos: PDF, DOC, DOCX, JPG, PNG
                        </p>
                        
                        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Clique para selecionar arquivos ou arraste aqui
                            </p>
                          </label>
                        </div>

                        {files.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <Label className="text-sm font-medium">Arquivos selecionados:</Label>
                            {files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{file.name}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Botões de Ação */}
            <div className="flex flex-col md:flex-row gap-4 justify-between pt-6 border-t">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={voltarDetalhesEdital}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button type="button" variant="outline" onClick={salvarRascunho}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
              </div>
              
              <Button type="submit" className="md:w-auto">
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