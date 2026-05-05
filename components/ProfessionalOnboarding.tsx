
import React, { useState } from 'react';
import { X, Sparkles, Building2, ChevronRight } from 'lucide-react';
import { Provider, Service } from '../types.ts';

interface OnboardingProps {
  onComplete: (provider: Provider) => void;
  onClose: () => void;
}

const CATEGORIES = ['Barbearia', 'Psicologia', 'Estética', 'Nutrição', 'Personal Trainer', 'Fisioterapia', 'Outro'];

const ProfessionalOnboarding: React.FC<OnboardingProps> = ({ onComplete, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Barbearia');
  const [step, setStep] = useState<1 | 2>(1);

  const handleFinish = () => {
    if (!name.trim()) return;
    const newProvider: Provider = {
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      slug: name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      category,
      bio: `Bem-vindo ao perfil de ${name.trim()} no Agendei AI.`,
      avatar: 'https://images.unsplash.com/photo-1521444118330-d79c46aed21c?w=400',
      coverImage: 'https://images.unsplash.com/photo-1556761175-5973cf0f32e7?w=1200',
      services: [{ id: '1', name: 'Consulta', price: 80, duration: 60, description: '' }],
      portfolio: [],
      reviews: [],
      availableSlots: []
    };
    onComplete(newProvider);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center"
         style={{ background: 'rgba(15,15,26,0.7)', backdropFilter: 'blur(16px)' }}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale-in"
           style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center"
                 style={{ boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Passo {step} de 2</p>
              <h2 className="text-lg font-black text-gray-900">
                {step === 1 ? 'Crie seu perfil' : 'Escolha a categoria'}
              </h2>
            </div>
          </div>
          <button onClick={onClose}
                  className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-6 mt-4 mb-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full brand-gradient rounded-full transition-all duration-500"
               style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>

        <div className="px-6 pb-8">
          {step === 1 ? (
            <>
              <p className="text-gray-400 text-sm font-medium mb-5">
                Como se chama seu negócio ou você como profissional?
              </p>
              <div className="relative mb-6">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  placeholder="Ex: Barbearia do João, Dra. Ana Silva..."
                  className="w-full rounded-2xl py-4 pl-12 pr-4 text-sm font-medium input-brand transition-all"
                  style={{
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-1)'
                  }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
                  autoFocus
                />
              </div>
              <button
                onClick={() => name.trim() && setStep(2)}
                disabled={!name.trim()}
                className="w-full brand-gradient text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
                style={{ boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-sm font-medium mb-4">
                Selecione a categoria que melhor descreve seu serviço:
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="py-3 px-4 rounded-2xl text-sm font-bold text-left transition-all border"
                    style={{
                      background: category === cat ? 'var(--brand)' : 'var(--bg)',
                      color: category === cat ? 'white' : 'var(--text-2)',
                      borderColor: category === cat ? 'var(--brand)' : 'var(--border)',
                      boxShadow: category === cat ? '0 4px 12px rgba(108,99,255,0.25)' : 'none'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm border transition-colors hover:bg-gray-50"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  Voltar
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-[2] brand-gradient text-white py-4 rounded-2xl font-bold text-sm"
                  style={{ boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}
                >
                  Criar Meu Perfil 🚀
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalOnboarding;
