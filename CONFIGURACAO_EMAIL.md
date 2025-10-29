# Configuração de E-mail - Resend

## Visão Geral

O sistema de envio de e-mails para pareceristas utiliza o serviço **Resend** para garantir entregabilidade e profissionalismo nas comunicações.

## Configuração Necessária

### 1. Obter API Key do Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta ou faça login
3. Vá para "API Keys" no dashboard
4. Crie uma nova API Key
5. Copie a chave gerada

### 2. Configurar no Supabase

1. Acesse o dashboard do Supabase
2. Vá para "Settings" > "Edge Functions"
3. Na seção "Environment Variables", adicione:
   - **Nome**: `RESEND_API_KEY`
   - **Valor**: Sua API Key do Resend

### 3. Configurar Domínio (Opcional)

Para melhor entregabilidade, configure um domínio personalizado:

1. No dashboard do Resend, vá para "Domains"
2. Adicione seu domínio (ex: `portalcultural.com.br`)
3. Configure os registros DNS conforme instruções
4. Atualize o campo `from` na Edge Function

## Funcionalidades

### E-mail de Cadastro de Parecerista

**Quando é enviado**: Automaticamente quando um novo parecerista é cadastrado

**Conteúdo do e-mail**:
- Boas-vindas personalizadas
- Informações do cadastro
- Credenciais de acesso (email + senha temporária)
- Especialidades selecionadas
- Instruções para primeiro acesso
- Identificação da prefeitura

**Template HTML**:
- Design responsivo e profissional
- Cores da marca (azul)
- Informações organizadas em seções
- Badges para especialidades
- Box destacado para credenciais
- Avisos importantes

## Estrutura dos Dados

### Entrada da API

```typescript
interface EmailPareceristaRequest {
  parecerista: {
    nome: string;
    email: string;
    especialidade: string[];
    prefeitura_nome: string;
  };
  credenciais: {
    email: string;
    senha: string;
  };
}
```

### Resposta da API

```typescript
interface EmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
}
```

## Segurança

### Geração de Senha

- Senhas temporárias de 8 caracteres
- Combinação de letras maiúsculas, minúsculas e números
- Senhas são enviadas por e-mail (não armazenadas em log)

### Validações

- Verificação de campos obrigatórios
- Validação de formato de e-mail
- Tratamento de erros com fallback

## Monitoramento

### Logs

- Todos os envios são logados no Supabase
- IDs de e-mail do Resend para rastreamento
- Tratamento de erros detalhado

### Métricas

- Taxa de entrega
- Abertura de e-mails (se configurado no Resend)
- Erros de envio

## Troubleshooting

### E-mail não enviado

1. Verifique se `RESEND_API_KEY` está configurada
2. Confirme se a API Key tem permissões corretas
3. Verifique logs da Edge Function no Supabase

### E-mail não entregue

1. Verifique se o domínio está configurado no Resend
2. Confirme registros DNS
3. Verifique se o e-mail não está na caixa de spam

### Erro de autenticação

1. Regenerar API Key no Resend
2. Atualizar variável de ambiente no Supabase
3. Fazer redeploy da Edge Function

## Custos

### Resend

- **Free Tier**: 3.000 e-mails/mês
- **Pro**: $20/mês para 50.000 e-mails
- **Enterprise**: Contato direto

### Supabase

- Edge Functions: Incluído no plano
- Logs: Incluído no plano

## Exemplo de Uso

```typescript
// No frontend
await emailService.enviarEmailParecerista({
  parecerista: {
    nome: "João Silva",
    email: "joao@email.com",
    especialidade: ["musica", "teatro"],
    prefeitura_nome: "Prefeitura Municipal de Jaú"
  },
  credenciais: {
    email: "joao@email.com",
    senha: "Temp123!"
  }
});
```

## Próximos Passos

1. **Configurar domínio personalizado** para melhor entregabilidade
2. **Adicionar tracking** de abertura de e-mails
3. **Implementar templates** para outros tipos de e-mail
4. **Configurar webhooks** para notificações de entrega
5. **Adicionar internacionalização** para múltiplos idiomas
