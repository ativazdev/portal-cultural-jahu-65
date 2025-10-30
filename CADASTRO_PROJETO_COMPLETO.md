# Cadastro de Projeto - Implementação Completa

## ✅ Implementado

### Tela de Cadastro de Projeto
- **Rota**: `/:nomePrefeitura/proponente/editais/:editalId/cadastrar-projeto`
- **Arquivo**: `src/pages/ProponenteCadastrarProjeto.tsx`

### Funcionalidades Implementadas

#### 1. **Formulário Multi-Step**
   - 10 etapas de cadastro:
     1. Informações Básicas (nome, modalidade, descrição, objetivos)
     2. Público e Acessibilidade
     3. Acessibilidade Comunicacional e Atitudinal
     4. Cronograma e Local
     5. Proponente
     6. Valor e Financiamento
     7. Equipe do Projeto
     8. Atividades Planejadas
     9. Metas do Projeto
     10. Orçamento Detalhado

#### 2. **Gestão de Rascunho**
   - Salvamento de rascunho a qualquer momento
   - Verificação automática de rascunho existente
   - Opção de continuar rascunho ou criar novo
   - Botão "Apagar projeto e criar novo"

#### 3. **Validações Implementadas**
   - Campos obrigatórios (nome, modalidade, descrição, objetivos, proponente, valor)
   - Validação de valor máximo do edital
   - Validação de total de orçamento vs valor solicitado
   - Máscaras para CPF/CNPJ em membros da equipe

#### 4. **Funcionalidades de Itens Dinâmicos**
   - Adicionar/remover membros da equipe
   - Adicionar/remover atividades planejadas
   - Adicionar/remover metas do projeto
   - Adicionar/remover itens de orçamento

#### 5. **UX/UI**
   - Indicador visual de progresso (steps)
   - Navegação entre steps
   - Loading states em botões
   - Mensagens de erro contextuais
   - Design consistente com o restante da aplicação

### Validações e Regras de Negócio

1. **Só é possível ter um projeto em rascunho por edital**
2. **Ao inscrever, o status muda para `aguardando_avaliacao`**
3. **Total do orçamento deve ser igual ao valor solicitado**
4. **Valor solicitado não pode exceder o máximo do edital**
5. **Atividades são ordenadas automaticamente por data**

### Pendências Importantes

#### ⚠️ Edge Function Auth-Usuario-Proponente
A edge function `auth-usuario-proponente` foi atualizada para usar `SUPABASE_JWT_SECRET` ao invés de `JWT_SECRET`, mas **precisa ser deployada manualmente** via Dashboard do Supabase.

**Como fazer o deploy:**
1. Acesse: https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy
2. Vá em **Edge Functions** → `auth-usuario-proponente`
3. Faça o deploy da nova versão

**O que foi alterado:**
- Uso de `SUPABASE_JWT_SECRET` ao invés de `JWT_SECRET`
- Adição de `role: 'authenticated'` no payload do JWT
- Correção do algoritmo HS256

#### ✅ RLS Políticas Já Configuradas
As políticas RLS para a tabela `duvidas` já foram aplicadas e estão funcionando com JWT customizado usando `auth.jwt()`.

## Estrutura de Dados

### Tabelas Utilizadas
- `projetos` - Dados principais do projeto
- `equipe_projeto` - Membros da equipe
- `atividades_projeto` - Cronograma de atividades
- `metas_projeto` - Metas do projeto
- `itens_orcamento_projeto` - Itens de orçamento detalhado
- `proponentes` - Dados do proponente
- `editais` - Dados do edital

### Status do Projeto
- `rascunho` - Projeto em edição
- `aguardando_avaliacao` - Projeto inscrito e aguardando avaliação

## Próximos Passos

1. **Deploy da Edge Function** (manual via Dashboard)
2. **Teste completo do fluxo** de cadastro e inscrição
3. **Validações adicionais** conforme feedback dos usuários

## Observações

- A tela utiliza o layout `ProponenteLayout` para consistência
- Todas as operações de banco são feitas com autenticação customizada via `useProponenteAuth`
- O formulário é totalmente responsivo

