# Portal Cultural Jahu - Manual Técnico e Operacional Completo

O **Portal Cultural Jahu** é a solução definitiva para a gestão de políticas públicas de fomento à cultura. A plataforma automatiza o ciclo completo das leis de incentivo (como a Lei Paulo Gustavo e PNAB), garantindo que cada centavo do recurso público seja rastreado, avaliado tecnicamente e prestado contas com transparência total.

---

## 🏛️ Jornadas de Usuário e Regras de Negócio

A aplicação é dividida em três grandes módulos independentes, mas que se comunicam via status de projeto e banco de dados unificado.

### 1. Módulo do Proponente (O Fluxo do Artista)
O proponente acessa um portal focado na simplicidade para reduzir a barreira de entrada ao fomento.
- **Wizard de Inscrição Inteligente**: O envio de um projeto é validado em tempo real em 5 dimensões:
    - **Identificação**: Nome, objetivos e justificativa cultural.
    - **Acessibilidade**: Detalhamento obrigatório de medidas Arquitetônicas (ex: rampas), Comunicacionais (ex: Libras) e Atitudinais (ex: capacitação anti-capacitista).
    - **Democratização**: Perfil do público priorizando minorias e grupos vulneráveis.
    - **Cronograma de Execução**: Localização geográfica e datas (com validação para não permitir datas retroativas).
    - **Orçamento Detalhado**: Itens com valor unitário e quantidade, cujo total é validado contra o teto máximo permitido pelo edital.
- **Ciclo de Ajustes (Diligências)**: Se a gestão encontrar um erro no documento, o proponente recebe um alerta visual de pulso e deve responder anexando o arquivo correto.

---

### 2. Módulo do Parecerista (A Avaliação Técnica)
Avaliadores externos têm uma visão focada em produtividade.
- **Seleção por Edital**: O avaliador visualiza dashboards específicos para cada edital onde está alocado.
- **Ficha de Avaliação Técnica**:
    - **Critérios Dinâmicos**: Os critérios não são fixos; cada edital pode definir seus próprios pesos e descrições (ex: Mérito, Viabilidade, Impacto).
    - **Justificativa por Item**: O sistema bloqueia o envio da nota se não houver um parecer qualitativo para cada critério.
    - **Normalização de Nota**: O sistema processa a soma dos critérios (base 70 ou 100) e aplica os bônus de cotas por cima do valor base.
- **Consolidação por Edge Function**: A nota final é calculada no servidor para evitar manipulações no frontend.

---

### 3. Módulo da Prefeitura (A Gestão e Controle)
O administrador tem o "painel de comando" de toda a cultura municipal.
- **Configurador de Editais**:
    - **Prorrogação de Prazos**: Botão de salvamento rápido para estender a data de envio sem precisar recriar o edital.
    - **Modelos (Templates)**: Pré-configurações baseadas em legislações federais (PNAB/LPG).
    - **Tipos de Edital**: Editais comuns ou editais exclusivos para Prestação de Contas (projetos especiais).
- **Habilitação e Classificação**:
    - Ferramenta de conferência de documentos de habilitação (CPF, Certidões).
    - Botão de "Inabilitar" ou "Desclassificar" com registro de motivo legal.
- **Auditoria Financeira**: Visualização de movimentações bancárias (via OpenBanking) vinculadas ao CNPJ do proponente para conferência automática de notas fiscais.

---

## 🔒 Arquitetura Técnica e Segurança de Dados

### Segurança ao Nível de Registro (RLS)
O banco de dados Supabase é protegido por políticas de RLS que impedem vazamento de dados:
- **Isolamento Multitenant**: Embora todos os dados estejam na mesma tabela, uma prefeitura JAMAIS acessa os dados de outra através de filtros de `prefeitura_id` embutidos no token JWT.
- **Proteção de Dados Sensíveis**: Documentos pessoais dos proponentes só são acessíveis ao próprio dono e ao gestor habilitado.

### Normalização de Storage (Arquivos)
Para evitar que o gestor baixe arquivos com nomes genéricos (ex: `documento1.pdf`), o sistema renomeia tudo no download:
- **Nomenclatura**: `[Protocolo CMP] - [Nome Amigável].pdf`
- Isso permite a organização automática em pastas locais por projeto.

### Edge Functions (Deno Runtime)
Lógicas cruciais de negócio rodam em Deno para garantir performance e segurança:
- `atualizar-avaliacao-final`: Garante que a média do projeto seja atualizada instantaneamente após o parecer do último avaliador.
- `enviar-email-parecerista`: Automação de notificações para manter o fluxo de avaliação no prazo.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Vite, TypeScript.
- **Estilização**: Tailwind CSS (Design System Premium Slate & Deep Blue).
- **Componentes**: shadcn/ui.
- **Cloud/Backend**: Supabase (Auth, DB, Storage, Edge Functions).
- **Notificações**: Toast alerts nativos e indicadores de pulso em tempo real.

---
*Documentação Oficial - Portal Cultural Jahu v2.5 - Fevereiro 2026*
