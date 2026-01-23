
import React, { useState } from 'react';
import { MapPin, CalendarCheck, Share2, Search } from 'lucide-react';
import { Provider, Appointment } from '../types.ts';
import BookingAgent from './BookingAgent.tsx';

interface ProviderProfileProps {
  provider: Provider;
  onAppointmentConfirmed: (appointment: Appointment) => void;
}

const ProviderProfile: React.FC<ProviderProfileProps> = ({ provider, onAppointmentConfirmed }) => {
  const [isBooking, setIsBooking] = useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-lg pb-24 md:rounded-[40px] md:my-8 overflow-hidden">
      <div className="relative h-56 bg-slate-200">
        <img src={provider.coverImage} className="w-full h-full object-cover" alt="Cover" />
        <img src={provider.avatar} className="w-32 h-32 rounded-[28px] border-4 border-white object-cover absolute -bottom-16 left-6 shadow-xl" alt="Avatar" />
      </div>

      <div className="mt-20 px-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{provider.name}</h1>
            <p className="text-slate-500 font-bold flex items-center mt-1 uppercase text-xs">
              <MapPin className="w-4 h-4 mr-1" /> {provider.category}
            </p>
          </div>
          <button 
            onClick={() => setIsBooking(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black shadow-xl"
          >
            Agendar com IA
          </button>
        </div>
        <p className="text-slate-600">{provider.bio}</p>
      </div>

      <div className="p-8 space-y-4">
        <h3 className="font-black text-xl">Serviços</h3>
        {provider.services.map(s => (
          <div key={s.id} className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center">
            <span className="font-bold">{s.name}</span>
            <span className="font-black text-indigo-600">R$ {s.price}</span>
          </div>
        ))}
      </div>

      {isBooking && (
        <BookingAgent 
          provider={provider} 
          onClose={() => setIsBooking(false)} 
          onConfirm={onAppointmentConfirmed}
        />
      )}
    </div>
  );
};

export default ProviderProfile;
