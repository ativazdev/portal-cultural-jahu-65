# 🗄️ Aplicar Migrações do Banco de Dados

## 📋 **Migrações Criadas**

### 1. **20241201000000_create_auth_tables.sql**
- Cria tabelas: `prefeituras`, `pareceristas`, `editais`, `projetos`
- Configura RLS (Row Level Security)
- Cria políticas de acesso

### 2. **20241201000001_create_user_profiles_table.sql**
- Remove tabela `profiles` se existir
- Cria tabela `user_profiles`
- Configura RLS específico para perfis

## 🚀 **Como Aplicar**

### **Opção 1: Via Supabase CLI**
```bash
# Aplicar todas as migrações
supabase db push

# Ou aplicar migração específica
supabase db push --file supabase/migrations/20241201000001_create_user_profiles_table.sql
```

### **Opção 2: Via Supabase Dashboard**
1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Execute o conteúdo de cada migração em ordem:
   - Primeiro: `20241201000000_create_auth_tables.sql`
   - Segundo: `20241201000001_create_user_profiles_table.sql`

## ✅ **Verificar se Funcionou**

### **1. Verificar Tabelas Criadas**
```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('prefeituras', 'user_profiles', 'pareceristas', 'editais', 'projetos');
```

### **2. Verificar RLS Ativo**
```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('prefeituras', 'user_profiles', 'pareceristas', 'editais', 'projetos');
```

### **3. Verificar Políticas RLS**
```sql
-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🔧 **Criar Usuário de Teste**

### **1. Criar Usuário no Supabase Auth**
1. Acesse **Authentication > Users**
2. Clique em **Add user**
3. Preencha:
   - **Email**: `admin@prefeitura.com`
   - **Password**: `admin123`
   - **Email Confirm**: ✅

### **2. Criar Profile do Usuário**
```sql
-- Profile já criado para o usuário existente
-- Usuário: jvsc76@gmail.com (ID: 9b48a645-15cd-4706-94f2-5e0e56e499db)
-- Profile: Administrador - Secretário de Cultura
-- Prefeitura: Prefeitura Municipal de Jaú
```

## 🐛 **Troubleshooting**

### **Erro: Tabela já existe**
- As migrações usam `CREATE TABLE IF NOT EXISTS`
- Não deve dar erro se a tabela já existir

### **Erro: RLS não funciona**
- Verifique se as políticas foram criadas
- Confirme se o usuário tem profile na tabela `user_profiles`

### **Erro: Usuário não consegue fazer login**
- Verifique se o usuário existe no Supabase Auth
- Confirme se o profile foi criado corretamente
- Verifique se a prefeitura está ativa

## 📚 **Próximos Passos**

1. **Aplicar migrações** no Supabase
2. **Criar usuário de teste** no Auth
3. **Criar profile** do usuário
4. **Testar login** no sistema
5. **Verificar funcionalidades** das páginas

---

**🎉 Banco de dados configurado e pronto para uso!**
