import { VercelRequest, VercelResponse } from '@vercel/node';

// Prioridade de modelos preferidos (do mais recente para o mais antigo)
const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

/**
 * Consulta os modelos disponíveis para essa API key e retorna
 * o melhor modelo flash disponível.
 */
async function getBestAvailableModel(apiKey: string): Promise<string> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (!res.ok) {
      console.warn('Não foi possível listar modelos, usando fallback.');
      return PREFERRED_MODELS[0];
    }
    const data = await res.json();
    const available: string[] = (data.models || [])
      .filter((m: any) =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent')
      )
      .map((m: any) => (m.name as string).replace('models/', ''));

    // Retorna o primeiro modelo preferido que estiver disponível
    for (const preferred of PREFERRED_MODELS) {
      if (available.some(a => a === preferred || a.startsWith(preferred))) {
        const match = available.find(a => a === preferred || a.startsWith(preferred))!;
        console.log(`Modelo selecionado: ${match}`);
        return match;
      }
    }

    // Último fallback: qualquer modelo flash disponível
    const flashModel = available.find(a => a.includes('flash'));
    if (flashModel) {
      console.log(`Fallback flash: ${flashModel}`);
      return flashModel;
    }

    // Último recurso absoluto
    console.warn('Nenhum modelo preferido encontrado, usando primeiro disponível.');
    return available[0] || PREFERRED_MODELS[0];
  } catch (e) {
    console.error('Erro ao listar modelos:', e);
    return PREFERRED_MODELS[0];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { message, contents } = req.body;

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('ERRO: GOOGLE_API_KEY não configurada');
      return res.status(500).json({
        error: 'API Key não configurada no servidor',
        details: 'Configure GOOGLE_API_KEY nas Environment Variables do Vercel'
      });
    }

    // Seleciona dinamicamente o melhor modelo disponível para essa chave
    const model = await getBestAvailableModel(apiKey);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7 },
        systemInstruction: { parts: [{ text: message }] },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro da API Gemini [${model}]:`, data);
      return res.status(response.status).json({
        error: 'Erro na API do Gemini',
        details: data.error?.message || JSON.stringify(data),
        modelUsed: model,
      });
    }

    console.log(`Gemini respondeu com sucesso! Modelo: ${model}`);
    return res.status(200).json({ ...data, modelUsed: model });

  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
