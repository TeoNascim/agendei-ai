
import React from 'react';
import { Calendar, Briefcase, Search, User, LogIn } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  userAvatar?: string;
  userName?: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, isLoggedIn, onLoginClick, userAvatar, userName }) => {
  const tabs = [
    { id: 'explore', label: 'Explorar', icon: Search },
    { id: 'user-area', label: 'Meus Agendamentos', icon: Calendar },
    { id: 'provider-area', label: 'Sou Profissional', icon: Briefcase },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:top-0 md:bottom-auto md:h-20 md:border-t-0 md:border-b">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center h-16 md:h-full px-4">
        {/* Logo */}
        <div className="hidden md:flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">A</div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tighter">Agendei AI</span>
        </div>

        {/* Navigation Items */}
        <div className="flex justify-around w-full md:w-auto md:space-x-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'explore' && activeTab === 'provider-detail');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative py-1 ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                </div>
                <span className={`text-[10px] md:text-xs font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status/Login Action */}
        <div className="hidden md:block">
          <button
            onClick={onLoginClick}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl border transition-all active:scale-95 ${isLoggedIn
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 pl-2'
                : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
              }`}
          >
            {isLoggedIn ? (
              <>
                {userAvatar ? (
                  <img src={userAvatar} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt="Avatar" />
                ) : (
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="text-xs font-black uppercase tracking-widest truncate max-w-[100px]">{userName || 'Meu Perfil'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Entrar / Criar Conta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
