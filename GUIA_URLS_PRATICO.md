# 🎯 Guia Prático - URLs Multi-Tenant

## ✅ Como Funciona

O sistema agora funciona com URLs baseadas na prefeitura:

```
/<slug-da-prefeitura>/<página>
```

Exemplo para Jaú:
```
/jau/login
/jau/dashboard
/jau/parecerista/dashboard
/jau/prefeitura/dashboard
```

---

## 🚀 Como Testar Localmente

### 1. Iniciar o servidor:
```bash
npm run dev
```

### 2. Acessar no navegador:
```
http://localhost:5173/
```

### 3. Você verá a tela de seleção de prefeituras:
- Lista todas as prefeituras ativas do banco
- Clique em uma para acessar

### 4. Será redirecionado para:
```
http://localhost:5173/jau/login
```

### 5. Após login, você estará em:
```
Proponente:  http://localhost:5173/jau/dashboard
Parecerista: http://localhost:5173/jau/parecerista/dashboard
Prefeitura:  http://localhost:5173/jau/prefeitura/dashboard
```

---

## 📝 Exemplos de Navegação

### No Código TypeScript:

```typescript
import { usePrefeituraUrl } from '@/contexts/PrefeituraContext';
import { useNavigate } from 'react-router-dom';

function MeuComponente() {
  const { getUrl } = usePrefeituraUrl();
  const navigate = useNavigate();
  
  // Navegar para meus projetos
  const irParaMeusProjetos = () => {
    navigate(getUrl('meus-projetos'));
    // Se estiver em /jau/*, gera: /jau/meus-projetos
    // Se estiver em /sao-paulo/*, gera: /sao-paulo/meus-projetos
  };
  
  // Navegar para nova proposta
  const irParaNovaProposta = () => {
    navigate(getUrl('nova-proposta'));
  };
  
  // Navegar para dashboard do parecerista
  const irParaDashboardParecerista = () => {
    navigate(getUrl('parecerista/dashboard'));
  };
  
  return (
    <div>
      <button onClick={irParaMeusProjetos}>Meus Projetos</button>
      <button onClick={irParaNovaProposta}>Nova Proposta</button>
    </div>
  );
}
```

### Em Links JSX:

```tsx
import { usePrefeituraUrl } from '@/contexts/PrefeituraContext';
import { Link } from 'react-router-dom';

function Menu() {
  const { getUrl } = usePrefeituraUrl();
  
  return (
    <nav>
      <Link to={getUrl('dashboard')}>Dashboard</Link>
      <Link to={getUrl('meus-projetos')}>Meus Projetos</Link>
      <Link to={getUrl('nova-proposta')}>Nova Proposta</Link>
      
      {/* Para parecerista */}
      <Link to={getUrl('parecerista/dashboard')}>Dashboard Parecerista</Link>
      <Link to={getUrl('parecerista/projetos-avaliar')}>Avaliar Projetos</Link>
      
      {/* Para prefeitura */}
      <Link to={getUrl('prefeitura/dashboard')}>Admin</Link>
      <Link to={getUrl('prefeitura/editais')}>Editais</Link>
    </nav>
  );
}
```

---

## 🔐 Acesso aos Dados da Prefeitura

### Obter informações da prefeitura atual:

```typescript
import { usePrefeitura } from '@/contexts/PrefeituraContext';

function MeuComponente() {
  const { prefeitura, prefeituraSlug, loading, error } = usePrefeitura();
  
  if (loading) return <div>Carregando prefeitura...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!prefeitura) return <div>Prefeitura não encontrada</div>;
  
  return (
    <div>
      <h1>{prefeitura.nome}</h1>
      <p>Município: {prefeitura.municipio}</p>
      <p>Estado: {prefeitura.estado}</p>
      <p>CNPJ: {prefeitura.cnpj}</p>
      <p>Email: {prefeitura.email}</p>
      <p>Slug da URL: {prefeituraSlug}</p>
      <p>UUID para queries: {prefeitura.id}</p>
    </div>
  );
}
```

### Usar UUID da prefeitura em queries:

```typescript
import { usePrefeitura } from '@/contexts/PrefeituraContext';
import { supabase } from '@/integrations/supabase/client';

function CarregarEditais() {
  const { prefeitura } = usePrefeitura();
  const [editais, setEditais] = useState([]);
  
  useEffect(() => {
    if (prefeitura) {
      const carregarEditais = async () => {
        const { data, error } = await supabase
          .from('editais')
          .select('*')
          .eq('prefeitura_id', prefeitura.id)  // ← Filtra por prefeitura
          .eq('status', 'ativo')
          .order('data_abertura', { ascending: false });
          
        if (data) setEditais(data);
      };
      
      carregarEditais();
    }
  }, [prefeitura]);
  
  return <div>...lista de editais...</div>;
}
```

---

## 🎭 Cenários de Uso

### Cenário 1: Usuário de Jaú

```
1. Acessa o site: /
2. Seleciona "Prefeitura de Jaú"
3. Redireciona para: /jau/login
4. Faz login como proponente
5. Navega para: /jau/dashboard
6. Clica em "Meus Projetos"
7. Vai para: /jau/meus-projetos
8. Submete novo projeto
9. Vai para: /jau/nova-proposta
```

**Tudo isolado em /jau/***

### Cenário 2: Usuário de São Paulo

```
1. Acessa o site: /
2. Seleciona "Prefeitura de São Paulo"
3. Redireciona para: /sao-paulo/login
4. Faz login como parecerista
5. Navega para: /sao-paulo/parecerista/dashboard
6. Clica em "Avaliar Projetos"
7. Vai para: /sao-paulo/parecerista/projetos-avaliar
```

**Tudo isolado em /sao-paulo/***

---

## 🔄 Mudança de Prefeitura

### Como trocar de prefeitura:

```typescript
import { usePrefeitura } from '@/contexts/PrefeituraContext';

function TrocarPrefeitura() {
  const { clearPrefeitura } = usePrefeitura();
  const navigate = useNavigate();
  
  const handleTrocar = () => {
    clearPrefeitura();  // Limpa contexto
    navigate('/');       // Volta para seleção
  };
  
  return <button onClick={handleTrocar}>Trocar Prefeitura</button>;
}
```

---

## 🧪 Como Testar

### Teste 1: Navegação Básica
1. Acesse `http://localhost:5173/`
2. Selecione uma prefeitura
3. Verifique se a URL mudou para `/:prefeitura/login`
4. Navegue entre páginas
5. Verifique se todas mantêm `/:prefeitura/` no início

### Teste 2: Refresh da Página
1. Navegue para qualquer página (ex: `/jau/meus-projetos`)
2. Dê F5 (refresh)
3. A página deve carregar normalmente
4. A prefeitura deve ser restaurada do localStorage

### Teste 3: URL Direta
1. Cole uma URL direta no navegador: `http://localhost:5173/jau/dashboard`
2. A página deve carregar
3. O contexto da prefeitura deve ser definido
4. Navegações subsequentes devem funcionar

### Teste 4: Prefeitura Inválida
1. Acesse uma URL com slug inválido: `http://localhost:5173/cidade-inexistente/login`
2. Deve exibir erro de "Prefeitura não encontrada"
3. Deve redirecionar automaticamente para `/`

---

## 🐛 Troubleshooting

### Problema: "Prefeitura não encontrada"
**Causa:** O slug na URL não corresponde a nenhum município no banco.  
**Solução:** Verifique se a prefeitura existe e está ativa.

### Problema: Links quebrados
**Causa:** Componente não está usando `getUrl()`.  
**Solução:** Sempre use `getUrl()` para gerar URLs:
```typescript
const { getUrl } = usePrefeituraUrl();
navigate(getUrl('minha-pagina'));  // ✅ Correto
navigate('/minha-pagina');         // ❌ Errado (perde prefeitura)
```

### Problema: Prefeitura não carrega após refresh
**Causa:** localStorage não contém os dados.  
**Solução:** O PrefeituraContext restaura automaticamente. Verifique o console para erros.

---

## 📚 Arquivos Relacionados

- **Context:** `src/contexts/PrefeituraContext.tsx`
- **Wrapper:** `src/components/PrefeituraRouteWrapper.tsx`
- **Seleção:** `src/pages/SelecionarPrefeitura.tsx`
- **Rotas:** `src/App.tsx`
- **Sidebars:** 
  - `src/components/DashboardSidebar.tsx`
  - `src/components/PareceristaSidebar.tsx`
  - `src/components/PrefeituraSidebar.tsx`

---

## 🎉 Pronto para Usar!

A estrutura está completa e funcionando. Agora você pode:

1. ✅ Adicionar mais prefeituras no banco
2. ✅ Cada uma terá sua própria URL
3. ✅ Dados completamente isolados
4. ✅ Navegação contextualizada
5. ✅ Sistema escalável

**Comece testando com Jaú e depois adicione outras prefeituras!** 🚀

