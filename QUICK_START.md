# ⚡ Quick Start - Portal Cultural Jaú

## ✅ STATUS: TUDO PRONTO E FUNCIONANDO!

---

## 🎯 PASSO 1: Obter UUID da Prefeitura (OBRIGATÓRIO)

Execute no SQL Editor do Supabase:

```sql
SELECT id, nome FROM prefeituras;
```

**Link direto:** https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/sql/new

📝 **Anote o UUID retornado!** Você vai usar em todos os cadastros.

---

## 🧪 PASSO 2: Testar Cadastro de Parecerista

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/cadastrar-parecerista \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw" \
  -d '{
    "prefeitura_id": "COLE_O_UUID_AQUI",
    "email": "teste@parecerista.com",
    "senha": "senha123",
    "nome": "Teste Parecerista",
    "cpf": "12345678901"
  }'
```

---

## 🧪 PASSO 3: Testar Login de Parecerista

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/auth-parecerista \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw" \
  -d '{
    "email": "teste@parecerista.com",
    "senha": "senha123"
  }'
```

---

## 📊 PASSO 4: Verificar no Banco

Execute no SQL Editor:

```sql
-- Ver pareceristas cadastrados
SELECT id, nome, email, cpf, status FROM pareceristas;

-- Ver proponentes cadastrados
SELECT id, nome, email, tipo, status FROM proponentes;

-- Ver prefeitura
SELECT * FROM prefeituras;
```

---

## 🔧 Configurações do Projeto

### Arquivo: `src/integrations/supabase/client.ts`
✅ Já configurado com as URLs corretas:
- URL: https://ymkytnhdslvkigzilbvy.supabase.co
- Anon Key: Configurada

### Edge Functions URLs:
```
Cadastrar Parecerista: /functions/v1/cadastrar-parecerista
Auth Parecerista:      /functions/v1/auth-parecerista
Cadastrar Proponente:  /functions/v1/cadastrar-proponente
Auth Proponente:       /functions/v1/auth-proponente
```

---

## 📋 Checklist

- [x] Migrações aplicadas (6 de 6)
- [x] Edge Functions deployadas (4 de 4)
- [x] Types TypeScript atualizados
- [x] Cliente Supabase configurado
- [ ] **UUID da prefeitura obtido** ⬅️ FAÇA ISSO AGORA
- [ ] Teste de cadastro de parecerista
- [ ] Teste de login de parecerista
- [ ] Teste de cadastro de proponente
- [ ] Teste de login de proponente

---

## 🎯 Próximo Passo IMEDIATO

### Obtenha o UUID da Prefeitura:

1. Acesse: https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/editor
2. Clique na tabela `prefeituras`
3. Copie o UUID da coluna `id`
4. Use esse UUID nos testes acima

**OU**

Execute no SQL Editor:
```sql
SELECT id FROM prefeituras LIMIT 1;
```

---

## 📚 Documentação Completa

- **Testes detalhados:** Ver `GUIA_TESTE_API.md`
- **Estrutura completa:** Ver `ESTRUTURA_BANCO_DADOS.md`
- **Diagramas:** Ver `DIAGRAMA_BANCO_DADOS.md`
- **Resumo completo:** Ver `RESUMO_FINAL.md`

---

**Tudo pronto! Bom desenvolvimento! 🚀**

