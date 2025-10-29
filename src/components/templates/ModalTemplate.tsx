import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Save, 
  Download, 
  Eye, 
  Edit,
  Trash2,
  Plus,
  Loader2
} from 'lucide-react';

// Tipos para configuração do modal
export interface ModalField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  accept?: string;
  multiple?: boolean;
}

export interface ModalTab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface ModalAction {
  key: string;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface ModalTemplateProps {
  // Estado do modal
  open: boolean;
  onClose: () => void;
  
  // Configuração
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  
  // Conteúdo
  children?: React.ReactNode;
  
  // Formulário
  fields?: ModalField[];
  formData?: Record<string, any>;
  onFormChange?: (key: string, value: any) => void;
  
  // Tabs
  tabs?: ModalTab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  
  // Ações
  actions?: ModalAction[];
  showDefaultActions?: boolean;
  
  // Estados
  loading?: boolean;
  error?: string;
  warning?: string;
  success?: string;
  
  // Customizações
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const getModalSize = (size: string) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  };
  return sizes[size as keyof typeof sizes] || sizes.lg;
};

const renderField = (field: ModalField, value: any, onChange: (key: string, value: any) => void) => {
  const commonProps = {
    id: field.key,
    placeholder: field.placeholder,
    required: field.required,
    value: value || '',
    onChange: (e: any) => onChange(field.key, e.target.value)
  };

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          rows={field.rows || 3}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
    
    case 'select':
      return (
        <Select value={value || ''} onValueChange={(value) => onChange(field.key, value)}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.key}
            checked={value || false}
            onCheckedChange={(checked) => onChange(field.key, checked)}
          />
          <Label htmlFor={field.key}>{field.label}</Label>
        </div>
      );
    
    case 'file':
      return (
        <Input
          {...commonProps}
          type="file"
          accept={field.accept}
          multiple={field.multiple}
          onChange={(e) => onChange(field.key, e.target.files)}
        />
      );
    
    default:
      return (
        <Input
          {...commonProps}
          type={field.type}
        />
      );
  }
};

export const ModalTemplate: React.FC<ModalTemplateProps> = ({
  open,
  onClose,
  title,
  description,
  size = 'lg',
  children,
  fields = [],
  formData = {},
  onFormChange,
  tabs = [],
  activeTab,
  onTabChange,
  actions = [],
  showDefaultActions = true,
  loading = false,
  error,
  warning,
  success,
  className = '',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  const [currentTab, setCurrentTab] = React.useState(activeTab || tabs[0]?.key || '');

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  const handleFormChange = (key: string, value: any) => {
    onFormChange?.(key, value);
  };

  const defaultActions: ModalAction[] = [
    {
      key: 'cancel',
      label: 'Cancelar',
      variant: 'outline',
      onClick: onClose
    },
    {
      key: 'save',
      label: 'Salvar',
      onClick: () => {},
      loading
    }
  ];

  const allActions = showDefaultActions ? [...defaultActions, ...actions] : actions;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={`${getModalSize(size)} max-h-[90vh] overflow-y-auto ${className}`}
        onPointerDownOutside={closeOnOverlayClick ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Alertas */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {warning && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">{warning}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        {/* Conteúdo */}
        <div className="space-y-4">
          {tabs.length > 0 ? (
            <Tabs value={currentTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-2">
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <>
              {/* Formulário */}
              {fields.length > 0 && (
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      {field.type !== 'checkbox' && (
                        <Label htmlFor={field.key}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      )}
                      {renderField(field, formData[field.key], handleFormChange)}
                    </div>
                  ))}
                </div>
              )}

              {/* Conteúdo customizado */}
              {children}
            </>
          )}
        </div>

        {/* Rodapé com ações */}
        {allActions.length > 0 && (
          <DialogFooter className="gap-2">
            {allActions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="flex items-center gap-2"
              >
                {action.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  action.icon
                )}
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Modal de confirmação especializado
export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false
}) => {
  return (
    <ModalTemplate
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      showDefaultActions={false}
      actions={[
        {
          key: 'cancel',
          label: cancelText,
          variant: 'outline',
          onClick: onClose
        },
        {
          key: 'confirm',
          label: confirmText,
          variant: variant === 'destructive' ? 'destructive' : 'default',
          onClick: onConfirm,
          loading
        }
      ]}
    />
  );
};

// Modal de detalhes especializado
export interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>;
  sections?: {
    title: string;
    fields: string[];
  }[];
  actions?: ModalAction[];
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  open,
  onClose,
  title,
  data,
  sections = [],
  actions = []
}) => {
  const defaultSections = sections.length > 0 ? sections : [
    {
      title: 'Informações Gerais',
      fields: Object.keys(data)
    }
  ];

  return (
    <ModalTemplate
      open={open}
      onClose={onClose}
      title={title}
      size="2xl"
      showDefaultActions={false}
      actions={[
        {
          key: 'close',
          label: 'Fechar',
          variant: 'outline',
          onClick: onClose
        },
        ...actions
      ]}
    >
      <div className="space-y-6">
        {defaultSections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field) => (
                <div key={field} className="grid grid-cols-3 gap-4">
                  <Label className="font-medium text-sm text-gray-600">
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <div className="col-span-2">
                    {typeof data[field] === 'boolean' ? (
                      <Badge variant={data[field] ? 'default' : 'secondary'}>
                        {data[field] ? 'Sim' : 'Não'}
                      </Badge>
                    ) : (
                      <span className="text-sm">{data[field] || 'N/A'}</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </ModalTemplate>
  );
};

export default ModalTemplate;
