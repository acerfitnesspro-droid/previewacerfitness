import React, { useState } from 'react';
import { UserProfile, DietPlan } from '../types';
import { generateDiet } from '../services/geminiService';
import { DollarSign, ShoppingCart, Flame, Utensils, TrendingDown } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const DietGenerator: React.FC<Props> = ({ user }) => {
  const [budget, setBudget] = useState<number>(50);
  const [period, setPeriod] = useState<'Diário' | 'Semanal' | 'Mensal'>('Semanal');
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateDiet(user, budget, period);
    setPlan(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white animate-pulse">
        <Utensils className="w-16 h-16 mb-4 text-pink-400" />
        <p className="text-xl font-bold">A IA está no mercado...</p>
        <p className="text-sm text-pink-200 mt-2">Calculando preços e macros</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col h-full max-w-md mx-auto justify-center text-white">
        <div className="bg-white/10 p-8 rounded-3xl border border-red-500/30 backdrop-blur-lg shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Orçamento da Dieta</h2>
          
          <div className="mb-6">
            <label className="block text-pink-200 text-sm font-bold mb-2">Quanto você quer gastar?</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-red-400" size={20} />
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-black/40 border border-red-500/50 text-white pl-10 p-3 rounded-xl focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-pink-200 text-sm font-bold mb-2">Período</label>
            <div className="grid grid-cols-3 gap-2">
              {['Diário', 'Semanal', 'Mensal'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p as any)}
                  className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                    period === p ? 'bg-red-600 text-white' : 'bg-black/20 text-gray-400 hover:bg-black/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02]"
          >
            Gerar Dieta Econômica
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-pink-500/30 flex justify-between items-center">
        <div>
          <p className="text-pink-200 text-sm">Custo Estimado</p>
          <h2 className="text-3xl font-extrabold text-white">R$ {plan.totalCost.toFixed(2)}</h2>
        </div>
        <div className="text-right">
          <button onClick={() => setPlan(null)} className="text-xs text-red-300 hover:text-white underline">
            Ajustar Orçamento
          </button>
        </div>
      </div>

      {/* Savings Tips */}
      <div className="bg-green-900/40 border border-green-500/30 p-4 rounded-xl">
        <h3 className="flex items-center text-green-400 font-bold mb-2">
          <TrendingDown size={18} className="mr-2" /> Economia Inteligente
        </h3>
        <ul className="text-sm text-green-100 list-disc list-inside">
          {plan.savingsTips?.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Refeições Planejadas</h3>
        {plan.meals?.map((meal, idx) => (
          <div key={idx} className="bg-black/20 p-5 rounded-xl border border-white/5">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-bold text-pink-100">{meal.name}</h4>
              <span className="bg-red-900/50 text-red-200 text-xs px-2 py-1 rounded">
                R$ {meal.costEstimate.toFixed(2)}
              </span>
            </div>

            <div className="flex space-x-4 text-xs text-gray-400 mb-4">
              <span className="flex items-center"><Flame size={12} className="mr-1 text-orange-500" /> {meal.calories} kcal</span>
              <span>P: {meal.protein}</span>
              <span>C: {meal.carbs}</span>
              <span>G: {meal.fats}</span>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs font-bold text-gray-300 uppercase mb-1">Ingredientes:</p>
                <p className="text-sm text-gray-200">{meal.ingredients?.join(', ')}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg mt-2">
                <p className="text-xs font-bold text-gray-300 uppercase mb-1">Preparo:</p>
                <p className="text-sm text-gray-300 italic">{meal.preparation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shopping List */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h3 className="flex items-center text-xl font-bold text-white mb-4">
          <ShoppingCart className="mr-2 text-red-500" /> Lista de Compras
        </h3>
        <ul className="grid grid-cols-2 gap-2">
          {plan.shoppingList?.map((item, idx) => (
            <li key={idx} className="flex items-center text-gray-300 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DietGenerator;