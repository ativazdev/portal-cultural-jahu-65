import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function PrestacaoContas() {
  const navigate = useNavigate();
  const [dataFim, setDataFim] = useState<Date>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a página anterior
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Prestação de Contas</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Preencha as informações do projeto
        </h2>

        {/* Banners Informativos */}
        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Todos os dados preenchidos são salvos automaticamente. Ao finalizar o preenchimento, clique no botão 
              <strong> "Validar projeto e iniciar prestação de contas"</strong> para confirmar o envio dos dados preenchidos.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>ATENÇÃO!</strong> Preencha a data em que, de fato, o seu projeto foi finalizado. Não será aceito o envio da prestação 
              de contas antes da finalização do projeto (data-fim).
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Informações do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="numero-projeto">
                    Número do projeto/Código <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="numero-projeto"
                    placeholder="Ex: 10000"
                    defaultValue=""
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nome-projeto">
                    Nome do projeto <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="nome-projeto"
                    placeholder="Ex: Projeto musical da cidade"
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Data fim do projeto <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataFim && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataFim ? format(dataFim, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataFim}
                        onSelect={setDataFim}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-autorizado">
                    Valor total autorizado pela PNAB <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="valor-autorizado"
                    placeholder="R$ 0,00"
                    defaultValue="R$ 0,00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proponente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proponente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>
                  Tipo de proponente <span className="text-red-500">*</span>
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pessoa-fisica">Pessoa Física</SelectItem>
                    <SelectItem value="pessoa-juridica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome-completo">
                    Nome completo <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="nome-completo"
                    placeholder="Ex: João de Souza Figueredo"
                    defaultValue=""
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf-cnpj">
                    CPF/CNPJ <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="cpf-cnpj"
                    placeholder="Ex: 123.456.789-12"
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="responsavel-legal">
                    Nome completo do responsável legal <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="responsavel-legal"
                    placeholder="Ex: Joana da Silva"
                    defaultValue=""
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf-responsavel">
                    CPF do responsável legal <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="cpf-responsavel"
                    placeholder="Ex: 123.456.789-10"
                    defaultValue=""
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prestação de contas avulsa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prestação de contas avulsa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm mb-4">
                  A apresentação da prestação de contas somente é possível após a completa destinação dos recursos captados e 
                  o encerramento da conta bancária vinculada ao projeto. Portanto, caso ainda exista saldo em conta, o proponente deverá 
                  transferir os recursos ao Fundo Estadual da Cultura ou a conta projeto aprovado, conforme estabelecido no artigo 13 do 
                  Decreto nº 54.275/2009.
                </p>
                
                <p className="text-yellow-800 text-sm mb-4">
                  Em caso de dúvidas sobre os procedimentos, entre em contato com o Núcleo Financeiro pelo e-mail: 
                  <strong> financeiro@pnab.gov.br</strong>.
                </p>
                
                <p className="text-yellow-800 text-sm">
                  Caso o prazo para transferência do saldo residual ultrapasse o limite definido para o envio da prestação de contas, 
                  conforme o art. 40 inciso I da Resolução SC nº 01/2024, informe a Divisão de Prestação de Contas pelo e-mail: 
                  <strong> pcpnab@gov.br</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => navigate('/prestacao-contas-detalhada')}
              className="bg-cultural-primary hover:bg-cultural-primary/90"
            >
              Validar projeto e iniciar prestação de contas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}