# Debug RLS - Problema com INSERT em Projetos

## Status Atual

- ✅ Funções de debug criadas e funcionando
- ✅ Política de INSERT criada corretamente
- ✅ Função `verificar_proponente_usuario` criada com SECURITY DEFINER
- ❌ INSERT ainda falha com erro 42501 (RLS violation)

## Políticas Ativas

Atualmente existem 3 políticas de INSERT na tabela `projetos`:

1. **projetos_insert_prefeitura**: Para usuários da prefeitura
2. **projetos_insert_proponente**: Para proponentes (com verificação)
3. **projetos_insert_test_simple**: Para qualquer authenticated (TESTE - deve permitir tudo)

As políticas são combinadas com OR, então se uma passar, o INSERT deve funcionar.

## Funções de Debug

### 1. `debug_rls_projetos()`
Retorna informações sobre o contexto de autenticação:
- `user_type`: Tipo do usuário
- `user_id`: ID do usuário
- `prefeitura_id`: ID da prefeitura
- `is_proponente_result`: Se é proponente
- `proponente_exists`: Se existe proponente vinculado

### 2. `debug_is_proponente()`
Retorna informações sobre `is_proponente()`:
- `is_proponente_result`: Resultado de `is_proponente()`
- `user_type`: Tipo do usuário
- `user_id`: ID do usuário
- `prefeitura_id`: ID da prefeitura

### 3. `verificar_proponente_usuario(p_proponente_id)`
Verifica se um proponente pertence ao usuário logado.

### 4. `verificar_proponente_usuario_com_log(p_proponente_id)`
Versão com log da função acima. Salva logs em `rls_debug_log`.

## Como Debugar

### 1. Verificar Logs de RLS
```sql
SELECT * FROM rls_debug_log 
ORDER BY timestamp DESC 
LIMIT 10;
```

### 2. Testar Funções Diretamente
```typescript
// No console do navegador ou no código
const authClient = getAuthenticatedSupabaseClient('proponente');

// Debug RLS
const { data: debug } = await authClient.rpc('debug_rls_projetos');
console.log('Debug RLS:', debug);

// Debug is_proponente
const { data: isProp } = await authClient.rpc('debug_is_proponente');
console.log('Is Proponente:', isProp);

// Verificar proponente
const { data: valid } = await authClient.rpc('verificar_proponente_usuario', {
  p_proponente_id: 'ID_DO_PROPONENTE'
});
console.log('Proponente válido:', valid);
```

### 3. Verificar Políticas Ativas
```sql
SELECT 
  polname as policy_name,
  CASE polcmd
    WHEN 'a' THEN 'INSERT'
    ELSE polcmd::text
  END as command,
  pg_get_expr(polwithcheck, polrelid) as with_check_expression
FROM pg_policy 
WHERE polrelid = 'projetos'::regclass
AND polcmd = 'INSERT'
ORDER BY polname;
```

## Possíveis Problemas

1. **Token não está sendo reconhecido como "authenticated"**
   - O JWT customizado pode não estar sendo processado corretamente pelo Supabase
   - Verificar se o token está no header `Authorization: Bearer <token>`

2. **Contexto de autenticação não está disponível durante INSERT**
   - As funções `get_user_type()`, `get_user_id()`, etc. podem retornar NULL durante o INSERT
   - Verificar logs em `rls_debug_log` para ver os valores

3. **Múltiplas políticas conflitantes**
   - Pode haver alguma política que está bloqueando
   - Verificar todas as políticas na tabela

## Próximos Passos

1. Testar com a política `projetos_insert_test_simple` (deve permitir qualquer authenticated)
2. Se não funcionar, o problema é no contexto de autenticação, não na política
3. Verificar logs em `rls_debug_log` para ver o que está acontecendo
4. Verificar se o token está sendo passado corretamente no header Authorization

