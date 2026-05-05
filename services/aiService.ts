
import { Provider } from "../types.ts";

/**
 * Formata um slot ISO em texto legível em PT-BR.
 * Ex: "2024-06-01T10:00:00Z" → "sábado, 01/06/2024 às 10:00"
 */
function formatSlotForDisplay(isoSlot: string): string {
  try {
    const date = new Date(isoSlot);
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' });
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' });
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
    // Capitaliza o dia da semana
    const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${weekdayCap}, ${dateStr} às ${timeStr} [ref: ${isoSlot}]`;
  } catch {
    return isoSlot;
  }
}

export async function getBookingResponse(
  message: string,
  provider: Provider,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
) {
  // Formata os horários de forma legível para o modelo
  const formattedSlots = provider.availableSlots.length > 0
    ? provider.availableSlots.map(s => `  • ${formatSlotForDisplay(s)}`).join('\n')
    : '  (Nenhum horário disponível no momento)';

  const systemInstruction = `Você é um assistente virtual simpático da ${provider.name}, especialista em agendamentos.
Seu objetivo é ajudar o cliente a marcar um serviço de forma rápida e agradável.

SERVIÇOS DISPONÍVEIS:
${provider.services.map(s => `  • ${s.name} — R$ ${s.price} (${s.duration} min)`).join('\n')}

HORÁRIOS DISPONÍVEIS:
${formattedSlots}

REGRAS IMPORTANTES:
1. Seja sempre simpático, direto e use linguagem casual em português do Brasil.
2. NUNCA exiba datas no formato ISO (ex: 2024-06-01T10:00:00Z). Sempre use o formato legível: "Sábado, 01/06/2024 às 10:00".
3. Conduza a conversa em etapas: primeiro o serviço, depois o horário, depois o nome do cliente.
4. Quando o cliente escolher um horário, repita o horário no formato legível para confirmar.
5. Quando tiver TODOS os dados (Serviço ✓, Horário ✓, Nome do cliente ✓), responda APENAS com este JSON (sem markdown, sem crases, sem texto adicional):
{ "confirmation": true, "serviceName": "NOME_EXATO_DO_SERVICO", "date": "ISO_EXATO_DO_HORARIO_ref", "clientName": "NOME_DO_CLIENTE" }

Onde "ISO_EXATO_DO_HORARIO_ref" é o valor entre [ref: ...] do horário escolhido.

Caso contrário, continue a conversa normalmente em texto puro.`;

  try {
    const contents = [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ];

    const apiResponse = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: systemInstruction, contents }),
    });

    if (!apiResponse.ok) {
      let errorDetail = '';
      try {
        const errorData = await apiResponse.json();
        errorDetail = errorData.details || errorData.error || errorData.message || '';
      } catch (e) { }
      throw new Error(`API retornou ${apiResponse.status}${errorDetail ? ': ' + errorDetail : ''}`);
    }

    const data = await apiResponse.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    if (data.error) throw new Error(`Erro do Gemini: ${data.error.message || 'Erro desconhecido'}`);
    throw new Error('Resposta inválida: Candidatos não encontrados');

  } catch (error: any) {
    console.error('Erro ao chamar Gemini:', error);
    return `Desculpe, tive um problema técnico: ${error.message}. Tente novamente em instantes.`;
  }
}
