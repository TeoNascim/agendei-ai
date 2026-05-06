
import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Star, ChevronLeft, Bot, Check } from 'lucide-react';
import { Provider, Appointment } from '../types.ts';
import BookingAgent from './BookingAgent.tsx';

interface ProviderProfileProps {
  provider: Provider;
  onAppointmentConfirmed: (appointment: Appointment) => void;
}

type ProfileTab = 'services' | 'portfolio' | 'about';

const ProviderProfile: React.FC<ProviderProfileProps> = ({ provider, onAppointmentConfirmed }) => {
  const [isBooking, setIsBooking] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('services');

  const minPrice = provider.services.length > 0
    ? Math.min(...provider.services.map(s => s.price))
    : null;

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'services',  label: 'Serviços' },
    { id: 'portfolio', label: 'Portfólio' },
    { id: 'about',     label: 'Sobre' },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-up" style={{ background: 'var(--bg)' }}>

      {/* ── Cover ───────────────────────────────────── */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img src={provider.coverImage} className="w-full h-full object-cover" alt="Cover" />
        {/* Gradiente sutil apenas para o botão voltar */}
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 40%)' }} />

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* ── Profile Header ────────────────────────────────── */}
      <div className="bg-white px-5 pb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* Avatar flutuando sobre a borda da foto */}
        <div className="-mt-10 mb-3">
          <img
            src={provider.avatar}
            className="w-20 h-20 rounded-2xl object-cover border-4 border-white"
            style={{ boxShadow: 'var(--shadow-md)' }}
            alt={provider.name}
          />
        </div>

        {/* Nome e meta — claramente na área branca */}
        <h1 className="text-xl font-black leading-tight mb-1" style={{ color: 'var(--text-1)' }}>
          {provider.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--brand)' }}>
            <MapPin className="w-3.5 h-3.5" />
            {provider.category}
          </span>
          {provider.reviews.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              5.0 ({provider.reviews.length})
            </span>
          )}
          {minPrice && (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--text-2)' }}>
              <DollarSign className="w-3.5 h-3.5" />
              A partir de R$ {minPrice}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200
                ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────── */}
      <div className="px-4 py-5 space-y-3 pb-32">

        {/* Services Tab */}
        {activeTab === 'services' && (
          provider.services.length > 0 ? provider.services.map(s => (
            <div key={s.id} className="bg-white rounded-2xl p-4 flex items-center gap-4"
                 style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: 'var(--brand-light)' }}>
                <Clock className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{s.duration} minutos</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-base" style={{ color: 'var(--brand)' }}>R$ {s.price}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-300 font-medium">Nenhum serviço cadastrado.</div>
          )
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          provider.portfolio.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {provider.portfolio.map(post => (
                <div key={post.id} className="aspect-square rounded-2xl overflow-hidden relative group"
                     style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <img src={post.imageUrl} className="w-full h-full object-cover" alt={post.caption} />
                  <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                       style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                    <p className="text-white text-xs font-medium leading-snug line-clamp-2">{post.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-300 font-medium">Nenhum post ainda.</div>
          )
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="font-bold text-gray-900 mb-3">Sobre {provider.name}</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              {provider.bio || 'Nenhuma descrição disponível.'}
            </p>
            {provider.availableSlots.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Horários Disponíveis
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                  {provider.availableSlots.length} horário{provider.availableSlots.length !== 1 ? 's' : ''} disponíve{provider.availableSlots.length !== 1 ? 'is' : 'l'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sticky Booking Button ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:relative md:p-0 md:max-w-2xl md:mx-auto"
           style={{ background: 'linear-gradient(to top, var(--bg) 80%, transparent)' }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setIsBooking(true)}
            className="w-full brand-gradient text-white font-bold text-base rounded-2xl py-4 flex items-center justify-center gap-2.5"
            style={{ boxShadow: '0 8px 32px rgba(108,99,255,0.35)' }}
          >
            <Bot className="w-5 h-5" />
            Agendar com IA
          </button>
        </div>
      </div>

      {/* ── Booking Agent Modal ───────────────────────────────────── */}
      {isBooking && (
        <BookingAgent
          provider={provider}
          onClose={() => setIsBooking(false)}
          onConfirm={apt => { onAppointmentConfirmed(apt); }}
        />
      )}
    </div>
  );
};

export default ProviderProfile;
