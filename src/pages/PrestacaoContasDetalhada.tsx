import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Upload, FileText, Users, Target, Package, UserCheck, Settings, MapPin, Megaphone, Info, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Meta {
  id: string;
  descricao: string;
  status: string;
  observacao: string;
}

interface Profissional {
  id: string;
  nome: string;
  funcao: string;
  cpfCnpj: string;
  pessoaNegra: boolean;
  pessoaDeficiencia: boolean;
}

interface ComiteGestor {
  id: string;
  nomeEntidade: string;
  areaAtuacao: string;
  email: string;
  responsavel: string;
  telefone: string;
  tipo: string;
}

export default function PrestacaoContasDetalhada() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados do formulário
  const [acoesRealizadas, setAcoesRealizadas] = useState("");
  const [geralProdutos, setGeralProdutos] = useState("");
  const [produtos, setProdutos] = useState<string[]>([]);
  const [produtoOutros, setProdutoOutros] = useState("");
  const [consideracoes, setConsideracoes] = useState<string[]>([]);
  const [modoAcesso, setModoAcesso] = useState("");
  const [acoesPresenciais, setAcoesPresenciais] = useState("");
  const [plataformasVirtuais, setPlataformasVirtuais] = useState<string[]>([]);
  const [ondeRealizado, setOndeRealizado] = useState<string[]>([]);
  const [houveMudancaEquipe, setHouveMudancaEquipe] = useState("");
  const [houveComiteGestor, setHouveComiteGestor] = useState("");
  
  const [metas, setMetas] = useState<Meta[]>([
    { id: "1", descricao: "", status: "", observacao: "" }
  ]);
  
  const [profissionais, setProfissionais] = useState<Profissional[]>([
    { id: "1", nome: "", funcao: "", cpfCnpj: "", pessoaNegra: false, pessoaDeficiencia: false }
  ]);
  
  const [comiteGestor, setComiteGestor] = useState<ComiteGestor[]>([
    { id: "1", nomeEntidade: "", areaAtuacao: "", email: "", responsavel: "", telefone: "", tipo: "" }
  ]);

  const adicionarMeta = () => {
    const novaMeta: Meta = {
      id: Date.now().toString(),
      descricao: "",
      status: "",
      observacao: ""
    };
    setMetas([...metas, novaMeta]);
  };

  const removerMeta = (id: string) => {
    setMetas(metas.filter(meta => meta.id !== id));
  };

  const atualizarMeta = (id: string, campo: keyof Meta, valor: string) => {
    setMetas(metas.map(meta => 
      meta.id === id ? { ...meta, [campo]: valor } : meta
    ));
  };

  const adicionarProfissional = () => {
    const novoProfissional: Profissional = {
      id: Date.now().toString(),
      nome: "",
      funcao: "",
      cpfCnpj: "",
      pessoaNegra: false,
      pessoaDeficiencia: false
    };
    setProfissionais([...profissionais, novoProfissional]);
  };

  const removerProfissional = (id: string) => {
    setProfissionais(profissionais.filter(prof => prof.id !== id));
  };

  const atualizarProfissional = (id: string, campo: keyof Profissional, valor: string | boolean) => {
    setProfissionais(profissionais.map(prof => 
      prof.id === id ? { ...prof, [campo]: valor } : prof
    ));
  };

  const adicionarComiteGestor = () => {
    const novoComite: ComiteGestor = {
      id: Date.now().toString(),
      nomeEntidade: "",
      areaAtuacao: "",
      email: "",
      responsavel: "",
      telefone: "",
      tipo: ""
    };
    setComiteGestor([...comiteGestor, novoComite]);
  };

  const removerComiteGestor = (id: string) => {
    setComiteGestor(comiteGestor.filter(comite => comite.id !== id));
  };

  const atualizarComiteGestor = (id: string, campo: keyof ComiteGestor, valor: string) => {
    setComiteGestor(comiteGestor.map(comite => 
      comite.id === id ? { ...comite, [campo]: valor } : comite
    ));
  };

  const handleProdutoChange = (produto: string, checked: boolean) => {
    if (checked) {
      setProdutos([...produtos, produto]);
    } else {
      setProdutos(produtos.filter(p => p !== produto));
    }
  };

  const handleConsideracaoChange = (consideracao: string, checked: boolean) => {
    if (checked) {
      setConsideracoes([...consideracoes, consideracao]);
    } else {
      setConsideracoes(consideracoes.filter(c => c !== consideracao));
    }
  };

  const handlePlataformaChange = (plataforma: string, checked: boolean) => {
    if (checked) {
      setPlataformasVirtuais([...plataformasVirtuais, plataforma]);
    } else {
      setPlataformasVirtuais(plataformasVirtuais.filter(p => p !== plataforma));
    }
  };

  const handleOndeRealizadoChange = (local: string, checked: boolean) => {
    if (checked) {
      setOndeRealizado([...ondeRealizado, local]);
    } else {
      setOndeRealizado(ondeRealizado.filter(l => l !== local));
    }
  };

  const salvarRascunho = () => {
    toast({
      title: "Rascunho salvo",
      description: "Suas informações foram salvas automaticamente.",
    });
  };

  const enviarPrestacaoContas = () => {
    toast({
      title: "Prestação de contas enviada",
      description: "Sua prestação de contas foi enviada com sucesso e está em análise.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/prestacao-contas')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para validação do projeto
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Prestação de Contas</h1>
          <p className="text-gray-600 mt-1">Relatório de Objeto da Execução Cultural</p>
        </div>
      </div>

      {/* Informações básicas do projeto */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Projeto:</span>
                <p className="text-gray-900">Projeto Musical da Cidade</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Termo:</span>
                <p className="text-gray-900">TEC-2024-001</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Valor repassado:</span>
                <p className="text-gray-900">R$ 50.000,00</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Vigência:</span>
                <p className="text-gray-900">01/01/2024 a 31/12/2024</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Entidade:</span>
                <p className="text-gray-900">Associação Cultural da Cidade</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Data de entrega:</span>
                <p className="text-gray-900">{format(new Date(), "dd/MM/yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">
          {/* 1. Dados do Projeto */}
          <AccordionItem value="dados-projeto" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-medium">1. Dados do Projeto</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do projeto</Label>
                    <Input value="Projeto Musical da Cidade" disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Nome da Entidade Cultural</Label>
                    <Input value="Associação Cultural da Cidade" disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Nº do Termo de Execução Cultural</Label>
                    <Input value="TEC-2024-001" disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Vigência do projeto</Label>
                    <Input value="01/01/2024 a 31/12/2024" disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Valor repassado para o projeto</Label>
                    <Input value="R$ 50.000,00" disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Data de entrega desse relatório</Label>
                    <Input value={format(new Date(), "dd/MM/yyyy")} disabled className="bg-gray-50" />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Resultados do Projeto */}
          <AccordionItem value="resultados-projeto" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-lg font-medium">2. Resultados do Projeto</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="resumo">Resumo</Label>
                  <Textarea 
                    id="resumo"
                    placeholder="Descreva um resumo geral dos resultados do projeto..."
                    className="min-h-[120px]"
                  />
                </div>

                <div>
                  <Label>As ações planejadas foram realizadas?</Label>
                  <RadioGroup value={acoesRealizadas} onValueChange={setAcoesRealizadas} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="todas-conforme" id="todas-conforme" />
                      <Label htmlFor="todas-conforme">Sim, todas as ações foram feitas conforme o planejado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="todas-adaptadas" id="todas-adaptadas" />
                      <Label htmlFor="todas-adaptadas">Sim, todas as ações foram feitas, mas com adaptações</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="parte-nao-feita" id="parte-nao-feita" />
                      <Label htmlFor="parte-nao-feita">Uma parte das ações planejadas não foi feita</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao-conforme" id="nao-conforme" />
                      <Label htmlFor="nao-conforme">As ações não foram feitas conforme o planejado</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="acoes-desenvolvidas">Ações desenvolvidas</Label>
                  <Textarea 
                    id="acoes-desenvolvidas"
                    placeholder="Descreva as ações que foram desenvolvidas..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">Cumprimento das Metas</Label>
                    <Button onClick={adicionarMeta} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Meta
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {metas.map((meta, index) => (
                      <Card key={meta.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Meta {index + 1}</h4>
                          {metas.length > 1 && (
                            <Button 
                              onClick={() => removerMeta(meta.id)}
                              size="sm" 
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label>Descrição da meta</Label>
                            <Textarea 
                              value={meta.descricao}
                              onChange={(e) => atualizarMeta(meta.id, 'descricao', e.target.value)}
                              placeholder="Descreva a meta..."
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Status</Label>
                              <Select 
                                value={meta.status} 
                                onValueChange={(value) => atualizarMeta(meta.id, 'status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="integralmente">Integralmente cumprida</SelectItem>
                                  <SelectItem value="parcialmente">Parcialmente cumprida</SelectItem>
                                  <SelectItem value="nao-cumprida">Não cumprida</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Observação/Justificativa</Label>
                              <Textarea 
                                value={meta.observacao}
                                onChange={(e) => atualizarMeta(meta.id, 'observacao', e.target.value)}
                                placeholder="Observações sobre esta meta..."
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Produtos Gerados */}
          <AccordionItem value="produtos-gerados" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-medium">3. Produtos Gerados</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <Label>A execução gerou algum produto?</Label>
                  <RadioGroup value={geralProdutos} onValueChange={setGeralProdutos} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="produtos-sim" />
                      <Label htmlFor="produtos-sim">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="produtos-nao" />
                      <Label htmlFor="produtos-nao">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                {geralProdutos === "sim" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Quais produtos?</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {[
                          "Publicação", "Livro", "Catálogo", "Live", "Vídeo", "Documentário", 
                          "Filme", "Relatório de pesquisa", "Produção musical", "Jogo", 
                          "Artesanato", "Obras", "Espetáculo", "Show musical", "Site", "Música"
                        ].map((produto) => (
                          <div key={produto} className="flex items-center space-x-2">
                            <Checkbox 
                              id={produto}
                              checked={produtos.includes(produto)}
                              onCheckedChange={(checked) => handleProdutoChange(produto, checked as boolean)}
                            />
                            <Label htmlFor={produto} className="text-sm">{produto}</Label>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="produtos-outros">Outros</Label>
                        <Input 
                          id="produtos-outros"
                          value={produtoOutros}
                          onChange={(e) => setProdutoOutros(e.target.value)}
                          placeholder="Especifique outros produtos..."
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="como-disponiveis">Como ficaram disponíveis?</Label>
                      <Textarea 
                        id="como-disponiveis"
                        placeholder="Descreva como os produtos ficaram disponíveis..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="resultados-gerados">Resultados gerados</Label>
                      <Textarea 
                        id="resultados-gerados"
                        placeholder="Descreva os resultados gerados..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label>Considerações sobre resultados</Label>
                      <div className="grid grid-cols-1 gap-3 mt-2">
                        {[
                          "Desenvolveu processos de criação/investigação/pesquisa",
                          "Desenvolveu estudos e análises sobre contexto",
                          "Colaborou para manter atividades culturais",
                          "Fortaleceu identidade cultural",
                          "Promoveu práticas culturais",
                          "Promoveu formação em linguagens artísticas",
                          "Ofereceu programações para comunidade",
                          "Atuou na preservação de bens culturais"
                        ].map((consideracao) => (
                          <div key={consideracao} className="flex items-center space-x-2">
                            <Checkbox 
                              id={consideracao}
                              checked={consideracoes.includes(consideracao)}
                              onCheckedChange={(checked) => handleConsideracaoChange(consideracao, checked as boolean)}
                            />
                            <Label htmlFor={consideracao} className="text-sm">{consideracao}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Público Alcançado */}
          <AccordionItem value="publico-alcancado" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-orange-600" />
                <span className="text-lg font-medium">4. Público Alcançado</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantidade-beneficiados">Quantidade de pessoas beneficiadas</Label>
                  <Input 
                    id="quantidade-beneficiados"
                    type="number"
                    placeholder="Ex: 500"
                  />
                </div>
                <div>
                  <Label htmlFor="mecanismos-mensuracao">Mecanismos de mensuração e justificativas</Label>
                  <Textarea 
                    id="mecanismos-mensuracao"
                    placeholder="Descreva como foi mensurado o público alcançado..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Equipe do Projeto */}
          <AccordionItem value="equipe-projeto" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="text-lg font-medium">5. Equipe do Projeto</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="quantidade-pessoas">Quantas pessoas na equipe?</Label>
                  <Input 
                    id="quantidade-pessoas"
                    type="number"
                    placeholder="Ex: 10"
                  />
                </div>

                <div>
                  <Label>Houve mudanças na equipe?</Label>
                  <RadioGroup value={houveMudancaEquipe} onValueChange={setHouveMudancaEquipe} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="mudanca-sim" />
                      <Label htmlFor="mudanca-sim">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="mudanca-nao" />
                      <Label htmlFor="mudanca-nao">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">Profissionais</Label>
                    <Button onClick={adicionarProfissional} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Profissional
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome da pessoa</TableHead>
                          <TableHead>Função no projeto</TableHead>
                          <TableHead>CPF/CNPJ</TableHead>
                          <TableHead>Pessoa negra ou indígena?</TableHead>
                          <TableHead>Pessoa com deficiência?</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profissionais.map((profissional) => (
                          <TableRow key={profissional.id}>
                            <TableCell>
                              <Input 
                                value={profissional.nome}
                                onChange={(e) => atualizarProfissional(profissional.id, 'nome', e.target.value)}
                                placeholder="Nome completo"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={profissional.funcao}
                                onChange={(e) => atualizarProfissional(profissional.id, 'funcao', e.target.value)}
                                placeholder="Função"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={profissional.cpfCnpj}
                                onChange={(e) => atualizarProfissional(profissional.id, 'cpfCnpj', e.target.value)}
                                placeholder="CPF/CNPJ"
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox 
                                checked={profissional.pessoaNegra}
                                onCheckedChange={(checked) => atualizarProfissional(profissional.id, 'pessoaNegra', checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox 
                                checked={profissional.pessoaDeficiencia}
                                onCheckedChange={(checked) => atualizarProfissional(profissional.id, 'pessoaDeficiencia', checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              {profissionais.length > 1 && (
                                <Button 
                                  onClick={() => removerProfissional(profissional.id)}
                                  size="sm" 
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Comitê Gestor */}
          <AccordionItem value="comite-gestor" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-teal-600" />
                <span className="text-lg font-medium">6. Comitê Gestor</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <Label>Houve formação do Comitê Gestor?</Label>
                  <RadioGroup value={houveComiteGestor} onValueChange={setHouveComiteGestor} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="comite-sim" />
                      <Label htmlFor="comite-sim">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="comite-nao" />
                      <Label htmlFor="comite-nao">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                {houveComiteGestor === "sim" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-base font-medium">Composição do Comitê</Label>
                        <Button onClick={adicionarComiteGestor} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Membro
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome da entidade/coletivo</TableHead>
                              <TableHead>Área de atuação</TableHead>
                              <TableHead>Endereço eletrônico</TableHead>
                              <TableHead>Nome da pessoa responsável</TableHead>
                              <TableHead>Telefone</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {comiteGestor.map((comite) => (
                              <TableRow key={comite.id}>
                                <TableCell>
                                  <Input 
                                    value={comite.nomeEntidade}
                                    onChange={(e) => atualizarComiteGestor(comite.id, 'nomeEntidade', e.target.value)}
                                    placeholder="Nome da entidade"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    value={comite.areaAtuacao}
                                    onChange={(e) => atualizarComiteGestor(comite.id, 'areaAtuacao', e.target.value)}
                                    placeholder="Área de atuação"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    value={comite.email}
                                    onChange={(e) => atualizarComiteGestor(comite.id, 'email', e.target.value)}
                                    placeholder="E-mail"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    value={comite.responsavel}
                                    onChange={(e) => atualizarComiteGestor(comite.id, 'responsavel', e.target.value)}
                                    placeholder="Nome do responsável"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    value={comite.telefone}
                                    onChange={(e) => atualizarComiteGestor(comite.id, 'telefone', e.target.value)}
                                    placeholder="Telefone"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select 
                                    value={comite.tipo} 
                                    onValueChange={(value) => atualizarComiteGestor(comite.id, 'tipo', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="sociedade-civil">Sociedade civil</SelectItem>
                                      <SelectItem value="servico-publico">Serviço público</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  {comiteGestor.length > 1 && (
                                    <Button 
                                      onClick={() => removerComiteGestor(comite.id)}
                                      size="sm" 
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="atuacao-comite">Atuação do Comitê Gestor</Label>
                      <Textarea 
                        id="atuacao-comite"
                        placeholder="Descreva como foi a atuação do Comitê Gestor..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="frequencia-metodologia">Frequência e metodologia</Label>
                      <Textarea 
                        id="frequencia-metodologia"
                        placeholder="Descreva a frequência de reuniões e metodologia utilizada..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 7. Locais de Realização */}
          <AccordionItem value="locais-realizacao" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-600" />
                <span className="text-lg font-medium">7. Locais de Realização</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <Label>Modo de acesso</Label>
                  <RadioGroup value={modoAcesso} onValueChange={setModoAcesso} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="presencial" id="modo-presencial" />
                      <Label htmlFor="modo-presencial">Presencial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="virtual" id="modo-virtual" />
                      <Label htmlFor="modo-virtual">Virtual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hibrido" id="modo-hibrido" />
                      <Label htmlFor="modo-hibrido">Híbrido</Label>
                    </div>
                  </RadioGroup>
                </div>

                {(modoAcesso === "virtual" || modoAcesso === "hibrido") && (
                  <div className="space-y-4">
                    <div>
                      <Label>Plataformas virtuais</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {["YouTube", "Instagram/IGTV", "Facebook", "TikTok", "Google Meet/Zoom"].map((plataforma) => (
                          <div key={plataforma} className="flex items-center space-x-2">
                            <Checkbox 
                              id={plataforma}
                              checked={plataformasVirtuais.includes(plataforma)}
                              onCheckedChange={(checked) => handlePlataformaChange(plataforma, checked as boolean)}
                            />
                            <Label htmlFor={plataforma} className="text-sm">{plataforma}</Label>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="plataformas-outros">Outros</Label>
                        <Input 
                          id="plataformas-outros"
                          placeholder="Especifique outras plataformas..."
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="links-plataformas">Links das plataformas</Label>
                      <Textarea 
                        id="links-plataformas"
                        placeholder="Cole aqui os links das plataformas utilizadas..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}

                {(modoAcesso === "presencial" || modoAcesso === "hibrido") && (
                  <div className="space-y-4">
                    <div>
                      <Label>Ações presenciais</Label>
                      <RadioGroup value={acoesPresenciais} onValueChange={setAcoesPresenciais} className="mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixas" id="acoes-fixas" />
                          <Label htmlFor="acoes-fixas">Fixas no mesmo local</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="itinerantes" id="acoes-itinerantes" />
                          <Label htmlFor="acoes-itinerantes">Itinerantes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="local-base" id="acoes-local-base" />
                          <Label htmlFor="acoes-local-base">Principalmente um local base</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="municipio-estado">Município e Estado</Label>
                      <Input 
                        id="municipio-estado"
                        placeholder="Ex: São Paulo - SP"
                      />
                    </div>

                    <div>
                      <Label>Onde foi realizado</Label>
                      <div className="grid grid-cols-1 gap-3 mt-2">
                        {[
                          "Equipamento cultural público municipal/estadual",
                          "Espaço cultural independente",
                          "Escola",
                          "Praça",
                          "Rua",
                          "Parque"
                        ].map((local) => (
                          <div key={local} className="flex items-center space-x-2">
                            <Checkbox 
                              id={local}
                              checked={ondeRealizado.includes(local)}
                              onCheckedChange={(checked) => handleOndeRealizadoChange(local, checked as boolean)}
                            />
                            <Label htmlFor={local} className="text-sm">{local}</Label>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="onde-outros">Outros</Label>
                        <Input 
                          id="onde-outros"
                          placeholder="Especifique outros locais..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8. Divulgação do Projeto */}
          <AccordionItem value="divulgacao-projeto" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Megaphone className="w-5 h-5 text-yellow-600" />
                <span className="text-lg font-medium">8. Divulgação do Projeto</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div>
                <Label htmlFor="como-divulgado">Como foi divulgado</Label>
                <Textarea 
                  id="como-divulgado"
                  placeholder="Descreva como o projeto foi divulgado (redes sociais, cartazes, rádio, etc.)..."
                  className="min-h-[120px]"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 9. Tópicos Adicionais */}
          <AccordionItem value="topicos-adicionais" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-cyan-600" />
                <span className="text-lg font-medium">9. Tópicos Adicionais</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div>
                <Label htmlFor="informacoes-adicionais">Informações relevantes adicionais</Label>
                <Textarea 
                  id="informacoes-adicionais"
                  placeholder="Descreva qualquer informação adicional relevante sobre o projeto..."
                  className="min-h-[120px]"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 10. Anexos */}
          <AccordionItem value="anexos" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Paperclip className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-medium">10. Anexos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Faça upload dos documentos</h3>
                  <p className="text-gray-600 mb-4">
                    Anexe documentos que comprovem a execução: listas de presença, fotos, vídeos, 
                    depoimentos, folders, materiais de divulgação, etc.
                  </p>
                  <Button variant="outline" className="mb-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar arquivos
                  </Button>
                  <p className="text-sm text-gray-500">
                    Arquivos aceitos: PDF, DOC, DOCX, JPG, PNG, MP4 (máx. 50MB cada)
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Botões de ação */}
        <div className="flex justify-between gap-4 mt-8 pb-8">
          <Button variant="outline" onClick={salvarRascunho}>
            Salvar Rascunho
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/prestacao-contas')}>
              Voltar
            </Button>
            <Button onClick={enviarPrestacaoContas} className="bg-green-600 hover:bg-green-700">
              Enviar Prestação de Contas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}