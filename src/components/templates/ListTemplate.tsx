import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Building2,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Tipos para configuração do template
export interface ListColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (item: any, index: number) => React.ReactNode;
}

export interface ListFilter {
  key: string;
  label: string;
  type: 'search' | 'select' | 'date' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface ListAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: (item: any) => void;
  show?: (item: any) => boolean;
  className?: string;
  loading?: (item: any) => boolean;
}

export interface StatusCard {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ListTemplateProps {
  // Dados
  data: any[];
  loading?: boolean;
  error?: string;
  
  // Configuração
  title: string;
  subtitle?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  
  // Colunas da tabela
  columns: ListColumn[];
  
  // Filtros
  filters?: ListFilter[];
  onFilterChange?: (filters: Record<string, any>) => void;
  
  // Ações
  actions?: ListAction[];
  bulkActions?: ListAction[];
  
  // Status cards
  statusCards?: StatusCard[];
  
  // Funcionalidades
  searchable?: boolean;
  selectable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  
  // Callbacks
  onSearch?: (term: string) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSelect?: (selectedItems: any[]) => void;
  onRefresh?: () => void;
  
  // Customizações
  className?: string;
  headerActions?: React.ReactNode;
  customEmptyState?: React.ReactNode;
}

const getStatusCardColor = (color: string) => {
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

const getStatusCardIconColor = (color: string) => {
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

export const ListTemplate: React.FC<ListTemplateProps> = ({
  data = [],
  loading = false,
  error,
  title,
  subtitle,
  emptyMessage = 'Nenhum item encontrado',
  emptyDescription = 'Não há dados para exibir no momento.',
  columns = [],
  filters = [],
  onFilterChange,
  actions = [],
  bulkActions = [],
  statusCards = [],
  searchable = true,
  selectable = false,
  sortable = false,
  pagination = false,
  onSearch,
  onSort,
  onSelect,
  onRefresh,
  className = '',
  headerActions,
  customEmptyState
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
  const [filterValues, setFilterValues] = React.useState<Record<string, any>>({});
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onSearch?.(term);
  };

  const handleFilterChange = (key: string, value: any) => {
    // Tratar "all" como valor vazio para "todos"
    const filterValue = value === "all" ? "" : value;
    const newFilters = { ...filterValues, [key]: filterValue };
    setFilterValues(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSort = (column: string) => {
    if (!sortable) return;
    
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  const handleSelectItem = (item: any, checked: boolean) => {
    if (!selectable) return;
    
    if (checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(i => i !== item));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectable) return;
    
    if (checked) {
      setSelectedItems([...data]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkAction = (action: ListAction) => {
    action.onClick(selectedItems);
    setSelectedItems([]);
  };

  // Loading state
  if (loading && data.length === 0) {
    return (
      <div className={`space-y-6 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-6 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onRefresh}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 w-full overflow-hidden ${className}`}>
      {/* Cabeçalho */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh}>
                <Clock className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            )}
          </div>
        </div>

        {/* Cards de Status */}
        {statusCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusCards.map((card, index) => (
              <Card key={index} className={getStatusCardColor(card.color)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.subtitle}
                      </p>
                      {card.trend && (
                        <p className={`text-xs ${card.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {card.trend.isPositive ? '+' : ''}{card.trend.value}%
                        </p>
                      )}
                    </div>
                    <div className={getStatusCardIconColor(card.color)}>
                      {card.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Filtros */}
      {filters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {searchable && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              
              {filters.map((filter) => (
                <div key={filter.key} className="w-full sm:w-48">
                  {filter.type === 'select' ? (
                    <Select
                      value={filterValues[filter.key] || 'all'}
                      onValueChange={(value) => handleFilterChange(filter.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filter.placeholder || filter.label} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder={filter.placeholder || filter.label}
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      type={filter.type === 'number' ? 'number' : 'text'}
                    />
                  )}
                </div>
              ))}
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterValues({});
                  onFilterChange?.({});
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações em Lote */}
      {selectable && selectedItems.length > 0 && bulkActions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedItems.length} item(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                {bulkActions.map((action) => {
                  const isLoading = action.loading ? action.loading(selectedItems[0] || {}) : false;
                  return (
                    <Button
                      key={action.key}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={() => handleBulkAction(action)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          {action.icon}
                          {action.label}
                        </>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>{title} ({data.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-hidden">
            {data.length === 0 ? (
              <div className="text-center py-12">
                {customEmptyState || (
                  <>
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
                    <p className="text-gray-500">{emptyDescription}</p>
                  </>
                )}
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    {selectable && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedItems.length === data.length && data.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    {columns.map((column) => (
                      <TableHead 
                        key={column.key}
                        className={column.width || 'min-w-0'}
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {sortable && column.sortable && (
                            <span className="text-xs text-gray-400">
                              {sortColumn === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    {actions.length > 0 && <TableHead className="w-20">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={item.id || index}>
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item)}
                            onCheckedChange={(checked) => handleSelectItem(item, checked as boolean)}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.render ? column.render(item, index) : item[column.key]}
                        </TableCell>
                      ))}
                      {actions.length > 0 && (
                        <TableCell>
                          <div className="flex gap-2">
                            {actions
                              .filter(action => {
                                const shouldShow = !action.show || action.show(item);
                                if (process.env.NODE_ENV === 'development' && !shouldShow) {
                                  console.log('Ação filtrada:', action.key, 'show result:', action.show?.(item));
                                }
                                return shouldShow;
                              })
                              .map((action) => {
                                if (process.env.NODE_ENV === 'development') {
                                  console.log('Renderizando ação:', action.key, action.label);
                                }
                                const isLoading = action.loading ? action.loading(item) : false;
                                return (
                                  <Button
                                    key={action.key}
                                    variant={action.variant || 'ghost'}
                                    size="sm"
                                    onClick={() => action.onClick(item)}
                                    title={action.label}
                                    className={action.className}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      action.icon
                                    )}
                                  </Button>
                                );
                              })}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListTemplate;
