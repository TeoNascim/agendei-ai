import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Aceitar apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { message, contents } = req.body;

    // Obter chave da API do Gemini via variável de ambiente
    const apiKey = process.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
      console.error('ERRO: VITE_GOOGLE_API_KEY não está configurada nas variáveis de ambiente');
      return res.status(500).json({
        error: 'API Key não configurada no servidor',
        details: 'Configure VITE_GOOGLE_API_KEY nas Environment Variables do Vercel'
      });
    }

    // Chamar API do Google Gemini (v1beta para suporte a system_instruction)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    console.log('Hitting Gemini API v1beta...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.1,
        },
        systemInstruction: {
          parts: [{ text: message }]
        },
      }),
    }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro retornado pela API Gemini (Google):', data);
      return res.status(response.status).json({
        error: 'Erro na API do Gemini (Google)',
        details: data.error?.message || JSON.stringify(data)
      });
    }

    // Log de sucesso (útil no Vercel Dashboard -> Logs)
    console.log('Gemini respondeu com sucesso!');

    // Retornar resposta do Gemini
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
