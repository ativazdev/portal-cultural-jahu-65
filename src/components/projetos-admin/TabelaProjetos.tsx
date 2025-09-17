import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, UserPlus, FileCheck, ThumbsUp, ThumbsDown } from "lucide-react";
import { Projeto } from "@/components/ProjetosAdminMain";

interface TabelaProjetosProps {
  projetos: Projeto[];
  onVerDetalhes: (projeto: Projeto) => void;
  onAtribuirParecerista: (projeto: Projeto) => void;
  onVerAvaliacao: (projeto: Projeto) => void;
  onAprovarRejeitar: (projeto: Projeto) => void;
}

export const TabelaProjetos = ({ 
  projetos, 
  onVerDetalhes, 
  onAtribuirParecerista, 
  onVerAvaliacao, 
  onAprovarRejeitar 
}: TabelaProjetosProps) => {
  
  const getStatusBadge = (status: string) => {
    const variants = {
      "Recebido": "bg-prefeitura-primary/10 text-prefeitura-primary",
      "Em Avaliação": "bg-orange-500/10 text-orange-500",
      "Avaliado": "bg-purple-500/10 text-purple-500",
      "Aprovado": "bg-green-500/10 text-green-500",
      "Rejeitado": "bg-red-500/10 text-red-500"
    };
    return variants[status as keyof typeof variants] || "bg-gray-500/10 text-gray-500";
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      "Música": "bg-blue-500/10 text-blue-500",
      "Teatro": "bg-purple-500/10 text-purple-500",
      "Dança": "bg-pink-500/10 text-pink-500",
      "Artes Visuais": "bg-green-500/10 text-green-500",
      "Literatura": "bg-yellow-500/10 text-yellow-500"
    };
    return colors[categoria as keyof typeof colors] || "bg-gray-500/10 text-gray-500";
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-card rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Projetos ({projetos.length})</h2>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Proponente</TableHead>
                <TableHead>Valor Solicitado</TableHead>
                <TableHead>Data de Submissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parecerista</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetos.map((projeto) => (
                <TableRow key={projeto.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{projeto.nome}</div>
                      <Badge className={`mt-1 ${getCategoriaColor(projeto.categoria)}`}>
                        {projeto.categoria}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{projeto.proponente}</div>
                      <div className="text-sm text-muted-foreground">{projeto.tipoProponente}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatarValor(projeto.valorSolicitado)}
                  </TableCell>
                  <TableCell>
                    {formatarData(projeto.dataSubmissao)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(projeto.status)}>
                      {projeto.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {projeto.parecerista || (
                      <span className="text-muted-foreground">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerDetalhes(projeto)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {projeto.status === "Recebido" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAtribuirParecerista(projeto)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {projeto.status === "Avaliado" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onVerAvaliacao(projeto)}
                          >
                            <FileCheck className="h-4 w-4" />
                          </Button>
                          {/*<Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAprovarRejeitar(projeto)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>*/}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};