import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { Projeto } from "@/components/ProjetosAdminMain";

interface DecisaoFinalModalProps {
  aberto: boolean;
  projeto?: Projeto;
  onFechar: () => void;
  onConfirmar: (projetoId: string, decisao: "Aprovado" | "Rejeitado", justificativa: string) => void;
}

export const DecisaoFinalModal = ({ 
  aberto, 
  projeto, 
  onFechar, 
  onConfirmar 
}: DecisaoFinalModalProps) => {
  const [decisao, setDecisao] = useState<"Aprovado" | "Rejeitado" | "">("");
  const [justificativa, setJustificativa] = useState("");

  const handleConfirmar = () => {
    if (projeto && decisao && justificativa.trim()) {
      onConfirmar(projeto.id, decisao as "Aprovado" | "Rejeitado", justificativa);
      setDecisao("");
      setJustificativa("");
    }
  };

  const handleFechar = () => {
    setDecisao("");
    setJustificativa("");
    onFechar();
  };

  if (!projeto) return null;

  // Dados simulados da avaliação
  const avaliacao = {
    parecerista: projeto.parecerista || "Carlos Lima",
    notaFinal: 8.5,
    criterios: [
      { nome: "Relevância Cultural", nota: 9.0 },
      { nome: "Viabilidade Técnica", nota: 8.5 },
      { nome: "Orçamento", nota: 8.0 },
      { nome: "Cronograma", nota: 8.5 },
      { nome: "Impacto Social", nota: 9.0 }
    ],
    parecer: "O projeto apresenta excelente proposta cultural com grande potencial de impacto na comunidade. O cronograma está bem estruturado e o orçamento é condizente com as atividades propostas. Recomendo a aprovação do projeto."
  };

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Decisão Final do Projeto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Projeto */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold">{projeto.nome}</h3>
            <p className="text-sm text-muted-foreground">
              Categoria: <Badge>{projeto.categoria}</Badge> | 
              Proponente: {projeto.proponente} | 
              Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projeto.valorSolicitado)}
            </p>
          </div>

          {/* Resumo da Avaliação */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resumo da Avaliação</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Parecerista Responsável</h5>
                <p className="text-sm">{avaliacao.parecerista}</p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Nota Final</h5>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-prefeitura-primary">{avaliacao.notaFinal}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(avaliacao.notaFinal / 2) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Avaliação por Critérios</h5>
              <div className="space-y-2">
                {avaliacao.criterios.map((criterio, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">{criterio.nome}</span>
                    <Badge variant="outline">{criterio.nota}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Parecer Técnico</h5>
              <div className="p-3 bg-muted rounded border-l-4 border-prefeitura-primary">
                <p className="text-sm">{avaliacao.parecer}</p>
              </div>
            </div>
          </div>

          {/* Botões de Decisão 
          <div>
            <h4 className="font-semibold mb-3">Sua Decisão</h4>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={decisao === "Aprovado" ? "default" : "outline"}
                onClick={() => setDecisao("Aprovado")}
                className={`h-16 ${decisao === "Aprovado" ? 'bg-green-500 hover:bg-green-600' : 'border-green-500 text-green-500 hover:bg-green-50'}`}
              >
                <ThumbsUp className="h-5 w-5 mr-2" />
                Aprovar Projeto
              </Button>
              <Button
                variant={decisao === "Rejeitado" ? "default" : "outline"}
                onClick={() => setDecisao("Rejeitado")}
                className={`h-16 ${decisao === "Rejeitado" ? 'bg-red-500 hover:bg-red-600' : 'border-red-500 text-red-500 hover:bg-red-50'}`}
              >
                <ThumbsDown className="h-5 w-5 mr-2" />
                Rejeitar Projeto
              </Button>
            </div>
          </div>

           Justificativa 
          <div>
            <label className="text-sm font-medium">Justificativa da Decisão *</label>
            <Textarea
              placeholder="Explique os motivos da sua decisão..."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>*/}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar}>
            Fechar
          </Button>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};