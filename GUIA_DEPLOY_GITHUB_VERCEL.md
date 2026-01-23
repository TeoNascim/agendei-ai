# 📤 Guia de Deploy - GitHub + Vercel

## Passo 1: Fazer Push para GitHub

### Se ainda não tem repositório GitHub:
1. Acesse https://github.com/new
2. **Repository name:** `agendei-ai`
3. **Description:** `Plataforma de agendamentos inteligentes com IA`
4. Escolha **Public** (recomendado para Vercel)
5. Clique em **Create repository**

### Fazer push do seu código local:
```bash
cd c:\imagens\AgenteAi

# Adicionar o remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/agendei-ai.git

# Renomear branch para main
git branch -M main

# Fazer push
git push -u origin main
```

*Substitua `SEU_USUARIO` pelo seu nome de usuário GitHub*

---

## Passo 2: Conectar Vercel com GitHub

### 2.1 - Criar conta Vercel (se não tiver)
- Acesse https://vercel.com/signup
- Clique em **Continue with GitHub**
- Autorize a integração

### 2.2 - Importar projeto
- Acesse https://vercel.com/new
- Clique em **Import Git Repository**
- Selecione `agendei-ai` na lista
- Clique em **Import**

---

## Passo 3: Configurar Environment Variables no Vercel

Na tela de configuração do Vercel, você verá "Environment Variables". Clique em **Add** e adicione:

### Variável 1: Google Gemini API Key
```
Name: VITE_GOOGLE_API_KEY
Value: AIzaSyAR_GtMLRqTVnpQaa_W_cpKZyoKAbfVHZE
Environments: All (Production, Preview, Development)
```

### Variável 2: Supabase URL
```
Name: VITE_SUPABASE_URL
Value: https://maxkeumntbhwhxhoqmhz.supabase.co
Environments: All
```

### Variável 3: Supabase Anon Key
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heGtldW1udGJod2h4aG9xbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODc0ODAsImV4cCI6MjA4NDM2MzQ4MH0.wKmCMBTZYkuIZZwcpvzoIGgoTpFdFDg_JYaVZkSmbtg
Environments: All
```

---

## Passo 4: Fazer Deploy

### Opção A: Deploy manual (mais rápido)
1. Clique em **Deploy** na tela de configuração
2. Aguarde 2-3 minutos enquanto Vercel faz o build
3. Após sucesso, receberá uma URL como: `https://agendei-ai-xxx.vercel.app`

### Opção B: Deploy automático (recomendado)
Após o primeiro deploy, qualquer push no GitHub disparará um novo deploy automaticamente:
```bash
# Fazer alterações
git add .
git commit -m "feat: adicionar nova feature"
git push

# Vercel fará o deploy automaticamente!
```

---

## Passo 5: Testar após Deploy

1. Acesse sua URL do Vercel
2. Teste o agendamento com IA:
   - Clique em "Agendar com IA"
   - Converse com o assistente
   - Conclua um agendamento
3. Abra Console (F12) para verificar se há erros
4. Verifique se as chamadas vão para `/api/gemini`

---

## ✅ Checklist de Deploy

- [ ] GitHub repo criado
- [ ] Código feito push para GitHub (`git push origin main`)
- [ ] Conta Vercel criada
- [ ] Projeto importado no Vercel
- [ ] 3 Environment Variables configuradas no Vercel
- [ ] Deploy realizado com sucesso
- [ ] Site acessível em https://agendei-ai-xxx.vercel.app
- [ ] Agendamento com IA funcionando
- [ ] Sem erros no console (F12)

---

## 🐛 Troubleshooting

### "API retorna 404"
- ✓ Verifique se `VITE_GOOGLE_API_KEY` está configurada no Vercel
- ✓ Redeploy após adicionar a variável: https://vercel.com/dashboard
- ✓ Aguarde 5 minutos para mudanças refletirem

### "Erro CORS"
- ✓ Já está habilitado em `vercel.json`
- ✓ Limpe cache: Ctrl+Shift+Delete (DevTools)
- ✓ Tente em modo anônimo do navegador

### "Chat não responde"
- ✓ Abra Console (F12) e veja mensagens de erro
- ✓ Verifique se está fazendo POST para `/api/gemini`
- ✓ Confirme que API Key não está vazia no backend

### "Página em branco"
- ✓ Verifique build logs no Vercel
- ✓ Confirme que `npm run build` passa localmente
- ✓ Verifique versões no `package.json`

---

## 📊 Monitoramento após Deploy

### Acessar logs do Vercel:
1. Vá para https://vercel.com/dashboard
2. Clique no seu projeto `agendei-ai`
3. Aba **Deployments** → Clique em um deploy
4. Aba **Logs** para ver erros em tempo real

### Monitorar performance:
1. Aba **Analytics** no dashboard Vercel
2. Visualizar requests, latência, erros
3. Otimizar conforme necessário

---

## 🔄 Atualizações futuras

A partir daqui, qualquer mudança é muito simples:

```bash
# Fazer alterações localmente
# ...editar arquivos...

# Fazer commit e push
git add .
git commit -m "feat: descrição da mudança"
git push origin main

# Vercel automaticamente fará o deploy!
# Acompanhe em https://vercel.com/dashboard
```

---

## 📞 Suporte

Se encontrar erros:
1. Verifique console do navegador (F12)
2. Veja logs do Vercel em Dashboard → Deployments → Logs
3. Confirme variáveis de ambiente estão corretas
4. Tente um rebuild em: Vercel Dashboard → Deployments → ... → Redeploy

---

**Pronto para ir ao ar! 🚀**
