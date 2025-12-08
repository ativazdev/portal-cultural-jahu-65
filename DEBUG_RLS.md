# Debug RLS - Projetos

## Função de Debug

Para debugar problemas de RLS, você pode usar a função `debug_rls_projetos()`:

```sql
SELECT * FROM debug_rls_projetos();
```

Isso retornará:
- `user_type`: Tipo do usuário (proponente, parecerista, etc)
- `user_id`: ID do usuário do JWT
- `prefeitura_id`: ID da prefeitura do JWT
- `is_proponente_result`: Se é um proponente
- `proponente_exists`: Se existe um proponente vinculado ao usuário
- `proponente_id_param`: NULL (não usado nesta função)

## Verificar Proponente Específico

Para verificar se um proponente específico pertence ao usuário:

```sql
SELECT verificar_proponente_usuario('UUID_DO_PROPONENTE');
```

## Como Usar no Código

Você pode chamar essas funções antes de tentar inserir um projeto para entender o que está acontecendo:

```typescript
const authClient = getAuthenticatedSupabaseClient('proponente');

// Debug
const { data: debugData } = await authClient.rpc('debug_rls_projetos');
console.log('Debug RLS:', debugData);

// Verificar proponente
const { data: verificaProponente } = await authClient.rpc('verificar_proponente_usuario', {
  p_proponente_id: formData.proponente_id
});
console.log('Proponente válido:', verificaProponente);
```

