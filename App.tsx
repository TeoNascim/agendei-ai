
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Navigation from './components/Navigation.tsx';
import ProviderProfile from './components/ProviderProfile.tsx';
import Dashboard from './components/Dashboard.tsx';
import UserArea from './components/UserArea.tsx';
import ProfessionalOnboarding from './components/ProfessionalOnboarding.tsx';
import { MOCK_PROVIDERS } from './constants.ts';
import { Appointment, Provider } from './types.ts';
import { supabase } from './lib/supabase.ts';
import { useToast } from './components/Toast.tsx';
import { Search, MapPin, Sparkles, X, ShieldCheck, RefreshCw, Briefcase } from 'lucide-react';

// ─── Helper: mapeia linha do banco para o tipo Provider ────────────────────────
const mapProviderFromDB = (p: any): Provider => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category: p.category,
  bio: p.bio,
  avatar: p.avatar,
  coverImage: p.cover_image,
  services: p.services || [],
  portfolio: p.portfolio || [],
  reviews: [],
  availableSlots: p.available_slots || []
});

// ─── Wrapper para rota de perfil por slug ─────────────────────────────────────
const ProviderProfileWrapper: React.FC<{
  onAppointmentConfirmed: (apt: Appointment) => void,
  customProviders: Provider[]
}> = ({ onAppointmentConfirmed, customProviders }) => {
  const { slug } = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findProvider = async () => {
      // 1. Procura nos providers carregados em memória (mock + DB)
      const local = customProviders.find(p => p.slug === slug);
      if (local) {
        setProvider(local);
        setLoading(false);
        return;
      }

      // 2. Fallback: busca direto no banco (caso não esteja na lista local)
      const { data, error } = await supabase.from('providers').select('*').eq('slug', slug).single();
      if (data && !error) setProvider(mapProviderFromDB(data));

      setLoading(false);
    };

    if (slug) findProvider();
  }, [slug, customProviders]);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando perfil...</div>;
  if (!provider) return <div className="p-8 text-center text-slate-500">Profissional não encontrado.</div>;

  return <ProviderProfile provider={provider} onAppointmentConfirmed={onAppointmentConfirmed} />;
};

// ─── Conteúdo principal da aplicação ─────────────────────────────────────────
const MainContent: React.FC = () => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfessionalLoggedIn, setIsProfessionalLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loginType, setLoginType] = useState<'client' | 'professional'>('client');
  const [customProviders, setCustomProviders] = useState<Provider[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [myProvider, setMyProvider] = useState<Provider | null>(null);

  // Info do usuário para a navegação
  const [userInfo, setUserInfo] = useState<{ name: string, avatar: string } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ── Carrega providers do banco ──────────────────────────────────────────────
  const fetchProviders = useCallback(async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase.from('providers').select('*');
    if (data && !error) {
      setCustomProviders(data.map(mapProviderFromDB));
    }
    setIsLoadingData(false);
  }, []);

  // ── Busca o provider do profissional logado (query real por user_id) ────────
  const fetchMyProvider = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      setMyProvider(mapProviderFromDB(data));
    } else {
      // Fallback para modo demo (sem provider real vinculado)
      setMyProvider(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        const userType = localStorage.getItem('last_login_type');
        if (userType === 'professional') {
          setIsProfessionalLoggedIn(true);
          fetchMyProvider(session.user.id);
        }

        // Extrai info do usuário para a nav
        const { user_metadata } = session.user;
        const name = user_metadata.full_name || user_metadata.name || session.user.email?.split('@')[0] || 'Usuário';
        const avatar = user_metadata.avatar_url || user_metadata.picture || '';
        setUserInfo({ name, avatar });
      } else {
        setIsLoggedIn(false);
        setIsProfessionalLoggedIn(false);
        setMyProvider(null);
        setUserInfo(null);
      }
    });

    fetchProviders();
    return () => subscription.unsubscribe();
  }, [fetchProviders, fetchMyProvider]);

  // ── Login Demo ──────────────────────────────────────────────────────────────
  const handleDemoLogin = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      if (loginType === 'client') {
        setIsLoggedIn(true);
        setUserInfo({ name: 'Visitante Demo', avatar: '' });
        navigate('/me');
      } else {
        setIsProfessionalLoggedIn(true);
        setMyProvider(MOCK_PROVIDERS[0]);
        setUserInfo({ name: MOCK_PROVIDERS[0].name, avatar: MOCK_PROVIDERS[0].avatar });
        navigate('/pro/dashboard');
      }
      setIsAuthenticating(false);
      setShowLoginModal(false);
    }, 800);
  };

  // ── Login Google OAuth ──────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    localStorage.setItem('last_login_type', loginType);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error: any) {
      showToast('Erro ao conectar com o Google. Tente novamente.', 'error');
      setIsAuthenticating(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsProfessionalLoggedIn(false);
    setMyProvider(null);
    setUserInfo(null);
    localStorage.removeItem('last_login_type');
    navigate('/');
  };

  // ── Salvar agendamento (com remoção de slot e insert correto) ───────────────
  const saveAppointment = async (newApt: Appointment) => {
    const { data: { user } } = await supabase.auth.getUser();

    // Insert com nomes de colunas corretos (snake_case do banco)
    const { error } = await supabase.from('appointments').insert([{
      id: newApt.id,
      provider_id: newApt.providerId,
      provider_name: newApt.providerName,
      service_name: newApt.serviceName,
      client_name: newApt.clientName,
      start_time: newApt.startTime,
      status: newApt.status,
      price: newApt.price,
      user_id: user?.id || null
    }]);

    if (error) {
      console.error('Erro ao salvar agendamento:', error);
      showToast('Erro ao salvar agendamento no banco.', 'error');
    }

    // Remove o slot agendado da lista de disponíveis do provider
    const targetProvider = [...MOCK_PROVIDERS, ...customProviders].find(p => p.id === newApt.providerId);
    if (targetProvider) {
      const updatedSlots = targetProvider.availableSlots.filter(s => s !== newApt.startTime);
      await supabase.from('providers').update({ available_slots: updatedSlots }).eq('id', newApt.providerId);
      handleProviderUpdate({ ...targetProvider, availableSlots: updatedSlots });
    }

    setAppointments(prev => [newApt, ...prev]);
    showToast('Agendamento confirmado com sucesso! 🎉', 'success');
  };

  // ── Atualizar provider (cache local + banco) ────────────────────────────────
  const handleProviderUpdate = async (updatedProvider: Provider) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('providers').upsert({
      id: updatedProvider.id,
      name: updatedProvider.name,
      slug: updatedProvider.slug,
      category: updatedProvider.category,
      bio: updatedProvider.bio,
      avatar: updatedProvider.avatar,
      cover_image: updatedProvider.coverImage,
      services: updatedProvider.services,
      portfolio: updatedProvider.portfolio,
      available_slots: updatedProvider.availableSlots,
      user_id: user?.id
    });
    setCustomProviders(prev => {
      const exists = prev.some(p => p.id === updatedProvider.id);
      return exists
        ? prev.map(p => p.id === updatedProvider.id ? updatedProvider : p)
        : [updatedProvider, ...prev];
    });
    // Atualiza avatar na nav se for o profissional logado
    if (updatedProvider.avatar && isProfessionalLoggedIn) {
      setUserInfo(prev => prev ? { ...prev, name: updatedProvider.name, avatar: updatedProvider.avatar } : null);
    }
  };

  const allProviders = [...MOCK_PROVIDERS, ...customProviders];

  // ── Tab ativa para highlight da nav ────────────────────────────────────────
  const getActiveTab = () => {
    if (location.pathname === '/') return 'explore';
    if (location.pathname === '/me') return 'user-area';
    if (location.pathname.startsWith('/pro')) return 'provider-area';
    return 'explore';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 md:pt-20">
      <Navigation
        activeTab={getActiveTab()}
        setActiveTab={(tab) => {
          if (tab === 'explore') navigate('/');
          if (tab === 'user-area') navigate('/me');
          if (tab === 'provider-area') navigate('/pro/dashboard');
        }}
        isLoggedIn={isLoggedIn || isProfessionalLoggedIn}
        onLoginClick={() => {
          if (isLoggedIn || isProfessionalLoggedIn) handleLogout();
          else { setLoginType('client'); setShowLoginModal(true); }
        }}
        userAvatar={userInfo?.avatar}
        userName={userInfo?.name?.split(' ')[0]}
      />

      <main>
        {isLoadingData ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <Routes>
            {/* 1. Explorar / Home */}
            <Route path="/" element={
              <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-24">
                <header className="space-y-6">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Agende agora</h1>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="search-providers"
                      type="text"
                      placeholder="Barbeiro, Psicólogo..."
                      className="w-full bg-white border border-slate-100 rounded-3xl py-5 pl-12 pr-6 shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allProviders
                    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(p => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/p/${p.slug}`)}
                        className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-100 group"
                      >
                        <div className="h-56 overflow-hidden">
                          <img src={p.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} />
                        </div>
                        <div className="p-6 relative">
                          <img src={p.avatar} className="w-16 h-16 rounded-3xl object-cover border-4 border-white shadow-xl absolute -top-8 left-6" alt="Avatar" />
                          <div className="pt-8">
                            <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                            <p className="text-xs text-slate-400 font-bold flex items-center mt-1 uppercase tracking-widest">
                              <MapPin className="w-3 h-3 mr-1 text-indigo-500" /> {p.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            } />

            {/* 2. Área do cliente */}
            <Route path="/me" element={
              <UserArea
                appointments={appointments}
                isLoggedIn={isLoggedIn}
                onLoginClick={() => { setLoginType('client'); setShowLoginModal(true); }}
              />
            } />

            {/* 3. Área do profissional */}
            <Route path="/pro/dashboard" element={
              !isProfessionalLoggedIn ? (
                <div className="max-w-4xl mx-auto p-8 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
                  <Briefcase className="w-16 h-16 text-indigo-600" />
                  <h2 className="text-3xl font-black text-slate-900">Sou Profissional</h2>
                  <div className="flex flex-col space-y-4 w-full max-w-xs">
                    <button
                      id="btn-login-professional"
                      onClick={() => { setLoginType('professional'); setShowLoginModal(true); }}
                      className="bg-indigo-600 text-white p-6 rounded-[32px] font-black shadow-xl"
                    >
                      Entrar no Painel
                    </button>
                    <button
                      id="btn-create-profile"
                      onClick={() => setShowOnboarding(true)}
                      className="bg-white border border-slate-200 p-5 rounded-[32px] font-black text-slate-600"
                    >
                      Criar Perfil Grátis
                    </button>
                  </div>
                </div>
              ) : (
                myProvider
                  ? <Dashboard provider={myProvider} onUpdate={handleProviderUpdate} onLogout={handleLogout} />
                  : (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                      <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                      <p className="text-slate-500 font-medium">Carregando seu perfil...</p>
                    </div>
                  )
              )
            } />

            {/* 4. Perfil público do provider (por slug) */}
            <Route path="/p/:slug" element={
              <ProviderProfileWrapper onAppointmentConfirmed={saveAppointment} customProviders={allProviders} />
            } />

          </Routes>
        )}
      </main>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-10 rounded-[48px] shadow-2xl relative text-center">
            <button id="btn-close-login" onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900">
              <X className="w-6 h-6" />
            </button>
            <ShieldCheck className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-900 mb-8">Entrar no Agendei AI</h2>
            <div className="space-y-4">
              <button
                id="btn-google-login"
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="w-full bg-white border-2 border-slate-100 py-5 rounded-[32px] font-black flex items-center justify-center space-x-3 hover:border-slate-200 transition-colors disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="G" />
                <span>LOGAR COM GOOGLE</span>
              </button>
              <button
                id="btn-demo-login"
                onClick={handleDemoLogin}
                disabled={isAuthenticating}
                className="w-full bg-slate-900 text-white py-5 rounded-[32px] font-black flex items-center justify-center space-x-3 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>MODO DEMONSTRAÇÃO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding de profissional */}
      {showOnboarding && (
        <ProfessionalOnboarding
          onClose={() => setShowOnboarding(false)}
          onComplete={(p) => {
            handleProviderUpdate(p);
            setIsProfessionalLoggedIn(true);
            setMyProvider(p);
            navigate('/pro/dashboard');
            setShowOnboarding(false);
            showToast('Perfil criado com sucesso! Bem-vindo ao painel. 🚀', 'success');
          }}
        />
      )}
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
};

export default App;
