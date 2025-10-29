# 🔐 Configuração de Autenticação - Supabase Auth

## ✅ **Sistema Implementado**

O sistema agora usa **Supabase Auth** com profiles de usuários para autenticação completa.

### 🏗️ **Arquitetura Implementada**

1. **Supabase Auth**: Autenticação nativa do Supabase
2. **User Profiles**: Tabela de perfis vinculada aos usuários
3. **Row Level Security (RLS)**: Segurança a nível de linha
4. **Auth Guards**: Proteção de rotas
5. **User Profile Component**: Interface de perfil do usuário

### 📋 **Tabelas Criadas**

- `prefeituras` - Dados das prefeituras
- `user_profiles` - Perfis dos usuários (vinculado ao auth.users)
- `pareceristas` - Pareceristas da prefeitura
- `editais` - Editais de projetos
- `projetos` - Projetos submetidos

### 🔧 **Configuração Necessária**

#### 1. **Configurar Supabase**

```bash
# Instalar dependências
npm install @supabase/supabase-js

# Configurar variáveis de ambiente
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

#### 2. **Executar Migrações**

```bash
# Aplicar migração no Supabase
supabase db push
```

#### 3. **Criar Usuário de Teste**

1. Acesse o painel do Supabase
2. Vá em **Authentication > Users**
3. Clique em **Add user**
4. Preencha:
   - **Email**: `admin@prefeitura.com`
   - **Password**: `admin123`
   - **Email Confirm**: ✅

#### 4. **Criar Profile do Usuário**

Execute no SQL Editor do Supabase:

```sql
-- Substitua 'USER_ID_AQUI' pelo ID do usuário criado
INSERT INTO user_profiles (user_id, prefeitura_id, nome, cargo, telefone) 
VALUES (
  'USER_ID_AQUI', 
  (SELECT id FROM prefeituras WHERE nome = 'Prefeitura de Jau'), 
  'Administrador', 
  'Secretário de Cultura', 
  '(14) 99999-9999'
);
```

### 🚀 **Como Usar**

#### **Login**
1. Acesse `/{nome_prefeitura}/login`
2. Use as credenciais:
   - **Email**: `admin@prefeitura.com`
   - **Senha**: `admin123`

#### **Funcionalidades**
- ✅ **Autenticação**: Login/logout via Supabase Auth
- ✅ **Perfil**: Visualizar e editar perfil do usuário
- ✅ **Proteção**: Rotas protegidas por AuthGuard
- ✅ **Sessão**: Persistência automática da sessão
- ✅ **Segurança**: RLS para isolamento de dados

### 🔒 **Segurança Implementada**

#### **Row Level Security (RLS)**
- Usuários só veem dados da sua prefeitura
- Políticas de acesso baseadas no perfil do usuário
- Isolamento completo entre prefeituras

#### **Auth Guards**
- Redirecionamento automático para login
- Verificação de autenticação em tempo real
- Proteção de todas as rotas da prefeitura

### 📱 **Componentes Criados**

#### **AuthGuard**
```tsx
<AuthGuard>
  <PrefeituraDashboard />
</AuthGuard>
```

#### **UserProfile**
- Dropdown com informações do usuário
- Modal para editar perfil
- Logout integrado

#### **usePrefeituraAuth**
```tsx
const { user, profile, prefeitura, login, logout, updateProfile } = usePrefeituraAuth();
```

### 🎯 **Próximos Passos**

1. **Configurar Supabase** com as variáveis de ambiente
2. **Executar migrações** no banco de dados
3. **Criar usuário de teste** no Supabase Auth
4. **Criar profile** do usuário no banco
5. **Testar o sistema** com as credenciais

### 🐛 **Troubleshooting**

#### **Erro de Login**
- Verifique se o usuário existe no Supabase Auth
- Confirme se o profile foi criado corretamente
- Verifique as variáveis de ambiente

#### **Erro de RLS**
- Confirme se as políticas RLS estão ativas
- Verifique se o usuário tem o profile correto
- Teste as consultas SQL diretamente

#### **Erro de Redirecionamento**
- Verifique se o AuthGuard está envolvendo as rotas
- Confirme se o hook usePrefeituraAuth está funcionando
- Verifique os logs do console

### 📚 **Documentação Adicional**

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Auth Patterns](https://supabase.com/docs/guides/auth/auth-helpers/react)

---

**🎉 Sistema de autenticação completo e seguro implementado!**
