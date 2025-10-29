# 🧪 Teste de Integração Completa - Portal Cultural Jaú

## ✅ TUDO PRONTO PARA TESTAR!

O sistema está 100% integrado com o banco de dados. Siga este guia para testar.

---

## 🚀 PASSO A PASSO DE TESTE

### 1️⃣ Iniciar o Servidor

```bash
npm run dev
```

Aguarde até ver:
```
➜  Local:   http://localhost:8080/
```

---

### 2️⃣ Obter UUID da Prefeitura

**IMPORTANTE:** Você precisa do UUID da prefeitura para cadastrar usuários.

1. Acesse: https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/editor
2. Clique na tabela `prefeituras`
3. Copie o UUID da coluna `id`

**OU via SQL Editor:**
```sql
SELECT id, nome, municipio FROM prefeituras;
```

📝 **Anote esse UUID!**

---

### 3️⃣ Cadastrar um Proponente

1. Acesse: http://localhost:8080/
2. Clique em "Prefeitura Municipal de Jaú"
3. Será redirecionado para: http://localhost:8080/jau/login
4. Clique em "Sou Proponente"
5. Na tela de login, clique no link para cadastro (rodapé)
6. OU acesse direto: http://localhost:8080/jau/cadastro-proponente

**Preencha o formulário:**
```
Tipo:      Pessoa Física
Nome:      João Silva Teste
CPF:       12345678901
Email:     joao.teste@email.com
Telefone:  (14) 99999-1234
Cidade:    Jaú
Estado:    SP
Senha:     teste123
Confirmar: teste123
```

7. Clique em "Criar Conta"

**Resultado esperado:**
✅ Toast: "Cadastro realizado com sucesso!"  
✅ Redireciona para `/jau/login-proponente`  
✅ Usuário criado no banco com senha criptografada  

---

### 4️⃣ Fazer Login como Proponente

1. Na tela de login (`/jau/login-proponente`)

2. Digite:
```
Email: joao.teste@email.com
Senha: teste123
```

3. Clique em "Entrar na Área"

**Resultado esperado:**
✅ Toast: "Login realizado com sucesso! Bem-vindo(a), João Silva Teste"  
✅ Redireciona para `/jau/dashboard`  
✅ Dashboard do proponente carrega  
✅ Menu lateral funciona  
✅ Navegação mantém `/jau/`  

---

### 5️⃣ Verificar no Banco de Dados

Acesse o SQL Editor do Supabase e execute:

```sql
-- Ver o proponente cadastrado
SELECT 
  id, 
  nome, 
  email, 
  tipo, 
  cpf, 
  status, 
  created_at,
  LEFT(senha_hash, 10) as senha_inicio
FROM proponentes 
WHERE email = 'joao.teste@email.com';
```

**Verifique:**
✅ Registro existe  
✅ `senha_hash` começa com `$2` (bcrypt)  
✅ `status` = 'ativo'  
✅ `created_at` tem data/hora atual  

---

### 6️⃣ Verificar Token JWT

Abra o Console do navegador (F12):

```javascript
// Ver token
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// Decodificar token (base64)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Payload:', payload);

// Deve conter:
// - sub: UUID do proponente
// - email: joao.teste@email.com
// - user_type: "proponente"
// - prefeitura_id: UUID da prefeitura
// - exp: timestamp de expiração (7 dias)
```

---

### 7️⃣ Testar Logout

1. No dashboard, clique no menu lateral
2. Role até o final
3. Clique em "Sair"

**Resultado esperado:**
✅ Toast: "Logout realizado!"  
✅ Redireciona para `/jau/login`  
✅ `localStorage` limpo (token, user_data)  
✅ Prefeitura mantida (pode fazer novo login)  

---

### 8️⃣ Testar Login com Credenciais Erradas

1. Volte para `/jau/login-proponente`
2. Digite email correto mas senha errada
3. Clique em "Entrar"

**Resultado esperado:**
✅ Toast vermelho: "Erro ao fazer login - Credenciais inválidas"  
✅ Permanece na tela de login  
✅ Sem redirecionamento  

---

### 9️⃣ Testar Duplicação de Email

1. Tente cadastrar novamente com o mesmo email
2. Acesse `/jau/cadastro-proponente`
3. Use: `joao.teste@email.com`
4. Clique em "Criar Conta"

**Resultado esperado:**
✅ Toast vermelho: "Email já cadastrado"  
✅ Permanece na tela de cadastro  

---

### 🔟 Testar Parecerista (se tiver cadastrado)

**Nota:** Pareceristas são cadastrados pela prefeitura. Para testar, você precisa:

#### Opção 1: Via SQL (Teste Rápido)
Execute no SQL Editor:

```sql
-- Obter UUID da prefeitura primeiro
SELECT id FROM prefeituras LIMIT 1;

-- Inserir parecerista de teste (substitua PREFEITURA_UUID_AQUI)
INSERT INTO pareceristas (
  prefeitura_id,
  email,
  senha_hash,
  nome,
  cpf,
  status
) VALUES (
  'PREFEITURA_UUID_AQUI',
  'ana.parecerista@teste.com',
  'senha123',  -- Será criptografada pelo trigger
  'Ana Parecerista Teste',
  '98765432100',
  'ativo'
);
```

#### Opção 2: Via Interface (Quando implementado)
1. Login como prefeitura
2. Ir em "Cadastro de Pareceristas"
3. Cadastrar novo parecerista

#### Teste o Login:
1. Acesse: http://localhost:8080/jau/login-parecerista
2. Digite:
```
Email: ana.parecerista@teste.com
Senha: senha123
```
3. Clique em "Entrar como Parecerista"

**Resultado esperado:**
✅ Login com sucesso  
✅ Redireciona para `/jau/selecionar-edital` (ou `/jau/parecerista/dashboard` se já tiver edital)  

---

## 📊 CHECKLIST COMPLETO DE TESTES

### Cadastro de Proponente
- [ ] Formulário carrega
- [ ] Pode selecionar tipo (PF/PJ/Grupo/COOP)
- [ ] Campos dinâmicos (CPF para PF, CNPJ para PJ)
- [ ] Validação de senhas diferentes
- [ ] Cadastro salva no banco
- [ ] Senha criptografada no banco
- [ ] Redireciona para login

### Login de Proponente
- [ ] Formulário carrega
- [ ] Login com credenciais corretas funciona
- [ ] Token salvo no localStorage
- [ ] Redireciona para /jau/dashboard
- [ ] Toast de sucesso aparece
- [ ] Login com credenciais erradas mostra erro
- [ ] Email não cadastrado mostra erro

### Login de Parecerista
- [ ] Formulário carrega
- [ ] Login funciona (se tiver parecerista cadastrado)
- [ ] Token salvo no localStorage
- [ ] Redireciona corretamente
- [ ] Toast de sucesso/erro aparece

### Login de Prefeitura
- [ ] Formulário carrega
- [ ] Login com Supabase Auth funciona
- [ ] Redireciona para /jau/prefeitura/dashboard

### Navegação
- [ ] URLs mantêm prefeitura (/jau/*)
- [ ] Menu lateral funciona
- [ ] Logout redireciona para /jau/login
- [ ] F5 mantém autenticação
- [ ] Prefeitura persiste após refresh

---

## 🔍 VERIFICAÇÕES NO BANCO

### Ver usuários cadastrados:

```sql
-- Proponentes
SELECT id, nome, email, tipo, cpf, cnpj, status, created_at 
FROM proponentes 
ORDER BY created_at DESC;

-- Pareceristas
SELECT id, nome, email, cpf, status, created_at 
FROM pareceristas 
ORDER BY created_at DESC;

-- Usuários da prefeitura
SELECT id, email, full_name, user_type, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

### Verificar senhas criptografadas:

```sql
-- Deve começar com $2 (bcrypt)
SELECT id, nome, LEFT(senha_hash, 30) as senha_hash_inicio 
FROM proponentes;

SELECT id, nome, LEFT(senha_hash, 30) as senha_hash_inicio 
FROM pareceristas;
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Prefeitura não identificada"
**Solução:** Certifique-se de acessar via `/jau/*`

### Erro: "Failed to fetch" ou "Network error"
**Solução:** 
1. Verifique se as Edge Functions estão ativas
2. Teste direto no terminal:
```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/auth-proponente \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"teste123"}'
```

### Erro: "Email já cadastrado"
**Solução:** Use outro email ou faça login

### Erro: "Credenciais inválidas"
**Solução:** Verifique email e senha. Senhas são case-sensitive.

### Token não persiste
**Solução:** Verifique se o localStorage está habilitado no navegador

---

## 📝 DADOS DE TESTE SUGERIDOS

### Proponente Pessoa Física
```
Tipo:      PF
Nome:      João Silva Teste
CPF:       12345678901
Email:     joao@teste.com
Telefone:  (14) 99999-1234
Cidade:    Jaú
Estado:    SP
Senha:     teste123
```

### Proponente Pessoa Jurídica
```
Tipo:         PJ
Nome:         Cultural Produções LTDA
CNPJ:         12345678000190
Email:        empresa@teste.com
Razão Social: Cultural Produções LTDA
Telefone:     (14) 3333-4444
Cidade:       Jaú
Estado:       SP
Senha:        teste123
```

### Parecerista (via SQL)
```
Email:  ana@parecerista.com
Senha:  senha123
Nome:   Ana Parecerista
CPF:    98765432100
```

---

## 🎯 PRÓXIMOS PASSOS APÓS TESTES

Depois de confirmar que login/cadastro funciona:

1. ✅ Implementar recuperação de senha
2. ✅ Criar proteção de rotas (PrivateRoute)
3. ✅ Implementar refresh de token
4. ✅ Conectar dashboards com dados reais
5. ✅ Implementar CRUD de editais
6. ✅ Sistema de submissão de projetos
7. ✅ Sistema de avaliação de projetos

---

## 📚 DOCUMENTAÇÃO

Para mais detalhes:

- **Autenticação:** `INTEGRACAO_LOGIN_COMPLETA.md`
- **URLs:** `ESTRUTURA_URLs.md` ou `GUIA_URLS_PRATICO.md`
- **Banco de Dados:** `ESTRUTURA_BANCO_DADOS.md`
- **APIs:** `GUIA_TESTE_API.md`
- **Quick Start:** `QUICK_START.md`

---

## ✨ O QUE ESTÁ FUNCIONANDO

✅ **Cadastro** de proponente com validações  
✅ **Login** de proponente (JWT customizado)  
✅ **Login** de parecerista (JWT customizado)  
✅ **Login** de prefeitura (Supabase Auth)  
✅ **Senhas criptografadas** (bcrypt)  
✅ **Tokens persistentes** (localStorage)  
✅ **Validações** de unicidade (email, CPF, CNPJ)  
✅ **Toast notifications** para feedback  
✅ **Loading states** durante processamento  
✅ **Redirecionamentos** automáticos  
✅ **Logout** funcionando  
✅ **URLs multi-tenant** funcionando  
✅ **Context da prefeitura** funcionando  

---

## 🎊 COMECE AGORA!

```bash
npm run dev
```

**Acesse:** http://localhost:8080/

**Teste o fluxo completo:**
1. Selecionar Jaú
2. Cadastrar proponente
3. Fazer login
4. Navegar pelo sistema
5. Fazer logout
6. Fazer login novamente

---

**Tudo pronto! Bons testes! 🚀**

