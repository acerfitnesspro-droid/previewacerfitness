import React, { useState } from 'react';
import { UserProfile, UserGoal, UserLevel } from './types';
import WorkoutDashboard from './components/WorkoutDashboard';
import DietGenerator from './components/DietGenerator';
import ChatAssistant from './components/ChatAssistant';
import AffiliateDashboard from './components/AffiliateDashboard';
import DashboardHome from './components/DashboardHome';
import { Dumbbell, Utensils, MessageSquare, TrendingUp, Home, Menu, X } from 'lucide-react';

// Mock initial user state
const INITIAL_USER: UserProfile = {
  name: 'Visitante',
  age: 25,
  weight: 70,
  height: 175,
  goal: UserGoal.DEFINITION,
  level: UserLevel.BEGINNER,
  location: 'Academia',
  budget: 50
};

const App: React.FC = () => {
  const [view, setView] = useState<'onboarding' | 'home' | 'workout' | 'diet' | 'chat' | 'affiliate'>('onboarding');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formStep, setFormStep] = useState(0);

  const handleOnboardingSubmit = () => {
    setView('home');
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

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#500000] via-[#D00000] to-[#FFC0CB] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-black/30 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">ACER FITNESS <span className="text-red-500">PRO</span></h1>
          <p className="text-pink-200 mb-8">A inteligência artificial que cabe no seu bolso.</p>
          
          {formStep === 0 && (
            <div className="space-y-4 animate-fade-in">
               <h2 className="text-xl text-white font-bold">Vamos começar! Qual seu nome?</h2>
               <input 
                 type="text" 
                 value={user.name}
                 onChange={e => setUser({...user, name: e.target.value})}
                 className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:border-red-500"
                 placeholder="Seu nome"
               />
               <div className="grid grid-cols-2 gap-4">
                 <input 
                   type="number" 
                   placeholder="Peso (kg)"
                   value={user.weight}
                   onChange={e => setUser({...user, weight: Number(e.target.value)})}
                   className="bg-white/10 border border-white/20 rounded-xl p-4 text-white"
                 />
                 <input 
                   type="number" 
                   placeholder="Altura (cm)"
                   value={user.height}
                   onChange={e => setUser({...user, height: Number(e.target.value)})}
                   className="bg-white/10 border border-white/20 rounded-xl p-4 text-white"
                 />
               </div>
               <button onClick={() => setFormStep(1)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95">
                 Próximo
               </button>
            </div>
          )}

          {formStep === 1 && (
             <div className="space-y-4 animate-fade-in">
               <h2 className="text-xl text-white font-bold">Qual seu principal objetivo?</h2>
               <div className="grid grid-cols-1 gap-2">
                 {Object.values(UserGoal).map((g) => (
                   <button 
                     key={g}
                     onClick={() => setUser({...user, goal: g})}
                     className={`p-4 rounded-xl text-left border transition-all ${
                       user.goal === g 
                        ? 'bg-red-600 border-red-500 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                     }`}
                   >
                     {g}
                   </button>
                 ))}
               </div>
               <div className="flex gap-2 mt-4">
                 <button onClick={() => setFormStep(0)} className="flex-1 bg-transparent border border-white/20 text-white font-bold py-4 rounded-xl">Voltar</button>
                 <button onClick={() => setFormStep(2)} className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl">Próximo</button>
               </div>
             </div>
          )}

          {formStep === 2 && (
             <div className="space-y-4 animate-fade-in">
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

               <button onClick={handleOnboardingSubmit} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/50 mt-6 text-lg">
                 Gerar Plano Inteligente
               </button>
             </div>
          )}
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
        
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/50">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{user.name}</p>
              <p className="text-pink-200 text-xs">{user.goal}</p>
            </div>
          </div>
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
