
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

    // Chamada para a Vercel Serverless Function (api/gemini.ts)
    const apiResponse = await fetch('/api/gemini', {
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
      let errorDetail = '';
      try {
        const errorData = await apiResponse.json();
        errorDetail = errorData.details || errorData.error || errorData.message || '';
      } catch (e) { }

      console.error('Erro na API:', apiResponse.status, apiResponse.statusText, errorDetail);
      throw new Error(`API retornou ${apiResponse.status}${errorDetail ? ': ' + errorDetail : ''}`);
    }

    const data = await apiResponse.json();
    console.log('Gemini raw response:', data);

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    if (data.error) {
      throw new Error(`Erro do Gemini: ${data.error.message || 'Erro desconhecido'}`);
    }

    throw new Error('Resposta inválida: Candidatos não encontrados');
  } catch (error: any) {
    console.error('Erro ao chamar Gemini:', error);
    return `Desculpe, tive um problema técnico: ${error.message}. Por favor, verifique se suas chaves de API estão corretas na Vercel e tente novamente.`;
  }
}
