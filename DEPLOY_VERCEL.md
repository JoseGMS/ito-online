# Guia de Deploy na Vercel

Este guia detalha como fazer o deploy do projeto ITO na Vercel.

## Pré-requisitos

- ✅ Projeto Supabase configurado (ver [SETUP_SUPABASE.md](SETUP_SUPABASE.md))
- ✅ Conta no GitHub
- ✅ Conta na Vercel (pode criar usando sua conta GitHub)

## Passo 1: Preparar o Repositório Git

### 1.1 Inicializar Git (se ainda não foi feito)

```bash
git init
```

### 1.2 Adicionar arquivos ao Git

```bash
git add .
git commit -m "Initial commit: ITO game implementation"
```

### 1.3 Criar repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **New repository**
3. Preencha:
   - **Repository name**: ito-online (ou outro nome)
   - **Description**: "Jogo online de pistas e ordenação inspirado em ITO"
   - **Visibility**: Public ou Private (sua escolha)
4. **NÃO** marque "Initialize with README" (já temos um)
5. Clique em **Create repository**

### 1.4 Conectar e fazer push

```bash
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/ito-online.git
git branch -M main
git push -u origin main
```

## Passo 2: Deploy na Vercel

### 2.1 Criar conta na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Sign Up**
3. Escolha **Continue with GitHub**
4. Autorize a Vercel a acessar sua conta GitHub

### 2.2 Importar Projeto

1. No dashboard da Vercel, clique em **Add New...**
2. Selecione **Project**
3. Encontre o repositório `ito-online` na lista
4. Clique em **Import**

### 2.3 Configurar Projeto

Na tela de configuração:

**Project Name**
- Deixe como está ou escolha outro nome

**Framework Preset**
- Deve detectar automaticamente: **Next.js**

**Root Directory**
- Deixe em branco (`.`)

**Build Command**
- Deixe padrão: `npm run build`

**Output Directory**
- Deixe padrão: `.next`

### 2.4 Configurar Variáveis de Ambiente

Esta é a parte **MAIS IMPORTANTE**!

1. Clique em **Environment Variables**
2. Adicione as seguintes variáveis:

**Variável 1:**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Sua URL do Supabase (ex: `https://xxxxxxxxxx.supabase.co`)
- **Environments**: Marque todos (Production, Preview, Development)

**Variável 2:**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Sua chave anon/public do Supabase
- **Environments**: Marque todos (Production, Preview, Development)

### 2.5 Fazer Deploy

1. Clique em **Deploy**
2. Aguarde o build completar (2-5 minutos)
3. Quando terminar, você verá:
   - ✅ Confetes e "Congratulations!"
   - 🔗 Um link para seu site (ex: `ito-online.vercel.app`)

## Passo 3: Testar o Deploy

1. Clique no link do seu site
2. Teste criar uma sala
3. Abra em outra aba/dispositivo e entre na sala
4. Verifique se o realtime funciona

## Passo 4: Configurar Domínio Personalizado (Opcional)

### 4.1 Adicionar Domínio

1. No dashboard do projeto na Vercel
2. Vá em **Settings** → **Domains**
3. Clique em **Add**
4. Digite seu domínio (ex: `ito.seusite.com`)

### 4.2 Configurar DNS

1. Vá no painel do seu provedor de domínio
2. Adicione um registro CNAME:
   - **Name**: `ito` (ou `@` se for domínio raiz)
   - **Value**: `cname.vercel-dns.com`
3. Aguarde propagação (pode levar até 48h, geralmente é mais rápido)

## Passo 5: Deploys Automáticos

A Vercel configura automaticamente:

### Deploy de Produção
- **Quando**: Você faz push para a branch `main`
- **URL**: Seu domínio principal (ex: `ito-online.vercel.app`)

### Deploy de Preview
- **Quando**: Você cria um Pull Request
- **URL**: URL única para cada PR (ex: `ito-online-git-feature-user.vercel.app`)

## Comandos Úteis

### Re-deployar

Se precisar fazer um redeploy sem mudanças:

1. Dashboard Vercel → Seu projeto
2. Aba **Deployments**
3. Clique nos três pontos (...) no último deploy
4. Clique em **Redeploy**

### Ver Logs

Para debugar problemas:

1. Dashboard Vercel → Seu projeto
2. Aba **Deployments**
3. Clique no deployment
4. Veja os logs de Build e Runtime

## Troubleshooting

### Build falhou

**Erro: "Module not found"**
```bash
# Localmente, verifique se instalou todas as dependências
npm install
npm run build
```

**Erro de TypeScript**
```bash
# Localmente, verifique erros de tipo
npm run build
```

### Site carrega mas dá erro ao conectar com Supabase

1. Verifique as variáveis de ambiente na Vercel
2. Settings → Environment Variables
3. Certifique-se que:
   - As chaves estão corretas
   - Não há espaços extras
   - Marcou todos os ambientes (Production, Preview, Development)

### Realtime não funciona

1. Verifique se habilitou Realtime no Supabase
2. Database → Replication → Ative para tables: rooms, players, chat_messages

### Erro 404 em rotas dinâmicas

- Next.js + Vercel devem funcionar automaticamente
- Se der problema, verifique se a estrutura de pastas está correta:
  - `app/room/[code]/page.tsx`

## Monitoramento

### Analytics da Vercel

1. Dashboard → Seu projeto
2. Aba **Analytics**
3. Veja:
   - Visitors
   - Top pages
   - Top referrers
   - Devices

### Logs em Tempo Real

1. Dashboard → Seu projeto
2. Aba **Logs**
3. Veja logs de:
   - Functions (API routes)
   - Edge Functions
   - Static requests

## Limites do Free Tier

Vercel Free Tier:
- ✅ 100 GB de bandwidth por mês
- ✅ Domínios ilimitados
- ✅ HTTPS automático
- ✅ Deploys ilimitados
- ✅ Até 100 deploys por dia

## Melhorias Recomendadas

### 1. Adicionar Analytics

```bash
npm install @vercel/analytics
```

No `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Adicionar Speed Insights

```bash
npm install @vercel/speed-insights
```

### 3. Configurar Cache Headers

Criar `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## Próximos Passos

Após deploy bem-sucedido:

1. ✅ Compartilhe o link com amigos
2. ✅ Monitore o uso (Analytics)
3. ✅ Configure alertas se necessário
4. ✅ Considere adicionar analytics (opcional)

## Recursos Adicionais

- [Documentação da Vercel](https://vercel.com/docs)
- [Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/projects/domains)
