# 🌐 Estrutura de URLs - Portal Cultural Multi-Tenant

## ✅ IMPLEMENTAÇÃO CONCLUÍDA

O sistema agora suporta múltiplas prefeituras com URLs isoladas.

---

## 📋 Estrutura de URLs

### 🏠 Raiz
```
/  →  Seleção de Prefeitura
```

### 🔐 Autenticação
```
/:prefeitura/login                    →  Página de login (3 tipos)
/:prefeitura/cadastro-proponente      →  Cadastro de novo proponente
```

### 👤 Área do Proponente
```
/:prefeitura/dashboard                   →  Dashboard do proponente
/:prefeitura/selecionar-edital           →  Selecionar edital para submissão
/:prefeitura/meus-projetos               →  Lista de projetos
/:prefeitura/meus-proponentes            →  Gerenciar proponentes
/:prefeitura/nova-proposta               →  Submeter novo projeto
/:prefeitura/cronograma-execucao         →  Cronograma de execução
/:prefeitura/planilha-orcamentaria       →  Planilha orçamentária
/:prefeitura/prestacao-contas            →  Prestação de contas
/:prefeitura/prestacao-contas/:id        →  Detalhes da prestação
/:prefeitura/prestacao-contas-detalhada  →  Prestação detalhada
/:prefeitura/detalhes-edital             →  Detalhes do edital
/:prefeitura/comunicacao                 →  Comunicação com prefeitura
/:prefeitura/alterar-dados               →  Alterar dados pessoais
/:prefeitura/ajuda                       →  Central de ajuda
```

### 📊 Área do Parecerista
```
/:prefeitura/parecerista/dashboard          →  Dashboard do parecerista
/:prefeitura/parecerista/projetos-avaliar   →  Projetos para avaliar
/:prefeitura/parecerista/projetos-avaliados →  Projetos já avaliados
/:prefeitura/parecerista/avaliar-projeto/:id →  Avaliar projeto específico
/:prefeitura/parecerista/meu-perfil         →  Perfil do parecerista
/:prefeitura/parecerista/pendencias         →  Pendências
/:prefeitura/parecerista/comunicacao        →  Comunicação
/:prefeitura/parecerista/ajuda              →  Central de ajuda
```

### 🏛️ Área da Prefeitura (Admin)
```
/:prefeitura/prefeitura/dashboard             →  Dashboard administrativo
/:prefeitura/prefeitura/editais               →  Gerenciar editais
/:prefeitura/prefeitura/projetos              →  Gerenciar projetos
/:prefeitura/prefeitura/avaliacoes            →  Gerenciar avaliações
/:prefeitura/prefeitura/ranking-avaliacoes    →  Ranking de avaliações
/:prefeitura/prefeitura/prestacoes            →  Gerenciar prestações
/:prefeitura/prefeitura/openbanking           →  Open Banking
/:prefeitura/prefeitura/relatorios            →  Relatórios
/:prefeitura/prefeitura/comunicacoes          →  Comunicações
/:prefeitura/prefeitura/cadastro-pareceristas →  Cadastrar pareceristas
```

---

## 🔑 Parâmetro `:prefeitura`

O parâmetro `:prefeitura` é o **slug** do município da prefeitura.

### Exemplos de Slugs:
- **Jaú** → `jau`
- **São Paulo** → `sao-paulo`
- **Ribeirão Preto** → `ribeirao-preto`
- **Belo Horizonte** → `belo-horizonte`

### Geração do Slug:
```typescript
const slug = municipio
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '') // Remove acentos
  .replace(/[^a-z0-9]+/g, '-')      // Substitui especiais por hífen
  .replace(/^-+|-+$/g, '');         // Remove hífens das pontas
```

---

## 🎯 Exemplos de URLs Completas

### Jaú:
```
https://seusite.com/jau/login
https://seusite.com/jau/dashboard
https://seusite.com/jau/parecerista/dashboard
https://seusite.com/jau/prefeitura/dashboard
```

### São Paulo:
```
https://seusite.com/sao-paulo/login
https://seusite.com/sao-paulo/dashboard
https://seusite.com/sao-paulo/parecerista/dashboard
https://seusite.com/sao-paulo/prefeitura/dashboard
```

---

## 🔄 Fluxo de Navegação

### 1. Usuário acessa o site
```
GET /  →  Página de seleção de prefeitura
```

### 2. Usuário seleciona prefeitura (ex: Jaú)
```
Redireciona para: /jau/login
```

### 3. Usuário faz login
```
Proponente   → /jau/dashboard
Parecerista  → /jau/parecerista/dashboard
Prefeitura   → /jau/prefeitura/dashboard
```

### 4. Todas as navegações mantêm o contexto
```
Exemplo: Ao clicar em "Meus Projetos"
→ /jau/meus-projetos (mantém o slug 'jau')
```

---

## 🧩 Componentes Criados

### 1. PrefeituraContext
**Arquivo:** `src/contexts/PrefeituraContext.tsx`

Gerencia o estado global da prefeitura:
```typescript
interface PrefeituraContextType {
  prefeitura: Prefeitura | null;
  prefeituraSlug: string | null;
  loading: boolean;
  error: string | null;
  setPrefeituraBySlug: (slug: string) => Promise<void>;
  clearPrefeitura: () => void;
}
```

**Hooks exportados:**
- `usePrefeitura()` - Acessa dados da prefeitura
- `usePrefeituraUrl()` - Gera URLs com prefeitura

### 2. PrefeituraRouteWrapper
**Arquivo:** `src/components/PrefeituraRouteWrapper.tsx`

Wrapper para rotas que detecta a prefeitura da URL e carrega no contexto.

### 3. SelecionarPrefeitura
**Arquivo:** `src/pages/SelecionarPrefeitura.tsx`

Página inicial que lista todas as prefeituras ativas.

---

## 💻 Como Usar no Código

### Obter dados da prefeitura atual:
```typescript
import { usePrefeitura } from '@/contexts/PrefeituraContext';

function MeuComponente() {
  const { prefeitura, prefeituraSlug, loading } = usePrefeitura();
  
  if (loading) return <div>Carregando...</div>;
  if (!prefeitura) return <div>Prefeitura não encontrada</div>;
  
  return (
    <div>
      <h1>{prefeitura.nome}</h1>
      <p>{prefeitura.municipio} - {prefeitura.estado}</p>
    </div>
  );
}
```

### Gerar URLs com prefeitura:
```typescript
import { usePrefeituraUrl } from '@/contexts/PrefeituraContext';

function MeuComponente() {
  const { getUrl } = usePrefeituraUrl();
  const navigate = useNavigate();
  
  const irParaProjetos = () => {
    navigate(getUrl('meus-projetos'));
    // Se estiver em /jau/*, gera: /jau/meus-projetos
  };
  
  return (
    <Link to={getUrl('nova-proposta')}>
      Novo Projeto
    </Link>
  );
}
```

### Navegar entre áreas:
```typescript
// Proponente para seus projetos
navigate(getUrl('meus-projetos'));  // /jau/meus-projetos

// Parecerista para dashboard
navigate(getUrl('parecerista/dashboard'));  // /jau/parecerista/dashboard

// Prefeitura para editais
navigate(getUrl('prefeitura/editais'));  // /jau/prefeitura/editais
```

---

## 🔐 Isolamento de Dados

Com a estrutura de URLs, cada prefeitura tem:

1. **Slug único** na URL
2. **UUID único** no banco
3. **Dados isolados** via RLS
4. **Navegação isolada** via contexto

---

## 🎨 Sidebars Atualizados

### ✅ PrefeituraSidebar
- Todos os links agora incluem `/:prefeitura/prefeitura/*`
- Ex: `/jau/prefeitura/dashboard`

### ✅ DashboardSidebar (Proponente)
- Todos os links agora incluem `/:prefeitura/*`
- Ex: `/jau/meus-projetos`

### ✅ PareceristaSidebar
- Todos os links agora incluem `/:prefeitura/parecerista/*`
- Ex: `/jau/parecerista/projetos-avaliar`

---

## 🚀 Persistência

O sistema salva a prefeitura atual no `localStorage`:

```typescript
{
  id: "uuid-da-prefeitura",
  slug: "jau",
  nome: "Prefeitura Municipal de Jaú",
  municipio: "Jaú"
}
```

Isso permite que o usuário mantenha a prefeitura mesmo após refresh.

---

## 📊 Fluxo Completo de Uso

```
1. Usuário acessa o site
   ↓
2. / (Seleção de Prefeitura)
   ↓
3. Seleciona "Jaú"
   ↓
4. Redireciona para /jau/login
   ↓
5. Faz login como Proponente
   ↓
6. Redireciona para /jau/dashboard
   ↓
7. Clica em "Meus Projetos"
   ↓
8. Navega para /jau/meus-projetos
   ↓
9. Todas as URLs mantêm /jau/...
```

---

## 🔍 Validações

### O PrefeituraRouteWrapper valida:
- ✅ Se o slug existe no banco
- ✅ Se a prefeitura está ativa
- ✅ Exibe erro caso não encontre
- ✅ Redireciona para / se inválida

---

## ⚠️ Importante

### Logout
Ao fazer logout, o sistema:
1. Limpa a sessão
2. **Mantém a prefeitura** no localStorage
3. Redireciona para `/` (seleção de prefeitura)

### Troca de Prefeitura
Para trocar de prefeitura:
1. Fazer logout
2. Selecionar nova prefeitura na tela inicial
3. Fazer novo login

---

## 📝 Próximos Passos

Agora que a estrutura de URLs está pronta, você pode:

1. ✅ Navegar entre páginas mantendo contexto
2. ✅ Carregar dados filtrados por `prefeitura_id`
3. ✅ Implementar autenticação com prefeitura
4. ✅ Testar com múltiplas prefeituras

---

## 🎉 Benefícios

✅ **Multi-tenant nativo** - URLs isoladas por prefeitura  
✅ **SEO friendly** - URLs legíveis  
✅ **Escalável** - Adicione prefeituras sem alterar código  
✅ **Seguro** - Isolamento via URL + RLS  
✅ **Persistente** - Mantém contexto no localStorage  
✅ **Intuitivo** - Usuário sabe qual prefeitura está usando  

---

**Data:** 14 de Janeiro de 2025  
**Status:** ✅ Implementado e Funcionando

