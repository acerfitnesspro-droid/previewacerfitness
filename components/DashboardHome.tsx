import React from 'react';
import { UserProfile } from '../types';
import { Zap, TrendingUp, Calendar, DollarSign, ArrowRight } from 'lucide-react';

interface Props {
  user: UserProfile;
  onChangeView: (view: 'workout' | 'diet' | 'affiliate') => void;
}

const DashboardHome: React.FC<Props> = ({ user, onChangeView }) => {
  return (
    <div className="space-y-8 pb-20">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 to-pink-700 p-8 shadow-2xl shadow-red-900/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
            Olá, {user.name}
          </h2>
          <p className="text-white/90 font-medium max-w-md">
            Seu protocolo <span className="font-bold">{user.goal}</span> está ativo. Foco total hoje.
          </p>
          <button 
            onClick={() => onChangeView('workout')}
            className="mt-6 bg-white text-red-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-transform active:scale-95 flex items-center gap-2"
          >
            <Zap size={20} fill="currentColor" /> Ir para o Treino
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-red-500/50 transition-colors group cursor-pointer" onClick={() => onChangeView('affiliate')}>
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-900/30 rounded-lg text-green-400">
                 <DollarSign size={20} />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Ver Detalhes <ArrowRight size={10} className="inline"/></span>
           </div>
           <h3 className="text-2xl font-bold text-white">R$ 1.450</h3>
           <p className="text-xs text-gray-400 mt-1">Ganhos de Afiliado</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-pink-500/50 transition-colors group cursor-pointer" onClick={() => onChangeView('diet')}>
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-pink-900/30 rounded-lg text-pink-400">
                 <TrendingUp size={20} />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Dieta <ArrowRight size={10} className="inline"/></span>
           </div>
           <h3 className="text-2xl font-bold text-white">R$ {user.budget}</h3>
           <p className="text-xs text-gray-400 mt-1">Orçamento Atual</p>
        </div>
      </div>

      {/* Next Workout Teaser */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
         <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-red-500" size={18} /> Próximo Passo
         </h3>
         <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl border-l-4 border-red-600 flex justify-between items-center">
            <div>
               <p className="text-xs text-gray-400 uppercase font-bold">Treino A</p>
               <p className="text-white font-bold text-lg">Peito e Tríceps</p>
            </div>
            <button onClick={() => onChangeView('workout')} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20">
               <ArrowRight size={20} />
            </button>
         </div>
      </div>

      {/* Motivation Quote */}
      <div className="text-center pt-4">
         <p className="text-gray-500 italic text-sm">"O único treino ruim é aquele que não aconteceu."</p>
      </div>
    </div>
  );
};

export default DashboardHome;
