
import React, { useState, useEffect } from 'react';
import { UserProfile, DietProgram, DietPlan, Meal, UserGoal } from '../types';
import { generateDietProgram } from '../services/geminiService';
import { 
  DollarSign, ShoppingCart, Flame, Utensils, TrendingDown, 
  PieChart, Droplets, Apple, Calculator, ChevronRight, RefreshCcw, 
  CheckSquare, Square, Plus, Minus, Settings, Calendar, 
  Leaf, Wheat, Milk, Scale, ChefHat, ArrowRight, Download, X, Heart, ChevronLeft,
  CheckCircle2, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  user: UserProfile;
}

// --- TIPOS VISUAIS INTERNOS ---
type ViewState = 'config' | 'dashboard';
type DashboardTab = 'daily' | 'weekly' | 'shopping';

const DietGenerator: React.FC<Props> = ({ user }) => {
  // --- STATES ---
  const [viewState, setViewState] = useState<ViewState>('config');
  const [activeTab, setActiveTab] = useState<DashboardTab>('daily');
  const [program, setProgram] = useState<DietProgram | null>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [completing, setCompleting] = useState<string | null>(null);

  // Configuration States
  const [budget, setBudget] = useState<number>(user.budget || 50);
  const [restrictions, setRestrictions] = useState<Set<string>>(new Set());
  const [goalType, setGoalType] = useState<string>(user.goal);
  
  // Interaction States
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleGenerate = async () => {
    setViewState('dashboard'); 
    setLoading(true);
    
    const steps = [
      "Calculando Taxa Metabólica Basal...",
      "Analisando Restrições Alimentares...",
      "Otimizando Orçamento no Mercado...",
      "Montando Programa de 4 Semanas..."
    ];

    for (let i = 0; i < steps.length; i++) {
        setLoadingStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    const result = await generateDietProgram({ ...user, goal: goalType as UserGoal }, budget);
    if (result) {
      setProgram(result);
      setCurrentWeekIndex((result.currentWeek || 1) - 1);
    }
    setLoading(false);
  };

  const toggleRestriction = (res: string) => {
    const newSet = new Set(restrictions);
    if (newSet.has(res)) newSet.delete(res);
    else newSet.add(res);
    setRestrictions(newSet);
  };

  const toggleItem = (item: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(item)) newSet.delete(item);
    else newSet.add(item);
    setCheckedItems(newSet);
  };

  const handleCompleteMeal = async (mealId: string) => {
    if (!program || completing) return;
    setCompleting(mealId);
    
    try {
      const updatedWeeks = [...program.weeks];
      const mealIndex = updatedWeeks[currentWeekIndex].meals.findIndex(m => m.id === mealId);
      if (mealIndex !== -1) {
        updatedWeeks[currentWeekIndex].meals[mealIndex].completed = true;
      }
      
      const { error } = await supabase
        .from('diet_programs')
        .update({ weeks: updatedWeeks })
        .eq('id', program.id);
        
      if (error) throw error;
      setProgram({ ...program, weeks: updatedWeeks });
    } catch (error) {
      console.error("Erro ao completar refeição:", error);
    } finally {
      setCompleting(null);
    }
  };

  // --- RENDERERS ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-white">
         <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-red-500 border-r-pink-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <ChefHat className="absolute inset-0 m-auto text-white/80" size={32} />
         </div>
         <h2 className="text-3xl font-black italic tracking-tighter mb-2">CRIANDO PROGRAMA ALIMENTAR</h2>
         <p className="text-pink-200 animate-pulse text-sm uppercase tracking-widest">
            {["Calculando TMB...", "Verificando Macros...", "Ajustando Preços...", "Finalizando..."][loadingStep]}
         </p>
      </div>
    );
  }

  if (viewState === 'config' || !program) {
    return (
      <div className="pb-20 animate-fade-in">
        <div className="text-center mb-10">
           <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200 tracking-tighter uppercase italic">
              Nutrição <span className="text-red-500">Estratégica</span>
           </h1>
           <p className="text-gray-400 mt-2 max-w-lg mx-auto">
              Configure suas preferências e deixe nossa IA criar o protocolo nutricional de 4 semanas perfeito para seu bolso e objetivo.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
           <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-900/50">
                    <Scale size={24} />
                 </div>
                 <h3 className="text-2xl font-bold text-white">Objetivo Principal</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                 {Object.values(UserGoal).map((g) => (
                    <button
                       key={g}
                       onClick={() => setGoalType(g)}
                       className={`w-full p-3 rounded-xl text-left border transition-all flex justify-between items-center group ${
                          goalType === g 
                            ? 'bg-gradient-to-r from-red-600 to-pink-600 border-transparent text-white shadow-lg' 
                            : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                       }`}
                    >
                       <span className="font-bold text-xs">{g}</span>
                       {goalType === g && <CheckSquare size={16} />}
                    </button>
                 ))}
              </div>

              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Restrições Alimentares</label>
                 <div className="flex flex-wrap gap-2">
                    {[
                        {id: 'lactose', label: 'Sem Lactose', icon: Milk},
                        {id: 'gluten', label: 'Sem Glúten', icon: Wheat},
                        {id: 'vegan', label: 'Vegano', icon: Leaf},
                        {id: 'lowcarb', label: 'Low Carb', icon: CheckSquare}
                    ].map((res) => {
                        const active = restrictions.has(res.id);
                        return (
                            <button 
                               key={res.id}
                               onClick={() => toggleRestriction(res.id)}
                               className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                   active 
                                     ? 'bg-white text-red-900 border-white' 
                                     : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                               }`}
                            >
                                <res.icon size={14} /> {res.label}
                            </button>
                        )
                    })}
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-[#2b0f0f] to-[#1a0505] backdrop-blur-xl border border-red-900/30 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                 <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-lg shadow-pink-900/50">
                    <DollarSign size={24} />
                 </div>
                 <h3 className="text-2xl font-bold text-white">Orçamento Semanal</h3>
              </div>

              <div className="space-y-8 relative z-10">
                 <div>
                    <label className="flex justify-between text-sm font-bold text-white mb-4">
                        <span>Investimento Semanal</span>
                        <span className="text-green-400">R$ {budget},00</span>
                    </label>
                    <input 
                       type="range" 
                       min="50" 
                       max="500" 
                       step="10"
                       value={budget}
                       onChange={(e) => setBudget(Number(e.target.value))}
                       className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-pink-500 transition-all"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Econômico</span>
                        <span>Premium</span>
                    </div>
                 </div>
              </div>

              <div className="mt-10 relative z-10">
                 <button 
                    onClick={handleGenerate}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-red-900/40 transform transition hover:scale-[1.02] flex items-center justify-center gap-3"
                 >
                    <ChefHat size={24} /> GERAR PROGRAMA 4 SEMANAS
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  const currentPlan = program.weeks[currentWeekIndex];
  
  return (
    <div className="space-y-8 pb-24 animate-fade-in">
       {/* HEADER */}
       <div className="relative bg-[#1a0505] rounded-[32px] p-6 md:p-8 border border-red-900/30 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
             <div className="flex items-center gap-4 flex-1">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 p-1 shadow-lg shadow-red-500/30">
                   <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{user.name.charAt(0)}</span>
                   </div>
                </div>
                <div>
                   <h2 className="text-white font-bold text-lg">{program.title}</h2>
                   <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-1 rounded border border-white/5">{goalType}</span>
                      <span className="text-[10px] font-bold bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/20">R$ {currentPlan.totalCost.toFixed(0)}/Semana</span>
                   </div>
                </div>
             </div>

             <div className="flex-1 w-full md:w-auto bg-black/30 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-gray-400 text-xs font-bold uppercase">Meta Diária</span>
                   <span className="text-2xl font-black text-white">{currentPlan.dailyTargets.calories} <span className="text-sm font-normal text-gray-500">kcal</span></span>
                </div>
                
                <div className="space-y-3">
                   <div>
                      <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                         <span>Proteína</span>
                         <span className="text-red-400">{currentPlan.dailyTargets.protein}g</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                         <div className="h-full bg-red-500 w-3/4 rounded-full"></div>
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                         <span>Carboidratos</span>
                         <span className="text-blue-400">{currentPlan.dailyTargets.carbs}g</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-1/2 rounded-full"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* WEEK SELECTOR */}
       <div className="flex items-center justify-between bg-black/40 p-2 rounded-2xl border border-white/10 max-w-md mx-auto">
          <button 
            disabled={currentWeekIndex === 0}
            onClick={() => setCurrentWeekIndex(prev => prev - 1)}
            className="p-3 text-white disabled:opacity-30 hover:bg-white/10 rounded-xl transition-all"
          >
            <ChevronLeft />
          </button>
          <div className="text-center">
            <span className="text-xs text-gray-400 uppercase font-bold block">Semana do Programa</span>
            <span className="text-white font-black text-xl">Semana {currentWeekIndex + 1}</span>
          </div>
          <button 
            disabled={currentWeekIndex === program.weeks.length - 1}
            onClick={() => setCurrentWeekIndex(prev => prev + 1)}
            className="p-3 text-white disabled:opacity-30 hover:bg-white/10 rounded-xl transition-all"
          >
            <ChevronRight />
          </button>
       </div>

       {/* TABS NAVIGATION */}
       <div className="flex justify-center">
          <div className="bg-black/40 p-1.5 rounded-2xl border border-white/10 inline-flex gap-1 backdrop-blur-md">
             {[
               { id: 'daily', label: 'Cardápio Diário', icon: Utensils },
               { id: 'weekly', label: 'Visão Semanal', icon: Calendar },
               { id: 'shopping', label: 'Lista de Compras', icon: ShoppingCart }
             ].map((tab) => (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }`}
                >
                   <tab.icon size={16} /> <span className="hidden md:inline">{tab.label}</span>
                </button>
             ))}
          </div>
       </div>

       {/* 1. VISÃO DIÁRIA */}
       {activeTab === 'daily' && (
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto animate-fade-in">
             {currentPlan.meals.map((meal, idx) => {
                const isExpanded = expandedMeal === meal.id;
                return (
                   <div 
                      key={idx} 
                      className={`relative bg-gradient-to-br from-[#1a0505] to-black rounded-3xl border transition-all duration-300 overflow-hidden group ${
                         isExpanded ? 'border-red-500/50 shadow-2xl shadow-red-900/20' : 'border-white/5 hover:border-white/20'
                      }`}
                   >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-pink-600"></div>
                      <div className="p-6 md:p-8">
                         <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                               <span className="text-3xl">
                                  {meal.type === 'breakfast' ? '🍳' : (meal.type === 'lunch' || meal.type === 'dinner' ? '🍗' : '🍎')}
                               </span>
                            </div>
                            <div className="flex-1 w-full">
                               <div className="flex justify-between items-start mb-2">
                                  <div>
                                     <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1 block flex items-center gap-2">
                                       {meal.name}
                                       {meal.completed && <CheckCircle2 size={12} className="text-green-500" />}
                                     </span>
                                     <h3 className="text-xl md:text-2xl font-black text-white leading-tight">{meal.description}</h3>
                                  </div>
                                  {!meal.completed && (
                                    <button 
                                      onClick={() => handleCompleteMeal(meal.id)}
                                      disabled={!!completing}
                                      className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white p-2 rounded-xl border border-green-500/30 transition-all flex items-center gap-2 text-[10px] font-bold"
                                    >
                                      {completing === meal.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Concluir</>}
                                    </button>
                                  )}
                               </div>
                               <div className="flex flex-wrap gap-4 text-xs mt-3">
                                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                     <Flame size={14} className="text-orange-500" />
                                     <span className="font-bold text-white">{meal.macros.calories} kcal</span>
                                  </div>
                                  <div className="flex gap-3 text-gray-400">
                                     <span><b className="text-white">{meal.macros.protein}g</b> Prot</span>
                                     <span><b className="text-white">{meal.macros.carbs}g</b> Carb</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                            <button 
                               onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                               className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors"
                            >
                               {isExpanded ? 'Ocultar Detalhes' : 'Ver Ingredientes e Preparo'}
                               <ChevronRight size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                            <span className="text-xs font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded">R$ ~{(meal.costEstimate).toFixed(2)}</span>
                         </div>
                         {isExpanded && (
                            <div className="mt-6 space-y-4 animate-fade-in bg-black/20 p-4 rounded-xl border border-white/5">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                     <h4 className="text-red-400 font-bold text-xs uppercase mb-2">Ingredientes</h4>
                                     <ul className="space-y-1">
                                        {meal.ingredients.map((ing, i) => (
                                           <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></span>
                                              {ing}
                                           </li>
                                        ))}
                                     </ul>
                                  </div>
                                  <div>
                                     <h4 className="text-red-400 font-bold text-xs uppercase mb-2">Preparo</h4>
                                     <p className="text-gray-300 text-sm italic leading-relaxed">{meal.preparation}</p>
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>
                   </div>
                );
             })}
          </div>
       )}

       {/* 2. VISÃO SEMANAL */}
       {activeTab === 'weekly' && (
          <div className="animate-fade-in">
             <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-black/40">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="text-red-500" /> Planejamento da Semana {currentWeekIndex + 1}
                   </h3>
                </div>
                <div className="overflow-x-auto">
                   <div className="min-w-[800px] p-6">
                      <div className="grid grid-cols-7 gap-4 text-center mb-4">
                         {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map(d => (
                            <div key={d} className="text-gray-500 font-bold text-xs bg-white/5 py-2 rounded-lg">{d}</div>
                         ))}
                      </div>
                      <div className="space-y-2">
                         {['Café', 'Almoço', 'Lanche', 'Jantar'].map((mealName, rIdx) => (
                            <div key={rIdx} className="grid grid-cols-7 gap-4">
                               {Array.from({length: 7}).map((_, cIdx) => (
                                  <div key={cIdx} className="bg-black/40 border border-white/5 p-3 rounded-xl min-h-[100px] flex flex-col justify-between hover:border-red-500/30 transition-colors group cursor-pointer">
                                     <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">{mealName}</span>
                                     <p className="text-white text-xs font-bold leading-tight">
                                        {currentPlan.meals[rIdx]?.description || "Refeição Livre"}
                                     </p>
                                  </div>
                               ))}
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}

       {/* 3. SHOPPING LIST */}
       {activeTab === 'shopping' && (
          <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
             <div className="bg-[#1a0505] rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <ShoppingCart className="text-red-500" /> Lista de Compras - Semana {currentWeekIndex + 1}
                   </h3>
                   <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase block">Total Estimado</span>
                      <span className="text-xl font-bold text-white">R$ {currentPlan.totalCost.toFixed(2)}</span>
                   </div>
                </div>
                <div className="divide-y divide-white/5">
                   {currentPlan.shoppingList.map((item, idx) => {
                      const isChecked = checkedItems.has(item);
                      return (
                         <div 
                            key={idx} 
                            onClick={() => toggleItem(item)}
                            className={`p-5 flex items-center gap-4 cursor-pointer transition-all hover:bg-white/5 ${isChecked ? 'bg-black/40 opacity-50' : ''}`}
                         >
                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                               isChecked ? 'bg-red-600 border-red-600 text-white' : 'border-gray-600 text-transparent hover:border-red-500'
                            }`}>
                               <CheckSquare size={14} />
                            </div>
                            <div className="flex-1">
                               <p className={`text-sm font-bold transition-all ${isChecked ? 'text-gray-500 line-through' : 'text-white'}`}>
                                  {item}
                                </p>
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
             <div className="text-center pt-4 pb-8">
                <button 
                    onClick={() => setViewState('config')}
                    className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                    <Settings size={14} /> Reconfigurar Preferências
                </button>
             </div>
          </div>
       )}
    </div>
  );
};

export default DietGenerator;
