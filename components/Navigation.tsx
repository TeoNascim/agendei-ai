
import React from 'react';
import { Search, Compass, Calendar, Briefcase, User, LogIn, Sparkles } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  userAvatar?: string;
  userName?: string;
}

const tabs = [
  { id: 'explore',       label: 'Explorar',    icon: Compass  },
  { id: 'user-area',     label: 'Agendamentos', icon: Calendar },
  { id: 'provider-area', label: 'Profissional', icon: Briefcase },
];

const Navigation: React.FC<NavigationProps> = ({
  activeTab, setActiveTab, isLoggedIn, onLoginClick, userAvatar, userName
}) => {
  return (
    <>
      {/* ── Desktop Top Bar ─────────────────────────────────────────── */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass border-b border-white/60"
              style={{ boxShadow: '0 1px 24px rgba(108,99,255,0.07)' }}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-8 h-[68px]">

          {/* Logo */}
          <button
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center shadow-md"
                 style={{ boxShadow: '0 4px 12px rgba(108,99,255,0.35)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black brand-gradient-text tracking-tight">Agendei AI</span>
          </button>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${active
                      ? 'text-[#6C63FF] bg-[#EEF2FF]'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                  {tab.label}
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full brand-gradient inline-block ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Auth Button */}
          <button
            onClick={onLoginClick}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border
              ${isLoggedIn
                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                : 'brand-gradient border-transparent text-white hover:opacity-90 shadow-md'
              }`}
            style={!isLoggedIn ? { boxShadow: '0 4px 12px rgba(108,99,255,0.3)' } : {}}
          >
            {isLoggedIn ? (
              <>
                {userAvatar ? (
                  <img src={userAvatar} className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-100" alt="Avatar" />
                ) : (
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <span className="max-w-[96px] truncate">{userName || 'Meu Perfil'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile Bottom Bar ────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/60 pb-safe"
           style={{ boxShadow: '0 -4px 24px rgba(108,99,255,0.08)' }}>
        <div className="flex items-stretch justify-around px-2 pt-2 pb-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 flex-1 py-1 relative"
              >
                <div className={`flex items-center justify-center w-10 h-9 rounded-2xl transition-all duration-300
                  ${active ? 'brand-gradient shadow-sm scale-105' : 'bg-transparent'}`}
                  style={active ? { boxShadow: '0 4px 12px rgba(108,99,255,0.3)' } : {}}>
                  <Icon className={`w-5 h-5 transition-all duration-300
                    ${active ? 'text-white stroke-[2.5px]' : 'text-gray-400 stroke-[1.8px]'}`} />
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300
                  ${active ? 'text-[#6C63FF]' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Auth item (mobile) */}
          <button
            onClick={onLoginClick}
            className="flex flex-col items-center gap-1 flex-1 py-1"
          >
            <div className="w-10 h-9 rounded-2xl flex items-center justify-center bg-transparent">
              {isLoggedIn && userAvatar ? (
                <img src={userAvatar} className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-200" alt="Avatar" />
              ) : (
                <User className={`w-5 h-5 stroke-[1.8px] ${isLoggedIn ? 'text-[#6C63FF]' : 'text-gray-400'}`} />
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-wide ${isLoggedIn ? 'text-[#6C63FF]' : 'text-gray-400'}`}>
              {isLoggedIn ? (userName || 'Perfil') : 'Entrar'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
