
import React, { useState } from 'react';
import { UserProfile, DietPlan, Meal } from '../types';
import { generateDiet, generateAlternativeMeal } from '../services/geminiService';
import { 
  DollarSign, ShoppingCart, Flame, Utensils, TrendingDown, 
  PieChart, Droplets, Apple, Calculator, ChevronRight, RefreshCcw, CheckSquare, Square, Plus, Minus 
} from 'lucide-react';
import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';

interface Props {
  user: UserProfile;
}

const DietGenerator: React.FC<Props> = ({ user }) => {
  const [budget, setBudget] = useState<number>(user.budget || 50);
  const [period, setPeriod] = useState<'Diário' | 'Semanal' | 'Mensal'>('Semanal');
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'hydration' | 'shopping'>('overview');
  
  // Interactive States
  const [waterIntake, setWaterIntake] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [swappingMealId, setSwappingMealId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateDiet(user, budget, period);
    setPlan(result);
    setLoading(false);
    setWaterIntake(0);
    setCheckedItems(new Set());
    setActiveTab('overview');
  };

  const handleSwapMeal = async (meal: Meal, index: number) => {
    if (!plan) return;
    setSwappingMealId(meal.id);
    const newMeal = await generateAlternativeMeal(meal, plan);
    if (newMeal) {
        const newMeals = [...plan.meals];
        newMeals[index] = newMeal;
        setPlan({ ...plan, meals: newMeals });
    } else {
        alert("Sem alternativas para esta refeição no momento.");
    }
    setSwappingMealId(null);
  };

  const toggleItem = (item: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(item)) newSet.delete(item);
    else newSet.add(item);
    setCheckedItems(newSet);
  };

  const addWater = () => setWaterIntake(prev => Math.min(prev + 250, plan?.waterTarget || 3000));
  const removeWater = () => setWaterIntake(prev => Math.max(prev - 250, 0));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-white animate-pulse">
        <Utensils className="w-16 h-16 mb-4 text-pink-400" />
        <h2 className="text-2xl font-bold">Nutricionista IA Trabalhando...</h2>
        <p className="text-sm text-pink-200 mt-2">Calculando TDEE, Macros e Preços</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col h-full max-w-md mx-auto justify-center text-white py-10">
        <div className="bg-gradient-to-br from-black to-[#1a0505] p-8 rounded-3xl border border-red-500/30 backdrop-blur-lg shadow-2xl">
          <div className="text-center mb-8">
            <Apple className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Planejamento Nutricional</h2>
            <p className="text-gray-400 text-sm">Personalizado para {user.goal}</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-pink-200 text-xs font-bold uppercase mb-2">Orçamento (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-red-400" size={20} />
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 text-white pl-10 p-3 rounded-xl focus:outline-none focus:border-red-400 font-bold text-lg"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-pink-200 text-xs font-bold uppercase mb-2">Período de Compras</label>
            <div className="grid grid-cols-3 gap-2">
              {['Diário', 'Semanal', 'Mensal'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p as any)}
                  className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                    period === p 
                        ? 'bg-red-600 text-white border-red-500' 
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Calculator size={20} /> Gerar Dieta Completa
          </button>
        </div>
      </div>
    );
  }

  const macroData = [
    { name: 'Proteína', value: plan.dailyTargets.protein, color: '#ef4444' }, // Red
    { name: 'Carbo', value: plan.dailyTargets.carbs, color: '#3b82f6' }, // Blue
    { name: 'Gordura', value: plan.dailyTargets.fats, color: '#eab308' }, // Yellow
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header Compacto */}
      <div className="bg-gradient-to-r from-[#1a0505] to-black p-6 rounded-2xl border-b border-red-900/30 flex justify-between items-end">
         <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Meta Diária</p>
            <h2 className="text-3xl font-black text-white flex items-center gap-2">
               {plan.dailyTargets.calories} <span className="text-sm font-normal text-gray-500">kcal</span>
            </h2>
         </div>
         <div className="text-right">
            <p className="text-gray-400 text-xs uppercase">Custo {plan.period}</p>
            <p className="text-xl font-bold text-green-400">R$ {plan.totalCost.toFixed(0)}</p>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
         {[
             { id: 'overview', icon: PieChart, label: 'Visão Geral' },
             { id: 'meals', icon: Utensils, label: 'Refeições' },
             { id: 'hydration', icon: Droplets, label: 'Hidratação' },
             { id: 'shopping', icon: ShoppingCart, label: 'Lista' }
         ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                    activeTab === tab.id 
                        ? 'bg-white text-red-900' 
                        : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
             >
                <tab.icon size={16} /> {tab.label}
             </button>
         ))}
      </div>

      {/* --- TAB: OVERVIEW --- */}
      {activeTab === 'overview' && (
         <div className="space-y-4 animate-fade-in">
            {/* Macros Chart */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
               <h3 className="text-white font-bold mb-4">Distribuição de Macros</h3>
               <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                     <RePie data={macroData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {macroData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                     </RePie>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                     <p className="text-xs text-gray-400">Total</p>
                     <p className="text-xl font-bold text-white">100%</p>
                  </div>
               </div>
               <div className="flex justify-between mt-4 text-center">
                  {macroData.map(m => (
                     <div key={m.name}>
                        <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{backgroundColor: m.color}}></div>
                        <p className="text-xs text-gray-400">{m.name}</p>
                        <p className="text-lg font-bold text-white">{m.value}g</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* TDEE Explanation */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
               <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                   <Calculator size={16} className="text-red-500" /> Como calculamos?
               </h3>
               <p className="text-sm text-gray-300 leading-relaxed">
                  Baseado no seu perfil ({user.weight}kg, {user.goal}), seu metabolismo basal é de aprox. 
                  <span className="text-white font-bold"> {Math.round(plan.dailyTargets.calories * 0.7)} kcal</span>. 
                  Adicionamos o gasto do treino e o ajuste para seu objetivo.
               </p>
            </div>

             {/* Supplements */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4">
               <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                   <TrendingDown size={16} /> Suplementação Sugerida
               </h3>
               <ul className="space-y-2">
                  {plan.supplements.map((sup, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-blue-100">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {sup}
                      </li>
                  ))}
               </ul>
            </div>
         </div>
      )}

      {/* --- TAB: MEALS --- */}
      {activeTab === 'meals' && (
          <div className="space-y-4 animate-fade-in">
             {plan.meals.map((meal, idx) => (
                 <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-red-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                       <div>
                          <span className="text-xs font-bold text-red-500 uppercase tracking-wide">{meal.name}</span>
                          <h4 className="text-lg font-bold text-white">{meal.description}</h4>
                       </div>
                       <button 
                         onClick={() => handleSwapMeal(meal, idx)}
                         disabled={swappingMealId === meal.id}
                         className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                         title="Trocar Refeição"
                       >
                          {swappingMealId === meal.id ? <RefreshCcw size={18} className="animate-spin"/> : <RefreshCcw size={18}/>}
                       </button>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-300 mb-4 bg-black/20 p-3 rounded-xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase">Calorias</span>
                            <span className="font-bold text-white">{meal.macros.calories}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase">Prot</span>
                            <span className="font-bold text-white">{meal.macros.protein}g</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase">Carb</span>
                            <span className="font-bold text-white">{meal.macros.carbs}g</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase">Gord</span>
                            <span className="font-bold text-white">{meal.macros.fats}g</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                       <div>
                          <p className="text-xs text-gray-400 font-bold mb-1">INGREDIENTES:</p>
                          <p className="text-sm text-gray-200">{meal.ingredients.join(', ')}</p>
                       </div>
                       <div>
                          <p className="text-xs text-gray-400 font-bold mb-1">PREPARO:</p>
                          <p className="text-sm text-gray-300 italic">"{meal.preparation}"</p>
                       </div>
                    </div>
                 </div>
             ))}
          </div>
      )}

      {/* --- TAB: HYDRATION --- */}
      {activeTab === 'hydration' && (
          <div className="space-y-8 animate-fade-in py-8 text-center">
             <div className="relative w-48 h-48 mx-auto">
                 {/* Water Circle Background */}
                 <div className="absolute inset-0 rounded-full border-4 border-blue-900/30 bg-blue-900/10 overflow-hidden">
                     <div 
                        className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-700 ease-out"
                        style={{ height: `${Math.min((waterIntake / plan.waterTarget) * 100, 100)}%`, opacity: 0.6 }}
                     >
                        <div className="w-full h-2 bg-blue-400 animate-pulse"></div>
                     </div>
                 </div>
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                     <Droplets size={32} className={waterIntake >= plan.waterTarget ? "text-blue-300" : "text-blue-500"} />
                     <h3 className="text-3xl font-black text-white mt-2">{waterIntake}<span className="text-sm font-normal text-gray-400">ml</span></h3>
                     <p className="text-xs text-gray-400">Meta: {plan.waterTarget}ml</p>
                 </div>
             </div>

             <div className="flex justify-center gap-4">
                 <button onClick={removeWater} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                     <Minus size={24} />
                 </button>
                 <button onClick={addWater} className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/50 transition-transform active:scale-95">
                     <Plus size={24} /> <span className="text-xs font-bold block">250ml</span>
                 </button>
             </div>
             
             <div className="bg-blue-900/20 p-4 rounded-xl max-w-xs mx-auto border border-blue-500/20">
                <p className="text-sm text-blue-200">
                   💡 Beba água logo ao acordar para ativar seu metabolismo.
                </p>
             </div>
          </div>
      )}

      {/* --- TAB: SHOPPING --- */}
      {activeTab === 'shopping' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex gap-3 items-start">
                 <TrendingDown className="text-green-400 shrink-0" size={20} />
                 <div>
                    <h4 className="text-green-400 font-bold text-sm mb-1">Dicas de Economia</h4>
                    <ul className="text-xs text-green-100 list-disc list-inside space-y-1">
                        {plan.savingsTips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                 </div>
              </div>

              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="p-4 bg-black/20 border-b border-white/5 flex justify-between items-center">
                     <h3 className="text-white font-bold flex items-center gap-2">
                        <ShoppingCart size={18} className="text-red-500"/> Lista de Compras
                     </h3>
                     <span className="text-xs text-gray-500">{checkedItems.size}/{plan.shoppingList.length} itens</span>
                  </div>
                  <div className="divide-y divide-white/5">
                      {plan.shoppingList.map((item, idx) => {
                          const isChecked = checkedItems.has(item);
                          return (
                              <div 
                                key={idx} 
                                onClick={() => toggleItem(item)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-white/5 ${isChecked ? 'bg-black/20' : ''}`}
                              >
                                  <div className={`text-red-500 transition-all ${isChecked ? 'opacity-50' : 'opacity-100'}`}>
                                      {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                                  </div>
                                  <span className={`text-sm transition-all ${isChecked ? 'text-gray-600 line-through' : 'text-gray-200'}`}>
                                      {item}
                                  </span>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DietGenerator;
