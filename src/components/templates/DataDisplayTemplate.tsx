import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  User, 
  FileText, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react';

// Tipos para configuração do template
export interface DataField {
  key: string;
  label: string;
  value: any;
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'badge' | 'progress' | 'trend' | 'custom';
  format?: string;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
  render?: (value: any) => React.ReactNode;
}

export interface DataSection {
  title: string;
  description?: string;
  fields: DataField[];
  columns?: 1 | 2 | 3 | 4;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface MetricCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
}

export interface DataDisplayTemplateProps {
  // Dados
  data: Record<string, any>;
  
  // Configuração
  title?: string;
  subtitle?: string;
  
  // Seções
  sections?: DataSection[];
  
  // Cards de métricas
  metrics?: MetricCard[];
  
  // Layout
  layout?: 'single' | 'two-column' | 'three-column' | 'grid';
  
  // Customizações
  className?: string;
  showHeader?: boolean;
  showSeparators?: boolean;
}

const getBadgeColor = (color: string) => {
  const colors = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  return colors[color as keyof typeof colors] || colors.default;
};

const getMetricCardColor = (color: string) => {
  const colors = {
    blue: 'border-l-blue-500 bg-blue-50',
    green: 'border-l-green-500 bg-green-50',
    orange: 'border-l-orange-500 bg-orange-50',
    red: 'border-l-red-500 bg-red-50',
    purple: 'border-l-purple-500 bg-purple-50',
    gray: 'border-l-gray-500 bg-gray-50'
  };
  return colors[color as keyof typeof colors] || colors.gray;
};

const getMetricIconColor = (color: string) => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };
  return colors[color as keyof typeof colors] || colors.gray;
};

const formatValue = (value: any, type: string, format?: string): string => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(value));
    
    case 'date':
      return new Date(value).toLocaleDateString('pt-BR');
    
    case 'number':
      return new Intl.NumberFormat('pt-BR').format(Number(value));
    
    case 'boolean':
      return value ? 'Sim' : 'Não';
    
    default:
      return String(value);
  }
};

const renderField = (field: DataField) => {
  const { key, label, value, type = 'text', format, color = 'default', render } = field;

  if (render) {
    return (
      <div key={key} className="space-y-1">
        <Label className="text-sm font-medium text-gray-600">{label}</Label>
        <div>{render(value)}</div>
      </div>
    );
  }

  switch (type) {
    case 'badge':
      return (
        <div key={key} className="space-y-1">
          <Label className="text-sm font-medium text-gray-600">{label}</Label>
          <div>
            <Badge className={getBadgeColor(color)}>
              {formatValue(value, 'text', format)}
            </Badge>
          </div>
        </div>
      );
    
    case 'progress':
      return (
        <div key={key} className="space-y-1">
          <Label className="text-sm font-medium text-gray-600">{label}</Label>
          <div className="space-y-2">
            <Progress value={Number(value)} className="w-full" />
            <span className="text-sm text-gray-600">{formatValue(value, 'number', format)}%</span>
          </div>
        </div>
      );
    
    case 'trend':
      const trendValue = Number(value);
      const isPositive = trendValue > 0;
      return (
        <div key={key} className="space-y-1">
          <Label className="text-sm font-medium text-gray-600">{label}</Label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{Math.abs(trendValue)}%</span>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : trendValue < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <Minus className="h-4 w-4 text-gray-600" />
            )}
          </div>
        </div>
      );
    
    default:
      return (
        <div key={key} className="space-y-1">
          <Label className="text-sm font-medium text-gray-600">{label}</Label>
          <div className="text-sm">{formatValue(value, type, format)}</div>
        </div>
      );
  }
};

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <label className={`block ${className}`}>{children}</label>
);

export const DataDisplayTemplate: React.FC<DataDisplayTemplateProps> = ({
  data,
  title,
  subtitle,
  sections = [],
  metrics = [],
  layout = 'single',
  className = '',
  showHeader = true,
  showSeparators = true
}) => {
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (sectionTitle: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionTitle)) {
      newCollapsed.delete(sectionTitle);
    } else {
      newCollapsed.add(sectionTitle);
    }
    setCollapsedSections(newCollapsed);
  };

  const getGridCols = (columns: number) => {
    const cols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };
    return cols[columns as keyof typeof cols] || cols[2];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho */}
      {showHeader && (title || subtitle) && (
        <div className="space-y-2">
          {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}

      {/* Cards de Métricas */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index} className={getMetricCardColor(metric.color)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    {metric.subtitle && (
                      <p className="text-xs text-muted-foreground">
                        {metric.subtitle}
                      </p>
                    )}
                    {metric.trend && (
                      <div className="flex items-center gap-1">
                        {metric.trend.isPositive ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-xs ${metric.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(metric.trend.value)}% {metric.trend.period}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={getMetricIconColor(metric.color)}>
                    {metric.icon}
                  </div>
                </div>
                {metric.progress && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{metric.progress.label || 'Progresso'}</span>
                      <span>{metric.progress.value}/{metric.progress.max}</span>
                    </div>
                    <Progress 
                      value={(metric.progress.value / metric.progress.max) * 100} 
                      className="h-2" 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Seções de Dados */}
      {sections.length > 0 && (
        <div className={`space-y-6 ${layout === 'two-column' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader 
                className={section.collapsible ? 'cursor-pointer' : ''}
                onClick={section.collapsible ? () => toggleSection(section.title) : undefined}
              >
                <CardTitle className="flex items-center justify-between">
                  <span>{section.title}</span>
                  {section.collapsible && (
                    <Button variant="ghost" size="sm">
                      {collapsedSections.has(section.title) ? '+' : '-'}
                    </Button>
                  )}
                </CardTitle>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </CardHeader>
              
              {(!section.collapsible || !collapsedSections.has(section.title)) && (
                <CardContent>
                  <div className={`grid gap-4 ${getGridCols(section.columns || 2)}`}>
                    {section.fields.map(renderField)}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Separadores */}
      {showSeparators && sections.length > 0 && (
        <Separator />
      )}
    </div>
  );
};

// Componente especializado para exibir dados de projeto
export interface ProjectDataDisplayProps {
  project: any;
  showMetrics?: boolean;
  showDetails?: boolean;
  showDocuments?: boolean;
  showTimeline?: boolean;
}

export const ProjectDataDisplay: React.FC<ProjectDataDisplayProps> = ({
  project,
  showMetrics = true,
  showDetails = true,
  showDocuments = true,
  showTimeline = true
}) => {
  const sections: DataSection[] = [];

  if (showDetails) {
    sections.push({
      title: 'Informações do Projeto',
      fields: [
        { key: 'nome', label: 'Nome do Projeto', value: project.nome, type: 'text' },
        { key: 'categoria', label: 'Categoria', value: project.categoria, type: 'badge', color: 'info' },
        { key: 'proponente', label: 'Proponente', value: project.proponente?.nome, type: 'text' },
        { key: 'valor_solicitado', label: 'Valor Solicitado', value: project.valor_solicitado, type: 'currency' },
        { key: 'status', label: 'Status', value: project.status, type: 'badge', color: 'success' },
        { key: 'data_submissao', label: 'Data de Submissão', value: project.data_submissao, type: 'date' }
      ]
    });
  }

  if (showDocuments && project.documentos) {
    sections.push({
      title: 'Documentos',
      fields: project.documentos.map((doc: any, index: number) => ({
        key: `doc_${index}`,
        label: doc.nome,
        value: doc.status,
        type: 'badge',
        color: doc.status === 'aprovado' ? 'success' : doc.status === 'pendente' ? 'warning' : 'error'
      }))
    });
  }

  const metrics: MetricCard[] = showMetrics ? [
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.valor_solicitado || 0),
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green'
    },
    {
      title: 'Documentos',
      value: project.documentos?.length || 0,
      subtitle: 'anexados',
      icon: <FileText className="h-6 w-6" />,
      color: 'blue'
    },
    {
      title: 'Progresso',
      value: '75%',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'purple',
      progress: { value: 75, max: 100, label: 'Conclusão' }
    }
  ] : [];

  return (
    <DataDisplayTemplate
      data={project}
      title="Detalhes do Projeto"
      sections={sections}
      metrics={metrics}
      layout="single"
    />
  );
};

export default DataDisplayTemplate;
