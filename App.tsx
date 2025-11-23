
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { UserProfile, UserGoal, UserLevel, UserGender } from './types';
import Login from './components/Login';
import WorkoutDashboard from './components/WorkoutDashboard';
import DietGenerator from './components/DietGenerator';
import ChatAssistant from './components/ChatAssistant';
import AffiliateDashboard from './components/AffiliateDashboard';
import DashboardHome from './components/DashboardHome';
import SystemConfig from './components/SystemConfig';
import { Dumbbell, Utensils, MessageSquare, TrendingUp, Home, Menu, X, Loader2, LogOut, User, UserCheck } from 'lucide-react';

const INITIAL_USER_TEMPLATE: UserProfile = {
  name: '',
  age: 25,
  weight: 70,
  height: 175,
  gender: UserGender.MALE,
  goal: UserGoal.DEFINITION,
  level: UserLevel.BEGINNER,
  location: 'Academia',
  budget: 50
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [view, setView] = useState<'onboarding' | 'home' | 'workout' | 'diet' | 'chat' | 'affiliate'>('onboarding');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_TEMPLATE);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [needsConfig, setNeedsConfig] = useState(false);

  useEffect(() => {
    // 1. Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      setNeedsConfig(true);
      setLoadingAuth(false);
      return;
    }

    // 2. Verificar sessão ativa
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error fetching session:", error);
        // Se a chave for inválida, o getSession pode falhar
        if (error.message?.includes('fetch') || error.message?.includes('apikey')) {
           setNeedsConfig(true);
           setLoadingAuth(false);
           return;
        }
      }
      
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoadingAuth(false);
    });

    // 3. Ouvir mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUser(INITIAL_USER_TEMPLATE);
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setLoadingAuth(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        
        // Verificação robusta de erros de conexão
        const errorMsg = error.message?.toLowerCase() || '';
        const isConnectionError = errorMsg.includes('fetch') || 
                                  errorMsg.includes('connection') || 
                                  errorMsg.includes('network') ||
                                  errorMsg.includes('apikey');

        if (isConnectionError) {
            setNeedsConfig(true);
            return;
        }
        
        // Se não encontrou perfil (PGRST116), vai pro onboarding. Se for outro erro, loga.
        if (error.code !== 'PGRST116') {
             console.warn("Erro desconhecido ao carregar perfil, redirecionando para onboarding.");
        }
        setView('onboarding');
      } else if (data) {
        setUser({
          id: userId,
          name: data.name,
          age: data.age || 25,
          gender: data.gender || UserGender.MALE,
          weight: data.weight,
          height: data.height,
          goal: data.goal as UserGoal,
          level: data.level as UserLevel,
          location: data.location as any,
          budget: data.budget
        });
        setView('home');
      } else {
        setView('onboarding');
      }
    } catch (error: any) {
      console.error('Exceção ao buscar perfil:', error);
      if (error.message?.includes('fetch')) {
          setNeedsConfig(true);
      } else {
          setView('onboarding');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleOnboardingSubmit = async () => {
    if (!session?.user) return;
    
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          name: user.name,
          age: user.age,
          gender: user.gender,
          weight: user.weight,
          height: user.height,
          goal: user.goal,
          level: user.level,
          location: user.location,
          budget: user.budget
        });

      if (error) throw error;
      // Update local state with ID
      setUser(prev => ({ ...prev, id: session.user.id }));
      setView('home');
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil: ' + (error.message || 'Tente novamente.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('onboarding');
    setFormStep(0);
  };

  const NavButton = ({ id, icon: Icon, label }: { id: typeof view, icon: any, label: string }) => (
    <button 
      onClick={() => { setView(id); setIsMenuOpen(false); }}
      className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all ${
        view === id 
          ? 'bg-white text-red-700 font-bold shadow-lg scale-105' 
          : 'text-pink-100 hover:bg-white/10'
      }`}
    >
      <Icon size={24} />
      <span className="text-lg">{label}</span>
    </button>
  );

  // Se a URL/Key do Supabase não estiverem configuradas, mostra a tela de config
  if (needsConfig) {
    return <SystemConfig />;
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#1a0505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#500000] via-[#D00000] to-[#FFC0CB] flex items-center justify-center p-6 font-inter">
        <div className="max-w-2xl w-full bg-black/30 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter text-center">ACER FITNESS <span className="text-red-500">PRO</span></h1>
          <p className="text-pink-200 mb-8 text-center">Vamos configurar seu perfil pessoal.</p>
          
          {formStep === 0 && (
            <div className="space-y-5 animate-fade-in max-w-md mx-auto">
               <h2 className="text-xl text-white font-bold">Dados Pessoais</h2>
               
               <input 
                 type="text" 
                 value={user.name}
                 onChange={e => setUser({...user, name: e.target.value})}
                 className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:border-red-500 transition-colors"
                 placeholder="Seu nome completo"
               />

               <div>
                 <label className="text-xs text-pink-200 ml-1 uppercase font-bold tracking-wider mb-2 block">Gênero Biológico</label>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                        { val: UserGender.MALE, label: 'Masculino', icon: User },
                        { val: UserGender.FEMALE, label: 'Feminino', icon: UserCheck },
                        { val: UserGender.OTHER, label: 'Outro', icon: User },
                        { val: UserGender.PREFER_NOT_TO_SAY, label: 'Prefiro não', icon: User }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => setUser({...user, gender: opt.val})}
                            className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold border transition-all group ${
                                user.gender === opt.val 
                                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/30' 
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <opt.icon size={16} className={user.gender === opt.val ? "text-white" : "text-gray-500 group-hover:text-white"} />
                            <span className="truncate">{opt.label}</span>
                        </button>
                    ))}
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs text-pink-200 ml-1">Idade</label>
                    <input 
                        type="number" 
                        placeholder="Anos"
                        value={user.age}
                        onChange={e => setUser({...user, age: Number(e.target.value)})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-pink-200 ml-1">Peso (kg)</label>
                    <input 
                        type="number" 
                        placeholder="kg"
                        value={user.weight}
                        onChange={e => setUser({...user, weight: Number(e.target.value)})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-pink-200 ml-1">Altura (cm)</label>
                    <input 
                        type="number" 
                        placeholder="cm"
                        value={user.height}
                        onChange={e => setUser({...user, height: Number(e.target.value)})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none"
                    />
                 </div>
               </div>
               <button onClick={() => setFormStep(1)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95 shadow-lg shadow-red-900/50">
                 Continuar
               </button>
            </div>
          )}

          {formStep === 1 && (
             <div className="space-y-4 animate-fade-in">
               <h2 className="text-xl text-white font-bold text-center mb-4">Qual seu principal objetivo?</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                 {Object.values(UserGoal).map((g) => (
                   <button 
                     key={g}
                     onClick={() => setUser({...user, goal: g})}
                     className={`p-4 rounded-xl text-left border transition-all ${
                       user.goal === g 
                        ? 'bg-red-600 border-red-500 text-white shadow-lg' 
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                     }`}
                   >
                     <span className="font-bold text-sm">{g}</span>
                   </button>
                 ))}
               </div>
               <div className="flex gap-2 mt-4 max-w-md mx-auto">
                 <button onClick={() => setFormStep(0)} className="flex-1 bg-transparent border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/5">Voltar</button>
                 <button onClick={() => setFormStep(2)} className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl">Próximo</button>
               </div>
             </div>
          )}

          {formStep === 2 && (
             <div className="space-y-4 animate-fade-in max-w-md mx-auto">
               <h2 className="text-xl text-white font-bold">Onde você vai treinar?</h2>
               <div className="grid grid-cols-3 gap-2">
                 {['Casa', 'Academia', 'Ar Livre'].map((loc) => (
                   <button 
                     key={loc}
                     onClick={() => setUser({...user, location: loc as any})}
                     className={`p-3 rounded-xl text-center text-sm font-bold border transition-all ${
                       user.location === loc 
                        ? 'bg-red-600 border-red-500 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                     }`}
                   >
                     {loc}
                   </button>
                 ))}
               </div>
               
               <h2 className="text-xl text-white font-bold mt-4">Nível de experiência</h2>
               <div className="grid grid-cols-3 gap-2">
                 {Object.values(UserLevel).map((l) => (
                   <button 
                     key={l}
                     onClick={() => setUser({...user, level: l})}
                     className={`p-3 rounded-xl text-center text-sm font-bold border transition-all ${
                       user.level === l 
                        ? 'bg-red-600 border-red-500 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                     }`}
                   >
                     {l}
                   </button>
                 ))}
               </div>

               <button 
                  onClick={handleOnboardingSubmit} 
                  disabled={isSavingProfile}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/50 mt-6 text-lg disabled:opacity-50 flex justify-center"
               >
                 {isSavingProfile ? <Loader2 className="animate-spin" /> : 'Salvar e Iniciar'}
               </button>
               
               <div className="flex justify-center mt-2">
                 <button onClick={() => setFormStep(1)} className="text-gray-400 text-sm hover:text-white">Voltar</button>
               </div>
             </div>
          )}
          
           <div className="mt-4 text-center">
            <button onClick={handleLogout} className="text-gray-300 text-sm underline">Cancelar</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2b0f0f] via-[#500000] to-[#1a0505] flex overflow-hidden font-inter">
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 md:hidden flex flex-col p-6">
          <div className="flex justify-end mb-8">
            <button onClick={() => setIsMenuOpen(false)} className="text-white"><X size={32} /></button>
          </div>
          <div className="space-y-2">
            <NavButton id="home" icon={Home} label="Visão Geral" />
            <NavButton id="workout" icon={Dumbbell} label="Meu Treino" />
            <NavButton id="diet" icon={Utensils} label="Dieta Econômica" />
            <NavButton id="chat" icon={MessageSquare} label="Treinador IA" />
            <NavButton id="affiliate" icon={TrendingUp} label="Área de Afiliado" />
            <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 rounded-xl text-red-400 hover:bg-white/10 mt-8">
               <LogOut size={24} /> Sair
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-80 bg-black/30 backdrop-blur-xl border-r border-white/5 p-6">
        <div className="mb-12 cursor-pointer" onClick={() => setView('home')}>
          <h1 className="text-3xl font-black text-white tracking-tighter">ACER FITNESS <span className="text-red-500">PRO</span></h1>
          <p className="text-xs text-pink-200 uppercase tracking-widest mt-1">Performance AI</p>
        </div>

        <nav className="space-y-3 flex-1">
          <NavButton id="home" icon={Home} label="Visão Geral" />
          <NavButton id="workout" icon={Dumbbell} label="Treino" />
          <NavButton id="diet" icon={Utensils} label="Dieta" />
          <NavButton id="chat" icon={MessageSquare} label="Chat IA" />
          <div className="pt-6 mt-6 border-t border-white/10">
            <NavButton id="affiliate" icon={TrendingUp} label="Afiliados" />
          </div>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/50">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-white font-bold text-sm truncate max-w-[120px]">{user.name || 'Usuário'}</p>
              <p className="text-pink-200 text-xs truncate max-w-[120px]">{user.goal}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-center text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
             <LogOut size={14} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header Mobile */}
        <header className="md:hidden p-6 flex justify-between items-center bg-black/20 backdrop-blur-sm sticky top-0 z-30">
           <h1 className="text-xl font-black text-white">ACER FITNESS <span className="text-red-500">PRO</span></h1>
           <button onClick={() => setIsMenuOpen(true)} className="text-white bg-white/5 p-2 rounded-lg"><Menu size={24} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin">
          <div className="max-w-5xl mx-auto animate-fade-in pb-20 md:pb-0">
            {view === 'home' && <DashboardHome user={user} onChangeView={(v) => setView(v)} />}
            {view === 'workout' && <WorkoutDashboard user={user} />}
            {view === 'diet' && <DietGenerator user={user} />}
            {view === 'chat' && <ChatAssistant user={user} />}
            {view === 'affiliate' && <AffiliateDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
