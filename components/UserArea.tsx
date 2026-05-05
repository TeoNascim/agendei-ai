
import React from 'react';
import { Calendar, Clock, DollarSign, LogIn, Sparkles, ChevronRight } from 'lucide-react';
import { Appointment } from '../types.ts';

interface UserAreaProps {
  appointments: Appointment[];
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', bg: '#ECFDF5', color: '#059669' },
  pending:   { label: 'Pendente',   bg: '#FFFBEB', color: '#D97706' },
  cancelled: { label: 'Cancelado',  bg: '#FEF2F2', color: '#DC2626' },
};

const UserArea: React.FC<UserAreaProps> = ({ appointments, isLoggedIn, onLoginClick }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-up">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Meus Agendamentos</h1>
        <p className="text-gray-400 text-sm font-medium mt-1">
          {appointments.length > 0
            ? `${appointments.length} agendamento${appointments.length !== 1 ? 's' : ''}`
            : 'Nenhum agendamento ainda'}
        </p>
      </div>

      {/* CTA de Login */}
      {!isLoggedIn && (
        <div className="rounded-3xl p-6 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)', boxShadow: '0 8px 32px rgba(108,99,255,0.3)' }}>
          {/* Blob decorativo */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
               style={{ background: 'rgba(255,255,255,0.4)' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-white/80" />
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Conta Grátis</p>
            </div>
            <h3 className="text-white text-xl font-black mb-1">Salve seus agendamentos</h3>
            <p className="text-white/70 text-sm font-medium mb-4">
              Crie uma conta para acessar seu histórico de qualquer dispositivo.
            </p>
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-white rounded-2xl px-5 py-2.5 text-sm font-bold transition-all hover:bg-gray-50"
              style={{ color: 'var(--brand)' }}
            >
              <LogIn className="w-4 h-4" />
              Criar Conta Gratuita
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lista de Agendamentos */}
      {appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map(apt => {
            const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.confirmed;
            const date = new Date(apt.startTime);
            const dateStr = date.toLocaleDateString('pt-BR', {
              weekday: 'short', day: '2-digit', month: 'short',
              timeZone: 'America/Sao_Paulo'
            });
            const timeStr = date.toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit',
              timeZone: 'America/Sao_Paulo'
            });

            return (
              <div key={apt.id}
                   className="bg-white rounded-2xl p-5 flex gap-4 items-start card-hover"
                   style={{ boxShadow: 'var(--shadow-sm)' }}>

                {/* Date badge */}
                <div className="w-12 text-center flex-shrink-0 rounded-xl py-2 px-1"
                     style={{ background: 'var(--brand-light)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--brand)' }}>
                    {dateStr.split(',')[0]}
                  </p>
                  <p className="text-lg font-black" style={{ color: 'var(--brand)' }}>
                    {date.getDate().toString().padStart(2,'0')}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{apt.providerName}</p>
                      <p className="text-xs text-gray-400 font-medium truncate">{apt.serviceName}</p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {timeStr}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--brand)' }}>
                      <DollarSign className="w-3.5 h-3.5" /> R$ {apt.price}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
               style={{ background: 'var(--brand-light)' }}>
            <Calendar className="w-10 h-10" style={{ color: 'var(--brand)', opacity: 0.5 }} />
          </div>
          <h3 className="font-bold text-gray-700 mb-1">Ainda sem agendamentos</h3>
          <p className="text-gray-400 text-sm font-medium">
            Explore os profissionais disponíveis e faça seu primeiro agendamento!
          </p>
        </div>
      )}
    </div>
  );
};

export default UserArea;
