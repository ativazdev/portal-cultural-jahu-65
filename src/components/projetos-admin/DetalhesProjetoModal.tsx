import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Projeto } from "@/components/ProjetosAdminMain";

interface DetalhesProjetoModalProps {
  aberto: boolean;
  projeto?: Projeto;
  onFechar: () => void;
}

export const DetalhesProjetoModal = ({ aberto, projeto, onFechar }: DetalhesProjetoModalProps) => {
  if (!projeto) return null;

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{projeto.nome}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="proposta" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="proposta">Proposta</TabsTrigger>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="proposta" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Informações Gerais</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Categoria:</strong> <Badge>{projeto.categoria}</Badge></div>
                  <div><strong>Proponente:</strong> {projeto.proponente}</div>
                  <div><strong>Tipo:</strong> {projeto.tipoProponente}</div>
                  <div><strong>Valor:</strong> {formatarValor(projeto.valorSolicitado)}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Status do Projeto</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Status Atual:</strong> <Badge>{projeto.status}</Badge></div>
                  <div><strong>Data Submissão:</strong> {new Date(projeto.dataSubmissao).toLocaleDateString('pt-BR')}</div>
                  {projeto.parecerista && (
                    <div><strong>Parecerista:</strong> {projeto.parecerista}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Descrição do Projeto</h3>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Objetivos</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Promover a cultura local na região</li>
                <li>Capacitar artistas da comunidade</li>
                <li>Aumentar o acesso à arte e cultura</li>
                <li>Fortalecer a economia criativa local</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Metas</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Atender 500 pessoas diretamente</li>
                <li>Capacitar 50 artistas locais</li>
                <li>Realizar 10 apresentações públicas</li>
                <li>Produzir material educativo</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="cronograma" className="space-y-4">
            <h3 className="font-semibold">Cronograma de Execução</h3>
            <div className="space-y-3">
              {[
                { mes: "Mês 1", atividade: "Pré-produção e planejamento", status: "Pendente" },
                { mes: "Mês 2", atividade: "Seleção de participantes", status: "Pendente" },
                { mes: "Mês 3", atividade: "Início das oficinas", status: "Pendente" },
                { mes: "Mês 4", atividade: "Desenvolvimento das atividades", status: "Pendente" },
                { mes: "Mês 5", atividade: "Apresentações públicas", status: "Pendente" },
                { mes: "Mês 6", atividade: "Encerramento e avaliação", status: "Pendente" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{item.mes}</div>
                    <div className="text-sm text-muted-foreground">{item.atividade}</div>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orcamento" className="space-y-4">
            <h3 className="font-semibold">Planilha Orçamentária</h3>
            <div className="space-y-3">
              {[
                { categoria: "Recursos Humanos", valor: 8000, percentual: 53.3 },
                { categoria: "Material de Consumo", valor: 3000, percentual: 20.0 },
                { categoria: "Equipamentos", valor: 2500, percentual: 16.7 },
                { categoria: "Divulgação", valor: 1000, percentual: 6.7 },
                { categoria: "Outros Custos", valor: 500, percentual: 3.3 }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{item.categoria}</div>
                    <div className="text-sm text-muted-foreground">{item.percentual}% do total</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatarValor(item.valor)}</div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-bold">
                  <span>Total do Projeto</span>
                  <span>{formatarValor(projeto.valorSolicitado)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4">
            <h3 className="font-semibold">Documentos Anexados</h3>
            <div className="space-y-3">
              {[
                "Proposta Completa.pdf",
                "Cronograma Detalhado.xlsx", 
                "Planilha Orçamentária.xlsx",
                "Documentos Pessoais.pdf",
                "Portfólio do Proponente.pdf"
              ].map((doc, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <span className="text-sm">{doc}</span>
                  <Badge variant="outline">Download</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};