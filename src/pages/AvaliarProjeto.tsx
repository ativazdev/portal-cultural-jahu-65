import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface AvaliacaoForm {
  criterioA: number;
  observacaoA: string;
  criterioB: number;
  observacaoB: string;
  criterioC: number;
  observacaoC: string;
  criterioD: number;
  observacaoD: string;
  criterioE: number;
  observacaoE: string;
  bonusF: number;
  bonusG: number;
  bonusH: number;
  bonusI: number;
  parecerFinal: string;
}

const criteriosAvaliacao = [
  {
    id: "A",
    titulo: "Qualidade do Projeto",
    maxPontos: 10,
    descricao: "Coerência do objeto, objetivos e justificativa do projeto"
  },
  {
    id: "B", 
    titulo: "Relevância Cultural",
    maxPontos: 10,
    descricao: "Relevância do projeto para o cenário cultural de Jahu"
  },
  {
    id: "C",
    titulo: "Integração Comunitária", 
    maxPontos: 10,
    descricao: "Aspectos de integração comunitária e impacto social"
  },
  {
    id: "D",
    titulo: "Trajetória Artística",
    maxPontos: 10,
    descricao: "Trajetória artística e cultural do agente cultural"
  },
  {
    id: "E",
    titulo: "Promoção de Diversidade",
    maxPontos: 10,
    descricao: "Estratégias que promovem diversidade étnico-racial, de gênero, etc."
  }
];

const criteriosBonus = [
  { id: "F", titulo: "Agente cultural do gênero feminino", pontos: 5 },
  { id: "G", titulo: "Agente cultural negro ou indígena", pontos: 5 },
  { id: "H", titulo: "Agente cultural com deficiência", pontos: 5 },
  { id: "I", titulo: "Agente cultural de região de menor IDH", pontos: 5 }
];


const arquivosProjeto = [
  { nome: "Projeto_Completo.pdf", tamanho: "2.5 MB" },
  { nome: "Orçamento_Detalhado.xlsx", tamanho: "845 KB" },
  { nome: "Cronograma_Atividades.pdf", tamanho: "1.2 MB" },
  { nome: "Curriculo_Proponente.pdf", tamanho: "967 KB" }
];

const AvaliarProjeto = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [pontuacaoBonus, setPontuacaoBonus] = useState(0);
  const [pontuacaoFinal, setPontuacaoFinal] = useState(0);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AvaliacaoForm>({
    defaultValues: {
      criterioA: 0,
      observacaoA: "",
      criterioB: 0,
      observacaoB: "",
      criterioC: 0,
      observacaoC: "",
      criterioD: 0,
      observacaoD: "",
      criterioE: 0,
      observacaoE: "",
      bonusF: 0,
      bonusG: 0,
      bonusH: 0,
      bonusI: 0,
      parecerFinal: ""
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    // Calcular pontuação dos critérios obrigatórios
    const pontuacaoObrigatoria = [
      watchedValues.criterioA,
      watchedValues.criterioB,
      watchedValues.criterioC,
      watchedValues.criterioD,
      watchedValues.criterioE
    ].reduce((total, criterio) => {
      return total + (criterio || 0);
    }, 0);

    // Calcular pontuação bônus
    const bonus = [
      watchedValues.bonusF,
      watchedValues.bonusG,
      watchedValues.bonusH,
      watchedValues.bonusI
    ].reduce((total, bonusValue) => {
      return total + (bonusValue || 0);
    }, 0);

    setPontuacaoTotal(pontuacaoObrigatoria);
    setPontuacaoBonus(bonus);
    setPontuacaoFinal(pontuacaoObrigatoria + bonus);
  }, [watchedValues]);

  // Verificar se há critérios com nota 0
  const temCriterioZero = [
    watchedValues.criterioA,
    watchedValues.criterioB,
    watchedValues.criterioC,
    watchedValues.criterioD,
    watchedValues.criterioE
  ].some(criterio => criterio === 0);

  // Verificar se a pontuação é suficiente para aprovação
  const pontuacaoSuficiente = pontuacaoFinal >= 30;

  const onSubmit = (data: AvaliacaoForm) => {
    // Validar se todos os critérios obrigatórios foram preenchidos
    const criteriosObrigatorios = [
      { nome: 'Critério A', valor: data.criterioA },
      { nome: 'Critério B', valor: data.criterioB },
      { nome: 'Critério C', valor: data.criterioC },
      { nome: 'Critério D', valor: data.criterioD },
      { nome: 'Critério E', valor: data.criterioE }
    ];

    const criteriosVazios = criteriosObrigatorios.filter(criterio => 
      criterio.valor === null || criterio.valor === undefined || isNaN(criterio.valor)
    );

    if (criteriosVazios.length > 0) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios não preenchidos",
        description: "Por favor, preencha todos os critérios obrigatórios (A, B, C, D, E) e o parecer final.",
      });
      return;
    }

    if (!data.parecerFinal.trim()) {
      toast({
        variant: "destructive",
        title: "Parecer final obrigatório",
        description: "Por favor, preencha o parecer final antes de finalizar a avaliação.",
      });
      return;
    }

    console.log("Dados da avaliação finalizada:", data);
    console.log("Pontuação final:", pontuacaoFinal);
    
    toast({
      title: "Avaliação finalizada com sucesso!",
      description: "A avaliação foi enviada e o projeto foi movido para 'Projetos Avaliados'.",
      className: "bg-green-50 border-green-200 text-green-800",
    });

    // Redirecionar após 2 segundos
    setTimeout(() => {
      navigate("/projetos-avaliar");
    }, 2000);
  };

  const salvarRascunho = () => {
    const dadosFormulario = watch();
    console.log("Rascunho salvo:", dadosFormulario);
    console.log("Pontuação atual:", pontuacaoFinal);
    
    toast({
      title: "Rascunho salvo com sucesso!",
      description: "Seus dados foram salvos. Você pode continuar a avaliação mais tarde.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });

    // Redirecionar após 2 segundos
    setTimeout(() => {
      navigate("/projetos-avaliar");
    }, 2000);
  };

  const baixarArquivo = (nomeArquivo: string) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${nomeArquivo}...`,
    });
  };

  // Projeto mock para demonstração
  const projeto = {
    nome: "Projeto PNAB - Festival de Inverno",
    programa: "PNAB 2025",
    modalidade: "Música",
    proponente: "João Silva",
    valorSolicitado: "R$ 25.000,00"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/projetos-avaliar")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Meus Projetos para Avaliar
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Avaliação de Projeto</h1>
            <h2 className="text-xl text-gray-600">{projeto.nome}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção de Acesso ao Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Acesso ao Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Ver Detalhes do Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Detalhes Completos do Projeto</DialogTitle>
                    <DialogDescription>
                      Informações detalhadas sobre o projeto submetido para avaliação.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="font-medium text-gray-600">Nome do Projeto</Label>
                          <p className="text-lg font-semibold">{projeto.nome}</p>
                        </div>
                        <div>
                          <Label className="font-medium text-gray-600">Modalidade</Label>
                          <Badge variant="secondary" className="mt-1">{projeto.modalidade}</Badge>
                        </div>
                        <div>
                          <Label className="font-medium text-gray-600">Valor Solicitado</Label>
                          <p className="text-xl font-bold text-green-600">{projeto.valorSolicitado}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="font-medium text-gray-600">Proponente</Label>
                          <p className="font-medium">{projeto.proponente}</p>
                        </div>
                        <div>
                          <Label className="font-medium text-gray-600">Programa</Label>
                          <p>{projeto.programa}</p>
                        </div>
                        <div>
                          <Label className="font-medium text-gray-600">Data de Submissão</Label>
                          <p>15/11/2024</p>
                        </div>
                      </div>
                    </div>

                    {/* Descrição do Projeto */}
                    <div className="space-y-3">
                      <Label className="font-medium text-gray-600">Descrição do Projeto</Label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">
                          O Festival de Inverno é um evento cultural que visa promover a música brasileira 
                          durante o período de inverno, oferecendo apresentações gratuitas para a população 
                          de Jaú. O projeto incluirá workshops, apresentações ao vivo e atividades educativas 
                          para diferentes faixas etárias, fortalecendo a identidade cultural local e 
                          democratizando o acesso à arte musical.
                        </p>
                      </div>
                    </div>

                    {/* Objetivos */}
                    <div className="space-y-3">
                      <Label className="font-medium text-gray-600">Objetivos</Label>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Promover a música brasileira na região</li>
                          <li>• Oferecer acesso gratuito à cultura para toda a população</li>
                          <li>• Capacitar jovens músicos locais através de workshops</li>
                          <li>• Fortalecer a identidade cultural de Jaú</li>
                          <li>• Estimular a economia criativa local</li>
                        </ul>
                      </div>
                    </div>

                    {/* Cronograma */}
                    <div className="space-y-3">
                      <Label className="font-medium text-gray-600">Cronograma de Execução</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 border rounded-lg">
                          <Label className="text-sm font-medium">Pré-produção</Label>
                          <p className="text-sm text-gray-600">Janeiro - Fevereiro 2025</p>
                          <p className="text-xs text-gray-500">Contratações e preparação</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <Label className="text-sm font-medium">Execução</Label>
                          <p className="text-sm text-gray-600">Março - Maio 2025</p>
                          <p className="text-xs text-gray-500">Workshops e apresentações</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <Label className="text-sm font-medium">Pós-produção</Label>
                          <p className="text-sm text-gray-600">Junho 2025</p>
                          <p className="text-xs text-gray-500">Relatórios e prestação</p>
                        </div>
                      </div>
                    </div>

                    {/* Orçamento Detalhado */}
                    <div className="space-y-3">
                      <Label className="font-medium text-gray-600">Orçamento Detalhado</Label>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Item</th>
                              <th className="text-right p-2">Quantidade</th>
                              <th className="text-right p-2">Valor Unitário</th>
                              <th className="text-right p-2">Valor Total</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr className="border-b">
                              <td className="p-2">Cachê dos Artistas</td>
                              <td className="text-right p-2">5</td>
                              <td className="text-right p-2">R$ 2.000,00</td>
                              <td className="text-right p-2 font-medium">R$ 10.000,00</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">Equipamentos de Som</td>
                              <td className="text-right p-2">1</td>
                              <td className="text-right p-2">R$ 8.000,00</td>
                              <td className="text-right p-2 font-medium">R$ 8.000,00</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">Material Gráfico</td>
                              <td className="text-right p-2">1</td>
                              <td className="text-right p-2">R$ 3.000,00</td>
                              <td className="text-right p-2 font-medium">R$ 3.000,00</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">Alimentação e Hospedagem</td>
                              <td className="text-right p-2">1</td>
                              <td className="text-right p-2">R$ 2.500,00</td>
                              <td className="text-right p-2 font-medium">R$ 2.500,00</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">Despesas Administrativas</td>
                              <td className="text-right p-2">1</td>
                              <td className="text-right p-2">R$ 1.500,00</td>
                              <td className="text-right p-2 font-medium">R$ 1.500,00</td>
                            </tr>
                            <tr className="border-t-2 border-gray-300">
                              <td className="p-2 font-bold">TOTAL</td>
                              <td className="text-right p-2"></td>
                              <td className="text-right p-2"></td>
                              <td className="text-right p-2 font-bold text-lg text-green-600">R$ 25.000,00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Dados do Proponente */}
                    <div className="space-y-3">
                      <Label className="font-medium text-gray-600">Dados do Proponente</Label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Nome:</span>
                            <p>João Silva</p>
                          </div>
                          <div>
                            <span className="font-medium">CPF:</span>
                            <p>123.456.789-01</p>
                          </div>
                          <div>
                            <span className="font-medium">Email:</span>
                            <p>joao.silva@email.com</p>
                          </div>
                          <div>
                            <span className="font-medium">Telefone:</span>
                            <p>(14) 99999-1234</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium">Endereço:</span>
                            <p>Rua das Flores, 123 - Centro - Jaú/SP - CEP: 17201-000</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Justificativa */}
                    <div className="space-y-3">
                      <Label className="font-medium text-gray-600">Justificativa</Label>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-gray-700">
                          O projeto se justifica pela necessidade de fortalecer a cena musical local 
                          e oferecer oportunidades de formação e apresentação para artistas da região. 
                          O inverno é uma época propícia para eventos culturais em espaços fechados, 
                          e o festival contribuirá para movimentar a economia criativa e promover 
                          a integração social através da música.
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div>
                <h4 className="font-medium mb-3">Arquivos do Projeto:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {arquivosProjeto.map((arquivo) => (
                    <div key={arquivo.nome} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{arquivo.nome}</p>
                        <p className="text-xs text-gray-500">{arquivo.tamanho}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => baixarArquivo(arquivo.nome)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nome do Projeto:</Label>
                  <p className="text-sm">{projeto.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Programa:</Label>
                  <p className="text-sm">{projeto.programa}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Modalidade:</Label>
                  <p className="text-sm">{projeto.modalidade}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Proponente:</Label>
                  <p className="text-sm">{projeto.proponente}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valor Solicitado:</Label>
                  <p className="text-sm font-semibold">{projeto.valorSolicitado}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critérios Obrigatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Critérios Obrigatórios de Avaliação</CardTitle>
              <CardDescription>
                Avalie cada critério conforme as diretrizes do edital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {criteriosAvaliacao.map((criterio) => (
                <div key={criterio.id} className="space-y-4 border-b pb-6 last:border-b-0">
                  <div>
                    <h4 className="font-medium">
                      Critério {criterio.id} - {criterio.titulo} (Máx: {criterio.maxPontos} pontos)
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{criterio.descricao}</p>
                  </div>
                  
                   <div className="space-y-2">
                    <Label htmlFor={`criterio${criterio.id}`} className="text-sm font-medium">
                      Pontuação (0 a 10 pontos):
                    </Label>
                    <Input
                      id={`criterio${criterio.id}`}
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      {...register(`criterio${criterio.id}` as keyof AvaliacaoForm, {
                        valueAsNumber: true,
                        min: { value: 0, message: "Pontuação mínima é 0" },
                        max: { value: 10, message: "Pontuação máxima é 10" }
                      })}
                      className={`w-32 ${
                        watchedValues[`criterio${criterio.id}` as keyof AvaliacaoForm] === 0 
                          ? 'border-orange-300 bg-orange-50' 
                          : ''
                      }`}
                      placeholder="0-10"
                    />
                    {errors[`criterio${criterio.id}` as keyof AvaliacaoForm] && (
                      <p className="text-sm text-red-600">
                        {errors[`criterio${criterio.id}` as keyof AvaliacaoForm]?.message}
                      </p>
                    )}
                    {watchedValues[`criterio${criterio.id}` as keyof AvaliacaoForm] === 0 && (
                      <p className="text-sm text-orange-600 font-medium">
                        ⚠️ Nota 0 resultará em desclassificação
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`observacao${criterio.id}`} className="text-sm font-medium">
                      Observações:
                    </Label>
                    <Textarea
                      id={`observacao${criterio.id}`}
                      {...register(`observacao${criterio.id}` as keyof AvaliacaoForm)}
                      placeholder="Justifique sua avaliação para este critério..."
                      className="mt-2"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Critérios Bônus */}
          <Card>
            <CardHeader>
              <CardTitle>Critérios Bônus (Opcionais)</CardTitle>
              <CardDescription>
                Marque os critérios bônus aplicáveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {criteriosBonus.map((bonus) => (
                  <div key={bonus.id} className="space-y-2">
                    <Label htmlFor={`bonus${bonus.id}`} className="text-sm font-medium">
                      Critério {bonus.id} - {bonus.titulo}
                    </Label>
                    <p className="text-xs text-gray-600 mb-2">
                      Pontuação de 0 a {bonus.pontos} pontos
                    </p>
                    <Input
                      id={`bonus${bonus.id}`}
                      type="number"
                      min="0"
                      max={bonus.pontos}
                      step="1"
                      {...register(`bonus${bonus.id}` as keyof AvaliacaoForm, {
                        valueAsNumber: true,
                        min: { value: 0, message: "Pontuação mínima é 0" },
                        max: { value: bonus.pontos, message: `Pontuação máxima é ${bonus.pontos}` }
                      })}
                      className="w-32"
                      placeholder={`0-${bonus.pontos}`}
                    />
                    {errors[`bonus${bonus.id}` as keyof AvaliacaoForm] && (
                      <p className="text-sm text-red-600">
                        {errors[`bonus${bonus.id}` as keyof AvaliacaoForm]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumo da Pontuação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumo da Pontuação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Alertas de Validação */}
              {temCriterioZero && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">
                    ⚠️ Atenção: Projeto com critério nota 0 será desclassificado
                  </p>
                </div>
              )}
              
              {!pontuacaoSuficiente && pontuacaoFinal > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ❌ Pontuação insuficiente para aprovação (mínimo: 30 pontos)
                  </p>
                </div>
              )}

              {pontuacaoSuficiente && !temCriterioZero && pontuacaoFinal > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    ✅ Pontuação adequada para aprovação
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pontuação Total dos Critérios</p>
                  <p className="text-2xl font-bold text-blue-600">{pontuacaoTotal}/50</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pontuação Bônus</p>
                  <p className="text-2xl font-bold text-green-600">+{pontuacaoBonus}/20</p>
                </div>
                <div className={`p-4 rounded-lg ${
                  temCriterioZero 
                    ? 'bg-orange-50' 
                    : pontuacaoSuficiente 
                      ? 'bg-green-50' 
                      : 'bg-red-50'
                }`}>
                  <p className="text-sm text-gray-600">Pontuação Final</p>
                  <p className={`text-2xl font-bold ${
                    temCriterioZero 
                      ? 'text-orange-600' 
                      : pontuacaoSuficiente 
                        ? 'text-green-600' 
                        : 'text-red-600'
                  }`}>
                    {pontuacaoFinal}/70
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parecer Final */}
          <Card>
            <CardHeader>
              <CardTitle>Parecer Final</CardTitle>
              <CardDescription>
                Descreva sua avaliação geral do projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("parecerFinal", { required: "O parecer final é obrigatório" })}
                placeholder="Escreva aqui seu parecer final sobre o projeto, destacando os pontos fortes, fracos e recomendações..."
                className="min-h-[120px]"
              />
              {errors.parecerFinal && (
                <p className="text-sm text-red-600 mt-2">{errors.parecerFinal.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={salvarRascunho}
              className="w-full sm:w-auto"
            >
              Salvar Rascunho
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              Finalizar Avaliação
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvaliarProjeto;