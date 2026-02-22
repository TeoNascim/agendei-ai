# Agendei AI - Plataforma de Agendamentos Inteligentes

<div align="center">
  <img width="1200" height="475" alt="Agendei AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 🚀 Sobre o Projeto

**Agendei AI** é uma plataforma completa para prestadores de serviços que buscam profissionalismo e automação. O sistema oferece perfis sociais personalizáveis, showcase de portfólio e, o diferencial principal: um **Agente de IA inteligente** que realiza agendamentos automáticos diretamente via chat.

## ✨ Funcionalidades

- 🤖 **Agente de Agendamento IA**: Chat inteligente capaz de entender horários e realizar marcações automaticamente.
- 📊 **Dashboard Administrativo**: Visão clara de agendamentos, métricas e desempenho.
- 📂 **Portfólio Profissional**: Espaço para exibir trabalhos e serviços realizados.
- 📱 **Design Responsivo**: Experiência fluida em dispositivos móveis e desktop.
- 📈 **Análise Visual**: Gráficos inteligentes para acompanhamento de crescimento.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 18](https://reactjs.org/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: Tailwind CSS / Vanilla CSS
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/)
- **Inteligência Artificial**: [Google Gemini AI](https://ai.google.dev/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)

## 📦 Como Executar Localmente

### Pré-requisitos
- Node.js installed

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/TeoNascim/agendei-ai.git
   cd agendei-ai
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto e adicione suas chaves:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
   VITE_GEMINI_API_KEY=sua_chave_gemini
   ```

4. **Prepare o Banco de Dados:**
   Utilize o arquivo `supabase_schema.sql` fornecido na raiz para configurar as tabelas necessárias no seu projeto Supabase.

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---
Desenvolvido por [Teo Nascim](https://github.com/TeoNascim).
