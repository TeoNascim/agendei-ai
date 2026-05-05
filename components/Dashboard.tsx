
import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Calendar, TrendingUp, Plus, Settings, LogOut, X, Image as ImageIcon, Save, Loader2, Scissors, Clock, Trash2, Edit2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Provider, PortfolioPost, Service, Appointment } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import ImageUpload from './ImageUpload.tsx';
import { useToast } from './Toast.tsx';

interface DashboardProps {
  provider: Provider;
  onUpdate?: (provider: Provider) => void;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ provider, onUpdate, onLogout }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'availability'>('overview');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Real Metrics State
  const [metrics, setMetrics] = useState({ earnings: 0, appointments: 0, clients: 0 });

  // Post State
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');

  // Settings State
  const [editForm, setEditForm] = useState({
    name: provider.name,
    bio: provider.bio,
    category: provider.category,
    avatar: provider.avatar,
    coverImage: provider.coverImage
  });

  // Service State
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({ name: '', price: 0, duration: 30, description: '' });

  // Availability State
  const [slotGen, setSlotGen] = useState({ date: '', startTime: '09:00', endTime: '18:00', interval: 60 });

  // Fetch Real Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('price, user_id, status')
        .eq('provider_id', provider.id);

      if (appointments && !error) {
        const earnings = appointments.reduce((acc, curr) => acc + (curr.price || 0), 0);
        const totalApts = appointments.length;
        const uniqueClients = new Set(appointments.map(a => a.user_id).filter(Boolean)).size;

        setMetrics({ earnings, appointments: totalApts, clients: uniqueClients });
      }
    };
    if (provider.id) fetchMetrics();
  }, [provider.id]);


  const handleSavePost = async () => {
    if (!newPostImage) return;
    setIsLoading(true);

    const newPost: PortfolioPost = {
      id: crypto.randomUUID(),
      providerId: provider.id,
      providerName: provider.name,
      providerAvatar: provider.avatar,
      imageUrl: newPostImage,
      caption: newPostCaption,
      likes: 0,
      commentsCount: 0,
      timestamp: new Date().toISOString()
    };

    const updatedPortfolio = [newPost, ...(provider.portfolio || [])];

    try {
      const { error } = await supabase.from('providers').update({ portfolio: updatedPortfolio }).eq('id', provider.id);
      if (error) throw error;
      if (onUpdate) onUpdate({ ...provider, portfolio: updatedPortfolio });
      setIsPostModalOpen(false);
      setNewPostImage('');
      setNewPostCaption('');
      showToast('Post publicado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao salvar post. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('providers').update({
        name: editForm.name,
        bio: editForm.bio,
        category: editForm.category,
        avatar: editForm.avatar,
        cover_image: editForm.coverImage
      }).eq('id', provider.id);

      if (error) throw error;
      if (onUpdate) onUpdate({ ...provider, ...editForm });
      setIsSettingsModalOpen(false);
      showToast('Configurações salvas!', 'success');
    } catch (error) {
      showToast('Erro ao salvar configurações.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('ATENÇÃO: Isso excluirá permanentemente sua conta e todos os seus dados. Tem certeza absoluta?')) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('providers').delete().eq('id', provider.id);
      if (error) throw error;
      await supabase.auth.signOut();
      if (onLogout) onLogout();
    } catch (error) {
      console.error(error);
      showToast('Erro ao excluir conta. Tente novamente.', 'error');
      setIsLoading(false);
    }
  };

  const handleSaveService = async () => {
    if (!serviceForm.name || !serviceForm.price) return;
    setIsLoading(true);

    let updatedServices = [...(provider.services || [])];

    if (serviceForm.id) {
      updatedServices = updatedServices.map(s => s.id === serviceForm.id ? { ...s, ...serviceForm } as Service : s);
    } else {
      const newService: Service = {
        id: crypto.randomUUID(),
        name: serviceForm.name,
        price: Number(serviceForm.price),
        duration: Number(serviceForm.duration),
        description: serviceForm.description || ''
      };
      updatedServices.push(newService);
    }

    try {
      const { error } = await supabase.from('providers').update({ services: updatedServices }).eq('id', provider.id);
      if (error) throw error;
      if (onUpdate) onUpdate({ ...provider, services: updatedServices });
      setIsServiceModalOpen(false);
      setServiceForm({ name: '', price: 0, duration: 30, description: '' });
      showToast(serviceForm.id ? 'Serviço atualizado!' : 'Serviço adicionado!', 'success');
    } catch (error) {
      showToast('Erro ao salvar serviço.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditServiceClick = (service: Service) => {
    setServiceForm(service);
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;
    const updatedServices = provider.services.filter(s => s.id !== serviceId);
    try {
      await supabase.from('providers').update({ services: updatedServices }).eq('id', provider.id);
      if (onUpdate) onUpdate({ ...provider, services: updatedServices });
      showToast('Serviço removido.', 'warning');
    } catch (error) {
      showToast('Erro ao remover serviço.', 'error');
    }
  };

  const handleGenerateSlots = async () => {
    if (!slotGen.date || !slotGen.startTime || !slotGen.endTime) return;

    setIsLoading(true);
    const slotsToAdd: string[] = [];

    // Parse times
    const [startH, startM] = slotGen.startTime.split(':').map(Number);
    const [endH, endM] = slotGen.endTime.split(':').map(Number);

    const startDate = new Date(slotGen.date);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(slotGen.date);
    endDate.setHours(endH, endM, 0, 0);

    let current = startDate;

    while (current < endDate) {
      slotsToAdd.push(current.toISOString());
      current = new Date(current.getTime() + slotGen.interval * 60000);
    }

    // Merge unique
    const existing = new Set(provider.availableSlots || []);
    slotsToAdd.forEach(s => existing.add(s));
    const updatedSlots = Array.from(existing);

    try {
      await supabase.from('providers').update({ available_slots: updatedSlots }).eq('id', provider.id);
      if (onUpdate) onUpdate({ ...provider, availableSlots: updatedSlots });
      showToast(`${slotsToAdd.length} horários gerados com sucesso!`, 'success');
    } catch (error) {
      showToast('Erro ao gerar horários.', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteSlot = async (slot: string) => {
    const updatedSlots = provider.availableSlots.filter(s => s !== slot);
    try {
      await supabase.from('providers').update({ available_slots: updatedSlots }).eq('id', provider.id);
      if (onUpdate) onUpdate({ ...provider, availableSlots: updatedSlots });
    } catch (e) { showToast('Erro ao remover horário.', 'error'); }
  };

  const handleLogoutClick = () => {
    if (confirm('Tem certeza que deseja sair do seu painel?')) {
      if (onLogout) onLogout();
    }
  };

  // Group slots for display
  const groupedSlots: Record<string, string[]> = {};
  (provider.availableSlots || []).forEach(slot => {
    const date = new Date(slot).toLocaleDateString();
    if (!groupedSlots[date]) groupedSlots[date] = [];
    groupedSlots[date].push(slot);
  });


  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
           style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-4">
          <img src={provider.avatar} className="w-14 h-14 rounded-2xl object-cover" style={{ boxShadow: 'var(--shadow-md)' }} alt={provider.name} />
          <div>
            <h1 className="text-xl font-black text-gray-900">{provider.name}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>{provider.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-2xl flex-1 md:flex-none">
            {(['overview','services','availability'] as const).map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {['Visão Geral','Serviços','Horários'][i]}
              </button>
            ))}
          </div>
          <button onClick={() => { setEditForm({ name: provider.name, bio: provider.bio, category: provider.category, avatar: provider.avatar, coverImage: provider.coverImage }); setIsSettingsModalOpen(true); }}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={handleLogoutClick}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: '#FEF2F2' }}>
            <LogOut className="w-5 h-5" style={{ color: '#DC2626' }} />
          </button>
        </div>
      </div>

      {
        activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Ganhos', value: `R$ ${metrics.earnings}`, icon: DollarSign, grad: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', color: '#059669' },
                { label: 'Clientes', value: metrics.clients.toString(), icon: Users, grad: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', color: '#2563EB' },
                { label: 'Agendamentos', value: metrics.appointments.toString(), icon: Calendar, grad: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', color: 'var(--brand)' },
                { label: 'Crescimento', value: '+0%', icon: TrendingUp, grad: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', color: '#EA580C' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.grad }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-base font-black text-gray-900">Portfólio</h2>
              <button onClick={() => setIsPostModalOpen(true)}
                className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2.5 rounded-xl brand-gradient"
                style={{ boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>
                <Plus className="w-3.5 h-3.5" /> Novo Post
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {provider.portfolio && provider.portfolio.length > 0 ? (
                provider.portfolio.map(post => (
                  <div key={post.id} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer">
                    <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={post.caption} />
                    <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                         style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent)' }}>
                      <p className="text-white text-xs font-medium line-clamp-2">{post.caption}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl text-gray-300 font-medium"
                     style={{ boxShadow: 'var(--shadow-sm)' }}>
                  Nenhum post ainda. Adicione seu primeiro!
                </div>
              )}
            </div>
          </>
        )
      }

      {
        activeTab === 'services' && (
          <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-black text-gray-900">Gerenciar Serviços</h2>
              <button onClick={() => { setServiceForm({ name: '', price: 0, duration: 30, description: '' }); setIsServiceModalOpen(true); }}
                className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2.5 rounded-xl brand-gradient"
                style={{ boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {provider.services && provider.services.length > 0 ? (
                provider.services.map(service => (
                  <div key={service.id} className="flex justify-between items-center p-4 rounded-2xl border transition-all hover:border-indigo-200"
                       style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
                        <Scissors className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{service.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{service.duration} min • <span style={{ color: 'var(--brand)' }}>R$ {service.price}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditServiceClick(service)} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:text-indigo-600 transition-colors text-gray-400" style={{ border: '1px solid var(--border)' }}><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteService(service.id)} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:text-rose-500 transition-colors text-gray-400" style={{ border: '1px solid var(--border)' }}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-300 py-8 font-medium">Nenhum serviço cadastrado.</p>
              )}
            </div>
          </div>
        )
      }

      {
        activeTab === 'availability' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
                  <RefreshCw className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                </div>
                <h2 className="text-base font-black text-gray-900">Gerador de Horários</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Dia</label>
                  <input type="date" className="w-full p-3 rounded-xl text-sm font-medium input-brand transition-all" style={{ border: '1.5px solid var(--border)', background: 'var(--bg)' }} value={slotGen.date} onChange={e => setSlotGen({ ...slotGen, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Início</label>
                  <input type="time" className="w-full p-3 rounded-xl text-sm font-medium input-brand transition-all" style={{ border: '1.5px solid var(--border)', background: 'var(--bg)' }} value={slotGen.startTime} onChange={e => setSlotGen({ ...slotGen, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Fim</label>
                  <input type="time" className="w-full p-3 rounded-xl text-sm font-medium input-brand transition-all" style={{ border: '1.5px solid var(--border)', background: 'var(--bg)' }} value={slotGen.endTime} onChange={e => setSlotGen({ ...slotGen, endTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Intervalo (min)</label>
                  <input type="number" step="15" className="w-full p-3 rounded-xl text-sm font-medium input-brand transition-all" style={{ border: '1.5px solid var(--border)', background: 'var(--bg)' }} value={slotGen.interval} onChange={e => setSlotGen({ ...slotGen, interval: Number(e.target.value) })} />
                </div>
                <button onClick={handleGenerateSlots} disabled={isLoading} className="brand-gradient text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ height: '48px', boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>Gerar Slots</button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-6">
              <h2 className="text-xl font-black text-slate-900">Horários Disponíveis</h2>
              <div className="space-y-6">
                {Object.keys(groupedSlots).length > 0 ? (
                  Object.keys(groupedSlots).sort().map(date => (
                    <div key={date}>
                      <h3 className="font-bold text-slate-900 mb-3 sticky top-0 bg-white py-2">{date}</h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {groupedSlots[date].sort().map(slot => (
                          <div key={slot} className="flex justify-between items-center p-2 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm font-bold">
                            <span>{new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <button onClick={() => handleDeleteSlot(slot)} className="text-green-400 hover:text-green-700"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-8">Nenhum horário disponível.</p>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Modals... (Settings, Post, Service) */}
      {
        isPostModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative">
              <button onClick={() => setIsPostModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-indigo-600" /> Novo Post
              </h2>
              <div className="space-y-4">
                <ImageUpload
                  label="Imagem do Post"
                  value={newPostImage}
                  onUpload={setNewPostImage}
                />
                <input placeholder="Legenda" className="w-full p-4 bg-slate-50 rounded-xl border text-sm font-medium" value={newPostCaption} onChange={e => setNewPostCaption(e.target.value)} />
                <button onClick={handleSavePost} disabled={isLoading || !newPostImage} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold">Publicar</button>
              </div>
            </div>
          </div>
        )
      }

      {
        isSettingsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg p-8 rounded-[40px] shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsSettingsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-indigo-600" /> Configurações
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                    <input type="text" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <ImageUpload
                      label="Avatar"
                      value={editForm.avatar}
                      onUpload={(url) => setEditForm(prev => ({ ...prev, avatar: url }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <ImageUpload
                      label="Capa do Perfil"
                      value={editForm.coverImage}
                      onUpload={(url) => setEditForm(prev => ({ ...prev, coverImage: url }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bio</label>
                    <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" />
                  </div>
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>Salvar Alterações</span>
                </button>

                <div className="pt-8 mt-8 border-t border-slate-100">
                  <h3 className="text-rose-600 font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Zona de Perigo</h3>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full bg-rose-50 text-rose-600 border border-rose-100 py-4 rounded-xl font-black hover:bg-rose-100 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Excluir Conta Permanentemente</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        isServiceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative">
              <button onClick={() => setIsServiceModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black text-slate-900 mb-6">{serviceForm.id ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <div className="space-y-4">
                <input placeholder="Nome (ex: Corte)" className="w-full p-4 bg-slate-50 rounded-xl border" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
                <div className="flex gap-4">
                  <input type="number" placeholder="Preço" className="w-full p-4 bg-slate-50 rounded-xl border" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: Number(e.target.value) })} />
                  <input type="number" placeholder="Duração (min)" className="w-full p-4 bg-slate-50 rounded-xl border" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })} />
                </div>
                <button onClick={handleSaveService} disabled={isLoading} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold">{serviceForm.id ? 'Salvar Alterações' : 'Adicionar Serviço'}</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Dashboard;
