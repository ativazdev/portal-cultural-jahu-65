import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';

interface PareceristaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  parecerista?: any;
  loading?: boolean;
}

const ESPECIALIDADES_OPTIONS = [
  { value: 'musica', label: 'Música' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'danca', label: 'Dança' },
  { value: 'artes_visuais', label: 'Artes Visuais' },
  { value: 'literatura', label: 'Literatura' },
  { value: 'cinema', label: 'Cinema' },
  { value: 'cultura_popular', label: 'Cultura Popular' },
  { value: 'circo', label: 'Circo' },
  { value: 'outros', label: 'Outros' }
];

// Funções de máscara com limite de caracteres
const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  // Limitar a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return limitedNumbers.replace(/(\d{3})(\d+)/, '$1.$2');
  } else if (limitedNumbers.length <= 9) {
    return limitedNumbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  } else {
    return limitedNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
};

const formatRG = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  // Limitar a 9 dígitos
  const limitedNumbers = numbers.slice(0, 9);
  
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 5) {
    return limitedNumbers.replace(/(\d{2})(\d+)/, '$1.$2');
  } else if (limitedNumbers.length <= 8) {
    return limitedNumbers.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  } else {
    return limitedNumbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }
};

const formatTelefone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  // Limitar a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return limitedNumbers.replace(/(\d{2})(\d+)/, '($1) $2');
  } else if (limitedNumbers.length <= 10) {
    return limitedNumbers.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  } else {
    return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

export const PareceristaModal = ({ open, onClose, onSave, parecerista, loading = false }: PareceristaModalProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    rg: '',
    telefone: '',
    area_atuacao: '',
    especialidades: [] as string[],
    experiencia_anos: '',
    formacao_academica: '',
    mini_curriculo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (parecerista) {
      setFormData({
        nome: parecerista.nome || '',
        email: parecerista.email || '',
        cpf: parecerista.cpf || '',
        rg: parecerista.rg || '',
        telefone: parecerista.telefone || '',
        area_atuacao: parecerista.area_atuacao || '',
        especialidades: parecerista.especialidades || [],
        experiencia_anos: parecerista.experiencia_anos || '',
        formacao_academica: parecerista.formacao_academica || '',
        mini_curriculo: parecerista.mini_curriculo || ''
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        cpf: '',
        rg: '',
        telefone: '',
        area_atuacao: '',
        especialidades: [],
        experiencia_anos: '',
        formacao_academica: '',
        mini_curriculo: ''
      });
    }
  }, [parecerista, open]);

  const handleInputChange = (field: string, value: any) => {
    let formattedValue = value;
    
    // Aplicar máscaras
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'rg') {
      formattedValue = formatRG(value);
    } else if (field === 'telefone') {
      formattedValue = formatTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleEspecialidadeChange = (especialidade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      especialidades: checked 
        ? [...prev.especialidades, especialidade]
        : prev.especialidades.filter(e => e !== especialidade)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeEspecialidade = (especialidade: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter(e => e !== especialidade)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {parecerista ? 'Editar Parecerista' : 'Novo Parecerista'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do parecerista
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="joao@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">
                CPF <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
                placeholder="00.000.000-0"
                maxLength={12}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_atuacao">
                Área de Atuação <span className="text-red-500">*</span>
              </Label>
              <Input
                id="area_atuacao"
                value={formData.area_atuacao}
                onChange={(e) => handleInputChange('area_atuacao', e.target.value)}
                placeholder="Ex: Artes Visuais, Música, Teatro..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experiencia_anos">Anos de Experiência</Label>
              <Input
                id="experiencia_anos"
                type="number"
                value={formData.experiencia_anos}
                onChange={(e) => handleInputChange('experiencia_anos', e.target.value)}
                placeholder="10"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Especialidades</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ESPECIALIDADES_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.especialidades.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleEspecialidadeChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            
            {formData.especialidades.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {formData.especialidades.map((especialidade) => {
                    const option = ESPECIALIDADES_OPTIONS.find(opt => opt.value === especialidade);
                    return (
                      <Badge key={especialidade} variant="secondary" className="flex items-center gap-1">
                        {option?.label}
                        <button
                          type="button"
                          onClick={() => removeEspecialidade(especialidade)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="formacao_academica">Formação Acadêmica</Label>
            <Textarea
              id="formacao_academica"
              value={formData.formacao_academica}
              onChange={(e) => handleInputChange('formacao_academica', e.target.value)}
              placeholder="Bacharelado em Artes Plásticas - USP"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mini_curriculo">Mini Currículo</Label>
            <Textarea
              id="mini_curriculo"
              value={formData.mini_curriculo}
              onChange={(e) => handleInputChange('mini_curriculo', e.target.value)}
              placeholder="Breve descrição da experiência profissional..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                parecerista ? 'Salvar Alterações' : 'Criar Parecerista'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
