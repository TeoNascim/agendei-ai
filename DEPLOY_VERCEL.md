# 🚀 Guia de Deploy na Vercel - Agendei AI

Este guia fornece o passo a passo definitivo para colocar sua plataforma **Agendei AI** online usando a Vercel.

## 1. Preparação (GitHub)

Certifique-se de que seu código local está atualizado no GitHub:
```bash
git add .
git commit -m "docs: update deployment info"
git push origin main
```

## 2. Configuração na Vercel

1. **Importar Projeto**:
   - Vá para o [Dashboard da Vercel](https://vercel.com/dashboard).
   - Clique em **"Add New..."** -> **"Project"**.
   - Conecte sua conta do GitHub e importe o repositório `agendei-ai`.

2. **Configurações de Build**:
   - A Vercel deve detectar automaticamente que é um projeto **Vite**.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Variáveis de Ambiente (Environment Variables)**:
   Este é o passo mais importante. Adicione as seguintes variáveis na seção "Environment Variables":

   | Nome | Valor |
   | :--- | :--- |
   | `VITE_GOOGLE_API_KEY` | Sua chave da API do Google Gemini |
   | `VITE_SUPABASE_URL` | A URL do seu projeto Supabase |
   | `VITE_SUPABASE_ANON_KEY` | A chave anônima (anon key) do seu Supabase |

   > [!IMPORTANT]
   > Certifique-se de copiar os nomes exatamente como aparecem acima (tudo em maiúsculas).

4. **Deploy**:
   - Clique em **"Deploy"**.
   - Aguarde alguns minutos para a conclusão do build.

## 3. Verificação Pós-Deploy

Após o deploy, a Vercel fornecerá uma URL (ex: `agendei-ai.vercel.app`).
1. Acesse a URL.
2. Teste o chat com a IA para garantir que a `VITE_GOOGLE_API_KEY` está funcionando.
3. Verifique se os dados do Supabase estão sendo carregados corretamente.

## 4. Troubleshooting (Resolução de Problemas)

- **Erro de API (404 ou 500)**: Verifique se as variáveis de ambiente foram salvas corretamente no dashboard da Vercel. Se você as adicionou *após* o primeiro deploy, precisará fazer um novo deploy para que elas entrem em vigor.
- **Página não encontrada ao atualizar (404)**: O arquivo `vercel.json` já está configurado no projeto para resolver rotas do React (Single Page Application).
- **CORS Errors**: As configurações de cabeçalhos já estão incluídas no `vercel.json` para permitir a comunicação com a API Gemini.

---
Dúvidas? Consulte a documentação oficial da [Vercel](https://vercel.com/docs).
