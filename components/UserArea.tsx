
import React from 'react';
import { Calendar, ShieldCheck, LogIn } from 'lucide-react';
import { Appointment } from '../types.ts';

interface UserAreaProps {
  appointments: Appointment[];
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const UserArea: React.FC<UserAreaProps> = ({ appointments, isLoggedIn, onLoginClick }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-2xl font-black">Seus Agendamentos</h1>
      
      {!isLoggedIn && (
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black">Salve seus dados!</h3>
            <p className="text-indigo-100">Crie uma conta para sincronizar.</p>
          </div>
          <button onClick={onLoginClick} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black">CRIAR CONTA</button>
        </div>
      )}

      <div className="space-y-4">
        {appointments.map(apt => (
          <div key={apt.id} className="bg-white p-6 rounded-[32px] shadow-sm flex items-center space-x-4 border border-slate-100">
            <Calendar className="text-indigo-600" />
            <div>
              <p className="font-black">{apt.providerName}</p>
              <p className="text-slate-500 text-sm">{apt.serviceName} - {new Date(apt.startTime).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {appointments.length === 0 && <p className="text-center text-slate-400 py-20 font-bold">Nenhum agendamento encontrado.</p>}
      </div>
    </div>
  );
};

export default UserArea;
