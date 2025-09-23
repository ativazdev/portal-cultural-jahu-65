import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface FiltrosEBuscaProps {
  filtros: {
    busca: string;
    parecerista: string;
    edital: string;
  };
  setFiltros: (filtros: any) => void;
  pareceristas: { id: string; nome: string }[];
  editais: { codigo: string; nome: string }[];
}

export const FiltrosEBusca = ({ filtros, setFiltros, pareceristas, editais }: FiltrosEBuscaProps) => {
  const handleLimparFiltros = () => {
    setFiltros({
      busca: "",
      parecerista: "Todos",
      edital: "Todos"
    });
  };

  return (
    <div className="bg-card rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Filtros e Busca</h2>
      
      <div className="grid grid-cols-12 gap-4">
        {/* Campo de busca principal - 50% */}
        <div className="col-span-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome do projeto, proponente ou categoria..."
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filtro por Edital - 25% */}
        <div className="col-span-3">
          <Select value={filtros.edital} onValueChange={(value) => setFiltros({ ...filtros, edital: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Edital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos os editais</SelectItem>
              {editais?.map((edital) => (
                <SelectItem key={edital.codigo} value={edital.codigo}>
                  {edital.codigo}
                </SelectItem>
              )) || []}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Parecerista - 20% */}
        <div className="col-span-2">
          <Select value={filtros.parecerista} onValueChange={(value) => setFiltros({ ...filtros, parecerista: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Parecerista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Não atribuído">Não atribuído</SelectItem>
              {pareceristas?.map((parecerista) => (
                <SelectItem key={parecerista.id} value={parecerista.nome}>
                  {parecerista.nome}
                </SelectItem>
              )) || []}
            </SelectContent>
          </Select>
        </div>

        {/* Botão Limpar - 5% */}
        <div className="col-span-1">
          <Button
            variant="outline"
            onClick={handleLimparFiltros}
            className="w-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};