
import React, { useState } from 'react';
import { X, Scissors, DollarSign, Camera, CheckCircle2 } from 'lucide-react';
import { Provider, Service } from '../types.ts';

interface OnboardingProps {
  onComplete: (provider: Provider) => void;
  onClose: () => void;
}

const ProfessionalOnboarding: React.FC<OnboardingProps> = ({ onComplete, onClose }) => {
  const [name, setName] = useState('');
  
  const handleFinish = () => {
    const newProvider: Provider = {
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      name,
      slug: name.toLowerCase().replace(/ /g, '-'),
      category: 'Barbearia',
      bio: 'Novo profissional no Agendei AI',
      avatar: 'https://images.unsplash.com/photo-1521444118330-d79c46aed21c?w=400',
      coverImage: 'https://images.unsplash.com/photo-1556761175-5973cf0f32e7?w=1200',
      services: [{ id: '1', name: 'Corte', price: 50, duration: 30, description: '' }],
      portfolio: [],
      reviews: [],
      availableSlots: [new Date().toISOString()]
    };
    onComplete(newProvider);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-[48px] shadow-2xl space-y-8">
        <h2 className="text-3xl font-black text-slate-900">Seja Bem-vindo!</h2>
        <input 
          placeholder="Nome da sua Empresa" 
          className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleFinish} className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black">COMEÇAR AGORA</button>
      </div>
    </div>
  );
};

export default ProfessionalOnboarding;
