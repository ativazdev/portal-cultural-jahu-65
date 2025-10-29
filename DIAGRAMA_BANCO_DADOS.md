# 📊 Diagrama do Banco de Dados - Portal Cultural Jaú

## 🏗️ Arquitetura de Tabelas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PREFEITURAS                                       │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ id (PK), nome, municipio, estado, cnpj, email, telefone        │         │
│  └────────────────────────────────────────────────────────────────┘         │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ prefeitura_id (FK)
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PROFILES      │  │  PARECERISTAS   │  │  PROPONENTES    │
│  (auth.users)   │  │                 │  │                 │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ user_type       │  │ prefeitura_id   │  │ prefeitura_id   │
│ email           │  │ email           │  │ email           │
│ full_name       │  │ senha_hash      │  │ senha_hash      │
│ prefeitura_id   │  │ nome            │  │ tipo (PF/PJ)    │
│ papel           │  │ cpf             │  │ nome            │
│                 │  │ especialidade[] │  │ cpf/cnpj        │
└─────────────────┘  │ status          │  │ status          │
                     └────────┬────────┘  └────────┬────────┘
                              │                    │
                              │                    │
                              │                    │
┌─────────────────────────────┴────────────────────┴──────────────┐
│                          EDITAIS                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ id (PK), prefeitura_id (FK), codigo, nome, descricao,   │    │
│  │ data_abertura, data_final, status, modalidades[]        │    │
│  └───────────────────────────┬─────────────────────────────┘    │
│                              │                                   │
│                  ┌───────────┴──────────┐                        │
│                  ▼                      ▼                        │
│         ┌────────────────┐    ┌────────────────┐                │
│         │ ARQUIVOS_EDITAL│    │   PROJETOS     │                │
│         ├────────────────┤    ├────────────────┤                │
│         │ id (PK)        │    │ id (PK)        │                │
│         │ edital_id (FK) │    │ prefeitura_id  │                │
│         │ nome, url      │    │ edital_id (FK) │                │
│         └────────────────┘    │ proponente_id  │◄───────┐       │
│                               │ parecerista_id │◄───┐   │       │
│                               │ nome           │    │   │       │
│                               │ modalidade     │    │   │       │
│                               │ valor_solicitado    │   │       │
│                               │ status         │    │   │       │
│                               └───────┬────────┘    │   │       │
│                                       │             │   │       │
│              ┌────────────────────────┼─────────────┼───┘       │
│              │                        │             │           │
│              ▼                        ▼             │           │
│    ┌──────────────────┐    ┌──────────────────┐    │           │
│    │ METAS_PROJETO    │    │ EQUIPE_PROJETO   │    │           │
│    ├──────────────────┤    ├──────────────────┤    │           │
│    │ id (PK)          │    │ id (PK)          │    │           │
│    │ projeto_id (FK)  │    │ projeto_id (FK)  │    │           │
│    │ descricao, ordem │    │ nome, funcao     │    │           │
│    └──────────────────┘    └──────────────────┘    │           │
│                                                     │           │
│              ┌──────────────────────────────────────┘           │
│              │                        │                         │
│              ▼                        ▼                         │
│    ┌──────────────────┐    ┌──────────────────┐                │
│    │ DOCUMENTOS_      │    │ PLANILHA_        │                │
│    │ HABILITACAO      │    │ ORCAMENTARIA     │                │
│    ├──────────────────┤    ├──────────────────┤                │
│    │ id (PK)          │    │ id (PK)          │                │
│    │ projeto_id (FK)  │    │ projeto_id (FK)  │                │
│    │ nome, tipo       │    │ categoria, item  │                │
│    │ status, arquivo  │    │ valor_unitario   │                │
│    └──────────────────┘    └──────────────────┘                │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         AVALIAÇÕES                              │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ id (PK), prefeitura_id, projeto_id (FK),               │     │
│  │ parecerista_id (FK), nota_relevancia,                  │     │
│  │ nota_viabilidade, nota_impacto, nota_orcamento,        │     │
│  │ nota_inovacao, nota_sustentabilidade, nota_final,      │     │
│  │ parecer_tecnico, recomendacao, status                  │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       COMUNICAÇÕES                              │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ id (PK), prefeitura_id, remetente_tipo, remetente_id,  │     │
│  │ destinatario_tipo, destinatario_id, projeto_id (FK),   │     │
│  │ tipo, assunto, mensagem, status, prioridade,           │     │
│  │ resposta, respondido_por_tipo, respondido_por_id       │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                      │
│                          ▼                                      │
│                ┌──────────────────┐                             │
│                │ ANEXOS_          │                             │
│                │ COMUNICACAO      │                             │
│                ├──────────────────┤                             │
│                │ id (PK)          │                             │
│                │ comunicacao_id   │                             │
│                │ nome, url        │                             │
│                └──────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   PRESTAÇÃO DE CONTAS                           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ PRESTACOES_CONTAS                                      │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │ id (PK), prefeitura_id, projeto_id (FK),               │     │
│  │ proponente_id (FK), tipo, valor_executado,             │     │
│  │ data_entrega, prazo_entrega, status,                   │     │
│  │ status_open_banking, parecer_analise                   │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                      │
│                          ▼                                      │
│                ┌──────────────────┐                             │
│                │ MOVIMENTACOES_   │                             │
│                │ FINANCEIRAS      │                             │
│                ├──────────────────┤                             │
│                │ id (PK)          │                             │
│                │ projeto_id (FK)  │                             │
│                │ prestacao_id (FK)│                             │
│                │ tipo, descricao  │                             │
│                │ valor, data      │                             │
│                │ status_validacao │                             │
│                └──────────────────┘                             │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ CONTAS_MONITORADAS (Open Banking)                      │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │ id (PK), prefeitura_id, projeto_id (FK),               │     │
│  │ proponente_id (FK), banco, agencia, conta,             │     │
│  │ consentimento_id, consentimento_ativo, saldo_atual,    │     │
│  │ valor_total_recebido, valor_total_gasto, status        │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               RECUPERAÇÃO DE SENHA                              │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ RECUPERACAO_SENHA_PARECERISTA                          │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │ id (PK), parecerista_id (FK), token, usado,            │     │
│  │ expira_em                                              │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ RECUPERACAO_SENHA_PROPONENTE                           │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │ id (PK), proponente_id (FK), token, usado,             │     │
│  │ expira_em                                              │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔑 Relacionamentos Principais

### 1. Prefeitura → Usuários
```
prefeituras (1) ──────── (*) profiles
prefeituras (1) ──────── (*) pareceristas
prefeituras (1) ──────── (*) proponentes
```

### 2. Prefeitura → Editais → Projetos
```
prefeituras (1) ──────── (*) editais
editais (1) ──────────── (*) projetos
proponentes (1) ─────── (*) projetos
pareceristas (1) ──────  (*) projetos (atribuição)
```

### 3. Projetos → Documentos e Avaliação
```
projetos (1) ──────── (*) metas_projeto
projetos (1) ──────── (*) equipe_projeto
projetos (1) ──────── (*) documentos_habilitacao
projetos (1) ──────── (*) planilha_orcamentaria
projetos (1) ──────── (1) avaliacoes
```

### 4. Projetos → Comunicação e Prestação
```
projetos (1) ──────── (*) comunicacoes
projetos (1) ──────── (*) prestacoes_contas
projetos (1) ──────── (*) movimentacoes_financeiras
projetos (1) ──────── (1) contas_monitoradas
```

## 📝 ENUMs Disponíveis

### status_edital
- `ativo`
- `arquivado`
- `rascunho`

### tipo_proponente
- `PF` (Pessoa Física)
- `PJ` (Pessoa Jurídica)
- `Grupo`
- `COOP` (Cooperativa)

### status_projeto
- `recebido`
- `em_avaliacao`
- `avaliado`
- `aprovado`
- `rejeitado`
- `em_execucao`
- `concluido`

### status_documento
- `pendente`
- `enviado`
- `aprovado`
- `rejeitado`

### status_prestacao
- `pendente`
- `em_analise`
- `aprovado`
- `rejeitado`
- `exigencia`

### status_open_banking
- `conforme`
- `alerta`
- `irregularidade`
- `nao_monitorado`

### tipo_comunicacao
- `recurso`
- `duvida`
- `solicitacao`
- `notificacao`

### status_comunicacao
- `enviado`
- `lido`
- `em_analise`
- `respondido`

### modalidade_cultural
- `musica`
- `teatro`
- `danca`
- `artes_visuais`
- `literatura`
- `cinema`
- `cultura_popular`
- `circo`
- `outros`

### papel_usuario
- `gestor`
- `assistente`
- `financeiro`
- `administrador`

## 🔐 Segurança (RLS)

### Nível de Isolamento por Prefeitura

Todas as tabelas principais incluem `prefeitura_id` e estão isoladas por RLS:

✅ **Isolamento Completo:**
- Editais
- Projetos
- Avaliações
- Comunicações
- Prestações de Contas
- Movimentações Financeiras
- Contas Monitoradas

✅ **Acesso Controlado:**
- Pareceristas: Só veem projetos atribuídos a eles
- Proponentes: Só veem seus próprios projetos
- Prefeitura: Vê tudo da sua prefeitura

## 🚀 Edge Functions

### 1. `cadastrar-parecerista`
**Endpoint:** `POST /functions/v1/cadastrar-parecerista`
- Cadastra novo parecerista
- Criptografa senha com bcrypt
- Valida CPF e email únicos

### 2. `auth-parecerista`
**Endpoint:** `POST /functions/v1/auth-parecerista`
- Autentica parecerista
- Retorna JWT customizado
- Atualiza último acesso

### 3. `cadastrar-proponente`
**Endpoint:** `POST /functions/v1/cadastrar-proponente`
- Cadastra novo proponente (PF/PJ/Grupo/COOP)
- Criptografa senha com bcrypt
- Valida CPF/CNPJ e email únicos

### 4. `auth-proponente`
**Endpoint:** `POST /functions/v1/auth-proponente`
- Autentica proponente
- Retorna JWT customizado
- Atualiza último acesso

## 📊 Índices para Performance

Todos os campos frequentemente usados em queries possuem índices:

- `prefeitura_id` em todas as tabelas principais
- `email` em pareceristas e proponentes
- `cpf` e `cnpj` para buscas rápidas
- `status` em projetos, editais e prestações
- `especialidade` (GIN index para arrays)
- Foreign keys para joins eficientes

## 💾 Triggers Automáticos

### Criptografia de Senhas
- `before_insert_parecerista_criptografar_senha`
- `before_insert_proponente_criptografar_senha`

### Atualização de Timestamps
- `update_prefeituras_updated_at`
- `update_pareceristas_updated_at`
- `update_proponentes_updated_at`
- `update_editais_updated_at`
- `update_projetos_updated_at`
- `update_avaliacoes_updated_at`
- `update_comunicacoes_updated_at`
- `update_prestacoes_updated_at`
- `update_contas_updated_at`
- `update_documentos_updated_at`
- `update_planilha_updated_at`

## 📈 Estatísticas

**Total de Tabelas:** 20+
**Total de Funções:** 10+
**Total de Triggers:** 15+
**Total de Índices:** 40+
**Total de Políticas RLS:** 25+

## 🎯 Fluxo de Dados Principal

```
1. PREFEITURA cria EDITAL
   ↓
2. PROPONENTE se cadastra
   ↓
3. PROPONENTE submete PROJETO para EDITAL
   ↓
4. PREFEITURA atribui PARECERISTA ao PROJETO
   ↓
5. PARECERISTA realiza AVALIAÇÃO
   ↓
6. PREFEITURA aprova/rejeita PROJETO
   ↓
7. PROJETO APROVADO inicia execução
   ↓
8. PROPONENTE registra MOVIMENTAÇÕES FINANCEIRAS
   ↓
9. Sistema monitora via OPEN BANKING
   ↓
10. PROPONENTE envia PRESTAÇÃO DE CONTAS
    ↓
11. PREFEITURA analisa e aprova PRESTAÇÃO
```

## 🔄 Multi-Tenant

Todo o sistema é **multi-tenant** baseado em `prefeitura_id`. Isso significa:

- Múltiplas prefeituras podem usar o mesmo banco
- Dados são completamente isolados entre prefeituras
- RLS garante que nenhuma prefeitura veja dados de outra
- Ideal para expansão futura do sistema

