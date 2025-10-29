# 🚀 TESTE AGORA - Portal Cultural Jaú

## ✅ TUDO PRONTO! VAMOS TESTAR!

---

## 🎯 PASSO 1: Iniciar o Servidor

```bash
npm run dev
```

Aguarde até ver:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🎯 PASSO 2: Acessar no Navegador

Abra: **http://localhost:5173/**

Você verá:
```
┌─────────────────────────────────────────┐
│   Portal Cultural PNAB                  │
│   Selecione sua prefeitura              │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │  🏛️ Prefeitura Municipal de Jaú │  │
│   │  Jaú - SP                       │  │
│   │  [Acessar Sistema]              │  │
│   └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🎯 PASSO 3: Selecionar Jaú

Clique em **"Acessar Sistema"** no card de Jaú.

A URL mudará para: **http://localhost:5173/jau/login**

---

## 🎯 PASSO 4: Fazer Login

Na tela de login, você verá 3 abas:
- **Proponente**
- **Parecerista** 
- **Prefeitura**

**Teste qualquer uma!** (Sistema ainda usa mock de autenticação)

Após login:
- **Proponente** → `/jau/dashboard`
- **Parecerista** → `/jau/parecerista/dashboard` (ou `/jau/selecionar-edital` se sem edital)
- **Prefeitura** → `/jau/prefeitura/dashboard`

---

## 🎯 PASSO 5: Navegar pelo Sistema

### Como Proponente:
1. Clique no menu lateral
2. Vá em "Meus Projetos" → URL: `/jau/meus-projetos`
3. Vá em "Nova Proposta" → URL: `/jau/nova-proposta`
4. **Observe que todas as URLs mantêm `/jau/` no início!**

### Como Parecerista:
1. Selecione um edital (se necessário)
2. Vá em "Projetos para Avaliar" → URL: `/jau/parecerista/projetos-avaliar`
3. Vá em "Meu Perfil" → URL: `/jau/parecerista/meu-perfil`

### Como Prefeitura:
1. Vá em "Editais" → URL: `/jau/prefeitura/editais`
2. Vá em "Projetos" → URL: `/jau/prefeitura/projetos`
3. Vá em "Pareceristas" → URL: `/jau/prefeitura/cadastro-pareceristas`

---

## 🎯 PASSO 6: Testar Persistência

1. Navegue para qualquer página (ex: `/jau/meus-projetos`)
2. Pressione **F5** (refresh)
3. A página deve carregar normalmente
4. A prefeitura "Jaú" deve ser mantida

---

## 🎯 PASSO 7: Testar URL Direta

1. Cole na barra de endereços:
```
http://localhost:5173/jau/dashboard
```

2. A página deve carregar
3. O contexto da prefeitura deve funcionar
4. Navegação deve funcionar normalmente

---

## 🎯 PASSO 8: Testar Prefeitura Inválida

1. Cole na barra de endereços:
```
http://localhost:5173/cidade-inexistente/login
```

2. Deve exibir erro: "Prefeitura Não Encontrada"
3. Deve redirecionar automaticamente para `/`

---

## ✅ Checklist de Testes

- [ ] Servidor iniciado com `npm run dev`
- [ ] Página inicial mostra lista de prefeituras
- [ ] Clicar em Jaú redireciona para `/jau/login`
- [ ] Login funciona (mock)
- [ ] Dashboard carrega com URL `/jau/dashboard`
- [ ] Menu lateral tem links com `/jau/`
- [ ] Navegação mantém contexto da prefeitura
- [ ] F5 mantém a prefeitura
- [ ] URL direta funciona
- [ ] Prefeitura inválida mostra erro

---

## 🐛 Resolução de Problemas

### Erro: "usePrefeitura deve ser usado dentro de um PrefeituraProvider"
**Causa:** Componente usado fora do Provider.  
**Solução:** Verifique se o App.tsx tem `<PrefeituraProvider>` envolvendo tudo.

### Erro: Página em branco
**Causa:** Possível erro no console.  
**Solução:** Abra o Console do navegador (F12) e veja o erro.

### URLs sem prefeitura
**Causa:** Componente não usa `getUrl()`.  
**Solução:** Sempre use `usePrefeituraUrl()` e `getUrl()`.

### Prefeitura não carrega
**Causa:** Banco pode não ter o registro.  
**Solução:** Execute no SQL Editor:
```sql
SELECT id, nome, municipio FROM prefeituras;
```

---

## 📊 Console do Navegador

Abra o Console (F12) e execute:

```javascript
// Ver prefeitura atual
const prefeitura = JSON.parse(localStorage.getItem('prefeitura_atual'));
console.log(prefeitura);

// Ver estrutura
console.log('Slug:', prefeitura?.slug);
console.log('UUID:', prefeitura?.id);
console.log('Nome:', prefeitura?.nome);
```

---

## 🎨 Estrutura Visual

```
┌─────────────────────────────────────────────────────┐
│  / (Raiz)                                          │
│  └─ SelecionarPrefeitura                           │
│     ├─ Jaú                                         │
│     ├─ São Paulo                                   │
│     └─ Outras...                                   │
└─────────────────────────────────────────────────────┘
                    ↓ Seleciona Jaú
┌─────────────────────────────────────────────────────┐
│  /jau/*                                            │
│  └─ PrefeituraRouteWrapper (carrega contexto)      │
│     ├─ /login          → Index                     │
│     ├─ /dashboard      → Dashboard (Proponente)    │
│     ├─ /parecerista/*  → Páginas de Parecerista    │
│     └─ /prefeitura/*   → Páginas de Admin          │
└─────────────────────────────────────────────────────┘
```

---

## 🎉 Resultado Esperado

Após todos os testes, você terá:

✅ Sistema funcionando com URLs multi-tenant  
✅ Navegação mantendo contexto da prefeitura  
✅ Persistência funcionando (refresh)  
✅ Validação de prefeituras inválidas  
✅ 3 áreas distintas: proponente, parecerista, admin  

---

## 📞 Próximos Passos

Depois de testar a estrutura de URLs:

1. ✅ Integrar autenticação real (pareceristas e proponentes)
2. ✅ Carregar dados do banco filtrados por `prefeitura_id`
3. ✅ Implementar formulários de cadastro
4. ✅ Implementar sistema de login customizado
5. ✅ Testar com múltiplas prefeituras

---

## 🚀 Comandos Rápidos

```bash
# Iniciar servidor
npm run dev

# Em outro terminal: ver estrutura
ls -la src/contexts/
ls -la src/pages/SelecionarPrefeitura.tsx
```

---

**Tudo pronto! Inicie o servidor e teste!** 🎊

**Comando:** `npm run dev`
**URL:** http://localhost:5173/

