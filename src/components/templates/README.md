# Templates Padronizados

Este diretório contém templates reutilizáveis para manter a consistência visual e funcional em todo o sistema. Os templates foram criados para funcionar nas 3 visões (Admin, Prefeitura, Parecerista) e podem ser facilmente customizados.

## Estrutura

```
templates/
├── index.ts                    # Exportações principais
├── ListTemplate.tsx           # Template para listas/tabelas
├── ModalTemplate.tsx          # Template para modais/pop-ups
├── DataDisplayTemplate.tsx    # Template para exibição de dados
├── examples/                  # Exemplos de uso
│   ├── EditaisListExample.tsx
│   └── ProjetosListExample.tsx
└── README.md                  # Esta documentação
```

## Templates Disponíveis

### 1. ListTemplate

Template para exibir listas de dados com funcionalidades completas de gerenciamento.

**Características:**
- ✅ Busca e filtros
- ✅ Ordenação
- ✅ Seleção múltipla
- ✅ Ações em lote
- ✅ Cards de status
- ✅ Paginação (opcional)
- ✅ Estados de loading/erro
- ✅ Responsivo

**Uso:**
```tsx
import { ListTemplate, type ListColumn, type ListFilter, type ListAction } from '@/components/templates';

const columns: ListColumn[] = [
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'status', label: 'Status', render: (item) => <Badge>{item.status}</Badge> }
];

const filters: ListFilter[] = [
  { key: 'status', label: 'Status', type: 'select', options: [...] }
];

const actions: ListAction[] = [
  { key: 'edit', label: 'Editar', icon: <Edit />, onClick: (item) => {} }
];

<ListTemplate
  data={items}
  title="Minha Lista"
  columns={columns}
  filters={filters}
  actions={actions}
  searchable={true}
  selectable={true}
/>
```

### 2. ModalTemplate

Template para modais e pop-ups com suporte a formulários e tabs.

**Características:**
- ✅ Formulários dinâmicos
- ✅ Suporte a tabs
- ✅ Validação
- ✅ Estados de loading/erro
- ✅ Ações customizáveis
- ✅ Diferentes tamanhos

**Uso:**
```tsx
import { ModalTemplate, type ModalField } from '@/components/templates';

const fields: ModalField[] = [
  { key: 'nome', label: 'Nome', type: 'text', required: true },
  { key: 'status', label: 'Status', type: 'select', options: [...] }
];

<ModalTemplate
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Novo Item"
  fields={fields}
  formData={formData}
  onFormChange={handleFormChange}
/>
```

### 3. DataDisplayTemplate

Template para exibir dados de forma estruturada com métricas e seções.

**Características:**
- ✅ Cards de métricas
- ✅ Seções colapsíveis
- ✅ Diferentes tipos de campo
- ✅ Layouts responsivos
- ✅ Gráficos de progresso
- ✅ Indicadores de tendência

**Uso:**
```tsx
import { DataDisplayTemplate, type DataSection, type MetricCard } from '@/components/templates';

const sections: DataSection[] = [
  {
    title: 'Informações Gerais',
    fields: [
      { key: 'nome', label: 'Nome', value: data.nome, type: 'text' },
      { key: 'status', label: 'Status', value: data.status, type: 'badge', color: 'success' }
    ]
  }
];

const metrics: MetricCard[] = [
  {
    title: 'Total',
    value: 100,
    icon: <FileText />,
    color: 'blue'
  }
];

<DataDisplayTemplate
  data={data}
  title="Detalhes"
  sections={sections}
  metrics={metrics}
/>
```

## Componentes Especializados

### ConfirmationModal
Modal simples para confirmações:
```tsx
<ConfirmationModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  title="Confirmar Exclusão"
  description="Tem certeza que deseja excluir este item?"
  variant="destructive"
/>
```

### DetailsModal
Modal para exibir detalhes de um item:
```tsx
<DetailsModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Detalhes do Item"
  data={item}
  sections={sections}
/>
```

### ProjectDataDisplay
Componente especializado para projetos:
```tsx
<ProjectDataDisplay
  project={project}
  showMetrics={true}
  showDetails={true}
  showDocuments={true}
/>
```

## Padrões de Design

### Cores
- **Azul**: Informações gerais, links
- **Verde**: Sucesso, aprovação, valores positivos
- **Laranja**: Avisos, pendências, valores neutros
- **Vermelho**: Erros, rejeição, valores negativos
- **Roxo**: Métricas especiais, destaque
- **Cinza**: Informações secundárias, desabilitado

### Tipografia
- **Títulos**: `text-3xl font-bold` para títulos principais
- **Subtítulos**: `text-gray-600` para descrições
- **Labels**: `text-sm font-medium text-gray-600` para campos
- **Valores**: `text-sm` para dados

### Espaçamento
- **Cards**: `space-y-6` entre seções
- **Campos**: `space-y-4` entre campos de formulário
- **Padding**: `p-6` para conteúdo principal

### Estados
- **Loading**: Spinner com mensagem
- **Erro**: Ícone de alerta com mensagem e botão de retry
- **Vazio**: Ícone representativo com mensagem explicativa

## Customização

### Temas
Os templates usam as classes do Tailwind CSS e podem ser customizados através de:
- Variáveis CSS personalizadas
- Classes de utilitário do Tailwind
- Props de className nos componentes

### Responsividade
Todos os templates são responsivos por padrão:
- **Mobile**: Layout em coluna única
- **Tablet**: Layout em 2 colunas
- **Desktop**: Layout em 3-4 colunas

### Acessibilidade
- Suporte a navegação por teclado
- Labels apropriados para screen readers
- Contraste adequado de cores
- Foco visível em elementos interativos

## Exemplos Completos

Veja os arquivos em `examples/` para exemplos completos de implementação:
- `EditaisListExample.tsx` - Lista de editais com todas as funcionalidades
- `ProjetosListExample.tsx` - Lista de projetos com modal de detalhes

## Migração

Para migrar componentes existentes para usar os templates:

1. **Identifique o padrão**: Lista, Modal ou Exibição de Dados
2. **Configure as props**: Defina colunas, filtros, ações, etc.
3. **Substitua o componente**: Troque o componente atual pelo template
4. **Teste**: Verifique se todas as funcionalidades estão funcionando
5. **Customize**: Ajuste estilos e comportamentos conforme necessário

## Manutenção

- **Atualizações**: Os templates são centralizados, facilitando atualizações
- **Consistência**: Garantem que todas as telas sigam o mesmo padrão
- **Performance**: Otimizados para performance com React.memo quando apropriado
- **Testes**: Fáceis de testar devido à separação de responsabilidades
