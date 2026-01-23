
import { Provider } from "../types.ts";

export async function getBookingResponse(
  message: string,
  provider: Provider,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
) {
  const systemInstruction = `Você é um assistente virtual da ${provider.name}.
  Seu objetivo é agendar serviços.
  
  Serviços: ${provider.services.map(s => `${s.name} (R$${s.price})`).join(', ')}
  Horários Disponíveis (ISO): ${provider.availableSlots.join(', ')}
  
  Regras:
  1. Seja direto e simpático.
  2. Pergunte qual serviço e horário o cliente quer.
  3. Pergunte o nome do cliente.
  4. Quando tiver tudo (Serviço, Horário, Nome), responda APENAS com um JSON neste formato, sem crase ou markdown:
  { "confirmation": true, "serviceName": "...", "date": "ISO_DO_HORARIO", "clientName": "..." }
  
  Caso contrário, continue a conversa normalmente.`;

  try {
    const contents = [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ];

    // Tenta chamar via API remota primeiro (backend proxy ou Vercel)
    const apiResponse = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: systemInstruction,
        contents: contents,
      }),
    });

    if (!apiResponse.ok) {
      console.warn('API proxy falhou, tentando fallback...');
      // Se o proxy falhar, usa fallback
      return await callGeminiDirectly(message, provider, history, systemInstruction);
    }

    const data = await apiResponse.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Resposta inválida da API');
  } catch (error) {
    console.error('Erro ao chamar Gemini:', error);
    return "Desculpe, tive um problema técnico. Pode tentar novamente?";
  }
}

async function callGeminiDirectly(
  message: string,
  provider: Provider,
  history: any[],
  systemInstruction: string
) {
  // Fallback: tenta chamar diretamente via proxy ou retorna erro
  try {
    const apiKey = import.meta.env?.VITE_GOOGLE_API_KEY;
    
    if (!apiKey) {
      return "API não configurada. Contate o administrador.";
    }

    // Chamada direta usando fetch (requer CORS configurado)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            ...history,
            { role: "user", parts: [{ text: message }] }
          ],
          generationConfig: {
            temperature: 0.1,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na API:', data);
      return "Desculpe, tive um problema técnico. Pode tentar novamente?";
    }

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return "Desculpe, recebi uma resposta vazia. Tente novamente.";
  } catch (error) {
    console.error('Erro no fallback:', error);
    return "Desculpe, tive um problema técnico. Pode tentar novamente?";
  }
}
