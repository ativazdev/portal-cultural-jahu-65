import { useState, useRef } from "react";
import { Search, Plus, Edit, Archive, Download, Upload, Calendar, FileText, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Dados de exemplo dos editais
const editaisIniciais = [
  {
    id: 1,
    codigo: "PNAB-2025-001",
    nome: "PNAB 2025 - Edital de Fomento Cultural",
    dataAbertura: "2025-07-01",
    dataFinalEnvioProjeto: "2025-12-31",
    horarioFinalEnvioProjeto: "23:59",
    status: "Ativo",
    totalProjetos: 15,
    arquivos: [
      { nome: "edital-pnab-2025-001.pdf", tamanho: "2.5 MB", tipo: "application/pdf" },
      { nome: "anexo-formularios.pdf", tamanho: "1.2 MB", tipo: "application/pdf" }
    ],
    criadoEm: "2025-06-15",
    atualizadoEm: "2025-07-01"
  },
  {
    id: 2,
    codigo: "PNAB-2025-002",
    nome: "Edital de Apoio às Artes Cênicas",
    dataAbertura: "2025-08-15",
    dataFinalEnvioProjeto: "2025-11-15",
    horarioFinalEnvioProjeto: "18:00",
    status: "Ativo",
    totalProjetos: 8,
    arquivos: [
      { nome: "edital-artes-cenicas.pdf", tamanho: "3.1 MB", tipo: "application/pdf" }
    ],
    criadoEm: "2025-07-20",
    atualizadoEm: "2025-08-10"
  },
  {
    id: 3,
    codigo: "PNAB-2024-005",
    nome: "Fomento Cultural 2024 - Encerrado",
    dataAbertura: "2024-03-01",
    dataFinalEnvioProjeto: "2024-12-31",
    horarioFinalEnvioProjeto: "23:59",
    status: "Arquivado",
    totalProjetos: 25,
    arquivos: [
      { nome: "edital-2024-encerrado.pdf", tamanho: "2.8 MB", tipo: "application/pdf" }
    ],
    criadoEm: "2024-02-15",
    atualizadoEm: "2024-12-31"
  }
];

export const EditaisAdminMain = () => {
  const [editais, setEditais] = useState(editaisIniciais);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [editalEditando, setEditalEditando] = useState<any>(null);
  const [showArquivarDialog, setShowArquivarDialog] = useState(false);
  const [editalParaArquivar, setEditalParaArquivar] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    dataAbertura: "",
    dataFinalEnvioProjeto: "",
    horarioFinalEnvioProjeto: "",
    arquivos: [] as File[]
  });

  const editaisFiltrados = editais.filter(edital =>
    edital.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edital.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 border-green-200";
      case "Arquivado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Rascunho":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      arquivos: [...prev.arquivos, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      arquivos: prev.arquivos.filter((_, i) => i !== index)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(fileExtension);
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        arquivos: [...prev.arquivos, ...validFiles]
      }));
    }

    if (validFiles.length < files.length) {
      toast({
        title: "Alguns arquivos foram ignorados",
        description: "Apenas arquivos PDF, DOC, DOCX, XLS, XLSX, PNG, JPG e JPEG são aceitos.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      codigo: "",
      dataAbertura: "",
      dataFinalEnvioProjeto: "",
      horarioFinalEnvioProjeto: "",
      arquivos: []
    });
    setEditalEditando(null);
  };

  const handleNovoEdital = () => {
    resetForm();
    setIsModalAberto(true);
  };

  const handleEditarEdital = (edital: any) => {
    setEditalEditando(edital);
    setFormData({
      nome: edital.nome,
      codigo: edital.codigo,
      dataAbertura: edital.dataAbertura,
      dataFinalEnvioProjeto: edital.dataFinalEnvioProjeto || "",
      horarioFinalEnvioProjeto: edital.horarioFinalEnvioProjeto || "",
      arquivos: []
    });
    setIsModalAberto(true);
  };

  const handleSalvarEdital = () => {
    if (!formData.nome || !formData.codigo || !formData.dataAbertura || !formData.dataFinalEnvioProjeto || !formData.horarioFinalEnvioProjeto) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const agora = new Date().toISOString().split('T')[0];

    if (editalEditando) {
      // Editando edital existente
      setEditais(prev => prev.map(edital =>
        edital.id === editalEditando.id
          ? {
              ...edital,
              nome: formData.nome,
              dataAbertura: formData.dataAbertura,
              dataFinalEnvioProjeto: formData.dataFinalEnvioProjeto,
              horarioFinalEnvioProjeto: formData.horarioFinalEnvioProjeto,
              atualizadoEm: agora,
              arquivos: formData.arquivos.length > 0
                ? [...edital.arquivos, ...formData.arquivos.map(file => ({
                    nome: file.name,
                    tamanho: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    tipo: file.type
                  }))]
                : edital.arquivos
            }
          : edital
      ));

      toast({
        title: "Edital atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      // Criando novo edital
      const novoEdital = {
        id: editais.length + 1,
        codigo: formData.codigo,
        nome: formData.nome,
        dataAbertura: formData.dataAbertura,
        dataFinalEnvioProjeto: formData.dataFinalEnvioProjeto,
        horarioFinalEnvioProjeto: formData.horarioFinalEnvioProjeto,
        status: "Ativo",
        totalProjetos: 0,
        arquivos: formData.arquivos.map(file => ({
          nome: file.name,
          tamanho: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          tipo: file.type
        })),
        criadoEm: agora,
        atualizadoEm: agora
      };

      setEditais(prev => [...prev, novoEdital]);

      toast({
        title: "Edital criado!",
        description: "O novo edital foi cadastrado com sucesso.",
      });
    }

    setIsModalAberto(false);
    resetForm();
  };

  const handleArquivarEdital = (edital: any) => {
    setEditalParaArquivar(edital);
    setShowArquivarDialog(true);
  };

  const confirmarArquivamento = () => {
    if (editalParaArquivar) {
      setEditais(prev => prev.map(edital =>
        edital.id === editalParaArquivar.id
          ? { ...edital, status: "Arquivado", atualizadoEm: new Date().toISOString().split('T')[0] }
          : edital
      ));

      toast({
        title: "Edital arquivado!",
        description: `O edital "${editalParaArquivar.nome}" foi arquivado com sucesso.`,
      });
    }
    setShowArquivarDialog(false);
    setEditalParaArquivar(null);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarTamanhoArquivo = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <main className="flex-1 p-6 bg-prefeitura-accent">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Editais</h1>
              <p className="text-gray-600 mt-1">Crie, edite e gerencie os editais do sistema</p>
            </div>
            <Button onClick={handleNovoEdital} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Edital
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Editais</p>
                    <p className="text-2xl font-bold text-gray-900">{editais.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Editais Ativos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {editais.filter(e => e.status === "Ativo").length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Editais Arquivados</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {editais.filter(e => e.status === "Arquivado").length}
                    </p>
                  </div>
                  <Archive className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar editais por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Editais */}
        <div className="grid gap-6">
          {editaisFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum edital encontrado</h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Tente ajustar os filtros de busca." : "Clique em 'Novo Edital' para começar."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            editaisFiltrados.map((edital) => (
              <Card key={edital.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {edital.nome}
                      </CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Código:</span> {edital.codigo}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Data de abertura:</span> {formatarData(edital.dataAbertura)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Data final para envio:</span> {formatarData(edital.dataFinalEnvioProjeto)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Horário final para envio:</span> {edital.horarioFinalEnvioProjeto}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(edital.status)}>
                        {edital.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditarEdital(edital)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {edital.status === "Ativo" && (
                            <DropdownMenuItem
                              onClick={() => handleArquivarEdital(edital)}
                              className="text-orange-600"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Projetos Submetidos</label>
                        <p className="text-lg font-bold text-gray-900">{edital.totalProjetos}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Criado em</label>
                        <p className="text-sm text-gray-900">{formatarData(edital.criadoEm)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Última atualização</label>
                        <p className="text-sm text-gray-900">{formatarData(edital.atualizadoEm)}</p>
                      </div>
                    </div>

                    {/* Arquivos do Edital */}
                    {edital.arquivos.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Documentos</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {edital.arquivos.map((arquivo, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{arquivo.nome}</p>
                                  <p className="text-xs text-gray-500">{arquivo.tamanho}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal de Cadastro/Edição */}
        <Dialog open={isModalAberto} onOpenChange={setIsModalAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editalEditando ? "Editar Edital" : "Novo Edital"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Edital *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Ex: PNAB 2025 - Edital de Fomento Cultural"
                  />
                </div>
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange("codigo", e.target.value)}
                    placeholder="Ex: PNAB-2025-001"
                    disabled={!!editalEditando}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dataAbertura">Data de Abertura *</Label>
                <Input
                  id="dataAbertura"
                  type="date"
                  value={formData.dataAbertura}
                  onChange={(e) => handleInputChange("dataAbertura", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataFinalEnvioProjeto">Data Final de Envio de Projeto *</Label>
                  <Input
                    id="dataFinalEnvioProjeto"
                    type="date"
                    value={formData.dataFinalEnvioProjeto}
                    onChange={(e) => handleInputChange("dataFinalEnvioProjeto", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="horarioFinalEnvioProjeto">Horário Final de Envio de Projeto *</Label>
                  <Input
                    id="horarioFinalEnvioProjeto"
                    type="time"
                    value={formData.horarioFinalEnvioProjeto}
                    onChange={(e) => handleInputChange("horarioFinalEnvioProjeto", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arquivos">Documentos do Edital</Label>
                <div className="space-y-4">
                  {/* Arquivos já salvos (apenas na edição) */}
                  {editalEditando && editalEditando.arquivos && editalEditando.arquivos.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-green-700">Documentos já salvos:</Label>
                      {editalEditando.arquivos.map((arquivo: any, index: number) => (
                        <div key={`saved-${index}`} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900">{arquivo.nome}</p>
                              <p className="text-xs text-green-600">{arquivo.tamanho}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                              <Download className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Salvo</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload de novos arquivos */}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="arquivos"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500">
                          {editalEditando ? "Adicionar novos documentos" : "Selecione múltiplos arquivos"}
                        </p>
                        <p className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG (sem limite de tamanho)</p>
                      </div>
                      <input
                        id="arquivos"
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {/* Lista de novos arquivos selecionados */}
                  {formData.arquivos.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-blue-700">
                        {editalEditando ? "Novos arquivos selecionados:" : "Arquivos selecionados:"}
                      </Label>
                      {formData.arquivos.map((arquivo, index) => (
                        <div key={`new-${index}`} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">{arquivo.name}</p>
                              <p className="text-xs text-blue-600">{formatarTamanhoArquivo(arquivo.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <span className="text-lg">×</span>
                            </Button>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Novo</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Instruções para upload múltiplo */}
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                    <p className="font-medium mb-1">💡 Dicas para upload:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Selecione múltiplos arquivos de uma vez usando Ctrl+Click</li>
                      <li>Arraste e solte múltiplos arquivos na área de upload</li>
                      <li>Não há limite de tamanho para os arquivos</li>
                      <li>Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarEdital}>
                {editalEditando ? "Salvar Alterações" : "Criar Edital"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Arquivamento */}
        <AlertDialog open={showArquivarDialog} onOpenChange={setShowArquivarDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Arquivar Edital</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja arquivar o edital "{editalParaArquivar?.nome}"?
                Esta ação não pode ser desfeita e o edital ficará indisponível para novos projetos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmarArquivamento} className="bg-orange-600 hover:bg-orange-700">
                Arquivar Edital
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
};