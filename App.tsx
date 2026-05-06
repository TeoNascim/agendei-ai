
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import Navigation from './components/Navigation.tsx';
import ProviderProfile from './components/ProviderProfile.tsx';
import Dashboard from './components/Dashboard.tsx';
import UserArea from './components/UserArea.tsx';
import ProfessionalOnboarding from './components/ProfessionalOnboarding.tsx';
import { MOCK_PROVIDERS } from './constants.ts';
import { Appointment, Provider } from './types.ts';
import { supabase } from './lib/supabase.ts';
import { useToast } from './components/Toast.tsx';
import { Search, MapPin, Sparkles, X, ShieldCheck, RefreshCw, Briefcase, Clock, Star } from 'lucide-react';

// ─── Helper ───────────────────────────────────────────────────────────────────
const mapProviderFromDB = (p: any): Provider => ({
  id: p.id, name: p.name, slug: p.slug, category: p.category,
  bio: p.bio, avatar: p.avatar, coverImage: p.cover_image,
  services: p.services || [], portfolio: p.portfolio || [],
  reviews: [], availableSlots: p.available_slots || []
});

// Category chips for quick filter
const CATEGORIES = ['Todos', 'Barbearia', 'Psicologia', 'Estética', 'Nutrição', 'Personal', 'Fisio'];

// ─── Provider Profile Wrapper ─────────────────────────────────────────────────
const ProviderProfileWrapper: React.FC<{
  onAppointmentConfirmed: (apt: Appointment) => void;
  customProviders: Provider[];
}> = ({ onAppointmentConfirmed, customProviders }) => {
  const { slug } = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const find = async () => {
      const local = customProviders.find(p => p.slug === slug);
      if (local) { setProvider(local); setLoading(false); return; }
      const { data, error } = await supabase.from('providers').select('*').eq('slug', slug).single();
      if (data && !error) setProvider(mapProviderFromDB(data));
      setLoading(false);
    };
    if (slug) find();
  }, [slug, customProviders]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--brand)' }} />
      <p className="text-gray-400 font-medium text-sm">Carregando perfil...</p>
    </div>
  );
  if (!provider) return (
    <div className="flex items-center justify-center min-h-[70vh] text-gray-400 font-medium">
      Profissional não encontrado.
    </div>
  );
  return <ProviderProfile provider={provider} onAppointmentConfirmed={onAppointmentConfirmed} />;
};

// ─── Main Content ─────────────────────────────────────────────────────────────
const MainContent: React.FC = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
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
  const [userInfo, setUserInfo] = useState<{ name: string; avatar: string } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchProviders = useCallback(async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase.from('providers').select('*');
    if (data && !error) setCustomProviders(data.map(mapProviderFromDB));
    setIsLoadingData(false);
  }, []);

  const fetchMyProvider = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('providers').select('*').eq('user_id', userId).single();
    if (data && !error) setMyProvider(mapProviderFromDB(data));
    else setMyProvider(null);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        setIsLoggedIn(true);
        const t = localStorage.getItem('last_login_type');
        if (t === 'professional') { setIsProfessionalLoggedIn(true); fetchMyProvider(session.user.id); }
        const { user_metadata } = session.user;
        setUserInfo({
          name: user_metadata.full_name || user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
          avatar: user_metadata.avatar_url || user_metadata.picture || ''
        });
      } else {
        setIsLoggedIn(false); setIsProfessionalLoggedIn(false);
        setMyProvider(null); setUserInfo(null);
      }
    });
    fetchProviders();
    return () => subscription.unsubscribe();
  }, [fetchProviders, fetchMyProvider]);

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

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    localStorage.setItem('last_login_type', loginType);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch {
      showToast('Erro ao conectar com o Google.', 'error');
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false); setIsProfessionalLoggedIn(false);
    setMyProvider(null); setUserInfo(null);
    localStorage.removeItem('last_login_type');
    navigate('/');
  };

  const saveAppointment = async (newApt: Appointment) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('appointments').insert([{
      id: newApt.id, provider_id: newApt.providerId, provider_name: newApt.providerName,
      service_name: newApt.serviceName, client_name: newApt.clientName,
      start_time: newApt.startTime, status: newApt.status, price: newApt.price,
      user_id: user?.id || null
    }]);
    if (error) showToast('Erro ao salvar agendamento.', 'error');

    const target = [...MOCK_PROVIDERS, ...customProviders].find(p => p.id === newApt.providerId);
    if (target) {
      const upSlots = target.availableSlots.filter(s => s !== newApt.startTime);
      await supabase.from('providers').update({ available_slots: upSlots }).eq('id', newApt.providerId);
      handleProviderUpdate({ ...target, availableSlots: upSlots });
    }
    setAppointments(prev => [newApt, ...prev]);
    showToast('Agendamento confirmado! 🎉', 'success');
  };

  const handleProviderUpdate = async (updated: Provider) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('providers').upsert({
      id: updated.id, name: updated.name, slug: updated.slug, category: updated.category,
      bio: updated.bio, avatar: updated.avatar, cover_image: updated.coverImage,
      services: updated.services, portfolio: updated.portfolio,
      available_slots: updated.availableSlots, user_id: user?.id
    });
    setCustomProviders(prev => {
      const exists = prev.some(p => p.id === updated.id);
      return exists ? prev.map(p => p.id === updated.id ? updated : p) : [updated, ...prev];
    });
    if (updated.avatar && isProfessionalLoggedIn)
      setUserInfo(prev => prev ? { ...prev, name: updated.name, avatar: updated.avatar } : null);
  };

  const allProviders = [...MOCK_PROVIDERS, ...customProviders];

  const filteredProviders = allProviders.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === 'Todos' || p.category.toLowerCase().includes(activeCategory.toLowerCase());
    return matchSearch && matchCat;
  });

  const getActiveTab = () => {
    if (location.pathname === '/') return 'explore';
    if (location.pathname === '/me') return 'user-area';
    if (location.pathname.startsWith('/pro')) return 'provider-area';
    return 'explore';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navigation
        activeTab={getActiveTab()}
        setActiveTab={tab => {
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

      <main className="md:pt-[68px] pb-28 md:pb-8">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center"
                 style={{ boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
            </div>
            <p className="text-gray-400 font-medium">Carregando...</p>
          </div>
        ) : (
          <Routes>

            {/* ── Home / Explore ── */}
            <Route path="/" element={
              <div className="animate-fade-up">

                {/* ── Hero Dark ───────────────────────────────────── */}
                <div className="hero-gradient relative overflow-hidden flex flex-col justify-center"
                     style={{ minHeight: 'calc(100vh - 68px)' }}>

                  {/* Blobs animados */}
                  <div className="hero-blob w-[500px] h-[500px] -top-32 -right-32 opacity-25"
                       style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)', animationDelay: '0s' }} />
                  <div className="hero-blob w-80 h-80 -bottom-24 -left-20 opacity-20"
                       style={{ background: 'radial-gradient(circle, #5B4FE8, transparent 70%)', animationDelay: '3s' }} />
                  <div className="hero-blob w-56 h-56 opacity-15"
                       style={{ background: 'radial-gradient(circle, #F59E0B, transparent 70%)', animationDelay: '5s', top: '60%', left: '55%' }} />

                  {/* Dot grid sutil */}
                  <div className="absolute inset-0 opacity-10"
                       style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                  <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 relative w-full">
                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-2 mb-5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                        ✦ Agendamentos com IA
                      </span>
                    </div>

                    {/* Título */}
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.08] mb-4">
                      Encontre seu<br />
                      <span style={{ color: '#F59E0B' }}>profissional ideal</span>
                    </h1>
                    <p className="text-white/60 font-medium mb-10 text-base md:text-lg max-w-lg leading-relaxed">
                      Agende qualquer serviço com inteligência artificial.<br className="hidden md:block" />
                      Sem ligações, sem espera, sem complicação.
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-2xl">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="search-providers"
                        type="text"
                        placeholder="Buscar barbeiro, psicólogo, nutricionista..."
                        className="w-full bg-white rounded-2xl py-4 pr-5 text-sm font-medium input-brand transition-all"
                        style={{
                          paddingLeft: '3.25rem',
                          border: 'none',
                          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
                          color: 'var(--text-1)'
                        }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Category chips — glass escuro */}
                    <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border"
                          style={{
                            background: activeCategory === cat ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                            color: activeCategory === cat ? '#1a1060' : 'rgba(255,255,255,0.75)',
                            borderColor: activeCategory === cat ? '#F59E0B' : 'rgba(255,255,255,0.2)',
                            boxShadow: activeCategory === cat ? '0 4px 16px rgba(245,158,11,0.4)' : 'none',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Provider Cards Grid */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                  {filteredProviders.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-semibold">Nenhum profissional encontrado.</p>
                      <p className="text-gray-300 text-sm mt-1">Tente outra busca ou categoria.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-700">
                          {filteredProviders.length} profissiona{filteredProviders.length !== 1 ? 'is' : 'l'}
                        </h2>
                      </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredProviders.map((p, i) => (
                            <div
                              key={p.id}
                              onClick={() => navigate(`/p/${p.slug}`)}
                              className="bg-white rounded-3xl overflow-hidden cursor-pointer card-hover group"
                              style={{ boxShadow: 'var(--shadow-card)', animationDelay: `${i * 60}ms` }}
                            >
                              {/* Cover */}
                              <div className="relative h-52 overflow-hidden">
                                <img
                                  src={p.coverImage}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  alt={p.name}
                                />
                                {/* Gradient overlay mais pronunciado */}
                                <div className="absolute inset-0"
                                     style={{ background: 'linear-gradient(to top, rgba(13,11,38,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />

                                {/* Badge categoria — glass */}
                                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest glass-dark border border-white/10">
                                  {p.category}
                                </span>

                                {/* Slots disponíveis */}
                                {p.availableSlots.length > 0 && (
                                  <span className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold glass-dark border border-white/10"
                                        style={{ color: '#34D399' }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Disponível
                                  </span>
                                )}

                                {/* Nome sobre a imagem */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
                                  <img
                                    src={p.avatar}
                                    className="w-12 h-12 rounded-2xl object-cover border-[2.5px] border-white/80 flex-shrink-0"
                                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                                    alt={p.name}
                                  />
                                  <div className="min-w-0">
                                    <h3 className="font-black text-white text-base leading-snug truncate">{p.name}</h3>
                                    <p className="text-white/60 text-xs font-medium">{p.services.length} serviço{p.services.length !== 1 ? 's' : ''}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="px-4 py-3.5 flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-400 font-medium">A partir de</p>
                                  <p className="font-black text-base" style={{ color: 'var(--brand)' }}>
                                    R$ {p.services[0]?.price || '—'}
                                  </p>
                                </div>
                                <span className="text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                      style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                                  Ver perfil →
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                </div>
              </div>
            } />



            {/* ── Área do Cliente ── */}
            <Route path="/me" element={
              <UserArea
                appointments={appointments}
                isLoggedIn={isLoggedIn}
                onLoginClick={() => { setLoginType('client'); setShowLoginModal(true); }}
              />
            } />

            {/* ── Área do Profissional ── */}
            <Route path="/pro/dashboard" element={
              !isProfessionalLoggedIn ? (
                <div className="max-w-lg mx-auto px-6 pt-16 pb-32 text-center animate-fade-up">
                  <div className="w-20 h-20 brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-6"
                       style={{ boxShadow: '0 8px 32px rgba(108,99,255,0.3)' }}>
                    <Briefcase className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Área Profissional</h2>
                  <p className="text-gray-400 font-medium mb-10 text-base">
                    Gerencie seus agendamentos e perfil profissional.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      id="btn-login-professional"
                      onClick={() => { setLoginType('professional'); setShowLoginModal(true); }}
                      className="w-full brand-gradient text-white py-4 rounded-2xl font-bold text-base shadow-lg"
                      style={{ boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}
                    >
                      Entrar no Painel
                    </button>
                    <button
                      id="btn-create-profile"
                      onClick={() => setShowOnboarding(true)}
                      className="w-full bg-white border py-4 rounded-2xl font-bold text-base text-gray-700 hover:bg-gray-50 transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      Criar Perfil Grátis
                    </button>
                  </div>
                </div>
              ) : myProvider ? (
                <Dashboard provider={myProvider} onUpdate={handleProviderUpdate} onLogout={handleLogout} />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                  <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--brand)' }} />
                  <p className="text-gray-400 font-medium">Carregando seu perfil...</p>
                </div>
              )
            } />

            {/* ── Perfil Público ── */}
            <Route path="/p/:slug" element={
              <ProviderProfileWrapper onAppointmentConfirmed={saveAppointment} customProviders={allProviders} />
            } />

          </Routes>
        )}
      </main>

      {/* ── Modal de Login ────────────────────────────────────────────── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
             style={{ background: 'rgba(15,15,26,0.65)', backdropFilter: 'blur(12px)' }}
             onClick={e => { if (e.target === e.currentTarget) setShowLoginModal(false); }}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-8 sm:p-10 animate-scale-in"
               style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>

            {/* Handle (mobile) */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-8 sm:hidden" />

            <button id="btn-close-login" onClick={() => setShowLoginModal(false)}
                    className="absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4"
                   style={{ boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Bem-vindo ao<br/>Agendei AI</h2>
              <p className="text-gray-400 text-sm font-medium mt-1">
                {loginType === 'professional' ? 'Entre como profissional' : 'Entre para agendar com facilidade'}
              </p>
            </div>

            {/* Type switch */}
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
              {(['client', 'professional'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setLoginType(type)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${loginType === type ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                >
                  {type === 'client' ? '👤 Cliente' : '💼 Profissional'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <button
                id="btn-google-login"
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="w-full bg-white border py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--text-1)' }}
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Continuar com Google
              </button>
              <button
                id="btn-demo-login"
                onClick={handleDemoLogin}
                disabled={isAuthenticating}
                className="w-full brand-gradient text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}
              >
                <Sparkles className="w-4 h-4" />
                {isAuthenticating ? 'Carregando...' : 'Modo Demonstração'}
              </button>
            </div>

            <p className="text-center text-xs text-gray-300 mt-5 font-medium">
              Ao entrar, você aceita nossos termos de uso
            </p>
          </div>
        </div>
      )}

      {/* ── Onboarding ── */}
      {showOnboarding && (
        <ProfessionalOnboarding
          onClose={() => setShowOnboarding(false)}
          onComplete={p => {
            handleProviderUpdate(p);
            setIsProfessionalLoggedIn(true);
            setMyProvider(p);
            navigate('/pro/dashboard');
            setShowOnboarding(false);
            showToast('Perfil criado! Bem-vindo ao painel. 🚀', 'success');
          }}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <MainContent />
  </BrowserRouter>
);

export default App;
