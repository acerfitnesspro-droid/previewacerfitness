
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, WeeklyWorkoutPlan, Exercise } from '../types';
import { generateWeeklyWorkout, swapExercise } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { 
  Dumbbell, Clock, MapPin, Activity, Play, CheckCircle, 
  RotateCcw, Timer, ArrowLeft, History, Save, Trophy, X, Info, PlayCircle, RefreshCcw, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

interface Props {
  user: UserProfile;
}

const WorkoutDashboard: React.FC<Props> = ({ user }) => {
  const [plan, setPlan] = useState<WeeklyWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  
  // Active Workout State
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loggedWeights, setLoggedWeights] = useState<Record<string, string>>({});
  
  // History & Modals
  const [weightHistory, setWeightHistory] = useState<Record<string, number>>({});
  const [swappingExerciseId, setSwappingExerciseId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Refs para scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchWorkout = async () => {
    setLoading(true);
    try {
        const result = await generateWeeklyWorkout(user);
        if (result) {
            setPlan(result);
        } else {
            console.error("Geração retornou null");
        }
    } catch (error) {
        console.error("Falha na geração:", error);
    } finally {
        setLoading(false);
    }
  };

  // Load plan and history
  useEffect(() => {
    if (!plan) {
      fetchWorkout();
    } else {
      fetchExerciseHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  // Session Recovery & History Logic
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!user.id) return;
      
      const { data: session } = await supabase
        .from('workout_sessions')
        .select('id, day_name, started_at')
        .eq('user_id', user.id)
        .is('finished_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (session) {
        setActiveSessionId(session.id);
        setIsWorkoutActive(true);
        
        if (plan) {
           const dayIdx = plan.split.findIndex(d => d.dayName === session.day_name);
           if (dayIdx !== -1) setActiveDayIndex(dayIdx);
        }
        
        const { data: logs } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('session_id', session.id);
          
        if (logs) {
          const restoredCompleted = new Set<string>();
          const restoredWeights: Record<string, string> = {};
          logs.forEach((log: any) => {
             const id = `${log.exercise_name}-${log.set_number - 1}`;
             restoredCompleted.add(id);
             if (log.weight) restoredWeights[id] = log.weight.toString();
          });
          setCompletedSets(restoredCompleted);
          setLoggedWeights(prev => ({...prev, ...restoredWeights}));
        }
      }
    };
    
    if (user.id) checkActiveSession();
  }, [user.id, plan]);

  const fetchExerciseHistory = async () => {
    if (!user.id) return;
    
    try {
      const { data } = await supabase
        .from('workout_logs')
        .select('exercise_name, weight')
        .order('created_at', { ascending: false })
        .limit(300); 

      if (data) {
        const history: Record<string, number> = {};
        data.forEach((log: any) => {
           if (log.weight && (!history[log.exercise_name] || log.weight > history[log.exercise_name])) {
              history[log.exercise_name] = log.weight;
           }
        });
        setWeightHistory(history);
      }
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  };

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (timerRunning && activeTimer !== null && activeTimer > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (activeTimer === 0 && timerRunning) {
      setTimerRunning(false);
      playTimerSound();
    }
    return () => clearInterval(interval);
  }, [timerRunning, activeTimer]);

  const playTimerSound = () => {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio blocked", e));
    } catch (e) {
      console.error(e);
    }
  };

  const startRestTimer = (seconds: number) => {
    setActiveTimer(seconds);
    setTimerRunning(true);
  };

  const currentDay = plan?.split[activeDayIndex];

  const handleStartWorkout = async () => {
    if (!currentDay || !user.id) {
        alert("Erro ao iniciar. Aguarde o carregamento ou verifique conexão.");
        return;
    }
    // Fallback de segurança visual para lista vazia
    if (!currentDay.exercises || currentDay.exercises.length === 0) {
        alert("Este dia não possui exercícios gerados. Tente recarregar a ficha.");
        return;
    }

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          day_name: currentDay.dayName
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setActiveSessionId(data.id);
        setIsWorkoutActive(true);
        
        const initialWeights: Record<string, string> = {};
        currentDay.exercises.forEach(ex => {
           const historyWeight = weightHistory[ex.name];
           const suggested = ex.suggestedWeight ? ex.suggestedWeight.toString() : '0';
           const weightToUse = historyWeight ? historyWeight.toString() : suggested;

           if (weightToUse !== '0') {
             for(let i=0; i < ex.sets; i++) {
                initialWeights[`${ex.name}-${i}`] = weightToUse;
             }
           }
        });
        setLoggedWeights(prev => ({...prev, ...initialWeights}));
      }
    } catch (err: any) {
      alert("Erro ao iniciar sessão: " + err.message);
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeSessionId) {
        setIsWorkoutActive(false);
        return;
    }

    try {
      await supabase
        .from('workout_sessions')
        .update({ finished_at: new Date().toISOString() })
        .eq('id', activeSessionId);
        
      setIsWorkoutActive(false);
      setCompletedSets(new Set());
      setLoggedWeights({});
      fetchExerciseHistory();
      setActiveSessionId(null);
    } catch (err) {
      console.error("Erro ao finalizar:", err);
      // Força saída mesmo com erro de rede para não travar usuário
      setIsWorkoutActive(false);
    }
  };

  // Botão de pânico para forçar saída
  const forceExitWorkout = () => {
      if(window.confirm("Deseja cancelar o treino atual? O progresso não salvo será perdido.")) {
          setIsWorkoutActive(false);
          setActiveSessionId(null);
      }
  };

  const toggleSetComplete = async (exerciseName: string, muscleGroup: string, setIndex: number, reps: string) => {
    const id = `${exerciseName}-${setIndex}`;
    const weight = loggedWeights[id] ? parseFloat(loggedWeights[id]) : null;
    
    if (!activeSessionId) return;
    
    const newCompleted = new Set(completedSets);
    const isCompleting = !newCompleted.has(id);
    
    if (isCompleting) {
      newCompleted.add(id);
    } else {
      newCompleted.delete(id);
    }
    setCompletedSets(newCompleted);

    try {
      if (isCompleting) {
        await supabase
          .from('workout_logs')
          .upsert({
             session_id: activeSessionId,
             exercise_name: exerciseName,
             muscle_group: muscleGroup,
             set_number: setIndex + 1,
             weight: weight || 0,
             reps_performed: reps
          }, { onConflict: 'session_id, exercise_name, set_number' });
      }
    } catch (err) {
      console.error("Erro ao salvar log:", err);
    }
  };

  const handleWeightChange = (exerciseName: string, setIndex: number, value: string) => {
    const id = `${exerciseName}-${setIndex}`;
    setLoggedWeights(prev => ({ ...prev, [id]: value }));
  };

  const handleSwapExercise = async (exercise: Exercise, dayIndex: number, exIndex: number) => {
    setSwappingExerciseId(exercise.id || String(exIndex));
    const newExercise = await swapExercise(exercise, user.goal);
    
    if (newExercise && plan) {
      const newPlan = { ...plan };
      newPlan.split[dayIndex].exercises[exIndex] = newExercise;
      setPlan(newPlan);
    } else {
      alert("Sem opções alternativas para este grupo muscular no momento.");
    }
    setSwappingExerciseId(null);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80';
  };

  // --- EXERCISE MODAL ---
  const ExerciseInfoModal = () => {
    if (!selectedExercise) return null;
    
    return (
       <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedExercise(null)}>
          <div className="bg-[#1a0505] border border-red-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <button onClick={() => setSelectedExercise(null)} className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-20">
                <X size={20} />
             </button>
             
             <div className="h-64 bg-black relative flex items-center justify-center overflow-hidden group bg-gradient-to-b from-gray-900 to-black">
                {selectedExercise.gifUrl ? (
                   <img 
                     src={selectedExercise.gifUrl} 
                     alt={selectedExercise.name} 
                     className="w-full h-full object-cover opacity-90" 
                     referrerPolicy="no-referrer"
                     onError={handleImageError}
                   />
                ) : (
                   <div className="text-center p-6">
                      <Dumbbell size={48} className="text-red-500 mx-auto mb-2 opacity-50" />
                      <span className="text-gray-500 text-sm">Visualização Indisponível</span>
                   </div>
                )}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#1a0505] to-transparent h-24"></div>
                
                <div className="absolute bottom-4 left-6 z-10 pr-4">
                   <h3 className="text-2xl font-black text-white leading-none mb-1 shadow-black drop-shadow-md">{selectedExercise.name}</h3>
                   <span className="text-red-400 text-xs font-bold uppercase tracking-wider bg-black/50 px-2 py-1 rounded">{selectedExercise.muscleGroup}</span>
                </div>
             </div>
             
             <div className="p-6 relative z-10 max-h-[50vh] overflow-y-auto scrollbar-thin">
                <div className="space-y-6">
                   <div>
                      <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                         <CheckCircle size={16} className="text-green-500" /> Execução
                      </h4>
                      <ul className="space-y-3">
                         {selectedExercise.instructions.split('\n').map((step, i) => (
                            <li key={i} className="text-gray-300 text-sm leading-relaxed flex gap-3">
                               <span className="text-red-500 font-bold shrink-0">{i+1}.</span>
                               <span>{step.replace(/^\d+\.\s*/, '')}</span>
                            </li>
                         ))}
                      </ul>
                   </div>
                   
                   <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/20">
                      <h4 className="text-red-400 font-bold text-xs uppercase mb-1 flex items-center gap-1"><Info size={12}/> Dica do Coach</h4>
                      <p className="text-red-100 text-sm italic">"{selectedExercise.tips}"</p>
                   </div>
                </div>
                
                <button onClick={() => setSelectedExercise(null)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl mt-6 transition-colors">
                   Fechar
                </button>
             </div>
          </div>
       </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-white animate-pulse">
        <div className="relative">
           <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 rounded-full"></div>
           <Activity className="w-20 h-20 mb-6 text-red-500 relative z-10" />
        </div>
        <h2 className="text-2xl font-black tracking-tighter">CRIANDO PROTOCOLO</h2>
        <p className="text-pink-200 mt-2 text-sm uppercase tracking-widest">IA analisando biomecânica...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center text-white p-10 flex flex-col items-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="mb-4">Ocorreu um erro ao gerar sua periodização.</p>
        <button onClick={fetchWorkout} className="bg-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition">Tentar Novamente</button>
      </div>
    );
  }

  // --- MODO DE TREINO ATIVO (ACTIVE WORKOUT VIEW) ---
  if (isWorkoutActive && currentDay) {
    const totalSets = currentDay.exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const progress = totalSets > 0 ? (completedSets.size / totalSets) * 100 : 0;

    return (
      <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col h-[100dvh] w-screen overflow-hidden">
        <ExerciseInfoModal />
        
        {/* 1. Header Fixo e Compacto */}
        <div className="flex-none bg-[#111] border-b border-white/5 p-4 pb-2 z-20 shadow-xl">
          <div className="flex justify-between items-center mb-3">
             <button onClick={() => setIsWorkoutActive(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <ArrowLeft size={24} />
             </button>
             <div className="text-center">
                 <h3 className="text-white font-black text-lg uppercase tracking-wider">{currentDay.dayName.split('-')[0]}</h3>
                 <p className="text-red-500 text-xs font-bold">{Math.round(progress)}% Concluído</p>
             </div>
             <button onClick={forceExitWorkout} className="text-red-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-900/20">
                <X size={24} />
             </button>
          </div>
          
          {/* Barra de Progresso */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          
          {/* Timer Flutuante (quando ativo) */}
          {activeTimer !== null && activeTimer >= 0 && (
             <div className={`absolute left-1/2 -translate-x-1/2 top-20 px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 font-mono text-xl font-bold z-50 border transition-all animate-fade-in ${
                activeTimer === 0 
                  ? 'bg-green-600 text-white border-green-400 scale-110 shadow-green-500/50' 
                  : 'bg-red-600 text-white border-white/20 shadow-red-900/50'
             }`}>
                <Timer size={20} className={activeTimer > 0 && activeTimer <= 10 ? "animate-pulse" : ""} />
                {activeTimer === 0 ? "PRONTO!" : `${Math.floor(activeTimer / 60)}:${(activeTimer % 60).toString().padStart(2, '0')}`}
                {activeTimer === 0 && (
                   <button onClick={() => setActiveTimer(null)} className="ml-2 bg-white/20 rounded-full p-1 hover:bg-white/40"><X size={14}/></button>
                )}
             </div>
          )}
        </div>

        {/* 2. Área de Conteúdo Rolável (Flex-1) */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scrollbar-hide bg-[#0a0a0a]"
        >
          {(!currentDay.exercises || currentDay.exercises.length === 0) ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="bg-yellow-500/10 p-4 rounded-full">
                   <AlertTriangle className="w-12 h-12 text-yellow-500" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white">Ops, lista vazia!</h3>
                   <p className="text-gray-400 max-w-xs mx-auto">Os exercícios não carregaram corretamente para este dia.</p>
                </div>
                <button onClick={forceExitWorkout} className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20">
                   Voltar ao Menu
                </button>
             </div>
          ) : (
             <>
              {currentDay.exercises.map((exercise, exIndex) => (
                <div key={exIndex} className="bg-[#161616] rounded-2xl border border-white/5 overflow-hidden">
                   {/* Cabeçalho do Card */}
                   <div className="p-4 border-b border-white/5 flex justify-between items-start bg-[#1a1a1a]">
                     <div className="flex-1 pr-4">
                       <h4 className="text-lg font-black text-white leading-tight mb-1">{exercise.name}</h4>
                       <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-500 bg-black/40 px-2 py-0.5 rounded uppercase">{exercise.muscleGroup}</span>
                          {weightHistory[exercise.name] && (
                             <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                                <Trophy size={10} /> PR: {weightHistory[exercise.name]}kg
                             </span>
                          )}
                       </div>
                     </div>
                     <div className="flex gap-1">
                        <button 
                          onClick={() => handleSwapExercise(exercise, activeDayIndex, exIndex)}
                          disabled={swappingExerciseId === (exercise.id || String(exIndex))}
                          className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white"
                        >
                          <RefreshCcw size={18} className={swappingExerciseId === (exercise.id || String(exIndex)) ? "animate-spin" : ""}/>
                        </button>
                        <button onClick={() => setSelectedExercise(exercise)} className="p-2 bg-white/5 rounded-lg text-red-500 hover:bg-red-500/10">
                           <Info size={18} />
                        </button>
                     </div>
                   </div>

                   {/* Lista de Sets */}
                   <div className="p-2 space-y-1">
                      {/* Labels */}
                      <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-3 px-2 py-1 text-[10px] uppercase font-bold text-gray-500 text-center">
                         <div>#</div>
                         <div>Carga (kg)</div>
                         <div>Reps</div>
                         <div>Feito</div>
                      </div>

                      {Array.from({ length: exercise.sets || 3 }).map((_, setIndex) => {
                        const setId = `${exercise.name}-${setIndex}`;
                        const isDone = completedSets.has(setId);
                        const currentVal = loggedWeights[setId];
                        const historyVal = weightHistory[exercise.name];
                        const isPR = historyVal && Number(currentVal) > historyVal;

                        return (
                          <div 
                             key={setIndex} 
                             className={`grid grid-cols-[30px_1fr_1fr_40px] gap-3 items-center p-2 rounded-xl border transition-all duration-300 ${
                                isDone 
                                  ? 'bg-green-900/10 border-green-500/30' 
                                  : 'bg-black/20 border-white/5 hover:border-white/10'
                             }`}
                          >
                             {/* Número do Set */}
                             <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                isDone ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'
                             }`}>
                                {setIndex + 1}
                             </div>
                             
                             {/* Input de Carga */}
                             <div className="relative h-10">
                                <input 
                                  type="number"
                                  inputMode="decimal"
                                  placeholder={historyVal ? String(historyVal) : (exercise.suggestedWeight ? String(exercise.suggestedWeight) : "-")}
                                  value={loggedWeights[setId] || ''}
                                  onChange={(e) => handleWeightChange(exercise.name, setIndex, e.target.value)}
                                  className={`w-full h-full bg-[#0f0f0f] text-center rounded-lg border focus:outline-none font-bold text-lg transition-colors ${
                                     isPR ? 'text-yellow-400 border-yellow-500/50' : 'text-white border-white/10 focus:border-red-500'
                                  }`}
                                />
                             </div>
                             
                             {/* Repetições Alvo */}
                             <div className="flex items-center justify-center h-10 bg-[#0f0f0f] rounded-lg border border-white/5">
                                <span className="text-gray-300 font-bold text-sm">{exercise.reps}</span>
                             </div>
                             
                             {/* Checkbox */}
                             <button 
                               onClick={() => toggleSetComplete(exercise.name, exercise.muscleGroup, setIndex, exercise.reps)}
                               className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
                                  isDone 
                                    ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                                    : 'bg-white/5 text-gray-600 hover:bg-white/10'
                               }`}
                             >
                                <CheckCircle size={20} strokeWidth={3} />
                             </button>
                          </div>
                        );
                      })}
                   </div>

                   {/* Ações do Card */}
                   <div className="p-3 bg-black/20 flex gap-2">
                     <button 
                        onClick={() => startRestTimer(exercise.restSeconds)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-red-400 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors active:bg-red-900/20"
                     >
                        <Clock size={16} /> Descanso {exercise.restSeconds}s
                     </button>
                   </div>
                </div>
              ))}

              {/* Espaço extra no final para garantir scroll completo */}
              <div className="h-32"></div>
             </>
          )}
        </div>

        {/* 3. Footer Fixo com Ação Principal */}
        <div className="flex-none p-4 bg-gradient-to-t from-black via-black to-transparent z-20 pb-8 md:pb-4">
           <button 
              onClick={handleFinishWorkout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-lg py-5 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-transform active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3 border border-red-500"
           >
              <Save size={24} /> Finalizar Treino
           </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW (Menu Principal) ---
  return (
    <div className="space-y-6 pb-20">
      <ExerciseInfoModal />
      
      {/* Banner Principal */}
      <div className="relative bg-[#111] p-6 rounded-3xl border border-white/10 overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-black pointer-events-none"></div>
         <div className="relative z-10">
             <div className="flex justify-between items-start mb-2">
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Protocolo Ativo</span>
                {user.location && <span className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={12}/> {user.location}</span>}
             </div>
             <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase leading-none mb-2">{plan.title}</h2>
             <p className="text-gray-400 text-sm max-w-lg leading-relaxed">{plan.overview}</p>
         </div>
      </div>

      {/* Seletor de Dias */}
      <div>
        <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1">Sua Rotina Semanal</h3>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
            {plan.split.map((day, idx) => (
            <button
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`snap-start flex-shrink-0 w-32 p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                activeDayIndex === idx 
                    ? 'bg-white text-black border-white shadow-lg scale-100' 
                    : 'bg-[#111] text-gray-500 border-white/5 hover:border-white/20'
                }`}
            >
                <span className="text-xs font-bold uppercase">{day.dayName.split('-')[0]}</span>
                <span className={`text-sm font-bold leading-tight ${activeDayIndex === idx ? 'text-red-600' : 'text-gray-300'}`}>
                    {day.focus}
                </span>
            </button>
            ))}
        </div>
      </div>

      {/* Detalhes do Dia Selecionado */}
      <div className="animate-fade-in">
         <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
            <div>
               <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                   {currentDay?.dayName}
               </h3>
               <p className="text-gray-400 text-sm flex items-center gap-4 mt-1">
                   <span className="flex items-center gap-1"><Clock size={14} className="text-red-500"/> {currentDay?.duration}</span>
                   <span className="flex items-center gap-1"><Dumbbell size={14} className="text-red-500"/> {currentDay?.exercises.length} Exercícios</span>
               </p>
            </div>
            <button 
              onClick={handleStartWorkout}
              className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-transform active:scale-95"
            >
               <Play size={20} fill="currentColor" /> INICIAR SESSÃO
            </button>
         </div>

         {/* Lista de Preview */}
         <div className="space-y-3">
            {currentDay?.exercises && currentDay.exercises.length > 0 ? currentDay.exercises.map((exercise, idx) => (
               <div key={idx} className="bg-[#111] hover:bg-[#161616] p-4 rounded-xl border border-white/5 transition-all flex items-center gap-4 group cursor-pointer" onClick={() => setSelectedExercise(exercise)}>
                  <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {exercise.gifUrl ? <img src={exercise.gifUrl} className="w-full h-full object-cover opacity-80" onError={handleImageError} alt=""/> : <Dumbbell size={20} className="text-gray-600"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-white font-bold text-sm truncate">{exercise.name}</h4>
                     <p className="text-gray-500 text-xs mt-0.5">{exercise.sets} Séries x {exercise.reps} Reps</p>
                  </div>
                  <ChevronDown className="text-gray-600 group-hover:text-white -rotate-90" size={16} />
               </div>
            )) : (
              <div className="text-gray-500 text-center py-12 border border-dashed border-gray-800 rounded-xl bg-black/20">
                  <p>Descanso ou sem exercícios previstos.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default WorkoutDashboard;
