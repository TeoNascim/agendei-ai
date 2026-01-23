
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { getBookingResponse } from '../services/geminiService.ts';
import { Provider, ChatMessage, Appointment } from '../types.ts';

interface BookingAgentProps {
  provider: Provider;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => void;
}

const BookingAgent: React.FC<BookingAgentProps> = ({ provider, onClose, onConfirm }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: `Olá! 👋 Sou o assistente da ${provider.name}.\n\nQual serviço você gostaria de agendar hoje?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, confirmedApt]);

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

      // Check for JSON confirmation
      try {
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        if (cleanJson.startsWith('{') && cleanJson.endsWith('}')) {
          const data = JSON.parse(cleanJson);
          if (data.confirmation) {
            const matchedService = provider.services.find(s => s.name === data.serviceName) || provider.services[0];
            const newApt: Appointment = {
              id: crypto.randomUUID(),
              providerId: provider.id,
              providerName: provider.name,
              serviceName: matchedService.name,
              clientName: data.clientName,
              startTime: data.date,
              status: 'confirmed',
              price: matchedService.price
            };
            setConfirmedApt(newApt);
            onConfirm(newApt);
            setMessages(prev => [...prev, { role: 'model', content: `Agendamento confirmado para ${data.serviceName} no dia ${new Date(data.date).toLocaleDateString()} às ${new Date(data.date).toLocaleTimeString()}. Te aguardo!` }]);
            return;
          }
        }
      } catch (e) {
        console.log("Not a JSON response");
      }

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Desculpe, tive um problema técnico. Pode tentar novamente?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (confirmedApt) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Confirmado!</h2>
          <button onClick={onClose} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black">Concluir</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg h-[90vh] sm:h-[600px] flex flex-col rounded-t-[40px] sm:rounded-[40px] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-900">Agente IA - {provider.name}</h3>
          <button onClick={onClose} className="p-2"><X /></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 flex space-x-2">
          <input
            className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite aqui..."
          />
          <button onClick={handleSend} className="bg-indigo-600 text-white p-4 rounded-2xl"><Send /></button>
        </div>
      </div>
    </div>
  );
};

export default BookingAgent;
