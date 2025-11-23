import React from 'react';
import { PlanType } from '../types';
import { Dumbbell, Utensils, Crown, CheckCircle2 } from 'lucide-react';
import { PLANS } from '../services/affiliateService';

interface Props {
  onSelect: (plan: PlanType) => void;
  onBack: () => void;
}

const PricingPlans: React.FC<Props> = ({ onSelect, onBack }) => {
  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
         <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
            Escolha sua <span className="text-red-600">Evolução</span>
         </h2>
         <p className="text-gray-400 mt-2">Selecione o plano ideal para transformar seu corpo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Plano A */}
         <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col relative group hover:border-red-500/30 transition-all">
            <div className="p-3 bg-gray-800 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                <Dumbbell className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white">Foco no Treino</h3>
            <p className="text-gray-400 text-sm mb-6">Para quem quer apenas destruir na academia.</p>
            
            <div className="mb-8">
               <span className="text-4xl font-black text-white">R$ 34,90</span>
               <span className="text-gray-500 text-sm">/mês</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
               <li className="flex items-center gap-3 text-gray-300 text-sm"><CheckCircle2 size={16} className="text-red-500"/> Fichas de Treino IA</li>
               <li className="flex items-center gap-3 text-gray-300 text-sm"><CheckCircle2 size={16} className="text-red-500"/> Vídeos de Execução</li>
               <li className="flex items-center gap-3 text-gray-300 text-sm"><CheckCircle2 size={16} className="text-red-500"/> Chat com Personal</li>
            </ul>

            <button 
               onClick={() => onSelect(PlanType.PLANO_SOMENTE_TREINO)}
               className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
               Selecionar Plano
            </button>
         </div>

         {/* Plano C (Destaque) */}
         <div className="bg-gradient-to-br from-red-900/80 to-black backdrop-blur-xl border border-red-500 rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-red-900/30">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
               Mais Vendido
            </div>
            <div className="p-3 bg-red-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Crown className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white">Transformação Total</h3>
            <p className="text-red-100 text-sm mb-6">A solução completa para resultados rápidos.</p>
            
            <div className="mb-8">
               <span className="text-5xl font-black text-white">R$ 47,90</span>
               <span className="text-red-200 text-sm">/mês</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
               <li className="flex items-center gap-3 text-white text-sm"><CheckCircle2 size={16} className="text-red-400"/> <strong>Tudo do Plano de Treino</strong></li>
               <li className="flex items-center gap-3 text-white text-sm"><CheckCircle2 size={16} className="text-red-400"/> <strong>Tudo do Plano de Dieta</strong></li>
               <li className="flex items-center gap-3 text-white text-sm"><CheckCircle2 size={16} className="text-red-400"/> Suporte Prioritário</li>
               <li className="flex items-center gap-3 text-white text-sm"><CheckCircle2 size={16} className="text-red-400"/> Indique e Ganhe (R$ 10,00)</li>
            </ul>

            <button 
               onClick={() => onSelect(PlanType.PLANO_TREINO_DIETA)}
               className="w-full py-4 rounded-xl bg-white text-red-900 font-black hover:bg-gray-100 transition-colors shadow-lg"
            >
               QUERO RESULTADOS
            </button>
         </div>

         {/* Plano B */}
         <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col relative group hover:border-green-500/30 transition-all">
            <div className="p-3 bg-gray-800 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                <Utensils className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white">Foco na Dieta</h3>
            <p className="text-gray-400 text-sm mb-6">Nutrição inteligente que cabe no bolso.</p>
            
            <div className="mb-8">
               <span className="text-4xl font-black text-white">R$ 34,90</span>
               <span className="text-gray-500 text-sm">/mês</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
               <li className="flex items-center gap-3 text-gray-300 text-sm"><CheckCircle2 size={16} className="text-green-500"/> Cardápios Econômicos</li>
               <li className="flex items-center gap-3 text-gray-300 text-sm"><CheckCircle2 size={16} className="text-green-500"/> Lista de Compras</li>
               <li className="flex items-center gap-3 text-gray-300 text-sm"><CheckCircle2 size={16} className="text-green-500"/> Chat com Nutricionista</li>
            </ul>

            <button 
               onClick={() => onSelect(PlanType.PLANO_SOMENTE_DIETA)}
               className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
               Selecionar Plano
            </button>
         </div>
      </div>

      <div className="mt-8 text-center">
        <button onClick={onBack} className="text-gray-500 hover:text-white underline text-sm">Voltar para Login</button>
      </div>
    </div>
  );
};

export default PricingPlans;