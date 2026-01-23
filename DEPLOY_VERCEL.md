# Deploy no Vercel - Passo a Passo

## 📋 Pré-requisitos
- Conta no GitHub (recomendado) ou Vercel
- Conta no Vercel (gratuita em https://vercel.com)

## 🚀 Opção 1: Deploy via GitHub (Recomendado)

### 1. Prepare seu repositório GitHub
```bash
# Se ainda não tem Git inicializado
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

### 2. Crie um repositório no GitHub
- Acesse https://github.com/new
- Crie um novo repositório (ex: `agendei-ai`)
- Copie o comando para push

### 3. Faça push do seu projeto
```bash
git remote add origin https://github.com/seu-usuario/agendei-ai.git
git push -u origin main
```

### 4. Conecte ao Vercel
- Acesse https://vercel.com/new
- Clique em "Import Git Repository"
- Selecione seu repositório do GitHub
- Vercel detectará automaticamente as configurações

### 5. Configure Variáveis de Ambiente
- Em "Environment Variables", adicione:
  - **Name:** `VITE_GOOGLE_API_KEY`
  - **Value:** `AIzaSyAR_GtMLRqTVnpQaa_W_cpKZyoKAbfVHZE`
- Clique em "Deploy"

## 🚀 Opção 2: Deploy via Vercel CLI (Sem GitHub)

### 1. Instale Vercel CLI globalmente
```bash
npm install -g vercel
```

### 2. Faça login
```bash
vercel login
```

### 3. Deploy do projeto
```bash
cd c:\imagens\AgenteAi
vercel
```

### 4. Durante o deploy:
- Responda as perguntas:
  - **Which scope?** → Selecione seu email/conta
  - **Link to existing project?** → `n` (novo projeto)
  - **What's your project's name?** → `agendei-ai`
  - **In which directory?** → `.`
  - **Override settings?** → `n`

### 5. Configure a variável de ambiente
Após deploy:
```bash
vercel env add VITE_GOOGLE_API_KEY
# Cole: AIzaSyAR_GtMLRqTVnpQaa_W_cpKZyoKAbfVHZE
# Responda: production, preview, development (ou todos)
```

### 6. Redeploy
```bash
vercel --prod
```

## ✅ O que está configurado

- ✅ `vercel.json` - Configuração de rewrite de URLs para SPA
- ✅ `api/gemini-proxy.js` - Função serverless para chamar Gemini
- ✅ CORS habilitado automaticamente
- ✅ `dist/` - Pronto para production

## 🔍 Testando após deploy

1. Acesse sua URL do Vercel (ex: https://agendei-ai.vercel.app)
2. Teste o agendamento com IA
3. Verifique console (F12) para erros

## 🐛 Troubleshooting

### "API não encontrada" ou erro 404
- Verifique se a variável `VITE_GOOGLE_API_KEY` está configurada
- Redeploy após adicionar a variável

### Erro CORS
- Já está habilitado no `vercel.json`
- Limpe cache do navegador

### Chat não funciona
- Abra Console (F12)
- Procure por erros de requisição
- Verifique se `/api/gemini-proxy` responde

## 📚 Documentação
- Vercel: https://vercel.com/docs
- Serverless Functions: https://vercel.com/docs/serverless-functions
- Environment Variables: https://vercel.com/docs/projects/environment-variables

---

**Projeto pronto! 🎉**
Após deploy, você terá um agendador de IA rodando em produção!
