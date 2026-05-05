
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, CheckCircle2, Bot, Wifi } from 'lucide-react';
import { getBookingResponse } from '../services/aiService.ts';
import { Provider, ChatMessage, Appointment } from '../types.ts';

interface BookingAgentProps {
  provider: Provider;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => void;
}

const BookingAgent: React.FC<BookingAgentProps> = ({ provider, onClose, onConfirm }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `Olá! 👋 Sou o assistente virtual da **${provider.name}**.\n\nComo posso te ajudar hoje? Qual serviço você gostaria de agendar?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }]
      }));

      const responseText = await getBookingResponse(userMessage, provider, history);

      // Verifica se é JSON de confirmação
      try {
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        if (cleanJson.startsWith('{') && cleanJson.endsWith('}')) {
          const data = JSON.parse(cleanJson);
          if (data.confirmation) {
            const rawDate: string = data.date || '';
            const refMatch = rawDate.match(/\[ref:\s*([^\]]+)\]/);
            const isoDate = refMatch ? refMatch[1].trim() : rawDate.trim();

            const matchedService = provider.services.find(
              s => s.name.toLowerCase() === data.serviceName?.toLowerCase()
            ) || provider.services[0];

            const newApt: Appointment = {
              id: crypto.randomUUID(),
              providerId: provider.id,
              providerName: provider.name,
              serviceName: matchedService.name,
              clientName: data.clientName,
              startTime: isoDate,
              status: 'confirmed',
              price: matchedService.price
            };

            const aptDate = new Date(isoDate);
            const dateFormatted = aptDate.toLocaleDateString('pt-BR', {
              weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
              timeZone: 'America/Sao_Paulo'
            });
            const timeFormatted = aptDate.toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
            });

            setConfirmedApt(newApt);
            onConfirm(newApt);
            setMessages(prev => [...prev, {
              role: 'model',
              content: `Agendamento confirmado!\n\n${matchedService.name}\n${dateFormatted} às ${timeFormatted}\n${data.clientName}\n\nTe aguardamos! 😊`
            }]);
            return;
          }
        }
      } catch (e) { /* not JSON */ }

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: `Desculpe, ocorreu um erro técnico. Por favor, tente novamente em instantes.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Tela de confirmação ────────────────────────────────────────────────────
  if (confirmedApt) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
           style={{ background: 'rgba(15,15,26,0.7)', backdropFilter: 'blur(16px)' }}>
        <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center animate-scale-in"
             style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
          <div className="w-20 h-20 brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-5"
               style={{ boxShadow: '0 8px 32px rgba(108,99,255,0.35)' }}>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Confirmado!</h2>
          <p className="text-gray-400 font-medium text-sm mb-6">Seu agendamento foi realizado com sucesso.</p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Serviço</span>
              <span className="text-sm font-bold text-gray-900">{confirmedApt.serviceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Valor</span>
              <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>R$ {confirmedApt.price}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full brand-gradient text-white py-4 rounded-2xl font-bold"
            style={{ boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}
          >
            Concluir
          </button>
        </div>
      </div>
    );
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
         style={{ background: 'rgba(15,15,26,0.65)', backdropFilter: 'blur(12px)' }}>
      <div className="bg-white w-full sm:max-w-md sm:mx-4 flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-in"
           style={{ height: '88vh', maxHeight: '680px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <img
              src={provider.avatar}
              className="w-10 h-10 rounded-2xl object-cover"
              alt={provider.name}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{provider.name}</p>
            <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
              <Wifi className="w-3 h-3" /> Agente online
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                 style={{ background: 'var(--brand-light)' }}>
              <Bot className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
                 style={{ animationDelay: `${i * 30}ms` }}>
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                     style={{ background: 'var(--brand-light)' }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 text-sm font-medium leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user'
                    ? 'text-white rounded-2xl rounded-tr-sm'
                    : 'text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
                  }`}
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #6C63FF, #A78BFA)'
                    : 'white',
                  boxShadow: msg.role === 'user'
                    ? '0 4px 16px rgba(108,99,255,0.3)'
                    : 'var(--shadow-sm)'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fade-up">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                   style={{ background: 'var(--brand-light)' }}>
                <Bot className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1.5 items-center"
                   style={{ boxShadow: 'var(--shadow-sm)' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0 bg-white">
          <input
            ref={inputRef}
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-medium input-brand transition-all"
            style={{
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              color: 'var(--text-1)'
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 brand-gradient"
            style={{ boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingAgent;
