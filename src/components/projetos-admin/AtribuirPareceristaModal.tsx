import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Projeto, Parecerista } from "@/components/ProjetosAdminMain";

interface AtribuirPareceristaModalProps {
  aberto: boolean;
  projeto?: Projeto;
  pareceristas: Parecerista[];
  onFechar: () => void;
  onConfirmar: (projetoId: string, pareceristaId: string) => void;
}

export const AtribuirPareceristaModal = ({ 
  aberto, 
  projeto, 
  pareceristas, 
  onFechar, 
  onConfirmar 
}: AtribuirPareceristaModalProps) => {
  const [pareceristaEscolhido, setPareceristaEscolhido] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");

  const handleConfirmar = () => {
    if (projeto && pareceristaEscolhido) {
      onConfirmar(projeto.id, pareceristaEscolhido);
      setPareceristaEscolhido("");
      setObservacoes("");
    }
  };

  const handleFechar = () => {
    setPareceristaEscolhido("");
    setObservacoes("");
    onFechar();
  };

  if (!projeto) return null;

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atribuir Parecerista</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold">{projeto.nome}</h3>
            <p className="text-sm text-muted-foreground">
              Categoria: <Badge>{projeto.categoria}</Badge> | 
              Proponente: {projeto.proponente}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Selecione um Parecerista:</h4>
            <div className="space-y-3">
              {pareceristas.map((parecerista) => (
                <div
                  key={parecerista.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    pareceristaEscolhido === parecerista.id 
                      ? 'border-prefeitura-primary bg-prefeitura-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setPareceristaEscolhido(parecerista.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{parecerista.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        Especialidade: {parecerista.especialidade}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={parecerista.projetosEmAnalise === 0 ? "default" : "secondary"}>
                        {parecerista.projetosEmAnalise} projetos em análise
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Observações (opcional)</label>
            <Textarea
              placeholder="Adicione observações sobre a atribuição..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            disabled={!pareceristaEscolhido}
            className="bg-prefeitura-primary hover:bg-prefeitura-primary/90"
          >
            Atribuir Parecerista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};