
-- TABELA DE PROVEDORES (PROFISSIONAIS)
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  portfolio JSONB DEFAULT '[]'::jsonb,
  available_slots TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) -- Liga o profissional ao seu login do Google
);

-- TABELA DE AGENDAMENTOS
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  provider_id TEXT REFERENCES providers(id),
  provider_name TEXT,
  service_name TEXT,
  client_name TEXT,
  client_email TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'confirmed',
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) -- Se o cliente estiver logado
);

-- HABILITAR SEGURANÇA (RLS)
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Qualquer um pode ver provedores e agendamentos (para o explorador e confirmação)
CREATE POLICY "Provedores visíveis para todos" ON providers FOR SELECT USING (true);
CREATE POLICY "Agendamentos visíveis para todos" ON appointments FOR SELECT USING (true);

-- POLÍTICAS: Apenas o dono pode editar seus dados
CREATE POLICY "Provedores editáveis pelo dono" ON providers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Agendamentos editáveis pelo dono" ON appointments FOR ALL USING (auth.uid() = user_id);
